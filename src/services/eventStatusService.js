/**
 * Service pour gérer les statuts des événements de manière cohérente
 * Prend en compte les sélections de joueurs et les compositions
 */

/**
 * Compte le nombre de joueurs disponibles pour un rôle spécifique
 * @param {string} eventId - ID de l'événement
 * @param {string} role - Rôle à vérifier
 * @param {Object} options - Options de calcul
 * @param {Array} options.players - Liste des joueurs
 * @param {Function} options.isAvailableForRole - Fonction pour vérifier la disponibilité par rôle
 * @returns {number} Nombre de joueurs disponibles pour ce rôle
 */
function countAvailablePlayersForRole(eventId, role, options = {}) {
  const { players, isAvailableForRole } = options
  
  if (!players || !isAvailableForRole) {
    return 0
  }
  
  return players.filter(player => 
    isAvailableForRole(player.name, role, eventId)
  ).length
}

/**
 * Obtient le statut d'un événement en tenant compte des sélections de joueurs
 * @param {Object} event - L'événement
 * @param {Object} options - Options de calcul
 * @param {Function} options.getSelectionPlayers - Fonction pour obtenir les joueurs sélectionnés
 * @param {Function} options.getTotalRequiredCount - Fonction pour obtenir le nombre requis
 * @param {Function} options.countAvailablePlayers - Fonction pour compter les joueurs disponibles
 * @param {Function} options.isSelectionConfirmed - Fonction pour vérifier si la sélection est confirmée
 * @param {Function} options.isSelectionConfirmedByOrganizer - Fonction pour vérifier si confirmé par l'organisateur
 * @param {Object} options.casts - Objet contenant les compositions des événements
 * @param {string} options.selectedPlayerId - ID du joueur sélectionné (pour vue timeline)
 * @param {Object} options.availability - Données de disponibilité (pour vue timeline)
 * @returns {string} Le statut de l'événement
 */
export function getEventStatusWithSelection(event, options = {}) {
  const {
    getSelectionPlayers,
    getTotalRequiredCount,
    countAvailablePlayers,
    isSelectionConfirmed,
    isSelectionConfirmedByOrganizer,
    casts,
    selectedPlayerId,
    availability
  } = options

  // Note: Pour la vue timeline, nous voulons toujours afficher le statut de sélection de l'événement,
  // pas le statut de disponibilité du joueur sélectionné. Le statut de disponibilité du joueur
  // est affiché dans AvailabilityCell.
  
  // Si "Tous" est sélectionné, afficher le statut général de l'événement/sélection
  if (event && getSelectionPlayers && getTotalRequiredCount && countAvailablePlayers) {
    const selectedPlayers = getSelectionPlayers(event.id)
    const requiredCount = getTotalRequiredCount(event)
    const availableCount = countAvailablePlayers(event.id)
    const isConfirmedByOrganizer = isSelectionConfirmedByOrganizer ? isSelectionConfirmedByOrganizer(event.id) : false
    const isConfirmedByAllPlayers = isSelectionConfirmed ? isSelectionConfirmed(event.id) : false
    
    // Cas 0: Aucune composition → vérifier si des joueurs manquent par rôle
    if (selectedPlayers.length === 0) {
      // Vérifier si des joueurs manquent pour chaque rôle individuellement
      if (event.roles && typeof event.roles === 'object') {
        // Pour les événements multi-rôles, vérifier chaque rôle
        for (const [role, requiredRoleCount] of Object.entries(event.roles)) {
          if (requiredRoleCount > 0) {
            // Compter les joueurs disponibles pour ce rôle spécifique
            const availableForRole = countAvailablePlayersForRole(event.id, role, options)
            if (availableForRole < requiredRoleCount) {
              return 'missing'
            }
          }
        }
      } else {
        // Pour les anciens événements, utiliser la logique globale
        if (requiredCount > 0 && availableCount < requiredCount) {
          return 'missing'
        }
      }
      return 'ready'
    }
    
    // Priorité : utiliser le statut calculé stocké en base
    if (casts && casts[event.id]?.status && casts[event.id]?.statusDetails) {
      const status = casts[event.id].status
      return status
    }
    
    // Calculer le statut basé sur les sélections
    if (availableCount >= requiredCount) {
      if (isConfirmedByAllPlayers) {
        return 'confirmed'
      } else if (isConfirmedByOrganizer) {
        return 'pending_confirmation'
      } else {
        return 'complete'
      }
    } else if (availableCount > 0) {
      return 'incomplete'
    } else {
      return 'insufficient'
    }
  }
  
  // Fallback : utiliser le statut de la composition si disponible
  if (event.cast && event.cast.status) {
    return event.cast.status
  }
  
  // Dernier fallback : prêt
  return 'ready'
}

/**
 * Obtient le label du statut pour l'affichage
 * @param {string} status - Le statut de l'événement
 * @returns {string} Le label à afficher
 */
export function getStatusLabel(status) {
  switch (status) {
    case 'confirmed': return 'Confirmé'
    case 'pending_confirmation': return 'À confirmer'
    case 'complete': return 'Complet'
    case 'incomplete': return 'Incomplet'
    case 'insufficient': return 'Pas assez de joueurs'
    case 'missing': return 'Manquants'
    case 'ready': return 'Prêt'
    case 'Non renseigné': return 'Non renseigné'
    case 'Aucune disponibilité': return 'Aucune disponibilité'
    case 'Tous disponibles': return 'Tous disponibles'
    default: 
      // Si c'est un format "X dispo", le retourner tel quel
      if (typeof status === 'string' && status.includes('dispo')) {
        return status
      }
      return 'Prêt'
  }
}

/**
 * Obtient la couleur du statut pour l'affichage
 * @param {string} status - Le statut de l'événement
 * @returns {string} Les classes CSS pour la couleur
 */
export function getStatusColor(status) {
  switch (status) {
    case 'confirmed': return 'text-green-400 bg-green-900/30'
    case 'pending_confirmation': return 'text-yellow-400 bg-yellow-900/30'
    case 'complete': return 'text-blue-400 bg-blue-900/30'
    case 'incomplete': return 'text-orange-400 bg-orange-900/30'
    case 'insufficient': return 'text-red-400 bg-red-900/30'
    case 'missing': return 'text-orange-400 bg-orange-900/30'
    case 'ready': return 'text-cyan-400 bg-cyan-900/30'
    case 'Non renseigné': return 'text-gray-400 bg-gray-900/30'
    case 'Aucune disponibilité': return 'text-red-400 bg-red-900/30'
    case 'Tous disponibles': return 'text-green-400 bg-green-900/30'
    default: 
      // Si c'est un format "X dispo", utiliser la couleur verte
      if (typeof status === 'string' && status.includes('dispo')) {
        return 'text-green-400 bg-green-900/30'
      }
      return 'text-gray-400 bg-gray-900/30'
  }
}
