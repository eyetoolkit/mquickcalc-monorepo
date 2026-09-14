// mQuickCalc — site-enhance.js
// Deferred non-critical enhancements: live search, a11y, cookie bar accept,
// header scroll shadow, tabular nums. Runs on DOMContentLoaded.

// mQuickCalc — enhance site JS (deferred non-critical enhancements).
// Runs after DOMContentLoaded. Loaded with `defer`.



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
//
