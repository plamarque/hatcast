// Service pour gérer les avatars des joueurs
import { getFirebaseDb } from './firebase.js'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import logger from './logger.js'

// Cache pour éviter les requêtes répétées
const avatarCache = new Map()
const associationCache = new Map()

/**
 * Récupère l'avatar d'un joueur (ou null si pas d'association)
 * @param {string} playerId - ID du joueur
 * @param {string} seasonId - ID de la saison (optionnel)
 * @returns {Promise<{photoURL: string|null, email: string|null, isAssociated: boolean}>}
 */
export async function getPlayerAvatar(playerId, seasonId = null) {
  const cacheKey = `${seasonId || 'global'}_${playerId}`
  
  // Vérifier le cache d'abord
  if (avatarCache.has(cacheKey)) {
    return avatarCache.get(cacheKey)
  }
  
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firestore not initialized')
    }
    
    // 1. Chercher l'association joueur-utilisateur
    const association = await getPlayerAssociation(playerId, seasonId)
    
    if (!association) {
      const result = { photoURL: null, email: null, isAssociated: false }
      avatarCache.set(cacheKey, result)
      return result
    }
    
    // 2. Récupérer l'avatar de l'utilisateur associé
    const photoURL = await getUserPhotoURL(association.email)
    
    const result = {
      photoURL,
      email: association.email,
      isAssociated: true
    }
    
    // Mettre en cache le résultat
    avatarCache.set(cacheKey, result)
    
    logger.debug('PlayerAvatar service: Retrieved avatar', {
      playerId,
      seasonId,
      email: association.email,
      hasAvatar: !!photoURL
    })
    
    return result
    
  } catch (error) {
    logger.warn('PlayerAvatar service: Error getting player avatar', error)
    const result = { photoURL: null, email: null, isAssociated: false }
    avatarCache.set(cacheKey, result)
    return result
  }
}

/**
 * Récupère l'association d'un joueur
 */
async function getPlayerAssociation(playerId, seasonId) {
  const cacheKey = `${seasonId || 'global'}_${playerId}`
  
  if (associationCache.has(cacheKey)) {
    return associationCache.get(cacheKey)
  }
  
  try {
    const db = getFirebaseDb()
    
    // Essayer d'abord la collection spécifique à la saison
    if (seasonId) {
      const seasonProtectionRef = doc(db, 'seasons', seasonId, 'playerProtection', playerId)
      const seasonSnap = await getDoc(seasonProtectionRef)
      
      if (seasonSnap.exists()) {
        const data = seasonSnap.data()
        if (data.email && data.isProtected) {
          const association = { email: data.email, source: 'season' }
          associationCache.set(cacheKey, association)
          return association
        }
      }
    }
    
    // Fallback vers la collection globale
    const globalProtectionRef = doc(db, 'playerProtection', playerId)
    const globalSnap = await getDoc(globalProtectionRef)
    
    if (globalSnap.exists()) {
      const data = globalSnap.data()
      if (data.email && data.isProtected) {
        const association = { email: data.email, source: 'global' }
        associationCache.set(cacheKey, association)
        return association
      }
    }
    
    // Aucune association trouvée
    associationCache.set(cacheKey, null)
    return null
    
  } catch (error) {
    logger.warn('PlayerAvatar service: Error getting association', error)
    associationCache.set(cacheKey, null)
    return null
  }
}

// Cache des avatars utilisateurs (stockage temporaire)
const userAvatarsCache = new Map()

/**
 * Stocke l'avatar d'un utilisateur dans le cache
 * À appeler quand un utilisateur se connecte
 */
export function storeUserAvatar(email, photoURL) {
  if (email && photoURL) {
    userAvatarsCache.set(email, photoURL)
    logger.debug('PlayerAvatar service: Stored user avatar', { email, photoURL })
  }
}

/**
 * Récupère la photoURL d'un utilisateur via son email
 */
async function getUserPhotoURL(email) {
  try {
    // 1. Vérifier le cache d'abord
    if (userAvatarsCache.has(email)) {
      const photoURL = userAvatarsCache.get(email)
      logger.debug('PlayerAvatar service: Found user avatar in cache', { email, photoURL })
      return photoURL
    }
    
    // 2. Essayer de récupérer depuis userPreferences
    const db = getFirebaseDb()
    if (db) {
      const userRef = doc(db, 'userPreferences', `email_${email}`)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        const userData = userSnap.data()
        if (userData.photoURL) {
          // Stocker dans le cache pour la prochaine fois
          userAvatarsCache.set(email, userData.photoURL)
          logger.debug('PlayerAvatar service: Found user avatar in userPreferences', { email, photoURL: userData.photoURL })
          return userData.photoURL
        }
      }
    }
    
    logger.debug('PlayerAvatar service: No user avatar found', { email })
    return null
    
  } catch (error) {
    logger.warn('PlayerAvatar service: Error getting user photoURL', error)
    return null
  }
}

/**
 * Récupère les avatars de plusieurs joueurs en une fois (optimisation)
 */
export async function getPlayersAvatars(playerIds, seasonId = null) {
  const promises = playerIds.map(playerId => getPlayerAvatar(playerId, seasonId))
  const results = await Promise.all(promises)
  
  const avatarsMap = {}
  playerIds.forEach((playerId, index) => {
    avatarsMap[playerId] = results[index]
  })
  
  return avatarsMap
}

/**
 * Vide le cache (utile après des changements d'association)
 */
export function clearPlayerAvatarCache() {
  avatarCache.clear()
  associationCache.clear()
  logger.debug('PlayerAvatar service: Cache cleared')
}

/**
 * Pré-charge les avatars d'une liste de joueurs (optimisation)
 */
export async function preloadPlayersAvatars(playerIds, seasonId = null) {
  // Lance les requêtes en parallèle sans attendre les résultats
  playerIds.forEach(playerId => {
    getPlayerAvatar(playerId, seasonId).catch(() => {
      // Ignore les erreurs pour le preload
    })
  })
}
