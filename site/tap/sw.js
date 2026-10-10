// Hosting-only migration: isolate Tap's offline cache from sibling previews.
// Bump VERSION when publishing changed Tap assets to refresh installed copies.
const VERSION = 'v2-doi-evidence';
const PREFIX = 'scandoc-preview-tap:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const FILES = [
  './',
  './index.html',
  './sentinel_dot.js',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES))
      .catch(() => {}),
  );
  self.skipWaiting();
});
self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(
          ks.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url),
    scope = new URL(self.registration.scope);
  if (
    e.request.method !== 'GET' ||
    url.origin !== scope.origin ||
    !url.pathname.startsWith(scope.pathname)
  )
    return;
  e.respondWith(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)),
      ),
  );
});
