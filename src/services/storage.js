// storage.js
import { db } from './firebase.js'
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'

let mode = 'mock' // or 'firebase'

const playersList = [
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

const eventList = [
  { id: 'event1', title: 'Apérock Septembre', date: '2025-09-08' },
  { id: 'event2', title: 'Match à Cambo', date: '2025-11-25' },
  { id: 'event3', title: 'Impro des Familles', date: '2025-12-02' },
  { id: 'event4', title: 'Cabaret Surprise', date: '2026-01-20' },
  { id: 'event5', title: 'Impro Plage', date: '2026-03-10' }
]

export function setStorageMode(value) {
  mode = value
}

export async function loadEvents() {
  const events = mode === 'firebase' 
    ? (await getDocs(collection(db, 'events'))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
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

export async function loadPlayers() {
  const players = mode === 'firebase' 
    ? (await getDocs(collection(db, 'players'))).docs.map(doc => ({ id: doc.id, ...doc.data() }))
    : playersList

  // Tri par order puis par nom
  return players.sort((a, b) => {
    if (a.order < b.order) return -1
    if (a.order > b.order) return 1
    return a.name.localeCompare(b.name)
  })
}

export async function reorderPlayersAlphabetically() {
  if (mode === 'firebase') {
    const playersSnap = await getDocs(collection(db, 'players'))
    const players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Trier par nom
    const sortedPlayers = players.sort((a, b) => a.name.localeCompare(b.name))
    
    // Mettre à jour les ordres
    const batch = writeBatch(db)
    sortedPlayers.forEach((player, index) => {
      batch.update(doc(db, 'players', player.id), { order: index })
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

export async function addPlayer(name) {
  if (mode === 'firebase') {
    const newDocRef = doc(collection(db, 'players'))
    await setDoc(newDocRef, { name })
    return newDocRef.id
  } else {
    const newId = `p${playersList.length + 1}`
    playersList.push({ id: newId, name })
    return newId
  }
}

export async function deletePlayer(playerId) {
  if (mode === 'firebase') {
    await deleteDoc(doc(db, 'players', playerId))
    // Supprimer les disponibilités pour ce joueur
    const availabilitySnap = await getDocs(collection(db, 'availability'))
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

export async function updatePlayer(playerId, newName) {
  if (mode === 'firebase') {
    await setDoc(doc(db, 'players', playerId), { name: newName })
  } else {
    const index = playersList.findIndex(player => player.id === playerId)
    if (index !== -1) {
      playersList[index] = newName
    }
  }
}

export async function loadAvailability(players, events) {
  if (mode === 'firebase') {
    const availabilitySnap = await getDocs(collection(db, 'availability'))
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

export async function loadSelections() {
  if (mode === 'firebase') {
    const selSnap = await getDocs(collection(db, 'selections'))
    const res = {}
    selSnap.forEach(doc => {
      res[doc.id] = doc.data().players || []
    })
    return res
  } else {
    return {} // initially empty
  }
}

export async function saveAvailability(player, availabilityMap) {
  if (mode === 'firebase') {
    await setDoc(doc(db, 'availability', player), availabilityMap)
  }
}

export async function saveSelection(eventId, players) {
  if (mode === 'firebase') {
    await setDoc(doc(db, 'selections', eventId), { players })
  }
}

export async function deleteEvent(eventId) {
  console.log('Suppression de l\'événement:', eventId)
  
  if (mode === 'firebase') {
    try {
      // Supprimer l'événement
      console.log('Suppression de l\'événement dans Firestore')
      await deleteDoc(doc(db, 'events', eventId))
      
      // Supprimer la sélection associée
      console.log('Suppression de la sélection associée')
      await deleteDoc(doc(db, 'selections', eventId))
      
      // Supprimer les disponibilités pour cet événement
      console.log('Suppression des disponibilités')
      const availabilitySnap = await getDocs(collection(db, 'availability'))
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



export async function saveEvent(eventData) {
  if (mode === 'firebase') {
    const newDocRef = doc(collection(db, 'events'))
    await setDoc(newDocRef, eventData)
    return newDocRef.id
  } else {
    // Pour le mode mock, on génère un nouvel ID
    const newId = `event${eventList.length + 1}`
    eventList.push({ id: newId, ...eventData })
    return newId
  }
}

export async function updateEvent(eventId, eventData) {
  if (mode === 'firebase') {
    await setDoc(doc(db, 'events', eventId), eventData)
  } else {
    // Pour le mode mock, on met à jour l'événement
    const index = eventList.findIndex(event => event.id === eventId)
    if (index !== -1) {
      eventList[index] = { id: eventId, ...eventData }
    }
  }
}
