/**
 * tools/scan-broken-links.mjs
 *
 * 基于 build 输出的智能断链扫描器
 * 策略：
 *   1. 先 build → 生成 public/ 输出目录
 *   2. 扫描 public/ 里的实际文件
 *   3. 从 HTML 提取相对路径，resolve 到 public/ 目录
 *   4. 文件存在即为 OK，不存在才是真实断链
 *   5. cross-subdomain 链接 (/tools/xxx 指向 health 子站) → 标记为需跨域验证
 *
 * 用法：
 *   node tools/scan-broken-links.mjs        # build + 扫描
 *   node tools/scan-broken-links.mjs --nodry # 扫描（不重新 build）
 */
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITES = ['site-main', 'site-finance', 'site-health', 'site-insurance'];

const DRY = !process.argv.includes('--nodry');
const SKIP_BUILD = process.argv.includes('--nodry');

// ── Build（如果需要）─────────────────────────────────────
if (!SKIP_BUILD) {
  console.log('🔨 Building...');
  try {
    execSync('node tools/build.mjs', { cwd: ROOT, stdio: 'pipe' });
    console.log('✅ Build done\n');
  } catch (e) {
    console.error('❌ Build failed:', e.message);
    process.exit(1);
  }
}

// ── 构建已部署文件名索引 ─────────────────────────────────
function buildIndex(site) {
  const pkgDir = path.join(ROOT, 'packages', site);
  // build 输出直接在 site-* 根目录，tools/ 是构建后的子目录
  const deployedDir = pkgDir;

  const index = new Set();

  // 收集所有 HTML 文件（根目录 + tools/ 子目录）
  const collect = dir => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // 跳过 brand-kit 等非部署目录
        if (!['css', 'js', 'fonts', 'data', 'images', 'assets'].includes(entry.name)) {
          collect(fp);
        }
      } else if (entry.name.endsWith('.html') || entry.name.endsWith('.htm')) {
        index.add(path.relative(deployedDir, fp));
      }
    }
  };

  collect(deployedDir);
  index.delete('index.html');
  index.delete('index.htm');

  return { index, deployedDir };
}

// ── 提取内部链接（从 HTML）──────────────────────────────
function extractLinks(html) {
  const links = new Set();
  const re = /href="((?!\s*(https?|mailto|tel|#|javascript)).*?)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let l = m[1].trim();
    if (!l || l.startsWith('#') || l.startsWith('//')) continue;
    l = l.replace(/\/$/, '').replace(/\.html$/, '').replace(/\.htm$/, '');
    if (l) links.add(l);
  }
  return [...links];
}

// ── 解析链接 → public 路径 ─────────────────────────────
function resolveToPublic(link, sourceFile, deployedDir) {
  // link 有三种形态：
  // 1. 绝对路径 /tools/bmi-calculator → deployedDir/tools/bmi-calculator
  // 2. 相对路径 ./age-calculator → dirname(source)/age-calculator
  // 3. 相对路径 ../other-tool       → dirname(dirname(source))/other-tool
  // 4. 跨子域 /tools/bmi-calculator → health 子站工具（特殊处理）

  let target;
  if (link.startsWith('/')) {
    target = path.join(deployedDir, link);
  } else if (link.startsWith('./') || link.startsWith('../') || !link.includes('/')) {
    const srcDir = path.dirname(sourceFile);
    target = path.resolve(srcDir, link);
  } else {
    // 相对路径带目录 ./tools/xxx
    target = path.resolve(deployedDir, link);
  }

  // 标准化
  target = path.normalize(target);
  const candidates = [target, target + '.html', target + '.htm', target.replace(/\\/g, '/') + '.html'];
  for (const c of candidates) {
    if (fs.existsSync(c)) return { ok: true, path: c, isIndex: false };
  }
  // 可能是目录 /tools/bmi-calculator → /tools/bmi-calculator/index.html
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    for (const idx of ['index.html', 'index.htm']) {
      const idxPath = path.join(target, idx);
      if (fs.existsSync(idxPath)) return { ok: true, path: idxPath, isIndex: true };
    }
  }
  return { ok: false, path: target };
}

// ── 跨子域链接（工具页之间的交叉引用）───────────────────
const CROSS_SUBDOMAIN_PATTERNS = [
  { from: 'site-insurance', pattern: /^\/tools\//, target: 'site-health' },
];

function isCrossSubdomain(link) {
  if (!link.startsWith('/tools/')) return false;
  // insurance 站引用 health 工具（如 /tools/bmi-calculator）
  // 这些在 public/ 里找不到因为它们属于另一个子域
  return true;
}

// ── 主扫描 ─────────────────────────────────────────────
let totalFiles = 0, totalLinks = 0;
const broken = [];      // 真实断链（可自动修复）
const crossDomain = []; // 跨子域（需人工判断）
const okLinks = [];

for (const site of SITES) {
  const { index, deployedDir } = buildIndex(site);
  console.log(`\n🔍 ${site} — ${index.size} files indexed`);

  const collect = dir => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.endsWith('.html') || entry.name.endsWith('.htm')) {
        const fp = path.join(dir, entry.name);
        totalFiles++;
        const html = fs.readFileSync(fp, 'utf8');
        const links = extractLinks(html);

        for (const link of links) {
          totalLinks++;

          if (isCrossSubdomain(link)) {
            crossDomain.push({ site, file: path.relative(deployedDir, fp), link });
            continue;
          }

          const result = resolveToPublic(link, fp, deployedDir);
          if (!result.ok) {
            broken.push({ site, file: path.relative(deployedDir, fp), link, target: result.path });
          } else {
            okLinks.push({ site, file: path.relative(deployedDir, fp), link });
          }
        }
      }
      if (entry.isDirectory()) collect(path.join(dir, entry.name));
    }
  };

  collect(deployedDir);
}

// ── 报告 ───────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log('📊 断链扫描报告（基于 build 输出）');
console.log('═'.repeat(60));
console.log(`文件: ${totalFiles} | 内链: ${totalLinks} | 正常: ${okLinks.length} | 断链: ${broken.length} | 跨子域: ${crossDomain.length}`);

if (broken.length === 0 && crossDomain.length === 0) {
  console.log('\n  ✅ 太棒了！没有任何断链！');
} else {
  if (broken.length > 0) {
    console.log(`\n  ❌ 真实断链 (${broken.length}):`);
    const bySite = {};
    for (const b of broken) {
      if (!bySite[b.site]) bySite[b.site] = [];
      bySite[b.site].push(b);
    }
    for (const [site, items] of Object.entries(bySite)) {
      console.log(`\n  [${site}] ${items.length} 个断链:`);
      for (const b of items) {
        console.log(`    ❌ ${b.file}`);
        console.log(`       → "${b.link}" 指向 "${b.target}" (不存在)`);
      }
    }
  }

  if (crossDomain.length > 0) {
    // 统计 unique 链接
    const uniqueLinks = [...new Set(crossDomain.map(c => c.link))];
    console.log(`\n  ↪ 跨子域引用 (${crossDomain.length} 次，来自 ${uniqueLinks.length} 个不同链接):`);
    for (const l of uniqueLinks.slice(0, 10)) {
      const froms = crossDomain.filter(c => c.link === l).map(c => c.file);
      console.log(`    ↪ ${l}`);
      console.log(`       来自: ${froms.slice(0, 3).join(', ')}${froms.length > 3 ? '...' : ''}`);
    }
    if (uniqueLinks.length > 10) console.log(`    ... 还有 ${uniqueLinks.length - 10} 个`);
    console.log('\n  💡 这些链接指向其他子站工具（/tools/bmi-calculator → health 子站）');
    console.log('     在生产环境中是有效的，但源 HTML 里用的是相对路径。');
    console.log('     建议：改为绝对 URL https://health.mquickcalc.com/tools/bmi-calculator');
  }
}

// ── 修复建议 ───────────────────────────────────────────
if (broken.length > 0) {
  console.log('\n  🔧 修复建议:');
  for (const b of broken) {
    console.log(`    ${b.file}: 把 href="${b.link}" 改为正确的路径或创建对应页面`);
  }
}
