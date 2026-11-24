const CACHE = 'paeds-dose-v4-5'; // bump on every release
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  // cache:'reload' bypasses the browser/CDN HTTP cache so a new release never precaches a stale index.html
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => fetch(new Request(a, {cache: 'reload'})).then(r => { if (!r.ok) throw new Error(a); return c.put(a, r); })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// stale-while-revalidate: instant/offline from cache, refreshed in the background for the next open
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request, {cache: 'no-cache'}).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit || c.match('index.html'));
    return hit || net;
  })));
});
