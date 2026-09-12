// mQuickCalc — site-meters.js
// Result-meter renderer. Exposes window.__renderMeters(); page inline scripts
// call it after recomputing their answer. Used on tool pages only.

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
//
