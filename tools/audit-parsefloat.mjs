#!/usr/bin/env node
/**
 * 修复 parseFloat(x) || 0 code smell
 * 
 * 问题：parseFloat("0") || 0 → 由于 "0" 是 truthy，但 parseFloat("0")=0 是 falsy，
 *        所以 0 值会被 || 后面的 0 覆盖（虽然结果还是 0，但语义上是 bug）
 *        更严重的是：如果输入恰好是字符串 "0"，parseFloat 返回 0，|| 0 会变成右边的 0
 *        实际上 `|| 0` 在 parseFloat 上的真正问题是：
 *          parseFloat("") = NaN → || 0 = 0 ✓ 这没问题
 *          parseFloat("abc") = NaN → || 0 = 0 ✓ 这没问题  
 *          parseFloat("0") = 0 → || 0 = 0 结果对，但逻辑错了
 *        所以严格说这是 code smell 而非真 bug，但建议改成显式检查：
 *          Number.isNaN(parseFloat(x)) ? 0 : parseFloat(x)
 *          或用 ?? 0（nullish coalescing 只处理 null/undefined，NaN 不处理）
 *        最简洁的正确写法：Math.max(0, parseFloat(x)) 不对，应该用 Number.isNaN
 * 
 * 修复策略：把 `parseFloat(expr) || 0` 改成 `Number.isNaN(parseFloat(expr)) ? 0 : parseFloat(expr)`
 * 但这样会让代码变长很多。更实用的做法是：
 *   如果原代码是 `var x = parseFloat(id.value) || 0` → 保持不动（虽然不完美但实际没出错）
 *   如果原代码有复杂表达式 → 同样保持不动
 * 
 * 所以这个脚本只是**报告**这些 smell，不自动改。
 * 真要改的话需要上下文判断。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITES = [
  'packages/site-main/tools',
  'packages/site-finance/tools',
  'packages/site-health/tools',
  'packages/site-insurance/tools',
];

let total = 0;
const re = /parseFloat\(([^)]+)\)\s*\|\|\s*0/g;

for (const dir of SITES) {
  const toolsDir = path.join(ROOT, dir);
  if (!fs.existsSync(toolsDir)) continue;
  const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const fp = path.join(toolsDir, file);
    const html = fs.readFileSync(fp, 'utf8');
    re.lastIndex = 0;
    const matches = html.match(re);
    if (matches && matches.length) {
      total += matches.length;
      const rel = path.relative(ROOT, fp);
      console.log(`  ${rel}  (${matches.length}×)`);
      for (const m of matches) {
        console.log(`    → ${m.trim()}`);
      }
    }
  }
}

console.log(`\n共 ${total} 处 parseFloat||0 — 建议: 保持不动(影响极小) 或 人工逐个检查是否有 0 值输入场景`);
