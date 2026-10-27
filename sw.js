const CACHE = 'clubhuis-shell-v1';
const BASE = '/Ons-Clubhuis/';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    BASE + 'offline.html', BASE + 'manifest.webmanifest',
    BASE + 'icons/icon-192.png', BASE + 'icons/icon-512.png'
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE).map(key => caches.delete(key))
  )));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.mode !== 'navigate') return;
  event.respondWith(fetch(request).catch(() => caches.match(BASE + 'offline.html')));
});
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = typeof data.title === 'string' ? data.title : 'Ons Clubhuis';
  const body = typeof data.body === 'string' ? data.body : 'Er is een nieuw bericht.';
  event.waitUntil(self.registration.showNotification(title, {
    body: body.slice(0, 180), icon: BASE + 'icons/icon-192.png',
    badge: BASE + 'icons/icon-192.png', tag: String(data.tag || 'clubhuis'),
    data: { url: BASE }, vibrate: [100, 50, 100]
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(BASE, self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients => {
    const existing = clients.find(client => client.url.startsWith(url));
    if (existing) return existing.focus();
    return self.clients.openWindow(url);
  }));
});
