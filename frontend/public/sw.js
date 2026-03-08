const CACHE_VERSION = 'v1.0.1'; // Force PWA cache bust

self.addEventListener('install', event => {
    self.skipWaiting();
}); self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200, 100, 200],
            data: { url: data.url || '/' }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// A fetch handler is required by Chrome and Firefox to trigger the PWA install prompt.
// This is a simple pass-through that returns a 503 if offline.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => new Response("Media Luna está fuera de línea.", { status: 503 }))
    );
});
