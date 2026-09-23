// mQuickCalc — site-enhance.js
// Deferred non-critical enhancements: live search, theme toggle, share bar,
// pager, form validation, cookie bar, header scroll shadow.

/* ============================================================
   Homepage live search
   ============================================================ */
(function(){
  var box = document.getElementById('tool-search');
  if(!box) return;
  var empty = document.getElementById('search-empty');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.tool-card'));
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
  });
  box.addEventListener('keydown', function(e){ if(e.key==='Escape'){ box.value=''; box.dispatchEvent(new Event('input')); } });
})();

/* ============================================================
   A11y: skip link + main id
   ============================================================ */
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

/* ============================================================
   Header scroll shadow
   ============================================================ */
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

/* ============================================================
   Theme toggle (data-theme on <html>, persists in localStorage)
   ============================================================ */
(function(){
  var KEY = 'mquickcalc-theme';
  function getStored(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }
  function setStored(v){ try { localStorage.setItem(KEY, v); } catch(e){} }
  function apply(t){
    if(t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  var stored = getStored();
  if(stored === 'dark' || stored === 'light') apply(stored);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) apply('dark');
  function buildBtn(){
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.title = 'Toggle dark mode';
    btn.innerHTML = '<span class="moon" aria-hidden="true">🌙</span><span class="sun" aria-hidden="true">☀️</span>';
    btn.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme');
      apply(cur === 'dark' ? 'light' : 'dark');
      setStored(document.documentElement.getAttribute('data-theme') || 'light');
    });
    return btn;
  }
  function mount(){
    var header = document.querySelector('.site-header .header-inner, .site-header nav');
    if(!header) return;
    if(document.querySelector('.theme-toggle')) return;
    header.appendChild(buildBtn());
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

/* ============================================================
   Tool page: share / copy-link / print (auto-detect .calc-card)
   ============================================================ */
(function(){
  function buildBar(){
    var bar = document.createElement('div');
    bar.className = 'tool-share';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Share this calculator');
    bar.innerHTML = ''
      + '<button type="button" class="btn ghost ts-copy" aria-label="Copy link to clipboard">📋 Copy link</button>'
      + '<button type="button" class="btn ghost ts-share" aria-label="Share via system dialog">↗ Share</button>'
      + '<button type="button" class="btn ghost ts-print" aria-label="Print this page">🖨 Print</button>';
    return bar;
  }
  function toast(msg){
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 250); }, 1800);
  }
  function mount(){
    if(!document.querySelector('.calc-card')) return;
    var page = document.querySelector('main.page, main');
    if(!page) return;
    var mountPoint = document.getElementById('tool-share');
    var bar = mountPoint && mountPoint.classList.contains('tool-share') ? mountPoint : buildBar();
    if(!mountPoint) page.appendChild(bar);
    else if(!mountPoint.classList.contains('tool-share')) mountPoint.appendChild(bar);
    bar.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if(!btn) return;
      if(btn.classList.contains('ts-copy')){
        var url = location.href;
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(function(){ toast('Link copied'); }, function(){ toast('Copy failed'); });
        } else {
          var ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); toast('Link copied'); } catch(e){ toast('Copy failed'); }
          ta.remove();
        }
      } else if(btn.classList.contains('ts-share')){
        var data = {
          title: document.title,
          text: (document.querySelector('meta[name="description"]') && document.querySelector('meta[name="description"]').content) || document.title,
          url: location.href
        };
        if(navigator.share){ navigator.share(data).catch(function(){}); }
        else { toast('Share not supported — link copied'); navigator.clipboard && navigator.clipboard.writeText(location.href); }
      } else if(btn.classList.contains('ts-print')){
        window.print();
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

/* ============================================================
   Tool page: prev/next pager (auto-derives from page links)
   ============================================================ */
(function(){
  function autoFromPage(){
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href*="/tools/"]'));
    if(!links.length) return null;
    var currentPath = location.pathname.replace(/\/$/, '');
    var paths = [];
    links.forEach(function(a){
      try {
        var u = new URL(a.href, location.origin);
        if(u.pathname !== currentPath && u.pathname.indexOf('/tools/') === 0) paths.push(u.pathname);
      } catch(e){}
    });
    return paths;
  }
  function mount(){
    if(!document.querySelector('.calc-card')) return;
    var slot = document.getElementById('tool-prev-next');
    var prev = null, next = null;
    if(slot){ prev = slot.getAttribute('data-prev'); next = slot.getAttribute('data-next'); }
    if(!prev && !next){
      var seeAlso = document.querySelector('.see-also a');
      var related = document.querySelector('.related-section .tool-card');
      if(seeAlso && seeAlso.getAttribute('href')) prev = seeAlso.getAttribute('href');
      if(related && related.getAttribute('href')) next = related.getAttribute('href');
    }
    if(!prev && !next){
      var neighbors = autoFromPage();
      if(neighbors && neighbors.length){ prev = neighbors[0]; next = neighbors[neighbors.length-1]; }
    }
    if(!prev && !next) return;
    var html = '<nav class="tool-pager" aria-label="Calculator navigation">';
    if(prev) html += '<a class="btn ghost tp-prev" href="'+prev+'">‹ Previous calculator</a>';
    if(next) html += '<a class="btn ghost tp-next" href="'+next+'">Next calculator ›</a>';
    html += '</nav>';
    if(slot) slot.innerHTML = html;
    else {
      var p = document.createElement('div');
      p.innerHTML = html;
      var page = document.querySelector('main.page, main');
      if(page) page.appendChild(p.firstChild);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

/* ============================================================
   Form validation engine + window.mqc API
   ============================================================ */
(function(){
  function getErrorEl(input){
    var sib = input.nextElementSibling;
    if(sib && sib.classList && sib.classList.contains('field-error')) return sib;
    var wrap = input.parentElement;
    if(!wrap) return null;
    return wrap.querySelector('.field-error') || null;
  }
  function showError(input, msg){
    input.setAttribute('aria-invalid', 'true');
    var e = getErrorEl(input);
    if(e){ e.textContent = msg; e.classList.add('show'); }
  }
  function clearError(input){
    input.removeAttribute('aria-invalid');
    var e = getErrorEl(input);
    if(e) e.classList.remove('show');
  }
  function validateInput(input){
    var v = input.value;
    var min = input.getAttribute('min');
    var max = input.getAttribute('max');
    var req = input.hasAttribute('required') || input.dataset.required === '1';
    if(req && (v === '' || v === null || v === undefined)){ showError(input, 'This field is required.'); return false; }
    if(v === ''){ clearError(input); return true; }
    var n = Number(v);
    if(isNaN(n)){ showError(input, 'Please enter a valid number.'); return false; }
    if(min !== null && n < Number(min)){ showError(input, 'Minimum value is '+min+'.'); return false; }
    if(max !== null && n > Number(max)){ showError(input, 'Maximum value is '+max+'.'); return false; }
    clearError(input);
    return true;
  }
  function attach(){
    var cards = document.querySelectorAll('.calc-card');
    cards.forEach(function(card){
      var inputs = card.querySelectorAll('input[type="number"], input[type="text"], input[type="email"], select');
      inputs.forEach(function(input){
        if(input.readOnly) return;
        input.addEventListener('input', function(){ if(input.getAttribute('aria-invalid') === 'true') validateInput(input); });
        input.addEventListener('blur', function(){ validateInput(input); });
        card.addEventListener('click', function(e){
          var btn = e.target.closest('button[type="submit"], button.calc-btn, .btn:not(.ghost)');
          if(!btn) return;
          var ok = true;
          inputs.forEach(function(i){ if(!validateInput(i)) ok = false; });
          if(!ok){
            e.preventDefault();
            var first = card.querySelector('[aria-invalid="true"]');
            if(first) first.focus();
          }
        });
      });
    });
  }
  window.mqc = window.mqc || {};
  window.mqc.validate = validateInput;
  window.mqc.showError = showError;
  window.mqc.clearError = clearError;
  window.mqc.toast = function(msg){
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 250); }, 1800);
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
