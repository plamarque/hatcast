// src/services/magicLinks.js
// Génération et vérification de liens magiques pour mettre à jour une disponibilité via email

import firestoreService from './firestoreService.js'
import configService from './configService.js'

const COLLECTION = 'magicLinks'

// key schema: `${seasonId}__${playerId}__${eventId}__${action}` (avoid overwriting yes/no)
function buildId({ seasonId, playerId, eventId, action }) {
  return `${seasonId}__${playerId}__${eventId}__${action}`
}

/**
 * Generate a random token of specified length
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} Random token string
 */
export function randomToken(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += charset[Math.floor(Math.random() * charset.length)]
  }
  return token
}

export async function createMagicLink({ seasonId, playerId, eventId, action, slug }) {
  const id = buildId({ seasonId, playerId, eventId, action })
  const token = randomToken(40)
  const expirationDays = configService.getMagicLinkExpirationDays()
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * expirationDays
  await firestoreService.setDocument(COLLECTION, id, { seasonId, playerId, eventId, token, action, expiresAt })
  const base = window.location.origin + '/'
  let url = `${base}magic?sid=${encodeURIComponent(seasonId)}&pid=${encodeURIComponent(playerId)}&eid=${encodeURIComponent(eventId)}&t=${encodeURIComponent(token)}&a=${encodeURIComponent(action)}`
  
  // Ajouter le slug si fourni
  if (slug) {
    url += `&slug=${encodeURIComponent(slug)}`
  }
  
  return { id, token, url }
}

// Magic link pour vérification d'email de protection joueur
// Utilise eventId spécial "protection" et action "verify_email"
export async function createEmailVerificationLink({ seasonId, playerId, email, returnUrl = null }) {
  try {
    // S'assurer que firestoreService est initialisé
    await firestoreService.initialize()
    
    const eventId = 'protection'
    const action = 'verify_email'
    const id = buildId({ seasonId, playerId, eventId, action })
    const token = randomToken(40)
    const expirationDays = configService.getMagicLinkExpirationDays()
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * expirationDays
    await firestoreService.setDocument(COLLECTION, id, { seasonId, playerId, eventId, token, action, email, returnUrl, expiresAt })
    const base = window.location.origin + '/'
    let url = `${base}magic?sid=${encodeURIComponent(seasonId)}&pid=${encodeURIComponent(playerId)}&t=${encodeURIComponent(token)}&a=${encodeURIComponent(action)}`
    
    // Ajouter returnUrl si fourni
    if (returnUrl) {
      url += `&returnUrl=${encodeURIComponent(returnUrl)}`
    }
    
    return { id, token, url }
  } catch (error) {
    console.error('Error creating email verification link:', error)
    throw error
  }
}

export async function verifyMagicLink({ seasonId, playerId, eventId, token, action }) {
  try {
    // S'assurer que firestoreService est initialisé
    await firestoreService.initialize()
    
    const id = buildId({ seasonId, playerId, eventId, action })
    const data = await firestoreService.getDocument(COLLECTION, id)
    if (!data) return { valid: false, reason: 'not_found' }
    if (data.token !== token) return { valid: false, reason: 'token_mismatch' }
    if (data.action !== action) return { valid: false, reason: 'action_mismatch' }
    if (typeof data.expiresAt === 'number' && Date.now() > data.expiresAt) return { valid: false, reason: 'expired' }
    return { valid: true, data }
  } catch (error) {
    console.error('Magic link error', error)
    return { valid: false, reason: 'firestore_error', error: error.message }
  }
}

export async function consumeMagicLink({ seasonId, playerId, eventId, action }) {
  const id = buildId({ seasonId, playerId, eventId, action })
  await firestoreService.deleteDocument(COLLECTION, id)
}

// ===== Account email update magic link (separate collection) =====
const ACCOUNT_COLLECTION = 'accountMagicLinks'

export function buildAccountId(token) {
  return `account__${token}`
}

export async function createAccountEmailUpdateLink({ currentEmail, newEmail }) {
  const token = randomToken(40)
  const id = buildAccountId(token)
  const expirationDays = configService.getMagicLinkExpirationDays()
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * expirationDays
  await firestoreService.setDocument(ACCOUNT_COLLECTION, id, { token, currentEmail, newEmail, action: 'account_email_update', expiresAt })
  const base = window.location.origin + '/'
  const url = `${base}magic?a=account_email_update&t=${encodeURIComponent(token)}`
  return { id, token, url }
}

export async function verifyAccountEmailUpdateLink({ token }) {
  const id = buildAccountId(token)
  const data = await firestoreService.getDocument(ACCOUNT_COLLECTION, id)
  if (!data) return { valid: false, reason: 'not_found' }
  if (data.token !== token) return { valid: false, reason: 'token_mismatch' }
  if (typeof data.expiresAt === 'number' && Date.now() > data.expiresAt) return { valid: false, reason: 'expired' }
  return { valid: true, data }
}

export async function consumeAccountEmailUpdateLink({ token }) {
  const id = buildAccountId(token)
  const ref = doc(db, ACCOUNT_COLLECTION, id)
  await deleteDoc(ref)
}


