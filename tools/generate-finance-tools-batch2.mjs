/**
 * tools/generate-finance-tools-batch2.mjs
 * 第 2 批金融工具（+10 个）
 * 用法: node tools/generate-finance-tools-batch2.mjs --dry
 *       node tools/generate-finance-tools-batch2.mjs --apply
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

function m(n) { return '$' + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2}); }
function pct(n) { return (n*100).toFixed(2)+'%'; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

const TOOLS = [
  {
    slug:'profit-margin-calculator', name:'Profit Margin Calculator',
    title:'Profit Margin Calculator — Gross, Net & Operating Margin — Free Tool | finance.mquickcalc.com',
    desc:'Calculate gross margin, net margin, and operating margin. See exactly what percentage of revenue you keep. Free, no signup.',
    emoji:'📈',
    fields:[
      {l:'Revenue ($)',v:'50000',id:'revenue'},
      {l:'Costs ($)',v:'30000',id:'costs'},
    ],
    resultId:'marginVal', resultLabel:'Net Profit Margin', resultDim:'of revenue',
    extra:[
      {l:'Gross profit',id:'grossVal'},
      {l:'Markup %',id:'markupVal'},
    ],
    note:'Net margin is what you keep after all costs. Gross margin ignores operating expenses.',
    related:['markup-margin-calculator','break-even-calculator','sales-tax-calculator'],
    faqs:[
      {q:'What is a good profit margin?',a:'Gross margins vary by industry: SaaS businesses often achieve 70-80%, retailers 20-40%, restaurants 3-9%. Net margins are lower: healthy businesses target 10-20%. Compare yourself to industry averages, not absolute numbers.'},
      {q:'What is the difference between gross and net margin?',a:'Gross margin = (Revenue - COGS) / Revenue. It tells you how efficiently you produce. Net margin = (Revenue - ALL costs) / Revenue. It tells you how efficiently you run the business after everything.'},
    ],
    content:[{h:'Understanding profit margins',b:'Profit margins tell you how much of each dollar of revenue you keep. A 30% net margin means for every $1 you earn, you keep $0.30 after all costs. Margins are the most universal measure of business health.'}],
  },
  {
    slug:'depreciation-calculator', name:'Straight-Line Depreciation Calculator',
    title:'Straight-Line Depreciation Calculator — Asset Value Over Time — Free Tool | finance.mquickcalc.com',
    desc:'Calculate straight-line depreciation of any asset. See annual depreciation and book value each year. Free, no signup.',
    emoji:'🏭',
    fields:[
      {l:'Purchase price ($)',v:'50000',id:'cost'},
      {l:'Salvage value ($)',v:'5000',id:'salvage'},
      {l:'Useful life (years)',v:'7',id:'years'},
    ],
    resultId:'deprVal', resultLabel:'Annual Depreciation', resultDim:'per year',
    extra:[
      {l:'Total depreciable amount',id:'totalVal'},
      {l:'Book value end of year 1',id:'bv1Val'},
    ],
    note:'Year 1 book value = purchase price minus first year depreciation.',
    related:['npv-calculator','loan-amortization-calculator','compound-interest-calculator'],
    faqs:[
      {q:'What is straight-line depreciation?',a:'The simplest depreciation method: subtract salvage value from cost, then divide by useful life. The same amount is deducted each year. Used for tax and accounting purposes for most tangible assets.'},
      {q:'What is salvage value?',a:'The estimated value of an asset at the end of its useful life — what you could sell it for. It is subtracted from the purchase price before calculating depreciation, since the asset never depreciates below this floor.'},
    ],
    content:[{h:'When straight-line depreciation applies',b:'Straight-line is the most common depreciation method for financial reporting and taxes. Other methods (declining balance, sum-of-years digits) front-load depreciation but are more complex. GAAP and IRS both accept straight-line for most assets.'}],
  },
  {
    slug:'dividend-calculator', name:'Dividend Yield Calculator',
    title:'Dividend Yield Calculator — Stock Dividend Income — Free Tool | finance.mquickcalc.com',
    desc:'Calculate dividend yield and projected dividend income. Model your dividend portfolio growth over time. Free, no signup.',
    emoji:'📊',
    fields:[
      {l:'Share price ($)',v:'100',id:'price'},
      {l:'Annual dividend per share ($)',v:'3',id:'div'},
      {l:'Shares owned',v:'500',id:'shares'},
      {l:'Annual dividend growth (%)',v:'5',id:'growth'},
    ],
    resultId:'yieldVal', resultLabel:'Dividend Yield', resultDim:'per year',
    extra:[
      {l:'Annual dividend income',id:'incomeVal'},
      {l:'Yield on cost (if growth hits)',id:'yocVal'},
    ],
    note:'Yield on cost = dividend per share / your average cost basis × 100.',
    related:['compound-interest-calculator','irr-calculator','npv-calculator'],
    faqs:[
      {q:'What is a good dividend yield?',a:'The average S&P 500 yield is around 1.3-1.5%. A yield above 3% is generally considered attractive, above 6% requires careful scrutiny (it may signal a falling stock price). A dividend aristocrat (25+ years of consecutive increases) is a quality signal.'},
      {q:'What is yield on cost?',a:'Yield on cost = (current annual dividend per share) / (your cost basis per share). If you bought at $50 and the dividend grew from $1 to $2, your yield on cost is 4%, even if the current yield based on stock price is only 2%.'},
    ],
    content:[{h:'Dividends vs price appreciation',b:'Dividends are a tangible return of cash to shareholders — a company paying consistent dividends signals financial health and shareholder alignment. Studies show dividend growers and initiators outperform non-payers over long periods.'}],
  },
  {
    slug:'inflation-calculator', name:'Inflation Calculator',
    title:'Inflation Calculator — Purchasing Power Over Time — Free Tool | finance.mquickcalc.com',
    desc:'See how inflation erodes purchasing power. Calculate future prices and real returns adjusted for inflation. Free, no signup.',
    emoji:'📉',
    fields:[
      {l:'Current amount ($)',v:'100000',id:'amount'},
      {l:'Inflation rate (%)',v:'3.2',id:'rate'},
      {l:'Years',v:'20',id:'years'},
    ],
    resultId:'futureVal', resultLabel:'Future Price', resultDim:'in today\'s dollars',
    extra:[
      {l:'Purchasing power lost',id:'lostVal'},
      {l:'Real return needed to break even',id:'realVal'},
    ],
    note:'At 3% inflation, $100 in 20 years buys what $55 buys today.',
    related:['compound-interest-calculator','npv-calculator','savings-calculator'],
    faqs:[
      {q:'What is the average inflation rate?',a:'US long-run average is about 3.1% annually (CPI). In 2021-2023 it spiked to 7-9%. The Fed target is 2%. For long-term financial planning, 3% is a reasonable assumption.'},
      {q:'How does inflation affect investments?',a:'Cash loses purchasing power fastest. Stocks are the best inflation hedge because companies can raise prices with inflation. Bonds with fixed coupons lose real value. TIPS (Treasury Inflation-Protected Securities) directly adjust with CPI.'},
    ],
    content:[{h:'Why inflation matters for every financial decision',b:'Inflation is invisible in the short term but devastating over decades. At 3% inflation, prices double every 24 years. Planning for retirement or any long-term financial goal requires using real (inflation-adjusted) returns, not nominal ones.'}],
  },
  {
    slug:'present-value-calculator', name:'Present Value Calculator',
    title:'Present Value Calculator — Future Money in Today\'s Dollars — Free Tool | finance.mquickcalc.com',
    desc:'Calculate the present value of a future sum. See how much a future payment is worth today. Free, no signup.',
    emoji:'⏪',
    fields:[
      {l:'Future amount ($)',v:'100000',id:'future'},
      {l:'Discount rate (%)',v:'7',id:'rate'},
      {l:'Years from now',v:'10',id:'years'},
    ],
    resultId:'pvVal', resultLabel:'Present Value', resultDim:'today\'s dollars',
    extra:[
      {l:'Time to double (Rule of 72)',id:'doubleVal'},
      {l:'Equivalent annual payment',id:'annuityVal'},
    ],
    note:'PV tells you how much to invest today to reach a future goal at a given return rate.',
    related:['npv-calculator','compound-interest-calculator','irr-calculator'],
    faqs:[
      {q:'What is present value?',a:'Present value answers: "How much is $100 in 10 years worth today?" If your discount rate is 7%, the answer is $50.8 — meaning $50.8 invested today at 7% grows to $100 in 10 years.'},
      {q:'How do you choose the right discount rate?',a:'Use the return you could earn on a similar investment with similar risk. For safe investments, use current bond yields (3-5%). For risky investments, use your required return (10-15% or more).'},
    ],
    content:[{h:'The time value of money foundation',b:'Present value is the most fundamental concept in finance. All investment decisions, project valuations, and financial planning rely on discounting future cash flows to today\'s dollars. Master PV and you understand the logic behind NPV, IRR, and virtually all financial models.'}],
  },
  {
    slug:'cagr-calculator', name:'CAGR Calculator',
    title:'CAGR Calculator — Compound Annual Growth Rate — Free Tool | finance.mquickcalc.com',
    desc:'Calculate compound annual growth rate (CAGR). Measure investment or business growth rate over time. Free, no signup.',
    emoji:'📈',
    fields:[
      {l:'Starting value ($)',v:'10000',id:'start'},
      {l:'Ending value ($)',v:'25000',id:'end'},
      {l:'Number of years',v:'5',id:'years'},
    ],
    resultId:'cagrVal', resultLabel:'CAGR', resultDim:'per year',
    extra:[
      {l:'Total return',id:'returnVal'},
      {l:'Years to double at this rate',id:'doubleVal'},
    ],
    note:'CAGR smooths out volatility to give you the single constant rate that grew start to end.',
    related:['compound-interest-calculator','irr-calculator','present-value-calculator'],
    faqs:[
      {q:'What is CAGR used for?',a:'CAGR is used to compare investment managers, business revenue growth, portfolio performance, and any metric that starts at one value and ends at another over time. It is the standard growth rate metric in finance.'},
      {q:'What are the limitations of CAGR?',a:'CAGR hides volatility. A portfolio that went from $10K to $25K then back to $15K has the same CAGR as one that went steadily from $10K to $25K — but the paths are very different. Always look at total return alongside CAGR.'},
    ],
    content:[{h:'CAGR vs average annual return',b:'CAGR is not the same as simple average annual return. CAGR compounds the return, while simple average ignores compounding. A portfolio that returns 50% one year and loses 33% the next has a simple average of 8.5% but a CAGR of 0% — because $10K → $15K → $10K is neither a gain nor a loss.'}],
  },
  {
    slug:'markup-calculator', name:'Markup Calculator',
    title:'Markup Calculator — Set Prices with Desired Profit — Free Tool | finance.mquickcalc.com',
    desc:'Calculate the selling price given cost and target markup percentage. Know exactly what to charge. Free, no signup.',
    emoji:'💲',
    fields:[
      {l:'Cost ($)',v:'50',id:'cost'},
      {l:'Target markup (%)',v:'40',id:'markup'},
    ],
    resultId:'priceVal', resultLabel:'Selling Price', resultDim:'per unit',
    extra:[
      {l:'Gross profit per unit',id:'profitVal'},
      {l:'Gross margin %',id:'marginVal'},
    ],
    note:'Markup % is profit / cost. Margin % is profit / selling price. They are not the same.',
    related:['markup-margin-calculator','profit-margin-calculator','discount-calculator'],
    faqs:[
      {q:'Markup vs margin — what\'s the difference?',a:'Markup = profit / cost. If you buy for $50 and sell for $70, markup = $20/$50 = 40%. Margin = profit / selling price = $20/$70 = 28.6%. A 40% markup is a 28.6% margin. Always know which you are using when setting prices.'},
      {q:'What markup should I use?',a:'Markup varies by industry: grocers use 15-20%, restaurants 200-400%, software 80-100%, professional services 50-100%. The right markup covers your overhead and leaves a net margin of at least 10-20% after all costs.'},
    ],
    content:[{h:'How to set prices with markup',b:'Start from your cost, add target markup to cover overhead and profit. Compare your resulting margin to industry benchmarks to ensure your pricing is competitive and sustainable.'}],
  },
  {
    slug:'sales-tax-calculator', name:'Sales Tax Calculator',
    title:'Sales Tax Calculator — Add or Remove Tax from Price — Free Tool | finance.mquickcalc.com',
    desc:'Add sales tax to a price or calculate pre-tax amount from a tax-inclusive price. Supports any tax rate. Free, no signup.',
    emoji:'🧾',
    fields:[
      {l:'Pre-tax price ($)',v:'99.99',id:'pretax'},
      {l:'Sales tax rate (%)',v:'8.5',id:'rate'},
    ],
    resultId:'totalVal', resultLabel:'Total Price', resultDim:'including tax',
    extra:[
      {l:'Tax amount',id:'taxVal'},
      {l:'Pre-tax from total',id:'pretaxVal'},
    ],
    note:'For reverse calculation, enter the total price and any rate to find the pre-tax amount.',
    related:['discount-calculator','vat-calculator','markup-calculator'],
    faqs:[
      {q:'How do you calculate pre-tax price from total?',a:'Pre-tax = Total / (1 + tax_rate). For example, $108 total at 8% tax: $108 / 1.08 = $100 pre-tax. The tax amount is $108 - $100 = $8.'},
      {q:'Why does US sales tax vary so much?',a:'US has no federal sales tax. Each state sets its own rate (0-9.55%), and cities/counties add local taxes on top. As of 2024, combined state+local rates range from 0% (Oregon, Montana) to 9.55% (Louisiana). Always use the exact rate for the delivery location.'},
    ],
    content:[{h:'Sales tax vs VAT',b:'Sales tax is added at the point of sale to the final consumer price. VAT (used in most countries) is collected at every stage of production. Both result in the same final price, but the accounting and compliance requirements are very different.'}],
  },
  {
    slug:'tip-calculator', name:'Tip Calculator',
    title:'Tip Calculator — Calculate Tip and Split Bill — Free Tool | finance.mquickcalc.com',
    desc:'Calculate tip amount for any service. See tip per person and total per person when splitting the bill. Free, no signup.',
    emoji:'🍽️',
    fields:[
      {l:'Bill amount ($)',v:'85.50',id:'bill'},
      {l:'Tip percentage (%)',v:'20',id:'tip'},
      {l:'Number of people',v:'2',id:'people'},
    ],
    resultId:'tipAmtVal', resultLabel:'Tip Amount', resultDim:'total tip',
    extra:[
      {l:'Total with tip',id:'totalVal'},
      {l:'Per person',id:'perVal'},
    ],
    note:'15% is the US cultural baseline. 20% is standard for good service. 25% for exceptional.',
    related:['percentage-calculator','discount-calculator','sales-tax-calculator'],
    faqs:[
      {q:'What is the standard tip in the US?',a:'Restaurants: 15-20% (20% is now the norm for good service). Bartenders: $1-2/drink or 15-20% of tab. Hotels: $2-5/night for housekeeping, $1-2/bag for bellhops. Delivery: 15-20%. Hair salons: 15-25%.'},
      {q:'Should you tip on pre-tax or post-tax amount?',a:'Standard etiquette is to tip on the pre-tax total, since tax is not money the restaurant receives. However, most people calculate 20% on the total bill including tax as a quick approximation, which slightly over-tips.'},
    ],
    content:[{h:'How tipping culture works around the world',b:'Tipping expectations vary dramatically: in Japan and most of Europe, service staff are paid a living wage and tipping is unusual or even offensive. In the US, tipping subsidizes restaurant worker wages — a legacy of post-Prohibition labor practices. As minimum wages rise in some states, tipping norms are beginning to shift.'}],
  },
  {
    slug:'future-value-calculator', name:'Future Value Calculator',
    title:'Future Value Calculator — Investment Growth Projection — Free Tool | finance.mquickcalc.com',
    desc:'Calculate how much a current investment grows over time. See the power of compound growth. Free, no signup.',
    emoji:'⏩',
    fields:[
      {l:'Starting amount ($)',v:'10000',id:'start'},
      {l:'Monthly contribution ($)',v:'500',id:'monthly'},
      {l:'Annual return (%)',v:'8',id:'rate'},
      {l:'Years',v:'20',id:'years'},
    ],
    resultId:'fvVal', resultLabel:'Future Value', resultDim:'total portfolio',
    extra:[
      {l:'Total contributions',id:'contribVal'},
      {l:'Interest earned',id:'interestVal'},
    ],
    note:'Monthly contributions dramatically increase final value. $500/month at 8% for 20 years = $298K in contributions, $298K in interest.',
    related:['compound-interest-calculator','savings-calculator','CAGR-calculator'],
    faqs:[
      {q:'Why does compounding accelerate over time?',a:'Each year, you earn returns not just on your original investment but on all previous interest. This accelerates the growth curve exponentially. In year 1 at 8%, $10K earns $800. In year 20, it earns returns on ~$46K — producing $3,700 in that year alone.'},
      {q:'What rate of return should I use for estimates?',a:'Stock market (S&P 500) historical average is ~10% nominal, ~7% real (inflation-adjusted). Bond funds: use current yield (4-6%). Savings accounts: use current APY (3-5%). Never project returns above 10% for broad market index funds over long periods.'},
    ],
    content:[{h:'The eighth wonder of the world',b:'Einstein may or may not have called compound interest "the eighth wonder of the world," but the mathematics is real: small regular contributions and long time horizons produce extraordinary results. Start at 25 vs 35 vs 45 creates vastly different retirement outcomes.'}],
  },
];

function buildCalcCard(fields, resultId, resultLabel, resultDim, extra, note) {
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

function buildRelated(emoji, related) {
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
  return JSON.stringify({ '@context':'https://schema.org','@type':'FAQPage',
    mainEntity: faqs.map(f => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a }}))}, null, 0);
}

function buildJS(tool) {
  let calcBody, resetVals = {};
  tool.fields.forEach(f => resetVals[f.id] = f.v);

  if (tool.slug === 'profit-margin-calculator') {
    calcBody = `
    var rev = parseFloat(document.getElementById('revenue').value) || 0;
    var cost = parseFloat(document.getElementById('costs').value) || 0;
    var gross = rev - cost;
    var margin = rev > 0 ? gross / rev : 0;
    var markup = cost > 0 ? gross / cost : 0;
    document.getElementById('marginVal').textContent = pct(margin);
    document.getElementById('grossVal').textContent = m(gross);
    document.getElementById('markupVal').textContent = pct(markup);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'depreciation-calculator') {
    calcBody = `
    var cost = parseFloat(document.getElementById('cost').value) || 0;
    var salvage = parseFloat(document.getElementById('salvage').value) || 0;
    var years = parseInt(document.getElementById('years').value) || 1;
    var depreciable = cost - salvage;
    var annual = years > 0 ? depreciable / years : 0;
    var bv1 = cost - annual;
    document.getElementById('deprVal').textContent = m(annual);
    document.getElementById('totalVal').textContent = m(depreciable);
    document.getElementById('bv1Val').textContent = m(bv1);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'dividend-calculator') {
    calcBody = `
    var price = parseFloat(document.getElementById('price').value) || 1;
    var div = parseFloat(document.getElementById('div').value) || 0;
    var shares = parseFloat(document.getElementById('shares').value) || 0;
    var growth = (parseFloat(document.getElementById('growth').value) || 0) / 100;
    var yield_ = price > 0 ? div / price : 0;
    var income = div * shares;
    var yoc = income / (price * shares) * 100;
    document.getElementById('yieldVal').textContent = pct(yield_);
    document.getElementById('incomeVal').textContent = m(income);
    document.getElementById('yocVal').textContent = pct(yoc);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'inflation-calculator') {
    calcBody = `
    var amount = parseFloat(document.getElementById('amount').value) || 0;
    var rate = (parseFloat(document.getElementById('rate').value) || 0) / 100;
    var years = parseFloat(document.getElementById('years').value) || 0;
    var future = amount * Math.pow(1 + rate, years);
    var lost = future - amount;
    var realNeeded = rate > 0 ? (Math.pow(future / amount, 1/years) - 1) * 100 : 0;
    document.getElementById('futureVal').textContent = m(future);
    document.getElementById('lostVal').textContent = m(lost);
    document.getElementById('realVal').textContent = pct(realNeeded / 100);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'present-value-calculator') {
    calcBody = `
    var future = parseFloat(document.getElementById('future').value) || 0;
    var rate = (parseFloat(document.getElementById('rate').value) || 0) / 100;
    var years = parseFloat(document.getElementById('years').value) || 1;
    var pv = future / Math.pow(1 + rate, years);
    var doubleYears = rate > 0 ? 72 / (rate * 100) : 0;
    var annuity = pv * (rate * Math.pow(1+rate, years)) / (Math.pow(1+rate, years) - 1);
    document.getElementById('pvVal').textContent = m(pv);
    document.getElementById('doubleVal').textContent = doubleYears.toFixed(1) + ' yrs';
    document.getElementById('annuityVal').textContent = m(annuity);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'cagr-calculator') {
    calcBody = `
    var start = parseFloat(document.getElementById('start').value) || 1;
    var end = parseFloat(document.getElementById('end').value) || 1;
    var years = parseFloat(document.getElementById('years').value) || 1;
    var cagr = years > 0 ? Math.pow(end / start, 1 / years) - 1 : 0;
    var totalReturn = ((end - start) / start) * 100;
    var doubleYears = cagr > 0 ? 72 / (cagr * 100) : 0;
    document.getElementById('cagrVal').textContent = pct(cagr);
    document.getElementById('returnVal').textContent = pct(totalReturn / 100);
    document.getElementById('doubleVal').textContent = doubleYears.toFixed(1) + ' yrs';
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'markup-calculator') {
    calcBody = `
    var cost = parseFloat(document.getElementById('cost').value) || 0;
    var markup = (parseFloat(document.getElementById('markup').value) || 0) / 100;
    var price = cost * (1 + markup);
    var profit = price - cost;
    var margin = price > 0 ? profit / price : 0;
    document.getElementById('priceVal').textContent = m(price);
    document.getElementById('profitVal').textContent = m(profit);
    document.getElementById('marginVal').textContent = pct(margin);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'sales-tax-calculator') {
    calcBody = `
    var pretax = parseFloat(document.getElementById('pretax').value) || 0;
    var rate = (parseFloat(document.getElementById('rate').value) || 0) / 100;
    var tax = pretax * rate;
    var total = pretax + tax;
    var pretaxFromTotal = rate > 0 ? total / (1 + rate) : pretax;
    document.getElementById('totalVal').textContent = m(total);
    document.getElementById('taxVal').textContent = m(tax);
    document.getElementById('pretaxVal').textContent = m(pretaxFromTotal);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'tip-calculator') {
    calcBody = `
    var bill = parseFloat(document.getElementById('bill').value) || 0;
    var tip = (parseFloat(document.getElementById('tip').value) || 0) / 100;
    var people = parseInt(document.getElementById('people').value) || 1;
    var tipAmt = bill * tip;
    var total = bill + tipAmt;
    var per = people > 0 ? total / people : total;
    document.getElementById('tipAmtVal').textContent = m(tipAmt);
    document.getElementById('totalVal').textContent = m(total);
    document.getElementById('perVal').textContent = m(per);
    document.getElementById('result').classList.add('show');`;
  } else if (tool.slug === 'future-value-calculator') {
    calcBody = `
    var start = parseFloat(document.getElementById('start').value) || 0;
    var monthly = parseFloat(document.getElementById('monthly').value) || 0;
    var rate = (parseFloat(document.getElementById('rate').value) || 0) / 100 / 12;
    var years = parseInt(document.getElementById('years').value) || 0;
    var n = years * 12;
    var fvLump = start * Math.pow(1 + rate, n);
    var fvAnnuity = monthly > 0 && rate > 0 ? monthly * ((Math.pow(1 + rate, n) - 1) / rate) : 0;
    var fv = fvLump + fvAnnuity;
    var contrib = start + monthly * n;
    document.getElementById('fvVal').textContent = m(fv);
    document.getElementById('contribVal').textContent = m(contrib);
    document.getElementById('interestVal').textContent = m(fv - contrib);
    document.getElementById('result').classList.add('show');`;
  }

  const resetLines = Object.entries(resetVals).map(([id, v]) =>
    `document.getElementById('${id}').value = '${v}';`).join('\n    ');

  return `<script>
(function () {
  function m(n) { return '$' + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2}); }
  function pct(n) { return (n*100).toFixed(2)+'%'; }
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
  const relatedHtml = buildRelated(tool.emoji, tool.related);
  const faqHtml = buildFAQ(tool.faqs);
  const contentHtml = buildContent(tool.content);
  const jsonLd = buildJsonLd(tool.faqs);
  const inlineJS = buildJS(tool);
  const canonical = `https://finance.mquickcalc.com/tools/${tool.slug}`;

  let html = TEMPLATE;
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${esc(tool.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(tool.desc)}">`);
  html = html.replace(/<link rel="canonical"[^>]+href="[^"]*"/, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:title"[^>]+content="[^"]*"/, `<meta property="og:title" content="${esc(tool.title)}">`);
  html = html.replace(/<meta property="og:description"[^>]+content="[^"]*"/, `<meta property="og:description" content="${esc(tool.desc)}">`);
  html = html.replace(/<meta property="og:url"[^>]+content="[^"]*"/, `<meta property="og:url" content="${canonical}">`);
  html = html.replace(/<meta name="twitter:title"[^>]+content="[^"]*"/, `<meta name="twitter:title" content="${esc(tool.name)} | mQuickCalc Finance">`);
  html = html.replace(/<meta name="twitter:description"[^>]+content="[^"]*"/, `<meta name="twitter:description" content="${esc(tool.desc)}">`);
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?FAQPage[\s\S]*?<\/script>/,
    `  <script type="application/ld+json">${jsonLd}</script>`
  );
  const ccStart = html.indexOf('<div class="calc-card">');
  const ccEnd = html.indexOf('</div>\n\n    <div class="callout"');
  html = html.slice(0, ccStart) + calcCard + '\n\n    <div class="callout">\n      <p>' + esc(tool.note) + '</p>\n    </div>\n\n' + html.slice(ccEnd);
  const faqStart = html.indexOf('<div class="faq-cards">');
  const faqEnd = html.indexOf('\n    </div>\n\n    <footer');
  html = html.slice(0, faqStart) + '    <div class="faq-cards">\n' + faqHtml + '\n    </div>' + html.slice(faqEnd);
  const relStart = html.indexOf('<div class="tool-grid">');
  const relEnd = html.indexOf('\n      </div>\n\n    <footer');
  html = html.slice(0, relStart) + '      <div class="tool-grid">\n        ' + relatedHtml + '\n      </div>' + html.slice(relEnd);
  const cardStart = html.indexOf('<div class="content-card">');
  if (cardStart !== -1) {
    const cardEnd = html.indexOf('\n\n    <div class="faq-cards">');
    html = html.slice(0, cardStart) + contentHtml + html.slice(cardEnd);
  }
  const jsStart = html.lastIndexOf('<script>');
  const jsEnd = html.lastIndexOf('</script>') + 9;
  html = html.slice(0, jsStart) + '\n' + inlineJS + '\n' + html.slice(jsEnd);
  return html;
}

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
if (DRY) console.log(`   → node tools/generate-finance-tools-batch2.mjs --apply`);
