/**
 * tools/generate-faq-jsonld.mjs
 *
 * 为所有工具页生成/更新 FAQPage JSON-LD（基于当前 details 结构）
 * 策略：
 *   1. 提取 details FAQ items → 生成 FAQPage JSON-LD
 *   2. 替换页面中旧的 FAQ JSON-LD block
 *   3. 如果页面有 FAQ 但无 JSON-LD → 追加新的 script block
 *
 * 用法：
 *   node tools/generate-faq-jsonld.mjs --dry
 *   node tools/generate-faq-jsonld.mjs --apply
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITES = ['site-main', 'site-finance', 'site-health', 'site-insurance'];
const dry = process.argv.includes('--dry');

// ── 提取 FAQ items（兼容 details 和 h3 结构）────────────────────
function extractFAQItems(html) {
  // 当前 details 结构
  const detailsItems = [];
  const detRe = /<details class="faq-card">[\s\S]*?<span class="faq-q-text">([\s\S]*?)<\/span>[\s\S]*?<div class="faq-body">[\s\S]*?<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = detRe.exec(html)) !== null) {
    detailsItems.push({
      q: m[1].trim(),
      a: m[2].trim().replace(/<[^>]+>/g, ''), // 去除 HTML 标签
    });
  }
  if (detailsItems.length) return detailsItems;

  // 回退：h3 结构
  const h3Items = [];
  const h3Re = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  while ((m = h3Re.exec(html)) !== null) {
    h3Items.push({
      q: m[1].trim(),
      a: m[2].trim().replace(/<[^>]+>/g, ''),
    });
  }
  return h3Items;
}

// ── 生成 FAQPage JSON-LD ────────────────────────────────────
function makeFAQJsonLD(items) {
  const mainEntity = items.map(it => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: it.a,
    },
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

// ── 替换页面中的旧 FAQ JSON-LD block ────────────────────────
function updateHTML(html, faqItems) {
  if (!faqItems.length) return { html, changed: false };

  const jsonLD = makeFAQJsonLD(faqItems);
  const newBlock = `<script type="application/ld+json">${JSON.stringify(jsonLD, null, 0)}</script>`;

  // 策略：找旧的 FAQ JSON-LD block 并替换
  // 匹配任意 script[type=application/ld+json] 含有 FAQPage 的 block
  const faqLdRe = /<script type="application\/ld\+json"[^>]*>[\s\S]*?FAQPage[\s\S]*?<\/script>/;
  if (faqLdRe.test(html)) {
    // 替换旧 block
    const replaced = html.replace(faqLdRe, newBlock);
    return { html: replaced, changed: replaced !== html, action: 'replaced' };
  }

  // 没有 FAQ JSON-LD → 在 <head> 末尾或其他 JSON-LD 后面追加
  // 找最后一个 JSON-LD block 的 </script> 位置
  const lastLdEnd = html.lastIndexOf('</script>');
  if (lastLdEnd !== -1) {
    const inserted = html.slice(0, lastLdEnd + 9) + '\n' + newBlock + html.slice(lastLdEnd + 9);
    return { html: inserted, changed: true, action: 'inserted' };
  }

  // 没有 JSON-LD → 插在 </head> 前面
  const headEnd = html.indexOf('</head>');
  if (headEnd !== -1) {
    const inserted = html.slice(0, headEnd) + '\n' + newBlock + html.slice(headEnd);
    return { html: inserted, changed: true, action: 'prepended-to-head' };
  }

  return { html, changed: false, action: 'failed-no-anchor' };
}

// ── 主循环 ────────────────────────────────────────────────
let total = 0, changed = 0, skipped = 0;
const actions = { replaced: 0, inserted: 0, 'prepended-to-head': 0, failed: 0, 'no-faq': 0 };

for (const site of SITES) {
  const toolsDir = path.join(ROOT, 'packages', site, 'tools');
  if (!fs.existsSync(toolsDir)) continue;

  for (const file of fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'))) {
    total++;
    const fp = path.join(toolsDir, file);
    const html = fs.readFileSync(fp, 'utf8');

    const items = extractFAQItems(html);
    if (!items.length) {
      skipped++;
      actions['no-faq']++;
      continue;
    }

    const result = updateHTML(html, items);
    if (result.changed) {
      if (!dry) fs.writeFileSync(fp, result.html, 'utf8');
      actions[result.action] = (actions[result.action] || 0) + 1;
      changed++;
      if (!dry) {
        const rel = path.relative(ROOT, fp);
        console.log(`  ✅ ${rel} [${result.action}] ${items.length} Q&A`);
      }
    } else {
      skipped++;
      actions.failed++;
    }
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`${dry ? '🔍 DRY RUN' : '✅ DONE'}: ${changed}/${total} pages updated`);
console.log(`  有 FAQ 但跳过: ${skipped} 页`);
console.log(`  动作: ${JSON.stringify(actions)}`);
if (dry) console.log(`\n  → node tools/generate-faq-jsonld.mjs --apply`);
