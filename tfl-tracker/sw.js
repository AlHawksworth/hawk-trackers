// TFL Journey Dashboard — Service Worker
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'tfl-tracker-' + CACHE_VERSION;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS).catch(() =>
        Promise.allSettled(ASSETS.map(a => cache.add(a)))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('tfl-tracker-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first, fall back to cache for offline use
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
