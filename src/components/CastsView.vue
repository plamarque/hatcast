<template>
  <BaseGridView
    class="casts-view"
    :events="props.events"
    :displayed-players="props.displayedPlayers"
    :left-column-title="participantsTitle"
    :header-items="props.events"
    :row-items="props.displayedPlayers"
    :column-items="props.events"
    :item-column-width="eventColumnWidth"
    :is-all-players-view="isAllPlayersView"
    :hidden-players-count="hiddenPlayersCount"
    :hidden-players-display-text="hiddenPlayersDisplayText"
    :is-all-events-view="isAllEventsView"
    :hidden-events-count="hiddenEventsCount"
    :hidden-events-display-text="hiddenEventsDisplayText"
    :can-edit-availability="false"
    :get-player-availability="() => null"
    :header-offset-x="headerOffsetX"
    :header-scroll-x="headerScrollX"
    @player-selected="showPlayerDetails"
    @availability-changed="() => {}"
    @scroll="handleScroll"
    @toggle-player-modal="() => {}"
    @toggle-event-modal="toggleEventModal"
  >
    <!-- En-têtes des événements -->
    <template #headers="{ item, itemWidth }">
      <!-- Debug: vérifier les événements -->
      <div v-if="!item" class="text-white text-center">
        Événement manquant
      </div>
      <div
        class="col-event rounded-xl flex items-center justify-center px-2 py-3 transition-all duration-200 cursor-pointer"
        :class="[
          item._isArchived 
            ? 'bg-gray-600/50 border border-gray-500/30 hover:bg-gray-600/70' 
            : item._isPast 
              ? 'bg-amber-800/30 border border-amber-600/30 hover:bg-amber-800/50' 
              : 'bg-gray-800 border border-gray-700/30 hover:bg-gray-700'
        ]"
        :style="{ width: `${itemWidth}px`, minWidth: `${itemWidth}px` }"
        @click="openEventModal(item)"
      >
        <div class="flex flex-col items-center space-y-1 w-full">
          <!-- Emoji et titre empilés -->
          <div class="flex flex-col items-center gap-1 w-full">
            <span class="text-sm">{{ getEventIcon(item) }}</span>
            <span 
              class="font-semibold text-sm text-center leading-tight line-clamp-2 overflow-hidden" 
              :class="[
                item._isArchived 
                  ? 'text-gray-400' 
                  : item._isPast 
                    ? 'text-amber-200' 
                    : 'text-white'
              ]"
              :title="item.title + (item._isArchived ? ' (Archivé)' : item._isPast ? ' (Passé)' : '')"
            >
              {{ item.title }}
              <span v-if="item._isArchived" class="text-xs text-gray-500 ml-1">📁</span>
              <span v-else-if="item._isPast" class="text-xs text-amber-400 ml-1">⏰</span>
            </span>
          </div>
          <!-- Date et statut empilés -->
          <div class="flex flex-col items-center space-y-1">
            <span 
              class="text-xs text-center font-normal"
              :class="[
                item._isArchived 
                  ? 'text-gray-500' 
                  : item._isPast 
                    ? 'text-amber-300' 
                    : 'text-gray-400'
              ]"
            >
              {{ formatEventDate(item.date) }}
            </span>
            <StatusBadge 
              :event-id="item.id" 
              :event-status="getEventStatus(item)" 
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Lignes de joueurs (vue compositions) -->
    <template #rows="{ items: players, columns: events, itemWidth }">
      <!-- Debug: vérifier les données -->
      <tr v-if="players.length === 0" class="text-white">
        <td colspan="100" class="text-center py-4">
          Aucun joueur trouvé ({{ players?.length }} joueurs, {{ events?.length }} événements)
        </td>
      </tr>
      <tr v-for="player in players" :key="player.id">
        <!-- Cellule joueur -->
        <td 
          class="left-col-td bg-gray-900 px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors rounded-xl"
          :style="{ 
            width: dynamicLeftColumnWidth, 
            minWidth: windowWidth.value > 768 ? '6rem' : dynamicLeftColumnWidth, 
            maxWidth: dynamicLeftColumnWidth 
          }"
          @click="showPlayerDetails(player)"
        >
          <div class="flex items-center space-x-2">
            <PlayerAvatar
              :player-id="player.id"
              :season-id="seasonId"
              :player-name="player.name"
              :player-gender="player.gender || 'non-specified'"
              :show-status-icons="true"
              :size="'lg'"
              :clickable="true"
              class="!w-10 !h-10"
              @click="showPlayerDetails(player)"
            />
            <span class="text-white font-medium text-sm">{{ player.name }}</span>
          </div>
        </td>
        
        <!-- Cellules de sélection -->
        <td
          v-for="event in events"
          :key="`${player.id}-${event.id}`"
          class="col-event p-2 md:p-1"
          :style="{ width: `${itemWidth}px`, minWidth: `${itemWidth}px`, height: '4rem' }"
        >
          <SelectionCell
            :player-name="player.name"
            :event-id="event.id"
            :is-selected="isSelected(player.name, event.id)"
            :is-selection-confirmed="isSelectionConfirmed(player.name, event.id)"
            :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(event.id)"
            :selection-status="getPlayerSelectionStatus(player.name, event.id)"
            :season-id="seasonId"
            :can-edit="false"
            :selection-data="getSelectionData(player.name, event.id)"
            :player-gender="player.gender || 'non-specified'"
            @selection-status-click="() => {}"
            @player-selected="showPlayerDetails"
          />
        </td>
        
        <!-- Bouton "Afficher Tous" pour les joueurs si nécessaire -->
        <td
          v-if="!isAllPlayersView && hiddenPlayersCount > 0"
          class="col-event p-2 md:p-1"
          :style="{ width: `${itemWidth * 1.5}px`, minWidth: `${itemWidth * 1.5}px`, height: '4rem' }"
        >
          <div class="w-full h-full flex items-center justify-center">
            <button
              @click="loadAllPlayers"
              class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
              :title="`Afficher les ${hiddenPlayersCount} autres participants`"
            >
              +{{ hiddenPlayersCount }}
            </button>
          </div>
        </td>
        
        <!-- Bouton "Afficher Tous" pour les événements si nécessaire -->
        <td
          v-if="!isAllEventsView && hiddenEventsCount > 0"
          class="col-event p-2 md:p-1"
          :style="{ width: `${itemWidth * 1.5}px`, minWidth: `${itemWidth * 1.5}px`, height: '4rem' }"
        >
          <div class="w-full h-full flex items-center justify-center">
            <button
              @click="loadAllEvents"
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
              :title="`Afficher les ${hiddenEventsCount} autres spectacles`"
            >
              +{{ hiddenEventsCount }}
            </button>
          </div>
        </td>
      </tr>
    </template>
  </BaseGridView>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import BaseGridView from './BaseGridView.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import SelectionCell from './SelectionCell.vue'
import StatusBadge from './StatusBadge.vue'

// Props
const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  displayedPlayers: {
    type: Array,
    required: true
  },
  isAllPlayersView: {
    type: Boolean,
    default: false
  },
  hiddenPlayersCount: {
    type: Number,
    default: 0
  },
  hiddenPlayersDisplayText: {
    type: String,
    default: ''
  },
  isAllEventsView: {
    type: Boolean,
    default: false
  },
  hiddenEventsCount: {
    type: Number,
    default: 0
  },
  hiddenEventsDisplayText: {
    type: String,
    default: ''
  },
  seasonId: {
    type: String,
    required: true
  },
  isSelected: {
    type: Function,
    required: true
  },
  isSelectionConfirmed: {
    type: Function,
    required: true
  },
  isSelectionConfirmedByOrganizer: {
    type: Function,
    required: true
  },
  getPlayerSelectionStatus: {
    type: Function,
    required: true
  },
  getSelectionData: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'player-selected',
  'scroll',
  'toggle-event-modal',
  'load-all-players',
  'load-all-events'
])

// Références
const gridboardRef = ref(null)
const headerOffsetX = ref(0)
const headerScrollX = ref(0)

// Variables réactives pour la largeur de la fenêtre
const windowWidth = ref(window.innerWidth)

// Computed properties
const participantsTitle = computed(() => 'Participants')

const eventColumnWidth = computed(() => {
  if (windowWidth.value <= 430) return 100
  if (windowWidth.value <= 768) return 120
  return 140
})

const dynamicLeftColumnWidth = computed(() => {
  if (windowWidth.value <= 430) return '80px'
  if (windowWidth.value <= 768) return '100px'
  return '120px'
})

// Fonctions utilitaires
function formatEventDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function getEventIcon(event) {
  // Logique pour déterminer l'icône de l'événement
  if (event.archived) return '📁'
  if (event._isPast) return '⏰'
  return '🎭'
}

function getEventStatus(event) {
  // Logique pour déterminer le statut de l'événement
  if (event.archived) return 'archived'
  if (event._isPast) return 'past'
  return 'active'
}

// Gestionnaires d'événements
function showPlayerDetails(player) {
  emit('player-selected', player)
}

function openEventModal(event) {
  emit('toggle-event-modal', event)
}

function loadAllPlayers() {
  emit('load-all-players')
}

function loadAllEvents() {
  emit('load-all-events')
}

function handleScroll(event) {
  const scrollLeft = event.target.scrollLeft
  headerScrollX.value = scrollLeft
  emit('scroll', { scrollLeft })
}

// Gestion de la largeur de la fenêtre
function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  console.log('🎭 CastsView mounted:', {
    events: props.events?.length,
    players: props.displayedPlayers?.length,
    seasonId: props.seasonId
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>
