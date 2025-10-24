// src/services/playerAvailabilityService.js
// Service centralisé pour les utilitaires de disponibilité des joueurs

import logger from './logger.js'

/**
 * Vérifie si un joueur est disponible pour un rôle spécifique
 * @param {string} playerName - Nom du joueur
 * @param {string} role - Rôle à vérifier
 * @param {string} eventId - ID de l'événement
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @returns {boolean} - True si le joueur est disponible pour ce rôle
 */
export function isAvailableForRole(playerName, role, eventId, playerAvailability) {
  const availabilityData = playerAvailability?.[playerName]?.[eventId]
  
  // Gestion du nouveau format avec rôles
  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    // Le joueur doit être disponible ET avoir le rôle demandé
    if (availabilityData.available && availabilityData.roles) {
      // Vérifier si le joueur a le rôle spécifique demandé
      if (availabilityData.roles.includes(role)) {
        return true
      }
      // Vérifier si le joueur est disponible "en général" (pas de rôles spécifiques)
      if (availabilityData.roles.length === 0) {
        return true
      }
    }
    return false
  }
  
  // Fallback pour l'ancien format (boolean direct)
  // Dans l'ancien format, true signifiait "disponible en tant que joueur"
  // Donc on ne peut vérifier que pour le rôle "player"
  if (role === 'player') {
    return availabilityData === true
  }
  
  // Pour les autres rôles, on ne peut pas vérifier dans l'ancien format
  return false
}

/**
 * Vérifie si un joueur est disponible pour le rôle "player" (comédien)
 * @param {string} playerName - Nom du joueur
 * @param {string} eventId - ID de l'événement
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @returns {boolean} - True si le joueur est disponible comme comédien
 */
export function isAvailableForPlayerRole(playerName, eventId, playerAvailability) {
  return isAvailableForRole(playerName, 'player', eventId, playerAvailability)
}

/**
 * Vérifie si un joueur est disponible globalement (au moins un rôle)
 * @param {string} playerName - Nom du joueur
 * @param {string} eventId - ID de l'événement
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @returns {boolean} - True si le joueur est disponible pour au moins un rôle
 */
export function isAvailable(playerName, eventId, playerAvailability) {
  const availabilityData = playerAvailability?.[playerName]?.[eventId]
  
  // Gestion du nouveau format avec rôles
  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    return availabilityData.available
  }
  
  // Fallback pour l'ancien format (boolean direct)
  return availabilityData === true
}

/**
 * Récupère les données de disponibilité complètes pour un joueur et un événement
 * @param {string} playerName - Nom du joueur
 * @param {string} eventId - ID de l'événement
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @param {Object} options - Options supplémentaires
 * @param {Function} options.getPlayerSelectionRole - Fonction pour obtenir le rôle de sélection
 * @param {Function} options.getPlayerDeclinedRole - Fonction pour obtenir le rôle décliné
 * @param {Function} options.getPlayerSelectionStatus - Fonction pour obtenir le statut de sélection
 * @param {Function} options.isSelectionConfirmedByOrganizer - Fonction pour vérifier si la sélection est confirmée
 * @returns {Object} - Données de disponibilité formatées
 */
export function getAvailabilityData(playerName, eventId, playerAvailability, options = {}) {
  const {
    getPlayerSelectionRole = () => null,
    getPlayerDeclinedRole = () => null,
    getPlayerSelectionStatus = () => null,
    isSelectionConfirmedByOrganizer = () => false
  } = options

  const availabilityData = playerAvailability?.[playerName]?.[eventId]
  
  // Vérifier s'il y a une sélection ET si elle est validée par l'organisateur
  const selectionRole = getPlayerSelectionRole(playerName, eventId)
  const isSelectionValidated = isSelectionConfirmedByOrganizer(eventId)
  
  // Vérifier aussi si le joueur est dans la section déclinés
  const declinedRole = getPlayerDeclinedRole(playerName, eventId)
  
  // Vérifier le statut de sélection
  const selectionStatus = getPlayerSelectionStatus(playerName, eventId)
  
  // Si on est sélectionné ET la composition est validée par l'organisateur OU si on est dans les déclinés
  if ((selectionRole && isSelectionValidated) || declinedRole) {
    // Afficher uniquement le rôle de composition, pas les rôles de disponibilité
    const selectedRole = selectionRole || declinedRole
    
    return {
      available: true, // Toujours true pour l'affichage, le statut est géré par selectionStatus
      roles: [selectedRole], // Uniquement le rôle de composition
      comment: availabilityData?.comment || null,
      isSelectionDisplay: true,
      selectionStatus: selectionStatus,
      selectedRole: selectedRole // Garder une référence au rôle sélectionné
    }
  }
  
  // Pas de sélection, afficher la disponibilité normale
  if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
    return {
      ...availabilityData,
      isSelectionDisplay: false
    }
  }
  
  // Fallback pour l'ancien format (boolean direct)
  if (availabilityData === true) {
    return {
      available: true,
      roles: ['player'],
      comment: null,
      isSelectionDisplay: false
    }
  } else if (availabilityData === false) {
    return {
      available: false,
      roles: [],
      comment: null,
      isSelectionDisplay: false
    }
  } else {
    // Pas de disponibilité définie (undefined/null)
    return {
      available: undefined,
      roles: [],
      comment: null,
      isSelectionDisplay: false
    }
  }
}

/**
 * Filtre une liste de joueurs selon leur disponibilité pour un rôle spécifique
 * @param {Array} players - Liste des joueurs (avec propriété name)
 * @param {string} role - Rôle requis
 * @param {string} eventId - ID de l'événement
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @param {Array} excludedPlayers - Liste des noms de joueurs à exclure
 * @returns {Array} - Liste des joueurs disponibles pour ce rôle
 */
export function filterPlayersForRole(players, role, eventId, playerAvailability, excludedPlayers = []) {
  return players.filter(player => {
    const playerName = player.name || player
    return !excludedPlayers.includes(playerName) && 
           isAvailableForRole(playerName, role, eventId, playerAvailability)
  })
}

/**
 * Compte le nombre de joueurs disponibles pour un rôle spécifique
 * @param {Array} players - Liste des joueurs
 * @param {string} role - Rôle requis
 * @param {string} eventId - ID de l'événement
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @returns {number} - Nombre de joueurs disponibles pour ce rôle
 */
export function countPlayersForRole(players, role, eventId, playerAvailability) {
  return players.filter(player => {
    const playerName = player.name || player
    return isAvailableForRole(playerName, role, eventId, playerAvailability)
  }).length
}

/**
 * Compte le nombre total de joueurs disponibles pour un événement
 * @param {Object} event - Données de l'événement
 * @param {Array} players - Liste des joueurs
 * @param {Object} playerAvailability - Données de disponibilité des joueurs
 * @returns {number} - Nombre total de joueurs disponibles
 */
export function countAvailablePlayers(event, players, playerAvailability) {
  if (!event) return 0;
  
  // Pour les événements multi-rôles, compter les joueurs disponibles pour au moins un rôle requis
  if (event.roles && typeof event.roles === 'object') {
    return players.filter(player => {
      // Vérifier si le joueur est disponible pour au moins un rôle requis
      for (const role of Object.keys(event.roles)) {
        if (event.roles[role] > 0 && isAvailableForRole(player.name, role, event.id, playerAvailability)) {
          return true;
        }
      }
      return false;
    }).length;
  }
  
  // Pour les anciens événements, utiliser la logique existante
  return players.filter(player => 
    isAvailableForRole(player.name, 'player', event.id, playerAvailability)
  ).length;
}

// Les fonctions de calcul de chances ont été déplacées vers chancesService.js
// pour éviter la duplication de code et centraliser la logique métier
