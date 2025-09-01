// storage.js
import { db } from './firebase.js'
import logger from './logger.js'
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore'
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
  [ROLES.PLAYER]: 'Comédiens',
  [ROLES.VOLUNTEER]: 'Volontaires',
  [ROLES.MC]: 'MC',
  [ROLES.DJ]: 'DJ',
  [ROLES.REFEREE]: 'Arbitre',
  [ROLES.ASSISTANT_REFEREE]: 'Assistant',
  [ROLES.LIGHTING]: 'Lumière',
  [ROLES.COACH]: 'Coach',
  [ROLES.STAGE_MANAGER]: 'Régisseur'
}

// Labels au singulier pour les modales de disponibilité (individuelles)
export const ROLE_LABELS_SINGULAR = {
  [ROLES.PLAYER]: 'Comédien',
  [ROLES.VOLUNTEER]: 'Volontaire',
  [ROLES.MC]: 'MC',
  [ROLES.DJ]: 'DJ',
  [ROLES.REFEREE]: 'Arbitre',
  [ROLES.ASSISTANT_REFEREE]: 'Assistant',
  [ROLES.LIGHTING]: 'Lumière',
  [ROLES.COACH]: 'Coach',
  [ROLES.STAGE_MANAGER]: 'Régisseur'
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
    description: 'Spectacle avec MC et DJ',
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
  custom: {
    name: 'Autre',
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
export const TEMPLATE_DISPLAY_ORDER = ['cabaret', 'match', 'deplacement', 'custom']

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

export async function reorderPlayersAlphabetically(seasonId = null) {
  const playersSnap = seasonId
    ? await getDocs(collection(db, 'seasons', seasonId, 'players'))
    : await getDocs(collection(db, 'players'))
  const players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  // Trier par nom
  const sortedPlayers = players.sort((a, b) => a.name.localeCompare(b.name))
  
  // Mettre à jour les ordres
  const batch = writeBatch(db)
  sortedPlayers.forEach((player, index) => {
    const playerRef = seasonId
      ? doc(db, 'seasons', seasonId, 'players', player.id)
      : doc(db, 'players', player.id)
    batch.update(playerRef, { order: index })
  })
  await batch.commit()
}

export async function addPlayer(name, seasonId = null) {
  const newDocRef = seasonId
    ? doc(collection(db, 'seasons', seasonId, 'players'))
    : doc(collection(db, 'players'))
  await setDoc(newDocRef, { name })
  return newDocRef.id
}

export async function deletePlayer(playerId, seasonId = null) {
  const playerRef = seasonId
    ? doc(db, 'seasons', seasonId, 'players', playerId)
    : doc(db, 'players', playerId)
  await deleteDoc(playerRef)
  
  // Supprimer les disponibilités pour ce joueur
  const availabilitySnap = seasonId
    ? await getDocs(collection(db, 'seasons', seasonId, 'availability'))
    : await getDocs(collection(db, 'availability'))
  const batch = writeBatch(db)
  availabilitySnap.forEach(doc => {
    const availabilityData = doc.data()
    if (availabilityData[playerId] !== undefined) {
      const updatedData = { ...availabilityData }
      delete updatedData[playerId]
      batch.update(doc.ref, updatedData)
    }
  })
  await batch.commit()
}

export async function updatePlayer(playerId, newName, seasonId = null) {
  const playerRef = seasonId
    ? doc(db, 'seasons', seasonId, 'players', playerId)
    : doc(db, 'players', playerId)

  // Lire l'ancien nom (si existant) avant mise à jour
  const prevSnap = await getDoc(playerRef)
  const oldName = prevSnap.exists() ? (prevSnap.data().name || null) : null

  // Mettre à jour uniquement le nom et préserver les autres champs. Crée le doc s'il n'existe pas.
  await setDoc(playerRef, { name: newName }, { merge: true })

  // Si le nom change, renommer les dépendances (availability + selections)
  if (oldName && oldName !== newName) {
    const batch = writeBatch(db)

    // Renommer le document de disponibilités (clé = nom du joueur)
    try {
      const availRefOld = seasonId
        ? doc(db, 'seasons', seasonId, 'availability', oldName)
        : doc(db, 'availability', oldName)
      const availSnap = await getDoc(availRefOld)
      if (availSnap.exists()) {
        const data = availSnap.data() || {}
        const availRefNew = seasonId
          ? doc(db, 'seasons', seasonId, 'availability', newName)
          : doc(db, 'availability', newName)
        batch.set(availRefNew, data, { merge: true })
        batch.delete(availRefOld)
      }
    } catch (_) {}

    // Mettre à jour les sélections (tableaux de noms)
    try {
      const selCol = seasonId
        ? collection(db, 'seasons', seasonId, 'selections')
        : collection(db, 'selections')
      const selSnap = await getDocs(selCol)
      selSnap.forEach((d) => {
        const arr = Array.isArray(d.data()?.players) ? d.data().players : []
        if (arr.includes(oldName)) {
          const next = arr.map((n) => (n === oldName ? newName : n))
          batch.update(d.ref, { players: next })
        }
      })
    } catch (_) {}

    await batch.commit()
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

export async function loadSelections(seasonId = null) {
  const selSnap = seasonId
    ? await getDocs(collection(db, 'seasons', seasonId, 'selections'))
    : await getDocs(collection(db, 'selections'))
  const res = {}
  selSnap.forEach(doc => {
    const data = doc.data()
    
    // Migration automatique vers le nouveau format si nécessaire
    let roles = data.roles
    if (!roles && data.players && Array.isArray(data.players)) {
      // Ancien format : créer la structure par rôle
      roles = { player: data.players }
    }
    
    res[doc.id] = {
      players: data.players || [],
      roles: roles || {},
      confirmed: data.confirmed || false,
      confirmedAt: data.confirmedAt || null,
      updatedAt: data.updatedAt || null,
      playerStatuses: data.playerStatuses || {},
      confirmedByAllPlayers: data.confirmedByAllPlayers || false
    }
  })
  return res
}

export async function saveAvailability(player, availabilityMap, seasonId = null) {
  const availRef = seasonId
    ? doc(db, 'seasons', seasonId, 'availability', player)
    : doc(db, 'availability', player)
  await setDoc(availRef, availabilityMap)
}

// Nouvelle fonction pour sauvegarder une disponibilité avec rôles et commentaire
export async function saveAvailabilityWithRoles({ seasonId, playerName, eventId, available, roles = [], comment = null }) {
  try {
    // Utiliser directement l'API Firebase pour les sous-collections avec ID spécifique
    const availRef = seasonId
      ? doc(db, 'seasons', seasonId, 'availability', playerName)
      : doc(db, 'availability', playerName)
    
    const snap = await getDoc(availRef)
    const current = snap.exists() ? snap.data() : {}
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
    
    await setDoc(availRef, next)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la disponibilité avec rôles:', error)
    throw error
  }
}

// Mise à jour ciblée d'une disponibilité pour un joueur/événement (utilisé par magic links)
export async function setSingleAvailability({ seasonId, playerName, eventId, value }) {
  const availRef = seasonId
    ? doc(db, 'seasons', seasonId, 'availability', playerName)
    : doc(db, 'availability', playerName)
  const snap = await getDoc(availRef)
  const current = snap.exists() ? snap.data() : {}
  const next = { ...current }
  
  if (value === undefined) {
    delete next[eventId]
  } else {
    // Migration automatique vers le nouveau format si nécessaire
    if (typeof value === 'boolean') {
      next[eventId] = {
        available: value,
        roles: value ? [ROLES.PLAYER] : [],
        comment: null
      }
    } else {
      next[eventId] = value
    }
  }
  await setDoc(availRef, next)
}

export async function saveSelection(eventId, players, seasonId = null) {
  try {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    
    // Récupérer l'ancienne sélection pour comparer
    const oldSelectionDoc = await getDoc(selRef)
    
    // Déterminer le format des données d'entrée
    let isNewFormat = false
    let allPlayers = []
    let roles = {}
    
    if (Array.isArray(players)) {
      // Ancien format : array de noms
      allPlayers = players
      roles = { player: players } // Migration automatique vers le nouveau format
    } else if (players && typeof players === 'object') {
      // Nouveau format : objet avec rôles
      isNewFormat = true
      roles = players
      // Extraire tous les joueurs de tous les rôles
      allPlayers = Object.values(players).flat().filter(Boolean)
    } else {
      throw new Error('Format de données invalide pour saveSelection')
    }
    
    const oldSelection = oldSelectionDoc.exists && oldSelectionDoc.data() 
      ? (oldSelectionDoc.data().players || []) 
      : []
    
    // Initialiser les statuts individuels des joueurs
    const playerStatuses = {}
    allPlayers.forEach(playerName => {
      playerStatuses[playerName] = 'pending' // Tous commencent en attente de confirmation
    })
    
    const selectionData = { 
      // Ancien format (rétrocompatible)
      players: allPlayers,
      
      // Nouveau format (par rôle)
      roles: isNewFormat ? roles : { player: allPlayers },
      
      confirmed: false, // Nouvelle sélection = non confirmée
      confirmedByAllPlayers: false, // Tous les joueurs n'ont pas encore confirmé
      playerStatuses, // Statuts individuels des joueurs
      updatedAt: serverTimestamp()
    }
    await setDoc(selRef, selectionData)
    
    // Gérer les rappels automatiques
    try {
      if (seasonId) {
        // Récupérer les informations de l'événement et de la saison
        const eventRef = doc(db, 'seasons', seasonId, 'events', eventId)
        const seasonRef = doc(db, 'seasons', seasonId)
        
        const [eventSnap, seasonSnap] = await Promise.all([
          getDoc(eventRef),
          getDoc(seasonRef)
        ])
        
        if (eventSnap.exists && seasonSnap.exists) {
          const eventData = eventSnap.data()
          const seasonData = seasonSnap.data()
          
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
              console.error('Erreur lors de la suppression des rappels pour', playerName, error)
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
              console.error(`❌ Erreur lors de la création des rappels pour ${playerName}:`, error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des rappels automatiques:', error)
      // Ne pas faire échouer la sauvegarde de la sélection à cause des rappels
    }
  } catch (error) {
    console.error('❌ Erreur dans saveSelection:', error)
    throw error
  }
}

/**
 * Confirmer une sélection (la verrouille)
 */
export async function confirmSelection(eventId, seasonId = null) {
  try {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    
    // Récupérer la sélection actuelle pour initialiser les statuts des joueurs
    const selectionDoc = await getDoc(selRef)
    const currentSelection = selectionDoc.exists ? selectionDoc.data() : { players: [] }
    
    // Initialiser les statuts individuels des joueurs si pas encore fait
    // Préserver les statuts "declined" existants
    const playerStatuses = currentSelection.playerStatuses || {}
    currentSelection.players.forEach((playerName, index) => {
      if (!playerStatuses[playerName]) {
        playerStatuses[playerName] = 'pending' // En attente de confirmation
      }
      // Ne pas écraser un statut "declined" existant
    })
    
    await updateDoc(selRef, { 
      confirmed: true,
      confirmedAt: serverTimestamp(),
      confirmedByAllPlayers: false, // Initialiser à false car les joueurs n'ont pas encore confirmé
      playerStatuses
    })
  } catch (error) {
    console.error('❌ Erreur dans confirmSelection:', error)
    throw error
  }
}

/**
 * Annuler la confirmation d'une sélection (admin uniquement)
 */
export async function unconfirmSelection(eventId, seasonId = null) {
  try {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    
    // Préserver TOUS les statuts des joueurs lors du déverrouillage
    const currentSelection = await getDoc(selRef)
    const currentData = currentSelection.data()
    const preservedPlayerStatuses = {}
    
    if (currentData && currentData.playerStatuses) {
      // Préserver tous les statuts existants pour garder l'historique visuel
      Object.entries(currentData.playerStatuses).forEach(([playerName, status]) => {
        // Garder le statut actuel (confirmed, declined, pending)
        preservedPlayerStatuses[playerName] = status
      })
    }
    
    // Garder TOUS les joueurs dans les slots pour préserver l'information visuelle
    const currentPlayers = Array.isArray(currentData?.players) ? currentData.players : []
    
    await updateDoc(selRef, { 
      confirmed: false,
      confirmedAt: null,
      players: currentPlayers, // Garder tous les joueurs
      playerStatuses: preservedPlayerStatuses, // Préserver tous les statuts
      confirmedByAllPlayers: false
    })
  } catch (error) {
    console.error('❌ Erreur dans unconfirmSelection:', error)
    throw error
  }
}

/**
 * Supprimer complètement une sélection (remet le statut à "Nouveau")
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison (optionnel)
 */
export async function deleteSelection(eventId, seasonId = null) {
  console.log('🗑️ deleteSelection appelé:', { eventId, seasonId })
  
  try {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    
    // Supprimer complètement le document de sélection
    await deleteDoc(selRef)
    
    console.log('✅ Sélection supprimée avec succès')
  } catch (error) {
    console.error('❌ Erreur dans deleteSelection:', error)
    throw error
  }
}

export async function deleteEvent(eventId, seasonId = null) {
  logger.info('Suppression de l\'événement', { eventId })
  
  try {
    // Supprimer l'événement
    logger.debug('Suppression de l\'événement dans Firestore')
    const eventRef = seasonId
      ? doc(db, 'seasons', seasonId, 'events', eventId)
      : doc(db, 'events', eventId)
    await deleteDoc(eventRef)
    
    // Supprimer la sélection associée
    logger.debug('Suppression de la sélection associée')
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    await deleteDoc(selRef)
    
    // Supprimer les disponibilités pour cet événement
    logger.debug('Suppression des disponibilités')
    const availabilitySnap = seasonId
      ? await getDocs(collection(db, 'seasons', seasonId, 'availability'))
      : await getDocs(collection(db, 'availability'))
    const batch = writeBatch(db)
    
    availabilitySnap.forEach(doc => {
      const availabilityData = doc.data()
      if (availabilityData[eventId] !== undefined) {
        logger.debug('Mise à jour de la disponibilité pour un joueur')
        const updatedData = { ...availabilityData }
        delete updatedData[eventId]
        batch.update(doc.ref, updatedData)
      }
    })
    
    await batch.commit()
    logger.info('Opérations de suppression terminées avec succès')
  } catch (error) {
    logger.error('Erreur lors de la suppression', error)
    throw error
  }
}

export async function saveEvent(eventData, seasonId = null) {
  // Ajouter la structure des rôles par défaut si elle n'existe pas
  const eventWithRoles = {
    ...eventData,
    roles: eventData.roles || {
      [ROLES.PLAYER]: eventData.playerCount || 6,
      [ROLES.VOLUNTEER]: 3,
      [ROLES.MC]: 1,
      [ROLES.DJ]: 1,
      [ROLES.REFEREE]: 2,
      [ROLES.ASSISTANT_REFEREE]: 2,
      [ROLES.LIGHTING]: 1,
      [ROLES.COACH]: 1,
      [ROLES.STAGE_MANAGER]: 1
    }
  }
  
  const newDocRef = seasonId
    ? doc(collection(db, 'seasons', seasonId, 'events'))
    : doc(collection(db, 'events'))
  await setDoc(newDocRef, eventWithRoles)
  return newDocRef.id
}

export async function updateEvent(eventId, eventData, seasonId = null) {
  const eventRef = seasonId
    ? doc(db, 'seasons', seasonId, 'events', eventId)
    : doc(db, 'events', eventId)
  // Utiliser merge pour ne pas écraser des champs existants (ex: archived)
  await setDoc(eventRef, eventData, { merge: true })
}

// Mise à jour de l'état d'archivage d'un événement
export async function setEventArchived(eventId, archived, seasonId = null) {
  const eventRef = seasonId
    ? doc(db, 'seasons', seasonId, 'events', eventId)
    : doc(db, 'events', eventId)
  await updateDoc(eventRef, { archived: !!archived })
}

/**
 * Mettre à jour le statut individuel d'un joueur dans une sélection
 * @param {string} eventId - ID de l'événement
 * @param {string} playerName - Nom du joueur
 * @param {string} status - Statut: 'pending', 'confirmed', 'declined'
 * @param {string} seasonId - ID de la saison (optionnel)
 */
export async function updatePlayerSelectionStatus(eventId, playerName, status, seasonId = null) {
  console.log('🔄 updatePlayerSelectionStatus appelé:', { eventId, playerName, status, seasonId })
  
  try {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    
    // Récupérer la sélection actuelle pour vérifier l'état global
    const selectionDoc = await getDoc(selRef)
    if (!selectionDoc.exists) {
      throw new Error('Sélection non trouvée')
    }
    
    const selectionData = selectionDoc.data()
    const { players = [], playerStatuses = {} } = selectionData
    
    // Mettre à jour le statut du joueur
    const updatedPlayerStatuses = { ...playerStatuses, [playerName]: status }
    
    // Vérifier si tous les joueurs ont maintenant confirmé
    const allPlayersConfirmed = players.every(playerName => 
      updatedPlayerStatuses[playerName] === 'confirmed'
    )
    
    // Mettre à jour le statut du joueur ET l'état global de la sélection
    await updateDoc(selRef, {
      [`playerStatuses.${playerName}`]: status,
      confirmedByAllPlayers: allPlayersConfirmed,
      updatedAt: serverTimestamp()
    })
    
    return { confirmedByAllPlayers: allPlayersConfirmed }
  } catch (error) {
    console.error('❌ Erreur dans updatePlayerSelectionStatus:', error)
    throw error
  }
}

/**
 * Vérifier si tous les joueurs d'une sélection ont confirmé leur participation
 * @param {string} eventId - ID de l'événement
 * @param {string} seasonId - ID de la saison (optionnel)
 * @returns {Promise<boolean>} - true si tous ont confirmé
 */
export async function isAllPlayersConfirmed(eventId, seasonId = null) {
  try {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    
    const selectionDoc = await getDoc(selRef)
    if (!selectionDoc.exists) {
      return false
    }
    
    const selectionData = selectionDoc.data()
    const { confirmedByAllPlayers = false } = selectionData
    
    // Utiliser le champ pré-calculé pour de meilleures performances
    return confirmedByAllPlayers
  } catch (error) {
    console.error('❌ Erreur dans isAllPlayersConfirmed:', error)
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
  
  // Ancien format ou fallback
  return selection.players || []
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
