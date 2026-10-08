const CACHE_NAME = 'jyc-cache-v61-0-0';

const APP_SHELL = ['/', '/offline.html', '/manifest.json', '/jyc-logo-official.webp'];

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
    icon: payload.icon || '/jyc-logo-official.webp',
    badge: payload.badge || '/jyc-logo-official.webp',
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
