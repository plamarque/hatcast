/**
 * Service pour gérer les casts et leurs statuts
 * Centralise la logique de chargement et de récupération des données de cast
 */

import { loadCasts as loadCastsFromStorage, updatePlayerCastStatus, saveCast } from './storage.js'

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

// updatePlayerCastStatus est déjà importé depuis storage.js

/**
 * Calcule le statut d'une composition basé sur les slots et les statuts des joueurs
 * @param {Object} cast - La composition actuelle
 * @param {Object} event - L'événement
 * @param {Object} teamSlots - Les slots de l'équipe (depuis l'UI)
 * @param {Object} playerAvailability - Disponibilités des joueurs
 * @param {number} availableCount - Nombre de joueurs disponibles
 * @returns {Object} - Statut de la composition
 */
export function calculateCastStatus(cast, event, teamSlots, playerAvailability, availableCount) {
  if (!cast || !event) {
    return { type: 'ready', availableCount: 0, requiredCount: 0 }
  }

  // Calculer le nombre requis
  const requiredCount = event.roles && typeof event.roles === 'object' 
    ? Object.values(event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (event.playerCount || 6)

  // Extraire les joueurs composés
  const selectedPlayers = extractSelectedPlayers(cast)
  
  // Vérifier s'il y a des slots vides (basé sur teamSlots si disponible)
  const hasEmptySlots = teamSlots ? teamSlots.some(slot => !slot.player) : false
  
  // Vérifier les joueurs indisponibles
  const hasUnavailablePlayers = selectedPlayers.some(playerName => 
    playerAvailability && playerAvailability[playerName] === false
  )
  
  // Vérifier les joueurs qui ont décliné
  const hasDeclinedPlayers = selectedPlayers.some(playerName => 
    cast.playerStatuses?.[playerName] === 'declined'
  )
  
  // Vérifier s'il y a assez de joueurs disponibles
  const hasInsufficientPlayers = availableCount < requiredCount

  // Cas 1: Aucune composition
  if (selectedPlayers.length === 0) {
    return {
      type: 'ready',
      availableCount,
      requiredCount
    }
  }

  // Cas 2: Composition incomplète (problèmes détectés)
  if (hasUnavailablePlayers || hasInsufficientPlayers || hasDeclinedPlayers || hasEmptySlots) {
    return {
      type: 'incomplete',
      hasUnavailablePlayers,
      hasInsufficientPlayers,
      hasDeclinedPlayers,
      hasEmptySlots,
      unavailablePlayers: selectedPlayers.filter(playerName => 
        playerAvailability && playerAvailability[playerName] === false
      ),
      declinedPlayers: selectedPlayers.filter(playerName => 
        cast.playerStatuses?.[playerName] === 'declined'
      ),
      availableCount,
      requiredCount
    }
  }

  // Cas 3: Pas assez de joueurs pour faire une composition
  if (availableCount < requiredCount) {
    return {
      type: 'insufficient',
      availableCount,
      requiredCount
    }
  }

  // Cas 4: Assez de joueurs mais pas de composition
  if (selectedPlayers.length === 0) {
    return {
      type: 'ready',
      availableCount,
      requiredCount
    }
  }

  // Cas 5: Tous les joueurs ont confirmé → Confirmée (définitive)
  if (cast.confirmed && cast.confirmedByAllPlayers) {
    return {
      type: 'confirmed',
      availableCount,
      requiredCount
    }
  }

  // Cas 6: Confirmée par l'organisateur uniquement → À confirmer (en attente des joueurs)
  if (cast.confirmed && !cast.confirmedByAllPlayers) {
    return {
      type: 'pending_confirmation',
      availableCount,
      requiredCount
    }
  }

  // Cas 7: Composition complète mais non confirmée par l'organisateur
  return {
    type: 'complete',
    availableCount,
    requiredCount
  }
}

/**
 * Extrait les joueurs composés selon la structure de la composition
 * @param {Object|Array} cast - La composition
 * @returns {Array} - Liste des joueurs composés
 */
function extractSelectedPlayers(cast) {
  if (!cast) return []
  
  if (Array.isArray(cast)) {
    // Ancienne structure (array direct)
    return cast
  } else if (cast.players && Array.isArray(cast.players)) {
    // Nouvelle structure avec players
    return cast.players
  } else if (cast.roles && typeof cast.roles === 'object') {
    // Nouvelle structure multi-rôles : extraire tous les joueurs de tous les rôles
    const allPlayers = []
    for (const rolePlayers of Object.values(cast.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    // Retourner un tableau unique (sans doublons)
    return [...new Set(allPlayers)]
  }
  
  return []
}

/**
 * Met à jour le statut de la composition dans la base de données
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison
 * @param {Object} cast - La composition actuelle
 * @param {Object} event - L'événement
 * @param {Object} teamSlots - Les slots de l'équipe
 * @param {Object} playerAvailability - Disponibilités des joueurs
 * @param {number} availableCount - Nombre de joueurs disponibles
 */
export async function updateCastStatus(eventId, seasonId, cast, event, teamSlots, playerAvailability, availableCount) {
  const status = calculateCastStatus(cast, event, teamSlots, playerAvailability, availableCount)
  
  // Mettre à jour la composition avec le nouveau statut
  const updatedCast = {
    ...cast,
    status: status.type,
    statusDetails: {
      hasUnavailablePlayers: status.hasUnavailablePlayers || false,
      hasInsufficientPlayers: status.hasInsufficientPlayers || false,
      hasDeclinedPlayers: status.hasDeclinedPlayers || false,
      hasEmptySlots: status.hasEmptySlots || false,
      unavailablePlayers: status.unavailablePlayers || [],
      declinedPlayers: status.declinedPlayers || [],
      availableCount: status.availableCount,
      requiredCount: status.requiredCount
    },
    updatedAt: new Date()
  }
  
  // Sauvegarder en base
  await saveCast(eventId, updatedCast.roles, seasonId)
  
  return updatedCast
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
