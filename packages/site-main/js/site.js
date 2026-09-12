// mQuickCalc — Shared v3 footer + cookie bar + matrix branding
(function(){
  var site = document.body ? (document.body.getAttribute('data-site') || 'main') : 'main';
  var Y = new Date().getFullYear();

  // Brand mark: a white bolt in a rounded square, tinted by the site's theme.
  // Injected from here so the wordmark stays the single source of truth in each
  // page's own markup — 70-odd pages never have to be touched to change the logo.
  // stop-color must be set via style, not as an attribute, for var() to resolve.
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
        col1:'Popular Tools', col1Links: heaLinks(''),
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

  // ---- Icon set -----------------------------------------------------------
  // Emoji look different on every OS and can't inherit a colour, which is why
  // tool cards rendered inconsistently across Windows / Android / iOS. They are
  // swapped here at runtime for inline line icons that inherit currentColor,
  // so the whole matrix gets one coherent set without editing a single page.
  // The emoji in the markup acts as the icon key; anything unmapped stays as-is.
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
    "\u{1F4A7}": '<path d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z"/>',
    "\u{1F504}": '<path d="M20 12a8 8 0 01-13.6 5.7M4 12a8 8 0 0113.6-5.7"/><path d="M18.5 3.5V8h-4.5M5.5 20.5V16H10"/>',
    "\u{1FA78}": '<path d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z"/>',
    "\u{1F6E3}": '<path d="M8 3L4.5 21M16 3l3.5 18M12 4v3M12 11v3M12 18v3"/>',
    "\u{1F3CA}": '<circle cx="17" cy="7" r="2"/><path d="M3 16.5l4.5-4 4 2.5 4-4 5.5 5.5"/><path d="M3 20.5h18"/>',
    "\u{1F3CB}": '<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
    "\u{1F3C1}": '<path d="M6 3v18"/><path d="M6 4h12l-2.2 4L18 12H6z"/>',
    "\u{1FAC1}": '<path d="M12 4v8"/><path d="M12 12c0 4-1.8 7-4.6 7S3.5 16 3.5 12.5 5 6 7.4 6 12 8.5 12 12zM12 12c0 4 1.8 7 4.6 7s3.9-3 3.9-6.5S19 6 16.6 6 12 8.5 12 12z"/>',
    "\u{1F4C5}": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "\u{1F338}": '<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6V5M12 14.4V19M9.6 12H5M14.4 12H19M10.3 10.3L7 7M13.7 13.7L17 17M13.7 10.3L17 7M10.3 13.7L7 17"/>',
    "\u{1F319}": '<path d="M20 14.5A8.2 8.2 0 0110 4.2a8.2 8.2 0 100 15.6 8.2 8.2 0 0010-5.3z"/>',
    "\u{1F321}": '<path d="M10 14V5a2 2 0 114 0v9a4 4 0 11-4 0z"/>',
    "\u{1F9EA}": '<path d="M9 3h6M10 3v6l-4.8 8.8A2 2 0 007 21h10a2 2 0 001.8-3.2L14 9V3"/>',
    "\u{1F5FA}": '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    "\u{1F697}": '<path d="M4.5 16h15"/><path d="M5 16l1.6-6.2h10.8L19 16z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/><path d="M6 16v2.5M18 16v2.5"/>',
    "\u{1F4BE}": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    "\u{1F373}": '<circle cx="11" cy="13" r="6"/><path d="M17 13h4"/>',
    "\u{1F3EA}": '<path d="M3 9l1.6-5h14.8L21 9"/><path d="M3 9h18v11H3z"/><path d="M9 20v-6h6v6"/>',
    "\u267B": '<path d="M7 19H5a2 2 0 01-1.7-3l2-3.4"/><path d="M12 4l2.6 4.4H9.4z"/><path d="M17 19h2a2 2 0 001.7-3l-3.3-5.6"/>',
    "\u{1F3AE}": '<rect x="2" y="8" width="20" height="10" rx="4.5"/><path d="M7 11.5h3M8.5 10v3M15.5 11.5h.01M18 13.5h.01"/>',
    "\u{1F4FA}": '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/>',
    "\u{1F9EE}": '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01"/>',
    "\u{1F957}": '<path d="M4 13h16a8 8 0 01-16 0z"/><path d="M8 13V9M12 13V7M16 13V9"/>',
    "\u{1F3C3}": '<circle cx="14" cy="5" r="2"/><path d="M6 21l3-6 3 2 3-5 4 3"/><path d="M9 15l-2-4 5-1"/>',
    "\u{1F476}": '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 10.5h.01M14.5 10.5h.01M9 15a4.2 4.2 0 006 0"/>',
    "\u{1F634}": '<path d="M3.5 9h6l-6 7h6"/><path d="M13.5 4h5.5l-5.5 6h5.5"/>',
    "\u{1F9F6}": '<circle cx="12" cy="12" r="8.5"/><path d="M5.5 8.5c4 3 9 3 13 0M5.5 15.5c4-3 9-3 13 0"/>',
    "\u{1F7EA}": '<rect x="5" y="5" width="14" height="14" rx="3.5"/>',
    "\u{1F7E9}": '<rect x="5" y="5" width="14" height="14" rx="3.5"/>',
    "\u{1F7E6}": '<rect x="5" y="5" width="14" height="14" rx="3.5"/>',
    "\u{1F44D}": '<path d="M7 21V10l4-7c1.4 0 2.2.9 2.2 2.3V10h4.6a2 2 0 011.9 2.6l-1.7 6A2 2 0 0116 21z"/><path d="M7 10H4v11h3"/>',
    "\u23F1": '<circle cx="12" cy="13.5" r="7"/><path d="M12 10.5v3l2 1.5M9.5 3.5h5M12 3.5v2.5M18.6 7.4l1.4-1.4"/>',
    "\u25B6": '<circle cx="12" cy="12" r="8.5"/><path d="M10.2 8.6l5.6 3.4-5.6 3.4z"/>',
    "\u{1F1EA}\u{1F1FA}": '<circle cx="12" cy="12" r="8.5"/><path d="M12 4.2l1.6 3.5 3.8.4-2.9 2.6.9 3.7L12 12.5l-3.4 1.9.9-3.7-2.9-2.6 3.8-.4z"/>',
    "\u{1F174}\u{1F171}": '<path d="M12 3.5v17"/><path d="M16 7.8c0-1.6-1.8-2.6-4-2.6s-4 .9-4 2.5 1.6 2.3 4 2.9 4 1.3 4 2.9-1.8 2.5-4 2.5-4-1-4-2.5"/>',
    "\u2764\u200D\u{1F525}": '<path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0112 8a4.5 4.5 0 017 2.5C19 15.6 12 20 12 20z"/><path d="M12 11.5c1.4 1.6 2.2 2.6 2.2 3.6a2.2 2.2 0 11-4.4 0c0-1 .8-2 2.2-3.6z"/>'
  };
  // Matches pictographs, regional-indicator flag pairs and ZWJ sequences (❤️‍🔥)
  // as a single unit, so composite emoji are swapped whole rather than fragmenting.
  var EMOJI_RE = /([\u{1F000}-\u{1FAFF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}](?:\uFE0F|\u200D[\u{1F000}-\u{1FAFF}\u{2300}-\u{27BF}])*)/gu;
  function iconSvg(glyph){
    var d = ICONS[glyph.replace(/\uFE0F/g, "")];
    if(!d) return null;
    return '<svg class="ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" '
      + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  function swapEmoji(){
    // Icon slots inside cards: replace the whole slot contents.
    var slots = document.querySelectorAll('.tool-card .emoji, .feat-card .f-emoji');
    for(var i=0;i<slots.length;i++){
      var s = iconSvg((slots[i].textContent || "").trim());
      if(s) slots[i].innerHTML = s;
    }
    // Emoji sitting inline in headings: swap in place, leave everything else.
    var heads = document.querySelectorAll('h1, h2, h3');
    for(var j=0;j<heads.length;j++){
      if(!EMOJI_RE.test(heads[j].innerHTML)){ EMOJI_RE.lastIndex = 0; continue; }
      EMOJI_RE.lastIndex = 0;
      heads[j].innerHTML = heads[j].innerHTML.replace(EMOJI_RE, function(g){
        return iconSvg(g) || g;
      });
    }
  }
  swapEmoji();


  var matrix = [
    {dot:'#4f46e5',t:'Everyday Calculators',d:'Converters & everyday math',h:'https://mquickcalc.com',cls:'m-med'},
    {dot:'#059669',t:'Finance Calculators',d:'Fees & profit',h:'https://finance.mquickcalc.com',cls:'m-fin'},
    {dot:'#0d9488',t:'Health Calculators',d:'Wellness & fitness',h:'https://health.mquickcalc.com',cls:'m-hea'}
  ];
  function matrixHtml(cur){
    var s = '<div class="footer-matrix">';
    matrix.forEach(function(m){
      if(m.t.indexOf(cur) > -1) return; // skip current site card on its own footer
      s += '<a href="'+m.h+'" target="_blank" rel="noopener"><span class="dot" style="background:'+m.dot+'"></span><span>'+m.t+'</span></a>';
    });
    return s + '</div>';
  }
  function liHtml(arr){ var s='<ul>'; arr.forEach(function(x){ s+='<li><a href="'+x[1]+'">'+x[0]+'</a></li>'; }); return s+'</ul>'; }

  var f = document.getElementById('site-footer');
  if(f){
    // Build sister-sites cards (only render if cfg has sisterSites)
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

  // Brand mark + site tag in the sticky header. Pages that shipped their own
  // inline logo (the main site had a plus-sign square) get it removed here, so
  // every page across the three sites ends up showing the same bolt.
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

  // Cookie bar
  var cb = document.getElementById('cookiebar');
  if(cb && !localStorage.getItem('mqc-cookies')){
    cb.classList.add('show');
    var acc = document.getElementById('cookie-accept');
    if(acc){ acc.addEventListener('click', function(){ localStorage.setItem('mqc-cookies','1'); cb.classList.remove('show'); }); }
  }
})();

// --- Homepage live search -------------------------------------------------
(function(){
  var box = document.getElementById('tool-search');
  if(!box) return;
  var empty = document.getElementById('search-empty');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tool-card'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.block, main section.block, main'));
  function secOf(card){
    var s = card.closest('section.block');
    return s;
  }
  box.addEventListener('input', function(){
    var q = box.value.trim().toLowerCase();
    var anyVisible = 0;
    var vis = {};
    cards.forEach(function(card){
      var txt = (card.textContent || '').toLowerCase() + ' ' + (card.getAttribute('href')||'');
      var show = q === '' || txt.indexOf(q) > -1;
      card.style.display = show ? '' : 'none';
      if(show){ anyVisible = 1; var sc = secOf(card); if(sc) vis[sc.id||sc.getAttribute('data-id')||sc.className] = 1; }
    });
    if(empty) empty.style.display = (q !== '' && !anyVisible) ? 'block' : 'none';
    // hide category sections with no visible card while searching
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
    var wrap = document.querySelector('.wrap .matrix, .matrix');
    if(wrap && q !== ''){ /* keep matrix visible */ }
  });
  // clear on Esc
  box.addEventListener('keydown', function(e){ if(e.key==='Escape'){ box.value=''; box.dispatchEvent(new Event('input')); } });
})();

// --- Result meters ---------------------------------------------------------
// A tool page shows where its answer sits on a scale by declaring:
//   <div class="meter" data-min="14" data-max="40" data-value="22.9"
//        data-bands='[{"to":18.5,"tone":"info","label":"Under 18.5"}, ...]'></div>
// The page states its numbers once; the bar, the segments and the marker are
// derived. After changing data-value, call window.__renderMeters() again.
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
  window.__renderMeters();
})();
/* ============================================================
   A11y + UX enhancements
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
  // Ensure main has id for skip target
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