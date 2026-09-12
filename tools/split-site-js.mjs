#!/usr/bin/env node
/**
 * mQuickCalc site.js splitter — 3-way split
 *
 * tools/source-site.js (single source of truth) → 3 output files:
 *   - site-core.js     (~9 KB;  critical: footer + header brand + cookie bar)
 *   - site-icons.js    (~6 KB;  emoji-to-SVG replacement; homepages + tool grid)
 *   - site-enhance.js  (~6 KB;  a11y + scroll shadow + tabular nums + search + meters)
 *
 * All three are loaded with `defer` so they never block HTML parsing.
 * core.js executes before DOMContentLoaded; the other two wait until then.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE = path.join(ROOT, 'tools/source-site.js');
const CORE   = path.join(ROOT, 'packages/brand-kit/js/site-core.js');
const ICONS  = path.join(ROOT, 'packages/brand-kit/js/site-icons.js');
const ENH    = path.join(ROOT, 'packages/brand-kit/js/site-enhance.js');

if (!fs.existsSync(SOURCE)) {
  console.error(`❌ Source file not found: ${SOURCE}`);
  process.exit(1);
}

const src = fs.readFileSync(SOURCE, 'utf8');

// Three-way split: ===SPLIT-CORE===>...<=====END-CORE===== // ===SPLIT-ENHANCE===>...<=====END-ENHANCE===== // ===SPLIT-METERS===>...<=====END-METERS=====
// Note: METERS is appended after ENHANCE in the source (which is also the order we output).

// We use exec to find positions and slice manually (avoids non-greedy backtracking issues).
const coreStart = src.indexOf('// ===SPLIT-CORE===>');
const coreEnd   = src.indexOf('<=====END-CORE=====');
const enhStart  = src.indexOf('// ===SPLIT-ENHANCE===>');
const enhEnd    = src.indexOf('<=====END-ENHANCE=====');
const metStart  = src.indexOf('// ===SPLIT-METERS===>');
const metEnd    = src.indexOf('<=====END-METERS=====');
if ([coreStart, coreEnd, enhStart, enhEnd, metStart, metEnd].some(x => x < 0)) {
  console.error(`❌ Missing split markers. Found: CORE=${coreStart>=0}, ENHANCE=${enhStart>=0}, METERS=${metStart>=0}`);
  process.exit(1);
}

// CORE = everything between CORE markers
const core = src.slice(src.indexOf('===SPLIT-CORE===>') + '===SPLIT-CORE===>'.length, coreEnd).trim();
// ENHANCE = everything between ENHANCE markers (includes search + a11y + UX)
// ICONS = the emoji-replacer block, which lives inside ENHANCE — extract it specifically.
const enhance = src.slice(src.indexOf('===SPLIT-ENHANCE===>') + '===SPLIT-ENHANCE===>'.length, enhEnd).trim();
const meters  = src.slice(src.indexOf('===SPLIT-METERS===>') + '===SPLIT-METERS===>'.length, metEnd).trim();

// Extract the ICONS block from enhance (the IIFE starting with "var ICONS = {")
const iconsMatch = enhance.match(/(\/\/ --- Emoji-to-SVG replacement[\s\S]*?\}\)\(\);)/);
if (!iconsMatch) {
  console.error('❌ Could not extract ICONS block from enhance');
  process.exit(1);
}
const iconsBlock = iconsMatch[1].trim();
// Enhance without the ICONS block
const enhanceMinusIcons = enhance.replace(iconsMatch[1], '').trim();

// Write outputs
fs.mkdirSync(path.dirname(CORE), { recursive: true });
fs.writeFileSync(CORE, '// mQuickCalc — site-core.js\n' +
  '// Synchronous critical-path: brand mark, footer, cookie bar.\n' +
  '// Loaded with `defer` so the browser fetches it in parallel with HTML parse,\n' +
  '// then executes before DOMContentLoaded. Critical so the footer renders fast.\n\n' +
  core + '\n');
fs.writeFileSync(ICONS, '// mQuickCalc — site-icons.js\n' +
  '// Emoji-to-SVG replacement. Non-critical; can run after DOMContentLoaded.\n' +
  '// Used on homepages (tool grid) and on any page with a .feature/.sister-grid block.\n\n' +
  iconsBlock + '\n');
fs.writeFileSync(ENH, '// mQuickCalc — site-enhance.js\n' +
  '// Deferred non-critical enhancements: live search, a11y, cookie bar accept,\n' +
  '// header scroll shadow, tabular nums. Runs on DOMContentLoaded.\n\n' +
  enhanceMinusIcons + '\n');
// Meters — separate file for tool pages only
fs.writeFileSync(path.join(ROOT, 'packages/brand-kit/js/site-meters.js'),
  '// mQuickCalc — site-meters.js\n' +
  '// Result-meter renderer. Exposes window.__renderMeters(); page inline scripts\n' +
  '// call it after recomputing their answer. Used on tool pages only.\n\n' +
  meters + '\n');

console.log(`✅ site-core.js     ${fs.statSync(CORE).size} bytes`);
console.log(`✅ site-icons.js    ${fs.statSync(ICONS).size} bytes`);
console.log(`✅ site-enhance.js  ${fs.statSync(ENH).size} bytes`);
console.log(`✅ site-meters.js   ${fs.statSync(path.join(ROOT,'packages/brand-kit/js/site-meters.js')).size} bytes`);
