// storage.js
import { db } from './firebase.js'
import logger from './logger.js'
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore'
import { createRemindersForSelection, removeRemindersForPlayer } from './reminderService.js'

let mode = 'mock' // or 'firebase'

let playersList = [
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' },
  { id: 'p3', name: 'Charlie' },
  { id: 'p4', name: 'David' },
  { id: 'p5', name: 'Eva' },
  { id: 'p6', name: 'Fanny' },
  { id: 'p7', name: 'Georges' },
  { id: 'p8', name: 'Hélène' },
  { id: 'p9', name: 'Ismaël' },
  { id: 'p10', name: 'Jade' },
  { id: 'p11', name: 'Karim' },
  { id: 'p12', name: 'Léa' },
  { id: 'p13', name: 'Marc' },
  { id: 'p14', name: 'Nina' },
  { id: 'p15', name: 'Oscar' }
]

let eventList = [
  { id: 'event1', title: 'Apérock Septembre', date: '2025-09-08', description: 'Soirée apéro-rock avec ambiance festive' },
  { id: 'event2', title: 'Match à Cambo', date: '2025-11-25', description: 'Match d\'improvisation compétitif à Cambo-les-Bains' },
  { id: 'event3', title: 'Impro des Familles', date: '2025-12-02', description: 'Spectacle d\'improvisation pour toute la famille' },
  { id: 'event4', title: 'Cabaret Surprise', date: '2026-01-20', description: 'Cabaret avec des surprises et des performances uniques' },
  { id: 'event5', title: 'Impro Plage', date: '2026-03-10', description: 'Improvisation en plein air avec vue sur la plage' }
]

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

export function setStorageMode(value) {
  console.log('🔧 setStorageMode appelé avec:', value);
  mode = value
  console.log('🔧 Mode de stockage défini à:', mode);
}

// Migration automatique des données globales vers la structure multi-saison
export async function migrateToSeasons() {
  if (mode !== 'firebase') return

  try {
    // Vérifier si la collection 'seasons' est vide
    const seasonsSnap = await getDocs(collection(db, 'seasons'))
    if (!seasonsSnap.empty) return // Déjà migré

    // Créer la saison 'Malice 2025-2026'
    const seasonRef = doc(collection(db, 'seasons'))
    await setDoc(seasonRef, {
      name: 'Malice 2025-2026',
      slug: 'malice-2025-2026',
      createdAt: serverTimestamp(),
    })

    // Copier les joueurs
    const playersSnap = await getDocs(collection(db, 'players'))
    for (const playerDoc of playersSnap.docs) {
      await setDoc(doc(seasonRef, 'players', playerDoc.id), playerDoc.data())
    }

    // Copier les événements
    const eventsSnap = await getDocs(collection(db, 'events'))
    for (const eventDoc of eventsSnap.docs) {
      await setDoc(doc(seasonRef, 'events', eventDoc.id), eventDoc.data())
    }

    // Copier les disponibilités
    const availSnap = await getDocs(collection(db, 'availability'))
    for (const availDoc of availSnap.docs) {
      await setDoc(doc(seasonRef, 'availability', availDoc.id), availDoc.data())
    }

    // Copier les sélections
    const selSnap = await getDocs(collection(db, 'selections'))
    for (const selDoc of selSnap.docs) {
      await setDoc(doc(seasonRef, 'selections', selDoc.id), selDoc.data())
    }

    // (Optionnel) : tu pourras supprimer manuellement les anciennes collections après vérification
  } catch (error) {
    console.warn('⚠️ Erreur lors de la migration des données:', error)
  }
}

// Initialisation automatique pour base vide (staging/development)
export async function initializeEmptyDatabase() {
  if (mode !== 'firebase') return

  try {
    // Vérifier si la collection 'seasons' est vide
    const seasonsSnap = await getDocs(collection(db, 'seasons'))
    if (!seasonsSnap.empty) return // Déjà des données

    console.log('🌱 Base vide détectée, création d\'une saison de test...')
    
    // Créer une saison de test pour staging/development
    const seasonRef = doc(collection(db, 'seasons'))
    await setDoc(seasonRef, {
      name: 'Saison de Test',
      slug: 'saison-test',
      description: 'Saison créée automatiquement pour tester l\'application',
      createdAt: serverTimestamp(),
      sortOrder: 1
    })

    console.log('✅ Saison de test créée avec succès')
  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'initialisation de la base vide:', error)
  }
}

// Appeler la migration au démarrage si firebase
export async function initializeStorage() {
  if (mode === 'firebase') {
    try {
      // Essayer d'abord la migration des données existantes
      await migrateToSeasons()
      
      // Si la base est vide, initialiser avec des données de test
      await initializeEmptyDatabase()
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'initialisation du stockage:', error)
    }
  }
}

export async function loadEvents(seasonId = null) {
  console.log('🔧 loadEvents appelé avec mode:', mode, 'seasonId:', seasonId);
  let events
  if (mode === 'firebase') {
    try {
      if (seasonId) {
        const eventsSnap = await getDocs(collection(db, 'seasons', seasonId, 'events'))
        events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      } else {
        const eventsSnap = await getDocs(collection(db, 'events'))
        events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } catch (error) {
      // Gestion robuste des erreurs : collection inexistante = base vide
      if (error.code === 'permission-denied' || error.code === 'not-found') {
        console.log('🔍 Collection events non trouvée ou vide, retour d\'un tableau vide')
        events = []
      } else {
        console.error('Erreur lors du chargement des événements:', error)
        events = []
      }
    }
  } else {
    events = eventList
  }

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

export async function loadPlayers(seasonId = null) {
  console.log('🔧 loadPlayers appelé avec mode:', mode, 'seasonId:', seasonId);
  let players
  if (mode === 'firebase') {
    try {
      if (seasonId) {
        const playersSnap = await getDocs(collection(db, 'seasons', seasonId, 'players'))
        players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      } else {
        const playersSnap = await getDocs(collection(db, 'players'))
        players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } catch (error) {
      // Gestion robuste des erreurs : collection inexistante = base vide
      if (error.code === 'permission-denied' || error.code === 'not-found') {
        console.log('🔍 Collection players non trouvée ou vide, retour d\'un tableau vide')
        players = []
      } else {
        console.error('Erreur lors du chargement des joueurs:', error)
        players = []
      }
    }
  } else {
    players = playersList
  }

  // Tri par order puis par nom
  return players.sort((a, b) => {
    if (a.order < b.order) return -1
    if (a.order > b.order) return 1
    return a.name.localeCompare(b.name)
  })
}

export async function reorderPlayersAlphabetically(seasonId = null) {
  if (mode === 'firebase') {
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
  } else {
    // Pour le mode mock, trier simplement le tableau
    playersList.sort((a, b) => a.name.localeCompare(b.name))
    playersList.forEach((player, index) => {
      player.order = index
    })
  }
}

export async function addPlayer(name, seasonId = null) {
  if (mode === 'firebase') {
    const newDocRef = seasonId
      ? doc(collection(db, 'seasons', seasonId, 'players'))
      : doc(collection(db, 'players'))
    await setDoc(newDocRef, { name })
    return newDocRef.id
  } else {
    const newId = `p${playersList.length + 1}`
    playersList.push({ id: newId, name })
    return newId
  }
}

export async function deletePlayer(playerId, seasonId = null) {
  if (mode === 'firebase') {
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
  } else {
    playersList = playersList.filter(player => player.id !== playerId)
  }
}

export async function updatePlayer(playerId, newName, seasonId = null) {
  if (mode === 'firebase') {
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
  } else {
    const index = playersList.findIndex(player => player.id === playerId)
    if (index !== -1) {
      // Conserver l'objet joueur et ne modifier que le nom
      playersList[index] = { ...playersList[index], name: newName }
    }
  }
}

export async function loadAvailability(players, events, seasonId = null) {
  if (mode === 'firebase') {
    const availabilitySnap = seasonId
      ? await getDocs(collection(db, 'seasons', seasonId, 'availability'))
      : await getDocs(collection(db, 'availability'))
    const availability = {}
    availabilitySnap.forEach(doc => {
      const data = doc.data()
      const migratedData = {}
      
      // Migration des anciennes disponibilités vers le nouveau format
      Object.keys(data).forEach(eventId => {
        const value = data[eventId]
        if (eventId === 'updatedAt') {
          migratedData[eventId] = value
        } else {
          // Migration : ancien format (boolean) vers nouveau format (objet)
          if (typeof value === 'boolean' || value === null || value === undefined) {
            // Ancien format : juste un boolean
            migratedData[eventId] = {
              available: value === true,
              roles: value === true ? [ROLES.PLAYER] : [],
              comment: null
            }
          } else if (typeof value === 'object' && value !== null) {
            // Nouveau format : déjà migré
            migratedData[eventId] = {
              available: value.available ?? (value.roles && value.roles.length > 0),
              roles: value.roles || [],
              comment: value.comment || null
            }
          } else {
            // Fallback pour les cas inattendus
            migratedData[eventId] = {
              available: false,
              roles: [],
              comment: null
            }
          }
        }
      })
      
      availability[doc.id] = migratedData
    })
    return availability
  } else {
    // Random mock generation avec nouveau format
    const availability = {}
    players.forEach(p => {
      availability[p.name] = {}
      events.forEach(e => {
        availability[p.name][e.id] = {
          available: undefined,
          roles: [],
          comment: null
        }
      })
    })

    events.forEach(event => {
      const shuffled = [...players].sort(() => 0.5 - Math.random())
      shuffled.slice(0, 4).forEach(p => {
        availability[p.name][event.id] = {
          available: true,
          roles: [ROLES.PLAYER],
          comment: null
        }
      })
      shuffled.slice(4).forEach(p => {
        const rand = Math.random()
        if (rand < 0.4) {
          availability[p.name][event.id] = {
            available: true,
            roles: [ROLES.PLAYER],
            comment: null
          }
        } else if (rand < 0.8) {
          availability[p.name][event.id] = {
            available: false,
            roles: [],
            comment: null
          }
        } else {
          availability[p.name][event.id] = {
            available: undefined,
            roles: [],
            comment: null
          }
        }
      })
    })

    return availability
  }
}

export async function loadSelections(seasonId = null) {
  if (mode === 'firebase') {
    try {
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
    } catch (error) {
      // Si la collection n'existe pas encore, retourner un objet vide
      console.log('🔍 loadSelections - Collection selections non trouvée, utilisation de la structure vide')
      return {}
    }
  } else {
    return {} // initially empty
  }
}

export async function saveAvailability(player, availabilityMap, seasonId = null) {
  if (mode === 'firebase') {
    const availRef = seasonId
      ? doc(db, 'seasons', seasonId, 'availability', player)
      : doc(db, 'availability', player)
    await setDoc(availRef, availabilityMap)
  }
}

// Nouvelle fonction pour sauvegarder une disponibilité avec rôles et commentaire
export async function saveAvailabilityWithRoles({ seasonId, playerName, eventId, available, roles = [], comment = null }) {
  if (mode !== 'firebase') return
  
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
}

// Mise à jour ciblée d'une disponibilité pour un joueur/événement (utilisé par magic links)
export async function setSingleAvailability({ seasonId, playerName, eventId, value }) {
  if (mode !== 'firebase') return
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
    if (mode === 'firebase') {
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
            const removedPlayers = oldSelection.filter(name => !players.includes(name))
            
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
            const newPlayers = players.filter(name => !oldSelection.includes(name))
            
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
    } else {
      console.log('🎭 Mode mock activé')
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
    if (mode === 'firebase') {
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
    } else {
      console.log('🎭 Mode mock activé')
    }
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
    if (mode === 'firebase') {
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
    } else {
      console.log('🎭 Mode mock activé')
    }
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
    if (mode === 'firebase') {
      const selRef = seasonId
        ? doc(db, 'seasons', seasonId, 'selections', eventId)
        : doc(db, 'selections', eventId)
      
      // Supprimer complètement le document de sélection
      await deleteDoc(selRef)
      
      console.log('✅ Sélection supprimée avec succès')
    } else {
      console.log('🎭 Mode mock activé')
    }
  } catch (error) {
    console.error('❌ Erreur dans deleteSelection:', error)
    throw error
  }
}

export async function deleteEvent(eventId, seasonId = null) {
  logger.info('Suppression de l\'événement', { eventId })
  
  if (mode === 'firebase') {
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
  } else {
    // Pour le mode mock, on supprime simplement l'événement
    eventList = eventList.filter(event => event.id !== eventId)
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
  
  if (mode === 'firebase') {
    const newDocRef = seasonId
      ? doc(collection(db, 'seasons', seasonId, 'events'))
      : doc(collection(db, 'events'))
    await setDoc(newDocRef, eventWithRoles)
    return newDocRef.id
  } else {
    // Pour le mode mock, on génère un nouvel ID
    const newId = `event${eventList.length + 1}`
    eventList.push({ id: newId, ...eventWithRoles })
    return newId
  }
}

export async function updateEvent(eventId, eventData, seasonId = null) {
  if (mode === 'firebase') {
    const eventRef = seasonId
      ? doc(db, 'seasons', seasonId, 'events', eventId)
      : doc(db, 'events', eventId)
    // Utiliser merge pour ne pas écraser des champs existants (ex: archived)
    await setDoc(eventRef, eventData, { merge: true })
  } else {
    // Pour le mode mock, on met à jour l'événement
    const index = eventList.findIndex(event => event.id === eventId)
    if (index !== -1) {
      eventList[index] = { id: eventId, ...eventData }
    }
  }
}

// Mise à jour de l'état d'archivage d'un événement
export async function setEventArchived(eventId, archived, seasonId = null) {
  if (mode === 'firebase') {
    const eventRef = seasonId
      ? doc(db, 'seasons', seasonId, 'events', eventId)
      : doc(db, 'events', eventId)
    await updateDoc(eventRef, { archived: !!archived })
  } else {
    const idx = eventList.findIndex(e => e.id === eventId)
    if (idx !== -1) {
      eventList[idx] = { ...eventList[idx], archived: !!archived }
    }
  }
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
    if (mode === 'firebase') {
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
    } else {
      console.log('🎭 Mode mock activé')
      return { confirmedByAllPlayers: false }
    }
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
    if (mode === 'firebase') {
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
    } else {
      return false
    }
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
