/* Kids Paint offline application shell. Scope follows this script's directory (GitHub Pages subpath). */
const CACHE_NAME = 'kids-paint-shell-v4.6.0';
const PRECACHE = [
  './', './index.html', './manifest.webmanifest',
  './style.css?v=4.5.0', './drawing.js?v=4.5.0', './pwa.js?v=4.4.1',
  './color-lab.html', './color-lab.css?v=4.6.0',
  './color-lab-core.js?v=4.6.0', './color-lab.js?v=4.6.0',
  './vendor/spectral.min.js?v=3.0.0',
  './THIRD_PARTY_NOTICES.md', './licenses/spectral-MIT.txt',
  './assets/kids-paint-banner.webp', './assets/app-icon.png',
  './assets/icon-192.png', './assets/icon-512.png',
  './apple-touch-icon.png', './favicon.ico'
];
const appRoot = new URL('./', self.registration.scope);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE.map(path => new Request(new URL(path, appRoot), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('kids-paint-shell-') && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(appRoot.pathname)) return;
  // Version checks must always hit the network, not a stale offline shell.
  if (url.pathname === new URL('version.json', appRoot).pathname) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    // Prefer fresh HTML online; use the cached app entry when offline, including ?query launches.
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          // Cache each route under its own path: Color Lab must never replace Home.
          const page = new URL(request.url);
          page.search = '';
          page.hash = '';
          await cache.put(page.href, response.clone());
        }
        return response;
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        const page = new URL(request.url);
        page.search = '';
        page.hash = '';
        const isHome = page.href === appRoot.href ||
          page.href === new URL('index.html', appRoot).href;
        return (await cache.match(page.href)) ||
          (await cache.match(request, { ignoreSearch: true })) ||
          (isHome ? (await cache.match(appRoot.href)) ||
            (await cache.match(new URL('index.html', appRoot).href)) : null) ||
          Response.error();
      }
    })());
    return;
  }

  // Versioned JS/CSS, templates, icons, and the manifest work without a connection.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});
