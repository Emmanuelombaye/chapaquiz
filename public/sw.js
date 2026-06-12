self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Bypass service worker interception for Next.js HMR, socket.io and WebSocket upgrades
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/socket.io') ||
    e.request.headers.get('upgrade') === 'websocket'
  ) {
    return;
  }
  e.respondWith(fetch(e.request));
});
