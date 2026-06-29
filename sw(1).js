/* GAMMA Quimioterapia — service worker para uso sin conexión */
const CACHE = 'gamma-offline-v1';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        try {
          if (res && res.status === 200 && new URL(req.url).origin === location.origin) {
            const cp = res.clone();
            caches.open(CACHE).then(c => c.put(req, cp));
          }
        } catch (_) {}
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
