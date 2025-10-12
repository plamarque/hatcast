// Service pour gérer les avatars des joueurs
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { getPlayerData, listAssociationsForEmail } from './players.js'

// Cache pour éviter les requêtes répétées
const avatarCache = new Map()

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
    // Récupérer les données du joueur depuis /seasons/{seasonId}/players/{playerId}
    // C'est la SEULE source de vérité pour les avatars
    const playerData = await getPlayerData(playerId, seasonId)
    
    if (playerData) {
      const result = {
        photoURL: playerData.photoURL || null,
        email: playerData.email || null,
        isAssociated: !!playerData.email,
        source: 'players'
      }
      
      // Mettre en cache le résultat
      avatarCache.set(cacheKey, result)
      
      return result
    }
    
    // Aucun joueur trouvé
    const result = { photoURL: null, email: null, isAssociated: false, source: 'not-found' }
    avatarCache.set(cacheKey, result)
    
    return result
    
  } catch (error) {
    // Ne pas logger les erreurs 'unavailable' qui sont normales
    if (error.code !== 'unavailable' && error.code !== 'not-found') {
      logger.warn('PlayerAvatar service: Error getting player avatar', error)
    }
    const result = { photoURL: null, email: null, isAssociated: false, source: 'error' }
    avatarCache.set(cacheKey, result)
    return result
  }
}


// Cache des avatars utilisateurs (stockage temporaire en mémoire uniquement)
const userAvatarsCache = new Map()

/**
 * Stocke l'avatar d'un utilisateur dans le cache mémoire
 * À appeler quand un utilisateur se connecte
 * Note: Ce cache est temporaire et sera vidé au rechargement de la page
 */
export function storeUserAvatar(email, photoURL) {
  if (email && photoURL) {
    userAvatarsCache.set(email, photoURL)
    logger.debug('PlayerAvatar service: Stored user avatar in memory cache', { email })
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
  logger.debug('PlayerAvatar service: Avatar cache cleared')
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
  
  logger.debug('PlayerAvatar service: Cleared cache for player', { playerId })
}

/**
 * Synchronise la photoURL Google avec tous les joueurs associés à un email
 * À appeler lors de la connexion avec Google
 * Met à jour seulement si la photoURL a changé (optimisation)
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
    
    // Récupérer les données actuelles de tous les joueurs pour comparer
    const playerDataPromises = associations.map(async (assoc) => {
      try {
        const playerData = await firestoreService.getDocument('seasons', assoc.seasonId, 'players', assoc.playerId)
        return {
          ...assoc,
          currentPhotoURL: playerData?.photoURL || null
        }
      } catch (error) {
        logger.warn(`PlayerAvatar service: Could not fetch player ${assoc.playerId} data`, error)
        return {
          ...assoc,
          currentPhotoURL: null
        }
      }
    })
    
    const playersWithCurrentData = await Promise.all(playerDataPromises)
    
    // Filtrer les joueurs qui ont besoin d'une mise à jour
    const playersToUpdate = playersWithCurrentData.filter(player => 
      player.currentPhotoURL !== sanitizedPhotoURL
    )
    
    if (playersToUpdate.length === 0) {
      logger.debug('PlayerAvatar service: All players already have up-to-date photoURL', { 
        email,
        totalPlayers: associations.length 
      })
      return 0
    }
    
    logger.debug(`PlayerAvatar service: Updating ${playersToUpdate.length}/${associations.length} players with new photoURL`)
    
    // Mettre à jour uniquement les joueurs qui en ont besoin
    const updatePromises = playersToUpdate.map(async (player) => {
      try {
        await firestoreService.updateDocument('seasons', player.seasonId, {
          photoURL: sanitizedPhotoURL,
          photoURLUpdatedAt: new Date()
        }, 'players', player.playerId)
        
        // Vider le cache pour ce joueur
        clearPlayerAvatarCacheForPlayer(player.playerId)
        
        return true
      } catch (error) {
        logger.warn(`PlayerAvatar service: Failed to update player ${player.playerId}`, error)
        return false
      }
    })
    
    const results = await Promise.all(updatePromises)
    const successCount = results.filter(Boolean).length
    
    if (successCount > 0) {
      logger.info(`PlayerAvatar service: Synced Google photo to ${successCount}/${playersToUpdate.length} players`, {
        email,
        playerIds: playersToUpdate.map(p => p.playerId)
      })
      
      // Émettre un événement pour informer les composants
      window.dispatchEvent(new CustomEvent('avatars-synced', { 
        detail: { 
          email,
          playerIds: playersToUpdate.map(p => p.playerId),
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
