// storage.js
import { db } from './firebase.js'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'

let mode = 'mock' // or 'firebase'

const playersList = [
  'Alice', 'Bob', 'Charlie', 'David', 'Eva',
  'Fanny', 'Georges', 'Hélène', 'Ismaël', 'Jade',
  'Karim', 'Léa', 'Marc', 'Nina', 'Oscar'
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
  if (mode === 'firebase') {
    const eventsSnap = await getDocs(collection(db, 'events'))
    return eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } else {
    return eventList
  }
}

export async function loadPlayers() {
  if (mode === 'firebase') {
    const playersSnap = await getDocs(collection(db, 'players'))
    return playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } else {
    return playersList.map((name, i) => ({ id: `p${i + 1}`, name }))
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
