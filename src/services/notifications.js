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

export async function requestAndGetToken(serviceWorkerRegistration) {
  if (!(await canUsePush())) return null
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const messaging = getMessaging(app)
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration
  })
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


