<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header avec titre de la saison -->
    <div class="text-center py-8 px-4 relative">
      <!-- Flèche de retour -->
      <button 
        @click="goBack"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
        title="Retour à l'accueil"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <h1 class="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        {{ seasonName ? seasonName : 'Chargement...' }}
      </h1>
      <p class="text-gray-300">Gestion des sélections et disponibilités</p>
    </div>

    <div class="container mx-auto px-4 pb-16">
      <!-- En-têtes fixes -->
      <div class="sticky top-0 z-50 backdrop-blur-sm bg-black/20 border border-white/20 rounded-t-2xl overflow-hidden">
        <table class="border-collapse w-full table-fixed">
          <colgroup>
            <col style="width: 10%;" />
            <col style="width: 10%;" />
            <col v-for="(event, index) in events" :key="index" :style="'width: calc(70% / ' + events.length + ');'" />
            <col style="width: 5%;" />
          </colgroup>
          <thead>
            <tr class="text-white">
              <th class="p-4 text-left">
                <div class="flex items-center justify-center space-x-3">
                  <span class="font-bold text-lg relative group">
                    <span class="border-b-2 border-dashed border-purple-400">
                      Joueur
                    </span>
                  </span>
                  <button @click="newPlayerForm = true" class="text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200 cursor-pointer" title="Ajoutez un joueur">
                    ✨
                  </button>
                </div>
              </th>
              <th class="p-4 text-center">
                <span class="text-lg font-bold">📊 Stats</span>
              </th>
              <th
                v-for="event in events"
                :key="event.id"
                class="p-4 text-center"
                @mouseenter="isHovered = event.id"
                @mouseleave="isHovered = null"
                @dblclick="startEditing(event)"
              >
                <div class="flex flex-col gap-3">
                  <div class="flex flex-col items-center space-y-2 relative">
                    <div v-if="editingEvent !== event.id" class="font-bold text-lg text-center whitespace-pre-wrap relative group">
                      <span class="hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-help transition-colors duration-200 text-white" :title="'Double-clic pour modifier : ' + event.title + ' - ' + formatDate(event.date)">
                        {{ event.title }}
                      </span>
                    </div>
                    <div v-else class="w-full">
                      <input
                        v-model="editingTitle"
                        type="text"
                        class="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        @keydown.esc="cancelEdit"
                        @keydown.enter="saveEdit"
                        ref="editTitleInput"
                      >
                    </div>
                    <div v-if="editingEvent !== event.id" class="text-sm text-gray-300 cursor-help hover:border-b hover:border-dashed hover:border-purple-400 transition-colors duration-200 inline-block" :title="'Double-clic pour modifier : ' + event.title + ' - ' + formatDate(event.date)">
                      {{ formatDate(event.date) }}
                    </div>
                    <div v-else class="w-full">
                      <input
                        v-model="editingDate"
                        type="date"
                        class="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        @keydown.esc="cancelEdit"
                        @keydown.enter="saveEdit"
                      >
                    </div>
                    <button
                      @click="confirmDeleteEvent(event.id)"
                      class="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                      :class="{ 'opacity-100': isHovered === event.id }"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </th>
              <th class="p-4 text-center">
                <button @click="openNewEventForm" class="text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200" title="Ajouter un nouvel événement">
                  ✨
                </button>
              </th>
            </tr>
            <tr class="bg-black/10">
              <th class="p-4 text-left w-[100px]"></th>
              <th class="p-4 text-center text-lg w-[100px]"></th>
              <th
                v-for="event in events"
                :key="event.id"
                class="p-4 text-center w-40"
              >
                <button
                  @click="handleTirage(event.id, 6)"
                  class="rounded-full text-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/25 p-3 w-12 h-12 flex items-center justify-center mx-auto transition-all duration-300 transform hover:scale-110"
                  :title="(selections[event.id] && selections[event.id].length > 0) ? 'Relancer la sélection' : 'Lancer la sélection'"
                >
                  🎭
                </button>
              </th>
              <th class="p-4"></th>
            </tr>
          </thead>
        </table>
      </div>

      <!-- Corps scrollable -->
      <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl">
        <table class="table-auto border-collapse w-full table-fixed">
          <colgroup>
            <col style="width: 10%;" />
            <col style="width: 10%;" />
            <col v-for="(event, index) in events" :key="index" :style="'width: calc(70% / ' + events.length + ');'" />
            <col style="width: 5%;" />
          </colgroup>
          <tbody>
            <tr
              v-for="player in players"
              :key="player.id"
              class="border-b border-white/10 hover:bg-white/5 transition-all duration-200"
              :data-player-id="player.id"
              :class="{ 'highlighted-player': player.id === highlightedPlayer }"
            >
              <td class="p-4 font-medium text-white w-[100px] relative group text-lg">
                <div v-if="editingPlayer !== player.id" class="font-bold text-lg whitespace-pre-wrap flex items-center justify-between">
                  <span 
                    @dblclick="startEditPlayer(player)" 
                    class="hover:border-b-2 hover:border-dashed hover:border-purple-400 edit-cursor transition-colors duration-200"
                    :title="'Double-clic pour modifier : ' + player.name"
                  >
                    {{ player.name }}
                  </span>
                  <button @click="handlePlayerDelete(player.id)" class="hidden group-hover:block text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200" title="Supprimer le joueur">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                <div v-else class="w-full">
                  <input
                    v-model="editingPlayerName"
                    type="text"
                    class="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    @keydown.esc="cancelEditPlayer"
                    @keydown.enter="saveEditPlayer"
                    ref="editPlayerInput"
                  >
                </div>
              </td>
              <td class="p-4 text-center text-gray-300 text-lg w-[100px]">
                <span class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-500/30" :title="`${countSelections(player.name)} sélection${countSelections(player.name) > 1 ? 's' : ''}, ${countAvailability(player.name)} dispo${countAvailability(player.name) > 1 ? 's' : ''}`">
                  {{ countSelections(player.name) }}/{{ countAvailability(player.name) }}
                </span>
              </td>
              <td
                v-for="event in events"
                :key="event.id"
                class="p-4 text-center cursor-pointer hover:bg-white/10 transition-all duration-200"
                @click="toggleAvailability(player.name, event.id)"
              >
                <div class="flex items-center justify-center">
                  <span
                    v-if="isSelected(player.name, event.id)"
                    class="text-2xl hover:scale-110 transition-transform duration-200"
                    :title="getTooltipText(player, event.id)"
                  >
                    🎭
                  </span>
                  <span
                    v-else-if="isAvailable(player.name, event.id)"
                    class="text-2xl hover:scale-110 transition-transform duration-200"
                    :title="getTooltipText(player, event.id)"
                  >
                    ✅
                  </span>
                  <span
                    v-else-if="isAvailable(player.name, event.id) === false"
                    class="text-2xl hover:scale-110 transition-transform duration-200"
                    :title="getTooltipText(player, event.id)"
                  >
                    ❌
                  </span>
                  <span
                    v-else
                    class="text-gray-500 hover:text-white transition-colors duration-200"
                    :title="getTooltipText(player, event.id)"
                  >
                    –
                  </span>
                </div>
              </td>
              <td class="p-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Message de succès -->
  <div v-if="showSuccessMessage" class="fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-50">
    <div class="flex items-center space-x-2">
      <span class="text-xl">✨</span>
      <span>{{ successMessage }}</span>
    </div>
  </div>

  <!-- Modales -->
  <div v-if="newEventForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvel événement</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
        <input
          v-model="newEventTitle"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Titre de l'événement"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
        <input
          v-model="newEventDate"
          type="date"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelNewEvent"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="createEvent"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Créer
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de création de joueur -->
  <div v-if="newPlayerForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouveau joueur</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          v-model="newPlayerName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Nom du joueur"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="newPlayerForm = false"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="addNewPlayer"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Ajouter
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de suppression -->
  <div v-if="confirmDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cet événement ?</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelDelete"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="() => deleteEventConfirmed()"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de suppression de joueur -->
  <div v-if="confirmPlayerDelete" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce joueur ?</p>
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="cancelPlayerDelete" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="() => deletePlayerConfirmed()" class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300">Supprimer</button>
      </div>
    </div>
  </div>

  <!-- Modale de confirmation de relance de sélection -->
  <div v-if="confirmReselect" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🎭</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</p>
      </div>
      <p class="mb-6 text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
        ⚠️ Pensez à prévenir les gens du changement !
      </p>
      <div class="flex justify-end space-x-3">
        <button @click="cancelTirage" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="confirmTirage" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300">Confirmer</button>
      </div>
    </div>
  </div>

  <!-- Modal de saisie du PIN -->
  <PinModal
    :show="showPinModal"
    :message="getPinModalMessage()"
    :error="pinErrorMessage"
    @submit="handlePinSubmit"
    @cancel="handlePinCancel"
  />
</template>

<style>
.highlighted-player {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3)) !important;
  border: 2px solid rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
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
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
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
  reorderPlayersAlphabetically,
  initializeStorage
} from '../services/storage.js'
import { collection, getDocs, query, where, doc } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { verifySeasonPin } from '../services/seasons.js'
import PinModal from './PinModal.vue'

// Déclarer la prop slug
const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

const router = useRouter()

const seasonSlug = props.slug
const seasonName = ref('')
const seasonId = ref('')

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
const confirmReselect = ref(false)
const eventIdToReselect = ref(null)

// Variables pour la protection par PIN
const showPinModal = ref(false)
const pendingOperation = ref(null)
const pinErrorMessage = ref('')

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
  // Demander le PIN code avant d'afficher la confirmation
  await requirePin({
    type: 'deleteEvent',
    data: { eventId }
  })
}

async function deleteEventConfirmed(eventId = null) {
  const eventIdToDelete = eventId || eventToDelete.value
  console.log('deleteEventConfirmed - eventId param:', eventId)
  console.log('deleteEventConfirmed - eventToDelete.value:', eventToDelete.value)
  console.log('deleteEventConfirmed - eventIdToDelete:', eventIdToDelete)
  console.log('deleteEventConfirmed - type de eventIdToDelete:', typeof eventIdToDelete)
  
  if (!eventIdToDelete) {
    console.error('Aucun événement à supprimer')
    return
  }

  try {
    await deleteEvent(eventIdToDelete, seasonId.value)
    events.value = events.value.filter(event => event.id !== eventIdToDelete)
    // Recharger les données pour s'assurer que tout est à jour
    await Promise.all([
      loadEvents(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newEvents, newAvailability, newSelections]) => {
      events.value = newEvents
      availability.value = newAvailability
      selections.value = newSelections
    })
    
    // Fermer la modal de confirmation
    confirmDelete.value = false
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
    await updateEvent(editingEvent.value, eventData, seasonId.value)
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadEvents(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
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

function startEditPlayer(player) {
  editingPlayer.value = player.id
  editingPlayerName.value = player.name
  nextTick(() => {
    if (editPlayerInput.value) {
      editPlayerInput.value.focus()
    }
  })
}

async function saveEditPlayer() {
  if (!editingPlayer.value || !editingPlayerName.value.trim()) return

  try {
    await updatePlayer(editingPlayer.value, editingPlayerName.value.trim(), seasonId.value)
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
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
    await deletePlayer(playerId, seasonId.value)
    
    // Recharger les données pour s'assurer que le tri est appliqué
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
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
    const newId = await addPlayer(newName, seasonId.value)
    
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
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

  // Créer l'événement directement après validation du PIN
  await createEventProtected(newEvent)
}

async function createEventProtected(eventData) {
  try {
    // D'abord sauvegarder l'événement
    const eventId = await saveEvent(eventData, seasonId.value)
    
    // Mettre à jour la liste des événements
    events.value = [...events.value, { id: eventId, ...eventData }]
    
    // Mettre à jour la disponibilité pour le nouvel événement
    const newAvailability = {}
    // Utiliser une boucle for...of pour gérer les promesses
    for (const player of players.value) {
      newAvailability[player.name] = availability.value[player.name] || {}
      newAvailability[player.name][eventId] = null // Utiliser null au lieu de undefined
      // Sauvegarder la disponibilité pour chaque joueur
      await saveAvailability(player.name, newAvailability[player.name], seasonId.value)
    }
    
    // Réinitialiser le formulaire
    newEventTitle.value = ''
    newEventDate.value = ''
    newEventForm.value = false
    
    // Forcer la mise à jour de l'interface
    await Promise.resolve()
    
    showSuccessMessage.value = true
    successMessage.value = 'Événement créé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
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

// Nouvelle fonction pour demander le PIN avant d'ouvrir la modal
async function openNewEventForm() {
  // Demander le PIN code avant d'ouvrir la modal de création
  await requirePin({
    type: 'addEvent',
    data: {}
  })
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

  // Migration automatique si besoin
  await initializeStorage()

  // Charger la saison par slug
  const q = query(collection(db, 'seasons'), where('slug', '==', props.slug))
  const snap = await getDocs(q)
  if (!snap.empty) {
    const seasonDoc = snap.docs[0]
    seasonId.value = seasonDoc.id
    seasonName.value = seasonDoc.data().name
    document.title = `Saison : ${seasonName.value}`
  }

  // Charger les données de la saison
  if (seasonId.value) {
    // Joueurs
    const playersSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'players'))
    players.value = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Événements
    const eventsSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'events'))
    events.value = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Disponibilités
    const availSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'availability'))
    const availObj = {}
    availSnap.docs.forEach(doc => { availObj[doc.id] = doc.data() })
    availability.value = availObj
    // Sélections
    const selSnap = await getDocs(collection(db, 'seasons', seasonId.value, 'selections'))
    const selObj = {}
    selSnap.docs.forEach(doc => { selObj[doc.id] = doc.data().players || [] })
    selections.value = selObj
  }
  
  // Mettre à jour les stats et les chances une seule fois
  updateAllStats()
  updateAllChances()
  
  console.log('players (deduplicated):', players.value.map(p => ({ id: p.id, name: p.name })))
})

function toggleAvailability(playerName, eventId) {
  const player = players.value.find(p => p.name === playerName);
  if (!player) {
    console.error('Joueur non trouvé:', playerName);
    return;
  }
  const eventItem = events.value.find(e => e.id === eventId);
  if (!eventItem) {
    console.error('Événement non trouvé:', eventId);
    return;
  }
  // Utiliser directement l'ID de l'événement comme clé
  if (!player.availabilities) {
    player.availabilities = {};
  }
  
  // Récupérer l'état actuel (peut être undefined)
  const current = player.availabilities[eventId];
  let newValue;
  
  // Logique de basculement : indéfini -> oui -> non -> indéfini
  if (current === 'oui') {
    newValue = 'non';
    player.availabilities[eventId] = newValue;
  } else if (current === 'non') {
    // Supprimer la clé pour revenir à l'état indéfini
    delete player.availabilities[eventId];
    newValue = undefined;
  } else {
    // État indéfini -> passe à 'oui'
    newValue = 'oui';
    player.availabilities[eventId] = newValue;
  }
  
  // Mettre à jour availability.value pour refléter les changements
  if (newValue === undefined) {
    // Si on revient à l'état indéfini, supprimer la clé
    if (availability.value[player.name]) {
      delete availability.value[player.name][eventId];
    }
  } else {
    // Sinon, mettre à jour la valeur
    if (!availability.value[player.name]) {
      availability.value[player.name] = {};
    }
    availability.value[player.name][eventId] = newValue === 'oui';
  }
  
  // Mettre à jour les disponibilités pour ce joueur
  saveAvailability(player.name, { ...player.availabilities }, seasonId.value)
    .then(() => {
      showSuccessMessage.value = true;
      successMessage.value = 'Disponibilité mise à jour avec succès !';
      setTimeout(() => {
        showSuccessMessage.value = false;
      }, 3000);
    })
    .catch((error) => {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      alert('Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.');
    });
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

  await saveSelection(eventId, tirage, seasonId.value)
  updateAllStats()
  updateAllChances()
}

async function tirerProtected(eventId, count = 6) {
  await tirer(eventId, count)
  showSuccessMessage.value = true
  successMessage.value = 'Sélection effectuée avec succès !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
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

const playerToDelete = ref(null)
const confirmPlayerDelete = ref(false)

async function deletePlayerConfirmed(playerId = null) {
  const playerIdToDelete = playerId || playerToDelete.value
  if (!playerIdToDelete) {
    console.error('Aucun joueur à supprimer')
    return
  }

  try {
    await deletePlayer(playerIdToDelete, seasonId.value)
    players.value = players.value.filter(p => p.id !== playerIdToDelete)
    
    // Fermer la modal de confirmation
    confirmPlayerDelete.value = false
    playerToDelete.value = null
    
    showSuccessMessage.value = true
    successMessage.value = 'Joueur supprimé avec succès !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error("Erreur lors de la suppression du joueur :", error)
    alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")
  }
}

function cancelPlayerDelete() {
  confirmPlayerDelete.value = false
  playerToDelete.value = null
}

async function handlePlayerDelete(playerId) {
  // Demander le PIN code avant d'afficher la confirmation
  await requirePin({
    type: 'deletePlayer',
    data: { playerId }
  })
}

async function handleTirage(eventId, count = 6) {
  if (selections.value[eventId] && selections.value[eventId].length > 0) {
    // Demander le PIN code avant d'afficher la confirmation de relance
    await requirePin({
      type: 'launchSelection',
      data: { eventId, count }
    })
  } else {
    // Demander le PIN code avant de lancer la sélection
    await requirePin({
      type: 'launchSelection',
      data: { eventId, count }
    })
  }
}
async function confirmTirage() {
  if (eventIdToReselect.value) {
    // Lancer directement la sélection (le PIN a déjà été validé)
    await tirerProtected(eventIdToReselect.value, 6)
    confirmReselect.value = false
    eventIdToReselect.value = null
  }
}
function cancelTirage() {
  confirmReselect.value = false
  eventIdToReselect.value = null
}

// Fonctions pour la protection par PIN
function getPinModalMessage() {
  if (!pendingOperation.value) return 'Veuillez saisir le code PIN à 4 chiffres'
  
  const messages = {
    deleteEvent: 'Suppression d\'événement - Code PIN requis',
    addEvent: 'Ajout d\'événement - Code PIN requis',
    deletePlayer: 'Suppression de joueur - Code PIN requis',
    launchSelection: 'Lancement de sélection - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  pendingOperation.value = operation
  showPinModal.value = true
}

async function handlePinSubmit(pinCode) {
  try {
    const isValid = await verifySeasonPin(seasonId.value, pinCode)
    
    if (isValid) {
      showPinModal.value = false
      const operationToExecute = pendingOperation.value
      pendingOperation.value = null
      
      // Exécuter l'opération en attente
      await executePendingOperation(operationToExecute)
    } else {
      pinErrorMessage.value = 'Code PIN incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        pinErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du PIN:', error)
    pinErrorMessage.value = 'Erreur lors de la vérification du code PIN'
  }
}

function handlePinCancel() {
  showPinModal.value = false
  pendingOperation.value = null
  pinErrorMessage.value = ''
}

async function executePendingOperation(operation) {
  if (!operation) return
  
  const { type, data } = operation
  
  try {
    switch (type) {
      case 'deleteEvent':
        // Afficher la modal de confirmation après validation du PIN
        console.log('executePendingOperation - data.eventId:', data.eventId)
        console.log('executePendingOperation - type de data.eventId:', typeof data.eventId)
        eventToDelete.value = data.eventId
        confirmDelete.value = true
        break
      case 'addEvent':
        // Ouvrir la modal de création d'événement après validation du PIN
        newEventForm.value = true
        break
      case 'deletePlayer':
        // Afficher la modal de confirmation après validation du PIN
        playerToDelete.value = data.playerId
        confirmPlayerDelete.value = true
        break
      case 'launchSelection':
        // Vérifier si une sélection existe déjà pour afficher la confirmation
        if (selections.value[data.eventId] && selections.value[data.eventId].length > 0) {
          // Afficher la modal de confirmation de relance
          eventIdToReselect.value = data.eventId
          confirmReselect.value = true
        } else {
          // Lancer directement la sélection
          await tirerProtected(data.eventId, data.count)
        }
        break
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'opération:', error)
    showSuccessMessage.value = true
    successMessage.value = 'Erreur lors de l\'opération. Veuillez réessayer.'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

function goBack() {
  router.push('/')
}

</script>
