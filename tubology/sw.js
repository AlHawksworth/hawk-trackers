// Tubology Service Worker
const CACHE_NAME = 'tubology-v6-' + Date.now();
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

// Queue for offline writes
let writeQueue = [];
let isOnline = navigator.onLine;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Cache addAll failed:', err);
        // Try adding assets individually
        return Promise.allSettled(ASSETS.map(asset => cache.add(asset)));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('tubology-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Never cache external API calls — pass straight through to network
  if (url.hostname.includes('api.tfl.gov.uk') || 
      url.hostname.includes('firebase') ||
      url.hostname.includes('gstatic.com')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Return offline response for API calls
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-first for app assets: try network, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// Handle online/offline status
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'ONLINE_STATUS') {
    isOnline = event.data.online;
    if (isOnline && writeQueue.length > 0) {
      // Process queued writes when back online
      processWriteQueue();
    }
  }
});

function processWriteQueue() {
  // This would integrate with Firebase sync to retry failed writes
  writeQueue = [];
}

// Sync status updates
self.addEventListener('sync', event => {
  if (event.tag === 'firebase-sync') {
    event.waitUntil(processWriteQueue());
  }
});