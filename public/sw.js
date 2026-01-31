// Service Worker for Push Notifications
// Elevated Physique Fitness PWA

const CACHE_NAME = 'epf-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received', event);

  let data = {
    title: 'Elevated Physique Fitness',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url: '/dashboard',
  };

  // Parse push data if available
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' },
    ],
    tag: data.tag || 'default',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync', event.tag);

  if (event.tag === 'sync-workout-logs') {
    event.waitUntil(syncWorkoutLogs());
  }
});

async function syncWorkoutLogs() {
  // Placeholder for syncing offline workout logs
  console.log('Syncing workout logs...');
}
