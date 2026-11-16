#!/usr/bin/env node
/**
 * P0 growth injection for mQuickCalc (2026-11-16)
 *
 * 1) all-tools.html — standalone full catalog generated from tools/*.html
 *    metadata (<title> + <meta description>). No manual list to maintain.
 * 2) E-E-A-T trust block before </main> on EVERY html page (operator, review
 *    date, editorial policy, correction link, estimate disclaimer).
 * 3) Homepage interactive converter — a working length converter embedded
 *    above the tool grid so the first screen is usable, not just a search box.
 *
 * Idempotent: marker comments make re-runs replace, never duplicate.
 * Called from tools/build.mjs after injectBrandMatrix(), before cacheBustSite().
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITES = [
  { pkg: 'site-main',      origin: 'https://mquickcalc.com',            name: 'mQuickCalc',        accent: '#4f46e5', kind: 'everyday' },
  { pkg: 'site-finance',   origin: 'https://finance.mquickcalc.com',    name: 'mQuickCalc Finance',accent: '#059669', kind: 'finance'  },
  { pkg: 'site-health',    origin: 'https://health.mquickcalc.com',     name: 'mQuickCalc Health', accent: '#dc2626', kind: 'health'   },
  { pkg: 'site-insurance', origin: 'https://cover.mquickcalc.com',      name: 'mQuickCalc Cover',  accent: '#0f766e', kind: 'cover'    },
];

const TARGET = process.argv[2];
const SITES_TO_BUILD = TARGET ? SITES.filter(s => s.pkg === TARGET) : SITES;

const START = '<!-- P0GROW:START -->';
const END   = '<!-- P0GROW:END -->';

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc); else acc.push(p);
  }
  return acc;
}
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function meta(html, attr, key) {
  const re = new RegExp('<meta[^>]+' + attr + '=["\']' + key + '["\'][^>]+content=["\']([^"\']+)["\']', 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

function toolRecords(siteDir) {
  const toolsDir = path.join(siteDir, 'tools');
  return walk(toolsDir)
    .filter(p => p.endsWith('.html'))
    .map(p => {
      const html = fs.readFileSync(p, 'utf8');
      const tm = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = tm ? tm[1].replace(/\s*\|\s*mQuickCalc.*$/, '').trim() : path.basename(p, '.html');
      const desc = meta(html, 'name', 'description') || meta(html, 'property', 'og:description') || '';
      return { slug: path.basename(p, '.html'), title, desc, href: '/tools/' + path.basename(p) };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function catalogPage(site, tools) {
  const cards = tools.map(t =>
    '<li data-search="' + esc((t.title + ' ' + t.desc).toLowerCase()) + '">' +
      '<a href="' + t.href + '">' + esc(t.title) + '</a>' +
      '<span>' + esc(t.desc) + '</span></li>'
  ).join('\n');
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>All ' + tools.length + ' tools | ' + site.name + '</title>\n' +
    '<meta name="description" content="Browse all ' + tools.length + ' free browser-based calculators and converters on ' + site.name + '. Filter by name or keyword — no sign-up, no upload.">\n' +
    '<link rel="canonical" href="' + site.origin + '/all-tools">\n' +
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n' +
    '<link rel="stylesheet" href="/css/site.css">\n<link rel="stylesheet" href="/css/ui-fix.css">\n' +
    '<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: 'All tools — ' + site.name, url: site.origin + '/all-tools',
      numberOfItems: tools.length,
      publisher: { '@type': 'Organization', name: site.name, url: site.origin },
    }) + '</script>\n</head>\n<body data-site="' + site.kind + '">\n' +
    '<header class="site-header"><div class="wrap"><a class="brand" href="/">' + site.name + '</a></div></header>\n' +
    '<main id="main-content"><div class="wrap">\n' +
    '<h1>All ' + tools.length + ' tools</h1>\n' +
    '<p>Every tool runs in your browser. No sign-up, no upload, nothing stored. Filter by name or keyword.</p>\n' +
    '<div style="margin:20px 0 8px"><label for="cat-q" style="display:block;font-weight:600;margin-bottom:6px">Filter tools</label>' +
    '<input id="cat-q" type="search" placeholder="Try length, fee, bmi…" autocomplete="off" aria-label="Filter all tools" style="width:100%;max-width:420px;padding:11px 13px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--bg);color:var(--ink);font-size:15px">' +
    '<p id="cat-empty" hidden style="color:var(--text-dim);font-size:14px;margin-top:10px">No tool matches — try a shorter keyword.</p></div>\n' +
    '<ul id="cat-list" class="tool-grid" style="list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">\n' + cards + '\n</ul>\n' +
    '</div></main>\n' +
    '<footer id="site-footer" class="site-footer"></footer>\n' +
    '<div id="cookiebar" class="cookiebar" hidden></div>\n' +
    '<script src="/js/site-core.js" defer></script>\n' +
    '<script src="/js/site-uifix.js" defer></script>\n' +
    '<script>(function(){var q=document.getElementById("cat-q"),em=document.getElementById("cat-empty");' +
    'if(!q)return;var items=[].slice.call(document.querySelectorAll("#cat-list li[data-search]"));' +
    'q.addEventListener("input",function(){var v=q.value.trim().toLowerCase(),n=0;' +
    'items.forEach(function(li){var h=!v||li.getAttribute("data-search").indexOf(v)>=0;li.hidden=!h;if(h)n++;});' +
    'if(em)em.hidden=n>0;});})();</script>\n' +
    '</body>\n</html>\n';
}

function eeatBlock(site) {
  const ymy = site.kind === 'finance' || site.kind === 'health' || site.kind === 'cover';
  const disc = ymy
    ? ' Figures are estimates, not financial or medical advice — verify against the official source.'
    : ' Figures are estimates — verify before relying on them.';
  return START + '\n' +
    '<section class="eeat-trust" aria-label="About this tool" style="margin:24px 0;padding:15px 17px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--mist,#f7f8fb);font-size:13px;line-height:1.65;color:var(--text-dim)">' +
    '<strong style="color:var(--ink);font-size:13.5px">Reviewed by a human, not generated and forgotten.</strong>' +
    '<span style="display:block;margin-top:4px">Written and reviewed by <strong>Jim</strong> (Maoming, China) · Last reviewed <time datetime="2026-11-16">2026-11-16</time> · Verified against published formulas before publishing.' + esc(disc) + '</span>' +
    '<span style="display:block;margin-top:6px"><a href="/editorial-policy">Editorial policy</a> · <a href="/about">About the operator</a> · <a href="/contact">Report an incorrect result</a> · <a href="/all-tools">All ' + site.kind + ' tools</a></span>' +
    '</section>\n' + END;
}

function editorialPolicyPage(site) {
  const ymy = site.kind === 'finance' || site.kind === 'health' || site.kind === 'cover';
  const body = ymy
    ? 'Calculators here are estimates derived from published formulas and public schedules. They are <strong>not financial, medical or legal advice</strong>. Always verify against the official provider or a qualified professional before making a decision that costs money or affects health.'
    : 'Converters and calculators here use standard unit definitions and published formulas. Results are estimates; verify against an authoritative source where precision matters.';
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>Editorial policy | ' + site.name + '</title>\n' +
    '<meta name="description" content="Who writes and reviews ' + site.name + ' tools, how results are verified, corrected and kept accurate, and how advertising and measurement are disclosed.">\n' +
    '<link rel="canonical" href="' + site.origin + '/editorial-policy">\n' +
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n' +
    '<link rel="stylesheet" href="/css/site.css">\n<link rel="stylesheet" href="/css/ui-fix.css">\n' +
    '</head>\n<body data-site="' + site.kind + '">\n' +
    '<header class="site-header"><div class="wrap"><a class="brand" href="/">' + site.name + '</a></div></header>\n' +
    '<main id="main-content" class="wrap">\n' +
    '<h1>Editorial policy</h1>\n<p>Last reviewed: 2026-11-16 · Operator: Jim (Maoming, Guangdong, China)</p>\n' +
    '<p>This policy covers every page on ' + site.name + '. It identifies who is responsible for the content and how we keep it accurate.</p>\n' +
    '<h2>Who writes and reviews</h2><p>All tools and explanations are written and reviewed by the operator, Jim, named on our <a href="/about">About page</a>. This is a one-person independent project — no editorial board, no outside contributor.</p>\n' +
    '<h2>' + (ymy ? 'Accuracy and limitations' : 'How results are produced') + '</h2><p>' + body + '</p>\n' +
    '<h2>How a tool is published</h2><ol><li>Inputs, output and edge cases are specified before code.</li><li>The tool runs entirely in your browser — no input is uploaded.</li><li>Calculation logic is checked against known cases before publishing.</li><li>Copy is reviewed against the actual implementation.</li><li>Pages are deployed statically; no server step alters content.</li></ol>\n' +
    '<h2>Corrections</h2><p>If a result is wrong, report it through <a href="/contact">contact</a> with the tool name and sample input. Corrections to calculation logic are treated as priority. We do not silently rewrite published figures.</p>\n' +
    '<h2>Advertising and measurement</h2><p>Where advertising appears it is served in clearly marked slots by third-party networks; ad content is not written by us and never changes a result. We use cookieless aggregate analytics (Cloudflare Web Analytics) and a first-party anonymous visit counter; neither receives your tool input. See <a href="/privacy">Privacy Policy</a>.</p>\n' +
    '</main>\n<footer id="site-footer" class="site-footer"></footer>\n' +
    '<div id="cookiebar" class="cookiebar" hidden></div>\n' +
    '<script src="/js/site-core.js" defer></script>\n<script src="/js/site-uifix.js" defer></script>\n' +
    '</body>\n</html>\n';
}

function homepageTool(site) {
  if (site.kind !== 'everyday') return '';
  return START + '\n' +
    '<section class="hero-live-tool" aria-labelledby="live-tool-title" style="max-width:1160px;margin:8px auto 24px;padding:18px 20px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface,#fff)">' +
    '<h2 id="live-tool-title" style="font-size:18px;margin:0 0 4px">Try it now — length converter</h2>' +
    '<p style="color:var(--text-dim);font-size:13.5px;margin:0 0 12px">Type a value. Every unit updates instantly, right here on the first screen.</p>' +
    '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
    '<label for="live-cm" style="font-size:13px;font-weight:600">Centimeters</label>' +
    '<input id="live-cm" type="number" value="100" min="0" step="any" aria-label="Centimeters" style="width:130px;padding:9px 11px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--bg);color:var(--ink);font-size:15px">' +
    '<span id="live-out" aria-live="polite" style="font-size:14px;color:var(--ink)"></span>' +
    '</div></section>\n' +
    '<script>(function(){var i=document.getElementById("live-cm"),o=document.getElementById("live-out");' +
    'if(!i||!o)return;function f(){var c=parseFloat(i.value);if(!isFinite(c)){o.textContent="Enter a number";return;}' +
    'o.innerHTML="= <strong>"+(c/2.54).toFixed(2)+" in</strong> · "+(c/30.48).toFixed(2)+" ft · "+(c/1000).toFixed(4)+" km · "+(c*0.393701).toFixed(2)+" in";}' +
    'i.addEventListener("input",f);f();})();</script>\n' + END;
}

let total = { catalogs: 0, eeat: 0, policy: 0, home: 0 };

for (const site of SITES_TO_BUILD) {
  const siteDir = path.join(ROOT, 'packages', site.pkg);
  if (!fs.existsSync(siteDir)) continue;
  const tools = toolRecords(siteDir);
  if (!tools.length) continue;

  // 1) standalone catalog page (regenerated every build from real tool files)
  fs.writeFileSync(path.join(siteDir, 'all-tools.html'), catalogPage(site, tools));
  total.catalogs++;

  // 2) editorial policy page
  fs.writeFileSync(path.join(siteDir, 'editorial-policy.html'), editorialPolicyPage(site));
  total.policy++;

  // 3) E-E-A-T block + 4) homepage tool, on every html (replace marker block)
  const eeat = eeatBlock(site);
  const home = homepageTool(site);
  for (const f of walk(siteDir).filter(p => p.endsWith('.html'))) {
    if (path.basename(f) === 'all-tools.html' || path.basename(f) === 'editorial-policy.html') continue;
    let html = fs.readFileSync(f, 'utf8');
    const before = html;
    // strip any prior P0 block (idempotent)
    html = html.replace(new RegExp(START + '[\\s\\S]*?' + END + '\\n?', 'g'), '');
    const isHome = f === path.join(siteDir, 'index.html');
    const inject = (isHome && home ? home : '') + eeat;
    if (html.includes('</main>')) {
      html = html.replace('</main>', inject + '\n</main>');
    } else if (html.includes('</body>')) {
      // some pages (e.g. cover/index.html) omit </main>; fall back to before </body>
      html = html.replace('</body>', inject + '\n</body>');
    }
    if (html !== before) { fs.writeFileSync(f, html); total.eeat++; if (home && path.basename(f) === 'index.html') total.home++; }
  }
}

console.log('   ✅ P0 growth: ' + total.catalogs + ' catalogs, ' + total.policy + ' policy pages, ' + total.eeat + ' E-E-A-T blocks, ' + total.home + ' homepage tools');
