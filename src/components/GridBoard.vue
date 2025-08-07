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
            <col style="width: 15%;" />
            <col v-for="(event, index) in events" :key="index" :style="'width: calc(80% / ' + events.length + ');'" />
            <col style="width: 5%;" />
          </colgroup>
          <thead>
            <tr class="text-white">
              <th class="p-4 text-left">
                <div class="flex flex-col items-center space-y-2">
                  <span class="font-bold text-lg relative group">
                    <span class="border-b-2 border-dashed border-purple-400">
                      Joueurs
                    </span>
                  </span>
                  <button 
                    @click="newPlayerForm = true" 
                    class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm font-medium" 
                    title="Ajouter un nouveau joueur"
                  >
                    <span class="text-lg">➕</span>
                    <span>S'ajouter</span>
                  </button>
                </div>
              </th>
              <th
                v-for="event in events"
                :key="event.id"
                class="p-4 text-center"
                @click="showEventDetails(event)"
              >
                <div class="flex flex-col gap-3">
                  <div class="flex flex-col items-center space-y-2 relative">
                    <div class="font-bold text-lg text-center whitespace-pre-wrap relative group cursor-pointer">
                      <span class="hover:border-b-2 hover:border-dashed hover:border-purple-400 transition-colors duration-200 text-white" :title="'Cliquez pour voir les détails : ' + event.title">
                        {{ formatDate(event.date) }}
                      </span>
                    </div>
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
              <th
                v-for="event in events"
                :key="event.id"
                class="p-4 text-center w-40"
              >
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
            <col style="width: 15%;" />
            <col v-for="(event, index) in events" :key="index" :style="'width: calc(80% / ' + events.length + ');'" />
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
                <div class="font-bold text-lg whitespace-pre-wrap flex items-center justify-between">
                  <span 
                    @click="showPlayerDetails(player)" 
                    class="hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-pointer transition-colors duration-200"
                    :title="'Cliquez pour voir les détails : ' + player.name"
                  >
                    {{ player.name }}
                  </span>
                </div>
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
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          v-model="newEventDescription"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          rows="3"
          placeholder="Description de l'événement (optionnel)"
        ></textarea>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nombre de joueurs à sélectionner</label>
        <input
          v-model="newEventPlayerCount"
          type="number"
          min="1"
          max="20"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          placeholder="6"
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
  <div v-if="confirmReselect" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
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



  <!-- Popin de détails du spectacle -->
  <div v-if="showEventDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeEventDetails">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl" @click.stop>
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-3xl">🎭</span>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">{{ selectedEvent?.title }}</h2>
        <p class="text-xl text-purple-300">{{ formatDateFull(selectedEvent?.date) }}</p>
      </div>
      
      <div v-if="selectedEvent?.description" class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-3">Description</h3>
        <p class="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-600/50">
          {{ selectedEvent.description }}
        </p>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-3">Statistiques</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
            <div class="text-2xl font-bold text-white">{{ countAvailablePlayers(selectedEvent?.id) }}</div>
            <div class="text-sm text-gray-300">Disponibles</div>
          </div>
          <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30">
            <div class="text-2xl font-bold text-white">{{ countSelectedPlayers(selectedEvent?.id) }}</div>
            <div class="text-sm text-gray-300">Sélectionnés</div>
          </div>
          <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
            <div class="text-2xl font-bold text-white">{{ selectedEvent?.playerCount || 6 }}</div>
            <div class="text-sm text-gray-300">À sélectionner</div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-center space-x-3">
        <button 
          @click="startEditingFromDetails"
          class="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Modifier</span>
        </button>
        <button 
          @click="openSelectionModal(selectedEvent)"
          class="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
          title="Gérer la sélection"
        >
          <span>🎭</span>
          <span>Sélection</span>
        </button>
        <button 
          @click="confirmDeleteEvent(selectedEvent?.id)"
          class="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>🗑️</span>
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal d'édition d'événement -->
  <div v-if="editingEvent" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✏️ Modifier l'événement</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Titre</label>
        <input
          v-model="editingTitle"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
          ref="editTitleInput"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
        <input
          v-model="editingDate"
          type="date"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          v-model="editingDescription"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          rows="3"
          placeholder="Description de l'événement (optionnel)"
          @keydown.esc="cancelEdit"
        ></textarea>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nombre de joueurs à sélectionner</label>
        <input
          v-model="editingPlayerCount"
          type="number"
          min="1"
          max="20"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          @keydown.esc="cancelEdit"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelEdit"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="saveEdit"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de saisie du PIN -->
  <PinModal
    :show="showPinModal"
    :message="getPinModalMessage()"
    :error="pinErrorMessage"
    :session-info="getSessionInfo()"
    @submit="handlePinSubmit"
    @cancel="handlePinCancel"
  />

  <!-- Modal de détails du joueur -->
  <PlayerModal
    :show="showPlayerModal"
    :player="selectedPlayer"
    :stats="getPlayerStats(selectedPlayer)"
    @close="closePlayerModal"
    @update="handlePlayerUpdate"
    @delete="handlePlayerDelete"
  />

  <!-- Modal de sélection -->
  <SelectionModal
    ref="selectionModalRef"
    :show="showSelectionModal"
    :event="selectionModalEvent"
    :current-selection="selections[selectionModalEvent?.id] || []"
    :available-count="countAvailablePlayers(selectionModalEvent?.id)"
    :selected-count="countSelectedPlayers(selectionModalEvent?.id)"
    @close="closeSelectionModal"
    @selection="handleSelectionFromModal"
    @perfect="handlePerfectFromModal"
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
import pinSessionManager from '../services/pinSession.js'
import PinModal from './PinModal.vue'
import PlayerModal from './PlayerModal.vue'
import SelectionModal from './SelectionModal.vue'

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
const editingPlayerCount = ref(6)

const newPlayerForm = ref(false)
const newPlayerName = ref('')
const highlightedPlayer = ref(null)
const confirmReselect = ref(false)
const eventIdToReselect = ref(null)

// Variables pour le modal joueur
const showPlayerModal = ref(false)
const selectedPlayer = ref(null)

// Variables pour la protection par PIN
const showPinModal = ref(false)
const pendingOperation = ref(null)
const pinErrorMessage = ref('')

// Variables pour les détails du spectacle
const showEventDetailsModal = ref(false)
const selectedEvent = ref(null)
const editingDescription = ref('')



// Variables pour la nouvelle popin de sélection
const showSelectionModal = ref(false)
const selectionModalEvent = ref(null)
const selectionModalRef = ref(null)

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

  const playerCount = parseInt(editingPlayerCount.value)
  if (isNaN(playerCount) || playerCount < 1 || playerCount > 20) {
    alert('Le nombre de joueurs doit être un nombre entier entre 1 et 20')
    return
  }

  try {
    const eventData = {
      title: editingTitle.value.trim(),
      date: editingDate.value,
      description: editingDescription.value.trim() || '',
      playerCount: playerCount
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
    editingDescription.value = ''
    editingPlayerCount.value = 6
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
  editingDescription.value = ''
  editingPlayerCount.value = 6
}

const isHovered = ref(null)

const newEventForm = ref(false)
const newEventTitle = ref('')
const newEventDate = ref('')
const newEventDescription = ref('')
const newEventPlayerCount = ref(6)

// Fonction pour annuler la création d'événement


async function createEvent() {
  if (!newEventTitle.value.trim() || !newEventDate.value) {
    alert('Veuillez remplir le titre et la date de l\'événement')
    return
  }

  const playerCount = parseInt(newEventPlayerCount.value)
  if (isNaN(playerCount) || playerCount < 1 || playerCount > 20) {
    alert('Le nombre de joueurs doit être un nombre entier entre 1 et 20')
    return
  }

  const newEvent = {
    title: newEventTitle.value.trim(),
    date: newEventDate.value,
    description: newEventDescription.value.trim() || '',
    playerCount: playerCount
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
    newEventDescription.value = ''
    newEventPlayerCount.value = 6
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
  newEventDescription.value = ''
  newEventPlayerCount.value = 6
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
    events.value = eventsSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      playerCount: doc.data().playerCount || 6 // Valeur par défaut pour les événements existants
    }))
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
  console.log('tirerProtected appelé avec eventId:', eventId)
  console.log('showSelectionModal.value:', showSelectionModal.value)
  console.log('selectionModalEvent.value?.id:', selectionModalEvent.value?.id)
  
  // Vérifier si c'est une reselection avant de faire le tirage
  const wasReselection = selections.value[eventId] && selections.value[eventId].length > 0
  
  await tirer(eventId, count)
  
  // Mettre à jour les données de la popin de sélection si elle est ouverte
  if (showSelectionModal.value && selectionModalEvent.value?.id === eventId) {
    console.log('Popin de sélection ouverte, mise à jour...')
    // Forcer la mise à jour des données
    await nextTick()
    
    // Afficher le message de succès dans la popin de sélection
    if (selectionModalRef.value && selectionModalRef.value.showSuccess) {
      console.log('Appel de showSuccess sur la popin de sélection')
      selectionModalRef.value.showSuccess(wasReselection)
    } else {
      console.log('selectionModalRef.value:', selectionModalRef.value)
      console.log('showSuccess disponible:', selectionModalRef.value?.showSuccess)
    }
  } else {
    console.log('Popin de sélection fermée, affichage message global')
    // Afficher un message de succès global si la popin n'est pas ouverte
    showSuccessMessage.value = true
    const event = events.value.find(e => e.id === eventId)
    const selectedPlayers = selections.value[eventId] || []
    
    if (wasReselection) {
      successMessage.value = 'Nouvelle sélection effectuée avec succès !'
    } else {
      successMessage.value = 'Sélection effectuée avec succès !'
    }
    
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function countSelections(player) {
  return Object.values(selections.value).filter(sel => sel.includes(player)).length
}

function countAvailability(player) {
  const eventsMap = availability.value[player] || {}
  return Object.values(eventsMap).filter(v => v === true).length
}

function countAvailablePlayers(eventId) {
  if (!eventId) return 0;
  return Object.values(availability.value).filter(playerAvail => 
    playerAvail[eventId] === true
  ).length;
}

function countSelectedPlayers(eventId) {
  if (!eventId) return 0;
  const eventSelections = selections.value[eventId] || [];
  return eventSelections.length;
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

function chanceToBeSelected(playerName, eventId, count = null) {
  const availablePlayers = players.value.filter(p => isAvailable(p.name, eventId) === true)

  if (!availablePlayers.find(p => p.name === playerName)) return 0

  // Si count n'est pas fourni, utiliser le nombre de joueurs de l'événement
  if (count === null) {
    const event = events.value.find(e => e.id === eventId)
    count = event?.playerCount || 6
  }

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

function updateAllChances() {
  const chanceMap = {}
  events.value.forEach(event => {
    const eventPlayerCount = event.playerCount || 6
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
      const chance = Math.min(1, (p.weight / totalWeight) * eventPlayerCount)
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
  // Fermer la popup du joueur d'abord
  closePlayerModal();
  
  // Demander le PIN code avant d'afficher la confirmation
  await requirePin({
    type: 'deletePlayer',
    data: { playerId }
  })
}

async function handleTirage(eventId, count = null) {
  // Si count n'est pas fourni, utiliser le nombre de joueurs de l'événement
  if (count === null) {
    const event = events.value.find(e => e.id === eventId)
    count = event?.playerCount || 6
  }
  
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
    const event = events.value.find(e => e.id === eventIdToReselect.value)
    const count = event?.playerCount || 6
    await tirerProtected(eventIdToReselect.value, count)
    confirmReselect.value = false
    eventIdToReselect.value = null
    // Ne pas fermer la popin de sélection, elle restera ouverte avec la nouvelle sélection
  }
}
function cancelTirage() {
  confirmReselect.value = false
  eventIdToReselect.value = null
  // La popin de sélection reste ouverte
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
  // Vérifier si le PIN est déjà en cache pour cette saison
  if (pinSessionManager.isPinCached(seasonId.value)) {
    const cachedPin = pinSessionManager.getCachedPin(seasonId.value)
    console.log('PIN en cache trouvé, utilisation automatique')
    
    // Vérifier que le PIN est toujours valide
    const isValid = await verifySeasonPin(seasonId.value, cachedPin)
    if (isValid) {
      // Exécuter directement l'opération
      await executePendingOperation(operation)
      return
    } else {
      // PIN invalide, effacer le cache
      pinSessionManager.clearSession()
    }
  }
  
  // Afficher la modal de saisie du PIN
  pendingOperation.value = operation
  showPinModal.value = true
}

async function handlePinSubmit(pinCode) {
  try {
    const isValid = await verifySeasonPin(seasonId.value, pinCode)
    
    if (isValid) {
      // Sauvegarder le PIN en session
      pinSessionManager.saveSession(seasonId.value, pinCode)
      
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

function getSessionInfo() {
  if (pinSessionManager.isPinCached(seasonId.value)) {
    return {
      timeRemaining: pinSessionManager.getTimeRemaining(),
      isExpiringSoon: pinSessionManager.isExpiringSoon()
    }
  }
  return null
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
          // Fermer seulement la popin de détails, garder la popin de sélection
          showEventDetailsModal.value = false
        } else {
          // Lancer directement la sélection
          await tirerProtected(data.eventId, data.count)
          // Fermer seulement la popin de détails, garder la popin de sélection
          showEventDetailsModal.value = false
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

function showEventDetails(event) {
  selectedEvent.value = event;
  editingDescription.value = event.description || '';
  showEventDetailsModal.value = true;
}

function closeEventDetails() {
  showEventDetailsModal.value = false;
  selectedEvent.value = null;
  editingDescription.value = '';
}

function startEditingFromDetails() {
  editingEvent.value = selectedEvent.value.id;
  editingTitle.value = selectedEvent.value.title;
  editingDate.value = selectedEvent.value.date;
  editingDescription.value = selectedEvent.value.description || '';
  editingPlayerCount.value = selectedEvent.value.playerCount || 6;
  showEventDetailsModal.value = false; // Fermer le popin
}



// Fonctions pour le modal joueur
function showPlayerDetails(player) {
  selectedPlayer.value = player;
  showPlayerModal.value = true;
}

function closePlayerModal() {
  showPlayerModal.value = false;
  selectedPlayer.value = null;
}

async function handlePlayerUpdate({ playerId, newName }) {
  try {
    await updatePlayer(playerId, newName, seasonId.value);
    
    // Recharger les données
    await Promise.all([
      loadPlayers(seasonId.value),
      loadAvailability(players.value, events.value, seasonId.value),
      loadSelections(seasonId.value)
    ]).then(([newPlayers, newAvailability, newSelections]) => {
      players.value = newPlayers;
      availability.value = newAvailability;
      selections.value = newSelections;
      
      // Mettre à jour le selectedPlayer dans le modal
      if (selectedPlayer.value && selectedPlayer.value.id === playerId) {
        const updatedPlayer = newPlayers.find(p => p.id === playerId);
        if (updatedPlayer) {
          selectedPlayer.value = updatedPlayer;
        }
      }
    });
    
    showSuccessMessage.value = true;
    successMessage.value = 'Joueur mis à jour avec succès !';
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de l\'édition du joueur:', error);
    alert('Erreur lors de l\'édition du joueur. Veuillez réessayer.');
  }
}

function getPlayerStats(player) {
  if (!player) return { availability: 0, selection: 0, ratio: 0 };
  
  const availability = countAvailability(player.name);
  const selection = countSelections(player.name);
  const ratio = availability === 0 ? 0 : Math.round((selection / availability) * 100);
  
  return { availability, selection, ratio };
}

// Fonctions pour la nouvelle popin de sélection
function openSelectionModal(event) {
  selectionModalEvent.value = event
  showSelectionModal.value = true
}

function closeSelectionModal() {
  showSelectionModal.value = false
  selectionModalEvent.value = null
}

async function handleSelectionFromModal() {
  if (!selectionModalEvent.value) return
  
  const eventId = selectionModalEvent.value.id
  const count = selectionModalEvent.value.playerCount || 6
  
  // Demander le PIN code avant de lancer la sélection
  await requirePin({
    type: 'launchSelection',
    data: { eventId, count }
  })
}

function handlePerfectFromModal() {
  closeSelectionModal()
  showSuccessMessage.value = true
  successMessage.value = 'Sélection validée !'
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

</script>
