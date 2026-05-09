// Tubology Service Worker
const CACHE_NAME = 'tubology-v3';
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
  // Never cache firebase-sync.js — always fetch fresh
  if (e.request.url.includes('firebase-sync')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Network-first: try network, fall back to cache
  e.respondWith(
    fetch(e.request).then(response => {
      // Update cache with fresh response
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
