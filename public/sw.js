const CACHE = 'pie-safe-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const STATIC_PATTERNS = [/^\/_next\/static\//, /\/icons\//, /\/apple-touch-icon\.png$/];
const SHARE_CACHE = 'share-target-v1';

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Intercept the Web Share Target POST, stash the image, redirect to the page
  if (url.pathname === '/share-target' && request.method === 'POST') {
    event.respondWith((async () => {
      const formData = await request.formData();
      const file = formData.get('media');
      if (file) {
        const cache = await caches.open(SHARE_CACHE);
        await cache.put('shared-media', new Response(file, { headers: { 'Content-Type': file.type } }));
      }
      return Response.redirect('/share-target', 303);
    })());
    return;
  }

  // Skip non-GET, cross-origin, and API requests — let them hit the network normally
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first only for known static assets
  if (STATIC_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});
