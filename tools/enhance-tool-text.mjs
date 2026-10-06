/**
 * tools/enhance-tool-text.mjs
 * FAQ: 追加 "Details/Hide" 标签，jsonversal 风格
 */
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITES = ['site-main', 'site-finance', 'site-health', 'site-insurance'];

const dry = process.argv.includes('--dry');

// ── 提取 FAQ items（兼容 button/旧 h3+p/当前 details 结构）──
function extractFAQItems(html, startIdx) {
  const endPatterns = [
    html.indexOf('<div class="related-section">', startIdx),
    html.indexOf('<section class="see-also">', startIdx),
    html.indexOf('<footer', startIdx),
  ].filter(i => i !== -1);
  const endIdx = Math.min(...endPatterns);
  if (endIdx === Infinity || endIdx === -1) return null;

  const raw = html.slice(startIdx, endIdx);

  // 当前 details 结构
  const detailsItemRe = /<details class="faq-card">[\s\S]*?<span class="faq-q-text">([\s\S]*?)<\/span>[\s\S]*?<div class="faq-body">[\s\S]*?<p>([\s\S]*?)<\/p>/g;
  const items = [];
  let m;
  while ((m = detailsItemRe.exec(raw)) !== null) {
    items.push({ q: m[1].trim(), a: m[2].trim() });
  }
  if (items.length) return { items, endIdx };

  // 回退：旧 button 结构
  const btnRe = /<button class="faq-q"[^>]*>[\s\S]*?<span class="faq-q-text">([\s\S]*?)<\/span>[\s\S]*?<\/button>[\s\S]*?<div class="faq-a"[^>]*hidden[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/g;
  while ((m = btnRe.exec(raw)) !== null) items.push({ q: m[1].trim(), a: m[2].trim() });
  if (items.length) return { items, endIdx };

  // 回退：h3+p 结构
  const h3Re = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  while ((m = h3Re.exec(raw)) !== null) items.push({ q: m[1].trim(), a: m[2].trim() });
  if (items.length) return { items, endIdx };

  return null;
}

// ── jsonversal 风格 FAQ HTML（带 Details/Hide 标签）────────
function buildDetailsHTML(items, h2Text) {
  return `${h2Text}
<div class="faq-list">
${items.map((it) => `<details class="faq-card">
  <summary class="faq-summary">
    <span class="faq-q-text">${it.q}</span>
    <span class="faq-label">
      <span class="faq-label-detail">Details</span>
      <span class="faq-label-hide">Hide</span>
      <span class="faq-arrow" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </span>
  </summary>
  <div class="faq-body">
    <p>${it.a}</p>
  </div>
</details>`).join('\n')}
</div>`;
}

// ── 主增强 ────────────────────────────────────────────────
function enhanceFAQ(html) {
  const faqDivIdx = html.search(/<div class="faq-(?:list|cards)"[^>]*>/);
  if (faqDivIdx === -1) return html;

  const beforeChunk = html.slice(Math.max(0, faqDivIdx - 2000), faqDivIdx);
  const h2Matches = beforeChunk.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || [];
  const h2Text = h2Matches[h2Matches.length - 1];
  if (!h2Text) return html;

  const h2FullIdx = html.lastIndexOf(h2Text, faqDivIdx);
  const extracted = extractFAQItems(html, h2FullIdx);
  if (!extracted || !extracted.items.length) return html;

  const { items, endIdx } = extracted;
  const newFAQ = buildDetailsHTML(items, h2Text);
  return html.slice(0, h2FullIdx) + newFAQ + html.slice(endIdx);
}

function highlightFormulas(html) {
  return html.replace(/<p>(<strong>[\s\S]*?×[\s\S]*?<\/strong>[\s\S]*?)<\/p>/g, (m) =>
    m.replace('<p>', '<p class="formula-callout">'));
}

// ── 主循环 ────────────────────────────────────────────────
let total = 0, changed = 0;
for (const site of SITES) {
  const toolsDir = path.join(ROOT, 'packages', site, 'tools');
  if (!fs.existsSync(toolsDir)) continue;
  for (const file of fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'))) {
    total++;
    const fp = path.join(toolsDir, file);
    let html = fs.readFileSync(fp, 'utf8');
    const orig = html;
    html = highlightFormulas(html);
    html = enhanceFAQ(html);
    if (html !== orig) {
      if (!dry) fs.writeFileSync(fp, html, 'utf8');
      console.log(`  ${dry ? '🔍' : '✅'} ${path.relative(ROOT, fp)}`);
      changed++;
    }
  }
}
console.log(`\n${'─'.repeat(50)}`);
console.log(`${dry ? '🔍 DRY RUN' : '✅ DONE'}: ${changed}/${total} files`);
if (dry) console.log(`   → node tools/enhance-tool-text.mjs --apply`);
