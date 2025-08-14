// FCM push notifications helper
import { isSupported, getToken, onMessage, deleteToken } from 'firebase/messaging'
import { db, auth, getMessaging } from './firebase'
import { setDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { getApp } from 'firebase/app'

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function canUsePush() {
  try {
    return await isSupported()
  } catch {
    return false
  }
}

async function getActiveServiceWorkerRegistration() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return null
  
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
  const token = await getToken(messaging, swReg ? { vapidKey, serviceWorkerRegistration: swReg } : { vapidKey })
  
  // Persist token with user identity (by email if available)
  try {
    const email = auth?.currentUser?.email || 'anonymous'
    if (email && token) {
      await setDoc(doc(db, 'userPushTokens', email), {
        tokens: arrayUnion(token),
        lastToken: token,
        email,
        updatedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        lastActivation: serverTimestamp()
      }, { merge: true })
    }
  } catch {}
  return token
}

// Fonction pour vérifier et réactiver automatiquement les notifications push
export async function ensurePushNotificationsActive() {
  try {
    // Vérifier si on a déjà un token valide
    const existingToken = localStorage.getItem('fcmToken')
    if (existingToken) {
      // Vérifier si le token est toujours valide
      const messaging = getMessaging(getApp())
      try {
        // Essayer de récupérer le token actuel
        const currentToken = await getToken(messaging, { vapidKey })
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


