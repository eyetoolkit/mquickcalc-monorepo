// ===SPLIT-CORE===>
// mQuickCalc — core site JS (renders footer + header brand + cookie bar).
// Loaded with `defer` so the browser can download it in parallel with HTML parsing,
// then executes just before DOMContentLoaded. Keep this file SMALL (~9 KB).
// Emoji-to-SVG swap and meters are in separate files (site-icons.js, site-meters.js).

(function(){
  var site = document.body ? (document.body.getAttribute('data-site') || 'main') : 'main';
  var Y = new Date().getFullYear();

  // Brand mark: a white bolt in a rounded square, tinted by the site's theme.
  function markSvg(id, size){
    return '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'">'
      + '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" style="stop-color:var(--brand)"/>'
      + '<stop offset="1" style="stop-color:var(--brand-ink)"/>'
      + '</linearGradient></defs>'
      + '<rect width="64" height="64" rx="15" fill="url(#'+id+')"/>'
      + '<g transform="translate(6.7 3.5) scale(2.3)"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="#fff"/></g>'
      + '</svg></span>';
  }

  function finLinks(prefix){
    return [
      ['Etsy Fee Calculator', prefix+'/tools/etsy-fee-calculator'],
      ['eBay Fee Calculator', prefix+'/tools/ebay-fee-calculator'],
      ['Amazon FBA Revenue', prefix+'/tools/amazon-fba-revenue-calculator'],
      ['Shopify Fees', prefix+'/tools/shopify-fees-calculator'],
      ['PayPal Fee Calculator', prefix+'/tools/paypal-fee-calculator'],
      ['Markup & Margin', prefix+'/tools/markup-margin-calculator']
    ];
  }
  function heaLinks(prefix){
    return [
      ['BMI Calculator', prefix+'/tools/bmi-calculator'],
      ['BMR Calculator', prefix+'/tools/bmr-calculator'],
      ['TDEE Calculator', prefix+'/tools/tdee-calculator'],
      ['Body Fat %', prefix+'/tools/body-fat-calculator'],
      ['Calorie Deficit', prefix+'/tools/calorie-deficit-calculator'],
      ['Water Intake', prefix+'/tools/water-intake-calculator']
    ];
  }
  var cfg = {
      main: {
        name:'m<b>Quick</b>Calc', tag:'Everyday',
        blurb:'Free unit converters and everyday calculators — length, weight, temperature, volume, area, speed, data, time and cooking. Type one value, see every unit at once. No sign-up, nothing stored.',
        col1:'Popular Converters', col1Links: [
          ['Length Converter','/tools/length-converter'],
          ['Weight Converter','/tools/weight-converter'],
          ['Temperature Converter','/tools/temperature-converter'],
          ['Height Converter','/tools/height-converter'],
          ['Volume Converter','/tools/volume-converter'],
          ['Data Storage Converter','/tools/data-storage-converter']
        ],
        col2:'Resources', col2Links:[
          ['All Calculators','/'],['About','/about'],['Contact','/contact'],
          ['Privacy Policy','/privacy'],['Disclaimer','/disclaimer']
        ],
        dis:'All calculators are for general information only. Estimates may differ from official sources — verify before relying on them.',
        sisterSites:[
          {name:'Finance', tag:'Marketplace & creator fees', url:'https://finance.mquickcalc.com/', color:'#059669'},
          {name:'Health',  tag:'BMI, BMR, TDEE & fitness',  url:'https://health.mquickcalc.com/',  color:'#dc2626'}
        ]
      },
      finance: {
        name:'m<b>Quick</b>Calc', tag:'Finance',
        blurb:'Free fee, profit and revenue calculators for creators, sellers and side-hustlers. No sign-up required — all math runs in your browser.',
        col1:'Popular Tools', col1Links: finLinks(''),
        col2:'Resources', col2Links:[
          ['All Calculators','/'],['About','/about'],['Contact','/contact'],
          ['Privacy Policy','/privacy'],['Terms','/terms']
        ],
        dis:'Fees and rates shown are estimates and may differ from official sources. Verify with the platform before relying on them.',
        sisterSites:[
          {name:'Main',   tag:'Unit converters & everyday tools', url:'https://mquickcalc.com/',           color:'#4f46e5'},
          {name:'Health', tag:'BMI, BMR, TDEE & fitness',         url:'https://health.mquickcalc.com/',   color:'#dc2626'}
        ]
      },
      health: {
        name:'m<b>Quick</b>Calc', tag:'Health',
        blurb:'Free health and wellness calculators — body metrics, nutrition, heart, fitness, pregnancy. Private by design.',
        col1:'Popular Tools', col1Links: healLinks(''),
        col2:'Resources', col2Links:[
          ['All Calculators','/'],['About','/about'],['Contact','/contact'],
          ['Privacy Policy','/privacy'],['Disclaimer','/disclaimer'],['Terms','/terms']
        ],
        dis:'All calculators are for general wellness and informational purposes only. They are not medical advice and do not diagnose or treat any condition.',
        sisterSites:[
          {name:'Main',    tag:'Unit converters & everyday tools', url:'https://mquickcalc.com/',          color:'#4f46e5'},
          {name:'Finance', tag:'Marketplace & creator fees',       url:'https://finance.mquickcalc.com/', color:'#059669'}
        ]
      }
    }
    cfg = cfg[site] || {name:'m<b>Quick</b>Calc',tag:'',blurb:'',col1:'',col1Links:[],col2:'',col2Links:[],dis:'',sisterSites:[]};

  // ---- Matrix (the tri-toolbox teaser) -------------------------------------
  var MATRIX = {
    'Everyday': [
      ['Length','cm to in','/tools/length-converter'],
      ['Weight','kg to lb','/tools/weight-converter'],
      ['Temp','°C to °F','/tools/temperature-converter']
    ],
    'Finance': [
      ['Etsy','Seller fees','/tools/etsy-fee-calculator'],
      ['PayPal','Fee calc','/tools/paypal-fee-calculator'],
      ['VAT','EU rates','/tools/vat-calculator']
    ],
    'Health': [
      ['BMI','Body mass','/tools/bmi-calculator'],
      ['BMR','Mifflin-St','/tools/bmr-calculator'],
      ['TDEE','Daily energy','/tools/tdee-calculator']
    ]
  };
  function matrixHtml(tag){
    var m = MATRIX[tag];
    if(!m) return '';
    var html = '<div class="matrix">';
    for(var i=0;i<m.length;i++){
      html += '<a class="m-'+(i===0?'med':(i===1?'mai':'fin'))+'" href="'+m[i][2]+'">'
            + '<span class="m-lbl">'+m[i][0]+'</span>'
            + '<span class="m-val">'+m[i][1]+'</span>'
            + '</a>';
    }
    return html + '</div>';
  }

  function liHtml(arr){ var s='<ul>'; arr.forEach(function(x){ s+='<li><a href="'+x[1]+'">'+x[0]+'</a></li>'; }); return s+'</ul>'; }

  var f = document.getElementById('site-footer');
  if(f){
    var sisterHtml = '';
    if(cfg.sisterSites && cfg.sisterSites.length){
      var cards = cfg.sisterSites.map(function(s){
        return '<a class="sister-card" href="'+s.url+'" rel="noopener" style="--sister-accent:'+s.color+'">' +
               '<span class="sister-dot" aria-hidden="true"></span>' +
               '<span class="sister-body">' +
                 '<span class="sister-name">mQuickCalc <strong>'+s.name+'</strong></span>' +
                 '<span class="sister-tag">'+s.tag+'</span>' +
               '</span>' +
               '<span class="sister-arrow" aria-hidden="true">→</span>' +
               '</a>';
      }).join('');
      sisterHtml = '<div class="sister-sites"><h4>Also from mQuickCalc</h4><div class="sister-grid">' + cards + '</div></div>';
    }
    f.innerHTML =
      '<div class="wrap"><div class="footer-grid">' +
        '<div class="footer-brand">' +
          '<div class="footer-logo">'+markSvg('bm-foot',22)+cfg.name+(cfg.tag?'<span class="site-tag" style="font-size:9px">'+cfg.tag+'</span>':'')+'</div>' +
          '<p>'+cfg.blurb+'</p>' + matrixHtml(cfg.tag) +
        '</div>' +
        '<div class="footer-col"><h4>'+cfg.col1+'</h4>'+liHtml(cfg.col1Links)+'</div>' +
        '<div class="footer-col"><h4>'+cfg.col2+'</h4>'+liHtml(cfg.col2Links)+'</div>' +
        '<div class="footer-col"><h4>Privacy</h4><ul>' +
          '<li><a href="/privacy">No ad-tracking cookies (today)</a></li>' +
          '<li><a href="/privacy">100% client-side math</a></li>' +
          '<li><a href="/privacy">Calculator inputs stay on-device</a></li>' +
        '</ul></div>' +
      '</div>' +
      sisterHtml +
      '<div class="copyright">&copy; '+Y+' mQuickCalc &middot; Operated by Jim (Maoming, Guangdong, China)<br>'+cfg.dis+'</div>' +
      '</div>';
  }

  // Brand mark + site tag in the sticky header.
  var brand = document.querySelector('.site-header .brand');
  if(brand){
    var stale = brand.querySelector('svg');
    if(stale) stale.parentNode.removeChild(stale);
    if(!brand.querySelector('.brand-mark')) brand.insertAdjacentHTML('afterbegin', markSvg('bm-head',22));
    if(cfg.tag && !brand.querySelector('.site-tag')){
      var sp = document.createElement('span'); sp.className='site-tag'; sp.textContent=cfg.tag;
      brand.appendChild(sp);
    }
  }

  // Cookie bar (just show/hide based on localStorage; no UI complexity)
  var cb = document.getElementById('cookiebar');
  if(cb && !localStorage.getItem('mqc-cookies')){
    cb.classList.add('show');
    var acc = document.getElementById('cookie-accept');
    if(acc){ acc.addEventListener('click', function(){ localStorage.setItem('mqc-cookies','1'); cb.classList.remove('show'); }); }
  }
})();
// <=====END-CORE=====// ===SPLIT-ENHANCE===>
// mQuickCalc — enhance site JS (deferred non-critical enhancements).
// Runs after DOMContentLoaded. Loaded with `defer`.

// --- Emoji-to-SVG replacement (homepage + tool grid + sister cards) ----
// Icon set kept in a single dict so changes don't require touching every page.
(function(){
  var ICONS = {
    "\u{1F4CA}": '<path d="M4 20V11M10 20V4M16 20v-6M2 20h20"/>',
    "\u{1F4C8}": '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
    "\u{1F4C9}": '<path d="M3 7l6 6 4-4 7 7"/><path d="M14 16h6v-6"/>',
    "\u{1F3AF}": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    "\u{1F525}": '<path d="M12 3c3 4 5 6 5 9a5 5 0 01-10 0c0-1.5.7-2.6 1.4-3.4.3 1 1 1.7 1.9 1.9C10.5 8.6 11 5.8 12 3z"/>',
    "\u{1F4CF}": '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
    "\u2696": '<path d="M12 4v15M7 20h10M4 8h16"/><path d="M4 8l-2.5 5.5h5zM20 8l-2.5 5.5h5z"/>',
    "\u{1F4D0}": '<path d="M4 20L20 4v16z"/><path d="M4 15h5M4 11h5"/>',
    "\u{1F3F7}": '<path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z"/><circle cx="7.8" cy="7.8" r="1.4"/>',
    "\u{1F3A8}": '<path d="M12 21a9 9 0 010-18c5 0 9 3.6 9 8 0 2.4-2 4-4 4h-1.6a1.9 1.9 0 00-1.5 3.1A2 2 0 0112 21z"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/>',
    "\u{1F4B3}": '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h3"/>',
    "\u{1F9FE}": '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    "\u2764": '<path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0112 8a4.5 4.5 0 017 2.5C19 15.6 12 20 12 20z"/>',
    "\u{1F4E3}": '<path d="M4 10v4l12 6V4L4 10z"/><path d="M16 8.5a4 4 0 010 7"/>',
    "\u{1F30D}": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 010 18a14 14 0 010-18z"/>',
    "\u{1F30E}": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 010 18a14 14 0 010-18z"/>',
    "\u{1F4E6}": '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    "\u{1F6D2}": '<circle cx="9.5" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.8l2.4 12h11.3L21 7H6"/>',
    "\u{1F6CD}": '<path d="M5 8h14l1.2 12H3.8z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    "\u{1F457}": '<path d="M9 3l3 4 3-4 4 6-2 2 1.2 9H5.8L7 11 5 9z"/>',
    "\u{1F455}": '<path d="M8.5 4l3.5 2 3.5-2 5 3.6-2.8 3-1.7-1.2V20H7v-9.6L5.3 11.6 2.5 8.6z"/>',
    "\u{1F496}": '<path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0112 8a4.5 4.5 0 017 2.5C19 15.6 12 20 12 20z"/>',
    "\u{1F497}": '<path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0112 8a4.5 4.5 0 017 2.5C19 15.6 12 20 12 20z"/>',
    "\u{1F680}": '<path d="M12 3c3 3 4.2 6.6 4.2 9.8L12 16l-4.2-3.2C7.8 9.6 9 6 12 3z"/><path d="M8.4 13.5L5 18l4.4-.9M15.6 13.5L19 18l-4.4-.9"/><circle cx="12" cy="9.5" r="1.4"/>',
    "\u{1F4BC}": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3 12.5h18"/>',
    "\u{1F4AA}": '<path d="M4 14.5A4.5 4.5 0 018.5 10H15a3 3 0 010 6h-6"/><path d="M4 14.5V19h9v-4.5"/>',
    "\u{1F9B4}": '<path d="M7.2 7.2a2.4 2.4 0 113.4 3.4l3 3a2.4 2.4 0 113.4 3.4 2.4 2.4 0 11-3.4-3.4l-3-3A2.4 2.4 0 017.2 7.2z"/>',
    "\u26A1": '<path d="M13 3L5 14h5l-1 7 8-11h-5l1-7z"/>',
    "\u{1F37D}": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
    "\u{1F951}": '<path d="M12 3c4 0 7 4 7 8a7 7 0 11-14 0c0-4 3-8 7-8z"/><circle cx="12" cy="13" r="2.8"/>',
    "\u23F1": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "\u26C4": '<path d="M5 15a4 4 0 014-4 4 4 0 014 4h6a3 3 0 100-6 5 5 0 00-9.6-1.5A6 6 0 005 15z"/>',
    "\u{1F321}": '<path d="M12 3v10M8 9l4 4 4-4"/><circle cx="12" cy="17" r="2.5"/>',
    "\u{1F3CC}": '<circle cx="13" cy="4" r="2"/><path d="M9 20l3-6 3 2 3-2-2-6"/>',
    "\u{1F525}": '<path d="M12 2c2 4 4 5 4 8a4 4 0 11-8 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2C11 6 12 4 12 2z"/>',
    "\u{1F3C3}": '<circle cx="13" cy="4" r="2"/><path d="M5 22l3-7 4 2 3-1 4-3"/>',
    "\u{1F31F}": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    "\u{1F33E}": '<path d="M5 21h14M12 3v18M5 13c2-3 5-3 7 0 2-3 5-3 7 0"/>',
    "\u{1F4A7}": '<path d="M12 3c-3 4-5 6-5 9a5 5 0 0010 0c0-3-2-5-5-9z"/>',
    "\u{1F3CA}": '<circle cx="13" cy="4" r="2"/><path d="M8 20l2-7M16 22l-3-9 4-1"/>',
    "\u{1F4B0}": '<circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 010 4h-4M9 13l6 4M15 9v8"/>',
    "\u{1F4B5}": '<rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9h.01M18 15h.01"/>',
    "\u{1F3E6}": '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>'
  };

  function svgFor(emoji){
    var p = ICONS[emoji];
    if(!p) return null;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  function replaceEmoji(root){
    if(!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var batch = [];
    var node;
    while((node = walker.nextNode())){
      var t = node.nodeValue;
      var hit = false;
      for(var k in ICONS){
        if(t.indexOf(k) > -1){ hit = true; break; }
      }
      if(hit) batch.push(node);
    }
    batch.forEach(function(n){
      var html = n.nodeValue;
      var out = html;
      for(var k in ICONS){
        var svg = svgFor(k);
        if(svg) out = out.split(k).join(svg);
      }
      if(out !== html){
        var span = document.createElement('span');
        span.innerHTML = out;
        while(span.firstChild) n.parentNode.insertBefore(span.firstChild, n);
        n.parentNode.removeChild(n);
      }
    });
  }
  function run(){
    replaceEmoji(document.querySelector('.tool-grid'));
    replaceEmoji(document.querySelector('.feature'));
    replaceEmoji(document.querySelector('.sister-grid'));
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

/* ============================================================
   Homepage live search
   ============================================================ */
(function(){
  var box = document.getElementById('tool-search');
  if(!box) return;
  var empty = document.getElementById('search-empty');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tool-card'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.block, main section.block, main'));
  function secOf(card){
    return card.closest('section.block');
  }
  box.addEventListener('input', function(){
    var q = box.value.trim().toLowerCase();
    var anyVisible = 0;
    cards.forEach(function(card){
      var txt = (card.textContent || '').toLowerCase() + ' ' + (card.getAttribute('href')||'');
      var show = q === '' || txt.indexOf(q) > -1;
      card.style.display = show ? '' : 'none';
      if(show) anyVisible = 1;
    });
    if(empty) empty.style.display = (q !== '' && !anyVisible) ? 'block' : 'none';
    sections.forEach(function(sc){
      if(sc.classList.contains('hero') || sc.id === 'why' || sc.id === 'featured') return;
      var cardsIn = sc.querySelectorAll('.tool-card').length;
      if(q !== '' && cardsIn > 0){
        var anyIn = Array.prototype.some.call(sc.querySelectorAll('.tool-card'), function(c){ return c.style.display !== 'none'; });
        sc.style.display = anyIn ? '' : 'none';
      } else if(q === ''){
        sc.style.display = '';
      }
    });
  });
  box.addEventListener('keydown', function(e){ if(e.key==='Escape'){ box.value=''; box.dispatchEvent(new Event('input')); } });
})();
/* ============================================================
   A11y + UX enhancements (skip link, scroll shadow, tabular nums)
   ============================================================ */

// 1. Skip link injection (if not already in HTML)
(function(){
  if(!document.querySelector('.skip-link')){
    var a = document.createElement('a');
    a.href = '#main-content';
    a.className = 'skip-link';
    a.textContent = 'Skip to main content';
    document.body.prepend(a);
  }
  var main = document.querySelector('main');
  if(main && !main.id) main.id = 'main-content';
})();

// 2. Header scroll shadow
(function(){
  var header = document.querySelector('.site-header');
  if(!header) return;
  function onScroll(){
    if(window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// 3. Tabular nums for results (ensure consistent number width)
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.result .big, .result-headline, .conv-table td:last-child').forEach(function(el){
      el.style.fontVariantNumeric = 'tabular-nums';
    });
  });
})();

// 4. Mobile table container auto-scroll hint
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.conv-table').forEach(function(t){
      var container = t.parentElement;
      if(container && container.scrollWidth > container.clientWidth + 4){
        // Table overflows on mobile - CSS handles it, no JS needed
      }
    });
  });
})();
// <=====END-ENHANCE=====

// ===SPLIT-METERS===>
// mQuickCalc — result meters (tool pages only).
// Exposes window.__renderMeters(); page inline scripts call it after recompute.
(function(){
  function renderOne(el){
    var bands;
    try { bands = JSON.parse(el.getAttribute('data-bands')); } catch (e) { return; }
    if(!bands || !bands.length) return;

    var min = parseFloat(el.getAttribute('data-min'));
    var max = parseFloat(el.getAttribute('data-max'));
    var val = parseFloat(el.getAttribute('data-value'));
    if(isNaN(min) || isNaN(max) || max <= min) return;

    var span = max - min;
    var prev = min;
    var bar = '<div class="meter-track">';
    var legend = '';

    for(var i=0;i<bands.length;i++){
      var b = bands[i];
      var to = Math.min(typeof b.to === 'number' ? b.to : max, max);
      var w = Math.max(0, (to - prev) / span) * 100;
      var tone = b.tone || 'info';
      bar += '<div class="meter-seg ' + tone + '" style="width:' + w.toFixed(3) + '%"></div>';
      legend += '<span><i class="' + tone + '"></i>' + b.label + '</span>';
      prev = to;
    }

    if(!isNaN(val)){
      var pct = Math.max(0, Math.min(100, (val - min) / span * 100));
      bar += '<div class="meter-pin" style="left:' + pct.toFixed(2) + '%"></div>';
    }
    bar += '</div>';

    el.innerHTML = bar + '<div class="meter-legend">' + legend + '</div>';
  }

  window.__renderMeters = function(){
    var meters = document.querySelectorAll('.meter[data-bands]');
    for(var i=0;i<meters.length;i++) renderOne(meters[i]);
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', window.__renderMeters);
  } else {
    window.__renderMeters();
  }
})();
// <=====END-METERS=====

