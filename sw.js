/* Capyverso · service worker: abre rápido y funciona sin conexión (menos el video y Spotify) */
const V = 'capyverso-v9';
const SHELL = ['./', 'index.html', 'css/style.css', 'js/content.js', 'js/skydata.js', 'js/sky.js', 'js/booth.js', 'js/map.js', 'js/cake.js', 'js/app.js',
  'assets/capi-left.png', 'assets/capi-top.png', 'assets/capi-right.png', 'assets/capi-poster.jpg', 'assets/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || r.headers.has('range') || u.pathname.endsWith('.mp4')) return;
  // red primero (para que las actualizaciones lleguen), caché como respaldo
  e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
