#!/usr/bin/env node
/**
 * Generate 16 everyday tools for packages/site-main/tools/
 * Each tool entry provides COMPLETE calc-card inner HTML — no template fallback.
 *
 * Usage:
 *   node tools/gen-site-main-tools.mjs --dry
 *   node tools/gen-site-main-tools.mjs --apply   (default)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'packages', 'site-main', 'tools');
const SITE_URL = 'https://mquickcalc.com';
const UPD_LABEL = 'Sep 18, 2026';
const UPD_DATE  = '2026-09-18';

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function jld(obj) { return JSON.stringify(obj); }

// ========================================================================
// 16 Tool definitions
// ========================================================================
const TOOLS = [

  // ---------- 1. Stopwatch ----------
  {
    slug: 'stopwatch',
    name: 'Stopwatch',
    emoji: '⏱️',
    title: 'Stopwatch — Free Online Timer | mQuickCalc',
    desc: 'Free online stopwatch with lap tracking, millisecond precision, and big readable display. Start, pause, reset, and log laps.',
    lede: 'A big, clean online stopwatch. Start, pause, log laps, or reset. Millisecond precision, zero signup.',
    cat: 'Everyday',
    calcCardInner: `
      <div style="text-align:center;padding:18px 0 8px;font-family:ui-monospace,Menlo,monospace;font-size:2.5rem;font-weight:500;letter-spacing:2px;" id="bigVal">00:00:00.000</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">
        <button id="startBtn" class="btn">Start</button>
        <button id="lapBtn" class="btn ghost">Lap</button>
        <button id="resetBtn" class="btn ghost">Reset</button>
      </div>
      <div class="result" id="result">
        <div class="dim" id="dimVal">0 laps</div>
        <ol id="laps" style="padding-left:20px;max-height:180px;overflow-y:auto;font-family:ui-monospace,Menlo,monospace;font-size:0.9rem;"></ol>
      </div>`,
    js: `(function () {
  function $(id) { return document.getElementById(id); }
  var startTime = 0, elapsed = 0, running = false, rafId = null;
  function pad(n, w) { n = Math.floor(n); return String(n).padStart(w,'0'); }
  function fmt(ms) {
    var h = Math.floor(ms/3600000); ms -= h*3600000;
    var m = Math.floor(ms/60000);    ms -= m*60000;
    var s = Math.floor(ms/1000);    ms -= s*1000;
    return pad(h,2)+':'+pad(m,2)+':'+pad(s,2)+'.'+pad(ms,3);
  }
  function tick() {
    var now = running ? (performance.now() - startTime) + elapsed : elapsed;
    $('bigVal').textContent = fmt(now);
    rafId = requestAnimationFrame(tick);
  }
  $('startBtn').addEventListener('click', function () {
    if (running) {
      elapsed += performance.now() - startTime;
      running = false;
      $('startBtn').textContent = 'Resume';
    } else {
      startTime = performance.now();
      running = true;
      $('startBtn').textContent = 'Pause';
    }
  });
  $('lapBtn').addEventListener('click', function () {
    if (!running && elapsed === 0) return;
    var now = running ? elapsed + (performance.now() - startTime) : elapsed;
    var li = document.createElement('li');
    li.textContent = fmt(now);
    $('laps').appendChild(li);
    $('dimVal').textContent = $('laps').children.length + ' lap(s)';
    $('result').classList.add('show');
  });
  $('resetBtn').addEventListener('click', function () {
    running = false; elapsed = 0;
    $('bigVal').textContent = '00:00:00.000';
    $('startBtn').textContent = 'Start';
    $('laps').innerHTML = '';
    $('dimVal').textContent = '0 laps';
  });
  tick();
})();`,
    body: [
      '<h2>How this stopwatch works</h2>',
      '<p>We use <code>performance.now()</code> for high-precision timing and <code>requestAnimationFrame</code> for smooth display updates. Unlike interval-based timers, the accumulated time is always correct — even if you switch browser tabs, because the math runs on real timestamps, not frame counts.</p>',
      '<h2>What to use it for</h2>',
      '<p>Time yourself cooking pasta, measure a 40-yard dash, track how long you focus before checking phone again, or settle a bet. Click <strong>Lap</strong> mid-run to mark a split — every lap is appended to a list below.</p>'
    ],
    faqs: [
      ['How precise is this?', 'The display shows milliseconds. Browser tab throttling keeps actual accuracy in the ±20 ms range, which is plenty for cooking, sports training, and everyday use.'],
      ['Will it keep running in the background?', 'Yes — elapsed time is calculated from real wall-clock timestamps, not frame counts. When you return to the tab the display catches up instantly.'],
      ['How do I record split times?', 'Click <strong>Lap</strong> while running. Each entry shows the cumulative time at that click.'],
      ['Does it work on my phone?', 'Fully responsive, big buttons for fat fingers. Add to home screen for one-tap access.'],
      ['Why does the display sometimes stutter?', 'When the tab is backgrounded or the machine is under load, Chrome throttles rAF. Timing itself is never affected — only how often the screen refreshes.']
    ],
    related: [
      { href: '/tools/countdown-timer', emoji: '⏳', title: 'Countdown Timer', desc: 'Count down to zero with alarm.' },
      { href: '/tools/work-hours-calculator', emoji: '⏰', title: 'Work Hours', desc: 'Add up daily work hours.' },
      { href: '/tools/time-converter', emoji: '🕐', title: 'Time Converter', desc: 'Convert time zones and units.' }
    ],
    seeAlso: [['Countdown Timer','/tools/countdown-timer'],['Work Hours','/tools/work-hours-calculator'],['⏱️ All Time','/speed-time']]
  },

  // ---------- 2. Countdown Timer ----------
  {
    slug: 'countdown-timer',
    name: 'Countdown Timer',
    emoji: '⏳',
    title: 'Countdown Timer — Free Online Alarm | mQuickCalc',
    desc: 'Set any duration and get a clear countdown with a browser alarm when it hits zero. Cooking, workouts, pomodoro — all in one page.',
    lede: 'Set hours, minutes, seconds. We count down and ring an alarm when time is up. Zero signup, works offline.',
    cat: 'Everyday',
    calcCardInner: `
      <div class="row">
        <div class="field"><label for="hours">Hours</label><input id="hours" class="input" type="number" min="0" step="1" value="0"></div>
        <div class="field"><label for="minutes">Minutes</label><input id="minutes" class="input" type="number" min="0" step="1" value="5"></div>
        <div class="field"><label for="seconds">Seconds</label><input id="seconds" class="input" type="number" min="0" step="1" value="0"></div>
      </div>
      <button id="presetBtn" class="btn ghost">25 min pomodoro</button>
      <div style="text-align:center;padding:20px 0 4px;font-family:ui-monospace,Menlo,monospace;font-size:2.5rem;font-weight:500;" id="bigVal">00:05:00</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
        <button id="calcBtn" class="btn">Start</button>
        <button id="resetBtn" class="btn ghost">Reset</button>
      </div>
      <div class="result" id="result"><div class="dim" id="dimVal">Not running</div></div>`,
    js: `(function () {
  function $(id) { return document.getElementById(id); }
  var endTime = 0, tickId = null, running = false, savedMs = 0;
  var audioCtx = null;
  function pad(n){return String(Math.max(0,Math.floor(n))).padStart(2,'0');}
  function fmt(ms){if(ms<0)ms=0;var h=Math.floor(ms/3600000);ms-=h*3600000;var m=Math.floor(ms/60000);ms-=m*60000;var s=Math.floor(ms/1000);return pad(h)+':'+pad(m)+':'+pad(s);}
  function beep(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=880;o.connect(g);g.connect(audioCtx.destination);g.gain.setValueAtTime(0.2,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.6);o.start();o.stop(audioCtx.currentTime+0.6);}catch(e){}}
  function tick(){var r=endTime-Date.now();$('bigVal').textContent=fmt(r);$('dimVal').textContent=r>0?'Running...':'⏰ Time up!';if(r<=0){running=false;clearInterval(tickId);for(var i=0;i<3;i++)setTimeout(beep,i*900);try{$('bigVal').style.color='#dc2626';}catch(e){}return;}}
  function readInputs(){var h=+ $('hours').value||0, m=+ $('minutes').value||0, s=+ $('seconds').value||0;return(h*3600+m*60+s)*1000;}
  $('calcBtn').addEventListener('click',function(){
    if(running){savedMs=Math.max(0,endTime-Date.now());running=false;clearInterval(tickId);$('calcBtn').textContent='Resume';}
    else{
      if(savedMs>0){endTime=Date.now()+savedMs;savedMs=0;}
      else{endTime=Date.now()+readInputs();}
      running=true;$('calcBtn').textContent='Pause';tick();tickId=setInterval(tick,250);
    }
  });
  $('resetBtn').addEventListener('click',function(){running=false;clearInterval(tickId);endTime=0;savedMs=0;$('calcBtn').textContent='Start';try{$('bigVal').style.color='';}catch(e){}$('bigVal').textContent=fmt(readInputs());$('dimVal').textContent='Not running';});
  $('presetBtn').addEventListener('click',function(){$('hours').value=0;$('minutes').value=25;$('seconds').value=0;$('bigVal').textContent='00:25:00';$('calcBtn').textContent='Start';running=false;savedMs=0;});
  ['hours','minutes','seconds'].forEach(function(id){$(id).addEventListener('input',function(){if(!running&&savedMs===0){$('bigVal').textContent=fmt(readInputs());}});});
})();`,
    body: [
      '<h2>Why the alarm does not sound sometimes</h2>',
      '<p>Browsers block audio until you click somewhere on the page. Click <strong>Start</strong> first — after that the alarm will play even in a background tab. The alarm fires three short beeps using the Web Audio API, so it does not need an external sound file.</p>',
      '<h2>Ideas for using it</h2>',
      '<p>Boil an egg (7 min), steep tea (3–5 min), pomodoro focus (25 min work + 5 min break), rest between strength sets (90 sec), or never burn the cookies again. Keep this page open in a tab whenever you need a reliable countdown.</p>'
    ],
    faqs: [
      ['Why did the alarm not go off?', 'You need to click <strong>Start</strong> once first — browsers block audio from pages the user has not interacted with. This is a browser security feature, not a bug.'],
      ['How accurate is it?', 'Accurate to the second. We store an end timestamp and compare it to Date.now(), so browser throttling does not shift the moment it fires.'],
      ['Can I run multiple timers?', 'Open multiple browser tabs — each tab is its own independent timer.'],
      ['Does it drain battery?', 'Negligibly. We use a 250 ms interval which pauses when the tab is backgrounded, so there is no idle CPU burn.'],
      ['Can I change the alarm sound?', 'Not yet — the beep is hardcoded as a 880 Hz sine wave through the Web Audio API. If you need louder, pair with a nearby phone alarm.']
    ],
    related: [
      { href: '/tools/stopwatch', emoji: '⏱️', title: 'Stopwatch', desc: 'Time intervals and record laps.' },
      { href: '/tools/work-hours-calculator', emoji: '⏰', title: 'Work Hours', desc: 'Clock in/out — see totals.' },
      { href: '/tools/time-converter', emoji: '🕐', title: 'Time Converter', desc: 'Convert time zones and units.' }
    ],
    seeAlso: [['Stopwatch','/tools/stopwatch'],['Work Hours','/tools/work-hours-calculator'],['⏳ All Timers','/speed-time']]
  },

  // ---------- 3. Password Generator ----------
  {
    slug: 'password-generator',
    name: 'Password Generator',
    emoji: '🔐',
    title: 'Password Generator — Strong, Random Passwords | mQuickCalc',
    desc: 'Generate cryptographically secure random passwords with adjustable length and character sets. Copy to clipboard instantly — nothing leaves your browser.',
    lede: 'Pick a length, tick character types, get a secure password. One-click copy, strength indicator, all client-side.',
    cat: 'Everyday',
    calcCardInner: `
      <label for="length">Length</label>
      <div class="row">
        <div class="field" style="flex:2;"><input id="length" class="input" type="number" min="4" max="128" step="1" value="16"></div>
        <div class="field"><label><input type="checkbox" id="useUpper" checked> A–Z</label></div>
        <div class="field"><label><input type="checkbox" id="useLower" checked> a–z</label></div>
        <div class="field"><label><input type="checkbox" id="useDigits" checked> 0–9</label></div>
        <div class="field"><label><input type="checkbox" id="useSymbols"> Symbols</label></div>
      </div>
      <input id="pwd" class="input" readonly style="font-family:ui-monospace,Menlo,monospace;font-size:1.05rem;margin-top:12px;" value="">
      <div style="display:flex;gap:12px;margin-top:12px;">
        <button id="genBtn" class="btn">Generate</button>
        <button id="copyBtn" class="btn ghost">Copy</button>
      </div>
      <div class="result" id="result">
        <div class="grid">
          <div class="cell"><div class="lbl">Strength</div><div class="val" id="strength">--</div></div>
          <div class="cell"><div class="lbl">Entropy (bits)</div><div class="val" id="entropy">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id) { return document.getElementById(id); }
  var U='ABCDEFGHIJKLMNOPQRSTUVWXYZ', L='abcdefghijklmnopqrstuvwxyz', D='0123456789', S='!@#$%^&*()-_=+[]{};:,.<>?/';
  function sr(max){var a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=Math.floor(0xFFFFFFFF/max)*max);return a[0]%max;}
  function generate(){
    var len=Math.max(4,Math.min(128,+ $('length').value||16));
    var pools=[];if($('useUpper').checked)pools.push(U);if($('useLower').checked)pools.push(L);if($('useDigits').checked)pools.push(D);if($('useSymbols').checked)pools.push(S);
    if(!pools.length){$('pwd').value='Tick at least one set.';return;}
    var all=pools.join(''),out=[];
    pools.forEach(function(p){out.push(p[sr(p.length)]);});
    for(var i=out.length;i<len;i++)out.push(all[sr(all.length)]);
    for(var j=out.length-1;j>0;j--){var k=sr(j+1),t=out[j];out[j]=out[k];out[k]=t;}
    var pwd=out.join('');
    $('pwd').value=pwd;
    var size=0;if($('useUpper').checked)size+=26;if($('useLower').checked)size+=26;if($('useDigits').checked)size+=10;if($('useSymbols').checked)size+=S.length;
    var bits=len*Math.log2(Math.max(2,size));
    var strength=bits<40?'Weak':bits<60?'Fair':bits<80?'Good':bits<100?'Strong':'Very Strong';
    $('strength').textContent=strength;
    $('entropy').textContent=bits.toFixed(1);
    $('result').classList.add('show');
  }
  $('copyBtn').addEventListener('click',function(){navigator.clipboard.writeText($('pwd').value);$('copyBtn').textContent='Copied!';setTimeout(function(){$('copyBtn').textContent='Copy';},1200);});
  $('genBtn').addEventListener('click',generate);
  ['useUpper','useLower','useDigits','useSymbols','length'].forEach(function(id){$(id).addEventListener('change',generate);});
  generate();
})();`,
    body: [
      '<h2>How strong is your password?</h2>',
      '<p>We estimate strength using <strong>entropy in bits</strong>: <code>length × log₂(pool size)</code>. 70 bits is the point where brute-forcing becomes economically unfeasible for anything short of nation-state attackers. Aim for 16+ characters from 3+ pools to clear this bar comfortably.</p>',
      '<h2>Best practices</h2>',
      '<p>Use a password manager to store these — you only need to remember one master password. Never reuse the same password across sites. Turn on two-factor authentication wherever possible. A 16-character random string from this generator is effectively unguessable.</p>'
    ],
    faqs: [
      ['Is this safe?', 'Yes — generated in your browser with <code>crypto.getRandomValues()</code>, cryptographically secure randomness. Nothing leaves your device.'],
      ['How long should it be?', '16+ characters with 3+ types clears ~80 bits. 12 with 4 types clears ~78 bits. Under 10 characters is risky no matter what.'],
      ['Should I use this for a master password?', 'Generate here, then paste into your password manager\'s master password field. Do not rely on this page to remember it — close the tab and it is gone.'],
      ['What if I need to type it on a TV remote?', 'Reduce length and use only digits + uppercase (no symbols). 12 uppercase letters/numbers = 72 bits — still plenty strong.'],
      ['Can it be hacked?', 'Long random passwords almost never fail through brute force — they fail through phishing, keyloggers, or database leaks. Unique password per site protects you from all except local malware.']
    ],
    related: [
      { href: '/tools/random-number-generator', emoji: '🎲', title: 'Random Number', desc: 'Any range, any count.' },
      { href: '/tools/dice-roller', emoji: '🎲', title: 'Dice Roller', desc: 'Any-sided dice.' },
      { href: '/tools/coin-flip', emoji: '🪙', title: 'Coin Flip', desc: 'Heads or tails.' }
    ],
    seeAlso: [['Random Number','/tools/random-number-generator'],['Dice Roller','/tools/dice-roller'],['🔐 All Everyday','/#everyday']]
  },

  // ---------- 4. Random Number Generator ----------
  {
    slug: 'random-number-generator',
    name: 'Random Number Generator',
    emoji: '🎲',
    title: 'Random Number Generator — Free Online | mQuickCalc',
    desc: 'Generate one or many random integers or decimals in any range. Cryptographically secure, sortable, copyable.',
    lede: 'Pick a range, pick how many numbers you want, get cryptographically secure random values instantly.',
    cat: 'Everyday',
    calcCardInner: `
      <div class="row">
        <div class="field"><label for="min">Min</label><input id="min" class="input" type="number" step="any" value="1"></div>
        <div class="field"><label for="max">Max</label><input id="max" class="input" type="number" step="any" value="100"></div>
        <div class="field"><label for="count">Count</label><input id="count" class="input" type="number" min="1" max="1000" step="1" value="5"></div>
        <div class="field"><label for="decimals">Decimals</label><input id="decimals" class="input" type="number" min="0" max="10" step="1" value="0"></div>
      </div>
      <label><input type="checkbox" id="sort"> Sort results</label>
      <div style="display:flex;gap:12px;margin-top:12px;">
        <button id="genBtn" class="btn">Generate</button>
        <button id="copyBtn" class="btn ghost">Copy</button>
      </div>
      <div class="result" id="result">
        <textarea id="out" class="input" rows="7" readonly style="font-family:ui-monospace,Menlo,monospace;"></textarea>
      </div>`,
    js: `(function () {
  function $(id) { return document.getElementById(id); }
  function sr(max){var a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=Math.floor(0xFFFFFFFF/max)*max);return a[0]%max;}
  function generate(){
    var min=parseFloat($('min').value),max=parseFloat($('max').value);
    var count=Math.max(1,Math.min(1000,+ $('count').value||1));
    var decimals=Math.max(0,Math.min(10,+ $('decimals').value||0));
    if(isNaN(min)||isNaN(max)||min>=max){$('out').value='Enter min < max.';return;}
    var out=[];
    for(var i=0;i<count;i++){var raw=sr(1000000)/1000000;var n=min+raw*(max-min);out.push(Number(n.toFixed(decimals)));}
    if($('sort').checked)out.sort(function(a,b){return a-b;});
    $('out').value=out.join('\\n');
    $('result').classList.add('show');
  }
  $('copyBtn').addEventListener('click',function(){navigator.clipboard.writeText($('out').value);$('copyBtn').textContent='Copied!';setTimeout(function(){$('copyBtn').textContent='Copy';},1200);});
  $('genBtn').addEventListener('click',generate);
  generate();
})();`,
    body: [
      '<h2>How random is "random"?</h2>',
      '<p>We use <code>crypto.getRandomValues()</code>, which pulls entropy from OS-level sources (mouse movement, disk I/O, timing jitter). This is cryptographically secure pseudorandom — indistinguishable from true randomness by any practical test. The output is <strong>uniform</strong>: every value in your range is equally likely.</p>',
      '<h2>Common uses</h2>',
      '<p>Pick a random winner from a list, decide who goes first in a game, generate test data, randomly assign chores, or settle a bet. A surprisingly useful tool to have open.</p>'
    ],
    faqs: [
      ['Is this truly random?', 'Cryptographically secure pseudorandom — indistinguishable from true random. Use it for winners, prizes, and anything non-mission-critical.'],
      ['Why are some numbers missing?', 'They are not missing — it is random. Generate more numbers and the distribution will even out.'],
      ['Can I get unique (no duplicates)?', 'Not in this version — generate more than you need and delete dupes, or manually verify each pick.'],
      ['How many at once?', 'Up to 1,000 per click. Generate in batches if you need more.'],
      ['Is this suitable for lottery picks?', 'The math is sound. But remember: buying a lottery ticket is a negative expected value bet.']
    ],
    related: [
      { href: '/tools/password-generator', emoji: '🔐', title: 'Password Generator', desc: 'Strong random passwords.' },
      { href: '/tools/dice-roller', emoji: '🎲', title: 'Dice Roller', desc: 'Any-sided dice.' },
      { href: '/tools/coin-flip', emoji: '🪙', title: 'Coin Flip', desc: 'Heads or tails.' }
    ],
    seeAlso: [['Password Generator','/tools/password-generator'],['Dice Roller','/tools/dice-roller'],['🎲 All Random','/#everyday']]
  },

  // ---------- 5. Dice Roller ----------
  {
    slug: 'dice-roller',
    name: 'Dice Roller',
    emoji: '🎲',
    title: 'Dice Roller — Free Online | mQuickCalc',
    desc: 'Roll any number of any-sided dice. Supports d4, d6, d8, d10, d12, d20, d100 and custom sides. Each die shown individually.',
    lede: 'Pick how many dice, pick sides, click Roll. Each die shown plus the total. Perfect for tabletop games.',
    cat: 'Everyday',
    calcCardInner: `
      <div class="row">
        <div class="field"><label for="count">Number of dice</label><input id="count" class="input" type="number" min="1" max="100" step="1" value="2"></div>
        <div class="field"><label for="sides">Sides per die</label><input id="sides" class="input" type="number" min="2" max="10000" step="1" value="6"></div>
        <div class="field"><label for="modifier">Modifier</label><input id="modifier" class="input" type="number" step="1" value="0"></div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="btn ghost" data-s="4">d4</button>
        <button class="btn ghost" data-s="6">d6</button>
        <button class="btn ghost" data-s="8">d8</button>
        <button class="btn ghost" data-s="10">d10</button>
        <button class="btn ghost" data-s="12">d12</button>
        <button class="btn ghost" data-s="20">d20</button>
        <button class="btn ghost" data-s="100">d100</button>
      </div>
      <button id="rollBtn" class="btn">Roll</button>
      <div class="result" id="result">
        <div class="big" id="bigVal">--</div>
        <div class="dim" id="dimVal">Click Roll</div>
        <div class="grid"><div class="cell"><div class="lbl">Individual rolls</div><div class="val" id="diceVals" style="font-family:ui-monospace,Menlo,monospace;font-size:0.9rem;">--</div></div></div>
      </div>`,
    js: `(function () {
  function $(id) { return document.getElementById(id); }
  function sr(max){var a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=Math.floor(0xFFFFFFFF/max)*max);return a[0]%max;}
  function roll(){
    var count=Math.max(1,Math.min(100,+ $('count').value||1));
    var sides=Math.max(2,Math.min(10000,+ $('sides').value||6));
    var mod=+ $('modifier').value||0;
    var rolls=[];for(var i=0;i<count;i++)rolls.push(1+sr(sides));
    var total=rolls.reduce(function(a,b){return a+b;},0)+mod;
    $('bigVal').textContent=total;
    $('dimVal').textContent=count+'d'+sides+(mod?(mod>0?' + ':' ')+mod:'');
    $('diceVals').textContent=rolls.join(',  ');
    $('result').classList.add('show');
  }
  document.querySelectorAll('button[data-s]').forEach(function(b){b.addEventListener('click',function(){$('sides').value=+b.getAttribute('data-s');});});
  $('rollBtn').addEventListener('click',roll);
  roll();
})();`,
    body: [
      '<h2>Fair dice</h2>',
      '<p>Each face of each die is equally likely. We use the browser\'s cryptographic randomness, so these rolls are statistically indistinguishable from physical dice — but without any chance of loading. No memory, no bias, no way to predict next roll.</p>',
      '<h2>For tabletop games</h2>',
      '<p>D&D, Pathfinder, Risk, Settlers of Catan — any game that lost its dice in a move. 1d20 preset for attack rolls, d100 for percentile checks. Just do not blame the calculator if you crit-fumble.</p>'
    ],
    faqs: [
      ['Can I roll 100d20?', 'Yes — up to 100 dice per click. Just do it.'],
      ['What does modifier do?', 'Adds or subtracts a fixed amount after rolling: 2d6 + 3 rolls two six-siders and adds 3.'],
      ['Why no animation?', 'The result is determined instantly — animation would be theatre. If you want theatre, close your eyes and shake an imaginary cup.'],
      ['Advantage / disadvantage?', 'Roll 2d20 manually and pick the highest (advantage) or lowest (disadvantage). We may add a preset later.'],
      ['Is this rigged?', 'No. Source is your browser, your CPU, your OS — we cannot see or influence your rolls.']
    ],
    related: [
      { href: '/tools/coin-flip', emoji: '🪙', title: 'Coin Flip', desc: 'Heads or tails.' },
      { href: '/tools/random-number-generator', emoji: '🎲', title: 'Random Number', desc: 'Any range.' },
      { href: '/tools/password-generator', emoji: '🔐', title: 'Passwords', desc: 'Strong random passwords.' }
    ],
    seeAlso: [['Coin Flip','/tools/coin-flip'],['Random Number','/tools/random-number-generator'],['🎲 All Fun','/#everyday']]
  },

  // ---------- 6. Coin Flip ----------
  {
    slug: 'coin-flip',
    name: 'Coin Flip',
    emoji: '🪙',
    title: 'Coin Flip — Fair Online Heads or Tails | mQuickCalc',
    desc: 'Flip a fair coin online — heads or tails, truly random. History log shows streak counts and percentages.',
    lede: 'Click Flip and get heads or tails instantly. Crypto-random so it is perfectly fair. The classic tiebreaker.',
    cat: 'Everyday',
    calcCardInner: `
      <div style="text-align:center;padding:28px 0 10px;font-size:3.5rem;" id="bigVal">🪙</div>
      <button id="flipBtn" class="btn" style="display:block;margin:0 auto 12px;">Flip Coin</button>
      <button id="resetBtn" class="btn ghost" style="display:block;margin:0 auto;">Reset</button>
      <div class="result" id="result">
        <div class="dim" id="dimVal">Click Flip to start</div>
        <div class="grid">
          <div class="cell"><div class="lbl">Heads</div><div class="val" id="headsCount">0</div></div>
          <div class="cell"><div class="lbl">Tails</div><div class="val" id="tailsCount">0</div></div>
          <div class="cell"><div class="lbl">Heads %</div><div class="val" id="headsPct">--</div></div>
          <div class="cell"><div class="lbl">Streak</div><div class="val" id="streakVal">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id) { return document.getElementById(id); }
  function sr(max){var a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=Math.floor(0xFFFFFFFF/max)*max);return a[0]%max;}
  var history=[],streakType=null,streakLen=0;
  function flip(){
    var isHeads=sr(2)===0;
    var result=isHeads?'Heads':'Tails';
    $('bigVal').textContent=isHeads?'👑':'🦅';
    $('dimVal').textContent=result;
    history.push(isHeads);
    var heads=history.filter(function(r){return r;}).length;
    var tails=history.length-heads;
    if(streakType===result){streakLen++;}else{streakType=result;streakLen=1;}
    $('headsCount').textContent=heads;
    $('tailsCount').textContent=tails;
    $('headsPct').textContent=history.length?(heads/history.length*100).toFixed(1)+'%':'--';
    $('streakVal').textContent=streakLen+' × '+streakType;
    $('result').classList.add('show');
  }
  $('resetBtn').addEventListener('click',function(){history=[];streakType=null;streakLen=0;$('bigVal').textContent='🪙';$('dimVal').textContent='Click Flip to start';$('headsCount').textContent='0';$('tailsCount').textContent='0';$('headsPct').textContent='--';$('streakVal').textContent='--';});
  $('flipBtn').addEventListener('click',flip);
})();`,
    body: [
      '<h2>Is this fair?</h2>',
      '<p>Yes — each flip is independent with exactly a 50% chance of heads or tails. We use <code>crypto.getRandomValues()</code> sourced from OS entropy. No bias, no memory, no way to predict. Physical coins can be slightly biased by weight distribution — this one cannot.</p>',
      '<h2>The gambler\'s fallacy</h2>',
      '<p>Five heads in a row? The next flip is still 50/50. The coin has no memory. This is one of the most common misunderstandings in probability — streakes of any length are always possible and never change the next outcome.</p>'
    ],
    faqs: [
      ['Can I get 10 heads in a row?', 'Yes — (0.5)^10 ≈ 0.098%. Rare but not impossible. Over 1,000 flips expect roughly one streak of 10.'],
      ['How is this different from a real coin?', 'Statistically identical. Physical coins have tiny biases from minting; this one has zero bias.'],
      ['Multiple coins at once?', 'Click Flip multiple times quickly — each click is one independent flip.'],
      ['Deciding among 3+ options?', 'Use our <a href="/tools/random-number-generator">Random Number Generator</a> with min=1, max=N.'],
      ['History reset?', 'Stored only in browser memory — gone on reload or Reset button. Nothing is persisted.']
    ],
    related: [
      { href: '/tools/dice-roller', emoji: '🎲', title: 'Dice Roller', desc: 'Any-sided dice.' },
      { href: '/tools/random-number-generator', emoji: '🔢', title: 'Random Number', desc: 'Any range.' },
      { href: '/tools/password-generator', emoji: '🔐', title: 'Passwords', desc: 'Strong passwords.' }
    ],
    seeAlso: [['Dice Roller','/tools/dice-roller'],['Random Number','/tools/random-number-generator'],['🪙 All Random','/#everyday']]
  },

  // ---------- 7. GPA Calculator ----------
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    emoji: '📊',
    title: 'GPA Calculator — Free College / High School Tool | mQuickCalc',
    desc: 'Calculate grade point average from letter grades or percentage scores. Supports 4.0 and 5.0 scales with credit-hour weighting.',
    lede: 'Enter each course\'s grade and credits — we compute GPA instantly. Letters or percentages, your choice.',
    cat: 'Everyday',
    calcCardInner: `
      <div class="row">
        <div class="field">
          <label for="scale">Scale</label>
          <select id="scale" class="input">
            <option value="4">4.0 scale (US standard)</option>
            <option value="5">5.0 scale (honors/AP)</option>
          </select>
        </div>
        <div class="field"><label><input type="checkbox" id="weights" checked> Weight by credits</label></div>
      </div>
      <div id="gpaRows"></div>
      <button id="addBtn" class="btn ghost">+ Add course</button>
      <div class="result" id="result">
        <div class="big" id="bigVal">--</div>
        <div class="dim" id="dimVal">Add courses above</div>
        <div class="grid">
          <div class="cell"><div class="lbl">Total credits</div><div class="val" id="creditsVal">--</div></div>
          <div class="cell"><div class="lbl">Quality points</div><div class="val" id="pointsVal">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  var S4={'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D+':1.3,'D':1.0,'D-':0.7,'F':0};
  var S5={'A+':5.0,'A':4.75,'A-':4.5,'B+':4.0,'B':3.75,'B-':3.5,'C+':3.0,'C':2.75,'C-':2.5,'D+':2.0,'D':1.75,'D-':1.5,'F':0};
  function toPts(g,scale){
    g=String(g||'').trim().toUpperCase();
    var t=scale==5?S5:S4;
    if(t[g]!==undefined)return t[g];
    var n=parseFloat(g);if(isNaN(n))return NaN;
    if(scale===5){if(n>=97)return 5;if(n>=93)return 4.75;if(n>=90)return 4.5;if(n>=87)return 4;if(n>=83)return 3.75;if(n>=80)return 3.5;if(n>=77)return 3;if(n>=73)return 2.75;if(n>=70)return 2.5;if(n>=67)return 2;if(n>=63)return 1.75;if(n>=60)return 1.5;return 0;}
    if(n>=97)return 4;if(n>=93)return 4;if(n>=90)return 3.7;if(n>=87)return 3.3;if(n>=83)return 3;if(n>=80)return 2.7;if(n>=77)return 2.3;if(n>=73)return 2;if(n>=70)return 1.7;if(n>=67)return 1.3;if(n>=63)return 1;if(n>=60)return 0.7;return 0;
  }
  function calc(){
    var scale=+ $('scale').value;var weights=$('weights').checked;
    var tq=0,tc=0;
    document.querySelectorAll('.gpa-row').forEach(function(row){
      var g=row.querySelector('.gpa-grade').value;var c=weights?(+row.querySelector('.gpa-credit').value||0):1;
      var pts=toPts(g,scale);if(!isNaN(pts)){tq+=pts*c;tc+=c;}
    });
    var gpa=tc>0?tq/tc:0;
    $('bigVal').textContent=tc>0?gpa.toFixed(2):'--';
    $('dimVal').textContent='GPA on '+scale+'.0 scale';
    $('creditsVal').textContent=tc.toFixed(1);
    $('pointsVal').textContent=tq.toFixed(2);
    $('result').classList.add('show');
  }
  function addRow(name,grade,credit){
    var w=document.createElement('div');w.className='row gpa-row';w.style.marginBottom='6px';
    w.innerHTML='<div class="field" style="flex:2;"><input class="input gpa-name" type="text" placeholder="Course" value="'+(name||'')+'"></div>'
      +'<div class="field" style="flex:1;"><input class="input gpa-grade" type="text" placeholder="A-" value="'+(grade||'')+'"></div>'
      +'<div class="field" style="flex:1;"><input class="input gpa-credit" type="number" min="0" step="0.5" value="'+(credit||'3')+'"></div>'
      +'<button class="btn ghost gpa-del">✕</button>';
    $('gpaRows').appendChild(w);
    w.querySelectorAll('input').forEach(function(el){el.addEventListener('input',calc);});
    w.querySelector('.gpa-del').addEventListener('click',function(){w.remove();calc();});
    calc();
  }
  $('addBtn').addEventListener('click',function(){addRow('','B',3);});
  ['scale','weights'].forEach(function(id){$(id).addEventListener('change',calc);});
  addRow('Math 101','A',4);addRow('History','B+',3);addRow('English','A-',3);addRow('Chem Lab','C',2);
  calc();
})();`,
    body: [
      '<h2>How GPA is calculated</h2>',
      '<p>GPA is a <strong>weighted average</strong>. Each course earns quality points = grade points × credits. Sum all quality points, divide by total credits. If you uncheck "Weight by credits", every course counts the same regardless of meeting hours — rare but some schools use unweighted GPA for class ranking.</p>',
      '<h2>Scales</h2>',
      '<p>Most US schools use 4.0 (A=4, B=3, C=2, D=1, F=0). Honors / AP programs may use 5.0 where an A earns 5 points. Enter either letter grades (A+, A, A−, B+, …) or raw percentages (92, 85, …) — we handle both.</p>'
    ],
    faqs: [
      ['What is a good GPA?', 'Context matters. 3.5+ is competitive at most public US universities; elite schools see 3.8+. Grad school usually requires 3.0+. Anything above 3.0 keeps you in good standing.'],
      ['Is A+ the same as A?', 'Many US schools treat A+ and A both as 4.0. Some international schools map A+ higher (4.3 on 4-point, 5.0 on 5-point). Use the scale that matches your institution.'],
      ['Should I weight by credits?', 'Almost always yes. A 4-credit class should affect GPA twice as much as a 2-credit class.'],
      ['Percentages vs letters?', 'Either works — type "87" or "B+" and we convert. Conversion follows standard US college curves; your school may use its own table.'],
      ['Honors / AP?', 'Switch to the 5.0 scale for AP/honors classes. Regular classes stay on 4.0 — our 5.0 scale is for courses that earn a weighted maximum of 5.0.']
    ],
    related: [
      { href: '/tools/percentage-calculator', emoji: '📊', title: 'Percentage', desc: 'Percent of a number, % change.' },
      { href: '/tools/simple-budget-calculator', emoji: '💰', title: 'Simple Budget', desc: 'Income vs expenses.' },
      { href: '/tools/counter', emoji: '🔢', title: 'Counter', desc: 'Tally anything.' }
    ],
    seeAlso: [['Percentage Calculator','/tools/percentage-calculator'],['Simple Budget','/tools/simple-budget-calculator'],['📊 All Calculators','/#everyday']]
  },

  // ---------- 8. Unit Price Calculator ----------
  {
    slug: 'unit-price-calculator',
    name: 'Unit Price Calculator',
    emoji: '🏷️',
    title: 'Unit Price Calculator — Compare Any Two Products | mQuickCalc',
    desc: 'Compare two products with different sizes and prices — see which is actually cheaper per unit (oz, lb, L, or per item).',
    lede: 'Two products, two sizes, two prices — which is the real bargain? Enter both, we show unit price side by side.',
    cat: 'Everyday',
    calcCardInner: `
      <p style="margin:0 0 8px;color:var(--muted);font-size:0.85rem;">Product A</p>
      <div class="row">
        <div class="field"><label for="aPrice">Price ($)</label><input id="aPrice" class="input" type="number" min="0" step="0.01" value="3.99"></div>
        <div class="field"><label for="aSize">Size</label><input id="aSize" class="input" type="number" min="0" step="0.01" value="12"></div>
      </div>
      <p style="margin:12px 0 8px;color:var(--muted);font-size:0.85rem;">Product B</p>
      <div class="row">
        <div class="field"><label for="bPrice">Price ($)</label><input id="bPrice" class="input" type="number" min="0" step="0.01" value="5.29"></div>
        <div class="field"><label for="bSize">Size</label><input id="bSize" class="input" type="number" min="0" step="0.01" value="20"></div>
      </div>
      <label for="unit">Unit label (same for both)</label>
      <input id="unit" class="input" type="text" value="oz" style="margin-bottom:10px;">
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">Enter prices and sizes</div>
        <div class="grid">
          <div class="cell"><div class="lbl">A unit price</div><div class="val" id="aPer">--</div></div>
          <div class="cell"><div class="lbl">B unit price</div><div class="val" id="bPer">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function fmt(n){return '$'+n.toFixed(2);}
  function calc(){
    var aP=parseFloat($('aPrice').value),aS=parseFloat($('aSize').value);
    var bP=parseFloat($('bPrice').value),bS=parseFloat($('bSize').value);
    var unit=$('unit').value||'unit';
    if(!aP||!aS||!bP||!bS||aP<=0||bP<=0||aS<=0||bS<=0){$('bigVal').textContent='—';return;}
    var aPer=aP/aS,bPer=bP/bS;
    $('aPer').textContent=fmt(aPer)+' / '+unit;
    $('bPer').textContent=fmt(bPer)+' / '+unit;
    var cheaper=aPer<=bPer?'A':'B';
    var diff=Math.abs(aPer-bPer);
    var min=Math.min(aPer,bPer);
    var pct=min>0?(diff/min*100):0;
    $('bigVal').textContent='Product '+cheaper+' is cheaper';
    $('dimVal').textContent='Saves '+fmt(diff)+' / '+unit+' ('+pct.toFixed(1)+'%)';
    $('result').classList.add('show');
  }
  ['aPrice','aSize','bPrice','bSize','unit'].forEach(function(id){$(id).addEventListener('input',calc);});
  calc();
})();`,
    body: [
      '<h2>Why unit price matters</h2>',
      '<p>$3.99 for 12 oz vs $5.29 for 20 oz — which is cheaper? Divide price by size: A = $0.333/oz, B = $0.265/oz. Product B looks pricier at the register but is actually 20% cheaper per ounce. Unit price is the single most reliable way to spot real bargains at the grocery store.</p>',
      '<h2>How to use it in the store</h2>',
      '<p>US stores are legally required to show unit prices on shelf tags — but labels are often tiny, inconsistent, or missing entirely. Jot price and size into this calculator and know which is truly better before you reach the register.</p>'
    ],
    faqs: [
      ['What unit should I use?', 'Any — as long as both products match. Ounces, pounds, liters, milliliters, or "per item". Enter the label you want verbatim.'],
      ['Coupons and sales?', 'Subtract coupon from the price before entering. $3.99 with $0.50 coupon → enter 3.49.'],
      ['Is bigger always cheaper?', 'No. "Value" sizes sometimes markup per unit because people assume bigger = better deal. This calculator catches those tricks.'],
      ['Organic vs conventional?', 'The calculator only answers "which is cheaper", not "which is healthier/ethical". Both questions are important — this one handles the first.'],
      ['Perishables twist', 'Unit price is less useful if you will not finish the larger size before it expires. For milk, bread, produce — factor in what you will actually consume.']
    ],
    related: [
      { href: '/tools/percentage-calculator', emoji: '📊', title: 'Percentage', desc: '% of a number, % change.' },
      { href: '/tools/fuel-cost-calculator', emoji: '⛽', title: 'Fuel Cost', desc: 'Compare gas stations by cost per mile.' },
      { href: '/tools/simple-budget-calculator', emoji: '💰', title: 'Simple Budget', desc: 'Income vs expenses.' }
    ],
    seeAlso: [['Percentage Calculator','/tools/percentage-calculator'],['Fuel Cost Calculator','/tools/fuel-cost-calculator'],['🏷️ All Shopping','/#everyday']]
  },

  // ---------- 9. Fuel Cost Calculator ----------
  {
    slug: 'fuel-cost-calculator',
    name: 'Fuel Cost Calculator',
    emoji: '⛽',
    title: 'Fuel Cost Calculator — Trip & Compare Gas Stations | mQuickCalc',
    desc: 'Calculate total fuel cost for a road trip, cost per mile, tank fill-up cost. Any vehicle, any price.',
    lede: 'How much will your road trip cost in gas? How much do you save by driving across town for cheaper fuel? One calculator, all the answers.',
    cat: 'Everyday',
    calcCardInner: `
      <div class="row">
        <div class="field"><label for="price">Price per gallon ($)</label><input id="price" class="input" type="number" min="0" step="0.01" value="3.49"></div>
        <div class="field"><label for="mpg">Your vehicle MPG</label><input id="mpg" class="input" type="number" min="0" step="0.1" value="28"></div>
      </div>
      <div class="row">
        <div class="field"><label for="distance">Trip distance (mi)</label><input id="distance" class="input" type="number" min="0" step="1" value="300"></div>
        <div class="field"><label for="tank">Tank capacity (gal)</label><input id="tank" class="input" type="number" min="0" step="0.1" value="14"></div>
      </div>
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">Enter price, MPG, distance</div>
        <div class="grid">
          <div class="cell"><div class="lbl">Cost per mile</div><div class="val" id="costPerMile">--</div></div>
          <div class="cell"><div class="lbl">Tank fill-up</div><div class="val" id="tankCost">--</div></div>
          <div class="cell"><div class="lbl">Gallons needed</div><div class="val" id="gallons">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function calc(){
    var price=+ $('price').value||0, mpg=+ $('mpg').value||0, dist=+ $('distance').value||0, tank=+ $('tank').value||0;
    var trip=(mpg>0&&dist>0)?(dist/mpg)*price:0;
    var cpm=mpg>0?price/mpg:0;
    var tc=tank>0?tank*price:0;
    var gl=(mpg>0&&dist>0)?(dist/mpg):0;
    $('bigVal').textContent=trip>0?'$'+trip.toFixed(2):'—';
    $('dimVal').textContent=dist+' mi @ $'+price.toFixed(2)+'/gal, '+mpg+' mpg';
    $('costPerMile').textContent=cpm>0?'$'+cpm.toFixed(3):'--';
    $('tankCost').textContent=tc>0?'$'+tc.toFixed(2):'--';
    $('gallons').textContent=gl>0?gl.toFixed(1)+' gal':'--';
    $('result').classList.add('show');
  }
  ['price','mpg','distance','tank'].forEach(function(id){$(id).addEventListener('input',calc);});
  calc();
})();`,
    body: [
      '<h2>The math</h2>',
      '<p>Total trip cost = (distance ÷ MPG) × price-per-gallon. Cost per mile = price-per-gallon ÷ MPG. These two numbers are the most useful way to think about fuel — MPG alone is meaningless without knowing what you pay per gallon. A 25 MPG car at $3.50/gal and a 50 MPG hybrid at $3.50/gal differ by exactly $0.07 per mile.</p>',
      '<h2>Real-world tips</h2>',
      '<p>Dropping highway speed from 70 mph to 60 mph saves ~15% on fuel. Check tire pressure monthly — under-inflation costs 3–4% MPG. Driving across town for $0.10 cheaper gas is usually worth it if the station is within 2–3 miles (at 28 MPG and 14-gallon tank you save $1.40 per fill).</p>'
    ],
    faqs: [
      ['What is my real MPG?', 'Track several fill-ups: reset trip meter, fill to same click each time, divide miles by gallons added. EPA sticker MPG is often 10–20% optimistic.'],
      ['Worth driving out of the way for cheaper gas?', 'Divide price diff by MPG to get $ saved per tank, subtract gas spent on the extra miles. At $0.10 cheaper / 28 MPG / 14 gal tank = $1.40 saved. A 2-mile detour costs ~$0.25 gas — worth it.'],
      ['Diesel vs gas?', 'Enter both prices with both MPGs and compare cost-per-mile. Diesels are 25–35% more efficient but fuel is pricier in the US.'],
      ['Does AC hurt MPG?', 'Yes — especially at low speeds (5–20% hit). Above 55 mph, open windows use more fuel than AC.'],
      ['How accurate is this?', 'As accurate as your inputs. Biggest variable is real-world MPG (speed, weather, traffic, maintenance).']
    ],
    related: [
      { href: '/tools/unit-price-calculator', emoji: '🏷️', title: 'Unit Price', desc: 'Cheaper product spotter.' },
      { href: '/tools/percentage-calculator', emoji: '📊', title: 'Percentage', desc: '% change on gas prices.' },
      { href: '/tools/work-hours-calculator', emoji: '⏰', title: 'Work Hours', desc: 'Commute cost vs earnings.' }
    ],
    seeAlso: [['Unit Price Calculator','/tools/unit-price-calculator'],['Percentage Calculator','/tools/percentage-calculator'],['⛽ All Trip','/#everyday']]
  },

  // ---------- 10. Recipe Servings Calculator ----------
  {
    slug: 'recipe-servings-calculator',
    name: 'Recipe Servings Calculator',
    emoji: '🍳',
    title: 'Recipe Servings Calculator — Scale Any Recipe | mQuickCalc',
    desc: 'Scale any recipe up or down for any number of servings. Enter every ingredient and we compute adjusted amounts instantly.',
    lede: 'Found a recipe serving 4 but you need 9? Enter original servings, target servings, and every ingredient — we scale them all.',
    cat: 'Everyday',
    calcCardInner: `
      <div class="row">
        <div class="field"><label for="orig">Original serves</label><input id="orig" class="input" type="number" min="1" step="1" value="4"></div>
        <div class="field"><label for="target">Target serves</label><input id="target" class="input" type="number" min="1" step="1" value="8"></div>
      </div>
      <div id="recipeRows"></div>
      <button id="addBtn" class="btn ghost">+ Add ingredient</button>
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">Factor = target ÷ original</div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function fmt(n){if(!isFinite(n))return'--';if(n===Math.floor(n))return String(n);return Number(n.toFixed(2)).toString().replace(/\\.0+$/,'');}
  function addRow(name,qty){
    var w=document.createElement('div');w.className='row recipe-row';w.style.marginBottom='6px';
    w.innerHTML='<div class="field" style="flex:2;"><input class="input rec-name" type="text" placeholder="Ingredient" value="'+(name||'')+'"></div>'
      +'<div class="field" style="flex:1;"><input class="input rec-qty" type="number" min="0" step="any" value="'+(qty||'')+'"></div>'
      +'<span style="align-self:center;">→</span>'
      +'<div class="field" style="flex:1;"><input class="input rec-out" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;"></div>'
      +'<button class="btn ghost rec-del">✕</button>';
    $('recipeRows').appendChild(w);
    w.querySelectorAll('input').forEach(function(el){el.addEventListener('input',calc);});
    w.querySelector('.rec-del').addEventListener('click',function(){w.remove();calc();});
    calc();
  }
  function calc(){
    var orig=+ $('orig').value||0, tgt=+ $('target').value||0;
    var factor=(orig>0&&tgt>0)?tgt/orig:0;
    $('bigVal').textContent=factor>0?factor.toFixed(2)+'×':'--';
    $('dimVal').textContent='Multiply every ingredient by '+factor.toFixed(3);
    document.querySelectorAll('.recipe-row').forEach(function(row){
      var qty=parseFloat(row.querySelector('.rec-qty').value);
      row.querySelector('.rec-out').value=(!isNaN(qty)&&factor>0)?fmt(qty*factor):'--';
    });
    $('result').classList.add('show');
  }
  $('addBtn').addEventListener('click',function(){addRow('','');});
  ['orig','target'].forEach(function(id){$(id).addEventListener('input',calc);});
  addRow('flour (cups)','2');addRow('sugar (cups)','1.5');addRow('eggs','3');addRow('milk (cups)','1.25');addRow('salt (tsp)','0.5');
  calc();
})();`,
    body: [
      '<h2>How scaling works</h2>',
      '<p>Scale factor = target servings ÷ original servings. A recipe for 4 you want for 8 people → factor 2 — every quantity doubles. Simple math, but doing it in your head while cooking is error-prone. This calculator removes that step.</p>',
      '<h2>Ingredients that should NOT scale linearly</h2>',
      '<p>Salt, pepper, and strong spices should scale by roughly the <strong>square root of the factor</strong>, not the factor itself — or season to taste at the end. Yeast and leavening agents (baking powder, baking soda) can be reduced slightly in very large batches to prevent over-rising. For most home cooking, linear scaling works just fine.</p>'
    ],
    faqs: [
      ['Mixing units (cups, grams, oz)?', 'Yes — we scale by factor only, preserving your unit labels. But converting everything to metric grams is most accurate for baking, since volume varies by scoop technique.'],
      ['Weird decimals in output?', 'Math. 2 cups × 1.8 = 3.6 cups. Round to kitchen-practical amounts — 3.5 cups or 3¾ cups are fine approximations.'],
      ['Scaling down to half a serving?', 'Enter original = 2, target = 1. Not recommended for most recipes — single-serve cooking is one thing, halving a cake is rarely worth the dishes.'],
      ['Cooking time changes?', 'Usually not for small changes (0.5–2×). For very large batches, thick pans or full ovens may need slightly longer. Use a thermometer, not the clock.'],
      ['Oven temperature?', 'Never scale oven temperature. Keep it the same. Only cooking time may shift for extreme batch sizes.']
    ],
    related: [
      { href: '/tools/unit-price-calculator', emoji: '🏷️', title: 'Unit Price', desc: 'Compare grocery prices.' },
      { href: '/tools/percentage-calculator', emoji: '📊', title: 'Percentage', desc: 'Percentages in cooking.' },
      { href: '/tools/cooking-converter', emoji: '🥄', title: 'Cooking Converter', desc: 'cups → oz → grams.' }
    ],
    seeAlso: [['Unit Price Calculator','/tools/unit-price-calculator'],['Cooking Converter','/tools/cooking-converter'],['🍳 All Food','/#everyday']]
  },

  // ---------- 11. Day of Week Calculator ----------
  {
    slug: 'day-of-week-calculator',
    name: 'Day of Week Calculator',
    emoji: '📅',
    title: 'Day of Week Calculator — What Day Was That Date? | mQuickCalc',
    desc: 'Find what day of the week any date fell (or will fall) on, from any year in history. Also shows relative days until/since today.',
    lede: 'Enter any date — past, present, or future — and we tell you what day it was. Jan 1, 2000 was a Saturday — check it.',
    cat: 'Everyday',
    calcCardInner: `
      <label for="date">Pick a date</label>
      <input id="date" class="input" type="date" style="margin-bottom:12px;">
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">—</div>
        <div class="grid"><div class="cell"><div class="lbl">Relative to today</div><div class="val" id="diffLabel">--</div></div></div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function calc(){
    var d=new Date($('date').value+'T00:00:00');
    if(isNaN(d.getTime())){$('bigVal').textContent='--';return;}
    var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    $('bigVal').textContent=days[d.getDay()];
    $('dimVal').textContent=d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
    var now=new Date();now.setHours(0,0,0,0);
    var diff=Math.round((now-d)/86400000);
    $('diffLabel').textContent=diff===0?'That is today':diff>0?diff.toLocaleString()+' day'+(diff===1?'':'s')+' ago':(-diff).toLocaleString()+' day'+(diff===-1?'':'s')+' from now';
    $('result').classList.add('show');
  }
  $('date').addEventListener('change',calc);
  calc();
})();`,
    body: [
      '<h2>How we know</h2>',
      '<p>We use JavaScript\'s native <code>Date</code> object, which tracks days since January 1, 1970 UTC internally, then call <code>getDay()</code> (0 = Sunday through 6 = Saturday). This works for dates from roughly April 200 million BCE to 275,760 CE — everything you will ever need.</p>',
      '<h2>Fun day-of-week facts</h2>',
      '<p>The 13th falls on a Friday more often than any other weekday on average — 688 times per 400-year Gregorian cycle vs 684 for each other day. Jan 1, 2000 = Saturday. Jan 1, 2025 = Wednesday. Jan 1, 2100 = Friday. Fun bet: ask a friend what day their 30th birthday will be — bet before you calculate.</p>'
    ],
    faqs: [
      ['Leap years accounted for?', 'Yes — JavaScript Date handles Gregorian leap years correctly: Feb 29 only in years divisible by 4, except century years not divisible by 400.'],
      ['Julian calendar dates (pre-1582)?', 'We use Gregorian for all dates retroactively. Add 10 days (1500s) to 13 days (1900s) to convert Julian → Gregorian. Russia switched in 1918.'],
      ['Same worldwide?', 'Yes — Monday in New York is Monday in Tokyo. Day of week is universal.'],
      ['Negative diff?', 'Future dates show negative because "days since today" is negative — we flip the wording to "days from now".'],
      ['Zeller\'s formula?', 'Zeller\'s is a manual algorithm; we use JS Date. Same result, fewer bugs.']
    ],
    related: [
      { href: '/tools/week-number-calculator', emoji: '📆', title: 'Week Number', desc: 'ISO & US week numbers.' },
      { href: '/tools/age-calculator', emoji: '🎂', title: 'Age Calculator', desc: 'Exact age from birth date.' },
      { href: '/tools/date-difference-calculator', emoji: '📅', title: 'Date Difference', desc: 'Days between two dates.' }
    ],
    seeAlso: [['Week Number Calculator','/tools/week-number-calculator'],['Age Calculator','/tools/age-calculator'],['📅 All Dates','/speed-time']]
  },

  // ---------- 12. Week Number Calculator ----------
  {
    slug: 'week-number-calculator',
    name: 'Week Number Calculator',
    emoji: '📆',
    title: 'Week Number Calculator — ISO & US Week Numbers | mQuickCalc',
    desc: 'Find the ISO 8601 week number or US week number for any date. Also shows weeks remaining in the year.',
    lede: 'Which week of the year are we in? Any date, any year — ISO 8601 (international) and US convention side by side.',
    cat: 'Everyday',
    calcCardInner: `
      <label for="date">Pick a date</label>
      <input id="date" class="input" type="date" style="margin-bottom:12px;">
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">—</div>
        <div class="grid">
          <div class="cell"><div class="lbl">ISO 8601 week</div><div class="val" id="isoVal">--</div></div>
          <div class="cell"><div class="lbl">US week</div><div class="val" id="usVal">--</div></div>
          <div class="cell"><div class="lbl">Weeks remaining</div><div class="val" id="remainVal">--</div></div>
          <div class="cell"><div class="lbl">ISO week count this year</div><div class="val" id="totalIso">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function isoWeek(date){
    var d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
    var dn=d.getUTCDay()||7;
    d.setUTCDate(d.getUTCDate()+4-dn);
    var ys=new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d-ys)/86400000)+1)/7);
  }
  function usWeek(date){
    var s=new Date(date.getFullYear(),0,1);
    return Math.ceil(((date-s)/86400000+s.getDay()+1)/7);
  }
  function weeksInISO(year){return isoWeek(new Date(Date.UTC(year,11,28)).getUTCFullYear()===year?new Date(Date.UTC(year,11,28)):new Date(Date.UTC(year+1,0,4)));}
  function calc(){
    var d=new Date($('date').value+'T00:00:00');
    if(isNaN(d.getTime())){$('bigVal').textContent='--';return;}
    var iso=isoWeek(d), us=usWeek(d), year=d.getFullYear(), totalIso=weeksInISO(year);
    $('bigVal').textContent='ISO Week '+iso;
    $('dimVal').textContent=d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})+' ('+year+')';
    $('isoVal').textContent=iso+' / '+totalIso;
    $('usVal').textContent=us;
    $('remainVal').textContent=Math.max(0,totalIso-iso)+' weeks';
    $('totalIso').textContent=totalIso;
    $('result').classList.add('show');
  }
  $('date').addEventListener('change',calc);
  calc();
})();`,
    body: [
      '<h2>ISO 8601 vs US</h2>',
      '<p><strong>ISO 8601</strong> (international standard): weeks start Monday, week 1 contains January 4 (equivalently, has the first Thursday). This means week 1 can begin in late December and week 52/53 can spill into early January. <strong>US convention</strong>: weeks start Sunday, week 1 always contains Jan 1.</p>',
      '<h2>Why it matters</h2>',
      '<p>International business, project management (weekly sprints, OKRs), and healthcare (epidemiological tracking) all use ISO 8601. Saying "week 38" can mean different things to different nationalities — this calculator shows both so you always know which is which.</p>'
    ],
    faqs: [
      ['Why does ISO week 1 start in December?', 'ISO week 1 = week containing January 4. If Jan 1 is Fri/Sat/Sun, the first 3–6 days belong to the last week of the previous year.'],
      ['Why 53 weeks some years?', '365÷7=52.14, so most years = 52 weeks. A year starting on Thursday (or Wed in leap year) gets 53 weeks. Last: 2020. Next: 2026.'],
      ['Which to use?', 'ISO 8601 for anything international. US numbering only when audience is exclusively US. In doubt: "ISO week X of YYYY".'],
      ['Fiscal weeks?', 'Retailers use 4-5-4 calendars for financial reporting — different from both ISO and US. Not covered here.'],
      ['Christmas week number?', 'Dec 25 is almost always ISO week 52 or 53. Enter Dec 25 of any year to see.']
    ],
    related: [
      { href: '/tools/day-of-week-calculator', emoji: '📅', title: 'Day of Week', desc: 'What day was any date.' },
      { href: '/tools/date-difference-calculator', emoji: '🗓️', title: 'Date Difference', desc: 'Days between dates.' },
      { href: '/tools/age-calculator', emoji: '🎂', title: 'Age Calculator', desc: 'Your age from birthdate.' }
    ],
    seeAlso: [['Day of Week Calculator','/tools/day-of-week-calculator'],['Date Difference Calculator','/tools/date-difference-calculator'],['📆 All Dates','/speed-time']]
  },

  // ---------- 13. Work Hours Calculator ----------
  {
    slug: 'work-hours-calculator',
    name: 'Work Hours Calculator',
    emoji: '⏰',
    title: 'Work Hours Calculator — Weekly / Daily Timesheet | mQuickCalc',
    desc: 'Add up daily work hours from clock-in/clock-out times. Enter multiple days with lunch breaks — see weekly totals instantly.',
    lede: 'Enter clock-in and clock-out for each day, subtract breaks, and see your weekly sum — decimal hours for payroll.',
    cat: 'Everyday',
    calcCardInner: `
      <div id="whRows"></div>
      <button id="addBtn" class="btn ghost">+ Add day</button>
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">Weekly total</div>
        <div class="grid">
          <div class="cell"><div class="lbl">Decimal hours</div><div class="val" id="weeklyDec">--</div></div>
          <div class="cell"><div class="lbl">Avg per day</div><div class="val" id="avgDaily">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function toMin(t){if(!t)return null;var p=t.split(':').map(Number);if(p.length<2)return null;return p[0]*60+p[1];}
  function fmt(m){var h=Math.floor(m/60),mm=Math.round(m%60);return h+'h '+String(mm).padStart(2,'0')+'m';}
  function addRow(day,inT,outT,brk){
    var w=document.createElement('div');w.className='row wh-row';w.style.marginBottom='6px';
    w.innerHTML='<div class="field" style="min-width:70px;"><label>Day</label><input class="input wh-day" type="text" value="'+(day||'')+'"></div>'
      +'<div class="field"><label>In</label><input class="input wh-in" type="time" value="'+(inT||'')+'"></div>'
      +'<div class="field"><label>Out</label><input class="input wh-out" type="time" value="'+(outT||'')+'"></div>'
      +'<div class="field" style="min-width:100px;"><label>Break (min)</label><input class="input wh-break" type="number" min="0" step="5" value="'+(brk||'30')+'"></div>'
      +'<div class="field" style="min-width:100px;"><label>Day total</label><input class="input wh-hours" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;"></div>'
      +'<button class="btn ghost wh-del">✕</button>';
    $('whRows').appendChild(w);
    w.querySelectorAll('input').forEach(function(el){el.addEventListener('input',calc);});
    w.querySelector('.wh-del').addEventListener('click',function(){w.remove();calc();});
    calc();
  }
  function calc(){
    var weekly=0,n=0;
    document.querySelectorAll('.wh-row').forEach(function(row){
      var inT=toMin(row.querySelector('.wh-in').value),outT=toMin(row.querySelector('.wh-out').value);
      var brk=+row.querySelector('.wh-break').value||0;
      var hours=row.querySelector('.wh-hours');
      var daily=(inT!==null&&outT!==null&&outT>inT)?Math.max(0,outT-inT-brk):0;
      hours.value=daily>0?fmt(daily):'--';
      if(daily>0){weekly+=daily;n++;}
    });
    $('bigVal').textContent=fmt(weekly);
    $('dimVal').textContent='Weekly total ('+n+' day'+(n===1?'':'s')+')';
    $('weeklyDec').textContent=(weekly/60).toFixed(2)+' hrs';
    $('avgDaily').textContent=n>0?fmt(weekly/n):'--';
    $('result').classList.add('show');
  }
  $('addBtn').addEventListener('click',function(){addRow('Fri','09:00','17:30','30');});
  addRow('Mon','09:00','17:30','30');addRow('Tue','08:30','17:00','30');addRow('Wed','09:15','18:00','45');addRow('Thu','09:00','17:00','30');addRow('Fri','09:00','16:00','30');
  calc();
})();`,
    body: [
      '<h2>How to use this</h2>',
      '<p>Enter clock-in and clock-out for each day in 24-hour format. The break field is minutes you took for lunch — we subtract it automatically. If you split a shift, add two rows for the same day. The weekly decimal hours field matches exactly what payroll systems expect (37h 30m = 37.50).</p>',
      '<h2>Overtime</h2>',
      '<p>We show total hours only — overtime pay rates are your employer\'s job (1.5× for hours over 40 in a week in the US). For freelance or consulting, this is your billable time — subtract non-billable (admin, meetings, email) if you track billable vs raw separately.</p>'
    ],
    faqs: [
      ['Decimal hours for payroll?', 'We show this in the "Decimal hours" field. Payroll systems almost always use decimal, not hours/minutes.'],
      ['Work through lunch?', 'Enter 0 for break minutes — we assume you worked the entire span.'],
      ['Is this a timesheet?', 'It is a calculator — nothing is saved. Reload and entries are gone. Copy the result into a spreadsheet or use a dedicated time-tracking app if you need persistence.'],
      ['Why does a day show "--"?', 'Either In or Out blank, or Out before In. Fix the times and it populates.'],
      ['Monthly totals?', 'Not yet — add up to ~22 workdays per month in the rows and sum manually. A monthly mode may come later.']
    ],
    related: [
      { href: '/tools/stopwatch', emoji: '⏱️', title: 'Stopwatch', desc: 'Time tasks live.' },
      { href: '/tools/countdown-timer', emoji: '⏳', title: 'Countdown Timer', desc: 'Pomodoro / meetings.' },
      { href: '/tools/simple-budget-calculator', emoji: '💰', title: 'Simple Budget', desc: 'Does earnings cover expenses?' }
    ],
    seeAlso: [['Stopwatch','/tools/stopwatch'],['Countdown Timer','/tools/countdown-timer'],['⏰ All Time','/speed-time']]
  },

  // ---------- 14. Counter ----------
  {
    slug: 'counter',
    name: 'Counter',
    emoji: '🔢',
    title: 'Tally Counter — Free Online Clicker | mQuickCalc',
    desc: 'A simple, big online counter. Click to increment or decrement, hold for fast repeat. Perfect for inventory, laps, attendance, or anything.',
    lede: 'Big buttons, big number, zero friction. Tap to count, hold for fast repeat. Works with thumb on mobile.',
    cat: 'Everyday',
    calcCardInner: `
      <div style="text-align:center;padding:18px 0 4px;font-size:3.5rem;font-weight:600;font-variant-numeric:tabular-nums;" id="bigVal">0</div>
      <div class="row" style="justify-content:center;margin-top:12px;">
        <div class="field" style="min-width:80px;"><label>Step</label><input id="step" class="input" type="number" min="1" step="1" value="1"></div>
      </div>
      <div style="display:flex;gap:14px;justify-content:center;margin-top:10px;">
        <button id="minusBtn" class="btn ghost" style="min-width:72px;font-size:1.5rem;">−</button>
        <button id="plusBtn" class="btn" style="min-width:96px;font-size:1.5rem;">+</button>
      </div>
      <button id="resetBtn" class="btn ghost" style="display:block;margin:14px auto 0;">Reset</button>
      <div class="result" id="result"><div class="dim">Nothing is saved — close tab to reset.</div></div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  var count=0,step=1;
  function render(){$('bigVal').textContent=count.toLocaleString();}
  $('plusBtn').addEventListener('click',function(){count+=step;render();});
  $('minusBtn').addEventListener('click',function(){count-=step;render();});
  $('resetBtn').addEventListener('click',function(){count=0;render();});
  $('step').addEventListener('input',function(){var v=+ $('step').value;step=(isNaN(v)||v<1)?1:v;});
  // long press repeat
  ['plusBtn','minusBtn'].forEach(function(id){
    var el=$(id),t=null,r=null;
    function start(fn){fn();t=setTimeout(function(){r=setInterval(fn,80);},350);}
    function stop(){clearTimeout(t);clearInterval(r);}
    el.addEventListener('mousedown',function(){if(id==='plusBtn')start(function(){count+=step;render();});else start(function(){count-=step;render();});});
    el.addEventListener('mouseup',stop);el.addEventListener('mouseleave',stop);
    el.addEventListener('touchstart',function(e){e.preventDefault();if(id==='plusBtn')start(function(){count+=step;render();});else start(function(){count-=step;render();});});
    el.addEventListener('touchend',stop);el.addEventListener('touchcancel',stop);
  });
  render();
})();`,
    body: [
      '<h2>What to count</h2>',
      '<p>People entering a room, laps you swim or run, drinks poured, boxes on a shelf, button presses in an experiment. Hold + or − for fast repeating. Step field lets you count by 2s, 5s, 10s — whatever makes sense.</p>',
      '<h2>Reliability</h2>',
      '<p>Nothing saved in browser storage. Close the tab = reset. If you are counting something important (event attendance?), take a screenshot before leaving. The counter works fully offline once loaded.</p>'
    ],
    faqs: [
      ['Count backwards?', 'Yes — tap − or hold it down. Goes negative freely.'],
      ['Maximum?', 'JavaScript numbers up to 2^53 − 1 (~9 quadrillion). You will not hit this.'],
      ['Save my count?', 'Not automatically — no localStorage used. Take a screenshot if you need to record.'],
      ['Work offline?', 'Yes — bookmark once, loads from cache. Add to home screen on mobile for one-tap access.'],
      ['Undo accidental reset?', 'No undo. Take screenshots periodically if catastrophic.']
    ],
    related: [
      { href: '/tools/dice-roller', emoji: '🎲', title: 'Dice Roller', desc: 'Roll dice.' },
      { href: '/tools/coin-flip', emoji: '🪙', title: 'Coin Flip', desc: 'Heads or tails.' },
      { href: '/tools/random-number-generator', emoji: '🎯', title: 'Random Number', desc: 'Generate random integers.' }
    ],
    seeAlso: [['Dice Roller','/tools/dice-roller'],['Coin Flip','/tools/coin-flip'],['🔢 All Fun','/#everyday']]
  },

  // ---------- 15. Number Base Converter ----------
  {
    slug: 'number-base-converter',
    name: 'Number Base Converter',
    emoji: '🔢',
    title: 'Number Base Converter — Binary, Hex, Octal, Decimal | mQuickCalc',
    desc: 'Convert any integer between binary, octal, decimal, hexadecimal, and any custom base (2–36). Programmers love this page.',
    lede: 'Type a number in any base, pick which base it is, and we show it in every common base at once. Clean, fast, no ads.',
    cat: 'Everyday',
    calcCardInner: `
      <label for="input">Number</label>
      <div class="row">
        <div class="field" style="flex:3;"><input id="input" class="input" type="text" value="255"></div>
        <div class="field" style="flex:1;">
          <label for="base">Input base</label>
          <select id="base" class="input">
            <option value="2">2 (binary)</option>
            <option value="8">8 (octal)</option>
            <option value="10" selected>10 (decimal)</option>
            <option value="16">16 (hex)</option>
          </select>
        </div>
      </div>
      <div class="result" id="result">
        <div class="grid">
          <div class="cell"><div class="lbl">Binary (2)</div><input id="bin" class="input" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;"></div></div>
          <div class="cell"><div class="lbl">Octal (8)</div><input id="oct" class="input" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;"></div></div>
          <div class="cell"><div class="lbl">Decimal (10)</div><input id="dec" class="input" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;"></div></div>
          <div class="cell"><div class="lbl">Hex (16)</div><input id="hex" class="input" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;"></div></div>
          <div class="cell"><div class="lbl">Custom base</div>
            <input id="customBase" class="input" type="number" min="2" max="36" step="1" value="36" style="margin-bottom:4px;">
            <input id="custom" class="input" readonly value="--" style="font-family:ui-monospace,Menlo,monospace;">
          </div></div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function convert(){
    var input=$('input').value.trim();var base=+ $('base').value;
    if(!input||isNaN(base))return;
    var n=parseInt(input,base);
    if(isNaN(n)){['bin','oct','dec','hex','custom'].forEach(function(id){$(id).value='--';});return;}
    $('bin').value=n.toString(2);
    $('oct').value=n.toString(8);
    $('dec').value=n.toString(10);
    $('hex').value=n.toString(16).toUpperCase();
    var cb=+ $('customBase').value||10;
    $('custom').value=(cb>=2&&cb<=36)?n.toString(cb).toUpperCase():'--';
    $('result').classList.add('show');
  }
  ['base','input','customBase'].forEach(function(id){$(id).addEventListener('input',convert);});
  convert();
})();`,
    body: [
      '<h2>Number bases in a nutshell</h2>',
      '<p>Every number is written in some base. Base 10 (decimal) uses 10 digits (0–9). Base 2 (binary) uses only 0 and 1 — the language of computers. Base 16 (hex) uses 0–9 plus A–F and is the most compact human-readable way to write binary data (1 hex digit = 4 binary digits).</p>',
      '<h2>Programming common bases</h2>',
      '<p>Hex for CSS color codes (#FF5733 = red), memory addresses, and error codes. Octal for Unix file permissions (chmod 755). Binary is what the CPU actually executes. Every programmer converts between these in their head at some point — this page saves you the arithmetic.</p>'
    ],
    faqs: [
      ['What does 0xFF mean?', 'Hex for 255 decimal, or 11111111 binary — one full byte. The 0x prefix marks hex; just type FF and set base to 16.'],
      ['Negative numbers?', 'JavaScript handles signed integers — yes, enter -42 decimal and we show it everywhere. Some languages use two\'s complement for negative binary.'],
      ['What is base 36?', 'Uses 0–9 + A–Z, so every number maps to digits and letters. Great for URL shorteners and compressing IDs: "HELLO" base 36 = 2.17 billion decimal.'],
      ['How does conversion work?', 'JS <code>parseInt(str,base)</code> parses base 2–36; <code>n.toString(base)</code> converts back. We just wire both directions.'],
      ['Fractions?', 'Not in this version — integers only. Fractional bases get complicated (how do you write 0.1 in binary?). Stick to integers.']
    ],
    related: [
      { href: '/tools/password-generator', emoji: '🔐', title: 'Passwords', desc: 'Strong random passwords.' },
      { href: '/tools/random-number-generator', emoji: '🎲', title: 'Random Numbers', desc: 'Any range.' },
      { href: '/tools/percentage-calculator', emoji: '📊', title: 'Percentages', desc: 'Everyday percent math.' }
    ],
    seeAlso: [['Password Generator','/tools/password-generator'],['Random Number','/tools/random-number-generator'],['🔢 All Number','/#everyday']]
  },

  // ---------- 16. Simple Budget Calculator ----------
  {
    slug: 'simple-budget-calculator',
    name: 'Simple Budget Calculator',
    emoji: '💰',
    title: 'Simple Budget Calculator — Income vs Expenses | mQuickCalc',
    desc: 'Enter monthly income and expenses — see if you are saving or overspending. No accounts, zero data stored.',
    lede: 'Total income, total expenses, gap = balance. Positive = you save. Negative = it is time to trim. No signup needed.',
    cat: 'Everyday',
    calcCardInner: `
      <p style="margin:0 0 8px;color:var(--muted);font-size:0.85rem;">Monthly income</p>
      <div id="incomeRows"></div>
      <button id="addIncome" class="btn ghost" style="margin-bottom:16px;">+ Add income</button>
      <p style="margin:0 0 8px;color:var(--muted);font-size:0.85rem;">Monthly expenses</p>
      <div id="expenseRows"></div>
      <button id="addExpense" class="btn ghost">+ Add expense</button>
      <div class="result" id="result">
        <div class="big" id="bigVal">—</div>
        <div class="dim" id="dimVal">Add income and expenses above</div>
        <div class="grid">
          <div class="cell"><div class="lbl">Total income</div><div class="val" id="incomeTotal">--</div></div>
          <div class="cell"><div class="lbl">Total expenses</div><div class="val" id="expenseTotal">--</div></div>
          <div class="cell"><div class="lbl">Savings rate</div><div class="val" id="savingsRate">--</div></div>
        </div>
      </div>`,
    js: `(function () {
  function $(id){return document.getElementById(id);}
  function fmt(n){return(n>=0?'$':'-$')+Math.abs(n).toFixed(2);}
  function addRow(container,label,value){
    var w=document.createElement('div');w.className='row budget-row';w.style.marginBottom='6px';
    w.innerHTML='<div class="field" style="flex:2;"><input class="input b-name" type="text" placeholder="'+(label||'e.g. Salary')+'"></div>'
      +'<div class="field" style="flex:1;"><input class="input b-val" type="number" min="0" step="0.01" value="'+(value||0)+'"></div>'
      +'<button class="btn ghost b-del">✕</button>';
    $(container).appendChild(w);
    w.querySelectorAll('input').forEach(function(el){el.addEventListener('input',calc);});
    w.querySelector('.b-del').addEventListener('click',function(){w.remove();calc();});
    calc();
  }
  function sum(sel){var t=0;document.querySelectorAll(sel).forEach(function(el){t+=parseFloat(el.value)||0;});return t;}
  function calc(){
    var income=sum('#incomeRows .b-val'), expense=sum('#expenseRows .b-val');
    var bal=income-expense;
    $('bigVal').textContent=fmt(bal);
    $('dimVal').textContent=bal>=0?'Good — you are saving':'Warning — spending more than you earn';
    $('incomeTotal').textContent=fmt(income);
    $('expenseTotal').textContent=fmt(expense);
    $('savingsRate').textContent=income>0?((bal/income)*100).toFixed(1)+'%':'--';
    $('result').classList.add('show');
  }
  $('addIncome').addEventListener('click',function(){addRow('incomeRows','e.g. Salary',0);});
  $('addExpense').addEventListener('click',function(){addRow('expenseRows','e.g. Rent',0);});
  // seed
  addRow('incomeRows','Salary',4500);addRow('incomeRows','Side gig',500);
  addRow('expenseRows','Rent',1600);addRow('expenseRows','Groceries',500);addRow('expenseRows','Utilities',200);addRow('expenseRows','Transport',250);addRow('expenseRows','Entertainment',150);
  calc();
})();`,
    body: [
      '<h2>How to read the results</h2>',
      '<p><strong>Balance</strong> = total income − total expenses. Positive = you had money left for savings, investing, or one-offs. Negative = you spent more than you earned — time to find where to cut.</p>',
      '<p><strong>Savings rate</strong> = balance ÷ income × 100. 20%+ is healthy by most planners\' standards; 0–10% means paycheck-to-paycheck; negative means going into debt.</p>',
      '<h2>Budgeting frameworks</h2>',
      '<p><strong>50/30/20</strong>: 50% needs (rent, food, utilities), 30% wants (dining, travel, subscriptions), 20% savings + debt paydown. <strong>Envelope</strong>: cash in labeled envelopes each month. <strong>Zero-based</strong>: every dollar assigned a job so income − expenses = exactly 0. Find what you will actually stick with.</p>'
    ],
    faqs: [
      ['Net or gross income?', 'Net — after tax, after 401k, after health insurance. That is the money that actually hits your bank. Gross is what your employer quotes but not what you live on.'],
      ['What counts as an expense?', 'Everything leaving your bank: rent, groceries, utilities, phone, car payment, insurance, subscriptions, dining out, gas, entertainment, credit card payments.'],
      ['One-off purchases?', 'Annual insurance premiums or Christmas gifts → divide by 12 and include monthly estimate. True one-offs (rare $500 repair) → exclude; handle from emergency fund.'],
      ['Zero balance okay?', 'Yes — if "zero" means every dollar was assigned (zero-based budgeting). The red flag is when zero means you spent every dollar with no plan.'],
      ['Save or pay debt first?', 'Mathematically: pay off highest-interest debt (above 7–8% APR). Behaviorally: $1,000 emergency fund first, then attack debt. Do what makes you act consistently.']
    ],
    related: [
      { href: '/tools/percentage-calculator', emoji: '📊', title: 'Percentage', desc: '% of income breakdown.' },
      { href: '/tools/unit-price-calculator', emoji: '🏷️', title: 'Unit Price', desc: 'Cheaper grocery spotter.' },
      { href: '/tools/fuel-cost-calculator', emoji: '⛽', title: 'Fuel Cost', desc: 'Commute gas budget.' }
    ],
    seeAlso: [['Percentage Calculator','/tools/percentage-calculator'],['Unit Price Calculator','/tools/unit-price-calculator'],['💰 All Money','/#everyday']]
  }
];

// ========================================================================
// Template pieces
// ========================================================================

function buildHead(t) {
  const url = `${SITE_URL}/tools/${t.slug}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.desc)}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/css/site.css">
  <script type="application/ld+json">${jld({"@context":"https://schema.org","@type":"WebApplication","name":t.name,"url":url,"applicationCategory":"UtilityApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"description":t.desc})}</script>
  <meta property="og:title" content="${esc(t.title)}">
  <meta property="og:description" content="${esc(t.desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE_URL}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="mQuickCalc">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(t.title)}">
  <meta name="twitter:description" content="${esc(t.desc)}">
  <meta name="twitter:site" content="@mquickcalc">
  <script type="application/ld+json">${jld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem",position:1,name:"Home",item:SITE_URL+"/"},{"@type":"ListItem",position:2,name:t.name,item:url}]})}</script>
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#4f46e5">
  <script type="application/ld+json">${jld({"@context":"https://schema.org","@type":"HowTo","name":"How to use this calculator","step":[{"@type":"HowToStep",name:"Enter your values","text":"Fill in the required input fields."},{"@type":"HowToStep",name:"Click Calculate","text":"Press Calculate or the action button."},{"@type":"HowToStep",name:"Interpret the result","text":"Read the result instantly."}]})}</script>
</head>`;
}

function buildBodyTop(t) {
  return `<body data-site="main">
<a href="#main-content" class="skip-link">Skip to main content</a>

<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/">m<b>Quick</b>Calc</a>
    <nav><a href="/#converters">Converters</a><a href="/#calculators">Calculators</a><a href="/#everyday">Everyday</a><a href="/embed">Embeds</a><a href="/about">About</a></nav>
  </div>
</header>
<div class='wrap'><nav class='breadcrumb'><a href='/'>Home</a><span class='sep'>›</span><a href='${t.breadcrumbMid||'/#everyday'}'>${esc(t.cat)}</a><span class='sep'>›</span><span class='current'>${esc(t.name)}</span></nav></div>

<main id="main-content" class="page">
  <div class="wrap">
    <div class='page-hero-emoji'>${t.emoji}</div>
<h1 class="page-title">${esc(t.name)}</h1>
    <p class="lede">${esc(t.lede)}</p>`;
}

function buildBodyMiddle(t) {
  let html = '';
  if (t.body) for (const p of t.body) html += '\n' + p;
  return html;
}

function buildFaqs(faqs) {
  if (!faqs || !faqs.length) return '';
  let html = '\n    <h2>Frequently asked questions</h2>\n    <div class="faq-list">';
  for (const [q, a] of faqs) html += `\n    <h3>${esc(q)}</h3>\n    <p>${esc(a)}</p>`;
  html += '\n    </div>';
  return html;
}

function buildFaqLd(faqs) {
  if (!faqs || !faqs.length) return '';
  const mainEntity = faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));
  return `\n<script type="application/ld+json">\n${jld({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity })}\n</script>`;
}

function buildRelated(related) {
  if (!related || !related.length) return '';
  let html = `\n    <div class="related-section">\n      <h2>Related calculators</h2>\n      <div class="tool-grid">`;
  for (const r of related) html += `\n        <a href="${esc(r.href)}" class="tool-card"><div class="icon-row"><span class="emoji">${r.emoji}</span><div class="tc-title">${esc(r.title)}</div></div><div class="tc-desc">${esc(r.desc)}</div></a>`;
  html += `\n      </div>\n    </div>`;
  return html;
}

function buildSeeAlso(entries) {
  if (!entries || !entries.length) return '';
  let html = `\n<section class="see-also">\n  <h2>See also</h2>\n  <ul>`;
  for (const [label, href] of entries) html += `\n      <li><a href="${esc(href)}">${esc(label)}</a></li>`;
  html += `\n  </ul>\n</section>`;
  return html;
}

function buildFooter(t) {
  return `
    <p class="upd">Last updated <time datetime="${UPD_DATE}">${UPD_LABEL}</time></p>
    <p class="note" style="margin-top:22px;">For general calculations only. Not financial, tax, or legal advice — see our <a href="/disclaimer">disclaimer</a>.</p>
    <p class="note"><a href="/">&larr; Back to all tools</a></p>
  </div>
</main>${buildSeeAlso(t.seeAlso)}



<footer id="site-footer" class="site-footer"></footer>
<div id="cookiebar" class="cookiebar">
  <p>We currently set no tracking or advertising cookies. A single non-identifying preference is stored on your device to remember this notice. If advertising or analytics partners that set cookies are added later, we will ask for your consent first. See our <a href="/privacy#cookies">Cookie notice</a> and <a href="/privacy">Privacy Policy</a>.</p>
  <button id="cookie-accept" class="btn">Got it</button>
</div>
<script src="/js/site-core.js" defer></script>
<script src="/js/site-enhance.js" defer></script>
<script src="/js/site-meters.js" defer></script>
<script>
${t.js}
</script>
</body>
</html>`;
}

function render(t) {
  return buildHead(t)
    + buildBodyTop(t)
    + '\n    <div class="calc-card">'
    + (t.calcCardInner || '')
    + '\n    </div>'
    + buildBodyMiddle(t)
    + buildFaqs(t.faqs)
    + buildRelated(t.related)
    + buildFooter(t)
    + buildFaqLd(t.faqs);
}

// ========================================================================
// Main
// ========================================================================
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry');
const APPLY = args.has('--apply') || !DRY;

console.log(`\n🧰 site-main everyday tool generator`);
console.log(`   mode: ${DRY ? 'DRY RUN (no write)' : 'APPLY (writing)'}`);
console.log(`   count: ${TOOLS.length} tools\n`);

// Compute prev/next based on alphabetical slug order so internal pager works
const SORTED_SLUGS = TOOLS.map(t => t.slug).sort();
var SLUG_INDEX = {};
SORTED_SLUGS.forEach((s, i) => { SLUG_INDEX[s] = i; });

// Inject share mount + prev/next into every tool
TOOLS.forEach(t => {
  if (!t.body) t.body = [];
  // Add a share/print mount point (JS auto-injects buttons)
  t.body.push('<div id="tool-share" class="tool-share-mount" aria-label="Share this calculator"></div>');
  // Add prev/next mount points
  const idx = SLUG_INDEX[t.slug];
  const prev = idx > 0 ? '/tools/' + SORTED_SLUGS[idx - 1] : null;
  const next = idx < SORTED_SLUGS.length - 1 ? '/tools/' + SORTED_SLUGS[idx + 1] : null;
  let pnAttrs = '';
  if (prev) pnAttrs += ' data-prev="' + prev + '"';
  if (next) pnAttrs += ' data-next="' + next + '"';
  t.body.push('<div id="tool-prev-next"' + pnAttrs + '></div>');
});

fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0, errors = 0;
for (const t of TOOLS) {
  const outPath = path.join(OUT_DIR, t.slug + '.html');
  try {
    if (!t.calcCardInner) throw new Error('missing calcCardInner');
    if (!t.js) throw new Error('missing js');
    const html = render(t);
    if (html.length < 1000) throw new Error('output too short: ' + html.length);
    if (!html.includes('<!DOCTYPE html>')) throw new Error('missing DOCTYPE');
    if (!html.includes('site-core.js')) throw new Error('missing site-core.js script');
    if (!html.includes(t.slug)) throw new Error('slug not found in output');
    if (DRY) {
      console.log(`   [dry] ${t.slug}.html  (${html.length.toLocaleString()} chars)`);
    } else {
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`   ✅ ${t.slug}.html  (${html.length.toLocaleString()} chars)`);
    }
    written++;
  } catch (e) {
    console.error(`   ❌ ${t.slug}: ${e.message}`);
    errors++;
  }
}
console.log(`\n📊 summary: ${written} ok, ${errors} errors`);
if (errors > 0) process.exit(1);
console.log('🎉 done.');
