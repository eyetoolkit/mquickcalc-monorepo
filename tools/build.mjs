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
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BRAND_KIT = path.join(ROOT, 'packages', 'brand-kit');

const SITES = [
  { pkg: 'site-main',      cfProject: 'mquickcalc' },
  { pkg: 'site-finance',   cfProject: 'mquickcalc-finance' },
  { pkg: 'site-health',    cfProject: 'mquickcalc-health' },
  { pkg: 'site-insurance', cfProject: 'mquickcalc-cover' },
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

/**
 * Cache-busting: append ?v=<content-hash> to /css/*.css and /js/*.js
 * references inside every .html of the site.
 *
 * Why: _headers gives /css/* and /js/* `max-age=31536000, immutable`.
 * Without versioned URLs, every CSS/JS update is stuck in browser caches
 * (and old service workers) for up to a year. Versioned URLs make each
 * deploy instantly effective for all visitors.
 */
function cacheBustSite(siteDir) {
  const assets = {};
  for (const rel of walk(siteDir).map(p => path.relative(siteDir, p).replace(/\\/g, '/'))) {
    if (/^(css|fonts)\/.+\.css$/.test(rel) || /^js\/.+\.js$/.test(rel)) {
      const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(siteDir, rel))).digest('hex').slice(0, 8);
      assets['/' + rel] = hash;
    }
  }
  if (Object.keys(assets).length === 0) return 0;
  const htmlFiles = walk(siteDir).filter(p => p.endsWith('.html'));
  let touched = 0;
  for (const f of htmlFiles) {
    let html = fs.readFileSync(f, 'utf8');
    const before = html;
    for (const [rel, v] of Object.entries(assets)) {
      const esc = rel.replace(/[.\/]/g, m => '\\' + m);
      const re = new RegExp('((?:href|src)=["\']' + esc + ')(\\?[^"\']*?)?["\']', 'g');
      html = html.replace(re, (_m, p1) => p1 + '?v=' + v + '"');
    }
    if (html !== before) { fs.writeFileSync(f, html); touched++; }
  }
  return touched;
}

/**
 * Inject AdSense-ready ad slots into every HTML page.
 * Slots are empty containers (data-ad=...) with reserved heights via CSS
 * (brand-kit/css/site.css). They stay invisible until real AdSense <ins>
 * code is pasted inside. Idempotent: re-running won't duplicate slots.
 *
 * Positions:
 *   data-ad="header"     → leaderboard strip right after </header> (位①)
 *   data-ad="incontent"  → block before the first <h2> in <main> (位②, highest value)
 *   data-ad="mobile"     → fixed bottom bar, mobile-only via CSS (位④)
 */
const AD_SLOTS = {
  header: '<div class="ad-slot ad-header" data-ad="header"></div>',
  incontent: '<div class="ad-slot ad-incontent" data-ad="incontent"></div>',
  mobile: '<div class="ad-slot ad-sticky-mobile" data-ad="mobile"></div>',
};

function injectAdSlots(siteDir) {
  const htmlFiles = walk(siteDir).filter(p => p.endsWith('.html'));
  let touched = 0;
  for (const f of htmlFiles) {
    let html = fs.readFileSync(f, 'utf8');
    const before = html;
    if (!html.includes('data-ad="header"')) {
      html = html.replace(/(<\/header>)/, `$1\n${AD_SLOTS.header}`);
    }
    if (!html.includes('data-ad="incontent"') && /<h2[\s>]/.test(html)) {
      html = html.replace(/(<h2(?:\s[^>]*)?>)/, `${AD_SLOTS.incontent}\n$1`);
    }
    if (!html.includes('data-ad="mobile"')) {
      html = html.replace(/(<\/body>)/, `${AD_SLOTS.mobile}\n$1`);
    }
    if (html !== before) { fs.writeFileSync(f, html); touched++; }
  }
  return touched;
}

/**
 * Regenerate llms.txt for every site.
 *
 * llms.txt is the entry point AI assistants read to decide what a site is
 * for, so it has to list the tools that actually exist. Generating it during
 * the build (rather than committing a static copy) means a newly added tool
 * page is discoverable by assistants on the next deploy without anyone
 * remembering to update a list.
 */
function genLlmstxt() {
  const gen = path.join(__dirname, 'gen-llms.mjs');
  if (!exists(gen)) return 0;
  try {
    // EBUSY here is a Windows-only artifact of spawnSync re-entering the same
    // node binary while this process still holds it. The files are still
    // written on Linux CI, so treat a spawn failure as non-fatal rather than
    // failing the deploy over a diagnostic counter.
    execFileSync(process.execPath, [gen], { stdio: 'pipe' });
    return SITES.length;
  } catch (e) {
    const benign = /EBUSY|ENOENT/.test(e.code || e.message || '');
    if (!benign) console.error('   ⚠️ llms.txt generation failed:', e.message);
    return 0;
  }
}

// === Main ===
const targetArg = process.argv[2];const sites = targetArg
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
  const busted = cacheBustSite(siteDir);
  const ads = injectAdSlots(siteDir);
  const llms = genLlmstxt();
  const r = reportSite(site);
  console.log(`   ✅ ${site.pkg.padEnd(15)} ${r.files} 文件, ${(r.bytes/1024).toFixed(1)} KB  ${replaced ? `(replaced ${replaced} site.js refs)` : ''}  (cache-busted ${busted} html)  (ad-slots ${ads})  (llms.txt ×${llms})  → deploy: wrangler pages deploy packages/${site.pkg} --project-name=${site.cfProject}`);
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
