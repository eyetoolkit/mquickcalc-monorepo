// mQuickCalc PWA service worker
const CACHE_NAME = 'mquickcalc-v3';
const PRECACHE = ['/', '/css/site.css', '/js/site.js', '/manifest.webmanifest', '/favicon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.pathname.match(/.(html|xml)$/) || url.pathname === '/') { e.respondWith(fetch(req).catch(() => caches.match(req))); }
  else { e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE_NAME).then(cc => cc.put(req, cp)); return r; }))); }
});