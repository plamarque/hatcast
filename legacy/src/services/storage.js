// storage.js
import logger from './logger.js'
import { createRemindersForSelection, removeRemindersForPlayer } from './reminderService.js'
import firestoreService from './firestoreService.js'
import AuditClient from './auditClient.js'
import { LABELS } from '../constants/labels.js'
import permissionService from './permissionService.js'
import { isEventPastParis, normalizeEventDate } from '../utils/eventPastParis.js'

// Fonctions utilitaires pour la migration vers les IDs de joueurs
export async function getPlayerIdByName(playerName, seasonId) {
  // Récupérer tous les joueurs et trouver l'ID correspondant au nom
  const players = await firestoreService.getDocuments('seasons', seasonId, 'players')
  const player = players.find(p => p.name === playerName)
  return player ? player.id : null
}

async function getPlayerNameById(playerId, seasonId) {
  // Récupérer le nom du joueur par son ID
  const player = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
  return player ? player.name : null
}

// Fonctions de migration temporaires (à supprimer après migration complète)
function encodePlayerNameForFirestore(playerName) {
  // Remplacer les caractères problématiques pour Firestore
  return playerName
    .replace(/\./g, '_DOT_')  // Points
    .replace(/\s+/g, '_SPACE_')  // Espaces
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // Autres caractères spéciaux
}

function decodePlayerNameFromFirestore(encodedName) {
  // Restaurer les caractères originaux
  return encodedName
    .replace(/_DOT_/g, '.')
    .replace(/_SPACE_/g, ' ')
    .replace(/_/g, '')  // Nettoyer les autres underscores ajoutés
}

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
  [ROLES.PLAYER]: LABELS.ROLES.PLAYER.PLURAL_INCLUSIVE,
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
  [ROLES.PLAYER]: LABELS.ROLES.PLAYER.SINGULAR_INCLUSIVE,
  [ROLES.VOLUNTEER]: 'Bénévole',
  [ROLES.MC]: 'MC',
  [ROLES.DJ]: 'DJ',
  [ROLES.REFEREE]: 'Arbitre',
  [ROLES.ASSISTANT_REFEREE]: 'Assistant.e',
  [ROLES.LIGHTING]: 'Lumière',
  [ROLES.COACH]: 'Coach',
  [ROLES.STAGE_MANAGER]: 'Régisseur.euse'
}

// Ordre d'affichage des rôles (pour l'interface utilisateur)
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

/** Abréviations pour l'export CSV des dispos (distinctes des libellés de sélection). */
export const ROLE_EXPORT_ABBREVIATIONS = {
  [ROLES.PLAYER]: 'J',
  [ROLES.MC]: 'MC',
  [ROLES.DJ]: 'DJ',
  [ROLES.REFEREE]: 'A',
  [ROLES.ASSISTANT_REFEREE]: 'AA',
  [ROLES.COACH]: 'C',
  [ROLES.VOLUNTEER]: 'B',
  [ROLES.LIGHTING]: 'L',
  [ROLES.STAGE_MANAGER]: 'R',
}

export function getRoleExportAbbrev(role) {
  return ROLE_EXPORT_ABBREVIATIONS[role] ?? role
}

// Ordre de priorité pour les tirages (rôles critiques en premier)
export const ROLE_PRIORITY_ORDER = [
  ROLES.REFEREE,         // Priorité 1 : Arbitre - critique pour les matchs
  ROLES.DJ,              // Priorité 2 : DJ - critique pour le spectacle
  ROLES.MC,              // Priorité 3 : MC - critique pour le spectacle
  ROLES.PLAYER,          // Priorité 4 : Joueurs - essentiels
  ROLES.ASSISTANT_REFEREE, // Priorité 5 : Assistants arbitres
  ROLES.COACH,           // Priorité 6 : Coach
  ROLES.STAGE_MANAGER,   // Priorité 7 : Régisseur pour coordination
  ROLES.LIGHTING,        // Priorité 8 : Éclairagiste
  ROLES.VOLUNTEER        // Priorité 9 : Bénévoles (rôle le moins critique)
]

// Labels par genre (nouveau système inclusif)
export const ROLE_LABELS_BY_GENDER = {
  male: {
    [ROLES.PLAYER]: LABELS.ROLES.PLAYER.SINGULAR,
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
    [ROLES.PLAYER]: LABELS.ROLES.PLAYER.SINGULAR_FEMININE,
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
    [ROLES.PLAYER]: LABELS.ROLES.PLAYER.SINGULAR_INCLUSIVE,
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
    [ROLES.PLAYER]: LABELS.ROLES.PLAYER.PLURAL,
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
    [ROLES.PLAYER]: LABELS.ROLES.PLAYER.PLURAL_FEMININE,
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
    [ROLES.PLAYER]: LABELS.ROLES.PLAYER.PLURAL_INCLUSIVE,
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
  catch: '🥊',
  cabaret: '🎪',
  longform: '⏱️',
  freeform: '🦋',
  deplacement: '🚌',
  survey: '📊',
  custom: '❓'
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
  catch: {
    name: 'Catch',
    description: 'Format catch avec MC et DJ',
    roles: {
      [ROLES.PLAYER]: 9,
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
  freeform: {
    name: 'Free Form',
    description: 'Improvisation libre avec MC et DJ',
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
  survey: {
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
  },
  custom: {
    name: 'Autre',
    description: 'Type non défini',
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
export const TEMPLATE_DISPLAY_ORDER = ['cabaret', 'longform', 'freeform', 'match', 'catch', 'deplacement', 'survey', 'custom']

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

/**
 * Traite des événements bruts pour l'affichage (tri, _isArchived, _isPast).
 * Utilisé pour éviter un double fetch Firestore quand on a déjà allEventsData.
 */
export function processEventsForDisplay(events) {
  if (!Array.isArray(events)) return []
  const now = new Date()
  const processedEvents = events.map(event => {
    const eventDate = normalizeEventDate(event.date)
    return {
      ...event,
      _isArchived: event.archived === true,
      _isPast: !!(event.date && isEventPastParis(event.date, now)),
      _eventDate: eventDate
    }
  })
  return processedEvents.sort((a, b) => {
    const ta = a._eventDate ? a._eventDate.getTime() : Number.POSITIVE_INFINITY
    const tb = b._eventDate ? b._eventDate.getTime() : Number.POSITIVE_INFINITY
    if (ta !== tb) return ta - tb
    return (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' })
  })
}

export async function loadActiveEvents(seasonId) {
  const events = await firestoreService.getDocuments('seasons', seasonId, 'events')

  // TEMPORAIRE: Charger TOUS les événements pour visibilité complète et debugging
  // TODO: Réimplémenter le filtrage avec une option dans l'UI
  console.log(`🔍 Chargement de TOUS les événements (${events.length} trouvés) pour visibilité complète`)
  
  return processEventsForDisplay(events)
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

  // Si le nom change, renommer les dépendances (availability + compositions)
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

    // Mettre à jour les compositions (nouveau format par rôles)
    try {
      const compositions = await firestoreService.getDocuments('seasons', seasonId, 'casts')
      let updatedCompositions = 0
      for (const composition of compositions) {
        const { id, ...data } = composition
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
            await firestoreService.updateDocument('seasons', seasonId, { roles: updatedRoles }, 'casts', id)
            updatedCompositions++
          }
        }
      }
      if (updatedCompositions > 0) {
        logger.info(`✅ ${updatedCompositions} composition(s) mise(s) à jour avec le nouveau nom "${trimmedNewName}"`)
      }
    } catch (error) {
              logger.warn(`⚠️ Échec de la mise à jour des compositions pour "${oldName}":`, error.message)
      // On continue car le joueur a déjà été renommé
    }
  }
}

export async function loadAvailability(players, events, seasonId) {
  const availability = {}
  
  // Mesurer le chargement des disponibilités
  const startTime = performance.now()
  logger.debug(`⏱️ Début du chargement PARALLÈLE des disponibilités pour ${players.length} joueurs`)
  
  // Créer toutes les promesses de chargement en parallèle
  const availabilityPromises = players.map(async (player) => {
    const playerStartTime = performance.now()
    try {
      const playerAvailabilityDocs = await firestoreService.getDocuments('seasons', seasonId, 'players', player.id, 'availability')
      const playerAvailability = {}
      playerAvailabilityDocs.forEach(doc => {
        const { id, ...data } = doc
        playerAvailability[id] = data
      })
      
      const playerDuration = performance.now() - playerStartTime
      logger.debug(`⏱️ Joueur "${player.name}": ${playerDuration.toFixed(2)}ms (${playerAvailabilityDocs.length} disponibilités)`)
      
      return { playerName: player.name, playerAvailability, success: true }
    } catch (error) {
      // Si le joueur n'a pas de disponibilités, continuer
      const playerDuration = performance.now() - playerStartTime
      logger.debug(`⏱️ Joueur "${player.name}": ${playerDuration.toFixed(2)}ms (erreur: ${error.message})`)
      
      return { playerName: player.name, playerAvailability: {}, success: false, error: error.message }
    }
  })
  
  // Attendre que toutes les requêtes se terminent en parallèle
  const results = await Promise.all(availabilityPromises)
  
  // Construire l'objet availability final
  results.forEach(({ playerName, playerAvailability }) => {
    availability[playerName] = playerAvailability
  })
  
  const totalDuration = performance.now() - startTime
  const totalAvailabilityCount = Object.values(availability).reduce((sum, playerAvail) => sum + Object.keys(playerAvail).length, 0)
  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length
  
  logger.info(`⏱️ Chargement PARALLÈLE des disponibilités terminé: ${totalDuration.toFixed(2)}ms (${players.length} joueurs, ${totalAvailabilityCount} disponibilités totales, ${successCount} succès, ${errorCount} erreurs)`)
  
  // Log de performance pour le debug
  if (totalDuration > 200) {
    logger.warn(`⚠️ Chargement des disponibilités lent: ${totalDuration.toFixed(2)}ms (${players.length} joueurs)`)
  } else {
    logger.debug(`✅ Chargement des disponibilités rapide: ${totalDuration.toFixed(2)}ms`)
  }
  
  return availability
}


export async function loadCasts(seasonId) {
  const compositionsDocs = await firestoreService.getDocuments('seasons', seasonId, 'casts')
  const res = {}
  
  compositionsDocs.forEach(doc => {
    const { id, ...data } = doc
    
    // Convertir les IDs de joueurs en noms dans playerStatuses et roles
    const decodedPlayerStatuses = {}
    const decodedRoles = {}
    
    if (data.playerStatuses) {
      Object.entries(data.playerStatuses).forEach(([playerId, status]) => {
        // Pour l'instant, garder les IDs (on décodera plus tard si nécessaire)
        decodedPlayerStatuses[playerId] = status
      })
    }
    
    if (data.roles) {
      Object.entries(data.roles).forEach(([role, playerIds]) => {
        // Pour l'instant, garder les IDs (on décodera plus tard si nécessaire)
        decodedRoles[role] = playerIds
      })
    }
    
    res[id] = {
      roles: decodedRoles,
      declined: data.declined || {}, // Nouveau : joueurs déclinés
      confirmed: data.confirmed || false,
      confirmedAt: data.confirmedAt || null,
      updatedAt: data.updatedAt || null,
      playerStatuses: decodedPlayerStatuses,
      confirmedByAllPlayers: data.confirmedByAllPlayers || false,
      // Nouveaux champs calculés par castStatusService
      status: data.status || null,
      statusDetails: data.statusDetails || null
    }
  })
  
  return res
}

// Fonction saveAvailability supprimée - toutes les disponibilités passent maintenant par saveAvailabilityWithRoles

// Nouvelle fonction pour sauvegarder une disponibilité avec rôles et commentaire
export async function saveAvailabilityWithRoles({ seasonId, playerName, eventId, available, roles = [], comment = null }) {
  try {
    // Convertir le nom de joueur en ID
    const playerId = await getPlayerIdByName(playerName, seasonId)
    if (!playerId) {
      throw new Error(`Joueur non trouvé: ${playerName}`)
    }
    
    if (available === undefined || available === null) {
      // Supprimer la disponibilité (Non renseigné)
      await firestoreService.deleteDocument('seasons', seasonId, 'players', playerId, 'availability', eventId)
    } else {
      // Sauvegarder la disponibilité
      const availabilityData = {
        available: !!available,
        roles: Array.isArray(roles) ? roles : [],
        comment: comment || null,
        updatedAt: new Date()
      }
      await firestoreService.setDocument('seasons', seasonId, availabilityData, false, 'players', playerId, 'availability', eventId)
    }
    
    // If player set availability to false or removed it (null/undefined), check if they're in the cast and auto-decline
    if (available === false || available === null || available === undefined) {
      try {
        const { movePlayerToDeclined } = await import('./castService.js')
        const result = await movePlayerToDeclined(playerId, eventId, seasonId, {
          source: 'availability_change',
          playerName: playerName
        })
        
        if (result.success) {
          logger.debug(`Player ${playerName} auto-declined from cast for event ${eventId}`)
        }
      } catch (declineError) {
        // Don't fail the availability save if decline fails
        logger.debug('Error auto-declining player from cast:', declineError)
      }
    }
    
    // Logger l'audit APRÈS la sauvegarde réussie
    try {
      await AuditClient.logAvailabilityChange({
        seasonId: seasonId,
        playerName: playerName, // Le joueur pour qui le changement a été fait
        availability: available,
        previousAvailability: null, // On n'a pas l'ancienne valeur ici
        timestamp: new Date().toISOString(),
        eventId: eventId,
        eventTitle: 'Unknown', // On n'a pas le titre de l'événement ici
        roles: roles,
        comment: comment
      })
    } catch (auditError) {
      console.warn('Erreur audit availability change:', auditError)
      // Ne pas faire échouer la sauvegarde si l'audit échoue
    }
    
  } catch (error) {
    logger.error('Erreur lors de la sauvegarde de la disponibilité avec rôles:', error)
    throw error
  }
}

// Mise à jour ciblée d'une disponibilité pour un joueur/événement (utilisé par magic links)
export async function countAvailabilities(seasonId) {
  try {
    logger.debug(`🔢 Comptage des disponibilités pour la saison ${seasonId}`)
    
    // Récupérer tous les joueurs de la saison
    const players = await loadPlayers(seasonId)
    if (players.length === 0) {
      return 0
    }
    
    // Compter les disponibilités en parallèle pour tous les joueurs
    const countPromises = players.map(async (player) => {
      try {
        const availabilityDocs = await firestoreService.getDocuments('seasons', seasonId, 'players', player.id, 'availability')
        return availabilityDocs.length
      } catch (error) {
        // Si le joueur n'a pas de disponibilités, retourner 0
        return 0
      }
    })
    
    const counts = await Promise.all(countPromises)
    const totalCount = counts.reduce((sum, count) => sum + count, 0)
    
    logger.debug(`🔢 Total des disponibilités: ${totalCount}`)
    return totalCount
  } catch (error) {
    logger.error('Erreur lors du comptage des disponibilités:', error)
    return 0
  }
}

export async function setSingleAvailability({ seasonId, playerName, eventId, value }) {
  try {
    // Convertir le nom de joueur en ID
    const playerId = await getPlayerIdByName(playerName, seasonId)
    if (!playerId) {
      throw new Error(`Joueur non trouvé: ${playerName}`)
    }
    
    if (value === undefined) {
      // Supprimer la disponibilité
      await firestoreService.deleteDocument('seasons', seasonId, 'players', playerId, 'availability', eventId)
    } else {
      // Sauvegarder la disponibilité
      const availabilityData = {
        ...value,
        updatedAt: new Date()
      }
      await firestoreService.setDocument('seasons', seasonId, availabilityData, false, 'players', playerId, 'availability', eventId)
    }
    
    // If player set availability to false, check if they're in the cast and auto-decline
    if (value && value.available === false) {
      try {
        const { movePlayerToDeclined } = await import('./castService.js')
        const result = await movePlayerToDeclined(playerId, eventId, seasonId, {
          source: 'availability_change',
          playerName: playerName
        })
        
        if (result.success) {
          logger.debug(`Player ${playerName} auto-declined from cast for event ${eventId}`)
        }
      } catch (declineError) {
        // Don't fail the availability save if decline fails
        logger.debug('Error auto-declining player from cast:', declineError)
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la disponibilité:', error)
    throw error
  }
}

export async function saveCast(eventId, roles, seasonId, options = {}) {
  try {
    // Récupérer l'ancienne composition pour comparer
    const oldCastDoc = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId)
    
    // Extraire tous les joueurs de tous les rôles (y compris les déclinés)
    const allPlayers = Object.values(roles).flat().filter(Boolean)
    const allDeclinedPlayers = Object.values(options.declined || {}).flat().filter(Boolean)
    const allPlayersIncludingDeclined = [...allPlayers, ...allDeclinedPlayers]
    
    const oldCast = oldCastDoc 
      ? Object.values(oldCastDoc.roles || {}).flat().filter(Boolean)
      : []
    
    // S'assurer que oldCast contient des IDs, pas des noms (pour les données anciennes)
    const oldCastWithIds = await Promise.all(oldCast.map(async (player) => {
      // Si c'est déjà un ID (format long), le garder tel quel
      if (player && player.length > 10) {
        return player
      }
      // Sinon, c'est probablement un nom, le convertir en ID
      return await getPlayerIdByName(player, seasonId)
    }))
    const oldCastIds = oldCastWithIds.filter(Boolean)
    
    // Initialiser les statuts individuels des joueurs
    const playerStatuses = {}
    allPlayersIncludingDeclined.forEach(playerId => {
      // Préserver le statut existant ou initialiser selon le contexte
      if (allDeclinedPlayers.includes(playerId)) {
        playerStatuses[playerId] = 'declined'
      } else {
        playerStatuses[playerId] = oldCastDoc?.playerStatuses?.[playerId] || 'pending'
      }
    })
    
    // Calculer le statut de la composition
    const { calculateCastStatus } = await import('./castService.js')
    const eventData = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    
    const status = calculateCastStatus(
      { roles, playerStatuses, ...oldCastDoc },
      eventData,
      null, // teamSlots pas disponible ici
      {}, // playerAvailability pas disponible ici
      allPlayers.length // approximation
    )
    
    const castData = { 
      // Nouveau format (par rôle)
      roles: roles,
      
      // Nouveau : joueurs déclinés séparés (ne comptent pas dans les slots)
      declined: options.declined || {},
      
      // Préserver les statuts de confirmation existants ou utiliser les options
      confirmed: options.preserveConfirmed ? (oldCastDoc?.confirmed || false) : false,
      confirmedByAllPlayers: options.preserveConfirmed ? (oldCastDoc?.confirmedByAllPlayers || false) : false,
      confirmedAt: options.preserveConfirmed ? (oldCastDoc?.confirmedAt || null) : null,
      
      playerStatuses, // Statuts individuels des joueurs
      
      // Nouveau : statut calculé automatiquement
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
    await firestoreService.setDocument('seasons', seasonId, castData, false, 'casts', eventId)
    
    // Gérer les rappels automatiques
    try {
      // Récupérer les informations de l'événement et de la saison
      const [eventData, seasonData] = await Promise.all([
        firestoreService.getDocument('seasons', seasonId, 'events', eventId),
        firestoreService.getDocument('seasons', seasonId)
      ])
      
      if (eventData && seasonData) {
          
          // Supprimer les rappels pour les joueurs décomposés
          const removedPlayerIds = oldCastIds.filter(playerId => !allPlayers.includes(playerId))
          
          for (const playerId of removedPlayerIds) {
            try {
              // Convertir l'ID en nom pour les fonctions qui en ont besoin
              const playerName = await getPlayerNameById(playerId, seasonId)
              if (!playerName) {
                console.warn('Nom de joueur non trouvé pour l\'ID:', playerId)
                continue
              }
              
              // Récupérer l'email du joueur depuis players
              const { getPlayerEmail } = await import('./players.js')
              const playerEmail = await getPlayerEmail(playerName, seasonId)
              if (playerEmail) {
                await removeRemindersForPlayer({
                  seasonId,
                  eventId,
                  playerEmail: playerEmail
                })
              }
            } catch (error) {
              logger.error('Erreur lors de la suppression des rappels pour', playerId, error)
            }
          }
          
          // Créer les rappels pour les nouveaux joueurs composés
          const newPlayerIds = allPlayers.filter(playerId => !oldCastIds.includes(playerId))
          
          // Créer les rappels pour les nouveaux joueurs composés
          for (const playerId of newPlayerIds) {
            try {
              // Convertir l'ID en nom pour les fonctions qui en ont besoin
              const playerName = await getPlayerNameById(playerId, seasonId)
              if (!playerName) {
                console.warn('Nom de joueur non trouvé pour l\'ID:', playerId)
                continue
              }
              
              // Récupérer l'email du joueur depuis players
              const { getPlayerEmail } = await import('./players.js')
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
              logger.error(`❌ Erreur lors de la création des rappels pour ${playerId}:`, error)
            }
          }
        }
    } catch (error) {
      logger.error('Erreur lors de la gestion des rappels automatiques:', error)
      // Ne pas faire échouer la sauvegarde de la composition à cause des rappels
    }
  } catch (error) {
    logger.error('❌ Erreur dans saveCast:', error)
    throw error
  }
}

/**
 * Confirmer une composition (la verrouille)
 */
export async function confirmCast(eventId, seasonId) {
  try {
    // Récupérer la composition actuelle pour initialiser les statuts des joueurs
    const currentCast = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId) || { roles: {} }
    
    // Initialiser les statuts individuels des joueurs si pas encore fait
    // Préserver les statuts "declined" existants
    const playerStatuses = currentCast.playerStatuses || {}
    const allPlayers = Object.values(currentCast.roles || {}).flat().filter(Boolean)
    allPlayers.forEach((playerId) => {
      if (!playerStatuses[playerId]) {
        playerStatuses[playerId] = 'pending' // En attente de confirmation
      }
      // Ne pas écraser un statut "declined" existant
    })
    
    // Recalculer le statut avec le service centralisé
    const { calculateCastStatus } = await import('./castService.js')
    const eventData = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    
    const status = calculateCastStatus(
      { ...currentCast, playerStatuses, confirmed: true, confirmedByAllPlayers: false },
      eventData,
      null, // teamSlots pas disponible ici
      {}, // playerAvailability pas disponible ici
      allPlayers.length // approximation
    )
    
    await firestoreService.updateDocument('seasons', seasonId, { 
      confirmed: true,
      confirmedAt: new Date(),
      confirmedByAllPlayers: false, // Initialiser à false car les joueurs n'ont pas encore confirmé
      playerStatuses,
      // Nouveau : statut calculé automatiquement
      status: status.type,
      statusDetails: status
    }, 'casts', eventId)
  } catch (error) {
    logger.error('❌ Erreur dans confirmCast:', error)
    throw error
  }
}

/**
 * Annuler la confirmation d'une composition (admin uniquement)
 */
export async function unconfirmCast(eventId, seasonId) {
  try {
    // Préserver TOUS les statuts des joueurs lors du déverrouillage
    const currentData = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId)
    const preservedPlayerStatuses = {}
    
    if (currentData && currentData.playerStatuses) {
      // Préserver tous les statuts existants pour garder l'historique visuel
      Object.entries(currentData.playerStatuses).forEach(([playerId, status]) => {
        // Garder le statut actuel (confirmed, declined, pending) avec l'ID du joueur
        preservedPlayerStatuses[playerId] = status
      })
    }
    
    await firestoreService.updateDocument('seasons', seasonId, { 
      confirmed: false,
      confirmedAt: null,
      playerStatuses: preservedPlayerStatuses, // Préserver tous les statuts
      confirmedByAllPlayers: false
    }, 'casts', eventId)
  } catch (error) {
    logger.error('❌ Erreur dans unconfirmCast:', error)
    throw error
  }
}

/**
 * Supprimer complètement une composition (remet le statut à "Nouveau")
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison (optionnel)
 */
export async function deleteCast(eventId, seasonId) {
          logger.info('🗑️ deleteCast appelé:', { eventId, seasonId })
  
  try {
    // Supprimer complètement le document de composition
    await firestoreService.deleteDocument('seasons', seasonId, 'casts', eventId)
    
    logger.info('✅ Composition supprimée avec succès')
  } catch (error) {
    logger.error('❌ Erreur dans deleteCast:', error)
    throw error
  }
}

export async function deleteEvent(eventId, seasonId) {
  logger.info('Suppression de l\'événement', { eventId })
  
  try {
    // Supprimer l'événement
    logger.debug('Suppression de l\'événement dans Firestore')
    await firestoreService.deleteDocument('seasons', seasonId, 'events', eventId)
    
    // Supprimer la composition associée
    logger.debug('Suppression de la composition associée')
    await firestoreService.deleteDocument('seasons', seasonId, 'casts', eventId)
    
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
    
    // Supprimer tous les rappels associés à cet événement
    try {
      const { removeRemindersForEvent } = await import('./reminderService.js')
      await removeRemindersForEvent({ seasonId, eventId })
      logger.info('Rappels supprimés pour l\'événement supprimé', { seasonId, eventId })
    } catch (error) {
      logger.error('Erreur lors de la suppression des rappels pour l\'événement supprimé', { error, seasonId, eventId })
      // Ne pas faire échouer la suppression si la suppression des rappels échoue
    }
    
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
  
  // Toujours recalculer le statut de la composition si elle existe
  // Cela garantit que le requiredCount est à jour même si les rôles ont été modifiés précédemment
  try {
    const castDoc = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId)
    if (castDoc) {
      // Recalculer le statut avec les données actuelles de l'événement
      await updateCastStatus(eventId, seasonId)
      logger.debug('Statut de la composition recalculé après modification de l\'événement', { eventId, seasonId })
    }
  } catch (error) {
    // Ne pas faire échouer la mise à jour de l'événement si le recalcul du statut échoue
    logger.warn('Erreur lors du recalcul du statut après modification de l\'événement', { error, eventId, seasonId })
  }
}

// Mise à jour de l'état d'archivage d'un événement
export async function setEventArchived(eventId, archived, seasonId) {
  await firestoreService.updateDocument('seasons', seasonId, { archived: !!archived }, 'events', eventId)
  
  // Si l'événement est archivé, supprimer tous les rappels associés
  if (archived) {
    try {
      const { removeRemindersForEvent } = await import('./reminderService.js')
      await removeRemindersForEvent({ seasonId, eventId })
      logger.info('Rappels supprimés pour l\'événement archivé', { seasonId, eventId })
    } catch (error) {
      logger.error('Erreur lors de la suppression des rappels pour l\'événement archivé', { error, seasonId, eventId })
      // Ne pas faire échouer l'archivage si la suppression des rappels échoue
    }
  }
}

/**
 * Mettre à jour le statut individuel d'un joueur dans une composition
 * @param {string} eventId - ID de l'événement
 * @param {string} playerId - ID du joueur
 * @param {string} status - Statut: 'pending', 'confirmed', 'declined'
 * @param {string} seasonId - ID de la saison (optionnel)
 */
export async function updatePlayerCastStatus(eventId, playerId, status, seasonId) {
  logger.info('🔄 updatePlayerCastStatus appelé:', { eventId, playerId, status, seasonId })
  console.log('🔍 DEBUG updatePlayerCastStatus - Début:', { eventId, playerId, status, seasonId })
  
  try {
    // Récupérer la composition actuelle pour vérifier l'état global
    const castDoc = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId)
    console.log('🔍 DEBUG updatePlayerCastStatus - CastDoc récupéré:', castDoc)
    
    if (!castDoc) {
      throw new Error('Composition non trouvée')
    }
    
    const { playerStatuses = {} } = castDoc
    console.log('🔍 DEBUG updatePlayerCastStatus - PlayerStatuses actuels:', playerStatuses)
    
    // Mettre à jour le statut du joueur
    const updatedPlayerStatuses = { ...playerStatuses, [playerId]: status }
    
    // Récupérer tous les joueurs de la composition (tous rôles confondus)
    const allPlayerIds = getAllPlayersFromCast(castDoc)
    
    // Vérifier si tous les joueurs ont maintenant confirmé
    const allPlayersConfirmed = allPlayerIds.every(playerId => 
      updatedPlayerStatuses[playerId] === 'confirmed'
    )
    
    // Recalculer le statut global de la sélection
    const { calculateCastStatus } = await import('./castService.js')
    const eventData = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    
    const castStatus = calculateCastStatus(
      { 
        ...castDoc, 
        playerStatuses: updatedPlayerStatuses,
        confirmedByAllPlayers: allPlayersConfirmed
      },
      eventData,
      null, // teamSlots pas disponible ici
      {}, // playerAvailability pas disponible ici
      allPlayerIds.length // approximation
    )
    
    // Mettre à jour le statut du joueur ET l'état global de la composition
    await firestoreService.updateDocument('seasons', seasonId, {
      [`playerStatuses.${playerId}`]: status,
      confirmedByAllPlayers: allPlayersConfirmed,
      // Nouveau : statut global recalculé
      status: castStatus.type,
      statusDetails: {
        hasUnavailablePlayers: castStatus.hasUnavailablePlayers || false,
        hasInsufficientPlayers: castStatus.hasInsufficientPlayers || false,
        hasDeclinedPlayers: castStatus.hasDeclinedPlayers || false,
        hasEmptySlots: castStatus.hasEmptySlots || false,
        unavailablePlayers: castStatus.unavailablePlayers || [],
        declinedPlayers: castStatus.declinedPlayers || [],
        availableCount: castStatus.availableCount,
        requiredCount: castStatus.requiredCount
      }
    }, 'casts', eventId)
    
    return { confirmedByAllPlayers: allPlayersConfirmed }
  } catch (error) {
    logger.error('❌ Erreur dans updatePlayerCastStatus:', error)
    throw error
  }
}

/**
 * Recalculer et mettre à jour le statut de la composition sans modifier les rôles
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison
 */
export async function updateCastStatus(eventId, seasonId) {
  try {
    const { calculateCastStatus } = await import('./castService.js')
    
    // Récupérer la composition actuelle
    const castDoc = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId)
    if (!castDoc) {
      logger.warn('updateCastStatus: Composition non trouvée')
      return
    }
    
    // Récupérer l'événement
    const eventData = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    if (!eventData) {
      logger.warn('updateCastStatus: Événement non trouvé')
      return
    }
    
    // Calculer le nombre de joueurs disponibles (approximation)
    const allPlayerIds = getAllPlayersFromCast(castDoc)
    
    // Recalculer le statut
    const status = calculateCastStatus(
      castDoc,
      eventData,
      null, // teamSlots pas disponible ici
      {}, // playerAvailability pas disponible ici
      allPlayerIds.length // approximation
    )
    
    // Mettre à jour uniquement le statut dans la base
    await firestoreService.updateDocument('seasons', seasonId, {
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
    }, 'casts', eventId)
  } catch (error) {
    logger.error('❌ Erreur dans updateCastStatus:', error)
    throw error
  }
}

/**
 * Vérifier si tous les joueurs d'une composition ont confirmé leur participation
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<boolean>} - true si tous ont confirmé
 */
export async function isAllPlayersConfirmed(eventId, seasonId) {
  try {
    const castDoc = await firestoreService.getDocument('seasons', seasonId, 'casts', eventId)
    if (!castDoc) {
      return false
    }
    
    const { confirmedByAllPlayers = false } = castDoc
    
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
 * Extraire tous les joueurs d'une composition (tous rôles confondus)
 * @param {Object} cast - Objet de composition
 * @returns {Array} - Array d'IDs de joueurs
 */
export function getAllPlayersFromCast(cast) {
  if (!cast) return []
  
  if (cast.roles && typeof cast.roles === 'object') {
    // Nouveau format : extraire de tous les rôles (maintenant avec des IDs)
    return Object.values(cast.roles).flat().filter(Boolean)
  }
  
  // Aucun format valide trouvé
  return []
}

/**
 * Extraire les joueurs d'un rôle spécifique
 * @param {Object} composition - Objet de composition
 * @param {string} role - Rôle recherché
 * @returns {Array} - Array de noms de joueurs pour ce rôle
 */
export function getPlayersForRole(cast, role) {
  if (!cast || !cast.roles) return []
  
  return cast.roles[role] || []
}

/**
 * Vérifier si un joueur est composé pour un rôle spécifique
 * @param {Object} composition - Objet de composition
 * @param {string} playerName - Nom du joueur
 * @param {string} role - Rôle recherché
 * @returns {boolean} - true si le joueur est composé pour ce rôle
 */
export function isPlayerCastForRole(cast, playerName, role) {
  if (!cast || !cast.roles) return false
  
  const rolePlayers = cast.roles[role] || []
  return rolePlayers.includes(playerName)
}

/**
 * Obtenir le rôle d'un joueur dans une composition
 * @param {Object} composition - Objet de composition
 * @param {string} playerName - Nom du joueur
 * @returns {string|null} - Rôle du joueur ou null si non trouvé
 */
export function getPlayerRole(cast, playerName) {
  if (!cast || !cast.roles) return null
  
  for (const [role, players] of Object.entries(cast.roles)) {
    if (players.includes(playerName)) {
      return role
    }
  }
  
  return null
}

/**
 * Récupère la liste des admins d'un événement
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<Array<string>>} - Array d'emails d'admins
 */
export async function getEventAdmins(eventId, seasonId) {
  try {
    const eventDoc = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    // Gérer l'absence du champ eventAdmins
    return eventDoc?.eventAdmins || []
  } catch (error) {
    logger.error(`❌ Erreur lors de la récupération des admins d'événement ${eventId}:`, error)
    return []
  }
}

/**
 * Ajoute un admin à un événement
 * @param {string} eventId - ID de l'événement
 * @param {string} userEmail - Email de l'utilisateur à ajouter
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<boolean>} - true si succès
 */
export async function addEventAdmin(eventId, userEmail, seasonId) {
  try {
    // Vérifier les permissions
    if (!permissionService.isInitialized) {
      await permissionService.initialize()
    }
    
    const canManage = await permissionService.canManageEventAdmins(eventId, seasonId)
    if (!canManage) {
      throw new Error('Vous n\'avez pas les permissions pour gérer les admins d\'événement')
    }
    
    // Normaliser l'email avant de l'ajouter (lowercase + trim)
    const normalizedEmail = userEmail?.toLowerCase().trim() || ''
    if (!normalizedEmail) {
      throw new Error('Email invalide')
    }
    
    logger.info(`🔐 Ajout de l'admin ${normalizedEmail} à l'événement ${eventId}`)
    
    // Récupérer le document événement
    const eventDoc = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    if (!eventDoc) {
      throw new Error(`Événement ${eventId} non trouvé`)
    }
    
    // Gérer l'absence du champ eventAdmins et normaliser les emails existants
    const eventAdmins = (eventDoc.eventAdmins || []).map(email => email?.toLowerCase().trim() || '')
    
    // Vérifier si l'email n'est pas déjà dans la liste (comparaison normalisée)
    if (eventAdmins.includes(normalizedEmail)) {
      logger.info(`ℹ️ ${normalizedEmail} est déjà admin de l'événement ${eventId}`)
      return true
    }
    
    // Ajouter l'email normalisé
    eventAdmins.push(normalizedEmail)
    
    // Mettre à jour le document
    await firestoreService.updateDocument('seasons', seasonId, {
      'eventAdmins': eventAdmins
    }, 'events', eventId)
    
    // Invalider le cache des permissions
    permissionService.invalidateEventCache(eventId, seasonId)
    // Invalider aussi le cache global pour forcer le rechargement des permissions
    permissionService.invalidateAllCache()
    
    logger.info(`✅ Admin ${normalizedEmail} ajouté à l'événement ${eventId}`)
    return true
  } catch (error) {
    logger.error(`❌ Erreur lors de l'ajout de l'admin ${userEmail} à l'événement ${eventId}:`, error)
    throw error
  }
}

/**
 * Retire un admin d'un événement
 * @param {string} eventId - ID de l'événement
 * @param {string} userEmail - Email de l'utilisateur à retirer
 * @param {string} seasonId - ID de la saison
 * @returns {Promise<boolean>} - true si succès
 */
export async function removeEventAdmin(eventId, userEmail, seasonId) {
  try {
    // Vérifier les permissions
    if (!permissionService.isInitialized) {
      await permissionService.initialize()
    }
    
    const canManage = await permissionService.canManageEventAdmins(eventId, seasonId)
    if (!canManage) {
      throw new Error('Vous n\'avez pas les permissions pour gérer les admins d\'événement')
    }
    
    logger.info(`🔐 Retrait de l'admin ${userEmail} de l'événement ${eventId}`)
    
    // Récupérer le document événement
    const eventDoc = await firestoreService.getDocument('seasons', seasonId, 'events', eventId)
    if (!eventDoc) {
      throw new Error(`Événement ${eventId} non trouvé`)
    }
    
    // Gérer l'absence du champ eventAdmins
    const eventAdmins = eventDoc.eventAdmins || []
    
    // Retirer l'email
    const adminIndex = eventAdmins.indexOf(userEmail)
    if (adminIndex === -1) {
      logger.info(`ℹ️ ${userEmail} n'était pas admin de l'événement ${eventId}`)
      return true
    }
    
    eventAdmins.splice(adminIndex, 1)
    
    // Mettre à jour le document
    await firestoreService.updateDocument('seasons', seasonId, {
      'eventAdmins': eventAdmins
    }, 'events', eventId)
    
    // Invalider le cache des permissions
    permissionService.invalidateEventCache(eventId, seasonId)
    // Invalider aussi le cache global pour forcer le rechargement des permissions
    permissionService.invalidateAllCache()
    
    logger.info(`✅ Admin ${userEmail} retiré de l'événement ${eventId}`)
    return true
  } catch (error) {
    logger.error(`❌ Erreur lors du retrait de l'admin ${userEmail} de l'événement ${eventId}:`, error)
    throw error
  }
}
