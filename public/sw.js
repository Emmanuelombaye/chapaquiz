self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Bypass service worker interception for Next.js HMR, socket.io, API endpoints, and WebSocket upgrades
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/socket.io') ||
    url.pathname.startsWith('/api') ||
    e.request.headers.get('upgrade') === 'websocket' ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch((err) => {
      // Gracefully handle offline or network abort cases
      return new Response('Offline / Network Error', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});
