#!/usr/bin/env node
/**
 * mQuickCalc regression suite — pure Node, zero dependencies.
 *
 *   node tools/test-regressions.mjs
 *
 * Runs each tool page's inline scripts inside a small DOM stub (no browser,
 * no npm install) and asserts the behaviour of the fixes applied on 2026-11-07.
 * Also compiles every inline script in the repo and verifies the cache-bust
 * hash of /js/site-core.js against the deployed HTML references.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITES = ['site-main', 'site-finance', 'site-health', 'site-insurance'];
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) { pass++; }
  else { fail++; failures.push(`${name}${detail ? ' :: ' + detail : ''}`); }
  console.log(`  ${cond ? '✓' : '✗'} ${name}${detail && !cond ? ' :: ' + detail : ''}`);
}
const R = rel => path.join(ROOT, rel);
const read = rel => fs.readFileSync(R(rel), 'utf8');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === '.git' || e.name === 'node_modules') continue; yield* walk(p); }
    else yield p;
  }
}
const allHtml = [...walk(path.join(ROOT, 'packages'))].filter(p => p.endsWith('.html'));
const relOf = abs => path.relative(ROOT, abs).replace(/\\/g, '/');

// ---------------------------------------------------------------- DOM stub
function makeEl(id, tag = 'DIV', value = '', type = '') {
  const classes = new Set();
  const el = {
    id, tagName: tag.toUpperCase(), value, textContent: '', innerHTML: '', checked: false,
    type, selectedIndex: 0, options: [], style: {}, dataset: {}, children: [], _h: {}, _attrs: {},
    classList: {
      add(c) { classes.add(c); }, remove(c) { classes.delete(c); },
      contains(c) { return classes.has(c); }, toggle(c) { classes.has(c) ? classes.delete(c) : classes.add(c); },
      get value() { return [...classes].join(' '); },
    },
    addEventListener(ev, fn) { (el._h[ev] ||= []).push(fn); },
    removeEventListener() {},
    setAttribute(k, v) { el._attrs[k] = v; }, getAttribute(k) { return el._attrs[k] ?? null; },
    appendChild(c) { el.children.push(c); return c; }, insertAdjacentHTML() {},
    querySelector() { return makeEl('qs'); }, querySelectorAll() { return []; },
    getElementsByTagName() { return []; },
    matches(sel) { return sel.split(',').some(s => s.trim().toUpperCase() === el.tagName); },
    closest() { return el; },
    focus() {}, blur() {}, remove() {}, reset() {}, click() { fire(el, 'click'); },
    dispatchEvent(ev) { fire(el, ev.type || 'input'); return true; },
  };
  Object.defineProperty(el, '_classes', { get: () => classes });
  return el;
}

function loadPage(rel, { withGuard = true } = {}) {
  const html = read(rel);
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]));
  const initial = new Map();   // id -> { tag, value, type, checked }
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    const id = (attrs.match(/\sid=["']([^"']+)["']/i) || [])[1];
    if (!id) continue;
    initial.set(id, {
      tag,
      value: (attrs.match(/\svalue=["']([^"']*)["']/i) || [])[1] ?? '',
      type: (attrs.match(/\stype=["']([^"']*)["']/i) || [])[1] ?? '',
      checked: /\bchecked\b/i.test(attrs),
    });
  }
  for (const m of html.matchAll(/<select\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi)) {
    const id = m[1];
    const opts = [...m[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map(o => ({
      v: (o[1].match(/\svalue=["']([^"']*)["']/i) || [])[1] ?? o[2].trim(),
      sel: /\bselected\b/i.test(o[1]),
    }));
    const chosen = opts.find(o => o.sel) || opts[0];
    if (chosen && initial.has(id)) initial.get(id).value = chosen.v;
  }

  const els = new Map();
  const docHandlers = {};
  const doc = {
    getElementById(id) {
      if (!ids.has(id)) return null;
      if (!els.has(id)) {
        const meta = initial.get(id) || {};
        const el = makeEl(id, meta.tag || 'div', meta.value ?? '', meta.type ?? '');
        el.checked = !!meta.checked;
        els.set(id, el);
      }
      return els.get(id);
    },
    querySelector(sel) {
      const id = (sel.match(/^#([\w-]+)$/) || [])[1];
      return id ? doc.getElementById(id) : null;   // .calc-card → null, like a page without that class
    },
    querySelectorAll(sel) {
      if (!/input/i.test(sel)) return [];
      return [...initial.entries()].filter(([, v]) => v.tag === 'input').map(([id]) => doc.getElementById(id)).filter(Boolean);
    },
    getElementsByTagName(tag) {
      return tag.toLowerCase() === 'input'
        ? [...initial.entries()].filter(([, v]) => v.tag === 'input').map(([id]) => doc.getElementById(id)).filter(Boolean)
        : [];
    },
    createElement() { return makeEl('created'); }, createTextNode() { return makeEl('text'); },
    addEventListener(ev, fn) { (docHandlers[ev] ||= []).push(fn); },
    head: { appendChild() {} }, body: { appendChild() {} },
    documentElement: makeEl('html'), forms: [], readyState: 'complete',
  };

  const sandbox = {
    document: doc, console: { log() {}, warn() {}, error() {} },
    navigator: { userAgent: 'node', language: 'en-US', clipboard: { writeText: () => Promise.resolve() } },
    location: { href: 'https://example.com/', origin: 'https://example.com', pathname: '/', search: '', reload() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    setTimeout(fn) { try { fn(); } catch (_) {} return 1; }, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
    requestAnimationFrame(fn) { try { fn(); } catch (_) {} return 1; },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
    alert() {}, confirm: () => true, prompt: () => '', addEventListener() {},
    matchMedia: () => ({ matches: false, addListener() {} }),
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = (i * 37 + 11) & 255; return a; } },
    Event: class { constructor(t) { this.type = t; } preventDefault() {} },
    URL, URLSearchParams, Intl, Math, Date, JSON, Promise, Map, Set, WeakMap, Number, String, Array, Object, isFinite,
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);

  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(m => !/\bsrc\s*=/.test(m[1]) && !/application\/ld\+json/i.test(m[1]))
    .map(m => m[2].trim()).filter(Boolean);

  const errors = [];
  for (const code of scripts) {
    try { vm.runInContext(code, ctx, { timeout: 3000 }); }
    catch (e) { errors.push('LOAD: ' + e.message); }
  }
  // site-core.js is deferred, so its guard runs AFTER the inline page scripts
  if (withGuard) {
    const core = read('packages/site-finance/js/site-core.js');
    const marker = '/* Clearing a pre-filled calculator input';
    const guard = core.includes(marker) ? core.slice(core.indexOf(marker)) : '';
    if (guard) { try { vm.runInContext(guard, ctx, { timeout: 3000 }); } catch (e) { errors.push('GUARD: ' + e.message); } }
  }

  function fire(el, ev) {
    const evObj = { type: ev, target: el, currentTarget: el, preventDefault() {}, stopPropagation() {} };
    let err = null;
    for (const h of (el._h[ev] || [])) { try { h.call(el, evObj); } catch (e) { err = e; } }
    for (const h of (docHandlers[ev] || [])) { try { h.call(doc, evObj); } catch (e) { err = err || e; } }
    return err;
  }
  const g = id => doc.getElementById(id);
  const txt = id => { const e = g(id); return e ? String(e.textContent ?? e.innerHTML ?? e.value ?? '') : ''; };
  const shown = id => { const e = g(id); return !!e && e.classList.contains('show'); };

  return { html, doc, g, txt, shown, fire, errors, initial, docHandlers, els };
}

// ---------------------------------------------------------------- 1. syntax of every inline script
console.log('\n[1] Compile every inline script');
let compiled = 0, syntaxErrors = [];
for (const abs of allHtml) {
  const html = fs.readFileSync(abs, 'utf8');
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(m => !/\bsrc\s*=/.test(m[1]) && !/application\/ld\+json/i.test(m[1]))
    .map(m => m[2].trim()).filter(Boolean);
  for (const code of scripts) {
    compiled++;
    try { new vm.Script(code); } catch (e) { syntaxErrors.push(`${relOf(abs)}: ${e.message}`); }
  }
}
check(`${compiled} inline scripts compile cleanly`, syntaxErrors.length === 0, syntaxErrors.slice(0, 3).join(' | '));

// ---------------------------------------------------------------- 2. shopify
console.log('\n[2] shopify-fees-calculator');
{
  const rel = 'packages/site-finance/tools/shopify-fees-calculator.html';
  const p = loadPage(rel);
  check('no ratePct reference remains', !p.html.includes('ratePct'));
  check('page loads without error', p.errors.length === 0, p.errors.join(' | '));
  const rate0 = p.txt('rateVal'), fee0 = p.txt('feeVal');
  p.g('plan').value = 'advanced';
  const e1 = p.fire(p.g('plan'), 'change');
  check('plan change throws nothing', !e1, e1 ? e1.message : '');
  check('plan change recalculates effective rate', p.txt('rateVal') !== rate0, `${rate0} -> ${p.txt('rateVal')}`);
  check('plan change recalculates fee', p.txt('feeVal') !== fee0, `${fee0} -> ${p.txt('feeVal')}`);
  const rate1 = p.txt('rateVal');
  p.g('gateway').checked = true;
  const e2 = p.fire(p.g('gateway'), 'change');
  check('gateway change throws nothing', !e2, e2 ? e2.message : '');
  check('gateway change applies surcharge', p.txt('rateVal') !== rate1, `${rate1} -> ${p.txt('rateVal')}`);
  const feeBefore = p.txt('feeVal');
  p.g('sales').value = '9000';
  const e3 = p.fire(p.g('sales'), 'input');
  check('typing sales recalculates live', !e3 && p.txt('feeVal') !== feeBefore, `${feeBefore} -> ${p.txt('feeVal')}`);
}

// ---------------------------------------------------------------- 3. one-rep-max
console.log('\n[3] one-rep-max-calculator');
{
  const rel = 'packages/site-health/tools/one-rep-max-calculator.html';
  const p = loadPage(rel);
  check('page loads without error', p.errors.length === 0, p.errors.join(' | '));
  // weight=80, reps=8 -> Epley 80*(1+8/30)=101.33 ; Lander 80*1.0278^7=97.0
  check('headline value is Epley (101), not Lander (97)', p.txt('ormVal') === '101', `ormVal=${p.txt('ormVal')}`);
  check('Lander is shown in the secondary cell', p.txt('landerVal') === '97', `landerVal=${p.txt('landerVal')}`);
  check('Brzycki unchanged (2880/29 = 99)', p.txt('brzyckiVal') === '99', `brzyckiVal=${p.txt('brzyckiVal')}`);
  check('label names Lander in secondary cell', p.html.includes('Lander formula'));
  p.g('reps').value = '40'; p.fire(p.g('reps'), 'input');
  check('reps>=37 no longer produces Infinity', !p.txt('brzyckiVal').includes('Infinity'), p.txt('brzyckiVal'));
}

// ---------------------------------------------------------------- 4. pace
console.log('\n[4] pace-calculator');
{
  const rel = 'packages/site-health/tools/pace-calculator.html';
  const p = loadPage(rel);
  check('page loads without error', p.errors.length === 0, p.errors.join(' | '));
  p.g('mph').value = '10'; p.fire(p.g('mph'), 'input');
  check('mph=10 syncs mpm field to 6:00', p.g('mpm').value === '6:00', `mpm=${p.g('mpm').value}`);
  let bad = [];
  for (const mpm of ['4:30', '4:50', '5:00', '5:11', '5:31', '5:47', '8:30', '10:00']) {
    p.g('mpm').value = mpm; p.fire(p.g('mpm'), 'input');
    const out = p.txt('raceTimes');
    if (/:\d*60\b|\b60s\b/.test(out)) bad.push(mpm);
  }
  check('race times never contain a :60 / 60s field', bad.length === 0, bad.join(','));
}

// ---------------------------------------------------------------- 5. frequency
console.log('\n[5] frequency-converter');
{
  const rel = 'packages/site-main/tools/frequency-converter.html';
  const p = loadPage(rel);
  check('page loads without error', p.errors.length === 0, p.errors.join(' | '));
  const rows = p.g('rows') ? p.g('rows').innerHTML : '';
  const ghz = (rows.match(/Gigahertz \(GHz\)<\/td><td><strong>([^<]*)<\/strong>/) || [])[1];
  check('1 Hz in GHz is not displayed as 0', ghz && ghz !== '0', `GHz cell=${ghz}`);
  check('uses scientific notation for 1e-9', /e-9/i.test(ghz || ''), `GHz cell=${ghz}`);
}

// ---------------------------------------------------------------- 6. stale result guards
console.log('\n[6] empty-input guards');
{
  const t = loadPage('packages/site-health/tools/tdee-calculator.html');
  check('tdee loads without error', t.errors.length === 0, t.errors.join(' | '));
  check('tdee default BMR is realistic', Number(t.txt('bmrVal')) > 1000, `bmrVal=${t.txt('bmrVal')}`);
  t.g('weight').value = ''; t.fire(t.g('weight'), 'input');
  check('tdee hides result when weight cleared', !t.shown('result'), `bmrVal=${t.txt('bmrVal')}`);

  const i = loadPage('packages/site-health/tools/ideal-weight-calculator.html');
  i.g('height').value = '190'; i.fire(i.g('height'), 'input');
  const rangeBefore = i.txt('rangeVal');
  i.g('height').value = ''; i.fire(i.g('height'), 'input');
  check('ideal-weight hides stale range when height cleared', !i.shown('result'), `rangeVal=${i.txt('rangeVal')} (was ${rangeBefore})`);

  const c = loadPage('packages/site-health/tools/calorie-deficit-calculator.html');
  check('calorie-deficit loads without error', c.errors.length === 0, c.errors.join(' | '));
  c.g('target').value = '2100';
  c.g('goal').value = '0.5'; c.fire(c.g('goal'), 'input');
  check('preset goal never overwrites the target input', c.g('target').value === '2100', `target=${c.g('target').value}`);
  check('preset goal shows derived intake in results', c.g('stats').innerHTML.includes('Target intake'));
  c.g('goal').value = 'deficit'; c.g('tdee').value = '1800'; c.g('target').value = '1800'; c.fire(c.g('target'), 'input');
  check('zero deficit shows no Infinity weeks', !c.g('stats').innerHTML.includes('Infinity'), c.g('stats').innerHTML.slice(-160));
}

// ---------------------------------------------------------------- 7. realtime binding + global guard
console.log('\n[7] realtime binding & stale-result guard');
{
  const deadCalls = allHtml.filter(abs => fs.readFileSync(abs, 'utf8').includes('window.__bindRealtime')).length;
  check('no dead __bindRealtime calls remain', deadCalls === 0, `${deadCalls} pages still reference it`);
  const bound = allHtml.filter(abs => fs.readFileSync(abs, 'utf8').includes('"input,select,textarea"')).length;
  check('37 pages got a live input/change binding', bound === 37, `found ${bound}`);

  // a page that previously only had a Calculate button
  const rel = 'packages/site-finance/tools/amazon-fba-revenue-calculator.html';
  const p = loadPage(rel);
  const before = p.txt('profitVal');
  p.g('price').value = '99.99';
  const err = p.fire(p.g('price'), 'input');
  check('typing recalculates without clicking Calculate', !err && p.txt('profitVal') !== before, `${before} -> ${p.txt('profitVal')}`);
  p.g('price').value = ''; p.fire(p.g('price'), 'input');
  check('clearing a pre-filled input hides the result', !p.shown('result'));

  const cores = ['packages/brand-kit/js/site-core.js', ...SITES.map(s => `packages/${s}/js/site-core.js`)];
  check('all 5 site-core.js copies carry the guard', cores.every(f => read(f).includes('__mqcStaleGuard')));
}

// ---------------------------------------------------------------- 8. cache bust
console.log('\n[8] cache-bust integrity');
{
  const hashes = {};
  for (const s of SITES) hashes[s] = crypto.createHash('md5').update(read(`packages/${s}/js/site-core.js`)).digest('hex').slice(0, 8);
  const unique = [...new Set(Object.values(hashes))];
  check('4 deployed site-core.js copies are identical', unique.length === 1, JSON.stringify(hashes));
  const expected = unique[0];
  const stale = allHtml.filter(abs => /site-core\.js\?v=/.test(fs.readFileSync(abs, 'utf8')) &&
    !fs.readFileSync(abs, 'utf8').includes('site-core.js?v=' + expected));
  check('every HTML references the current site-core.js hash', stale.length === 0, `${stale.length} stale, expected ?v=${expected}`);
  const refs = allHtml.filter(abs => fs.readFileSync(abs, 'utf8').includes('site-core.js?v=')).length;
  // 2026-11-08 (C1): the hard-coded 227 was stale (228 linked pages today) and
  // failed the whole suite on every deploy. Replace it with an explicit
  // standalone-template allowlist: any NEW page that silently misses the shared
  // injection now fails CI, while adding an ordinary page never breaks the count.
  const STANDALONE = [
    'packages/site-finance/404.html',
    'packages/site-health/404.html',
    'packages/site-main/404.html',
    'packages/site-main/compare/index.html',
    'packages/site-main/compare/bmi-calculator/index.html',
    'packages/site-main/compare/percentage-calculator/index.html',
    'packages/site-main/compare/unit-converter/index.html',
  ];
  const noRef = allHtml.filter(abs => !/site-core\.js\?v=/.test(fs.readFileSync(abs, 'utf8'))).map(relOf);
  const unexpected = noRef.filter(p => !STANDALONE.includes(p));
  const missing = STANDALONE.filter(p => !noRef.includes(p));
  check('every HTML page is site-core-linked or an explicit standalone template',
    unexpected.length === 0 && missing.length === 0,
    `unexpected=${unexpected.join(',')} missing=${missing.join(',')}`);
  check('standalone templates all carry the inline /__uv beacon',
    STANDALONE.every(p => /\/__uv\?t=/.test(read(p))), `checked ${STANDALONE.length} pages`);
  check('site-core.js reference count stays at or above the audited baseline', refs >= 228, `found ${refs}`);
}

console.log(`\n${'='.repeat(56)}`);
console.log(`RESULT: ${pass} passed, ${fail} failed`);
if (fail) { failures.forEach(f => console.log('  FAIL ' + f)); process.exitCode = 1; }
