// mQuickCalc PWA service worker
// v4 (2026-10-06): drop dead /js/site.js precache (file removed in the
// site-core/icons/enhance/meters split), stop precaching unversioned
// /css/site.css (it pinned a stale copy forever), bump cache name to
// evict everything stored by v3. CSS/JS are runtime-cached; HTML/XML
// are always network-first.
const CACHE_NAME = 'mquickcalc-v4';
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;
  if(url.pathname.match(/.(html|xml)$/) || url.pathname === '/') { e.respondWith(fetch(req).catch(() => caches.match(req))); }
  else { e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE_NAME).then(cc => cc.put(req, cp)); return r; }))); }
});
