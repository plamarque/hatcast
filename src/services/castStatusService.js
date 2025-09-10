/**
 * Service centralisé pour la gestion du statut des compositions
 */

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
  const { saveCast } = await import('./storage.js')
  await saveCast(eventId, updatedCast.roles, seasonId)
  
  return updatedCast
}
