const CACHE_NAME = 'jyc-cache-v64-5-6';

const APP_SHELL = ['/', '/offline.html', '/manifest.json', '/JYC%20Logo(4).png'];

function validImageManifest(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.version !== 1) return false;
  const images = payload.images;
  if (!images || typeof images !== 'object' || Array.isArray(images)) return false;
  const entries = Object.entries(images);
  if (!entries.length || entries.length > 10000) return false;
  return entries.every(([url, record]) => {
    if (typeof url !== 'string' || !url.startsWith('/assets/') || url.startsWith('//')) return false;
    if (url.includes('\\') || /[?#\x00-\x1f\x7f]/.test(url) || /%(?:25)*(?:2e|2f|5c)/i.test(url)) return false;
    if (url.split('/').some(segment => !segment || segment === '.' || segment === '..')) return false;
    if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
    const { width, height, aspectRatio, orientation, derivativesEligible } = record;
    if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) return false;
    if (typeof aspectRatio !== 'number' || !Number.isFinite(aspectRatio) || aspectRatio !== Number((width / height).toFixed(5))) return false;
    const expectedOrientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait';
    if (orientation !== expectedOrientation || typeof derivativesEligible !== 'boolean') return false;
    if (derivativesEligible && !/^\/assets\/(?:source-archive|hub-photos|hub-photos-extra)\//.test(url)) return false;
    return true;
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const request = event.request;
  const requestUrl = new URL(request.url);
  // Image manifests are network-first. Only schema-validated JSON may replace
  // the last known-good cache; malformed HTTP 200 responses never poison it.
  if (requestUrl.origin === self.location.origin && requestUrl.pathname === '/image-manifest.json') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          const payload = await response.clone().json().catch(() => null);
          if (validImageManifest(payload)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        }
        return await caches.match(request) || response;
      } catch {
        return await caches.match(request) || Response.error();
      }
    })());
    return;
  }
  // Never cache same-origin API responses. Public JYC Now uses /api/jyc-updates and
  // must be allowed to refresh even when an older service-worker cache exists.
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match('/').then((shell) => shell || caches.match('/offline.html'))))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      }
      return response;
    }).catch(() => Response.error()))
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data?.text?.() || 'A new JYC update is available.' }; }
  const title = payload.title || 'JYC Update';
  const options = {
    body: payload.body || 'A new JYC update is available.',
    icon: payload.icon || '/JYC%20Logo(4).png',
    badge: payload.badge || '/JYC%20Logo(4).png',
    tag: payload.tag || 'jyc-update',
    data: { url: payload.url || '/' },
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const candidate = new URL(event.notification.data?.url || '/', self.location.origin);
  const target = candidate.origin === self.location.origin ? candidate.href : self.location.origin + '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if ('focus' in client) {
        try { client.navigate(target); } catch {}
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(target);
    return undefined;
  }));
});
