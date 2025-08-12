/// <reference lib="webworker" />
/* global self */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

// Silence workbox logs in production (vite-plugin-pwa will inject workbox at build time)
self.__WB_DISABLE_DEV_LOGS = true

// Precache assets injected at build time
precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

self.skipWaiting()
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Basic notificationclick handler (future-proof for push integration)
self.addEventListener('notificationclick', (event) => {
  const url = event.notification?.data?.url || '/'
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => c.url.includes(url))
      if (client) return client.focus()
      return self.clients.openWindow(url)
    })
  )
})

// Firebase Messaging background handler (compat build for SW)
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

try {
  // Config Firebase injectée au build via import.meta.env
  firebase.initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  })
  const messaging = firebase.messaging()
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'Notification'
    const body = payload.notification?.body || payload.data?.body || ''
    const icon = payload.notification?.icon || '/icons/manifest-icon-192.maskable.png'
    const url = payload.data?.url || '/'
    self.registration.showNotification(title, { body, icon, data: { url } })
  })
} catch (e) {
  // ignore in dev/preview
}


