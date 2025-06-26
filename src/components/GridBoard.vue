<template>
  <div class="relative">
    <!-- En-têtes fixes -->
    <div class="sticky top-0 bg-white z-50 shadow overflow-x-auto">
      <table class="border-collapse border border-gray-400 w-full table-fixed">
        <colgroup>
          <col style="width: 10%;" />
          <col style="width: 10%;" />
          <col v-for="(event, index) in events" :key="index" :style="'width: calc(70% / ' + events.length + ');'" />
          <col style="width: 5%;" />
        </colgroup>
        <thead>
          <tr class="bg-gray-100 text-gray-800 text-sm">
            <th class="p-3 text-left">
              <div class="flex flex-col items-center justify-center gap-2">
                <span class="text-sm">Joueur</span>
                <button @click="newPlayerForm = true" class="text-sm text-blue-500 hover:text-blue-700 cursor-pointer" title="Ajoutez un joueur">
                  ➕
                </button>
              </div>
            </th>
            <th class="p-3 text-center">
              <span class="text-sm">📊 Stats</span>
            </th>
            <th
              v-for="event in events"
              :key="event.id"
              class="p-3 text-center"
              @mouseenter="isHovered = event.id"
              @mouseleave="isHovered = null"
              @dblclick="startEditing(event)"
            >
              <div class="flex flex-col gap-2">
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
              </div>
            </th>
            <th class="p-3 text-center">
              <button @click="newEventForm = true" class="text-gray-500 hover:text-blue-500" title="Ajouter un nouvel événement">
                ➕
              </button>
            </th>
          </tr>
          <tr class="bg-gray-50">
            <th class="p-3 text-left w-[100px]"></th>
            <th class="p-3 text-center text-sm text-gray-700 w-[100px]"></th>
            <th
              v-for="event in events"
              :key="event.id"
              class="p-3 text-center w-40"
            >
              <button
                @click="tirer(event.id, 6)" 
                class="px-2 py-1 rounded-md text-sm bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800"
              >
                🎭 Sélectionner
              </button>
            </th>
            <th class="p-3"></th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- Corps scrollable -->
    <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-100px)]">
      <table class="table-auto border-collapse border border-gray-400 w-full table-fixed">
        <colgroup>
          <col style="width: 10%;" />
          <col style="width: 10%;" />
          <col v-for="(event, index) in events" :key="index" :style="'width: calc(70% / ' + events.length + ');'" />
          <col style="width: 5%;" />
        </colgroup>
        <tbody class="border-t">
          <tr
            v-for="player in players"
            :key="player.id"
            class="odd:bg-white even:bg-gray-50 border-b"
            :data-player-id="player.id"
            :class="{ 'highlighted-player': player.id === highlightedPlayer }"
          >
            <td class="p-3 font-medium text-gray-900 w-[100px]">
              <div v-if="editingPlayer !== player.id" class="font-semibold text-base whitespace-pre-wrap">
                {{ player.name }}
              </div>
              <div v-else class="w-full">
                <input
                  v-model="editingPlayerName"
                  type="text"
                  class="w-full p-1 border rounded"
                  @keydown.esc="cancelEditPlayer"
                  @keydown.enter="saveEditPlayer"
                  ref="editPlayerInput"
                >
              </div>
              <button
                @click="confirmDeletePlayer(player.id)"
                class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                :class="{ 'opacity-100': isHovered === player.id }"
              >
                ❌
              </button>
            </td>
            <td class="p-3 text-center text-gray-700 text-sm w-[100px]">
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
            <td class="p-3"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Message de succès -->
  <div v-if="showSuccessMessage" class="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
    {{ successMessage }}
  </div>

  <!-- Modales -->
  <div v-if="newEventForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-xl font-bold mb-4">Nouvel événement</h2>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          v-model="newEventTitle"
          type="text"
          class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Titre de l'événement"
        >
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          v-model="newEventDate"
          type="date"
          class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
      </div>
      <div class="flex justify-end space-x-2">
        <button
          @click="cancelNewEvent"
          class="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Annuler
        </button>
        <button
          @click="createEvent"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Créer
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de création de joueur -->
  <div v-if="newPlayerForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-xl font-bold mb-4">Nouveau joueur</h2>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
        <input
          v-model="newPlayerName"
          type="text"
          class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Nom du joueur"
        >
      </div>
      <div class="flex justify-end space-x-2">
        <button
          @click="newPlayerForm = false"
          class="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Annuler
        </button>
        <button
          @click="addNewPlayer"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ajouter
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de suppression -->
  <div v-if="confirmDelete" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-xl font-bold mb-4">Confirmation</h2>
      <p class="mb-4">Êtes-vous sûr de vouloir supprimer ?</p>
      <div class="flex justify-end space-x-2">
        <button
          @click="cancelDelete"
          class="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Annuler
        </button>
        <button
          @click="deleteEventConfirmed"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.highlighted-player {
  background-color: #4F46E5 !important;
  color: white !important;
}
.highlighted-player * {
  color: white !important;
}

.grid-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.grid-table th,
.grid-table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
  word-wrap: break-word;
}

/* Responsivité: adaptation des cellules sur écran réduit */
@media (max-width: 768px) {
  .grid-table th,
  .grid-table td {
    padding: 6px;
    font-size: 0.9em;
  }
}
</style>

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
  updateEvent,
  addPlayer,
  deletePlayer,
  updatePlayer,
  reorderPlayersAlphabetically
} from '../services/storage.js'

const confirmDelete = ref(false)
const eventToDelete = ref(null)
const editingEvent = ref(null)
const editingTitle = ref('')
const editingDate = ref('')
const editingPlayer = ref(null)
const editingPlayerName = ref('')
const newPlayerForm = ref(false)
const newPlayerName = ref('')
const highlightedPlayer = ref(null)

// Fonction pour mettre en évidence un joueur
function highlightPlayer(playerId) {
  highlightedPlayer.value = playerId
  // Scroller automatiquement vers le joueur
  const row = document.querySelector(`[data-player-id="${playerId}"]`)
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  showSuccessMessage.value = true
  successMessage.value = 'Nouveau joueur ajouté !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// Fonction pour cacher la mise en évidence
function hideHighlight() {
  highlightedPlayer.value = null
}

const showSuccessMessage = ref(false)
const successMessage = ref('')

async function confirmDeleteEvent(eventId) {
  eventToDelete.value = eventId
  confirmDelete.value = true
}

async function deleteEventConfirmed() {
  confirmDelete.value = false
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
    eventToDelete.value = null
    showSuccessMessage.value = true
    successMessage.value = 'Événement supprimé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    alert('Erreur lors de la suppression de l\'événement. Veuillez réessayer.')
  }
}

function cancelDelete() {
  confirmDelete.value = false
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
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadEvents(),
      loadAvailability(players.value, events.value),
      loadSelections()
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      selections.value = newSelections
    })
    
    editingEvent.value = null
    editingTitle.value = ''
    editingDate.value = ''
    showSuccessMessage.value = true
    successMessage.value = 'Événement mis à jour avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de l\'édition de l\'événement:', error)
    alert('Erreur lors de l\'édition de l\'événement. Veuillez réessayer.')
  }
}

function startEditingPlayer(player) {
  editingPlayer.value = player.id
  editingPlayerName.value = player.name
}

async function saveEditPlayer() {
  if (!editingPlayer.value || !editingPlayerName.value.trim()) return

  try {
    await updatePlayer(editingPlayer.value, editingPlayerName.value.trim())
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadPlayers(),
      loadAvailability(players.value, events.value),
      loadSelections()
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers
      availability.value = newAvailability
      selections.value = newSelections
    })
    
    editingPlayer.value = null
    editingPlayerName.value = ''
    showSuccessMessage.value = true
    successMessage.value = 'Joueur mis à jour avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de l\'édition du joueur:', error)
    alert('Erreur lors de l\'édition du joueur. Veuillez réessayer.')
  }
}

function cancelEditPlayer() {
  editingPlayer.value = null
  editingPlayerName.value = ''
}

async function confirmDeletePlayer(playerId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return

  try {
    await deletePlayer(playerId)
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadPlayers(),
      loadAvailability(players.value, events.value),
      loadSelections()
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers
      availability.value = newAvailability
      selections.value = newSelections
    })
    showSuccessMessage.value = true
    successMessage.value = 'Joueur supprimé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la suppression du joueur:', error)
    alert('Erreur lors de la suppression du joueur. Veuillez réessayer.')
  }
}

async function addNewPlayer() {
  if (!newPlayerName.value.trim()) return

  try {
    const newName = newPlayerName.value.trim()
    const newId = await addPlayer(newName)
    
    // Recharger les données
    await Promise.all([
      loadPlayers(),
      loadAvailability(players.value, events.value),
      loadSelections()
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers
      availability.value = newAvailability
      selections.value = newSelections
      
      // Trouver le nouveau joueur et le mettre en évidence
      const newPlayer = players.value.find(p => p.id === newId)
      highlightPlayer(newId)

      // Scroller automatiquement vers le joueur
      const row = document.querySelector(`[data-player-id="${newId}"]`)
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Afficher le message de succès
      showSuccessMessage.value = true
      successMessage.value = 'Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.'
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)     // Masquer le message après 5 secondes
      setTimeout(() => {
        showSuccessMessage.value = false
        successMessage.value = ''
      }, 5000)
    })
    
    newPlayerForm.value = false
    newPlayerName.value = ''
  } catch (error) {
    console.error('Erreur lors de l\'ajout du joueur:', error)
    alert('Erreur lors de l\'ajout du joueur. Veuillez réessayer.')
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

// Fonction pour annuler la création d'événement


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

// Initialiser les données au montage
onMounted(async () => {
  const useFirebase = true
  setStorageMode(useFirebase ? 'firebase' : 'mock')

  // Charger toutes les données
  const [newEvents, newPlayers] = await Promise.all([
    loadEvents(),
    loadPlayers()
  ])

  // Filtrer les doublons par name
  const seen = {}
  const uniquePlayers = newPlayers.filter(p => {
    if (!seen[p.name]) {
      seen[p.name] = true
      return true
    }
    return false
  })

  // Mettre à jour toutes les références
  events.value = newEvents
  players.value = uniquePlayers
  
  // Charger la disponibilité et les sélections avec les données actualisées
  availability.value = await loadAvailability(players.value, events.value)
  selections.value = await loadSelections()
  
  // Mettre à jour les stats et les chances une seule fois
  updateAllStats()
  updateAllChances()
  
  console.log('players (deduplicated):', players.value.map(p => ({ id: p.id, name: p.name })))
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
