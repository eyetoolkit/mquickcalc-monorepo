/**
 * Refresh the hard-coded FX rate table in the currency converter.
 *
 * The converter is 100% client-side: rates are baked into the page at build
 * time rather than fetched per visit, so they drift as markets move. Run this
 * script (locally, or on a schedule in CI) to re-bake current mid-market rates
 * and rewrite every "last updated" string to match.
 *
 * Source: https://open.er-api.com/v6/latest/USD (free, no key, USD-anchored —
 * the same convention the page uses: rates[EUR] = 0.86 means 1 USD = 0.86 EUR).
 *
 * Usage: node tools/refresh-currency-rates.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'packages/site-main/tools/currency-converter.html');
const ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
const DRY = process.argv.includes('--dry');

const OLD = {
  short: '16 Sep 2026',
  long: '16 September 2026',
  iso: '2026-09-16',
  md: 'September 16, 2026',
};

/** "6 Oct 2026" / "6 October 2026" / "2026-10-06" / "October 6, 2026" */
function formats(d) {
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  const day = d.getUTCDate();
  const iso = d.toISOString().slice(0, 10);
  return {
    short: `${day} ${monthsShort[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    long: `${day} ${monthsLong[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    iso,
    md: `${monthsLong[d.getUTCMonth()]} ${day}, ${d.getUTCFullYear()}`,
  };
}

/** Compact JS number literal, matching the style already in the page. */
function num(v) {
  return String(Number(v.toPrecision(8)));
}

async function main() {
  const res = await fetch(ENDPOINT, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`FX fetch failed: HTTP ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success' || !data.rates) throw new Error('FX payload missing rates');

  const html = fs.readFileSync(PAGE, 'utf8');

  // 1. Preserve the exact currency set + order already used by the page.
  // The list is `n=[["USD","..."],["EUR","..."],...],a={...}` — match up to `],a={`.
  const listMatch = html.match(/n=\[\[[\s\S]*?\]\],a=\{/);
  if (!listMatch) throw new Error('Could not locate the currency list (n=[[...]],a={)');
  const codes = [...listMatch[0].matchAll(/\["([A-Z]{3})"/g)].map(m => m[1]);
  if (!codes.length) throw new Error('No currency codes parsed');

  // 2. Rebuild the rate object in the same shape: var e={USD:1,EUR:.86671,...}
  const missing = [];
  const parts = ['USD:1'];
  for (const c of codes) {
    if (c === 'USD') continue;
    const v = data.rates[c];
    if (typeof v !== 'number') { missing.push(c); continue; }
    parts.push(`${c}:${num(v)}`);
  }
  const newRates = `var e={${parts.join(',')}}`;
  if (!/var e=\{[A-Z]{3}:1[,}]/.test(html)) throw new Error('Could not locate the rate object (var e={...})');
  let out = html.replace(/var e=\{[^}]*\}/, newRates);

  // 3. Rewrite every baked "last updated" string to today's data date.
  const d = new Date((data.time_last_update_unix || Math.floor(Date.now() / 1000)) * 1000);
  const f = formats(d);
  const swaps = [
    [OLD.short, f.short],
    [OLD.long, f.long],
    [OLD.iso, f.iso],
    [OLD.md, f.md],
  ];
  let applied = 0;
  for (const [from, to] of swaps) {
    if (out.includes(from)) { out = out.split(from).join(to); applied++; }
  }

  const changed = out !== html;
  console.log(`FX source date : ${data.time_last_update_utc || f.iso}`);
  console.log(`currencies     : ${codes.length} (missing from feed: ${missing.length ? missing.join(',') : 'none'})`);
  console.log(`date strings   : ${applied}/${swaps.length} replaced -> ${f.short}`);
  console.log(`sample rates   : EUR=${data.rates.EUR} JPY=${data.rates.JPY} GBP=${data.rates.GBP}`);

  if (DRY) { console.log('\n--dry: no file written'); return; }
  if (!changed) { console.log('\nnothing to update'); return; }
  fs.writeFileSync(PAGE, out);
  console.log(`\nu00a0updated: ${path.relative(ROOT, PAGE)}`);
}

main().catch(e => { console.error('refresh failed:', e.message); process.exit(1); });
