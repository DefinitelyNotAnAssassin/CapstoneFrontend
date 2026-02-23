/* eslint-disable no-restricted-globals */
// Firebase messaging service worker for background notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAKKijdNk3qmVaWQT5coebKx27ThulAZ5E",
  authDomain: "sdcahris.firebaseapp.com",
  projectId: "sdcahris",
  storageBucket: "sdcahris.firebasestorage.app",
  messagingSenderId: "569053144992",
  appId: "1:569053144992:web:382b02aaae993faeec26c5",
  measurementId: "G-X4F3L1EYF7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Announcement';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/notification-icon-192.png',
    badge: '/notification-badge-96.png',
    tag: 'announcement-' + (payload.data?.announcement_id || Date.now()),
    renotify: true,
    requireInteraction: false,
    vibrate: [100, 50, 100],
    data: payload.data,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  // Open the announcements page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/announcements') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/announcements');
      }
    })
  );
});
