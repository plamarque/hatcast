import logger from './logger.js'

/**
 * Service centralisé pour tous les calculs de chances et tirages
 * Évite la duplication de code et prépare la migration côté serveur
 */

/**
 * Calcule le malus (coefficient de réduction) basé sur le nombre de sélections passées
 * @param {number} pastSelections - Nombre de sélections passées dans ce rôle
 * @returns {number} - Coefficient de malus (entre 0 et 1)
 */
export function calculateMalus(pastSelections) {
  return 1 / (1 + pastSelections)
}

/**
 * Calcule les chances pondérées d'un participant
 * @param {number} malus - Coefficient de malus
 * @param {number} requiredCount - Nombre de places requises pour ce rôle
 * @returns {number} - Chances pondérées
 */
export function calculateWeightedChances(malus, requiredCount) {
  return malus * requiredCount
}

/**
 * Calcule le total des poids pour un rôle
 * @param {Array} candidates - Liste des candidats avec leurs poids
 * @returns {number} - Total des poids
 */
export function calculateTotalWeight(candidates) {
  return candidates.reduce((total, candidate) => total + candidate.weight, 0)
}

/**
 * Calcule la chance pratique (pourcentage) d'un participant
 * @param {number} weightedChances - Chances pondérées du participant
 * @param {number} totalWeight - Total des poids de tous les candidats
 * @returns {number} - Pourcentage de chance (0-100)
 */
export function calculatePracticalChance(weightedChances, totalWeight) {
  if (totalWeight === 0) return 0
  return (weightedChances / totalWeight) * 100
}

/**
 * Calcule les chances pour un rôle spécifique
 * @param {Object} roleData - Données du rôle
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Function} countSelections - Fonction pour compter les sélections passées
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité
 * @returns {Object} - Données calculées pour le rôle
 */
export function calculateRoleChances(roleData, availablePlayers, countSelections, isAvailableForRole) {
  const { role, requiredCount, eventId } = roleData
  
  // Filtrer les joueurs disponibles pour ce rôle
  const candidates = availablePlayers
    .filter(player => isAvailableForRole(player.name, role, eventId))
    .map(player => {
      const pastSelections = countSelections(player.name, role)
      const malus = calculateMalus(pastSelections)
      const weightedChances = calculateWeightedChances(malus, requiredCount)
      
      return {
        name: player.name,
        pastSelections,
        weight: malus, // Utiliser 'weight' pour la cohérence avec le template
        malus,
        weightedChances,
        requiredCount
      }
    })
  
  // Calculer le total des poids
  const totalWeight = calculateTotalWeight(candidates)
  
  // Ajouter les chances pratiques et le total des poids à chaque candidat
  const candidatesWithChances = candidates.map(candidate => ({
    ...candidate,
    practicalChance: calculatePracticalChance(candidate.weightedChances, totalWeight),
    totalWeight,
    requiredCount // Ajouter requiredCount à chaque candidat pour le template
  }))
  
  return {
    role,
    requiredCount,
    availableCount: candidates.length,
    totalWeight,
    candidates: candidatesWithChances
  }
}

/**
 * Calcule les chances pour tous les rôles d'un événement
 * @param {Object} event - Événement
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Object} playerAvailability - Données de disponibilité
 * @param {Function} countSelections - Fonction pour compter les sélections passées
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité (optionnelle)
 * @returns {Object} - Données calculées pour tous les rôles
 */
export function calculateAllRoleChances(event, availablePlayers, playerAvailability, countSelections, isAvailableForRole = null) {
  const allRoleChances = {}
  
  if (!event.roles || typeof event.roles !== 'object') {
    return allRoleChances
  }
  
  // Utiliser la fonction isAvailableForRole passée en paramètre ou créer une fonction locale
  const checkAvailableForRole = isAvailableForRole || ((playerName, role, eventId) => {
    const availabilityData = playerAvailability?.[playerName]?.[eventId]
    
    if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
      if (availabilityData.available && availabilityData.roles) {
        return availabilityData.roles.includes(role) || availabilityData.roles.length === 0
      }
      return false
    }
    
    // Fallback pour l'ancien format
    if (role === 'player') {
      return availabilityData === true
    }
    
    return false
  })
  
  // Calculer les chances pour chaque rôle
  Object.entries(event.roles).forEach(([role, requiredCount]) => {
    if (requiredCount > 0) {
      const roleData = { role, requiredCount, eventId: event.id }
      allRoleChances[role] = calculateRoleChances(roleData, availablePlayers, countSelections, checkAvailableForRole)
    }
  })
  
  return allRoleChances
}

/**
 * Simule un tirage pondéré pour un rôle
 * @param {Array} candidates - Liste des candidats avec leurs poids
 * @param {string} role - Nom du rôle
 * @param {Object} options - Options de logging
 * @returns {Object|null} - Candidat sélectionné ou null
 */
export function simulateWeightedDraw(candidates, role, options = {}) {
  const { logDetails = false } = options
  
  if (candidates.length === 0) {
    logger.warn('ChancesService: Aucun candidat disponible pour le tirage', { role })
    return null
  }
  
  // Calculer le total des poids
  const totalWeight = calculateTotalWeight(candidates)
  
  if (totalWeight === 0) {
    logger.warn('ChancesService: Poids total nul pour le tirage', { role, candidates })
    return null
  }
  
  // Log des détails si demandé
  if (logDetails) {
    logger.debug('ChancesService: Détails du tirage', {
      role,
      totalWeight,
      candidates: candidates.map(c => ({
        name: c.name,
        pastSelections: c.pastSelections,
        malus: c.malus.toFixed(3),
        weightedChances: c.weightedChances.toFixed(1),
        practicalChance: calculatePracticalChance(c.weightedChances, totalWeight).toFixed(1) + '%'
      }))
    })
  }
  
  // Générer un nombre aléatoire entre 0 et totalWeight
  const randomNumber = Math.random() * totalWeight
  
  // Trouver le candidat sélectionné
  let currentWeight = 0
  for (const candidate of candidates) {
    currentWeight += candidate.weight
    if (randomNumber <= currentWeight) {
      if (logDetails) {
        logger.debug('ChancesService: Candidat sélectionné', {
          role,
          selectedCandidate: candidate.name,
          randomNumber: randomNumber.toFixed(3),
          candidateWeight: candidate.weight.toFixed(3),
          practicalChance: calculatePracticalChance(candidate.weightedChances, totalWeight).toFixed(1) + '%'
        })
      }
      return candidate
    }
  }
  
  // Fallback (ne devrait jamais arriver)
  logger.error('ChancesService: Erreur dans le tirage pondéré', { role, randomNumber, totalWeight })
  return candidates[candidates.length - 1]
}

/**
 * Calcule les chances d'un joueur pour un rôle spécifique
 * @param {string} playerName - Nom du joueur
 * @param {string} role - Rôle
 * @param {string} eventId - ID de l'événement
 * @param {Object} event - Événement
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Object} playerAvailability - Données de disponibilité
 * @param {Function} countSelections - Fonction pour compter les sélections passées
 * @returns {number} - Pourcentage de chance (0-100)
 */
export function calculatePlayerChanceForRole(playerName, role, eventId, event, availablePlayers, playerAvailability, countSelections) {
  // Vérifier que le joueur est disponible pour ce rôle
  const isAvailableForRole = (playerName, role, eventId) => {
    const availabilityData = playerAvailability?.[playerName]?.[eventId]
    
    if (availabilityData && typeof availabilityData === 'object' && availabilityData.available !== undefined) {
      if (availabilityData.available && availabilityData.roles) {
        return availabilityData.roles.includes(role) || availabilityData.roles.length === 0
      }
      return false
    }
    
    if (role === 'player') {
      return availabilityData === true
    }
    
    return false
  }
  
  if (!isAvailableForRole(playerName, role, eventId)) {
    return 0
  }
  
  // Obtenir les données du rôle
  const requiredCount = event.roles?.[role] || 0
  if (requiredCount === 0) {
    return 0
  }
  
  // Calculer les chances pour tous les candidats de ce rôle
  const roleData = { role, requiredCount, eventId }
  const roleChances = calculateRoleChances(roleData, availablePlayers, countSelections, isAvailableForRole)
  
  // Trouver le candidat correspondant
  const candidate = roleChances.candidates.find(c => c.name === playerName)
  
  return candidate ? candidate.practicalChance : 0
}

/**
 * Formate les chances pour l'affichage dans l'UI
 * @param {number} practicalChance - Chance pratique (0-100)
 * @returns {string} - Pourcentage formaté
 */
export function formatChancePercentage(practicalChance) {
  return Math.round(practicalChance) + '%'
}

/**
 * Obtient la classe CSS pour la couleur des chances
 * @param {number} practicalChance - Chance pratique (0-100)
 * @returns {string} - Classe CSS Tailwind
 */
export function getChanceColorClass(practicalChance) {
  if (practicalChance >= 20) return 'text-emerald-400'
  if (practicalChance >= 10) return 'text-amber-400'
  return 'text-rose-400'
}

/**
 * Obtient la classe CSS pour la couleur du malus
 * @param {number} malus - Coefficient de malus
 * @returns {string} - Classe CSS Tailwind
 */
export function getMalusColorClass(malus) {
  if (malus === 1) return 'text-red-400'
  return 'text-orange-400'
}
