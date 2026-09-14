// mQuickCalc — site-core.js
// Synchronous critical-path: brand mark, footer, cookie bar.
// Loaded with `defer` so the browser fetches it in parallel with HTML parse,
// then executes before DOMContentLoaded. Critical so the footer renders fast.

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
          {name:'Finance',   tag:'Marketplace & creator fees',    url:'https://finance.mquickcalc.com/', color:'#059669'},
          {name:'Health',    tag:'BMI, BMR, TDEE & fitness',     url:'https://health.mquickcalc.com/',  color:'#dc2626'},
          {name:'Insurance', tag:'Auto, life, home & health',    url:'https://cover.mquickcalc.com/',   color:'#0f766e'}
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
          {name:'Main',      tag:'Unit converters & everyday tools', url:'https://mquickcalc.com/',           color:'#4f46e5'},
          {name:'Health',    tag:'BMI, BMR, TDEE & fitness',         url:'https://health.mquickcalc.com/',   color:'#dc2626'},
          {name:'Insurance', tag:'Auto, life, home & health',        url:'https://cover.mquickcalc.com/',    color:'#0f766e'}
        ]
      },
      health: {
        name:'m<b>Quick</b>Calc', tag:'Health',
        blurb:'Free health and wellness calculators — body metrics, nutrition, heart, fitness, pregnancy. Private by design.',
        col1:'Popular Tools', col1Links: heaLinks(''),
        col2:'Resources', col2Links:[
          ['All Calculators','/'],['About','/about'],['Contact','/contact'],
          ['Privacy Policy','/privacy'],['Disclaimer','/disclaimer'],['Terms','/terms']
        ],
        dis:'All calculators are for general wellness and informational purposes only. They are not medical advice and do not diagnose or treat any condition.',
        sisterSites:[
          {name:'Main',      tag:'Unit converters & everyday tools', url:'https://mquickcalc.com/',          color:'#4f46e5'},
          {name:'Finance',   tag:'Marketplace & creator fees',       url:'https://finance.mquickcalc.com/', color:'#059669'},
          {name:'Insurance', tag:'Auto, life, home & health',         url:'https://cover.mquickcalc.com/',   color:'#0f766e'}
        ]
      },
      insurance: {
        name:'🛡️ Cover', tag:'Insurance',
        blurb:'Free insurance cost estimators — ballpark premiums for auto, life, home, renters, health, pet, umbrella and business. No sign-up, no data collected.',
        col1:'Popular Tools', col1Links:[
          ['Car Insurance Premium','/tools/car-insurance-calculator'],
          ['Life Insurance Needs','/tools/life-insurance-needs'],
          ['Home Insurance Cost','/tools/home-insurance-estimator'],
          ['Health Insurance Premium','/tools/health-insurance-premium'],
          ['Renters Insurance','/tools/renters-insurance'],
          ['Business Liability','/tools/business-liability']
        ],
        col2:'Resources', col2Links:[
          ['All Calculators','/'],['About','/about'],['Contact','/contact'],
          ['Privacy Policy','/privacy'],['Disclaimer','/disclaimer'],['Terms','/terms']
        ],
        dis:'All estimates are based on industry averages and publicly available data. Your actual premium depends on factors we cannot verify. This is not insurance advice — compare quotes from licensed carriers.',
        sisterSites:[
          {name:'Main',    tag:'Unit converters & everyday tools', url:'https://mquickcalc.com/',          color:'#4f46e5'},
          {name:'Finance', tag:'Marketplace & creator fees',       url:'https://finance.mquickcalc.com/', color:'#059669'},
          {name:'Health',  tag:'BMI, BMR, TDEE & fitness',         url:'https://health.mquickcalc.com/',  color:'#dc2626'}
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
    ],
    'Insurance': [
      ['Car','Premiums','/tools/car-insurance-calculator'],
      ['Life','Needs','/tools/life-insurance-needs'],
      ['Home','Cost','/tools/home-insurance-estimator']
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
//
