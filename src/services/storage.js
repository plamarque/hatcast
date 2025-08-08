// storage.js
import { db } from './firebase.js'
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore'

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

export function setStorageMode(value) {
  mode = value
}

// Migration automatique des données globales vers la structure multi-saison
export async function migrateToSeasons() {
  if (mode !== 'firebase') return

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
}

// Appeler la migration au démarrage si firebase
export async function initializeStorage() {
  if (mode === 'firebase') {
    await migrateToSeasons()
  }
}

export async function loadEvents(seasonId = null) {
  const events = mode === 'firebase' 
    ? seasonId 
      ? (await getDocs(collection(db, 'seasons', seasonId, 'events'))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
      : (await getDocs(collection(db, 'events'))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
    : eventList

  // Tri des événements par date (croissant) puis par titre (alphabétique)
  return events.sort((a, b) => {
    // Comparer les dates
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateA < dateB) return -1
    if (dateA > dateB) return 1
    
    // Si les dates sont égales, comparer les titres
    return a.title.localeCompare(b.title)
  })
}

export async function loadPlayers(seasonId = null) {
  const players = mode === 'firebase' 
    ? seasonId
      ? (await getDocs(collection(db, 'seasons', seasonId, 'players'))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
      : (await getDocs(collection(db, 'players'))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
    : playersList

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
    await setDoc(playerRef, { name: newName })
  } else {
    const index = playersList.findIndex(player => player.id === playerId)
    if (index !== -1) {
      playersList[index] = newName
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
      availability[doc.id] = doc.data()
    })
    return availability
  } else {
    // Random mock generation
    const availability = {}
    players.forEach(p => {
      availability[p.name] = {}
      events.forEach(e => {
        availability[p.name][e.id] = undefined
      })
    })

    events.forEach(event => {
      const shuffled = [...players].sort(() => 0.5 - Math.random())
      shuffled.slice(0, 4).forEach(p => {
        availability[p.name][event.id] = true
      })
      shuffled.slice(4).forEach(p => {
        const rand = Math.random()
        availability[p.name][event.id] = rand < 0.4 ? true : rand < 0.8 ? false : undefined
      })
    })

    return availability
  }
}

export async function loadSelections(seasonId = null) {
  if (mode === 'firebase') {
    const selSnap = seasonId
      ? await getDocs(collection(db, 'seasons', seasonId, 'selections'))
      : await getDocs(collection(db, 'selections'))
    const res = {}
    selSnap.forEach(doc => {
      res[doc.id] = doc.data().players || []
    })
    return res
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
    next[eventId] = value
  }
  await setDoc(availRef, next)
}

export async function saveSelection(eventId, players, seasonId = null) {
  if (mode === 'firebase') {
    const selRef = seasonId
      ? doc(db, 'seasons', seasonId, 'selections', eventId)
      : doc(db, 'selections', eventId)
    await setDoc(selRef, { players })
  }
}

export async function deleteEvent(eventId, seasonId = null) {
  console.log('Suppression de l\'événement:', eventId)
  
  if (mode === 'firebase') {
    try {
      // Supprimer l'événement
      console.log('Suppression de l\'événement dans Firestore')
      const eventRef = seasonId
        ? doc(db, 'seasons', seasonId, 'events', eventId)
        : doc(db, 'events', eventId)
      await deleteDoc(eventRef)
      
      // Supprimer la sélection associée
      console.log('Suppression de la sélection associée')
      const selRef = seasonId
        ? doc(db, 'seasons', seasonId, 'selections', eventId)
        : doc(db, 'selections', eventId)
      await deleteDoc(selRef)
      
      // Supprimer les disponibilités pour cet événement
      console.log('Suppression des disponibilités')
      const availabilitySnap = seasonId
        ? await getDocs(collection(db, 'seasons', seasonId, 'availability'))
        : await getDocs(collection(db, 'availability'))
      const batch = writeBatch(db)
      
      availabilitySnap.forEach(doc => {
        const availabilityData = doc.data()
        if (availabilityData[eventId] !== undefined) {
          console.log('Mise à jour de la disponibilité pour:', doc.id)
          const updatedData = { ...availabilityData }
          delete updatedData[eventId]
          batch.update(doc.ref, updatedData)
        }
      })
      
      await batch.commit()
      console.log('Opérations de suppression terminées avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw error
    }
  } else {
    // Pour le mode mock, on supprime simplement l'événement
    eventList = eventList.filter(event => event.id !== eventId)
  }
}

export async function saveEvent(eventData, seasonId = null) {
  if (mode === 'firebase') {
    const newDocRef = seasonId
      ? doc(collection(db, 'seasons', seasonId, 'events'))
      : doc(collection(db, 'events'))
    await setDoc(newDocRef, eventData)
    return newDocRef.id
  } else {
    // Pour le mode mock, on génère un nouvel ID
    const newId = `event${eventList.length + 1}`
    eventList.push({ id: newId, ...eventData })
    return newId
  }
}

export async function updateEvent(eventId, eventData, seasonId = null) {
  if (mode === 'firebase') {
    const eventRef = seasonId
      ? doc(db, 'seasons', seasonId, 'events', eventId)
      : doc(db, 'events', eventId)
    await setDoc(eventRef, eventData)
  } else {
    // Pour le mode mock, on met à jour l'événement
    const index = eventList.findIndex(event => event.id === eventId)
    if (index !== -1) {
      eventList[index] = { id: eventId, ...eventData }
    }
  }
}
