const CACHE_NAME = 'jyc-cache-v64-5-11';

const APP_SHELL = ['/', '/offline.html', '/manifest.json', '/assets/jyc-logo.avif', '/assets/jyc-logo-small.avif', '/assets/jyc-logo-medium.avif'];

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isSafeManifestAssetUrl = (url) => {
  if (typeof url !== 'string' || !url.startsWith('/assets/') || url.startsWith('//')) return false;
  if (url.includes('\\') || /[?#\x00-\x1f\x7f]/.test(url) || /%(?:25)*(?:2e|2f|5c)/i.test(url)) return false;
  const segments = url.slice(1).split('/');
  return segments.every((segment) => Boolean(segment) && segment !== '.' && segment !== '..');
};
const isDerivativeManifestPath = (url) => ['/assets/source-archive/', '/assets/hub-photos/', '/assets/hub-photos-extra/', '/assets/events/', '/assets/home/', '/assets/team/'].some((prefix) => url.startsWith(prefix));
const isDerivativeDimensionEligible = (width, height) => {
  const w = Number(width), h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 320 || h < 120) return false;
  const ratio = w / h;
  return ratio >= 0.25 && ratio <= 5;
};
const IMAGE_MIME_BY_EXTENSION = Object.freeze({
  '.avif': 'image/avif', '.gif': 'image/gif', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp'
});
const isExpectedImageResponse = (pathname, response) => {
  const extension = pathname.match(/\.[^.]+$/)?.[0]?.toLowerCase();
  const expected = IMAGE_MIME_BY_EXTENSION[extension];
  if (!expected) return true;
  const actual = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  return actual === expected;
};
const isValidImageManifest = (payload) => {
  if (!isRecord(payload) || payload.version !== 1 || !isRecord(payload.images)) return false;
  const entries = Object.entries(payload.images);
  if (!entries.length || entries.length > 10000) return false;
  return entries.every(([url, entry]) => {
    if (!isSafeManifestAssetUrl(url) || !isRecord(entry)) return false;
    const { width, height, aspectRatio: ratio } = entry;
    if (typeof width !== 'number' || !Number.isInteger(width) || width <= 0 || typeof height !== 'number' || !Number.isInteger(height) || height <= 0 || typeof ratio !== 'number' || typeof entry.derivativesEligible !== 'boolean') return false;
    if (!Number.isFinite(ratio) || Math.abs(ratio - Number((width / height).toFixed(5))) > 0.000001) return false;
    // A stale manifest must not authorize derivatives for wordmarks, banners or tiny thumbnails.
    if (entry.derivativesEligible && (!isDerivativeManifestPath(url) || !isDerivativeDimensionEligible(width, height))) return false;
    const orientation = width === height ? 'square' : width > height ? 'landscape' : 'portrait';
    return entry.orientation === orientation;
  });
};

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
  // Never cache same-origin API responses. Public JYC Now uses /api/jyc-updates and
  // must be allowed to refresh even when an older service-worker cache exists.
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith('/api/')) return;
  // The image manifest is deployment metadata: always revalidate it before
  // allowing ResponsivePhoto to advertise generated AVIF/WebP candidates.
  // Keep the last known-good manifest only as an offline fallback.
  if (requestUrl.origin === self.location.origin && requestUrl.pathname === '/image-manifest.json') {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-cache' })).then(async (response) => {
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const payload = await response.clone().json().catch(() => null);
          const validManifest = isValidImageManifest(payload);
          if (validManifest) await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())).catch(() => null);
        }
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || Response.error()))
    );
    return;
  }
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
      if (response.ok && new URL(request.url).origin === self.location.origin && isExpectedImageResponse(requestUrl.pathname, response)) {
        // A missing image URL can be rewritten to index.html with HTTP 200. Never cache that HTML under an image key.
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
