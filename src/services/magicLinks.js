// src/services/magicLinks.js
// Génération et vérification de liens magiques pour mettre à jour une disponibilité via email

import { db } from './firebase.js'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'

const COLLECTION = 'magicLinks'

// key schema: `${seasonId}__${playerId}__${eventId}__${action}` (avoid overwriting yes/no)
function buildId({ seasonId, playerId, eventId, action }) {
  return `${seasonId}__${playerId}__${eventId}__${action}`
}

function randomToken(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += charset[Math.floor(Math.random() * charset.length)]
  }
  return token
}

export async function createMagicLink({ seasonId, playerId, eventId, action }) {
  const id = buildId({ seasonId, playerId, eventId, action })
  const token = randomToken(40)
  const ref = doc(db, COLLECTION, id)
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 jours
  await setDoc(ref, { seasonId, playerId, eventId, token, action, expiresAt })
  const base = window.location.origin + '/'
  const url = `${base}magic?sid=${encodeURIComponent(seasonId)}&pid=${encodeURIComponent(playerId)}&eid=${encodeURIComponent(eventId)}&t=${encodeURIComponent(token)}&a=${encodeURIComponent(action)}`
  return { id, token, url }
}

export async function verifyMagicLink({ seasonId, playerId, eventId, token, action }) {
  const id = buildId({ seasonId, playerId, eventId, action })
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { valid: false, reason: 'not_found' }
  const data = snap.data()
  if (data.token !== token) return { valid: false, reason: 'token_mismatch' }
  if (data.action !== action) return { valid: false, reason: 'action_mismatch' }
  if (typeof data.expiresAt === 'number' && Date.now() > data.expiresAt) return { valid: false, reason: 'expired' }
  return { valid: true, data }
}

export async function consumeMagicLink({ seasonId, playerId, eventId, action }) {
  const id = buildId({ seasonId, playerId, eventId, action })
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}


