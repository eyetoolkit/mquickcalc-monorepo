/**
 * tools/generate-main-tools-batch3.mjs
 * 第 3 批 site-main 日常工具（+16 个）
 * 用法: node tools/generate-main-tools-batch3.mjs --dry
 *       node tools/generate-main-tools-batch3.mjs --apply
 *       node tools/generate-main-tools-batch3.mjs --fix-calc --dry
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = fs.readFileSync(
  path.join(ROOT, 'packages/site-main/tools/percentage-calculator.html'), 'utf8'
);
const DRY = !process.argv.includes('--apply');
const OUT = path.join(ROOT, 'packages/site-main/tools');

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const TOOLS = [
  {
    slug:'hourly-wage-calculator', name:'Hourly Wage Calculator',
    title:'Hourly Wage Calculator — Annual, Monthly & Daily Salary | mQuickCalc',
    desc:'Convert hourly wage to annual, monthly, biweekly, weekly, and daily salary. Includes overtime and part-time estimates. Free, no signup.',
    inputs:[
      {id:'hourly', label:'Hourly wage ($)', value:'25', type:'number'},
      {id:'hours', label:'Hours per week', value:'40', type:'number'},
      {id:'weeks', label:'Weeks per year', value:'52', type:'number'},
    ],
    resultId:'annualVal', resultDim:'Annual gross salary',
    extra:[{id:'monthlyVal', lbl:'Monthly'}, {id:'biweeklyVal', lbl:'Biweekly'}, {id:'weeklyVal', lbl:'Weekly gross'}],
    note:'Actual take-home pay is lower after taxes.',
    related:['percentage-calculator','tip-calculator'],
    faqs:[
      {q:'How accurate is this for part-time work?',a:'Adjust Hours per week to your actual schedule. A 20-hour week at $30/hr = $31,200/year gross. The calculator ignores taxes and benefits.'},
      {q:'What about overtime?',a:'Overtime in the US is 1.5× regular rate for hours over 40/week. Calculate regular pay on 40 hrs and overtime separately.'},
    ],
    content:[
      {h:'How to compare job offers fairly',b:'When comparing offers, always compare total compensation — benefits, paid time off, and overtime likelihood. A $25/hr job with no overtime beats $30/hr where overtime is unpaid if you regularly work 50 hours.'},
    ],
  },
  {
    slug:'workday-calculator', name:'Workday Calculator',
    title:'Workday Calculator — Add or Subtract Business Days | mQuickCalc',
    desc:'Add or subtract working days from any date. Excludes weekends automatically. Free, no signup.',
    inputs:[
      {id:'startDate', label:'Start date', value:'2026-09-18', type:'date'},
      {id:'workdays', label:'Add/subtract days', value:'10', type:'number'},
      {id:'holidays', label:'Also subtract holidays (US)', value:'0', type:'number'},
    ],
    resultId:'resultDate', resultDim:'result date (business days',
    extra:[{id:'calDaysVal', lbl:'Calendar days span'},{id:'weeksVal', lbl:'Work weeks'}],
    note:'Workdays exclude Saturday and Sunday. Add holiday count manually.',
    related:['date-difference-calculator'],
    faqs:[
      {q:'How are holidays handled?',a:'US federal holidays are not auto-excluded — add the number of holidays manually for accuracy. Standard year has 11 federal holidays.'},
      {q:'What are business days?',a:'Business days are Monday-Friday. The number varies from 260-262 per year depending on weekend falls.'},
    ],
    content:[{h:'Why project managers use workday calculators',b:'When a client says "10 business days," add weekends automatically — landing on a weekday, not a weekend. Deadlines missable without calculation.'}],
  },
  {
    slug:'percentage-change-calculator', name:'Percentage Change Calculator',
    title:'Percentage Change Calculator — % Increase or Decrease | mQuickCalc',
    desc:'Calculate percentage change between two values. Works for price drops, growth rates, and comparisons. Free, no signup.',
    inputs:[
      {id:'a', label:'Original value ($)', value:'80', type:'number'},
      {id:'b', label:'New value ($)', value:'120', type:'number'},
    ],
    resultId:'pctVal', resultDim:'% change (increase or decrease',
    extra:[{id:'absVal', lbl:'Absolute change'},{id:'ratioVal', lbl:'Change ratio'}],
    note:'Formula: (new - old) / old × 100. Positive = increase.',
    related:['percentage-calculator','discount-calculator'],
    faqs:[
      {q:'What if the original is zero?',a:'Dividing by zero is undefined. If the original is $0, percentage change is N/A. Use absolute change instead.'},
      {q:'% change vs % difference?',a:'% change compares before and after. % difference uses the average. Use % change when there is a clear before/after.'},
    ],
    content:[{h:'Using % change in daily life',b:'Stock prices, grocery costs, wage increases — percentage change normalizes comparisons across different scales.'}],
  },
  {
    slug:'square-footage-calculator', name:'Square Footage Calculator',
    title:'Square Footage Calculator — Room & House Area | mQuickCalc',
    desc:'Calculate total square footage from room dimensions. Handles multiple rooms. Free, no signup.',
    inputs:[
      {id:'length', label:'Length (ft)', value:'12', type:'number'},
      {id:'width', label:'Width (ft)', value:'10', type:'number'},
      {id:'rooms', label:'Number of rooms', value:'1', type:'number'},
    ],
    resultId:'sqftVal', resultDim:'total sq ft',
    extra:[{id:'perRoomVal', lbl:'Per room'},{id:'sqmVal', lbl:'Sq meters'}],
    note:'1 sq ft = 0.0929 sq meters. US real estate uses sq ft; most of the world uses sq meters.',
    related:['area-converter','percentage-calculator'],
    faqs:[
      {q:'How to calculate irregular rooms?',a:'Divide irregular rooms into rectangles, calculate each separately, then add the areas. L-shape: Area = (A×B) + (C×D) for each rectangle.'},
      {q:'Liveable vs total area?',a:'Liveable area excludes garages and basements. Appraisers use liveable. Always check which definition applies.'},
    ],
    content:[{h:'Why sq ft matters for pricing',b:'Rent and property tax are often quoted per sq ft. A $500K home at 2,000 sq ft = $250/sq ft. At 2,500 sq ft = $200/sq ft.'}],
  },
  {
    slug:'liters-to-gallons', name:'Liters to Gallons Calculator',
    title:'Liters to Gallons — Volume Conversion | mQuickCalc',
    desc:'Convert liters to US or UK gallons. Quick and accurate. Free, no signup.',
    inputs:[
      {id:'liters', label:'Liters', value:'10', type:'number'},
    ],
    resultId:'galVal', resultDim:'US gallons',
    extra:[{id:'ukGalVal', lbl:'UK gallons'},{id:'mlVal', lbl:'Milliliters'}],
    note:'1 US gal = 3.785 L. 1 UK gal = 4.546 L. Most countries use metric liters.',
    related:['volume-converter'],
    faqs:[
      {q:'US vs UK gallons?',a:'The UK gallon is 20% larger than US. A 10L bottle of water is 2.64 US gal but 2.20 UK gal. Most countries use liters as the standard volume unit.'},
    ],
    content:[{h:'Where liters matter',b:'Grocery, fuel, engine displacement, swimming pools — liters are the global standard for volume.'}],
  },
  {
    slug:'gpa-calculator', name:'GPA Calculator',
    title:'GPA Calculator — Semester & Cumulative Grade Point Average | mQuickCalc',
    desc:'Calculate GPA from grades and credit hours. See semester and cumulative GPA. Free, no signup.',
    inputs:[
      {id:'grade', label:'Grade (0–100)', value:'85', type:'number'},
      {id:'credits', label:'Credit hours', value:'3', type:'number'},
    ],
    resultId:'gpaVal', resultDim:'grade points for this course',
    extra:[{id:'letterVal', lbl:'Letter grade'},{id:'ptsVal', lbl:'Grade points earned'}],
    note:'A=4.0 B=3.0 C=2.0 D=1.0 F=0.0. Add courses to see cumulative GPA.',
    related:['percentage-calculator'],
    faqs:[
      {q:'How is GPA calculated?',a:'Grade points × credit hours, sum all, divide by total credits. Example: (3.0×3 + 4.0×4)/7 = 3.57.'},
      {q:'What is a good GPA?',a:'3.5+ is Dean\'s List. 3.0+ is above average. Below 2.0 may risk scholarships. For grad school aim 3.5+.'},
    ],
    content:[{h:'Why GPA matters beyond college',a:'Graduate schools and some employers request transcripts. High GPA shows consistency.'}],
  },
  {
    slug:'sleep-debt-calculator', name:'Sleep Debt Calculator',
    title:'Sleep Debt Calculator — Weekly Sleep Deficit | mQuickCalc',
    desc:'Calculate your weekly sleep debt. See how much you are short and recovery time. Free, no signup.',
    inputs:[
      {id:'target', label:'Target sleep per night (hrs)', value:'8', type:'number'},
      {id:'actual', label:'Actual sleep last 7 days (hrs total)', value:'45', type:'number'},
    ],
    resultId:'debtVal', resultDim:'hours short this week',
    extra:[{id:'perNightVal', lbl:'Per night short'},{id:'recoveryVal', lbl:'Nights to recover (1hr/night'}],
    note:'Adults need 7-9 hours. Sleeping 6 instead of 8 = 14 hrs debt per week.',
    related:['bmi-calculator'],
    faqs:[
      {q:'Is sleep debt real?',a:'Yes. Studies show cognitive impairment equivalent to 24hrs no sleep after 16-20hrs debt.'},
    ],
    content:[{h:'The biology of sleep debt',b:'Sleep is not discretionary. Each borrowed hour reduces performance the next day.'}],
  },
  {
    slug:'countdown-calculator', name:'Countdown Calculator',
    title:'Countdown Calculator — Days Until Any Date | mQuickCalc',
    desc:'See exactly how many days, weeks, months until any future date. Free, no signup.',
    inputs:[
      {id:'target', label:'Target date', value:'2027-01-01', type:'date'},
      {id:'start', label:'Starting date', value:'2026-09-18', type:'date'},
    ],
    resultId:'daysVal', resultDim:'days between dates',
    extra:[{id:'weeksVal', lbl:'Weeks'},{id:'monthsVal', lbl:'Months approximate'}],
    note:'Countdown excludes start date, includes target date.',
    related:['date-difference-calculator','workday-calculator'],
    faqs:[
      {q:'Does it count the end date?',a:'The countdown counts full days between dates. From Sept 18 to Sept 19 = 1 day.'},
    ],
    content:[{h:'Countdown for motivation',a:'Research shows visible progress increases urgency. A 100-day countdown creates momentum.'}],
  },
  {
    slug:'speed-distance-time-calculator', name:'Speed Distance Time Calculator',
    title:'Speed Distance Time — Running, Cycling, Road Trip | mQuickCalc',
    desc:'Calculate speed, distance, or time from the other two. Free, no signup.',
    inputs:[
      {id:'dist', label:'Distance (miles)', value:'26.2', type:'number'},
      {id:'time', label:'Time (hours)', value:'4', type:'number'},
      {id:'speed', label:'Speed (mph)', value:'0', type:'number'},
    ],
    resultId:'resultVal', resultDim:'mph (leave speed=0 to solve for speed)',
    extra:[{id:'paceVal', lbl:'Pace per mile'},{id:'kmPaceVal', lbl:'Pace per km'}],
    note:'Leave one field at 0 to solve for it. Speed × Time = Distance.',
    related:['pace-calculator'],
    faqs:[
      {q:'How to convert mph to pace?',a:'Pace (min/mile) = 60 / mph. At 6 mph: 60/6 = 10 min/mile. At 9 mph: 60/9 = 6.7 min/mile.'},
      {q:'How does this help with running?',a:'Enter 26.2 miles + 4 hours target = 6.55 mph pace required. Training at that pace builds the aerobic base.'},
    ],
    content:[{h:'The physics of speed, distance, time',b:'Speed = Distance / Time. The relationship is constant — you cannot beat physics. Running faster always covers distance in less time.'}],
  },
  {
    slug:'random-number-generator', name:'Random Number Generator',
    title:'Random Number Generator — Pick Random Numbers | mQuickCalc',
    desc:'Generate random numbers in any range. Pick lottery numbers, random samples, decide randomly. Free, no signup.',
    inputs:[
      {id:'min', label:'Minimum', value:'1', type:'number'},
      {id:'max', label:'Maximum', value:'100', type:'number'},
      {id:'count', label:'How many numbers', value:'1', type:'number'},
    ],
    resultId:'resultVal', resultDim:'random number',
    extra:[{id:'againVal', lbl:'Generate again'},{id:'rangeVal', lbl:'Range'}],
    note:'Uses Math.random() — fine for casual use. Not cryptographically secure.',
    related:['percentage-calculator'],
    faqs:[
      {q:'Is Math.random() truly random?',a:'No — it is pseudorandom. Deterministic based on seed. Fine for games. For cryptography use crypto.getRandomValues().'},
    ],
    content:[{h:'Pseudorandom vs true randomness',a:'Computers generate pseudorandom numbers using algorithms — statistically random-looking. True randomness requires physical phenomena (radioactive decay, thermal noise). For casual decisions, pseudorandom is sufficient.'}],
  },
  {
    slug:'mortgage-affordability-calculator', name:'Mortgage Affordability Calculator',
    title:'Mortgage Affordability — How Much House Can I Afford | mQuickCalc',
    desc:'Calculate how much mortgage you can afford based on income, debts, and down payment. Free, no signup.',
    inputs:[
      {id:'income', label:'Annual gross income ($)', value:'120000', type:'number'},
      {id:'debts', label:'Monthly debts ($)', value:'500', type:'number'},
      {id:'down', label:'Down payment ($)', value:'50000', type:'number'},
      {id:'rate', label:'Interest rate (%)', value:'7', type:'number'},
      {id:'years', label:'Loan term (years)', value:'30', type:'number'},
    ],
    resultId:'maxVal', resultDim:'approximate max home price',
    extra:[{id:'loanVal', lbl:'Max loan amount'},{id:'monthlyVal', lbl:'Monthly P&I payment'}],
    note:'Lenders use 28% housing cost / 36% total debt rules. Bank may approve more than is comfortable.',
    related:['loan-calculator','mortgage-calculator'],
    faqs:[
      {q:'What is the 28/36 rule?',a:'Housing costs ≤ 28% of gross monthly income. Total debt ≤ 36%. Most lenders use these as approval guidelines.'},
      {q:'What about taxes and insurance?',a:'These add 15-30% to base mortgage payment. A $2,000/month P&I often becomes $2,500-2,700 with escrow.'},
    ],
    content:[{h:'How much house should you really buy?',a:'The bank may approve more than comfortable. A $500K mortgage at 7% costs $3,317/month. At $120K income, this is 33% of gross — leaving $6,700/month for everything else.'}],
  },
  {
    slug:'running-pace-calculator', name:'Running Pace Calculator',
    title:'Running Pace Calculator — Min/Mile Min/KM | mQuickCalc',
    desc:'Convert running pace. Calculate race times from pace. Free, no signup.',
    inputs:[
      {id:'miles', label:'Distance (miles)', value:'26.2', type:'number'},
      {id:'targetMin', label:'Target finish time (minutes)', value:'240', type:'number'},
    ],
    resultId:'paceVal', resultDim:'min/mile (leave targetMin=0 to solve for finish time',
    extra:[{id:'kmPaceVal', lbl:'Pace per km'},{id:'trackVal', lbl:'Per 400m split'}],
    note:'1 mile = 1.609 km. Pace min/mile = 60 / mph. 10 min/mile = 6.0 mph.',
    related:['speed-distance-time-calculator','percentage-calculator'],
    faqs:[
      {q:'How to use for training?',a:'Enter 10K distance and goal time to calculate required pace. Training at that pace builds the base.'},
      {q:'What is a good marathon pace?',a:'Most recreational runners target 8:30-10:30 min/mile. Average first marathon is 4:30-5:00 hours. Elite under 5:00 min/mile.'},
    ],
    content:[{h:'Pacing science',a:'Most runners go out too fast. Even pacing at 90-95% of target race pace builds the neuromuscular patterns for a strong finish.'}],
  },
  {
    slug:'sleep-time-calculator', name:'Sleep Time Calculator',
    title:'Sleep Time Calculator — Wake Refreshed | mQuickCalc',
    desc:'Calculate what time to sleep to wake up at your target time. Includes sleep cycle awareness. Free, no signup.',
    inputs:[
      {id:'wakeH', label:'Wake up hour (0–23)', value:'7', type:'number'},
      {id:'wakeM', label:'Wake up minute (0–59)', value:'0', type:'number'},
      {id:'cycles', label:'Sleep cycles needed (5=standard, 6=more sleep', value:'5', type:'number'},
    ],
    resultId:'sleepTimeVal', resultDim:'go to sleep at',
    extra:[{id:'lateVal', lbl:'Sleep +30 min'},{id:'earlyVal', lbl:'Sleep -30 min'}],
    note:'A sleep cycle = ~90 minutes. 5 cycles = 7.5 hours. Waking between cycles causes grogginess.',
    related:['sleep-debt-calculator'],
    faqs:[
      {q:'How long to fall asleep?',a:'Average 10-20 minutes for adults. Add sleep onset latency to recommended bedtime.'},
      {q:'What are sleep cycles?',a:'Light → deep → REM → light = ~90 minutes. Waking at cycle end feels best.'},
    ],
    content:[{h:'The 90-minute sleep cycle',a:'6hrs=4cycles | 7.5hrs=5cycles | 9hrs=6cycles. Waking at cycle boundaries prevents grogginess.'}],
  },
  {
    slug:'body-fat-calculator', name:'Body Fat Percentage Calculator (US Navy Method',
    title:'Body Fat % — Estimate From Measurements | mQuickCalc',
    desc:'Estimate body fat % using tape measurements. Free, no signup.',
    inputs:[
      {id:'gender', label:'Gender (1=male, 2=female)', value:'1', type:'number'},
      {id:'waist', label:'Waist circumference (inches)', value:'34', type:'number'},
      {id:'neck', label:'Neck circumference (inches)', value:'15', type:'number'},
      {id:'weight', label:'Weight (lbs)', value:'170', type:'number'},
    ],
    resultId:'bfVal', resultDim:'estimated body fat % (US Navy method)',
    extra:[{id:'fatMassVal', lbl:'Fat mass (lbs)'},{id:'leanVal', lbl:'Lean mass (lbs'}],
    note:'US Navy method uses waist + neck. Accuracy ±3%. For precision use DEXA or BIA scales.',
    related:['bmi-calculator'],
    faqs:[
      {q:'How to measure correctly?',a:'Waist: at navel level, exhale naturally. Neck: below larynx. All measurements with a flexible tape.'},
      {q:'Healthy body fat % ranges?',a:'Men: 10-20% athletic, 20-25% average, 25%+ above average. Women: 18-28% athletic, 28-32% average.'},
    ],
    content:[{h:'Why body fat % matters more than BMI',a:'BMI cannot distinguish muscle from fat. A bodybuilder and a sedentary person at the same weight and height have the same BMI.'}],
  },
  {
    slug:'hours-to-decimal-calculator', name:'Hours to Decimal Calculator',
    title:'Hours to Decimal — Convert Time to Hours | mQuickCalc',
    desc:'Convert hours and minutes to decimal hours. Essential for payroll and timesheets. Free, no signup.',
    inputs:[
      {id:'h', label:'Hours', value:'2', type:'number'},
      {id:'m', label:'Minutes', value:'30', type:'number'},
    ],
    resultId:'decimalVal', resultDim:'decimal hours',
    extra:[{id:'totalMinVal', lbl:'Total minutes'},{id:'fractionVal', lbl:'Fraction of a day'},
    note:'2:30 = 2.5 hours. Most payroll systems use decimal hours — 2:30 entered as 2.5.',
    related:['time-converter','hourly-wage-calculator'],
    faqs:[
      {q:'Why decimal hours for payroll?',a:'8.25hrs × $20/hr = $165. In time notation this is complicated. Most digital time clocks export as decimal hours.'},
    ],
    content:[{h:'Common conversions',a:'0.25hr=15min | 0.50hr=30min | 0.75hr=45min. 0.10hr=6min.'}],
  },
  {
    slug:'calorie-need-calculator', name:'Calorie Need Calculator',
    title:'Calorie Need Calculator — Daily Maintenance Calories | mQuickCalc',
    desc:'Calculate TDEE. Estimate daily calorie maintenance level from age, weight, height, activity. Free, no signup.',
    inputs:[
      {id:'age', label:'Age', value:'30', type:'number'},
      {id:'weight', label:'Weight (lbs)', value:'160', type:'number'},
      {id:'height', label:'Height (inches)', value:'68', type:'number'},
      {id:'activity', label:'Activity 1-5 (1=sedentary 5=athlete)', value:'2', type:'number'},
    ],
    resultId:'tdeeVal', resultDim:'cal/day to maintain weight',
    extra:[{id:'loseVal', lbl:'To lose 1lb/week'},{id:'gainVal', lbl:'To gain 1lb/week'},
    note:'1lb body fat ≈ 3,500 cal. TDEE ±10-15% accuracy typical. Adjust based on weight trend.',
    related:['bmi-calculator'],
    faqs:[
      {q:'Activity levels?',a:'1=sedentary | 2=light activity | 3=moderate | 4=very active | 5=athlete. Be honest — overestimating activity is common.'},
      {q:'What is TDEE?',a:'Total Daily Energy Expenditure = BMR × activity multiplier. The calculator estimates BMR using a formula.'},
    ],
    content:[{h:'Why calorie estimates are imperfect',a:'Individual variation in metabolism makes exact prediction impossible. Use as a starting point and adjust by monitoring weight trend over 2-3 weeks.'}],
  },
];

// ── 辅助函数 ─────────────────────────────────────
function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : '--'; }

function buildInputs(inputs) {
  return inputs.map(input =>
    `    <label for="${input.id}">${esc(input.label)}</label>\n    <input id="${input.id}" class="input" type="${input.type === 'date' ? 'date' : 'number'}" value="${input.value}">`
  ).join('\n');
}

function buildExtra(extra) {
  return extra.map(e => `<div class="cell"><div class="lbl">${esc(e.lbl)}</div><div class="val" id="${e.id}">—</div></div>`).join('\n          ');
}

function buildRelatedHtml(emoji, slugs) {
  const names = slugs.map(s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '));
  return slugs.map((s, i) =>
    `<a href="/tools/${s}" class="tool-card"><div class="icon-row"><span class="emoji">${emoji}</span><div class="tc-title">${esc(names[i])}</div></div></a>`
  ).join('\n        ');
}

function buildFAQ(faqs) {
  return faqs.map(f =>
    `    <details class="faq-card">
      <summary class="faq-summary">
        <span class="faq-q-text">${esc(f.q)}</span>
        <span class="faq-arrow">▼</span>
      </summary>
      <div class="faq-body"><p>${esc(f.a)}</p></div>
    </details>`
  ).join('\n');
}

function buildContent(cards) {
  return cards.map(c =>
    `    <div class="content-card">
      <h2>${esc(c.h)}</h2>
      <p>${esc(c.p)}</p>
    </div>`
  ).join('\n');
}

function buildJsonLd(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    }),
  }, null, 0);
}

function buildCalcJS(tool) {
  const inputIds = tool.inputs.map(i => i.id).join('", "');
  return `<script>
(function () {
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : '--'; }
  function calc() {
    var inputs = {};
    ${tool.inputs.map(i => `inputs['${i.id}'] = parseFloat($('${i.id}').value) || 0;`).join('\n    ')}
    ${tool.inputs.map(i => `var ${i.id} = inputs['${i.id}'];`).join('\n    ')}
    var result = calcResult(inputs);
    $('${tool.resultId}').textContent = result.main;
    ${tool.extra.map(e => `$('${e.id}').textContent = result.${e.id} || '--';`).join('\n    ')}
    $('result').classList.add('show');
  }
  function calcResult(inputs) { return { main: '--', ${tool.extra.map(e => `${e.id}: '--'`).join(', ')}; }
  ["${inputIds}"].forEach(function(id) { var el = $(id); if (el) el.addEventListener('input', calc); });
  $('calcBtn').addEventListener('click', calc);
  $('resetBtn').addEventListener('click', function() {
    ${tool.inputs.map(i => `$('${i.id}').value = '${i.value}';`).join('\n    ')}
    calc();
  });
  calc();
})();
</script>`;
}

function generate(tool) {
  const inputs = buildInputs(tool.inputs);
  const extraHtml = buildExtra(tool.extra);
  const relatedHtml = buildRelatedHtml(to  tool.emoji || '📊', tool.related);
  const faqHtml = buildFAQ(tool.faqs);
  const contentHtml = buildContent(tool.content);
  const jsonLd = buildJsonLd(tool.faqs);
  const calcJS = buildCalcJS(tool);
  const canonical = `https://mquickcalc.com/tools/${tool.slug}`;
  const domain = 'mquickcalc.com';

  let html = TEMPLATE;
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${esc(tool.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(tool.desc}">`);
  html = html.replace(/rel="canonical"[^>]+href="[^"]*"/, `rel="canonical" href="${canonical}"`);
  html = html.replace(/<meta property="og:title"[^>]*/ `<meta property="og:title" content="${esc(tool.title)}">`);
  html = html.replace(/<meta property="og:description"[^>]*/ `<meta property="og:description" content="${esc(tool.desc}">`);
  html = html.replace(/<meta property="og:url"[^>]*/ `<meta property="og:url" content="${canonical}">`);
  html = html.replace(/<meta name="twitter:title"[^>]*/ `<meta name="twitter:title" content="${esc(tool.name} | mQuickCalc">`);
  html = html.replace(/<meta name="twitter:description"[^>]*/ `<meta name="twitter:description" content="${esc(tool.desc}">`);
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?FAQPage[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${jsonLd}</script>`
  );
  const startIdx = html.indexOf('<label for="mode"');
  if (startIdx !== -1) {
    const endIdx = html.indexOf('<div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">', startIdx);
    const newInputs = `<label for="${tool.inputs[0].id}">${esc(tool.inputs[0].label)}</label>\n    <input id="${tool.inputs[0].id}" class="input" type="${tool.inputs[0].type === 'date' ? 'date' : 'number'}" value="${tool.inputs[0].value}">\n    ${tool.inputs.slice(1).map(i => `<label for="${i.id}">${esc(i.label)}</label>\n    <input id="${i.id}" class="input" type="${i.type === 'date' ? 'date' : 'number'}" value="${i.value}">`).join('\n    ')}`;
    const replacement = newInputs;
    html = html.slice(0, startIdx) + replacement + html.slice(endIdx);
  }
  const extraStart = html.indexOf('<div class="grid">');
  const extraEnd = html.indexOf('</div>\n    <p class="note"');
  if (extraStart !== -1 && extraEnd !== -1) {
    const newExtra = `<div class="grid">\n          <div class="cell"><div class="lbl">${esc(tool.resultDim}</div><div class="val" id="${tool.resultId}">--</div></div>\n          ${extraHtml}\n        </div>`;
    html = html.slice(0, extraStart) + newExtra + html.slice(extraEnd + 7);
  }
  const faqStart = html.indexOf('<div class="faq-cards">');
  if (faqStart !== -1) {
    const faqEnd = html.indexOf('\n    </div>\n\n    <footer');
    if (faqEnd !== -1) {
      html = html.slice(0, faqStart) + `<div class="faq-cards">\n${faqHtml}\n    </div>` + html.slice(faqEnd);
    }
  }
  const relatedStart = html.indexOf('<div class="tool-grid">');
  const relatedEnd = html.indexOf('\n      </div>\n\n    <footer');
  if (relatedStart !== -1 && relatedEnd !== -1) {
    html = html.slice(0, relatedStart) + `<div class="tool-grid">\n        ${relatedHtml}\n      </div>` + html.slice(relatedEnd);
  }
  const contentStart = html.indexOf('<div class="content-card">');
  const contentEnd = html.indexOf('\n\n    <div class="faq-cards">');
  if (contentStart !== -1 && contentEnd !== -1) {
    html = html.slice(0, contentStart) + contentHtml + html.slice(contentEnd);
  }
  const jsStart = html.lastIndexOf('<script>');
  const jsEnd = html.lastIndexOf('</script>') + 9;
  html = html.slice(0, jsStart) + '\n' + calcJS + '\n' + html.slice(jsEnd);
  return html;
}

// ── 主循环 ───────────────────────────────
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
  if (!DRY) console.log(`    → ${fp}`);
}
console.log(`\n${'─'.repeat(50)}`);
console.log(`${DRY ? '🔍 DRY RUN' : '✅ DONE'}: ${created} created, ${skipped} skipped`);
if (DRY) console.log(`   → node tools/generate-main-tools-batch3.mjs --apply`);
