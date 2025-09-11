/**
 * Service pour gérer les casts et leurs statuts
 * Centralise la logique de chargement et de récupération des données de cast
 */

import { loadCasts as loadCastsFromStorage, updatePlayerCastStatus } from './storage.js'

/**
 * Charge tous les casts pour une saison
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<Object>} - Objet avec les casts indexés par eventId
 */
export async function loadCasts(seasonId) {
  try {
    const casts = await loadCastsFromStorage(seasonId)
    return casts
  } catch (error) {
    console.error('Erreur lors du chargement des casts:', error)
    return {}
  }
}

/**
 * Récupère un cast spécifique pour un événement
 * @param {Object} casts - Objet des casts
 * @param {string} eventId - ID de l'événement
 * @returns {Object|null} - Cast ou null si non trouvé
 */
export function getCast(casts, eventId) {
  return casts[eventId] || null
}

/**
 * Récupère le statut de confirmation d'un joueur dans un cast
 * @param {Object} cast - Cast
 * @param {string} playerName - Nom du joueur
 * @param {Array} players - Liste des joueurs
 * @returns {string} - Statut ('pending', 'confirmed', 'declined')
 */
export function getPlayerCastStatus(cast, playerName, players) {
  if (!cast || !cast.playerStatuses) {
    return 'pending'
  }
  
  // Trouver l'ID du joueur
  const player = players.find(p => p.name === playerName)
  if (!player) {
    return 'pending'
  }
  
  // Si c'est la nouvelle structure avec playerStatuses (maintenant avec des IDs)
  if (cast.playerStatuses[player.id]) {
    return cast.playerStatuses[player.id]
  }

  // Si c'est l'ancienne structure avec des noms de joueurs comme clés
  if (cast.playerStatuses[playerName]) {
    return cast.playerStatuses[playerName]
  }

  // Si pas de statut, retourner 'pending'
  return 'pending'
}

/**
 * Récupère le rôle de composition d'un joueur dans un cast
 * @param {Object} cast - Cast
 * @param {string} playerName - Nom du joueur
 * @param {Array} players - Liste des joueurs
 * @returns {string|null} - Rôle ou null si non trouvé
 */
export function getPlayerCastRole(cast, playerName, players) {
  if (!cast || !cast.roles) {
    return null
  }
  
  // Trouver l'ID du joueur
  const player = players.find(p => p.name === playerName)
  if (!player) {
    return null
  }
  
  // Chercher dans quel rôle le joueur a été compositionné (maintenant avec des IDs)
  for (const [role, playerIds] of Object.entries(cast.roles)) {
    if (Array.isArray(playerIds)) {
      // Nouvelle structure : chercher par ID
      if (playerIds.includes(player.id)) {
        return role
      }
      // Ancienne structure : chercher par nom
      if (playerIds.includes(playerName)) {
        return role
      }
    }
  }
  return null
}

/**
 * Vérifie si un joueur est casté pour un événement
 * @param {Object} cast - Cast
 * @param {string} playerName - Nom du joueur
 * @param {Array} players - Liste des joueurs
 * @returns {boolean} - True si le joueur est casté
 */
export function isPlayerCast(cast, playerName, players) {
  return getPlayerCastRole(cast, playerName, players) !== null
}

/**
 * Récupère les données complètes d'un joueur pour un événement
 * @param {Object} cast - Cast
 * @param {string} playerName - Nom du joueur
 * @param {Array} players - Liste des joueurs
 * @returns {Object} - Données complètes du joueur
 */
export function getPlayerCastData(cast, playerName, players) {
  const isCast = isPlayerCast(cast, playerName, players)
  const status = getPlayerCastStatus(cast, playerName, players)
  const role = getPlayerCastRole(cast, playerName, players)
  
  return {
    isCast,
    status,
    role,
    hasStatus: status !== 'pending' || isCast
  }
}

/**
 * Récupère le statut global d'un cast
 * @param {Object} cast - Cast
 * @returns {Object} - Statut global du cast
 */
export function getCastStatus(cast) {
  if (!cast) {
    return {
      type: 'ready',
      confirmed: false,
      confirmedByAllPlayers: false
    }
  }
  
  return {
    type: cast.status || 'complete',
    confirmed: cast.confirmed || false,
    confirmedByAllPlayers: cast.confirmedByAllPlayers || false,
    statusDetails: cast.statusDetails || null
  }
}

/**
 * Vérifie si un cast est confirmé par l'organisateur
 * @param {Object} cast - Cast
 * @returns {boolean} - True si confirmé par l'organisateur
 */
export function isCastConfirmedByOrganizer(cast) {
  if (!cast) return false
  
  // Si c'est la nouvelle structure avec confirmed
  if (cast.confirmed !== undefined) {
    return cast.confirmed
  }
  
  // Si c'est l'ancienne structure, considérer comme non confirmé
  return false
}

/**
 * Met à jour le statut de confirmation d'un joueur dans un cast
 * @param {string} eventId - ID de l'événement
 * @param {string} playerId - ID du joueur
 * @param {string} status - Nouveau statut
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function updatePlayerCastStatus(eventId, playerId, status, seasonId) {
  try {
    const result = await updatePlayerCastStatus(eventId, playerId, status, seasonId)
    return result
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du joueur:', error)
    throw error
  }
}

/**
 * Récupère le prochain statut dans le cycle de confirmation
 * @param {string} currentStatus - Statut actuel
 * @returns {string} - Prochain statut
 */
export function getNextCastStatus(currentStatus) {
  switch (currentStatus) {
    case 'pending':
      return 'confirmed'
    case 'confirmed':
      return 'declined'
    case 'declined':
      return 'pending'
    default:
      return 'pending'
  }
}
