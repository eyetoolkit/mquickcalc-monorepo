#!/usr/bin/env node
/**
 * fix-generic-howto.mjs
 *
 * 替换所有工具页的通用占位 HowTo schema（name = "How to use this calculator"）
 * 为真实、具体的操作步骤。
 *
 * 用法：node tools/fix-generic-howto.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = path.join(__dirname, '..', 'packages', 'site-main', 'tools');

// 每个工具的真实步骤
const HOWTO_MAP = {
  'age-calculator': {
    name: 'How to use the Age Calculator',
    steps: [
      { name: 'Enter your birth date', text: 'Type or pick your date of birth in the first field.' },
      { name: 'Set the reference date', text: 'Keep the default (today) or pick a custom date to calculate age on.' },
      { name: 'Read your age', text: 'The result shows your exact age in years, months, days, and total days lived.' },
    ],
  },
  'coin-flip': {
    name: 'How to use the Coin Flip',
    steps: [
      { name: 'Set the number of flips', text: 'Choose 1 for a single flip, or enter a larger number to flip multiple coins at once.' },
      { name: 'Click Flip', text: 'Press the Flip button to generate your random result.' },
      { name: 'Read the outcome', text: 'The result shows heads or tails for each flip, plus a summary of the totals.' },
    ],
  },
  'countdown-timer': {
    name: 'How to use the Countdown Timer',
    steps: [
      { name: 'Set the duration', text: 'Enter hours, minutes, and seconds, or pick a preset (5 min, 10 min, 25 min Pomodoro, etc.).' },
      { name: 'Start the countdown', text: 'Press Start to begin. The timer counts down in real time.' },
      { name: 'Use pause and reset', text: 'Pause at any time or reset to go again. An alarm fires when it reaches zero.' },
    ],
  },
  'counter': {
    name: 'How to use the Counter',
    steps: [
      { name: 'Set a start value', text: 'Enter any starting number (default is 0).' },
      { name: 'Increment or decrement', text: 'Press +1 or -1 to step by one, or use the custom step to jump by any amount.' },
      { name: 'Track your count', text: 'Read the running total at a glance. Reset to start over.' },
    ],
  },
  'date-difference-calculator': {
    name: 'How to use the Date Difference Calculator',
    steps: [
      { name: 'Pick two dates', text: 'Select a start date and an end date. The order is handled automatically.' },
      { name: 'Choose the unit', text: 'Select whether you want the result in days, weeks, months, or years.' },
      { name: 'Read the difference', text: 'The result shows the exact gap between the two dates in your chosen unit.' },
    ],
  },
  'day-of-week-calculator': {
    name: 'How to use the Day of Week Calculator',
    steps: [
      { name: 'Enter any date', text: 'Type or pick a date to find out what day of the week it falls on.' },
      { name: 'Read the result', text: 'The tool shows the weekday name (Monday, Tuesday, etc.) along with the full ISO date.' },
    ],
  },
  'dice-roller': {
    name: 'How to use the Dice Roller',
    steps: [
      { name: 'Choose dice notation', text: 'Enter dice notation such as 2d6 (two six-sided dice) or 1d20, or use the quick-select buttons.' },
      { name: 'Click Roll', text: 'Press Roll to generate a cryptographically random outcome.' },
      { name: 'Read the result', text: 'Each die face is shown individually, plus the total sum.' },
    ],
  },
  'fuel-cost-calculator': {
    name: 'How to use the Fuel Cost Calculator',
    steps: [
      { name: 'Enter trip details', text: 'Type your distance (miles or km), fuel efficiency (mpg or L/100km), and fuel price per unit.' },
      { name: 'Click Calculate', text: 'The tool computes the total fuel cost for the trip.' },
      { name: 'Read the estimate', text: 'The result shows the total cost and the cost per person if you split with passengers.' },
    ],
  },
  'gpa-calculator': {
    name: 'How to use the GPA Calculator',
    steps: [
      { name: 'Enter your courses', text: 'Add each course with its credit hours and letter grade (or percentage).' },
      { name: 'Set your scale', text: 'Choose 4.0 or weighted scale if your school uses one.' },
      { name: 'See your GPA', text: 'The result calculates your semester GPA and cumulative GPA across all entries.' },
    ],
  },
  'number-base-converter': {
    name: 'How to use the Number Base Converter',
    steps: [
      { name: 'Enter a number', text: 'Type any integer in the input field — it can be in any base from 2 to 36.' },
      { name: 'Read all conversions', text: 'The result shows the same number in binary, octal, decimal, hexadecimal, and every base in between.' },
    ],
  },
  'password-generator': {
    name: 'How to use the Password Generator',
    steps: [
      { name: 'Set length and options', text: 'Choose length (default 16 characters) and toggle character sets: uppercase, lowercase, digits, symbols.' },
      { name: 'Click Generate', text: 'Press Generate to create a cryptographically random password using crypto.getRandomValues.' },
      { name: 'Copy to clipboard', text: 'Use the copy button to send the password to your clipboard instantly.' },
    ],
  },
  'percentage-calculator': {
    name: 'How to use the Percentage Calculator',
    steps: [
      { name: 'Choose a calculation mode', text: 'Pick from: Find X% of Y, X is what % of Y, X is Y% of what, or % change between two values.' },
      { name: 'Enter your numbers', text: 'Fill in the two input fields with your values.' },
      { name: 'Read the answer', text: 'All four calculations update in real time as you type, with formula explanations shown.' },
    ],
  },
  'random-number-generator': {
    name: 'How to use the Random Number Generator',
    steps: [
      { name: 'Set your range', text: 'Enter the minimum and maximum values between which you want a random number.' },
      { name: 'Choose quantity and options', text: 'Select how many numbers to generate, whether to allow duplicates, and if decimals are needed.' },
      { name: 'Generate', text: 'The tool uses crypto.getRandomValues for cryptographically secure output.' },
    ],
  },
  'recipe-servings-calculator': {
    name: 'How to use the Recipe Servings Calculator',
    steps: [
      { name: 'Enter your original recipe', text: 'List each ingredient with its amount from your recipe.' },
      { name: 'Set your target servings', text: 'Enter how many servings you want the recipe to make.' },
      { name: 'Read adjusted amounts', text: 'The tool scales every ingredient amount proportionally to your new serving size.' },
    ],
  },
  'simple-budget-calculator': {
    name: 'How to use the Simple Budget Calculator',
    steps: [
      { name: 'Enter your income', text: 'Type your total monthly income in the income field.' },
      { name: 'List your expenses', text: 'Add each expense category with its monthly amount.' },
      { name: 'Read the summary', text: 'The result shows your total income, total expenses, and whether you are saving or overspending.' },
    ],
  },
  'stopwatch': {
    name: 'How to use the Stopwatch',
    steps: [
      { name: 'Start timing', text: 'Press Start or the spacebar to begin the stopwatch.' },
      { name: 'Log laps', text: 'Press Lap to record a split time without stopping the main timer.' },
      { name: 'Read the results', text: 'The display shows the current time and a list of lap intervals.' },
    ],
  },
  'tip-calculator': {
    name: 'How to use the Tip Calculator',
    steps: [
      { name: 'Enter the bill total', text: 'Type the pre-tax amount from your bill.' },
      { name: 'Choose a tip percentage', text: 'Select 15%, 18%, 20%, or enter a custom amount.' },
      { name: 'Split the bill', text: 'Enter the number of people to split the total evenly. The result shows each person\'s share.' },
    ],
  },
  'unit-price-calculator': {
    name: 'How to use the Unit Price Calculator',
    steps: [
      { name: 'Enter product A', text: 'Type the price and size (or quantity) of the first product.' },
      { name: 'Enter product B', text: 'Type the price and size of the second product to compare.' },
      { name: 'Read the comparison', text: 'The result shows the price per unit for each product and highlights which is the better value.' },
    ],
  },
  'week-number-calculator': {
    name: 'How to use the Week Number Calculator',
    steps: [
      { name: 'Enter any date', text: 'Type or pick a date to find its ISO 8601 week number.' },
      { name: 'Choose week system', text: 'Select ISO (Monday start) or US (Sunday start) week numbering.' },
      { name: 'Read the result', text: 'The tool shows the week number, the Monday and Sunday dates of that week, and weeks remaining in the year.' },
    ],
  },
  'work-hours-calculator': {
    name: 'How to use the Work Hours Calculator',
    steps: [
      { name: 'Enter clock-in and clock-out times', text: 'For each day, enter the start and end time of your shift.' },
      { name: 'Subtract breaks', text: 'If you took a lunch break, enter its duration to subtract it from your total.' },
      { name: 'Read weekly totals', text: 'The tool sums up all your daily hours and shows your total for the week.' },
    ],
  },
};

function buildHowToSchema(toolName) {
  const spec = HOWTO_MAP[toolName];
  if (!spec) return null;
  const steps = spec.steps.map((s) =>
    `{"@type":"HowToStep","name":"${s.name}","text":"${s.text}"}`
  ).join(',');
  return `{"@context":"https://schema.org","@type":"HowTo","name":"${spec.name}","step":[${steps}]}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let fixed = 0;
let skipped = 0;

for (const file of fs.readdirSync(TOOLS_DIR)) {
  if (!file.endsWith('.html')) continue;
  const filePath = path.join(TOOLS_DIR, file);
  const toolName = file.replace(/\.html$/, '');
  const howtoSchema = buildHowToSchema(toolName);
  if (!howtoSchema) { skipped++; continue; }

  let content = fs.readFileSync(filePath, 'utf8');

  // Match the generic HowTo schema by its unique "name" field
  // The schema always appears inside a <script type="application/ld+json"> tag
  const genericPattern = new RegExp(
    '<script type="application/ld\\+json">\\s*\\{"@context":\\s*"https://schema\\.org",\\s*"@type":\\s*"HowTo",\\s*"name":\\s*"How to use this calculator",\\s*"step":\\s*\\[.*?\\]\\s*\\}</script>',
    'g'
  );

  if (!genericPattern.test(content)) { skipped++; continue; }

  content = content.replace(genericPattern, `<script type="application/ld+json">${howtoSchema}</script>`);
  fs.writeFileSync(filePath, content);
  console.log(`  ✅ ${file}: replaced generic HowTo`);
  fixed++;
}

console.log(`\n✅ Fixed ${fixed} files. Skipped ${skipped}.`);
