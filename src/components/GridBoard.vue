<template>
  <table class="table-auto border-collapse border border-gray-400 w-full">
    <thead>
      <tr class="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider">
        <th class="p-3 text-left">Nom</th>
        <th class="p-3 text-center text-sm text-gray-700">📊 Stats</th>
        <th
          v-for="event in events"
          :key="event.id"
          class="p-3 text-center w-48 align-top"
          @mouseenter="isHovered = event.id"
          @mouseleave="isHovered = null"
          @dblclick="startEditing(event)"
        >
          <div class="flex flex-col items-center space-y-1 relative">
            <div v-if="editingEvent !== event.id" class="font-semibold text-base text-center whitespace-pre-wrap">
              {{ event.title }}
            </div>
            <div v-else class="w-full">
              <input
                v-model="editingTitle"
                type="text"
                class="w-full p-1 border rounded"
                @keydown.esc="cancelEdit"
                @keydown.enter="saveEdit"
                ref="editTitleInput"
              >
            </div>
            <div v-if="editingEvent !== event.id" class="text-xs text-gray-500">
              {{ formatDate(event.date) }}
            </div>
            <div v-else class="w-full">
              <input
                v-model="editingDate"
                type="date"
                class="w-full p-1 border rounded"
                @keydown.esc="cancelEdit"
                @keydown.enter="saveEdit"
              >
            </div>
            <button
              @click="confirmDeleteEvent(event.id)"
              class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              :class="{ 'opacity-100': isHovered === event.id }"
            >
              ❌
            </button>
          </div>
        </th>
        <th class="p-3 text-center text-gray-500">
          <button
            @click="newEventForm = true"
            class="text-gray-500 hover:text-blue-500"
            title="Ajouter un nouvel événement"
          >
            ➕
          </button>
        </th>
      </tr>
      <tr class="bg-gray-50">
        <th class="p-3 text-left"></th>
        <th class="p-3 text-center"></th>
        <th
          v-for="event in events"
          :key="event.id"
          class="p-3 text-center w-48"
        >
          <button
            @click="tirer(event.id, 6)" 
            class="px-2 py-1 rounded-md text-sm bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800"
          >
            🎭 Sélectionner
          </button>
        </th>
        <th class="p-3 text-center"></th>
      </tr>
    </thead>

    <tbody class="border-t">
      <tr
        v-for="player in players"
        :key="player.id"
        class="odd:bg-white even:bg-gray-50 border-b"
      >
        <td class="p-3 font-medium text-gray-900">{{ player.name }}</td>
        <td class="p-3 text-center text-gray-700 text-sm">
          <span :title="`${countSelections(player.name)} sélection${countSelections(player.name) > 1 ? 's' : ''}, ${countAvailability(player.name)} dispo${countAvailability(player.name) > 1 ? 's' : ''}`">
            {{ countSelections(player.name) }}/{{ countAvailability(player.name) }}
          </span>
        </td>
        <td
          v-for="event in events"
          :key="event.id"
          class="p-3 text-center cursor-pointer hover:bg-blue-100"
          @click="toggleAvailability(player.name, event.id)"
        >
          <span
            v-if="isSelected(player.name, event.id)"
            :title="getTooltipText(player, event.id)"
          >
            🎭
          </span>
          <span
            v-else-if="isAvailable(player.name, event.id)"
            :title="getTooltipText(player, event.id)"
          >
            ✅
          </span>
          <span
            v-else-if="isAvailable(player.name, event.id) === false"
            :title="getTooltipText(player, event.id)"
          >
            ❌
          </span>
          <span
            v-else
            :title="getTooltipText(player, event.id)"
          >
            –
          </span>
        </td>
        <td class="p-3 text-center">
          <!-- bouton de suppression -->
        </td>
      </tr>
    </tbody>
  </table>

  <div v-if="newEventForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg p-4 w-96">
      <h2 class="text-lg font-bold mb-2">Créer un nouvel événement</h2>
      <form @submit.prevent="createEvent">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium mb-1">Titre de l'événement</label>
          <input id="title" v-model="newEventTitle" type="text" class="block w-full p-2 border border-gray-300 rounded-lg">
        </div>
        <div class="mb-4">
          <label for="date" class="block text-sm font-medium mb-1">Date de l'événement</label>
          <input id="date" v-model="newEventDate" type="date" class="block w-full p-2 border border-gray-300 rounded-lg">
        </div>
        <div class="flex justify-between">
          <button @click="cancelNewEvent" class="px-4 py-2 bg-gray-200 rounded-lg text-sm">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 rounded-lg text-sm text-white">Créer</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="deleteConfirmation" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg p-4 w-96">
      <h2 class="text-lg font-bold mb-2">Supprimer l'événement</h2>
      <p>Êtes-vous sûr de vouloir supprimer l'événement ?</p>
      <div class="flex justify-between">
        <button @click="cancelDelete" class="px-4 py-2 bg-gray-200 rounded-lg text-sm">Annuler</button>
        <button @click="deleteEventConfirmed" class="px-4 py-2 bg-red-500 rounded-lg text-sm text-white">Supprimer</button>
      </div>
    </div>
  </div>

</template>

<script setup>
defineOptions({
  name: 'GridBoard'
})  
import { ref, onMounted } from 'vue'
import {
  setStorageMode,
  loadEvents,
  loadPlayers,
  loadAvailability,
  loadSelections,
  saveAvailability,
  saveSelection,
  saveEvent,
  deleteEvent,
  updateEvent
} from '../services/storage.js'

const deleteConfirmation = ref(false)
const eventToDelete = ref(null)
const editingEvent = ref(null)
const editingTitle = ref('')
const editingDate = ref('')

async function confirmDeleteEvent(eventId) {
  eventToDelete.value = eventId
  deleteConfirmation.value = true
}

async function deleteEventConfirmed() {
  if (!eventToDelete.value) return

  try {
    await deleteEvent(eventToDelete.value)
    events.value = events.value.filter(event => event.id !== eventToDelete.value)
    // Recharger les données pour s'assurer que tout est à jour
    await Promise.all([
      loadEvents(),
      loadAvailability(players.value, events.value),
      loadSelections()
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      selections.value = newSelections
    })
    deleteConfirmation.value = false
    eventToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    alert('Erreur lors de la suppression de l\'événement. Veuillez réessayer.')
  }
}

function cancelDelete() {
  deleteConfirmation.value = false
  eventToDelete.value = null
}

function startEditing(event) {
  editingEvent.value = event.id
  editingTitle.value = event.title
  editingDate.value = event.date
}

async function saveEdit() {
  if (!editingEvent.value || !editingTitle.value.trim() || !editingDate.value) return

  try {
    const eventData = {
      title: editingTitle.value.trim(),
      date: editingDate.value
    }
    await updateEvent(editingEvent.value, eventData)
    
    // Trouver et mettre à jour l'événement dans la liste
    const index = events.value.findIndex(e => e.id === editingEvent.value)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...eventData }
    }
    
    editingEvent.value = null
    editingTitle.value = ''
    editingDate.value = ''
  } catch (error) {
    console.error('Erreur lors de l\'édition de l\'événement:', error)
    alert('Erreur lors de l\'édition de l\'événement. Veuillez réessayer.')
  }
}

function cancelEdit() {
  editingEvent.value = null
  editingTitle.value = ''
  editingDate.value = ''
}

const isHovered = ref(null)

const newEventForm = ref(false)
const newEventTitle = ref('')
const newEventDate = ref('')

async function createEvent() {
  if (!newEventTitle.value.trim() || !newEventDate.value) {
    alert('Veuillez remplir le titre et la date de l\'événement')
    return
  }

  const newEvent = {
    title: newEventTitle.value.trim(),
    date: newEventDate.value
  }

  try {
    // D'abord sauvegarder l'événement
    const eventId = await saveEvent(newEvent)
    
    // Mettre à jour la liste des événements
    events.value = [...events.value, { id: eventId, ...newEvent }]
    
    // Mettre à jour la disponibilité pour le nouvel événement
    const newAvailability = {}
    // Utiliser une boucle for...of pour gérer les promesses
    for (const player of players.value) {
      newAvailability[player.name] = availability.value[player.name] || {}
      newAvailability[player.name][eventId] = null // Utiliser null au lieu de undefined
      // Sauvegarder la disponibilité pour chaque joueur
      await saveAvailability(player.name, newAvailability[player.name])
    }
    
    // Réinitialiser le formulaire
    newEventTitle.value = ''
    newEventDate.value = ''
    newEventForm.value = false
    
    // Forcer la mise à jour de l'interface
    await Promise.resolve()
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
    alert('Erreur lors de la création de l\'événement. Veuillez réessayer.')
  }
}

function cancelNewEvent() {
  newEventTitle.value = ''
  newEventDate.value = ''
  newEventForm.value = false
}

const events = ref([])
const players = ref([])
const availability = ref({})
const selections = ref({})
const stats = ref({})
const chances = ref({})

onMounted(async () => {
  const useFirebase = true
  setStorageMode(useFirebase ? 'firebase' : 'mock')

  events.value = await loadEvents()
  const rawPlayers = await loadPlayers()

  // ✅ Filtrer les doublons par name
  const seen = {}
  rawPlayers.forEach(p => {
    if (!seen[p.name]) seen[p.name] = p
  })
  players.value = Object.values(seen)

  console.log('players (deduplicated):', players.value.map(p => ({ id: p.id, name: p.name })))

  availability.value = await loadAvailability(players.value, events.value)
  selections.value = await loadSelections()
  updateAllStats()
  updateAllChances()
})

function toggleAvailability(player, eventId) {
  availability.value[player] = availability.value[player] || {}

  const current = availability.value[player][eventId]
  let next

  if (current === undefined) next = true
  else if (current === true) next = false
  else next = undefined

  availability.value[player][eventId] = next

  saveAvailability(player, availability.value[player])
  updateStatsForPlayer(player)
  updateAllChances()
}

function isAvailable(player, eventId) {
  return availability.value[player]?.[eventId]
}

function isSelected(player, eventId) {
  const selected = selections.value[eventId] || []
  const avail = availability.value[player]?.[eventId]
  return selected.includes(player) && avail === true
}

async function tirer(eventId, count = 6) {
  const candidates = players.value.filter(p => isAvailable(p.name, eventId))

  // Tirage pondéré : moins sélectionné = plus de chances
  const weightedCandidates = candidates.map(player => {
    const s = countSelections(player.name)
    return {
      name: player.name,
      weight: 1 / (1 + s) // poids inverse du nombre de sélections
    }
  })

  const tirage = []
  const pool = [...weightedCandidates]

  while (tirage.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0)
    let r = Math.random() * totalWeight

    const chosenIndex = pool.findIndex(p => {
      r -= p.weight
      return r <= 0
    })

    if (chosenIndex >= 0) {
      tirage.push(pool[chosenIndex].name)
      pool.splice(chosenIndex, 1)
    }
  }

  selections.value[eventId] = tirage

  await saveSelection(eventId, tirage)
  updateAllStats()
  updateAllChances()
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function countSelections(player) {
  return Object.values(selections.value).filter(sel => sel.includes(player)).length
}

function countAvailability(player) {
  const eventsMap = availability.value[player] || {}
  return Object.values(eventsMap).filter(v => v === true).length
}

function ratioSelection(player) {
  const avail = countAvailability(player)
  const sel = countSelections(player)
  return avail === 0 ? 0 : sel / avail
}

function updateStatsForPlayer(player) {
  stats.value[player] = {
    availability: countAvailability(player),
    selection: countSelections(player),
    ratio: ratioSelection(player)
  }
}

function updateAllStats() {
  players.value.forEach(player => updateStatsForPlayer(player.name))
}

function chanceToBeSelected(playerName, eventId, count = 6) {
  const availablePlayers = players.value.filter(p => isAvailable(p.name, eventId) === true)

  if (!availablePlayers.find(p => p.name === playerName)) return 0

  // Calcul du poids basé sur le nombre de sélections déjà faites
  const weights = availablePlayers.map(p => {
    const pastSelections = countSelections(p.name)
    return {
      name: p.name,
      weight: 1 / (1 + pastSelections)
    }
  })

  const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)
  const playerWeight = weights.find(p => p.name === playerName)?.weight || 0

  const chance = Math.min(1, (playerWeight / totalWeight) * count)
  return Math.round(chance * 100)
}

function updateAllChances(count = 6) {
  const chanceMap = {}
  events.value.forEach(event => {
    const availablePlayers = players.value.filter(p => isAvailable(p.name, event.id) === true)
    const weights = availablePlayers.map(p => {
      const pastSelections = countSelections(p.name)
      return {
        name: p.name,
        weight: 1 / (1 + pastSelections)
      }
    })
    const totalWeight = weights.reduce((sum, p) => sum + p.weight, 0)

    weights.forEach(p => {
      const chance = Math.min(1, (p.weight / totalWeight) * count)
      if (!chanceMap[p.name]) chanceMap[p.name] = {}
      chanceMap[p.name][event.id] = Math.round(chance * 100)
    })
  })

  chances.value = chanceMap
}

function getTooltipText(player, eventId) {
  const name = player.name
  const avail = isAvailable(name, eventId)
  const selected = isSelected(name, eventId)
  const chance = chances.value?.[name]?.[eventId] ?? 0

  if (avail === false) {
    return 'Non disponible – cliquez pour changer'
  }

  if (selected) {
    return `Sélectionné · Chance estimée : ${chance}%`
  }

  if (avail === true) {
    return `Disponible · Chance estimée : ${chance}%`
  }

  return 'Cliquez pour indiquer votre disponibilité'
}

</script>
