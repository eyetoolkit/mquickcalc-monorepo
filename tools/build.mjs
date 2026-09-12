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
  // 1. 直接覆盖
  for (const sub of ['css', 'js', 'fonts']) {
    const src = path.join(BRAND_KIT, sub);
    if (exists(src)) copyDir(src, path.join(siteDir, sub));
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
  const r = reportSite(site);
  console.log(`   ✅ ${site.pkg.padEnd(15)} ${r.files} 文件, ${(r.bytes/1024).toFixed(1)} KB  → deploy: wrangler pages deploy packages/${site.pkg} --project-name=${site.cfProject}`);
}

console.log(`\n🎉 done.`);
