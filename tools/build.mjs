#!/usr/bin/env node
/**
 * mQuickCalc monorepo build script
 *
 * 把 packages/brand-kit 的共享文件复制到每个 site 包，生成最终可直接 deploy 的目录。
 *
 * 用法：
 *   node tools/build.mjs                   # 全量构建所有 site
 *   node tools/build.mjs site-main         # 只构建 site-main
 *
 * 输出：
 *   packages/<site>/ 是最终产物
 *   - 可以直接 `wrangler pages deploy packages/site-main --project-name=mquickcalc`
 *
 * 为什么需要这个脚本而不是直接 cp？
 *   因为有些文件需要"site-specific + brand-kit base"的组合：
 *   - _headers：brand-kit 里有一份基础，但每个 site 可能要追加（如 cache-control）
 *   - manifest.webmanifest：每个 site 有自己的主题色
 *   - fonts/：brand-kit 自带
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BRAND_KIT = path.join(ROOT, 'packages', 'brand-kit');

const SITES = [
  { pkg: 'site-main',    cfProject: 'mquickcalc' },
  { pkg: 'site-finance', cfProject: 'mquickcalc-finance' },
  { pkg: 'site-health',  cfProject: 'mquickcalc-health' },
];

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

/**
 * 同步 brand-kit → site 包。
 * 规则：
 *   - brand-kit/css/, js/, fonts/, sw.js → 直接覆盖 site 包
 *   - brand-kit/_headers → 追加（site 包里如果有同名 _headers，保留 site 自己的；否则用 brand-kit 的）
 */
function syncBrandKit(siteDir) {
  // 1. 直接覆盖（css/, js/, fonts/）
  for (const sub of ['css', 'js', 'fonts']) {
    const src = path.join(BRAND_KIT, sub);
    if (exists(src)) copyDir(src, path.join(siteDir, sub));
  }
  // 1a. 删除 legacy site.js (single 22KB file replaced by site-core/icons/enhance/meters)
  const legacySiteJs = path.join(siteDir, 'js', 'site.js');
  if (exists(legacySiteJs)) {
    fs.unlinkSync(legacySiteJs);
  }
  // 2. sw.js
  const swSrc = path.join(BRAND_KIT, 'sw.js');
  if (exists(swSrc)) copyFile(swSrc, path.join(siteDir, 'sw.js'));
  // 3. _headers：site 包里没有就用 brand-kit 的
  const siteHeaders = path.join(siteDir, '_headers');
  if (!exists(siteHeaders)) {
    const kitHeaders = path.join(BRAND_KIT, '_headers');
    if (exists(kitHeaders)) copyFile(kitHeaders, siteHeaders);
  }
}

function reportSite(site) {
  const dir = path.join(ROOT, 'packages', site.pkg);
  if (!exists(dir)) return null;
  const files = walk(dir);
  const total = files.reduce((s, f) => s + fs.statSync(f).size, 0);
  return { pkg: site.pkg, files: files.length, bytes: total };
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

/**
 * Replace legacy <script src="/js/site.js"> with the 4-file split.
 *
 * Pattern A (homepage + non-tool pages, no #calcBtn):
 *   <script src="/js/site.js"></script>
 *     →
 *   <script src="/js/site-core.js" defer></script>
 *   <script src="/js/site-icons.js" defer></script>
 *   <script src="/js/site-enhance.js" defer></script>
 *
 * Pattern B (tool pages, has #calcBtn / result area):
 *   <script src="/js/site.js"></script>
 *     →
 *   <script src="/js/site-core.js" defer></script>
 *   <script src="/js/site-enhance.js" defer></script>
 *   <script src="/js/site-meters.js" defer></script>
 *
 * (Site-icons is omitted from tool pages because tool cards don't have emoji grids.)
 *
 * Idempotent: running twice is safe (the second pass finds no /js/site.js to replace).
 */
function replaceLegacySiteJs(siteDir) {
  const htmlFiles = walk(siteDir).filter(p => p.endsWith('.html'));
  let touched = 0;
  for (const f of htmlFiles) {
    let html = fs.readFileSync(f, 'utf8');
    // match <script src="/js/site.js"> optionally with defer
    const m = html.match(/<script\s+src=["']\/js\/site\.js["'](\s+defer)?\s*><\/script>/);
    if (!m) continue;
    // Detect tool page by presence of #calcBtn (heuristic)
    const isToolPage = /id=["']calcBtn["']/.test(html) || /window\.__renderMeters/.test(html);
    const replacement = isToolPage
      ? '<script src="/js/site-core.js" defer></script>\n  <script src="/js/site-enhance.js" defer></script>\n  <script src="/js/site-meters.js" defer></script>'
      : '<script src="/js/site-core.js" defer></script>\n  <script src="/js/site-icons.js" defer></script>\n  <script src="/js/site-enhance.js" defer></script>';
    html = html.replace(m[0], replacement);
    fs.writeFileSync(f, html);
    touched++;
  }
  return touched;
}

// === Main ===
const targetArg = process.argv[2];
const sites = targetArg
  ? SITES.filter(s => s.pkg === targetArg)
  : SITES;

if (targetArg && sites.length === 0) {
  console.error(`❌ 未知 site: ${targetArg}`);
  console.error(`   可选: ${SITES.map(s => s.pkg).join(', ')}`);
  process.exit(1);
}

console.log(`🔧 build ${sites.length} site(s)...\n`);

for (const site of sites) {
  const siteDir = path.join(ROOT, 'packages', site.pkg);
  if (!exists(siteDir)) {
    console.error(`❌ ${site.pkg}: 目录不存在 ${siteDir}`);
    continue;
  }
  syncBrandKit(siteDir);
  const replaced = replaceLegacySiteJs(siteDir);
  const r = reportSite(site);
  console.log(`   ✅ ${site.pkg.padEnd(15)} ${r.files} 文件, ${(r.bytes/1024).toFixed(1)} KB  ${replaced ? `(replaced ${replaced} site.js refs)` : ''}  → deploy: wrangler pages deploy packages/${site.pkg} --project-name=${site.cfProject}`);
}

// After build: regenerate sitemap.xml with real lastmod from git history
console.log(`\n🗺  regenerating sitemaps...`);
try {
  execFileSync('node', [path.join(ROOT, 'tools', 'gen-sitemap.mjs')], { stdio: 'inherit' });
} catch (e) {
  console.error('   ⚠️ sitemap generation failed (non-fatal):', e.message);
}

// After sitemap: regenerate _redirects from JSON data (site-main only)
// finance/health don't use SEO shortlinks (their URLs are /tools/<name>-calculator)
console.log(`\n🔀 regenerating _redirects from data...`);
try {
  execFileSync('node', [path.join(ROOT, 'tools', 'gen-redirects.mjs')], { stdio: 'inherit' });
} catch (e) {
  console.error('   ⚠️ redirects generation failed (non-fatal):', e.message);
}

console.log(`\n🎉 done.`);
