// Service pour gérer les avatars des joueurs
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { getPlayerProtectionData } from './playerProtection.js'

// Cache pour éviter les requêtes répétées
const avatarCache = new Map()
const associationCache = new Map()

/**
 * Récupère l'avatar d'un joueur (depuis la collection playerAvatars ou via association)
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
    if (!firestoreService.isInitialized()) {
      throw new Error('Firestore not initialized')
    }
    
    // 1. Essayer d'abord de récupérer depuis la collection playerProtection
    const protectionData = await getPlayerProtectionData(playerId, seasonId)
    
    if (protectionData && protectionData.photoURL) {
      const result = {
        photoURL: protectionData.photoURL,
        email: protectionData.email || null,
        isAssociated: !!protectionData.email,
        source: 'playerProtection'
      }
      
      // Mettre en cache le résultat
      avatarCache.set(cacheKey, result)
      
      // Log supprimé pour éviter la pollution de la console
      
      return result
    }
    
    // 2. Essayer de récupérer l'association joueur-utilisateur
    const association = await getPlayerAssociation(playerId, seasonId)
    
    if (association && association.email) {
      // 3. Récupérer l'avatar de l'utilisateur associé
      const photoURL = await getUserPhotoURL(association.email)
      
      const result = {
        photoURL,
        email: association.email,
        isAssociated: true,
        source: 'association'
      }
      
      // Mettre en cache le résultat
      avatarCache.set(cacheKey, result)
      

      
      return result
    }
    
    // 4. Essayer de récupérer l'avatar depuis userPreferences (pour tous les utilisateurs)
    try {
      // Si on a une association avec un email, essayer de récupérer l'avatar de cet utilisateur
      if (association && association.email) {
        const photoURL = await getUserPhotoURL(association.email)
        
        if (photoURL) {
          const result = {
            photoURL,
            email: association.email,
            isAssociated: true,
            source: 'userPreferences'
          }
          
          // Mettre en cache le résultat
          avatarCache.set(cacheKey, result)
          
          logger.debug('PlayerAvatar service: Retrieved avatar from userPreferences', {
            playerId,
            seasonId,
            email: association.email,
            hasAvatar: !!photoURL
          })
          
          return result
        }
      }
    } catch (error) {
      logger.debug('Could not check userPreferences for avatar:', error)
    }
    
    // 5. Aucun avatar trouvé
    const result = { photoURL: null, email: null, isAssociated: false, source: 'none' }
    avatarCache.set(cacheKey, result)
    
    // Pas de log pour les avatars non trouvés (cas normal)
    
    return result
    
  } catch (error) {
    // Ne pas logger les erreurs 'unavailable' qui sont normales
    if (error.code !== 'unavailable') {
      logger.warn('PlayerAvatar service: Error getting player avatar', error)
    }
    const result = { photoURL: null, email: null, isAssociated: false, source: 'error' }
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
    // OPTIMISATION: Essayer d'abord dans le document player (plus efficace)
    if (seasonId) {
      const playerData = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
      
      if (playerData && playerData.email) {
        const association = { email: playerData.email, source: 'player' }
        associationCache.set(cacheKey, association)
        return association
      }
    }
    
    // Fallback vers l'ancienne collection playerProtection pour compatibilité
    if (seasonId) {
      const protectionData = await firestoreService.getDocument('seasons', seasonId, 'playerProtection', playerId)
      
      if (protectionData && protectionData.email && protectionData.isProtected) {
        const association = { email: protectionData.email, source: 'season' }
        associationCache.set(cacheKey, association)
        return association
      }
    }
    
    // Fallback vers la collection globale
    const globalProtectionData = await firestoreService.getDocument('playerProtection', playerId)
    
    if (globalProtectionData && globalProtectionData.email && globalProtectionData.isProtected) {
      const association = { email: globalProtectionData.email, source: 'global' }
      associationCache.set(cacheKey, association)
      return association
    }
    
    // Aucune association trouvée
    associationCache.set(cacheKey, null)
    return null
    
  } catch (error) {
    // Ne pas logger les erreurs 'unavailable' qui sont normales
    if (error.code !== 'unavailable') {
      logger.warn('PlayerAvatar service: Error getting association', error)
    }
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
    const userData = await firestoreService.getDocument('userPreferences', `email_${email}`)
    
    if (userData && userData.photoURL) {
      // Stocker dans le cache pour la prochaine fois
      userAvatarsCache.set(email, userData.photoURL)
      logger.debug('PlayerAvatar service: Found user avatar in userPreferences', { email, photoURL: userData.photoURL })
      return userData.photoURL
    }
    
    // Pas de log pour les avatars utilisateur non trouvés (cas normal)
    return null
    
  } catch (error) {
    // Ne pas logger les erreurs 'unavailable' qui sont normales
    if (error.code !== 'unavailable') {
      logger.warn('PlayerAvatar service: Error getting user photoURL', error)
    }
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

/**
 * Sauvegarde l'avatar d'un joueur dans la collection playerProtection
 * @param {string} playerId - ID du joueur
 * @param {string} photoURL - URL de l'avatar
 * @param {string} email - Email de l'utilisateur associé (optionnel)
 * @param {string} seasonId - ID de la saison (optionnel)
 * @returns {Promise<boolean>} - true si sauvegardé avec succès
 */
export async function savePlayerAvatar(playerId, photoURL, email = null, seasonId = null) {
  try {
    if (!firestoreService.isInitialized()) {
      throw new Error('Firestore not initialized')
    }
    
    if (!playerId || !photoURL) {
      throw new Error('playerId and photoURL are required')
    }
    
    // Sanitize Google avatar URLs
    let sanitizedPhotoURL = photoURL.trim()
    if (sanitizedPhotoURL.includes('googleusercontent.com')) {
      sanitizedPhotoURL = sanitizedPhotoURL.replace(/=s\d+-c$/, '=s96')
    }
    
    // Mettre à jour le document playerProtection existant
    const updateData = {
      photoURL: sanitizedPhotoURL,
      updatedAt: new Date().toISOString(),
      updatedBy: email || 'anonymous'
    }
    
    if (seasonId) {
      await firestoreService.setDocument('seasons', seasonId, 'playerProtection', playerId, updateData, { merge: true })
    } else {
      await firestoreService.setDocument('playerProtection', playerId, updateData, { merge: true })
    }
    
    // Vider le cache pour ce joueur
    clearPlayerAvatarCacheForPlayer(playerId)
    
    // Vider aussi le cache des associations pour forcer le rechargement
    const associationCacheKey = `${playerId}_${seasonId || 'global'}`
    associationCache.delete(associationCacheKey)
    
    logger.debug('PlayerAvatar service: Saved player avatar in playerProtection', {
      playerId,
      seasonId,
      hasPhotoURL: !!sanitizedPhotoURL,
      hasEmail: !!email
    })
    
    return true
    
  } catch (error) {
    logger.error('PlayerAvatar service: Error saving player avatar', error)
    return false
  }
}

/**
 * Supprime l'avatar d'un joueur de la collection playerProtection
 * @param {string} playerId - ID du joueur
 * @param {string} seasonId - ID de la saison (optionnel)
 * @returns {Promise<boolean>} - true si supprimé avec succès
 */
export async function deletePlayerAvatar(playerId, seasonId = null) {
  try {
    if (!firestoreService.isInitialized()) {
      throw new Error('Firestore not initialized')
    }
    
    if (!playerId) {
      throw new Error('playerId is required')
    }
    
    // Mettre à jour le document playerProtection pour supprimer l'avatar
    const updateData = {
      photoURL: null,
      updatedAt: new Date().toISOString()
    }
    
    if (seasonId) {
      await firestoreService.setDocument('seasons', seasonId, 'playerProtection', playerId, updateData, { merge: true })
    } else {
      await firestoreService.setDocument('playerProtection', playerId, updateData, { merge: true })
    }
    
    // Vider le cache pour ce joueur
    clearPlayerAvatarCacheForPlayer(playerId)
    
    // Vider aussi le cache des associations pour forcer le rechargement
    const associationCacheKey = `${playerId}_${seasonId || 'global'}`
    associationCache.delete(associationCacheKey)
    
    logger.debug('PlayerAvatar service: Deleted player avatar from playerProtection', { playerId, seasonId })
    
    return true
    
  } catch (error) {
    logger.error('PlayerAvatar service: Error deleting player avatar', error)
    return false
  }
}

/**
 * Vide le cache pour un joueur spécifique
 * @param {string} playerId - ID du joueur
 */
export function clearPlayerAvatarCacheForPlayer(playerId) {
  // Vider toutes les entrées de cache qui contiennent ce playerId
  for (const [key, value] of avatarCache.entries()) {
    if (key.includes(playerId)) {
      avatarCache.delete(key)
    }
  }
  
  for (const [key, value] of associationCache.entries()) {
    if (key.includes(playerId)) {
      associationCache.delete(key)
    }
  }
  
  logger.debug('PlayerAvatar service: Cleared cache for player', { playerId })
}
