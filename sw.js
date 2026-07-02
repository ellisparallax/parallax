/* Project Parallax — service worker
   Offline app-shell + runtime caching for the CesiumJS CDN, fonts, and map tiles,
   so previously-viewed areas keep working with no signal (rural sky-watching). */
const VERSION = 'parallax-v2';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const TILES = `${VERSION}-tiles`;
const TILE_LIMIT = 400;

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL).then(c => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// keep a runtime cache from growing without bound
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) { for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]); }
}

async function cacheFirst(request, cacheName, cap) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) { cache.put(request, res.clone()); if (cap) trim(cacheName, cap); }
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const fetching = fetch(request).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
    return res;
  }).catch(() => hit);
  return hit || fetching;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigations → network-first, fall back to cached shell (offline).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Map tiles → cache-first with a size cap.
  if (url.hostname.endsWith('basemaps.cartocdn.com')) {
    event.respondWith(cacheFirst(req, TILES, TILE_LIMIT));
    return;
  }

  // Cesium CDN + Google Fonts + Wikimedia media → runtime cache.
  if (url.hostname.endsWith('jsdelivr.net') ||
      url.hostname.endsWith('gstatic.com') ||
      url.hostname.endsWith('googleapis.com') ||
      url.hostname.endsWith('wikimedia.org') ||
      url.hostname.endsWith('wikipedia.org')) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME));
    return;
  }

  // Same-origin assets → cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, SHELL));
  }
});

/* ===== Web Push (activates once a backend sends pushes; harmless otherwise) ===== */
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; }
  catch (e) { d = { title: 'New UAP sighting nearby', body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'New UAP sighting nearby';
  event.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/favicon-32.png',
    tag: d.id || undefined,
    vibrate: [80, 40, 80],
    data: d
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const d = event.notification.data || {};
  const target = (typeof d.lat === 'number' && typeof d.lon === 'number')
    ? `./index.html#@${d.lat},${d.lon}` : './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) { c.postMessage({ type: 'flyTo', lat: d.lat, lon: d.lon }); return c.focus(); }
      }
      return self.clients.openWindow(target);
    })
  );
});
