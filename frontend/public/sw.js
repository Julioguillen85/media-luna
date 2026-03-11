const CACHE_VERSION = 'v1.0.2'; // Force PWA cache bust

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
    console.log('Push event received', event);
    if (!event.data) {
        console.warn('Push event received with no data');
        return;
    }

    let title = '¡Nuevo Pedido!';
    let options = {
        body: 'Tienes un nuevo pedido en Media Luna',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        data: { url: '/admin' },
        requireInteraction: true,
        tag: 'new-order' // Avoid multiple notifications for the same event
    };

    try {
        const data = event.data.json();
        console.log('Push data received:', data);
        title = data.title || title;
        options.body = data.body || options.body;
        if (data.icon) options.icon = data.icon;
        if (data.url) options.data.url = data.url;
    } catch (e) {
        console.error('Error parsing push JSON payload:', e);
        // Fallback to text payload if not JSON
        try {
            options.body = event.data.text();
        } catch (textErr) {
            console.error('Error parsing push text payload:', textErr);
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
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
