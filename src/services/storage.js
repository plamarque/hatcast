// storage.js
import logger from './logger.js'
import { createRemindersForSelection, removeRemindersForPlayer } from './reminderService.js'
import firestoreService from './firestoreService.js'

// Constantes pour les rôles et leurs emojis
export const ROLES = {
  PLAYER: 'player',
  VOLUNTEER: 'volunteer', 
  MC: 'mc',
  DJ: 'dj',
  REFEREE: 'referee',
  ASSISTANT_REFEREE: 'assistant_referee',
  LIGHTING: 'lighting',
  COACH: 'coach',
  STAGE_MANAGER: 'stage_manager'
}

export const ROLE_EMOJIS = {
  [ROLES.PLAYER]: '🎭',
  [ROLES.VOLUNTEER]: '🤝',
  [ROLES.MC]: '🎤',
  [ROLES.DJ]: '🎧',
  [ROLES.REFEREE]: '🙅',
  [ROLES.ASSISTANT_REFEREE]: '💁',
  [ROLES.LIGHTING]: '🔦',
  [ROLES.COACH]: '🧢',
  [ROLES.STAGE_MANAGER]: '🎬'
}

export const ROLE_LABELS = {
  [ROLES.PLAYER]: 'Improvisateur.trices',
  [ROLES.VOLUNTEER]: 'Bénévoles',
  [ROLES.MC]: 'MC',
  [ROLES.DJ]: 'DJ',
  [ROLES.REFEREE]: 'Arbitre',
  [ROLES.ASSISTANT_REFEREE]: 'Assistant.es',
  [ROLES.LIGHTING]: 'Lumière',
  [ROLES.COACH]: 'Coach',
  [ROLES.STAGE_MANAGER]: 'Régisseur.euses'
}

// Labels au singulier pour les modales de disponibilité (individuelles)
export const ROLE_LABELS_SINGULAR = {
  [ROLES.PLAYER]: 'Improvisateur.trice',
  [ROLES.VOLUNTEER]: 'Bénévole',
  [ROLES.MC]: 'MC',
  [ROLES.DJ]: 'DJ',
  [ROLES.REFEREE]: 'Arbitre',
  [ROLES.ASSISTANT_REFEREE]: 'Assistant.e',
  [ROLES.LIGHTING]: 'Lumière',
  [ROLES.COACH]: 'Coach',
  [ROLES.STAGE_MANAGER]: 'Régisseur.euse'
}

// Ordre d'affichage des rôles
export const ROLE_DISPLAY_ORDER = [
  ROLES.PLAYER,
  ROLES.DJ,
  ROLES.MC,
  ROLES.VOLUNTEER,
  ROLES.REFEREE,
  ROLES.ASSISTANT_REFEREE,
  ROLES.LIGHTING,
  ROLES.COACH,
  ROLES.STAGE_MANAGER
]

// Labels par genre (nouveau système inclusif)
export const ROLE_LABELS_BY_GENDER = {
  male: {
    [ROLES.PLAYER]: 'Improvisateur',
    [ROLES.VOLUNTEER]: 'Bénévole',
    [ROLES.MC]: 'MC',
    [ROLES.DJ]: 'DJ',
    [ROLES.REFEREE]: 'Arbitre',
    [ROLES.ASSISTANT_REFEREE]: 'Assistant',
    [ROLES.LIGHTING]: 'Lumière',
    [ROLES.COACH]: 'Coach',
    [ROLES.STAGE_MANAGER]: 'Régisseur'
  },
  female: {
    [ROLES.PLAYER]: 'Improvisatrice',
    [ROLES.VOLUNTEER]: 'Bénévole',
    [ROLES.MC]: 'MC',
    [ROLES.DJ]: 'DJ',
    [ROLES.REFEREE]: 'Arbitre',
    [ROLES.ASSISTANT_REFEREE]: 'Assistante',
    [ROLES.LIGHTING]: 'Lumière',
    [ROLES.COACH]: 'Coach',
    [ROLES.STAGE_MANAGER]: 'Régisseuse'
  },
  'non-specified': {
    [ROLES.PLAYER]: 'Improvisateur.trice',
    [ROLES.VOLUNTEER]: 'Bénévole',
    [ROLES.MC]: 'MC',
    [ROLES.DJ]: 'DJ',
    [ROLES.REFEREE]: 'Arbitre',
    [ROLES.ASSISTANT_REFEREE]: 'Assistant.e',
    [ROLES.LIGHTING]: 'Lumière',
    [ROLES.COACH]: 'Coach',
    [ROLES.STAGE_MANAGER]: 'Régisseur.euse'
  }
}

export const ROLE_LABELS_PLURAL_BY_GENDER = {
  male: {
    [ROLES.PLAYER]: 'Improvisateurs',
    [ROLES.VOLUNTEER]: 'Bénévoles',
    [ROLES.MC]: 'MC',
    [ROLES.DJ]: 'DJ',
    [ROLES.REFEREE]: 'Arbitres',
    [ROLES.ASSISTANT_REFEREE]: 'Assistants',
    [ROLES.LIGHTING]: 'Lumières',
    [ROLES.COACH]: 'Coachs',
    [ROLES.STAGE_MANAGER]: 'Régisseurs'
  },
  female: {
    [ROLES.PLAYER]: 'Improvisatrices',
    [ROLES.VOLUNTEER]: 'Bénévoles',
    [ROLES.MC]: 'MC',
    [ROLES.DJ]: 'DJ',
    [ROLES.REFEREE]: 'Arbitres',
    [ROLES.ASSISTANT_REFEREE]: 'Assistantes',
    [ROLES.LIGHTING]: 'Lumières',
    [ROLES.COACH]: 'Coachs',
    [ROLES.STAGE_MANAGER]: 'Régisseuses'
  },
  'non-specified': {
    [ROLES.PLAYER]: 'Improvisateur.trices',
    [ROLES.VOLUNTEER]: 'Bénévoles',
    [ROLES.MC]: 'MC',
    [ROLES.DJ]: 'DJ',
    [ROLES.REFEREE]: 'Arbitres',
    [ROLES.ASSISTANT_REFEREE]: 'Assistant.es',
    [ROLES.LIGHTING]: 'Lumières',
    [ROLES.COACH]: 'Coachs',
    [ROLES.STAGE_MANAGER]: 'Régisseur.euses'
  }
}

/**
 * Fonction rétro-compatible pour obtenir le label d'un rôle
 * @param {string} role - Le rôle (ex: ROLES.PLAYER)
 * @param {string} userGender - Le genre de l'utilisateur ('male', 'female', 'non-specified', ou undefined)
 * @param {boolean} plural - Si true, retourne la forme plurielle
 * @returns {string} Le label du rôle adapté au genre
 */
export function getRoleLabel(role, userGender = 'non-specified', plural = false) {
  // Rétro-compatibilité : si userGender n'est pas défini ou invalide, utiliser 'non-specified'
  const validGenders = ['male', 'female', 'non-specified']
  const gender = validGenders.includes(userGender) ? userGender : 'non-specified'
  
  if (plural) {
    return ROLE_LABELS_PLURAL_BY_GENDER[gender][role] || ROLE_LABELS[role] || role
  } else {
    return ROLE_LABELS_BY_GENDER[gender][role] || ROLE_LABELS_SINGULAR[role] || role
  }
}

// Icônes pour chaque type d'événement
export const EVENT_TYPE_ICONS = {
  match: '⚔️',
  cabaret: '🎭',
  longform: '🎪',
  deplacement: '🚌',
  custom: '📊'
}

// Modèles de rôles prédéfinis pour différents types d'événements
export const ROLE_TEMPLATES = {
  match: {
    name: 'Match',
    description: 'Compétition avec arbitrage',
    roles: {
      [ROLES.PLAYER]: 5,
      [ROLES.MC]: 1,
      [ROLES.REFEREE]: 1,
      [ROLES.ASSISTANT_REFEREE]: 2,
      [ROLES.VOLUNTEER]: 5,
      [ROLES.DJ]: 0,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 0
    }
  },
  cabaret: {
    name: 'Cabaret',
    description: 'Événement avec MC et DJ',
    roles: {
      [ROLES.PLAYER]: 5,
      [ROLES.MC]: 1,
      [ROLES.DJ]: 1,
      [ROLES.VOLUNTEER]: 0,
      [ROLES.REFEREE]: 0,
      [ROLES.ASSISTANT_REFEREE]: 0,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 0
    }
  },
  longform: {
    name: 'Long Form',
    description: 'Spectacle long format avec MC et DJ',
    roles: {
      [ROLES.PLAYER]: 4,
      [ROLES.MC]: 1,
      [ROLES.DJ]: 1,
      [ROLES.VOLUNTEER]: 0,
      [ROLES.REFEREE]: 0,
      [ROLES.ASSISTANT_REFEREE]: 0,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 0
    }
  },
  deplacement: {
    name: 'Déplacement',
    description: 'Événement extérieur simple',
    roles: {
      [ROLES.PLAYER]: 5,
      [ROLES.MC]: 0,
      [ROLES.DJ]: 0,
      [ROLES.VOLUNTEER]: 0,
      [ROLES.REFEREE]: 0,
      [ROLES.ASSISTANT_REFEREE]: 0,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 0
    }
  },
  custom: {
    name: 'Simple sondage',
    description: 'Configuration personnalisée',
    roles: {
      [ROLES.PLAYER]: 0,
      [ROLES.MC]: 0,
      [ROLES.DJ]: 0,
      [ROLES.VOLUNTEER]: 0,
      [ROLES.REFEREE]: 0,
      [ROLES.ASSISTANT_REFEREE]: 0,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 0
    }
  }
}

// Ordre d'affichage des types
export const TEMPLATE_DISPLAY_ORDER = ['cabaret', 'longform', 'match', 'deplacement', 'custom']

export async function loadEvents(seasonId) {
  const events = await firestoreService.getDocuments('seasons', seasonId, 'events')

  // Tri des événements par date (croissant) puis par titre (alphabétique)
  return events.sort((a, b) => {
    const toDate = (v) => {
      if (!v) return null
      if (v instanceof Date) return v
      if (typeof v?.toDate === 'function') return v.toDate()
      const d = new Date(v)
      return isNaN(d.getTime()) ? null : d
    }

    const da = toDate(a.date)
    const db = toDate(b.date)
    const ta = da ? da.getTime() : Number.POSITIVE_INFINITY
    const tb = db ? db.getTime() : Number.POSITIVE_INFINITY
    if (ta !== tb) return ta - tb
    return (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' })
  })
}

export async function loadPlayers(seasonId) {
  const players = await firestoreService.getDocuments('seasons', seasonId, 'players')

  // Tri par order puis par nom
  return players.sort((a, b) => {
    if (a.order < b.order) return -1
    if (a.order > b.order) return 1
    return a.name.localeCompare(b.name)
  })
}



export async function addPlayer(name, seasonId, gender = 'non-specified') {
  // Validation côté serveur
  if (!name || !name.trim()) {
    throw new Error('Le nom du joueur ne peut pas être vide')
  }
  
  const trimmedName = name.trim()
  
  // Validation du genre
  const validGenders = ['male', 'female', 'non-specified']
  const playerGender = validGenders.includes(gender) ? gender : 'non-specified'
  
  // Vérifier si un joueur avec ce nom existe déjà
  const existingPlayers = await firestoreService.getDocuments('seasons', seasonId, 'players')
  const nameExists = existingPlayers.some(player => player.name === trimmedName)
  
  if (nameExists) {
    throw new Error('Un joueur avec ce nom existe déjà dans cette saison')
  }
  
  const newId = await firestoreService.addDocument('seasons', { 
    name: trimmedName, 
    gender: playerGender 
  }, seasonId, 'players')
  return newId
}

export async function deletePlayer(playerId, seasonId) {
  // Lire le nom du joueur avant suppression
  const player = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
  const playerName = player?.name || null
  
  // Supprimer le joueur
  await firestoreService.deleteDocument('seasons', seasonId, 'players', playerId)
  
  // Supprimer les disponibilités pour ce joueur (par nom)
  if (playerName) {
    await firestoreService.deleteDocument('seasons', seasonId, 'availability', playerName)
  }
}

export async function updatePlayer(playerId, newName, seasonId, gender = null) {
  // Validation : vérifier que le nouveau nom n'existe pas déjà
  if (!newName || !newName.trim()) {
    throw new Error('Le nom du joueur ne peut pas être vide')
  }
  
  const trimmedNewName = newName.trim()
  
  // Validation du genre
  const validGenders = ['male', 'female', 'non-specified']
  const playerGender = gender && validGenders.includes(gender) ? gender : null
  
  // Vérifier si un autre joueur a déjà ce nom
  const existingPlayers = await firestoreService.getDocuments('seasons', seasonId, 'players')
  const nameExists = existingPlayers.some(player => 
    player.name === trimmedNewName && player.id !== playerId
  )
  
  if (nameExists) {
    throw new Error('Un joueur avec ce nom existe déjà dans cette saison')
  }

  // Lire l'ancien nom (si existant) avant mise à jour
  const player = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
  const oldName = player?.name || null

  // Préparer les données à mettre à jour
  const updateData = { name: trimmedNewName }
  if (playerGender !== null) {
    updateData.gender = playerGender
  }
  
  // Mettre à jour les champs et préserver les autres champs. Crée le doc s'il n'existe pas.
  await firestoreService.setDocument('seasons', seasonId, updateData, true, 'players', playerId)

  // Si le nom change, renommer les dépendances (availability + selections)
  if (oldName && oldName !== trimmedNewName) {

    // Renommer le document de disponibilités (clé = nom du joueur)
    try {
      logger.info(`🔍 Tentative de migration des disponibilités de "${oldName}" vers "${trimmedNewName}"`)
      const oldAvailability = await firestoreService.getDocument('seasons', seasonId, 'availability', oldName)
              logger.info(`📊 Disponibilités trouvées pour "${oldName}":`, oldAvailability)
      
      if (oldAvailability) {
        // Extraire les données sans l'ID pour la migration
        const { id, ...availabilityData } = oldAvailability
        
        // Créer le nouveau document de disponibilités
        await firestoreService.setDocument('seasons', seasonId, availabilityData, true, 'availability', trimmedNewName)
        logger.info(`✅ Nouveau document de disponibilités créé pour "${trimmedNewName}"`)
        
        // Supprimer l'ancien document
        await firestoreService.deleteDocument('seasons', seasonId, 'availability', oldName)
        logger.info(`🗑️ Ancien document de disponibilités supprimé pour "${oldName}"`)
        
        logger.info(`✅ Disponibilités migrées de "${oldName}" vers "${trimmedNewName}"`)
      } else {
        logger.info(`ℹ️ Aucune disponibilité trouvée pour "${oldName}"`)
      }
    } catch (error) {
              logger.warn(`⚠️ Échec de la migration des disponibilités pour "${oldName}":`, error.message)
      // On continue car le joueur a déjà été renommé
    }

    // Mettre à jour les sélections (nouveau format par rôles)
    try {
      const selections = await firestoreService.getDocuments('seasons', seasonId, 'selections')
      let updatedSelections = 0
      for (const selection of selections) {
        const { id, ...data } = selection
        if (data.roles && typeof data.roles === 'object') {
          let hasUpdates = false
          const updatedRoles = { ...data.roles }
          
          // Vérifier chaque rôle pour le nom à remplacer
          for (const [role, players] of Object.entries(updatedRoles)) {
            if (Array.isArray(players) && players.includes(oldName)) {
              updatedRoles[role] = players.map(n => n === oldName ? trimmedNewName : n)
              hasUpdates = true
            }
          }
          
          if (hasUpdates) {
            // Mise à jour directe sans batch pour l'instant
            await firestoreService.updateDocument('seasons', seasonId, { roles: updatedRoles }, 'selections', id)
            updatedSelections++
          }
        }
      }
      if (updatedSelections > 0) {
        logger.info(`✅ ${updatedSelections} sélection(s) mise(s) à jour avec le nouveau nom "${trimmedNewName}"`)
      }
    } catch (error) {
              logger.warn(`⚠️ Échec de la mise à jour des sélections pour "${oldName}":`, error.message)
      // On continue car le joueur a déjà été renommé
    }
  }
}

export async function loadAvailability(players, events, seasonId) {
  const availabilityDocs = await firestoreService.getDocuments('seasons', seasonId, 'availability')
  const availability = {}
  availabilityDocs.forEach(doc => {
    // firestoreService.getDocuments() retourne déjà { id, ...data }
    const { id, ...data } = doc
    availability[id] = data
  })
  return availability
}

export async function loadSelections(seasonId) {
  const selectionsDocs = await firestoreService.getDocuments('seasons', seasonId, 'selections')
  const res = {}
  
  selectionsDocs.forEach(doc => {
    const { id, ...data } = doc
    
    res[id] = {
      roles: data.roles || {},
      confirmed: data.confirmed || false,
      confirmedAt: data.confirmedAt || null,
      updatedAt: data.updatedAt || null,
      playerStatuses: data.playerStatuses || {},
      confirmedByAllPlayers: data.confirmedByAllPlayers || false
    }
  })
  
  return res
}

// Fonction saveAvailability supprimée - toutes les disponibilités passent maintenant par saveAvailabilityWithRoles

// Nouvelle fonction pour sauvegarder une disponibilité avec rôles et commentaire
export async function saveAvailabilityWithRoles({ seasonId, playerName, eventId, available, roles = [], comment = null }) {
  try {
    // Récupérer les données actuelles
    const currentDoc = await firestoreService.getDocument('seasons', seasonId, 'availability', playerName)
    const current = currentDoc || {}
    const next = { ...current }
    
    if (available === undefined) {
      delete next[eventId]
    } else {
      next[eventId] = {
        available: !!available,
        roles: Array.isArray(roles) ? roles : [],
        comment: comment || null
      }
    }
    
    await firestoreService.setDocument('seasons', seasonId, next, true, 'availability', playerName)
  } catch (error) {
    logger.error('Erreur lors de la sauvegarde de la disponibilité avec rôles:', error)
    throw error
  }
}

// Mise à jour ciblée d'une disponibilité pour un joueur/événement (utilisé par magic links)
export async function setSingleAvailability({ seasonId, playerName, eventId, value }) {
  const currentDoc = await firestoreService.getDocument('seasons', seasonId, 'availability', playerName)
  const current = currentDoc || {}
  const next = { ...current }
  
  if (value === undefined) {
    delete next[eventId]
  } else {
    // Toutes les disponibilités sont maintenant au nouveau format
    next[eventId] = value
  }
  await firestoreService.setDocument('seasons', seasonId, next, true, 'availability', playerName)
}

export async function saveSelection(eventId, roles, seasonId) {
  try {
    // Récupérer l'ancienne sélection pour comparer
    const oldSelectionDoc = await firestoreService.getDocument('seasons', seasonId, 'selections', eventId)
    
    // Extraire tous les joueurs de tous les rôles
    const allPlayers = Object.values(roles).flat().filter(Boolean)
    
    const oldSelection = oldSelectionDoc 
      ? Object.values(oldSelectionDoc.roles || {}).flat().filter(Boolean)
      : []
    
    // Initialiser les statuts individuels des joueurs
    const playerStatuses = {}
    allPlayers.forEach(playerName => {
      playerStatuses[playerName] = 'pending' // Tous commencent en attente de confirmation
    })
    
    const selectionData = { 
      // Nouveau format (par rôle)
      roles: roles,
      
      confirmed: false, // Nouvelle sélection = non confirmée
      confirmedByAllPlayers: false, // Tous les joueurs n'ont pas encore confirmé
      playerStatuses, // Statuts individuels des joueurs
      updatedAt: new Date()
    }
    await firestoreService.setDocument('seasons', seasonId, selectionData, false, 'selections', eventId)
    
    // Gérer les rappels automatiques
    try {
      // Récupérer les informations de l'événement et de la saison
      const [eventData, seasonData] = await Promise.all([
        firestoreService.getDocument('seasons', seasonId, 'events', eventId),
        firestoreService.getDocument('seasons', seasonId)
      ])
      
      if (eventData && seasonData) {
          
          // Supprimer les rappels pour les joueurs désélectionnés
          const removedPlayers = oldSelection.filter(name => !allPlayers.includes(name))
          
          for (const playerName of removedPlayers) {
            try {
              // Récupérer l'email du joueur depuis playerProtection
              const { getPlayerEmail } = await import('./playerProtection.js')
              const playerEmail = await getPlayerEmail(playerName, seasonId)
              if (playerEmail) {
                await removeRemindersForPlayer({
                  seasonId,
                  eventId,
                  playerEmail: playerEmail
                })
              }
            } catch (error) {
              logger.error('Erreur lors de la suppression des rappels pour', playerName, error)
            }
          }
          
          // Créer les rappels pour les nouveaux joueurs sélectionnés
          const newPlayers = allPlayers.filter(name => !oldSelection.includes(name))
          
          // Créer les rappels pour les nouveaux joueurs sélectionnés
          for (const playerName of newPlayers) {
            try {
              // Récupérer l'email du joueur depuis playerProtection
              const { getPlayerEmail } = await import('./playerProtection.js')
              const playerEmail = await getPlayerEmail(playerName, seasonId)
              
              if (playerEmail) {
                await createRemindersForSelection({
                  seasonId,
                  eventId,
                  playerEmail: playerEmail,
                  playerName: playerName,
                  eventTitle: eventData.title,
                  eventDate: eventData.date,
                  seasonSlug: seasonData.slug
                })
              }
            } catch (error) {
              logger.error(`❌ Erreur lors de la création des rappels pour ${playerName}:`, error)
            }
          }
        }
    } catch (error) {
      logger.error('Erreur lors de la gestion des rappels automatiques:', error)
      // Ne pas faire échouer la sauvegarde de la sélection à cause des rappels
    }
  } catch (error) {
    logger.error('❌ Erreur dans saveSelection:', error)
    throw error
  }
}

/**
 * Confirmer une sélection (la verrouille)
 */
export async function confirmSelection(eventId, seasonId) {
  try {
    // Récupérer la sélection actuelle pour initialiser les statuts des joueurs
    const currentSelection = await firestoreService.getDocument('seasons', seasonId, 'selections', eventId) || { roles: {} }
    
    // Initialiser les statuts individuels des joueurs si pas encore fait
    // Préserver les statuts "declined" existants
    const playerStatuses = currentSelection.playerStatuses || {}
    const allPlayers = Object.values(currentSelection.roles || {}).flat().filter(Boolean)
    allPlayers.forEach((playerName) => {
      if (!playerStatuses[playerName]) {
        playerStatuses[playerName] = 'pending' // En attente de confirmation
      }
      // Ne pas écraser un statut "declined" existant
    })
    
    await firestoreService.updateDocument('seasons', seasonId, { 
      confirmed: true,
      confirmedAt: new Date(),
      confirmedByAllPlayers: false, // Initialiser à false car les joueurs n'ont pas encore confirmé
      playerStatuses
    }, 'selections', eventId)
  } catch (error) {
    logger.error('❌ Erreur dans confirmSelection:', error)
    throw error
  }
}

/**
 * Annuler la confirmation d'une sélection (admin uniquement)
 */
export async function unconfirmSelection(eventId, seasonId) {
  try {
    // Préserver TOUS les statuts des joueurs lors du déverrouillage
    const currentData = await firestoreService.getDocument('seasons', seasonId, 'selections', eventId)
    const preservedPlayerStatuses = {}
    
    if (currentData && currentData.playerStatuses) {
      // Préserver tous les statuts existants pour garder l'historique visuel
      Object.entries(currentData.playerStatuses).forEach(([playerName, status]) => {
        // Garder le statut actuel (confirmed, declined, pending)
        preservedPlayerStatuses[playerName] = status
      })
    }
    
    await firestoreService.updateDocument('seasons', seasonId, { 
      confirmed: false,
      confirmedAt: null,
      playerStatuses: preservedPlayerStatuses, // Préserver tous les statuts
      confirmedByAllPlayers: false
    }, 'selections', eventId)
  } catch (error) {
    logger.error('❌ Erreur dans unconfirmSelection:', error)
    throw error
  }
}

/**
 * Supprimer complètement une sélection (remet le statut à "Nouveau")
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison (optionnel)
 */
export async function deleteSelection(eventId, seasonId) {
          logger.info('🗑️ deleteSelection appelé:', { eventId, seasonId })
  
  try {
    // Supprimer complètement le document de sélection
    await firestoreService.deleteDocument('seasons', seasonId, 'selections', eventId)
    
    logger.info('✅ Sélection supprimée avec succès')
  } catch (error) {
    logger.error('❌ Erreur dans deleteSelection:', error)
    throw error
  }
}

export async function deleteEvent(eventId, seasonId) {
  logger.info('Suppression de l\'événement', { eventId })
  
  try {
    // Supprimer l'événement
    logger.debug('Suppression de l\'événement dans Firestore')
    await firestoreService.deleteDocument('seasons', seasonId, 'events', eventId)
    
    // Supprimer la sélection associée
    logger.debug('Suppression de la sélection associée')
    await firestoreService.deleteDocument('seasons', seasonId, 'selections', eventId)
    
    // Supprimer les disponibilités pour cet événement
    logger.debug('Suppression des disponibilités')
    const allAvailability = await firestoreService.getDocuments('seasons', seasonId, 'availability')
    
    // Créer un batch pour supprimer les disponibilités
    const batch = firestoreService.createBatch()
    
    allAvailability.forEach(availabilityDoc => {
      const availabilityData = availabilityDoc
      if (availabilityData[eventId] !== undefined) {
        logger.debug('Mise à jour de la disponibilité pour un joueur')
        const updatedData = { ...availabilityData }
        delete updatedData[eventId]
        batch.update('seasons', seasonId, updatedData, 'availability', availabilityDoc.id)
      }
    })
    
    await batch.commit()
    logger.info('Opérations de suppression terminées avec succès')
  } catch (error) {
    logger.error('Erreur lors de la suppression', error)
    throw error
  }
}

export async function saveEvent(eventData, seasonId) {
  // Ajouter la structure des rôles par défaut si elle n'existe pas
  const eventWithRoles = {
    ...eventData,
    roles: eventData.roles || {
      [ROLES.PLAYER]: eventData.playerCount || 5,
      [ROLES.VOLUNTEER]: 0,
      [ROLES.MC]: 1,
      [ROLES.DJ]: 1,
      [ROLES.REFEREE]: 0,
      [ROLES.ASSISTANT_REFEREE]: 0,
      [ROLES.LIGHTING]: 0,
      [ROLES.COACH]: 0,
      [ROLES.STAGE_MANAGER]: 0
    }
  }
  
  const eventId = await firestoreService.addDocument('seasons', eventWithRoles, seasonId, 'events')
  return eventId
}

export async function updateEvent(eventId, eventData, seasonId) {
  // Utiliser merge pour ne pas écraser des champs existants (ex: archived)
  await firestoreService.setDocument('seasons', seasonId, eventData, true, 'events', eventId)
}

// Mise à jour de l'état d'archivage d'un événement
export async function setEventArchived(eventId, archived, seasonId) {
  await firestoreService.updateDocument('seasons', seasonId, { archived: !!archived }, 'events', eventId)
}

/**
 * Mettre à jour le statut individuel d'un joueur dans une sélection
 * @param {string} eventId - ID de l'événement
 * @param {string} playerName - Nom du joueur
 * @param {string} status - Statut: 'pending', 'confirmed', 'declined'
 * @param {string} seasonId - ID de la saison (optionnel)
 */
export async function updatePlayerSelectionStatus(eventId, playerName, status, seasonId) {
  logger.info('🔄 updatePlayerSelectionStatus appelé:', { eventId, playerName, status, seasonId })
  
  try {
    // Récupérer la sélection actuelle pour vérifier l'état global
    const selectionDoc = await firestoreService.getDocument('seasons', seasonId, 'selections', eventId)
    if (!selectionDoc) {
      throw new Error('Sélection non trouvée')
    }
    
    const { playerStatuses = {} } = selectionDoc
    
    // Mettre à jour le statut du joueur
    const updatedPlayerStatuses = { ...playerStatuses, [playerName]: status }
    
    // Récupérer tous les joueurs de la sélection (tous rôles confondus)
    const allPlayers = getAllPlayersFromSelection(selectionDoc)
    
    // Vérifier si tous les joueurs ont maintenant confirmé
    const allPlayersConfirmed = allPlayers.every(playerName => 
      updatedPlayerStatuses[playerName] === 'confirmed'
    )
    
    // Mettre à jour le statut du joueur ET l'état global de la sélection
    await firestoreService.updateDocument('seasons', seasonId, {
      [`playerStatuses.${playerName}`]: status,
      confirmedByAllPlayers: allPlayersConfirmed
    }, 'selections', eventId)
    
    return { confirmedByAllPlayers: allPlayersConfirmed }
  } catch (error) {
    logger.error('❌ Erreur dans updatePlayerSelectionStatus:', error)
    throw error
  }
}

/**
 * Vérifier si tous les joueurs d'une sélection ont confirmé leur participation
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<boolean>} - true si tous ont confirmé
 */
export async function isAllPlayersConfirmed(eventId, seasonId) {
  try {
    const selectionDoc = await firestoreService.getDocument('seasons', seasonId, 'selections', eventId)
    if (!selectionDoc) {
      return false
    }
    
    const { confirmedByAllPlayers = false } = selectionDoc
    
    // Utiliser le champ pré-calculé pour de meilleures performances
    return confirmedByAllPlayers
  } catch (error) {
    logger.error('❌ Erreur dans isAllPlayersConfirmed:', error)
    return false
  }
}

/**
 * Fonctions helper pour la nouvelle structure multi-rôles
 */

/**
 * Extraire tous les joueurs d'une sélection (tous rôles confondus)
 * @param {Object} selection - Objet de sélection
 * @returns {Array} - Array de noms de joueurs
 */
export function getAllPlayersFromSelection(selection) {
  if (!selection) return []
  
  if (selection.roles && typeof selection.roles === 'object') {
    // Nouveau format : extraire de tous les rôles
    return Object.values(selection.roles).flat().filter(Boolean)
  }
  
  // Aucun format valide trouvé
  return []
}

/**
 * Extraire les joueurs d'un rôle spécifique
 * @param {Object} selection - Objet de sélection
 * @param {string} role - Rôle recherché
 * @returns {Array} - Array de noms de joueurs pour ce rôle
 */
export function getPlayersForRole(selection, role) {
  if (!selection || !selection.roles) return []
  
  return selection.roles[role] || []
}

/**
 * Vérifier si un joueur est sélectionné pour un rôle spécifique
 * @param {Object} selection - Objet de sélection
 * @param {string} playerName - Nom du joueur
 * @param {string} role - Rôle recherché
 * @returns {boolean} - true si le joueur est sélectionné pour ce rôle
 */
export function isPlayerSelectedForRole(selection, playerName, role) {
  if (!selection || !selection.roles) return false
  
  const rolePlayers = selection.roles[role] || []
  return rolePlayers.includes(playerName)
}

/**
 * Obtenir le rôle d'un joueur dans une sélection
 * @param {Object} selection - Objet de sélection
 * @param {string} playerName - Nom du joueur
 * @returns {string|null} - Rôle du joueur ou null si non trouvé
 */
export function getPlayerRole(selection, playerName) {
  if (!selection || !selection.roles) return null
  
  for (const [role, players] of Object.entries(selection.roles)) {
    if (players.includes(playerName)) {
      return role
    }
  }
  
  return null
}
