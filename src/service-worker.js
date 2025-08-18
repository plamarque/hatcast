/// <reference lib="webworker" />
/* global self */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

// Silence workbox logs in production (vite-plugin-pwa will inject workbox at build time)
self.__WB_DISABLE_DEV_LOGS = true

// Precache assets injected at build time
precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

// Force update check and skip waiting for new versions
self.skipWaiting()

// Handle service worker updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear old caches to ensure new assets are loaded
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== 'workbox-precache-v2') {
              return caches.delete(cacheName)
            }
          })
        )
      })
    ])
  )
})

// Listen for messages from the main thread to check for updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Notifier tous les clients que la mise à jour va commencer
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATING' })
      })
    })
    
    // Attendre un peu avant de skip waiting pour permettre la notification
    setTimeout(() => {
      self.skipWaiting()
    }, 100)
  }
})

// Basic notificationclick handler (future-proof for push integration)
self.addEventListener('notificationclick', (event) => {
  const data = event.notification?.data || {}
  const url = data.url || '/'
  const noUrl = data.noUrl
  const yesUrl = data.yesUrl
  const confirmUrl = data.confirmUrl
  const declineUrl = data.declineUrl
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Actions spécifiques pour sélection
      if (event.action === 'confirm' && confirmUrl) return self.clients.openWindow(confirmUrl)
      if (event.action === 'decline' && declineUrl) return self.clients.openWindow(declineUrl)
      // Actions spécifiques pour disponibilité
      if (event.action === 'no' && noUrl) return self.clients.openWindow(noUrl)
      if (event.action === 'yes' && yesUrl) return self.clients.openWindow(yesUrl)
      const targetUrl = url
      const client = clients.find((c) => c.url.includes(targetUrl))
      if (client) return client.focus()
      return self.clients.openWindow(targetUrl)
    })
  )
})

// Firebase Messaging background handler (compat build for SW)
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

try {
  // Config Firebase - utiliser des valeurs par défaut pour éviter les erreurs
  const firebaseConfig = {
    apiKey: 'demo-key',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo-project',
    storageBucket: 'demo-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'demo-app-id',
    measurementId: 'demo-measurement-id'
  }
  
  // Vérifier si on a une config valide (pas de valeurs demo)
  const hasValidConfig = Object.values(firebaseConfig).every(value => 
    value && !value.includes('demo')
  )
  
  if (hasValidConfig) {
    firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()
  messaging.onBackgroundMessage((payload) => {
    const data = payload?.data || {}
    const title = data.title || payload.notification?.title || 'Notification'
    const body = data.body || payload.notification?.body || ''
    const icon = data.icon || '/icons/manifest-icon-192.maskable.png'
    const url = data.url || '/'
    const noUrl = data.noUrl
    const yesUrl = data.yesUrl
    const confirmUrl = data.confirmUrl
    const declineUrl = data.declineUrl
    const reason = data.reason || 'generic'
    /** @type {NotificationAction[]} */
    const actions = []
    
    // Actions adaptatives selon le type de notification
    if (reason === 'selection') {
      // Notifications de sélection : actions de confirmation et déclin
      if (confirmUrl) actions.push({ action: 'confirm', title: '✅ Confirmer' })
      if (declineUrl) actions.push({ action: 'decline', title: '❌ Décliner' })
      actions.push({ action: 'open', title: 'Voir l\'événement' })
    } else if (reason === 'availability_request' || reason === 'availability_reminder') {
      // Notifications de disponibilité : actions oui/non
      if (yesUrl) actions.push({ action: 'yes', title: '✅ Dispo' })
      if (noUrl) actions.push({ action: 'no', title: '❌ Pas dispo' })
      actions.push({ action: 'open', title: 'Voir l\'événement' })
    } else {
      // Notifications génériques
      if (yesUrl) actions.push({ action: 'yes', title: '✅ Dispo' })
      if (noUrl) actions.push({ action: 'no', title: '❌ Pas dispo' })
      actions.push({ action: 'open', title: 'Voir' })
    }
    
    self.registration.showNotification(title, { body, icon, actions, data: { url, noUrl, yesUrl, confirmUrl, declineUrl, reason } })
  })
  }
} catch (e) {
  // ignore in dev/preview or if Firebase config is not available
  console.log('Firebase Messaging not available in service worker:', e.message)
}


