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
  let events
  if (mode === 'firebase') {
    if (seasonId) {
      const eventsSnap = await getDocs(collection(db, 'seasons', seasonId, 'events'))
      events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } else {
      const eventsSnap = await getDocs(collection(db, 'events'))
      events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
  let players
  if (mode === 'firebase') {
    if (seasonId) {
      const playersSnap = await getDocs(collection(db, 'seasons', seasonId, 'players'))
      players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } else {
      const playersSnap = await getDocs(collection(db, 'players'))
      players = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
      const data = doc.data()
      res[doc.id] = {
        players: data.players || [],
        confirmed: data.confirmed || false,
        confirmedAt: data.confirmedAt || null,
        updatedAt: data.updatedAt || null
      }
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
  console.log('🔍 saveSelection appelé:', { eventId, players, seasonId })
  
  try {
    if (mode === 'firebase') {
      console.log('🔥 Mode Firebase activé')
      
      const selRef = seasonId
        ? doc(db, 'seasons', seasonId, 'selections', eventId)
        : doc(db, 'selections', eventId)
      
      console.log('🔍 Référence sélection:', selRef.path)
      
      // Récupérer l'ancienne sélection pour comparer
      console.log('📖 Récupération ancienne sélection...')
      const oldSelectionDoc = await getDoc(selRef)
      console.log('📄 Document récupéré:', { 
        exists: oldSelectionDoc.exists, 
        hasData: !!oldSelectionDoc.data(),
        data: oldSelectionDoc.data()
      })
      
      const oldSelection = oldSelectionDoc.exists && oldSelectionDoc.data() 
        ? (oldSelectionDoc.data().players || []) 
        : []
      
      console.log('🔍 Ancienne sélection:', oldSelection)
      console.log('🔍 Nouvelle sélection:', players)
      
      // Sauvegarder la nouvelle sélection avec confirmed = false par défaut
      console.log('💾 Sauvegarde...')
      const selectionData = { 
        players,
        confirmed: false, // Nouvelle sélection = non confirmée
        updatedAt: serverTimestamp()
      }
      await setDoc(selRef, selectionData)
      console.log('✅ Sélection sauvegardée avec succès')
      
      // Gérer les rappels automatiques
      try {
        console.log('🔄 Début gestion des rappels automatiques')
        if (seasonId) {
          console.log('📅 Récupération des infos événement et saison')
          // Récupérer les informations de l'événement et de la saison
          const eventRef = doc(db, 'seasons', seasonId, 'events', eventId)
          const seasonRef = doc(db, 'seasons', seasonId)
          
          console.log('🔍 Références:', { eventRef: eventRef.path, seasonRef: seasonRef.path })
          
          const [eventSnap, seasonSnap] = await Promise.all([
            getDoc(eventRef),
            getDoc(seasonRef)
          ])
          
          console.log('📄 Documents récupérés:', { 
            eventExists: eventSnap.exists, 
            seasonExists: seasonSnap.exists 
          })
          
          if (eventSnap.exists && seasonSnap.exists) {
            const eventData = eventSnap.data()
            const seasonData = seasonSnap.data()
            
            console.log('📊 Données récupérées:', {
              eventTitle: eventData.title,
              eventDate: eventData.date,
              seasonSlug: seasonData.slug
            })
            
            // Supprimer les rappels pour les joueurs désélectionnés
            const removedPlayers = oldSelection.filter(name => !players.includes(name))
            console.log('🗑️ Joueurs à désélectionner:', removedPlayers)
            
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
            console.log('🆕 Nouveaux joueurs sélectionnés:', newPlayers)
            
            // Créer les rappels pour les nouveaux joueurs sélectionnés
            for (const playerName of newPlayers) {
              try {
                console.log(`📧 Création rappels pour ${playerName}...`)
                // Récupérer l'email du joueur depuis playerProtection
                const { getPlayerEmail } = await import('./playerProtection.js')
                const playerEmail = await getPlayerEmail(playerName, seasonId)
                console.log(`📧 Email pour ${playerName}:`, playerEmail ? `✅ ${playerEmail}` : '❌ null')
                
                if (playerEmail) {
                  console.log(`🎯 Création rappels pour ${playerName} (${playerEmail})`)
                  const result = await createRemindersForSelection({
                    seasonId,
                    eventId,
                    playerEmail: playerEmail,
                    playerName: playerName,
                    eventTitle: eventData.title,
                    eventDate: eventData.date,
                    seasonSlug: seasonData.slug
                  })
                  console.log(`✅ Rappels créés pour ${playerName}:`, result)
                } else {
                  console.log(`⚠️ Pas d'email pour ${playerName}, rappels non créés`)
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
    
    console.log('✅ saveSelection terminé avec succès')
  } catch (error) {
    console.error('❌ Erreur dans saveSelection:', error)
    throw error
  }
}

/**
 * Confirmer une sélection (la verrouille)
 */
export async function confirmSelection(eventId, seasonId = null) {
  console.log('🔒 confirmSelection appelé:', { eventId, seasonId })
  
  try {
    if (mode === 'firebase') {
      const selRef = seasonId
        ? doc(db, 'seasons', seasonId, 'selections', eventId)
        : doc(db, 'selections', eventId)
      
      await updateDoc(selRef, { 
        confirmed: true,
        confirmedAt: serverTimestamp()
      })
      
      console.log('✅ Sélection confirmée avec succès')
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
  console.log('🔓 unconfirmSelection appelé:', { eventId, seasonId })
  
  try {
    if (mode === 'firebase') {
      const selRef = seasonId
        ? doc(db, 'seasons', seasonId, 'selections', eventId)
        : doc(db, 'selections', eventId)
      
      await updateDoc(selRef, { 
        confirmed: false,
        confirmedAt: null
      })
      
      console.log('✅ Confirmation de sélection annulée avec succès')
    } else {
      console.log('🎭 Mode mock activé')
    }
  } catch (error) {
    console.error('❌ Erreur dans unconfirmSelection:', error)
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
