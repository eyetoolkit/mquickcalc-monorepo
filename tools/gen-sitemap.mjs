#!/usr/bin/env node
/**
 * mQuickCalc sitemap generator + sitemap-index builder
 *
 * Auto-generates sitemap.xml for each site from actual file structure,
 * plus a sitemap-index.xml pointing to it.
 *
 * Files included:
 *   - Homepage and top-level HTML pages
 *   - tools pages
 *   - compare pages
 *   - embed pages: intentionally excluded (noindex, canonicalized to tool pages)
 *
 * lastmod is taken from git log for each file (real last-modified date).
 *
 * Usage:
 *   node tools/gen-sitemap.mjs                  # all four sites
 *   node tools/gen-sitemap.mjs site-main       # one site
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITES = [
  { pkg: 'site-main',      origin: 'https://mquickcalc.com' },
  { pkg: 'site-finance',   origin: 'https://finance.mquickcalc.com' },
  { pkg: 'site-health',    origin: 'https://health.mquickcalc.com' },
  { pkg: 'site-insurance', origin: 'https://cover.mquickcalc.com' },
];

const TARGET_ARG = process.argv[2];
const sites = TARGET_ARG ? SITES.filter(s => s.pkg === TARGET_ARG) : SITES;
if (TARGET_ARG && sites.length === 0) {
  console.error(`❌ Unknown site: ${TARGET_ARG}`);
  process.exit(1);
}

function gitLastModifiedDate(filePath) {
  try {
    const out = execSync(
      `git log -1 --format="%ad" --date=short -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf8' }
    ).trim();
    return out || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f))
    .sort();
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function buildSitemap(site) {
  const siteDir = path.join(ROOT, 'packages', site.pkg);
  if (!fs.existsSync(siteDir)) {
    console.error(`❌ ${site.pkg}: not found`);
    return null;
  }

  const entries = [];

  // 1. Homepage (always first, highest priority)
  const indexPath = path.join(siteDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    entries.push(urlEntry(
      `${site.origin}/`,
      gitLastModifiedDate(indexPath),
      'weekly',
      '1.0'
    ));
  }

  // 2. Top-level HTML files (skip 404, skip index which we already added)
  const topLevel = listHtmlFiles(siteDir);
  for (const f of topLevel) {
    const name = path.basename(f, '.html');
    if (name === 'index' || name === '404') continue;
    const loc = `${site.origin}/${name}`;
    const lastmod = gitLastModifiedDate(f);
    const priority = '0.5';
    const changefreq = 'monthly';
    entries.push(urlEntry(loc, lastmod, changefreq, priority));
  }

  // 3. tools pages
  const toolsDir = path.join(siteDir, 'tools');
  const tools = listHtmlFiles(toolsDir);
  for (let i = 0; i < tools.length; i++) {
    const f = tools[i];
    const name = path.basename(f, '.html');
    const loc = `${site.origin}/tools/${name}`;
    const lastmod = gitLastModifiedDate(f);
    const priority = i < 5 ? '0.9' : '0.8';
    entries.push(urlEntry(loc, lastmod, 'monthly', priority));
  }

  // 4. compare pages
  const compareDir = path.join(siteDir, 'compare');
  if (fs.existsSync(compareDir)) {
    for (const slug of fs.readdirSync(compareDir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const page = path.join(compareDir, slug.name, 'index.html');
      if (!fs.existsSync(page)) continue;
      entries.push(urlEntry(`${site.origin}/compare/${slug.name}/`, gitLastModifiedDate(page), 'monthly', '0.7'));
    }
    const hub = path.join(compareDir, 'index.html');
    if (fs.existsSync(hub)) {
      entries.push(urlEntry(`${site.origin}/compare/`, gitLastModifiedDate(hub), 'monthly', '0.8'));
    }
  }

  // embed pages: intentionally NOT included (noindex, canonicalized to tool pages)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
  return xml;
}

// ── Sitemap-index ────────────────────────────────────────────────────────────
function buildSitemapIndex(site) {
  const today = new Date().toISOString().slice(0, 10);
  const sitemapLoc = `${site.origin}/sitemap.xml`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemapLoc}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

let totalUrls = 0;
for (const site of sites) {
  const xml = buildSitemap(site);
  if (!xml) continue;
  const outPath = path.join(ROOT, 'packages', site.pkg, 'sitemap.xml');
  fs.writeFileSync(outPath, xml);
  const urlCount = (xml.match(/<url>/g) || []).length;
  totalUrls += urlCount;
  console.log(`   ✅ ${site.pkg}: ${urlCount} URLs -> ${path.relative(ROOT, outPath)}`);

  const idx = buildSitemapIndex(site);
  const idxPath = path.join(ROOT, 'packages', site.pkg, 'sitemap-index.xml');
  fs.writeFileSync(idxPath, idx);
  console.log(`   ✅ ${site.pkg}: sitemap-index -> ${path.relative(ROOT, idxPath)}`);
}

console.log(`\n🎉 done. ${totalUrls} URLs across ${sites.length} site(s)`);
