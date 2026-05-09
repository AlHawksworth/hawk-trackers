// Tubology Service Worker
const CACHE_NAME = 'tubology-v5';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './live.js',
  './map.js',
  './dashboard.js',
  './games.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache external API calls — pass straight through to network
  if (e.request.url.includes('api.tfl.gov.uk') || e.request.url.includes('firebase')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Network-first for app assets: try network, fall back to cache
  e.respondWith(
    fetch(e.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
