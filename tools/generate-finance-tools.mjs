/**
 * tools/generate-finance-tools.mjs
 * 批量生成金融类新工具页
 * 用法: node tools/generate-finance-tools.mjs --dry
 *       node tools/generate-finance-tools.mjs --apply
 */
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = fs.readFileSync(
  path.join(ROOT, 'packages', 'site-finance', 'tools', 'compound-interest-calculator.html'), 'utf8'
);
const DRY = !process.argv.includes('--apply');
const OUT = path.join(ROOT, 'packages', 'site-finance', 'tools');

function m(n) { return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function pct(n) { return (n*100).toFixed(2) + '%'; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── 新工具定义 ─────────────────────────────────────────
const TOOLS = [
  {
    slug:'npv-calculator', name:'NPV Calculator',
    title:'NPV Calculator — Net Present Value — Free Tool | finance.mquickcalc.com',
    desc:'Calculate net present value (NPV). Discount future cash flows to today\'s dollars. Free, no signup.',
    emoji:'📊',
    fields:[
      {l:'Initial investment ($)',v:'10000',id:'initial'},
      {l:'Discount rate (%)',v:'8',id:'rate'},
      {l:'Year 1 cash flow ($)',v:'3000',id:'cf1'},
      {l:'Year 2 cash flow ($)',v:'4000',id:'cf2'},
      {l:'Year 3 cash flow ($)',v:'5000',id:'cf3'},
    ],
    resultId:'npvVal', resultLabel:'Net Present Value', resultDim:'NPV',
    extra:[
      {l:'Total cash flows',id:'totalVal'},
      {l:'Years',id:'yearsVal'},
    ],
    note:'A positive NPV means the investment creates value. A negative NPV destroys it.',
    related:['compound-interest-calculator','savings-calculator','loan-calculator'],
    faqs:[
      {q:'What is NPV?',a:'Net Present Value discounts all future cash flows back to today using a discount rate. A positive NPV means the investment earns more than the required return.'},
      {q:'What discount rate should I use?',a:'Use your required rate of return — the minimum return you demand. For safe investments use 3-5%; for risky startup investments use 15-20% or higher.'},
      {q:'What are the limitations of NPV?',a:'NPV requires accurate cash flow estimates and an appropriate discount rate. It also ignores option value. Use it alongside scenario analysis for uncertain projects.'},
    ],
    content:[
      {h:'What is Net Present Value?',b:'NPV is the gold standard for investment valuation. It translates all future cash flows into today\'s dollars — the only fair basis for comparing investments of different sizes and time horizons.'},
    ],
  },
  {
    slug:'irr-calculator', name:'IRR Calculator',
    title:'IRR Calculator — Internal Rate of Return — Free Tool | finance.mquickcalc.com',
    desc:'Calculate internal rate of return (IRR) for any investment. Find the rate where NPV equals zero. Free, no signup.',
    emoji:'📈',
    fields:[
      {l:'Initial investment ($)',v:'10000',id:'initial'},
      {l:'Year 1 cash flow ($)',v:'3000',id:'cf1'},
      {l:'Year 2 cash flow ($)',v:'4000',id:'cf2'},
      {l:'Year 3 cash flow ($)',v:'5000',id:'cf3'},
    ],
    resultId:'irrVal', resultLabel:'Internal Rate of Return', resultDim:'IRR',
    extra:[
      {l:'NPV at 10%',id:'npvVal'},
      {l:'Years',id:'yearsVal'},
    ],
    note:'IRR is the annualized return that makes NPV equal zero.',
    related:['npv-calculator','compound-interest-calculator','savings-calculator'],
    faqs:[
      {q:'What is IRR?',a:'Internal Rate of Return is the annualized return that makes the NPV of all cash flows equal zero. A higher IRR than your required return means the investment is worth taking.'},
      {q:'What are the weaknesses of IRR?',a:'IRR can be misleading with unconventional cash flows. It also assumes all positive cash flows are reinvested at the IRR rate, which may not be realistic. Always compare IRR with NPV.'},
    ],
    content:[
      {h:'Understanding Internal Rate of Return',b:'IRR is the discount rate at which an investment breaks even in present value terms. Think of it as the interest rate you are earning on your money — a single percentage easy to compare across investments.'},
    ],
  },
  {
    slug:'loan-amortization-calculator', name:'Loan Amortization Calculator',
    title:'Loan Amortization Calculator — Monthly Payment Schedule — Free Tool | finance.mquickcalc.com',
    desc:'Generate a full loan amortization schedule. See monthly payment, principal vs interest split, total cost. Free, no signup.',
    emoji:'🏦',
    fields:[
      {l:'Loan amount ($)',v:'250000',id:'principal'},
      {l:'Annual interest rate (%)',v:'6.5',id:'rate'},
      {l:'Loan term (years)',v:'30',id:'years'},
    ],
    resultId:'paymentVal', resultLabel:'Monthly Payment', resultDim:'per month',
    extra:[
      {l:'Total interest',id:'totalInt'},
      {l:'Total paid',id:'totalPaid'},
    ],
    note:'Early payments go mostly to interest; later payments go mostly to principal.',
    related:['mortgage-calculator','auto-loan-calculator','compound-interest-calculator'],
    faqs:[
      {q:'What is loan amortization?',a:'Amortization pays off a loan through scheduled payments. Each payment covers interest plus principal reduction. Early on, most of each payment is interest. Over time the interest portion shrinks.'},
      {q:'Should I make extra payments?',a:'Making extra principal payments can dramatically reduce total interest. On a 30-year mortgage, one extra payment per year can cut 4-5 years and save tens of thousands in interest.'},
    ],
    content:[
      {h:'How loan amortization works',b:'Each monthly payment splits between interest and principal. The proportion shifts over time: early payments are mostly interest, late payments are mostly principal. Understanding this split helps you decide whether to pay extra.'},
    ],
  },
  {
    slug:'annuity-payout-calculator', name:'Annuity Payout Calculator',
    title:'Annuity Payout Calculator — Monthly Payout — Free Tool | finance.mquickcalc.com',
    desc:'Calculate how much a fixed annuity pays per month. See annual payout, total received, and interest earned. Free, no signup.',
    emoji:'💵',
    fields:[
      {l:'Annuity balance ($)',v:'100000',id:'balance'},
      {l:'Annual return rate (%)',v:'5',id:'rate'},
      {l:'Payout years',v:'20',id:'years'},
    ],
    resultId:'payoutVal', resultLabel:'Monthly Payout', resultDim:'per month',
    extra:[
      {l:'Total received',id:'totalVal'},
      {l:'Interest earned',id:'interestVal'},
    ],
    note:'The older you are, the higher the payout rate insurers typically offer.',
    related:['compound-interest-calculator','savings-calculator'],
    faqs:[
      {q:'What is an annuity?',a:'An annuity converts a lump sum into a stream of regular payments. Immediate annuities start right away; deferred annuities accumulate first, then pay out later.'},
      {q:'What affects the payout rate?',a:'Your age, the annuity balance, and the payout term are the three main factors. Current interest rates also affect payout rates as insurers invest your money to fund future payments.'},
    ],
    content:[
      {h:'Annuity payout basics',b:'Annuities convert a lump sum into guaranteed income. Unlike portfolio withdrawals, annuity payments are guaranteed regardless of market conditions. The monthly payout depends on balance, term, and the insurer\'s assumptions.'},
    ],
  },
  {
    slug:'effective-annual-rate-calculator', name:'Effective Annual Rate Calculator',
    title:'Effective Annual Rate (EAR) Calculator — Free Tool | finance.mquickcalc.com',
    desc:'Convert any nominal interest rate to effective annual rate (EAR). Compare loans and investments accurately. Free, no signup.',
    emoji:'📊',
    fields:[
      {l:'Nominal rate (%)',v:'12',id:'nominal'},
      {l:'Compounding per year',v:'12',id:'freq'},
    ],
    resultId:'earVal', resultLabel:'Effective Annual Rate', resultDim:'per year',
    extra:[
      {l:'Daily rate',id:'dailyVal'},
      {l:'Monthly rate',id:'monthlyVal'},
    ],
    note:'EAR always >= nominal rate. More frequent compounding means larger EAR.',
    related:['compound-interest-calculator','loan-calculator','savings-calculator'],
    faqs:[
      {q:'Why does EAR matter?',a:'When comparing financial products, always use EAR — not the nominal rate. A credit card at 12% APR compounded daily has EAR of 12.7%, not 12%. The difference compounds into real dollars over time.'},
      {q:'What is the formula for EAR?',a:'EAR = (1 + nominal_rate / compounding_periods)^compounding_periods - 1. For credit cards with daily compounding: EAR = (1 + APR/365)^365 - 1.'},
    ],
    content:[
      {h:'EAR vs nominal rate',b:'The nominal rate is the stated rate. EAR is the true annual rate after within-year compounding. Always compare EAR when evaluating any financial product — the nominal rate can be misleading.'},
    ],
  },
];

// ── 工具页生成器 ───────────────────────────────────────
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

function buildCalcCard(fields, resultId, resultLabel, resultDim, extra, note) {
  // fields 最多 3 个一行
  const rows = [];
  for (let i = 0; i < fields.length; i += 3) {
    const row = fields.slice(i, i + 3);
    if (row.length > 1) {
      rows.push('      <div class="row">');
      row.forEach(f => rows.push(`        <div class="field">
          <label for="${f.id}">${esc(f.l)}</label>
          <input id="${f.id}" class="input" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(f.v)}">
        </div>`));
      rows.push('      </div>');
    } else {
      rows.push(`      <label for="${row[0].id}">${esc(row[0].l)}</label>
      <input id="${row[0].id}" class="input" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(row[0].v)}">`);
    }
  }

  const extraCells = extra.map(e => `<div class="cell"><div class="lbl">${esc(e.l)}</div><div class="val" id="${e.id}">—</div></div>`).join('\n          ');

  return `<div class="calc-card">
${rows.join('\n')}

      <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">
        <button id="calcBtn" class="btn">Calculate</button>
        <button id="resetBtn" class="btn ghost">Reset</button>
      </div>

      <div id="result" class="result">
        <div class="big" id="${resultId}">$0.00</div>
        <div class="dim">${esc(resultDim)}</div>
        <div class="grid">
          <div class="cell"><div class="lbl">${esc(resultLabel)}</div><div class="val" id="${resultId}">—</div></div>
          ${extraCells}
        </div>
        <p class="note" style="margin-top:12px;">${esc(note)}</p>
      </div>
    </div>`;
}

function buildFAQ(faqs) {
  return faqs.map(f => `    <details class="faq-card">
      <summary class="faq-summary">
        <span class="faq-q-text">${esc(f.q)}</span>
        <span class="faq-arrow">▼</span>
      </summary>
      <div class="faq-body"><p>${esc(f.a)}</p></div>
    </details>`).join('\n');
}

function buildRelated(slug, emoji, related) {
  const names = related.map(r => r.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' '));
  return related.map((r, i) =>
    `<a href="/tools/${r}" class="tool-card"><div class="icon-row"><span class="emoji">${emoji}</span><div class="tc-title">${esc(names[i])}</div></div></a>`
  ).join('\n        ');
}

function buildContent(cards) {
  return cards.map(c => `    <div class="content-card">
      <h2>${esc(c.h)}</h2>
      <p>${esc(c.b)}</p>
    </div>`).join('\n');
}

function buildJsonLd(faqs) {
  return JSON.stringify({
    '@context':'https://schema.org',
    '@type':'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type':'Question', name: f.q,
      acceptedAnswer: { '@type':'Answer', text: f.a },
    })),
  }, null, 0);
}

function buildJS(tool) {
  const fieldMap = {};
  tool.fields.forEach(f => fieldMap[f.id] = f.v);

  let calcBody, resetVals;
  if (tool.slug === 'npv-calculator') {
    calcBody = `
    var initial = parseFloat(document.getElementById('initial').value) || 0;
    var rate = (parseFloat(document.getElementById('rate').value) || 0) / 100;
    var cfs = ['cf1','cf2','cf3'].map(function(id) { return parseFloat(document.getElementById(id).value) || 0; });
    var npv = -initial;
    cfs.forEach(function(cf, i) { npv += cf / Math.pow(1 + rate, i + 1); });
    var total = cfs.reduce(function(a, b) { return a + b; }, 0);
    document.getElementById('npvVal').textContent = m(npv);
    document.getElementById('totalVal').textContent = m(total);
    document.getElementById('yearsVal').textContent = cfs.length;
    document.getElementById('result').classList.add('show');`;
    resetVals = { initial:'10000', rate:'8', cf1:'3000', cf2:'4000', cf3:'5000' };
  } else if (tool.slug === 'irr-calculator') {
    calcBody = `
    var initial = parseFloat(document.getElementById('initial').value) || 0;
    var cfs = ['cf1','cf2','cf3'].map(function(id) { return parseFloat(document.getElementById(id).value) || 0; });
    var low = -0.99, high = 10, irr = 0;
    for (var iter = 0; iter < 200; iter++) {
      var mid = (low + high) / 2;
      var npv = -initial;
      cfs.forEach(function(cf, i) { npv += cf / Math.pow(1 + mid, i + 1); });
      if (Math.abs(npv) < 0.01) { irr = mid; break; }
      if (npv > 0) low = mid; else high = mid;
      irr = mid;
    }
    var npv10 = -initial;
    cfs.forEach(function(cf, i) { npv10 += cf / Math.pow(1.10, i + 1); });
    document.getElementById('irrVal').textContent = pct(irr);
    document.getElementById('npvVal').textContent = m(npv10);
    document.getElementById('yearsVal').textContent = cfs.length;
    document.getElementById('result').classList.add('show');`;
    resetVals = { initial:'10000', cf1:'3000', cf2:'4000', cf3:'5000' };
  } else if (tool.slug === 'loan-amortization-calculator') {
    calcBody = `
    var P = parseFloat(document.getElementById('principal').value) || 0;
    var r = (parseFloat(document.getElementById('rate').value) || 0) / 100 / 12;
    var n = (parseFloat(document.getElementById('years').value) || 0) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return;
    var payment = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
    document.getElementById('paymentVal').textContent = m(payment);
    document.getElementById('totalInt').textContent = m(payment * n - P);
    document.getElementById('totalPaid').textContent = m(payment * n);
    document.getElementById('result').classList.add('show');`;
    resetVals = { principal:'250000', rate:'6.5', years:'30' };
  } else if (tool.slug === 'annuity-payout-calculator') {
    calcBody = `
    var B = parseFloat(document.getElementById('balance').value) || 0;
    var r = (parseFloat(document.getElementById('rate').value) || 0) / 100 / 12;
    var n = (parseFloat(document.getElementById('years').value) || 0) * 12;
    if (B <= 0 || r <= 0 || n <= 0) return;
    var payout = B * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
    var total = payout * n;
    document.getElementById('payoutVal').textContent = m(payout);
    document.getElementById('totalVal').textContent = m(total);
    document.getElementById('interestVal').textContent = m(total - B);
    document.getElementById('result').classList.add('show');`;
    resetVals = { balance:'100000', rate:'5', years:'20' };
  } else if (tool.slug === 'effective-annual-rate-calculator') {
    calcBody = `
    var nominal = (parseFloat(document.getElementById('nominal').value) || 0) / 100;
    var n = parseInt(document.getElementById('freq').value) || 12;
    var ear = Math.pow(1 + nominal / n, n) - 1;
    document.getElementById('earVal').textContent = pct(ear);
    document.getElementById('dailyVal').textContent = pct(nominal / 365);
    document.getElementById('monthlyVal').textContent = pct(nominal / 12);
    document.getElementById('result').classList.add('show');`;
    resetVals = { nominal:'12', freq:'12' };
  }

  const resetLines = Object.entries(resetVals).map(([id, v]) =>
    `document.getElementById('${id}').value = '${v}';`
  ).join('\n    ');

  return `<script>
(function () {
  function m(n) { return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  function pct(n) { return (n * 100).toFixed(2) + '%'; }
  function calc() {${calcBody}
  }
  document.getElementById('calcBtn').addEventListener('click', calc);
  document.getElementById('resetBtn').addEventListener('click', function () {
    ${resetLines}
    calc();
  });
  calc();
  window.__bindRealtime && window.__bindRealtime(document.getElementById('calc-card'), calc);
})();
</script>`;
}

function generate(tool) {
  const calcCard = buildCalcCard(tool.fields, tool.resultId, tool.resultLabel, tool.resultDim, tool.extra, tool.note);
  const relatedHtml = buildRelated(tool.slug, tool.emoji, tool.related);
  const faqHtml = buildFAQ(tool.faqs);
  const contentHtml = buildContent(tool.content);
  const jsonLd = buildJsonLd(tool.faqs);
  const inlineJS = buildJS(tool);

  let html = TEMPLATE;
  // 替换 meta
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${esc(tool.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(tool.desc)}">`);
  html = html.replace(/<link rel="canonical"[^>]+href="[^"]*"/, `<link rel="canonical" href="https://finance.mquickcalc.com/tools/${tool.slug}">`);
  html = html.replace(/<meta property="og:title"[^>]+content="[^"]*"/, `<meta property="og:title" content="${esc(tool.title)}">`);
  html = html.replace(/<meta property="og:description"[^>]+content="[^"]*"/, `<meta property="og:description" content="${esc(tool.desc)}">`);
  html = html.replace(/<meta property="og:url"[^>]+content="[^"]*"/, `<meta property="og:url" content="https://finance.mquickcalc.com/tools/${tool.slug}">`);
  html = html.replace(/<meta name="twitter:title"[^>]+content="[^"]*"/, `<meta name="twitter:title" content="${esc(tool.name)} | mQuickCalc Finance">`);
  html = html.replace(/<meta name="twitter:description"[^>]+content="[^"]*"/, `<meta name="twitter:description" content="${esc(tool.desc)}">`);

  // 替换 FAQ JSON-LD
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?FAQPage[\s\S]*?<\/script>/,
    `  <script type="application/ld+json">${jsonLd}</script>`
  );

  // 替换 calc-card
  const ccStart = html.indexOf('<div class="calc-card">');
  const ccEnd = html.indexOf('</div>\n\n    <div class="callout"');
  html = html.slice(0, ccStart) + calcCard + '\n\n    <div class="callout">\n      <p>' + esc(tool.note) + '</p>\n    </div>\n\n' + html.slice(ccEnd);

  // 替换 FAQ cards
  const faqStart = html.indexOf('<div class="faq-cards">');
  const faqEnd = html.indexOf('\n    </div>\n\n    <footer');
  html = html.slice(0, faqStart) + '    <div class="faq-cards">\n' + faqHtml + '\n    </div>' + html.slice(faqEnd);

  // 替换 related
  const relStart = html.indexOf('<div class="tool-grid">');
  const relEnd = html.indexOf('\n      </div>\n\n    <footer');
  html = html.slice(0, relStart) + '      <div class="tool-grid">\n        ' + relatedHtml + '\n      </div>' + html.slice(relEnd);

  // 替换 content-card
  const cardStart = html.indexOf('<div class="content-card">');
  if (cardStart !== -1) {
    const cardEnd = html.indexOf('\n\n    <div class="faq-cards">');
    const newContent = contentHtml;
    html = html.slice(0, cardStart) + newContent + html.slice(cardEnd);
  }

  // 替换 inline JS
  const jsStart = html.lastIndexOf('<script>');
  const jsEnd = html.lastIndexOf('</script>') + 9;
  html = html.slice(0, jsStart) + '\n' + inlineJS + '\n' + html.slice(jsEnd);

  return html;
}

// ── 主循环 ──────────────────────────────────────────────
let created = 0, skipped = 0;
for (const tool of TOOLS) {
  const fp = path.join(OUT, tool.slug + '.html');
  if (fs.existsSync(fp)) {
    console.log(`  ⏭  ${tool.slug} — already exists`);
    skipped++;
    continue;
  }
  const html = generate(tool);
  if (!DRY) fs.writeFileSync(fp, html, 'utf8');
  created++;
  console.log(`  ${DRY ? '🔍' : '✅'} ${tool.slug} — ${tool.name}`);
}
console.log(`\n${'─'.repeat(50)}`);
console.log(`${DRY ? '🔍 DRY RUN' : '✅ DONE'}: ${created} created, ${skipped} skipped`);
if (DRY) console.log(`   → node tools/generate-finance-tools.mjs --apply`);
