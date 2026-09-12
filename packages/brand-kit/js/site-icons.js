// mQuickCalc — site-icons.js
// Emoji-to-SVG replacement. Non-critical; can run after DOMContentLoaded.
// Used on homepages (tool grid) and on any page with a .feature/.sister-grid block.

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
