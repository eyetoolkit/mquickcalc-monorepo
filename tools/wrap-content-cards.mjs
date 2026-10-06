/**
 * tools/wrap-content-cards.mjs
 * 把 h2 主题段落包成 content-card 卡片
 * 兼容两种结构：<section class="content-area"> 和裸 <main> 直放 h2
 */
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITES = ['site-main', 'site-finance', 'site-health', 'site-insurance'];
const dry = process.argv.includes('--dry');

function wrapCards(html) {
  // 找到内容区：优先 content-area，否则取 main
  let caStart = html.indexOf('<section class="content-area"');
  let sectionTag = 'section.content-area';

  if (caStart === -1) {
    caStart = html.indexOf('<main');
    sectionTag = 'main';
  }
  if (caStart === -1) return html;

  // 找到内容区结束（FAQ / related / footer 之前）
  const endMarkers = [
    '<div class="faq-list">', '<div class="faq-cards">',
    '<section class="see-also">', '<div class="related-section">',
    '<footer',
  ];
  const searchStart = caStart + 1;
  let caEnd = Infinity;
  for (const m of endMarkers) {
    const idx = html.indexOf(m, searchStart);
    if (idx !== -1) caEnd = Math.min(caEnd, idx);
  }
  if (caEnd === Infinity) caEnd = html.length;

  // 提取内容区，查找所有 h2 位置
  const sectionHtml = html.slice(caStart, caEnd);
  const h2Positions = [];
  let searchFrom = 0;
  while (true) {
    const idx = sectionHtml.indexOf('<h2', searchFrom);
    if (idx === -1) break;
    const endTag = sectionHtml.indexOf('</h2>', idx);
    if (endTag === -1) break;
    h2Positions.push({ start: idx, end: endTag + 5 });
    searchFrom = endTag + 5;
  }

  if (h2Positions.length < 2) return html; // 单 h2 不包

  // 构建包裹后的内容
  let result = sectionHtml;
  let offset = 0;

  for (let i = 0; i < h2Positions.length; i++) {
    const pos = h2Positions[i];
    const isLast = i === h2Positions.length - 1;
    const contentStart = pos.end;
    const contentEnd = isLast ? result.length : h2Positions[i + 1].start;

    const before = result.slice(0, contentStart + offset);
    const content = result.slice(contentStart + offset, contentEnd + offset);
    const after = result.slice(contentEnd + offset);

    // 跳过空白内容
    const trimmed = content.trim();
    if (!trimmed) { continue; }

    const wrapped = `<div class="content-card">${content}</div>`;
    result = before + wrapped + after;
    offset += wrapped.length - content.length;
  }

  return html.slice(0, caStart) + result + html.slice(caEnd);
}

let total = 0, changed = 0;
for (const site of SITES) {
  const toolsDir = path.join(ROOT, 'packages', site, 'tools');
  if (!fs.existsSync(toolsDir)) continue;
  for (const file of fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'))) {
    total++;
    const fp = path.join(toolsDir, file);
    let html = fs.readFileSync(fp, 'utf8');
    const orig = html;
    html = wrapCards(html);
    if (html !== orig) {
      if (!dry) fs.writeFileSync(fp, html, 'utf8');
      console.log(`  ${dry ? '🔍' : '✅'} ${path.relative(ROOT, fp)}`);
      changed++;
    }
  }
}
console.log(`\n${'─'.repeat(50)}`);
console.log(`${dry ? '🔍 DRY RUN' : '✅ DONE'}: ${changed}/${total} files`);
if (dry) console.log(`   → node tools/wrap-content-cards.mjs --apply`);
