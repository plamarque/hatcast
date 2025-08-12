// Queue de notifications push (à traiter côté Cloud Functions)
import { db } from './firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

/**
 * Enqueue a push notification to be sent by backend based on user email.
 * The backend should resolve email -> tokens from collection `userPushTokens` and send via FCM.
 */
export async function queuePushMessage({ toEmail, title, body, data = {}, reason = 'generic' }) {
  if (!toEmail) return { success: false, error: 'missing_toEmail' }
  const payload = {
    to: toEmail,
    title,
    body,
    data,
    reason,
    createdAt: serverTimestamp()
  }
  await addDoc(collection(db, 'pushQueue'), payload)
  return { success: true }
}


