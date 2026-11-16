#!/usr/bin/env node
/**
 * P1 engagement injection for mQuickCalc (2026-11-16)
 *
 * Runs AFTER p0-growth.mjs in tools/build.mjs. Uses its own marker so P0
 * re-runs never remove P1 blocks (and vice versa).
 *
 * 1) Every tool page:
 *    - Download result button (generic: reads visible output nodes, no upload)
 *    - Contextual "report an incorrect result" link to /contact?tool=<slug>
 *    - Related tools filled to 4-6 from same-site metadata (single source:
 *      tools/*.html title + meta description), excluding existing links
 *    - localStorage recent-tools recording
 * 2) Home + all-tools pages:
 *    - "Recently used" strip rendered from the same localStorage key
 *
 * Idempotent: marker comments are stripped and replaced on every run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITES = [
  { pkg: 'site-main',      origin: 'https://mquickcalc.com' },
  { pkg: 'site-finance',   origin: 'https://finance.mquickcalc.com' },
  { pkg: 'site-health',    origin: 'https://health.mquickcalc.com' },
  { pkg: 'site-insurance', origin: 'https://cover.mquickcalc.com' },
];

const TARGET = process.argv[2];
const SITES_TO_BUILD = TARGET ? SITES.filter(s => s.pkg === TARGET) : SITES;

const START = '<!-- P1ENGAGE:START -->';
const END   = '<!-- P1ENGAGE:END -->';
const START_RECENT = '<!-- P1RECENT:START -->';
const END_RECENT   = '<!-- P1RECENT:END -->';

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc); else acc.push(p);
  }
  return acc;
}
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function meta(html, key) {
  const m = html.match(new RegExp('<meta[^>]+name=["\']' + key + '["\'][^>]+content=["\']([^"\']+)["\']', 'i'));
  return m ? m[1] : '';
}

function toolRecords(siteDir) {
  return walk(path.join(siteDir, 'tools'))
    .filter(p => p.endsWith('.html'))
    .map(p => {
      const html = fs.readFileSync(p, 'utf8');
      const tm = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return {
        slug: path.basename(p, '.html'),
        title: tm ? tm[1].replace(/\s*\|\s*mQuickCalc.*$/, '').trim() : path.basename(p, '.html'),
        desc: meta(html, 'description'),
        href: '/tools/' + path.basename(p),
      };
    });
}

const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'tool', 'tools', 'calculator', 'calculate', 'free', 'online', 'quick', 'your', 'using', 'convert', 'converter', 'about']);
const words = s => String(s || '').toLowerCase().match(/[a-z0-9]+/g) || [];
const terms = t => new Set([...words(t.title), ...words(t.desc)].filter(w => w.length > 2 && !STOP.has(w)));

function relatedFor(current, tools, existingHrefs) {
  const ct = terms(current);
  const prefix = current.slug.split('-').slice(0, 2).join('-');
  return tools
    .filter(t => t.slug !== current.slug && !existingHrefs.has(t.href))
    .map(t => {
      const ts = terms(t);
      const shared = [...ct].filter(w => ts.has(w));
      const samePrefix = t.slug.startsWith(prefix + '-') ? 1 : 0;
      return { t, shared, score: shared.length * 2 + samePrefix * 3 };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => ({ ...x.t, reason: x.shared.length ? x.shared.slice(0, 2).join(' + ') : 'same family' }));
}

function engagementBlock(site, current, tools, existingHrefs) {
  const rel = relatedFor(current, tools, existingHrefs);
  const relHtml = rel.length
    ? '<section class="p1-related" aria-label="More tools you may need" style="margin:22px 0;padding:16px 18px;border:1px solid var(--line);border-left:4px solid var(--brand);border-radius:var(--radius-md);background:var(--mist,#f7f8fb)">' +
      '<h2 style="font-size:16px;margin:0 0 10px">💡 More tools for this task</h2>' +
      '<ul style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px 16px">' +
      rel.map(r => '<li style="font-size:13.5px;line-height:1.5"><a href="' + r.href + '">' + esc(r.title) + '</a> <span style="color:var(--text-dim)">— ' + esc(r.reason) + '</span></li>').join('') +
      '</ul></section>'
    : '';

  return START + '\n' +
    relHtml +
    '<div class="p1-tool-actions" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:18px 0 6px;font-size:13.5px">' +
    '<button type="button" id="p1-download-btn" class="btn" style="cursor:pointer">⬇ Download result</button>' +
    '<a href="/contact?tool=' + encodeURIComponent(current.slug) + '&subject=result-error">Report an incorrect result</a>' +
    '<span style="color:var(--text-dim)">Runs in your browser — nothing is uploaded.</span>' +
    '</div>' +
    '<script>(function(){' +
    'var b=document.getElementById("p1-download-btn");if(!b)return;' +
    'function text(){var s=["#output","#result",".result",".output","[id$=\\"-result\\"]","pre","table"];' +
    'for(var i=0;i<s.length;i++){var ns=document.querySelectorAll(s[i]);for(var j=0;j<ns.length;j++){' +
    'var t=(ns[j].textContent||"").trim();if(t&&t!=="—"&&t.length>1&&!/^(output|result)$/i.test(t))return t;}}return "";}' +
    'b.addEventListener("click",function(){var t=text();if(!t){if(window.mqc&&window.mqc.toast)window.mqc.toast("Run the calculator first — no result to download yet.");return;}' +
    'var n=(location.pathname.split("/").filter(Boolean).pop()||"result")+".txt";' +
    'var u=URL.createObjectURL(new Blob([t],{type:"text/plain;charset=utf-8"}));var a=document.createElement("a");' +
    'a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},1000);' +
    'if(window.mqc&&window.mqc.toast)window.mqc.toast("Downloaded "+n);});' +
    'try{var k="mquickcalc-recent",a=JSON.parse(localStorage.getItem(k)||"[]"),h=location.pathname.replace(/\\/$/,""),ti=document.title.split("|")[0].trim();' +
    'a=a.filter(function(x){return x.href!==h;});a.unshift({href:h,title:ti});localStorage.setItem(k,JSON.stringify(a.slice(0,5)));}catch(e){}' +
    '})();</script>\n' + END;
}

function recentBlock() {
  return START_RECENT + '\n' +
    '<section class="p1-recent" aria-label="Recently used" style="display:none;margin:18px auto;max-width:1160px;padding:12px 16px;border:1px solid var(--line);border-radius:var(--radius-md)">' +
    '<h2 style="font-size:15px;margin:0 0 8px">Recently used</h2>' +
    '<div id="p1-recent-links" style="display:flex;gap:10px;flex-wrap:wrap;font-size:13.5px"></div></section>' +
    '<script>(function(){var s=document.getElementById("p1-recent-links");if(!s)return;' +
    'try{var a=JSON.parse(localStorage.getItem("mquickcalc-recent")||"[]");if(!a.length)return;' +
    's.innerHTML=a.map(function(x){return "<a href=\\""+x.href+"\\">"+x.title+"</a>";}).join("");' +
    's.closest(".p1-recent").style.display="block";}catch(e){}})();</script>\n' + END_RECENT;
}

function insertBeforeClose(html, inject) {
  if (html.includes('</main>')) return html.replace('</main>', inject + '\n</main>');
  if (html.includes('</body>')) return html.replace('</body>', inject + '\n</body>');
  return html;
}

function stripMarker(html, start, end) {
  return html.replace(new RegExp(start + '[\\s\\S]*?' + end + '\\n?', 'g'), '');
}

let total = { tools: 0, pages: 0, related: 0 };

for (const site of SITES_TO_BUILD) {
  const siteDir = path.join(ROOT, 'packages', site.pkg);
  if (!fs.existsSync(siteDir)) continue;
  const tools = toolRecords(siteDir);
  if (!tools.length) continue;

  for (const f of walk(siteDir).filter(p => p.endsWith('.html'))) {
    let html = fs.readFileSync(f, 'utf8');
    const before = html;
    html = stripMarker(html, START, END);
    html = stripMarker(html, START_RECENT, END_RECENT);

    const isTool = f.startsWith(path.join(siteDir, 'tools') + path.sep);
    if (isTool) {
      const slug = path.basename(f, '.html');
      const current = tools.find(t => t.slug === slug);
      const existing = new Set([...html.matchAll(/href="(\/tools\/[^"#]+)"/g)].map(m => m[1]));
      const block = engagementBlock(site, current, tools, existing);
      html = insertBeforeClose(html, block);
      total.tools++;
      total.related += (block.match(/class="p1-related"/g) || []).length;
    } else if (path.basename(f) === 'index.html' || path.basename(f) === 'all-tools.html') {
      html = insertBeforeClose(html, recentBlock());
      total.pages++;
    }
    if (html !== before) fs.writeFileSync(f, html);
  }
}

console.log('   ✅ P1 engagement: ' + total.tools + ' tool pages (with ' + total.related + ' related blocks), ' + total.pages + ' recent-use pages');
