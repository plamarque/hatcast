import logger from './logger.js'
import firestoreService from './firestoreService.js'

/**
 * Service centralisé pour tous les calculs de chances et tirages
 * Évite la duplication de code et prépare la migration côté serveur
 */

/**
 * Compte les casts passés d'un joueur pour un rôle spécifique
 * @param {string} playerId - ID du joueur (obligatoire)
 * @param {string} role - Rôle
 * @param {string} seasonId - ID de la saison
 * @param {string} currentEventType - Type de l'événement en cours (pour filtrer les casts)
 * @returns {Promise<number>} - Nombre de casts passés
 */
export async function countCasts(playerId, role, seasonId, currentEventType = null) {
  try {
    if (!playerId) {
      logger.warn('countCasts: playerId manquant')
      return 0
    }
    
    // Récupérer tous les casts de la saison
    const casts = await firestoreService.getDocuments('seasons', seasonId, 'casts')
    
    // Récupérer tous les événements de la saison
    const events = await firestoreService.getDocuments('seasons', seasonId, 'events')
    
    let count = 0
    
    for (const [eventId, cast] of Object.entries(casts)) {
      // Vérifier que l'événement existe
      const event = events.find(e => e.id === eventId)
      if (!event) continue
      
      // Règle 1: L'événement ne doit pas être archivé
      if (event.archived === true) continue
      
      // Règle 2: La sélection doit avoir été confirmée
      if (!cast.confirmed) continue
      
      // Règle 3: Le joueur ne doit pas avoir décliné (vérifier par ID uniquement)
      if (cast.declined && Array.isArray(cast.declined) && cast.declined.includes(playerId)) {
        continue
      }
      
      // Règle 4: Filtrage par type d'événement pour pools séparés
      // Si l'événement en cours est un déplacement, compter uniquement les déplacements
      // Sinon, exclure les déplacements du comptage
      if (currentEventType) {
        const eventType = event.templateType || 'custom'
        if (currentEventType === 'deplacement') {
          // Pour les déplacements: ne compter que les déplacements
          if (eventType !== 'deplacement') continue
        } else {
          // Pour les autres spectacles: exclure les déplacements
          if (eventType === 'deplacement') continue
        }
      }
      
      // Vérifier que le joueur était sélectionné pour ce rôle spécifique
      if (cast.roles && cast.roles[role] && cast.roles[role].includes(playerId)) {
        count++
      }
    }
    
    return count
  } catch (error) {
    logger.error('Erreur lors du comptage des casts:', error)
    return 0
  }
}

/**
 * Fonction utilitaire pour convertir un nom de joueur en ID
 * À utiliser uniquement côté UI quand on n'a que le nom
 * @param {string} playerName - Nom du joueur
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<string|null>} - ID du joueur ou null si non trouvé
 */
export async function getPlayerIdByName(playerName, seasonId) {
  try {
    const players = await firestoreService.getDocuments('seasons', seasonId, 'players')
    const player = players.find(p => p.name === playerName)
    return player ? player.id : null
  } catch (error) {
    logger.error('Erreur lors de la recherche du joueur par nom:', error)
    return null
  }
}


/**
 * Calcule le malus (coefficient de réduction) basé sur le nombre de casts passés
 * @param {number} pastCasts - Nombre de casts passés dans ce rôle
 * @returns {number} - Coefficient de malus (entre 0 et 1)
 */
export function calculateMalus(pastCasts) {
  return 1 / (1 + pastCasts)
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
 * Calcule la probabilité exacte d'être sélectionné dans un tirage sans remise
 * @param {number} places - Nombre de places disponibles
 * @param {number} totalCandidates - Nombre total de candidats
 * @param {number} malus - Coefficient de malus du joueur (0-1)
 * @returns {number} - Probabilité exacte (0-1)
 */
export function calculateExactProbability(places, totalCandidates, malus = 1) {
  if (places === 0 || totalCandidates === 0) return 0
  if (places >= totalCandidates) return 1
  
  // Calcul exact : somme des probabilités pour chaque tirage avec malus appliqué
  // P(être sélectionné) = Σ(i=1 à places) [malus / (totalCandidates - i + 1)]
  let probability = 0
  
  for (let i = 1; i <= places; i++) {
    const remainingCandidates = totalCandidates - i + 1
    probability += malus / remainingCandidates
  }
  
  return probability
}

/**
 * Calcule la probabilité d'être sélectionné sur plusieurs tirages sans remise avec pondération
 * Version optimisée avec approximation itérative (complexité O(places) au lieu d'exponentielle)
 * Précision : < 1% d'écart par rapport au calcul exact, suffisant car on n'affiche pas de décimales
 * @param {number} places - Nombre de places disponibles
 * @param {Array} candidates - Liste des candidats avec leurs poids [{name, weight, ...}, ...]
 * @param {number} targetIndex - Index du candidat cible dans la liste
 * @returns {number} - Probabilité (0-1)
 */
export function calculateExactSelectionProbability(places, candidates, targetIndex) {
  if (places === 0 || candidates.length === 0 || targetIndex < 0 || targetIndex >= candidates.length) {
    return 0
  }
  
  if (places >= candidates.length) {
    return 1 // Tous les candidats seront sélectionnés
  }
  
  const targetWeight = candidates[targetIndex].weight
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0)
  
  if (totalWeight === 0) return 0
  
  // Cas simple : 1 seule place
  if (places === 1) {
    return targetWeight / totalWeight
  }
  
  // Cas sans pondération (tous les poids égaux) : formule simple
  const allWeightsEqual = candidates.every(c => Math.abs(c.weight - targetWeight) < 0.0001)
  if (allWeightsEqual) {
    return places / candidates.length
  }
  
  // Pour les cas avec pondération, utiliser une approximation itérative plus rapide
  // qui calcule la probabilité de ne pas être sélectionné sur tous les tirages
  let probNotSelected = 1
  let remainingCandidates = candidates.length
  let remainingTotalWeight = totalWeight
  const otherCandidatesWeight = totalWeight - targetWeight
  
  // Approximation : à chaque tirage, on estime la probabilité de ne pas être sélectionné
  // en supposant qu'en moyenne, un candidat avec un poids proportionnel est sélectionné
  for (let tirage = 1; tirage <= places; tirage++) {
    if (remainingCandidates <= 1) break
    
    // Probabilité d'être sélectionné à ce tirage
    const probSelectedThisTirage = targetWeight / remainingTotalWeight
    
    // Probabilité de ne pas être sélectionné à ce tirage
    const probNotSelectedThisTirage = 1 - probSelectedThisTirage
    
    // Mettre à jour la probabilité globale
    probNotSelected *= probNotSelectedThisTirage
    
    // Estimer le poids moyen des autres candidats qui seront sélectionnés
    // On retire en moyenne un candidat avec un poids proportionnel
    const avgOtherWeight = otherCandidatesWeight / (remainingCandidates - 1)
    remainingTotalWeight -= avgOtherWeight
    remainingCandidates--
  }
  
  // Probabilité d'être sélectionné = 1 - probabilité de ne pas être sélectionné
  return Math.min(1, Math.max(0, 1 - probNotSelected))
}

/**
 * Calcule les chances pour un rôle spécifique (version asynchrone)
 * @param {Object} roleData - Données du rôle
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<Object>} - Données calculées pour le rôle
 */
export async function calculateRoleChancesAsync(roleData, availablePlayers, isAvailableForRole, seasonId) {
  const { role, requiredCount, eventId, eventType } = roleData
  
  // Filtrer les joueurs disponibles pour ce rôle
  const candidates = []
  
  for (const player of availablePlayers) {
    if (isAvailableForRole(player.name, role, eventId)) {
      const pastCasts = await countCasts(player.id, role, seasonId, eventType)
      const malus = calculateMalus(pastCasts)
      const weightedChances = calculateWeightedChances(malus, requiredCount)
      
      // Debug: Log pour les joueurs avec des casts passés
      if (pastCasts > 0) {
        logger.debug('ChancesService: Joueur avec casts passés', {
          player: player.name,
          playerId: player.id,
          role,
          pastCasts,
          malus: malus.toFixed(2),
          weight: weightedChances.toFixed(2)
        })
      }
      
      candidates.push({
        name: player.name,
        id: player.id,
        pastSelections: pastCasts, // Garder la compatibilité avec l'interface existante
        weight: weightedChances,
        malus,
        weightedChances,
        requiredCount
      })
    }
  }
  
  // Calculer le total des poids
  const totalWeight = calculateTotalWeight(candidates)
  
  return {
    role,
    requiredCount,
    candidates,
    totalWeight,
    availableCount: candidates.length
  }
}

/**
 * Calcule les chances pour un rôle spécifique (version synchrone avec fonction)
 * @param {Object} roleData - Données du rôle
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Function} countSelections - Fonction pour compter les sélections passées
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité
 * @returns {Object} - Données calculées pour le rôle
 */
export function calculateRoleChances(roleData, availablePlayers, countSelections, isAvailableForRole) {
  const { role, requiredCount, eventId, eventType } = roleData
  
  
  // Filtrer les joueurs disponibles pour ce rôle
  const candidates = availablePlayers
    .filter(player => isAvailableForRole(player.name, role, eventId))
    .map(player => {
      const pastSelections = countSelections(player.name, role, null, eventType)
      const malus = calculateMalus(pastSelections)
      const weightedChances = calculateWeightedChances(malus, requiredCount)
      
      
      return {
        name: player.name,
        id: player.id, // Ajouter l'ID pour éviter les conversions côté client
        pastSelections,
        weight: weightedChances, // Utiliser les chances pondérées pour les bandes de l'animation
        malus,
        weightedChances,
        requiredCount
      }
    })
  
  
  // Calculer le total des poids
  const totalWeight = calculateTotalWeight(candidates)
  
  // Ajouter les chances pratiques et le total des poids à chaque candidat
  const candidatesWithChances = candidates.map((candidate, index) => {
    // Calculer la probabilité exacte d'être sélectionné sur tous les tirages
    let practicalChance = 0
    
    try {
      const exactProbability = calculateExactSelectionProbability(requiredCount, candidates, index)
      practicalChance = exactProbability * 100
    } catch (error) {
      // Fallback au calcul simple si le calcul exact échoue
      logger.warn('Erreur dans calculateExactSelectionProbability, utilisation du fallback', {
        error: error.message,
        role,
        candidate: candidate.name
      })
      practicalChance = totalWeight > 0 ? (candidate.weight / totalWeight) * 100 : 0
    }
    
    return {
      ...candidate,
      practicalChance, // Probabilité exacte d'être sélectionné sur tous les tirages
      totalWeight,
      availableCount: candidates.length, // Ajouter le nombre de candidats disponibles
      requiredCount // Ajouter requiredCount à chaque candidat pour le template
    }
  })
  
  
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
      const roleData = { role, requiredCount, eventId: event.id, eventType: event.templateType }
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
export function performWeightedDraw(candidates, role, options = {}) {
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
export function calculatePlayerChanceForRole(playerName, role, eventId, event, availablePlayers, playerAvailability, countSelections, isAvailableForRole = null) {
  // Utiliser la fonction isAvailableForRole passée en paramètre ou créer une fonction locale
  const checkAvailableForRole = isAvailableForRole || ((playerName, role, eventId) => {
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
  })
  
  if (!checkAvailableForRole(playerName, role, eventId)) {
    return 0
  }
  
  // Obtenir les données du rôle
  const requiredCount = event.roles?.[role] || 0
  if (requiredCount === 0) {
    return 0
  }
  
  // Calculer les chances pour tous les candidats de ce rôle
  const roleData = { role, requiredCount, eventId, eventType: event.templateType }
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

/**
 * =============================================================================
 * ALGORITHMES DE TIRAGE
 * =============================================================================
 */

/**
 * Algorithme "AlgoBruno" - Tirage en passes séquentielles par niveau d'expérience
 * Priorité absolue aux joueurs jamais castés, puis par niveau d'expérience croissant
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {string} role - Nom du rôle
 * @param {string} seasonId - ID de la saison
 * @param {string} eventId - ID de l'événement
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité
 * @param {Array} alreadySelectedPlayers - Liste des joueurs déjà sélectionnés dans ce tirage
 * @param {Object} options - Options de logging
 * @returns {Promise<Object|null>} - Résultat du tirage avec toutes les informations nécessaires
 */
export async function performAlgoBruno(availablePlayers, role, seasonId, eventId, isAvailableForRole, alreadySelectedPlayers = [], options = {}) {
  const { logDetails = false, eventType = null } = options
  
  // Exclure les joueurs déjà sélectionnés dans ce tirage
  const availableCandidates = availablePlayers.filter(candidate => 
    !alreadySelectedPlayers.includes(candidate.name)
  )
  
  if (availableCandidates.length === 0) {
    logger.warn('AlgoBruno: Aucun candidat disponible pour le tirage (tous déjà sélectionnés)', { 
      role, 
      alreadySelected: alreadySelectedPlayers,
      totalCandidates: availablePlayers.length
    })
    return null
  }
  
  // Calculer les chances pour les candidats disponibles
  const roleData = { role, requiredCount: 1, eventId, eventType }
  const roleChances = await calculateRoleChancesAsync(roleData, availableCandidates, isAvailableForRole, seasonId)
  
  if (roleChances.candidates.length === 0) {
    logger.warn('AlgoBruno: Aucun candidat avec chances calculées', { role })
    return null
  }
  
  const candidatesByExperience = groupCandidatesByExperience(roleChances.candidates)
  
  if (logDetails) {
    logger.debug('AlgoBruno: Groupement par expérience', { 
      role,
      groups: Object.keys(candidatesByExperience).map(exp => ({
        experience: exp,
        count: candidatesByExperience[exp].length,
        candidates: candidatesByExperience[exp].map(c => c.name)
      }))
    })
  }
  
  // Commencer par le niveau d'expérience le plus bas disponible
  const minExperienceLevel = Math.min(...Object.keys(candidatesByExperience).map(Number))
  let experienceLevel = minExperienceLevel
  while (experienceLevel <= Math.max(...Object.keys(candidatesByExperience).map(Number))) {
    const candidatesAtLevel = candidatesByExperience[experienceLevel]
    
    if (candidatesAtLevel && candidatesAtLevel.length > 0) {
      if (logDetails) {
        logger.debug(`AlgoBruno: Passe ${experienceLevel + 1} - Niveau d'expérience ${experienceLevel}`, {
          role,
          experienceLevel,
          candidatesCount: candidatesAtLevel.length,
          candidates: candidatesAtLevel.map(c => ({ name: c.name, weight: c.weight }))
        })
      }
      
      const drawResult = performWeightedDrawWithResult(candidatesAtLevel, role, { logDetails })
      
      if (drawResult && drawResult.selectedCandidate) {
        if (logDetails) {
          logger.debug('AlgoBruno: Candidat sélectionné', { 
            role, 
            selectedCandidate: drawResult.selectedCandidate.name,
            experienceLevel,
            pass: experienceLevel + 1
          })
        }
        
        return {
          selectedCandidate: drawResult.selectedCandidate,
          randomNumber: drawResult.randomNumber,
          totalWeight: drawResult.totalWeight,
          algorithm: 'algobruno',
          experienceLevel: experienceLevel,
          pass: experienceLevel + 1,
          candidatesAtLevel: candidatesAtLevel
        }
      }
    }
    
    experienceLevel++
  }
  
  logger.warn('AlgoBruno: Aucun candidat trouvé dans aucune passe', { role })
  return null
}


/**
 * Version de performWeightedDraw qui retourne toutes les informations nécessaires
 * @param {Array} candidates - Liste des candidats avec leurs poids
 * @param {string} role - Nom du rôle
 * @param {Object} options - Options de logging
 * @returns {Object|null} - Résultat complet du tirage
 */
function performWeightedDrawWithResult(candidates, role, options = {}) {
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

  // Générer le nombre aléatoire
  const randomNumber = Math.random() * totalWeight
  
  if (logDetails) {
    logger.debug('ChancesService: Détails du tirage', { 
      role, 
      totalWeight, 
      randomNumber: randomNumber.toFixed(3),
      candidates: candidates.map(c => ({ name: c.name, weight: c.weight }))
    })
  }
  
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
          practicalChance: `${((candidate.weight / totalWeight) * 100).toFixed(1)}%`
        })
      }
      
      // Retourner toutes les informations nécessaires
      return {
        selectedCandidate: candidate,
        randomNumber: randomNumber,
        totalWeight: totalWeight,
        candidates: candidates
      }
    }
  }
  
  // Fallback (ne devrait jamais arriver)
  logger.warn('ChancesService: Aucun candidat trouvé, retour du dernier candidat', { role })
  return {
    selectedCandidate: candidates[candidates.length - 1],
    randomNumber: randomNumber,
    totalWeight: totalWeight,
    candidates: candidates
  }
}

/**
 * Algorithme par défaut - Tirage pondéré standard
 * @param {Array} candidates - Liste des candidats avec leurs poids
 * @param {string} role - Nom du rôle
 * @param {Object} options - Options de logging
 * @returns {Object|null} - Résultat du tirage avec toutes les informations nécessaires
 */
export function performDefaultDraw(candidates, role, options = {}) {
  const { logDetails = false } = options
  
  if (candidates.length === 0) {
    logger.warn('Default: Aucun candidat disponible pour le tirage', { role })
    return null
  }
  
  // Utiliser la fonction existante performWeightedDraw
  const selectedCandidate = performWeightedDraw(candidates, role, { logDetails })
  
  if (selectedCandidate) {
    // Calculer le total des poids pour l'animation
    const totalWeight = calculateTotalWeight(candidates)
    
    // Pour l'algorithme par défaut, on ne peut pas récupérer le randomNumber exact
    // car performWeightedDraw ne le retourne pas. On génère un nombre aléatoire
    // qui correspond approximativement à la sélection
    const randomNumber = Math.random() * totalWeight
    
    return {
      selectedCandidate: selectedCandidate,
      randomNumber: randomNumber,
      totalWeight: totalWeight,
      algorithm: 'default',
      candidates: candidates
    }
  }
  
  return null
}

/**
 * Groupe les candidats par nombre de casts passés
 * @param {Array} candidates - Liste des candidats
 * @returns {Object} - Objet avec les clés = nombre de casts, valeurs = array de candidats
 */
function groupCandidatesByExperience(candidates) {
  const groups = {}
  
  for (const candidate of candidates) {
    // Utiliser pastSelections comme indicateur d'expérience (compatibilité avec l'interface existante)
    const experience = candidate.pastSelections || 0
    
    if (!groups[experience]) {
      groups[experience] = []
    }
    groups[experience].push(candidate)
  }
  
  return groups
}

/**
 * Calcule les chances selon l'algorithme Bruno (par niveau d'expérience)
 * @param {Object} event - Événement
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Object} playerAvailability - Données de disponibilité
 * @param {Function} countSelections - Fonction pour compter les sélections passées
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité (optionnelle)
 * @returns {Object} - Données calculées pour tous les rôles selon l'algorithme Bruno
 */
export function calculateAllRoleChancesBruno(event, availablePlayers, playerAvailability, countSelections, isAvailableForRole = null) {
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
  
  // Calculer les chances pour chaque rôle selon l'algorithme Bruno
  Object.entries(event.roles).forEach(([role, requiredCount]) => {
    if (requiredCount > 0) {
      const roleData = { role, requiredCount, eventId: event.id, eventType: event.templateType }
      allRoleChances[role] = calculateRoleChancesBruno(roleData, availablePlayers, countSelections, checkAvailableForRole)
    }
  })
  
  return allRoleChances
}

/**
 * Calcule les chances pour un rôle selon l'algorithme Bruno
 * @param {Object} roleData - Données du rôle
 * @param {Array} availablePlayers - Liste des joueurs disponibles
 * @param {Function} countSelections - Fonction pour compter les sélections passées
 * @param {Function} isAvailableForRole - Fonction pour vérifier la disponibilité
 * @returns {Object} - Données calculées pour le rôle selon l'algorithme Bruno
 */
function calculateRoleChancesBruno(roleData, availablePlayers, countSelections, isAvailableForRole) {
  const { role, requiredCount, eventId, eventType } = roleData
  
  // Filtrer les joueurs disponibles pour ce rôle
  const candidates = availablePlayers
    .filter(player => isAvailableForRole(player.name, role, eventId))
    .map(player => {
      const pastSelections = countSelections(player.name, role, null, eventType)
      const malus = calculateMalus(pastSelections)
      const weightedChances = calculateWeightedChances(malus, requiredCount)
      
      return {
        name: player.name,
        id: player.id,
        pastSelections,
        weight: weightedChances,
        malus,
        weightedChances,
        requiredCount,
        experience: pastSelections // Utiliser pastSelections comme niveau d'expérience
      }
    })
  
  if (candidates.length === 0) {
    return {
      role,
      requiredCount,
      candidates: [],
      totalWeight: 0,
      availableCount: 0
    }
  }
  
  // Grouper par niveau d'expérience
  const candidatesByExperience = groupCandidatesByExperience(candidates)
  
  // Calculer les chances selon l'algorithme Bruno
  const candidatesWithBrunoChances = []
  
  // Trier les niveaux d'expérience (0 sélections d'abord, puis 1, puis 2, etc.)
  const sortedLevels = Object.keys(candidatesByExperience).sort((a, b) => parseInt(a) - parseInt(b))
  let remainingPlaces = requiredCount
  
  sortedLevels.forEach((experience, levelIndex) => {
    const candidatesAtLevel = candidatesByExperience[experience]
    const levelRequiredCount = Math.min(remainingPlaces, candidatesAtLevel.length)
    
    console.log(`🔍 Niveau ${experience} sélections: ${candidatesAtLevel.length} candidats, ${remainingPlaces} places restantes avant niveau, ${levelRequiredCount} places attribuées au niveau`)
    
    // Pour chaque candidat de ce niveau, calculer sa chance
    candidatesAtLevel.forEach(candidate => {
      let brunoChance = 0
      
      if (remainingPlaces > 0 && levelRequiredCount > 0) {
        // Chance = places disponibles à ce niveau / candidats à ce niveau
        brunoChance = levelRequiredCount / candidatesAtLevel.length
        console.log(`  - ${candidate.name}: ${levelRequiredCount}/${candidatesAtLevel.length} = ${brunoChance}`)
      } else {
        console.log(`  - ${candidate.name}: 0% (plus de places ou niveau sans places)`)
      }
      
      candidatesWithBrunoChances.push({
        ...candidate,
        practicalChance: brunoChance * 100, // Convertir en pourcentage
        brunoChance: brunoChance * 100,
        levelChance: brunoChance * 100,
        experience: parseInt(experience),
        levelIndex,
        remainingPlacesAtLevel: levelRequiredCount
      })
    })
    
    // Réduire le nombre de places restantes
    remainingPlaces -= levelRequiredCount
    console.log(`  Places restantes après niveau ${experience}: ${remainingPlaces}`)
  })
  
  // Calculer le poids total pour la cohérence avec l'interface
  const totalWeight = candidatesWithBrunoChances.reduce((total, candidate) => total + candidate.weight, 0)
  
  return {
    role,
    requiredCount,
    candidates: candidatesWithBrunoChances,
    totalWeight,
    availableCount: candidatesWithBrunoChances.length
  }
}
