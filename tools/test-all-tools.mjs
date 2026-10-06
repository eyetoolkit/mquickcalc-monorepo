#!/usr/bin/env node
/**
 * mQuickCalc 全工具检测脚本 v2
 * 
 * 真实 bug / code smell / VM 假阳性 三分法
 * ──────────────────────────────────────────
 * ✅ REAL     = 必须修（JS_SYNTAX / 缺失结构）
 * ⚠️ SMELL    = code smell（parseFloat fallback 0）
 * 🟡 EXPECTED = VM 环境假阳性（window/document，converter 类工具）
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITES = [
  { pkg: 'packages/site-main',       domain: 'mquickcalc.com',         label: 'Main' },
  { pkg: 'packages/site-finance',    domain: 'finance.mquickcalc.com', label: 'Finance' },
  { pkg: 'packages/site-health',     domain: 'health.mquickcalc.com',  label: 'Health' },
  { pkg: 'packages/site-insurance',  domain: 'cover.mquickcalc.com',   label: 'Insurance' },
];

// 有这些特征函数之一就算"有计算逻辑"（覆盖 calc / converter / IIFE 各种命名）
const ANY_CALC_FN = /function\s+(calc|calculate|compute|convert|render|factorOf|sync|interpret|estimate|paint|from[A-Z]\w*|to[A-Z]\w*)\s*\(/;

// —— 已知 code smell 模式 ——
const SMELL_PATTERNS = [
  { name: 'parseFloat || 0 (吞 0 值)',
    re: /parseFloat\([^)]*\)\s*\|\|\s*0/g,
    fix: '改为 Number.isNaN(parseFloat(x)) ? 0 : parseFloat(x) 或用 ?? 0' },
];

const REAL = [], SMELL = [], EXPECTED = [];

for (const site of SITES) {
  const toolsDir = path.join(ROOT, site.pkg, 'tools');
  if (!fs.existsSync(toolsDir)) continue;

  const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));
  console.log(`\n📦 ${site.label} (${site.domain}) — ${files.length} tool pages`);
  console.log('─'.repeat(60));

  for (const file of files) {
    const slug = file.replace('.html', '');
    const fp = path.join(toolsDir, file);
    const html = fs.readFileSync(fp, 'utf8');

    // —— 提取 inline JS（排除 JSON-LD / src= / 非 JS type）——
    const allScripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
    const codeBlocks = [];
    for (const s of allScripts) {
      const tagEnd = s.indexOf('>');
      const tag = s.slice(0, tagEnd);
      const body = s.slice(tagEnd + 1, s.lastIndexOf('</script>'));
      if (/type\s*=\s*["']application\/ld\+json["']/.test(tag)) continue;
      if (/type\s*=\s*["']text\/html["']/.test(tag)) continue;
      if (/src\s*=/.test(tag)) continue;
      codeBlocks.push(body);
    }
    const allInlineJS = codeBlocks.join('\n');

    const realBugs = [];
    const smells = [];
    const expected = [];

    // ── REAL: JS 语法错误 ──
    if (allInlineJS.trim()) {
      try {
        new vm.Script(allInlineJS);
      } catch (e) {
        realBugs.push(`SYNTAX: ${e.message.split('\n')[0].slice(0, 60)}`);
      }
    }

    // ── SMELL: 已知模式 ──
    for (const sp of SMELL_PATTERNS) {
      sp.re.lastIndex = 0;
      const matches = html.match(sp.re) || [];
      for (let i = 0; i < matches.length; i++) {
        smells.push(sp.name);
      }
    }

    // ── EXPECTED: 有 window/document → VM 跑不了，但浏览器正常 ──
    if (/window\b|document\.createElement/.test(allInlineJS) &&
        /function\s+(calc|calculate|compute)\s*\(/.test(allInlineJS)) {
      expected.push('uses window/DOM (browser-only, VM cannot verify)');
    }

    // ── REAL vs EXPECTED: calc / converter 函数 ──
    const hasCalcLogic = ANY_CALC_FN.test(allInlineJS);
    if (!hasCalcLogic) {
      // 真的没有任何计算函数
      if (!/class="[^"]*result[^"]*"/.test(html)) {
        realBugs.push('NO_CALC_NO_RESULT (no calc/convert fn AND no result div)');
      } else {
        realBugs.push('NO_CALC_FN');
      }
    }

    // ── REAL: 核心 HTML 结构缺失 ──
    if (!/<title>[^<]+<\/title>/.test(html))       realBugs.push('NO_TITLE');
    if (!/rel="canonical"/.test(html))              realBugs.push('NO_CANONICAL');
    if (!/<h1[^>]*>/.test(html))                    realBugs.push('NO_H1');

    // —— 汇总 ——
    const ok = realBugs.length === 0;
    const icon = ok ? (smells.length ? '🟡' : '✅') : '🔴';
    const parts = [];
    if (realBugs.length)  parts.push(`🔴 ${realBugs.join(', ')}`);
    if (smells.length)    parts.push(`⚠️ ${smells.length}× smell`);
    if (expected.length)  parts.push(`🟡 ${expected.length}× browser-only`);
    const label = ok && !smells.length ? 'HEALTHY' : parts.join(' | ');
    console.log(`  ${icon} ${slug.padEnd(45)} ${label}`);

    if (realBugs.length) REAL.push({ slug, site: site.label, bugs: realBugs });
    if (smells.length)   SMELL.push({ slug, site: site.label, smells });
  }
}

// —— 最终报告 ——
console.log(`\n${'═'.repeat(60)}`);
console.log(`📊 检测报告`);
console.log(`\n🔴 REAL BUGS (${REAL.length})`);
for (const r of REAL) console.log(`   ${r.site}/${r.slug}.html — ${r.bugs.join(' | ')}`);

console.log(`\n⚠️  CODE SMELLS (${SMELL.length})`);
const smellByType = {};
for (const s of SMELL) for (const sn of s.smells) smellByType[sn] = (smellByType[sn] || 0) + 1;
for (const [t, c] of Object.entries(smellByType).sort((a,b) => b[1]-a[1]))
  console.log(`   ${t.padEnd(30)} ${c} files`);

console.log(`\n💡 可自动修复:`);
if (SMELL.length) {
  console.log(`   1) node tools/fix-calc-bugs.mjs         → fix ASI bug + typo`);
  console.log(`   2) node tools/fix-parsefloat.mjs         → fix parseFloat || 0 smell (待创建)`);
}
if (REAL.length) {
  console.log(`   🔴 真 bug 需人工修:`);
  for (const r of REAL) console.log(`      - ${r.site}/${r.slug}.html: ${r.bugs.join(', ')}`);
}

process.exit(REAL.length > 0 ? 1 : 0);
