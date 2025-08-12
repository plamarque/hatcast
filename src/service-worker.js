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


