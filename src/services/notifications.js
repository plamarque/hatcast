// FCM push notifications helper
import { isSupported, getToken, onMessage, deleteToken } from 'firebase/messaging'
import { auth, getMessaging } from './firebase'
import firestoreService from './firestoreService.js'
import configService from './configService.js'
import { getApp } from 'firebase/app'

export async function canUsePush() {
  try {
    return await isSupported()
  } catch {
    return false
  }
}

async function getActiveServiceWorkerRegistration() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return null
  
  // En mode développement, ne pas essayer d'enregistrer le SW
  // Temporairement activé pour les tests
  // if (import.meta.env?.DEV) {
  //   logger.info('🔇 Service Worker désactivé en mode développement')
  //   return null
  // }
  
  // Essayer de récupérer une registration existante
  const existingReg = await navigator.serviceWorker.getRegistration()
  if (existingReg && existingReg.active) {
    return existingReg
  }
  
  // Si pas de registration active, en créer une nouvelle
  const reg = await navigator.serviceWorker.register('/service-worker.js')
  
  // Attendre que le SW soit actif
  return new Promise((resolve) => {
    if (reg.active) {
      resolve(reg)
      return
    }
    
    const onChange = () => {
      if (reg.active) {
        reg.removeEventListener('statechange', onChange)
        resolve(reg)
      }
    }
    
    reg.addEventListener('statechange', onChange)
  })
}

export async function requestAndGetToken(serviceWorkerRegistration) {
  if (!(await canUsePush())) return null
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const messaging = getMessaging(getApp())
  
  // Fallback: si aucune registration n'est passée, attendre un SW actif
  let swReg = serviceWorkerRegistration || await getActiveServiceWorkerRegistration()
  const token = await getToken(messaging, swReg ? { vapidKey: configService.getVapidKey(), serviceWorkerRegistration: swReg } : { vapidKey: configService.getVapidKey() })
  
  // Persist token with user identity (by email if available)
  try {
    const email = auth?.currentUser?.email || 'anonymous'
    if (email && token) {
      // Debug: vérifier l'état de firestoreService
      console.log('🔍 Debug firestoreService avant setDocument:', {
        isInitialized: firestoreService.isInitialized,
        hasDb: !!firestoreService.db,
        environment: firestoreService.getEnvironmentInfo(),
        email: email,
        token: token ? 'present' : 'missing'
      })
      
      // Vérifier que firestoreService est initialisé
      if (!firestoreService.isInitialized) {
        console.warn('⚠️ FirestoreService pas encore initialisé, tentative d\'initialisation...')
        await firestoreService.initialize()
      }
      
      // Vérifier que this.db est valide
      if (!firestoreService.db) {
        console.error('❌ FirestoreService.db est null, impossible de sauvegarder le token')
        throw new Error('FirestoreService.db est null')
      }
      
      await firestoreService.setDocument('userPushTokens', email, {
        tokens: [token], // arrayUnion remplacé par un tableau simple
        lastToken: token,
        email,
        updatedAt: new Date(),
        userAgent: navigator.userAgent,
        lastActivation: new Date()
      }, true) // merge: true
      
      console.log('✅ Token push sauvegardé avec succès dans userPushTokens')
    }
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du token push:', {
      error: error.message,
      stack: error.stack,
      firestoreServiceState: {
        isInitialized: firestoreService.isInitialized,
        hasDb: !!firestoreService.db,
        environment: firestoreService.getEnvironmentInfo()
      }
    })
  }
  return token
}

// Fonction pour vérifier et réactiver automatiquement les notifications push
export async function ensurePushNotificationsActive() {
  // En mode développement, désactiver les notifications push
  // Temporairement activé pour les tests
  // if (import.meta.env?.DEV) {
  //   logger.info('🔇 Notifications push désactivées en mode développement')
  //   return { active: false, error: 'Notifications désactivées en développement' }
  // }
  
  try {
    // Vérifier si on a déjà un token valide
    const existingToken = localStorage.getItem('fcmToken')
    if (existingToken) {
      // Vérifier si le token est toujours valide
      const messaging = getMessaging(getApp())
      try {
        // Essayer de récupérer le token actuel
        const currentToken = await getToken(messaging, { vapidKey: configService.getVapidKey() })
        if (currentToken === existingToken) {
          // Token toujours valide
          return { active: true, token: currentToken }
        }
      } catch {
        // Token expiré ou invalide
      }
    }
    
    // Réactiver les notifications push
    const swReg = await getActiveServiceWorkerRegistration()
    const token = await requestAndGetToken(swReg)
    if (token) {
      localStorage.setItem('fcmToken', token)
      return { active: true, token }
    }
    
    return { active: false, error: 'Failed to get token' }
  } catch (error) {
    return { active: false, error: error.message }
  }
}

// Vérifier périodiquement l'état des notifications push
export function startPushHealthCheck() {
  // DÉSACTIVÉ EN LOCAL pour éviter le spam de logs
  // Temporairement activé pour les tests
  // if (import.meta.env?.DEV) {
  //   logger.info('🔇 Push health check désactivé en mode développement')
  //   return
  // }
  
  // Vérifier toutes les 5 minutes
  setInterval(async () => {
    try {
      const status = await ensurePushNotificationsActive()
      if (!status.active) {
        console.log('Push notifications inactive, attempting to reactivate...')
        // Émettre un événement pour informer l'UI
        window.dispatchEvent(new CustomEvent('push-status-changed', { detail: status }))
      }
    } catch (error) {
      console.warn('Push health check failed:', error)
    }
  }, 5 * 60 * 1000) // 5 minutes
}

export function onForegroundMessage(callback) {
  const messaging = getMessaging(getApp())
  return onMessage(messaging, callback)
}

export async function revokePushToken() {
  try {
    const messaging = getMessaging(getApp())
    await deleteToken(messaging)
  } catch {}
}


