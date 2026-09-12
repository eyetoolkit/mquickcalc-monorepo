#!/usr/bin/env node
/**
 * Fix two bugs in monorepo tools:
 * 1. ASI bug: var foo="; if(...) foo=... (missing semicolon after ";"
 *    makes var statement continue into the if, causing SyntaxError)
 * 2. Typo in brand-kit site.js: healLinks -> heaLinks
 *
 * Idempotent: running twice is safe (no-op if pattern not found).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// --- Fix 1: ASI bug in calc functions ---
// Pattern: `="; if(`
// Fix: insert `;` after the closing `"` so the var statement terminates
const TOOLS_GLOB = [
  'packages/site-main/tools/*.html',
  'packages/site-finance/tools/*.html',
  'packages/site-health/tools/*.html',
];

let totalFixed = 0;
for (const glob of TOOLS_GLOB) {
  const dir = path.join(ROOT, path.dirname(glob));
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.html'))) {
    const p = path.join(dir, f);
    let text = fs.readFileSync(p, 'utf8');
    const before = text;
    // Pattern: 任何 `=";` 后紧跟 `if(` 或 `else if(` — 在 `"` 后插 `;`
    // 用更精确的正则避免误伤
    // 匹配 `=";` 后是 `if` 或 `else if`
    text = text.replace(/=";\s*(if\s*\()/g, '=";$1');
    text = text.replace(/=";\s*(else\s+if\s*\()/g, '=";$1');
    if (text !== before) {
      fs.writeFileSync(p, text);
      console.log(`   ✅ fixed ASI: ${path.relative(ROOT, p)}`);
      totalFixed++;
    }
  }
}

console.log(`\nFixed ${totalFixed} files for ASI bug`);

// --- Fix 2: typo healLinks -> heaLinks in brand-kit site.js ---
const SITEJS = path.join(ROOT, 'packages/brand-kit/js/site.js');
let sj = fs.readFileSync(SITEJS, 'utf8');
const before2 = sj;
sj = sj.replace(/\bhealLinks\b/g, 'heaLinks');
if (sj !== before2) {
  fs.writeFileSync(SITEJS, sj);
  console.log(`\n   ✅ fixed typo: healLinks → heaLinks in brand-kit/js/site.js`);
} else {
  console.log(`\n   (no healLinks typo found, already correct)`);
}

console.log('\n🎉 done.');
