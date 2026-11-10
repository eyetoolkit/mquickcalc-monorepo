/* ==========================================================================
   mQuickCalc — site-uifix.js  (UI-FIX 2026-11-10)
   --------------------------------------------------------------------------
   Single runtime injection point for every page in all four site packages.
   build.mjs injects the <script defer> into each HTML file. Every module is
   isolated so one failure can never take down the rest of the page.

   P0-1 mobile drawer | P0-3 cookie bar | P1-2 button feedback + aria-live
   P2-1 instant converter | P2-2 mode chips | P2-4 FAQ accordion
   P2-7 encoding / horizontal scroll hints / keyboard table scrolling
   ========================================================================== */
(function () {
  'use strict';
  var site = (document.body && document.body.getAttribute('data-site')) || 'main';
  function safe(name, fn) { try { fn(); } catch (e) { /* non-fatal by design */ } }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------- P0-3: cookie notice as a slim, consistent bottom bar ------- */
  safe('cookie', function () {
    var cb = document.getElementById('cookiebar');
    if (!cb) return;
    cb.setAttribute('role', 'status');
    cb.setAttribute('aria-label', 'Cookie notice');
    // Move it out of the end of <body> into an in-flow slot right under the
    // header. It therefore occupies its own 54px instead of covering content.
    var header = document.querySelector('.site-header');
    if (header && cb.previousElementSibling !== header) {
      header.insertAdjacentElement('afterend', cb);
    }
    // One sentence + two links + one action. The "no tracking" fact becomes a
    // short trust badge instead of a 296-character reading task.
    cb.innerHTML =
      '<p class="mq-cookie-text">We use no tracking or advertising cookies.</p>' +
      '<span class="mq-cookie-links"><a href="/privacy#cookies">Cookie notice</a> · <a href="/privacy">Privacy Policy</a></span>' +
      '<div class="mq-cookie-actions">' +
      '<a class="mq-cookie-privacy" href="/privacy">Privacy</a>' +
      '<span class="mq-trust">No tracking cookies</span>' +
      '<button id="cookie-accept" class="btn" type="button">Got it</button></div>';
    function show() {
      try { if (!localStorage.getItem('mqc-cookies')) cb.classList.add('show'); }
      catch (e) { cb.classList.add('show'); }
    }
    var acc = document.getElementById('cookie-accept');
    if (acc) acc.addEventListener('click', function () {
      try { localStorage.setItem('mqc-cookies', '1'); } catch (e) {}
      cb.classList.remove('show');
    });
    show();
  });

  /* ---------- P0-1: hamburger + drawer on narrow viewports --------------- */
  safe('drawer', function () {
    var inner = document.querySelector('.site-header .header-inner');
    if (!inner) return;
    var nav = inner.querySelector('nav');
    var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];

    var burger = el('button', 'mq-burger',
      '<span aria-hidden="true">&#9776;</span>');
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Open navigation menu');
    burger.setAttribute('aria-controls', 'mq-drawer');
    burger.setAttribute('aria-expanded', 'false');
    inner.appendChild(burger);

    var drawer = el('nav', 'mq-drawer');
    drawer.id = 'mq-drawer';
    drawer.setAttribute('aria-label', 'Mobile navigation');
    links.forEach(function (a) {
      var clone = a.cloneNode(true);
      clone.setAttribute('tabindex', '-1');
      drawer.appendChild(clone);
    });
    var tools = el('div', 'mq-drawer__tools');
    tools.appendChild(el('span', '', '<small style="color:var(--text-dim)">Appearance</small>'));
    drawer.appendChild(tools);
    inner.appendChild(drawer);

    // site-enhance.js injects the theme toggle at runtime; move it into the
    // drawer so it no longer pushes the header past the viewport.
    function parkThemeToggle() {
      var t = inner.querySelector(':scope > .theme-toggle');
      if (t && t.parentNode !== tools) tools.appendChild(t);
    }
    parkThemeToggle();
    document.addEventListener('DOMContentLoaded', parkThemeToggle);
    setTimeout(parkThemeToggle, 0);

    function setOpen(open) {
      drawer.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      burger.innerHTML = '<span aria-hidden="true">' + (open ? '&times;' : '&#9776;') + '</span>';
      Array.prototype.forEach.call(drawer.querySelectorAll('a,.theme-toggle'), function (n) {
        n.setAttribute('tabindex', open ? '0' : '-1');
      });
    }
    burger.addEventListener('click', function () { setOpen(!drawer.classList.contains('is-open')); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setOpen(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 768) setOpen(false); });
    setOpen(false);
  });

  /* ---------- P1-2: primary button must produce observable feedback ------ */
  safe('button', function () {
    var result = document.getElementById('result');
    if (result) {
      result.setAttribute('role', 'status');
      result.setAttribute('aria-live', 'polite');
      result.setAttribute('aria-atomic', 'true');
    }
    var btn = document.getElementById('calcBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!result) return;
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      result.classList.add('is-flashing');
      setTimeout(function () { result.classList.remove('is-flashing'); }, 900);
      var live = document.getElementById('uifix-live');
      if (!live) {
        live = el('div', 'uifix-sr-only');
        live.id = 'uifix-live';
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        document.body.appendChild(live);
      }
      var big = result.querySelector('.big, .result-headline');
      var text = big ? big.textContent.trim() : result.textContent.trim().slice(0, 120);
      live.textContent = 'Result: ' + text;
    });
  });

  /* ---------- P2-4: FAQ list -> <details> accordion ---------------------- */
  safe('faq', function () {
    var lists = document.querySelectorAll('.faq-list');
    Array.prototype.forEach.call(lists, function (list) {
      if (list.querySelector('details')) return;
      var kids = Array.prototype.slice.call(list.children);
      if (!kids.length || !kids.some(function (n) { return /^H[2-4]$/.test(n.tagName); })) return;
      var frag = document.createDocumentFragment();
      var current = null;
      kids.forEach(function (n) {
        if (/^H[2-4]$/.test(n.tagName)) {
          var d = el('details', 'mq-faq');
          var s = el('summary');
          s.textContent = n.textContent.trim();
          d.appendChild(s);
          d.appendChild(el('div', 'mq-faq-body'));
          frag.appendChild(d);
          current = d;
        } else if (current) {
          current.querySelector('.mq-faq-body').appendChild(n.cloneNode(true));
        }
      });
      if (list.parentNode) list.parentNode.replaceChild(frag, list);
    });
  });

  /* ---------- P2-2: hidden mode <select> -> visible parallel chips ------- */
  safe('modes', function () {
    var sel = document.getElementById('mode');
    if (!sel || sel.tagName !== 'SELECT' || sel.options.length < 2) return;
    var wrap = el('div', 'mq-modes');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Calculation mode');
    function sync() {
      Array.prototype.forEach.call(wrap.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-value') === sel.value ? 'true' : 'false');
      });
    }
    Array.prototype.forEach.call(sel.options, function (o) {
      var b = el('button', '', o.textContent);
      b.type = 'button';
      b.setAttribute('data-value', o.value);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        sel.value = o.value;
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        sync();
      });
      wrap.appendChild(b);
    });
    sel.parentNode.insertBefore(wrap, sel);
    sel.classList.add('mq-mode-native');
    sel.addEventListener('change', sync);
    // keep the select keyboard/screen-reader reachable without visual noise
    sel.setAttribute('aria-label', 'Calculation mode (select)');
    sync();
  });

  /* ---------- P2-1: "tool is the hero" instant converter on homepages ---- */
  safe('quick', function () {
    var hero = document.querySelector('.hero');
    if (!hero || !document.getElementById('tool-search')) return;
    if (document.querySelector('.mq-quick')) return;

    var GROUPS = {
      main: [
        { label: 'Length', base: 'm', units: [
          ['m', function (v) { return v; }], ['cm', function (v) { return v * 100; }],
          ['mm', function (v) { return v * 1000; }], ['km', function (v) { return v / 1000; }],
          ['in', function (v) { return v * 39.3701; }], ['ft', function (v) { return v * 3.28084; }],
          ['yd', function (v) { return v * 1.09361; }], ['mi', function (v) { return v / 1609.344; }]
        ] },
        { label: 'Weight', base: 'kg', units: [
          ['kg', function (v) { return v; }], ['g', function (v) { return v * 1000; }],
          ['lb', function (v) { return v * 2.20462; }], ['oz', function (v) { return v * 35.274; }],
          ['st', function (v) { return v / 6.35029; }], ['t', function (v) { return v / 1000; }]
        ] }
      ],
      finance: [
        { label: 'Amount breakdown', base: 'USD', units: [
          ['amount', function (v) { return v; }], ['+5%', function (v) { return v * 1.05; }],
          ['+10%', function (v) { return v * 1.1; }], ['+20% VAT', function (v) { return v * 1.2; }],
          ['−10%', function (v) { return v * 0.9; }], ['3% fee', function (v) { return v * 0.03; }]
        ] }
      ],
      health: [
        { label: 'Weight', base: 'kg', units: [
          ['kg', function (v) { return v; }], ['lb', function (v) { return v * 2.20462; }],
          ['st', function (v) { return v / 6.35029; }], ['oz', function (v) { return v * 35.274; }],
          ['g', function (v) { return v * 1000; }]
        ] },
        { label: 'Height', base: 'cm', units: [
          ['cm', function (v) { return v; }], ['m', function (v) { return v / 100; }],
          ['in', function (v) { return v / 2.54; }], ['ft', function (v) { return v / 30.48; }]
        ] }
      ],
      insurance: [
        { label: 'Premium breakdown', base: 'USD', units: [
          ['premium', function (v) { return v; }], ['+5%', function (v) { return v * 1.05; }],
          ['+10%', function (v) { return v * 1.1; }], ['−10%', function (v) { return v * 0.9; }],
          ['monthly', function (v) { return v / 12; }]
        ] }
      ]
    };
    var groups = GROUPS[site] || GROUPS.main;
    var box = el('section', 'mq-quick');
    box.setAttribute('aria-label', 'Instant converter');
    box.innerHTML = '<h2>Instant converter · type once, see every unit</h2>';
    var row = el('div', 'mq-quick__row');
    var input = el('input');
    input.type = 'number'; input.step = 'any'; input.value = '1';
    input.setAttribute('aria-label', 'Value to convert');
    var select = el('select');
    select.setAttribute('aria-label', 'Conversion group');
    groups.forEach(function (g, i) {
      var o = el('option', '', g.label); o.value = String(i); select.appendChild(o);
    });
    row.appendChild(input); row.appendChild(select);
    box.appendChild(row);
    var out = el('div', 'mq-quick__out');
    out.setAttribute('role', 'status');
    out.setAttribute('aria-live', 'polite');
    box.appendChild(out);
    var target = hero.querySelector('.wrap') || hero;
    target.appendChild(box);

    function fmt(n) {
      if (!isFinite(n)) return '—';
      var a = Math.abs(n);
      if (a !== 0 && (a < 0.0001 || a >= 1e9)) return n.toExponential(3);
      return Number(n.toPrecision(7)).toLocaleString('en-US', { maximumFractionDigits: 4 });
    }
    function render() {
      var v = parseFloat(input.value);
      if (!isFinite(v)) { out.innerHTML = '<div class="mq-quick__cell"><b>Enter a number</b><span>—</span></div>'; return; }
      var g = groups[parseInt(select.value, 10) || 0];
      out.innerHTML = g.units.map(function (u) {
        return '<div class="mq-quick__cell"><b>' + u[0] + '</b><span>' + fmt(u[1](v)) + '</span></div>';
      }).join('');
    }
    input.addEventListener('input', render);
    select.addEventListener('change', render);
    render();
  });

  /* ---------- P2-7: encoding repair + scroll hints + table keyboard ----- */
  safe('polish', function () {
    // Some tool H1 emoji were committed with a broken byte sequence and render
    // as U+FFFD. Replace the replacement glyph with a neutral, valid mark.
    Array.prototype.forEach.call(document.querySelectorAll('.page-hero-emoji'), function (n) {
      if (/\uFFFD/.test(n.textContent)) n.textContent = '🧮';
      n.setAttribute('aria-hidden', 'true');
    });
    // Tables that overflow get a keyboard-scrollable container + fade hint.
    Array.prototype.forEach.call(document.querySelectorAll('table'), function (t) {
      var p = t.parentElement;
      if (!p) return;
      if (t.scrollWidth > p.clientWidth + 4 || window.innerWidth < 768) {
        p.setAttribute('tabindex', '0');
        p.setAttribute('role', 'region');
        p.setAttribute('aria-label', 'Scrollable data table');
        p.classList.add('mq-scroll-hint');
      }
    });
    // The 6439px-wide related-tools strip: add buttons + end-of-scroll fade.
    Array.prototype.forEach.call(document.querySelectorAll('.related-strip, .tool-strip, .matrix-strip'), function (strip) {
      if (strip.scrollWidth <= strip.clientWidth + 8) return;
      var bar = el('div', 'mq-scroll-btns');
      var l = el('button', '', '←'); l.type = 'button'; l.setAttribute('aria-label', 'Scroll left');
      var r = el('button', '', '→'); r.type = 'button'; r.setAttribute('aria-label', 'Scroll right');
      l.addEventListener('click', function () { strip.scrollBy({ left: -260, behavior: 'smooth' }); });
      r.addEventListener('click', function () { strip.scrollBy({ left: 260, behavior: 'smooth' }); });
      bar.appendChild(l); bar.appendChild(r);
      strip.parentNode.insertBefore(bar, strip);
      strip.classList.add('mq-scroll-hint');
      strip.addEventListener('scroll', function () {
        strip.classList.toggle('is-end', strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8);
      }, { passive: true });
    });
  });
})();
