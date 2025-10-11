// Service pour gérer les avatars des joueurs
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { getPlayerData } from './players.js'

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
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firestore not initialized')
    }
    
    // 1. Essayer d'abord de récupérer depuis la collection players
    const protectionData = await getPlayerData(playerId, seasonId)
    
    if (protectionData && protectionData.photoURL) {
      const result = {
        photoURL: protectionData.photoURL,
        email: protectionData.email || null,
        isAssociated: !!protectionData.email,
        source: 'players'
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
    // Utiliser le nouveau service players.js
    const playerData = await getPlayerData(playerId, seasonId)
    
    if (playerData && playerData.email) {
      const association = { email: playerData.email, source: 'player' }
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
    
    // 2. Essayer de récupérer depuis userPreferences (utilise firestoreService car ce n'est pas un joueur/protection)
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
 * Sauvegarde l'avatar d'un joueur dans la collection players
 * @param {string} playerId - ID du joueur
 * @param {string} photoURL - URL de l'avatar
 * @param {string} email - Email de l'utilisateur associé (optionnel)
 * @param {string} seasonId - ID de la saison (optionnel)
 * @returns {Promise<boolean>} - true si sauvegardé avec succès
 */
export async function savePlayerAvatar(playerId, photoURL, email = null, seasonId = null) {
  try {
    if (!playerId || !photoURL) {
      throw new Error('playerId and photoURL are required')
    }
    
    // Sanitize Google avatar URLs
    let sanitizedPhotoURL = photoURL.trim()
    if (sanitizedPhotoURL.includes('googleusercontent.com')) {
      sanitizedPhotoURL = sanitizedPhotoURL.replace(/=s\d+-c$/, '=s96')
    }
    
    // Mettre à jour le document players
    if (seasonId) {
      await firestoreService.updateDocument('seasons', seasonId, {
        photoURL: sanitizedPhotoURL,
        updatedAt: new Date()
      }, 'players', playerId)
    }
    
    // Vider le cache pour ce joueur
    clearPlayerAvatarCacheForPlayer(playerId)
    
    // Vider aussi le cache des associations pour forcer le rechargement
    const associationCacheKey = `${playerId}_${seasonId || 'global'}`
    associationCache.delete(associationCacheKey)
    
    logger.debug('PlayerAvatar service: Saved player avatar in players', {
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
 * Supprime l'avatar d'un joueur de la collection players
 * @param {string} playerId - ID du joueur
 * @param {string} seasonId - ID de la saison (optionnel)
 * @returns {Promise<boolean>} - true si supprimé avec succès
 */
export async function deletePlayerAvatar(playerId, seasonId = null) {
  try {
    if (!playerId) {
      throw new Error('playerId is required')
    }
    
    // Mettre à jour le document players pour supprimer l'avatar
    if (seasonId) {
      await firestoreService.updateDocument('seasons', seasonId, {
        photoURL: null,
        updatedAt: new Date()
      }, 'players', playerId)
    }
    
    // Vider le cache pour ce joueur
    clearPlayerAvatarCacheForPlayer(playerId)
    
    // Vider aussi le cache des associations pour forcer le rechargement
    const associationCacheKey = `${playerId}_${seasonId || 'global'}`
    associationCache.delete(associationCacheKey)
    
    logger.debug('PlayerAvatar service: Deleted player avatar from players', { playerId, seasonId })
    
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

/**
 * Synchronise la photoURL Google avec tous les joueurs associés à un email
 * À appeler lors de la connexion avec Google
 * @param {string} email - Email de l'utilisateur
 * @param {string} photoURL - URL de l'avatar Google
 * @returns {Promise<number>} - Nombre de joueurs mis à jour
 */
export async function syncGooglePhotoToPlayers(email, photoURL) {
  if (!email || !photoURL) {
    logger.debug('PlayerAvatar service: Missing email or photoURL for sync')
    return 0
  }
  
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { listAssociationsForEmail } = await import('./players.js')
    
    // Récupérer tous les joueurs associés à cet email
    const associations = await listAssociationsForEmail(email)
    
    if (associations.length === 0) {
      logger.debug('PlayerAvatar service: No players associated with email', { email })
      return 0
    }
    
    // Sanitize Google avatar URL
    let sanitizedPhotoURL = photoURL.trim()
    if (sanitizedPhotoURL.includes('googleusercontent.com')) {
      sanitizedPhotoURL = sanitizedPhotoURL.replace(/=s\d+-c$/, '=s96')
    }
    
    // Mettre à jour tous les joueurs en parallèle
    const updatePromises = associations.map(async (assoc) => {
      try {
        await firestoreService.updateDocument('seasons', assoc.seasonId, {
          photoURL: sanitizedPhotoURL,
          updatedAt: new Date()
        }, 'players', assoc.playerId)
        
        // Vider le cache pour ce joueur
        clearPlayerAvatarCacheForPlayer(assoc.playerId)
        
        return true
      } catch (error) {
        logger.warn(`PlayerAvatar service: Failed to update player ${assoc.playerId}`, error)
        return false
      }
    })
    
    const results = await Promise.all(updatePromises)
    const successCount = results.filter(Boolean).length
    
    logger.info(`PlayerAvatar service: Synced Google photo to ${successCount}/${associations.length} players`, {
      email,
      playerIds: associations.map(a => a.playerId)
    })
    
    // Émettre un événement pour informer les composants
    if (successCount > 0) {
      window.dispatchEvent(new CustomEvent('avatars-synced', { 
        detail: { 
          email,
          playerIds: associations.map(a => a.playerId),
          photoURL: sanitizedPhotoURL
        } 
      }))
    }
    
    return successCount
    
  } catch (error) {
    logger.error('PlayerAvatar service: Error syncing Google photo to players', error)
    return 0
  }
}

/**
 * Résout l'avatar à afficher pour un joueur
 * Retourne soit l'URL de la photo Google, soit un emoji selon le genre
 * @param {string} playerId - ID du joueur
 * @param {string} seasonId - ID de la saison (optionnel)
 * @param {string} playerGender - Genre du joueur ('male', 'female', 'non-specified')
 * @returns {Promise<{type: 'photo'|'emoji', value: string}>}
 */
export async function resolvePlayerAvatar(playerId, seasonId = null, playerGender = 'non-specified') {
  const avatarData = await getPlayerAvatar(playerId, seasonId)
  
  if (avatarData.photoURL) {
    return {
      type: 'photo',
      value: avatarData.photoURL,
      email: avatarData.email,
      isAssociated: avatarData.isAssociated
    }
  }
  
  // Fallback sur l'emoji selon le genre
  const genderEmojis = {
    'male': '👨',
    'female': '👩',
    'non-specified': '👤'
  }
  
  return {
    type: 'emoji',
    value: genderEmojis[playerGender] || genderEmojis['non-specified'],
    email: avatarData.email,
    isAssociated: avatarData.isAssociated
  }
}
