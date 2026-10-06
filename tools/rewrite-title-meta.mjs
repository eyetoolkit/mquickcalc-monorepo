/**
 * tools/rewrite-title-meta.mjs
 *
 * 统一所有工具页 Title + Meta Description 格式
 * 格式：
 *   Title: "{工具名} — Free Calculator | {一句话描述} | mQuickCalc"
 *   Meta: "Calculate {核心功能}. Includes {特点1}, {特点2}. Free, no signup."
 *
 * 用法：
 *   node tools/rewrite-title-meta.mjs --dry
 *   node tools/rewrite-title-meta.mjs --apply
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITES = ['site-main', 'site-finance', 'site-health', 'site-insurance'];

const DOMAIN_MAP = {
  'site-main': 'mquickcalc.com',
  'site-finance': 'finance.mquickcalc.com',
  'site-health': 'health.mquickcalc.com',
  'site-insurance': 'cover.mquickcalc.com',
};

const dry = process.argv.includes('--dry');

// ── 从 slug 和现有 meta 推导标题/描述 ───────────────────
function inferTitleMeta(slug, site, html) {
  // 从 slug 提取工具名
  const name = slug
    .replace(/-calculator$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const domain = DOMAIN_MAP[site] || 'mquickcalc.com';

  // 从现有 meta description 提取一句话
  const metaDesc = (html.match(/<meta name="description" content="([^"]+)"/) || ['', ''])[1];
  const ogDesc = (html.match(/<meta property="og:description" content="([^"]+)"/) || ['', ''])[1];
  const desc = metaDesc || ogDesc || `${name} calculator — free, no signup required`;

  // 从 h1 提取
  const h1 = (html.match(/<h1[^>]*>([^<]+)<\/h1>/) || ['', ''])[1].trim();

  const toolName = h1 || name;
  const shortDesc = desc.slice(0, 100).replace(/\|/g, ',').replace(/"/g, "'");

  const title = `${toolName} — Free Calculator | ${domain}`;
  const meta = `${shortDesc}. Free, no signup.`;

  return { title, meta };
}

let total = 0, changed = 0;

for (const site of SITES) {
  const toolsDir = path.join(ROOT, 'packages', site, 'tools');
  if (!fs.existsSync(toolsDir)) continue;

  for (const file of fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'))) {
    total++;
    const fp = path.join(toolsDir, file);
    let html = fs.readFileSync(fp, 'utf8');
    const slug = file.replace('.html', '');
    const { title, meta } = inferTitleMeta(slug, site, html);

    let h = html;
    // 更新 <title>
    if (/<title>[^<]+<\/title>/.test(h)) {
      h = h.replace(/<title>[^<]+<\/title>/, `<title>${title}</title>`);
    }
    // 更新 og:title
    if (/<meta property="og:title"/.test(h)) {
      h = h.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`);
    }
    // 更新 meta description
    if (/<meta name="description"/.test(h)) {
      h = h.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${meta}"`);
    }
    // 更新 og:description
    if (/<meta property="og:description"/.test(h)) {
      h = h.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${meta}"`);
    }

    if (h !== html) {
      if (!dry) fs.writeFileSync(fp, h, 'utf8');
      changed++;
      if (!dry) console.log(`  ✅ ${path.relative(ROOT, fp)}`);
    }
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`${dry ? '🔍 DRY RUN' : '✅ DONE'}: ${changed}/${total} files`);
if (dry) console.log(`   → node tools/rewrite-title-meta.mjs --apply`);
