// FCM push notifications helper
import { isSupported, getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging'
import { app, db, auth } from './firebase'
import { setDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore'

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
  const reg = await navigator.serviceWorker.ready
  if (reg?.active && reg.active.state === 'activated') return reg
  const sw = reg?.installing || reg?.waiting
  if (!sw) return reg
  if (sw.state === 'activated') return reg
  await new Promise((resolve) => {
    const onChange = () => {
      if (sw.state === 'activated') {
        sw.removeEventListener('statechange', onChange)
        resolve()
      }
    }
    sw.addEventListener('statechange', onChange)
  })
  return reg
}

export async function requestAndGetToken(serviceWorkerRegistration) {
  if (!(await canUsePush())) return null
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const messaging = getMessaging(app)
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
        userAgent: navigator.userAgent
      }, { merge: true })
    }
  } catch {}
  return token
}

export function onForegroundMessage(callback) {
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}

export async function revokePushToken() {
  try {
    const messaging = getMessaging(app)
    await deleteToken(messaging)
  } catch {}
}


