self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = String(payload.title || 'Staffroom');
  const options = {
    body: String(payload.body || 'Open Staffroom to view this update.'),
    icon: String(payload.icon || '/pwa-192x192.png'),
    badge: '/pwa-192x192.png',
    data: { url: String(payload.url || '/') },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    let targetUrl = new URL(event.notification.data?.url || '/', self.location.origin);
    if (targetUrl.origin !== self.location.origin) {
      targetUrl = new URL('/', self.location.origin);
    }

    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        if (client.url !== targetUrl.href && 'navigate' in client) {
          await client.navigate(targetUrl.href);
        }
        return client.focus();
      }
    }

    return self.clients.openWindow(targetUrl.href);
  })());
});
