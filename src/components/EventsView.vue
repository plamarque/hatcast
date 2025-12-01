<template>
  <BaseGridView
    class="events-view"
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
    :can-edit-availability="canEditAvailability"
    :get-player-availability="getPlayerAvailability"
    :header-offset-x="headerOffsetX"
    :header-scroll-x="headerScrollX"
    @player-selected="showPlayerDetails"
    @availability-changed="handleAvailabilityChanged"
    @scroll="handleScroll"
    @toggle-player-modal="togglePlayerModal"
    @toggle-event-modal="toggleEventModal"
  >
    <!-- En-têtes des événements -->
    <template #headers="{ item, itemWidth }">
      <div
        class="col-event flex items-center justify-center px-2 py-3 transition-all duration-200 cursor-pointer"
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

    <!-- Lignes de joueurs (vue spectacles) -->
    <template #rows="{ items: players, columns: events, itemWidth }">
      <tr v-for="player in players" :key="player.id">
        <!-- Cellule joueur -->
        <td 
          class="left-col-td bg-gray-900 px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors"
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
        
        <!-- Cellules de disponibilité -->
        <td
          v-for="event in events"
          :key="`${player.id}-${event.id}`"
          class="col-event p-2 md:p-1"
          :style="{ width: `${itemWidth}px`, minWidth: `${itemWidth}px`, height: '4rem' }"
        >
          <AvailabilityCell
            :player-id="player.id"
            :player-name="player.name"
            :event-id="event.id"
            :is-available="isAvailable(player.name, event.id)"
            :is-selected="isSelected(player.name, event.id)"
            :is-selection-confirmed="isSelectionConfirmed(event.id)"
            :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(event.id)"
            :can-edit-events="canEditEvents"
            :player-selection-status="getPlayerSelectionStatus(player.name, event.id)"
            :season-id="seasonId"
            :player-gender="player.gender || 'non-specified'"
            :chance-percent="chances[player.name]?.[event.id] ?? null"
            :show-selected-chance="isSelectionComplete(event.id)"
            :disabled="event._isArchived === true"
            :availability-data="getAvailabilityData(player.name, event.id)"
            :event-title="event.title"
            :event-date="event.date"
            :is-protected="isPlayerProtectedInGrid(player.id)"
            @availability-changed="handleAvailabilityChanged"
            @toggle="toggleAvailability"
            @toggle-selection-status="toggleSelectionStatus"
            @show-availability-modal="openAvailabilityModal"
            @show-confirmation-modal="openConfirmationModal"
          />
        </td>
      </tr>
      
      <!-- Ligne "Afficher Plus" -->
      <tr v-if="!isAllPlayersView && hiddenPlayersCount > 0">
        <td 
          class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700"
          :style="{ 
            width: dynamicLeftColumnWidth, 
            minWidth: windowWidth.value > 768 ? '6rem' : dynamicLeftColumnWidth, 
            maxWidth: dynamicLeftColumnWidth 
          }"
        >
          <button
            class="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            @click="addAllPlayersToGrid"
          >
            <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-normal">+</span>
            </div>
            <span class="text-sm">
              voir les {{ hiddenPlayersCount }} autres
            </span>
          </button>
        </td>
        
        <!-- Cellules vides pour "Afficher Plus" -->
      </tr>
      
    </template>
    
    <!-- En-tête "Afficher Tous" pour les événements -->
    <template #show-more-events-header="{ itemWidth }">
      <div
        class="flex flex-col items-center space-y-1 cursor-pointer hover:bg-gray-700 transition-colors p-2"
        @click="addAllEventsToGrid"
      >
        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-normal">+</span>
        </div>
        <span class="text-white text-xs text-center leading-tight">
          voir les {{ hiddenEventsCount }} autres
        </span>
      </div>
    </template>
  </BaseGridView>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import BaseGridView from './BaseGridView.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import StatusBadge from './StatusBadge.vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS, ROLE_TEMPLATES } from '../services/storage.js'
import { getEventStatusWithSelection } from '../services/eventStatusService.js'
import { loadPlayers, loadAvailability } from '../services/storage.js'
import logger from '../services/logger.js'

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
  canEditAvailability: {
    type: Boolean,
    default: false
  },
  canEditEvents: {
    type: Boolean,
    default: false
  },
  getPlayerAvailability: {
    type: Function,
    required: true
  },
  headerOffsetX: {
    type: Number,
    default: 0
  },
  headerScrollX: {
    type: Number,
    default: 0
  },
  // Props supplémentaires pour AvailabilityCell
  seasonId: {
    type: String,
    required: true
  },
  chances: {
    type: Object,
    default: () => ({})
  },
  isAvailable: {
    type: Function,
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
  isSelectionComplete: {
    type: Function,
    required: true
  },
  getAvailabilityData: {
    type: Function,
    required: true
  },
  isPlayerProtectedInGrid: {
    type: Function,
    required: true
  },
  // Props pour le calcul du statut des événements
  getSelectionPlayers: {
    type: Function,
    required: true
  },
  getTotalRequiredCount: {
    type: Function,
    required: true
  },
  countAvailablePlayers: {
    type: Function,
    required: true
  },
  casts: {
    type: Object,
    default: () => ({})
  },
  headerOffsetX: {
    type: Number,
    default: 0
  },
  headerScrollX: {
    type: Number,
    default: 0
  },
  // Props pour les événements cachés
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
  }
})

// Emits
const emit = defineEmits([
  'player-selected',
  'availability-changed',
  'scroll',
  'toggle-player-modal',
  'toggle-event-modal',
  'toggle-availability',
  'toggle-selection-status',
  'show-availability-modal',
  'event-click',
  'all-players-loaded',
  'all-events-loaded'
])

// State pour la réactivité de la largeur d'écran
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// Écouter les changements de taille d'écran
onMounted(() => {
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
  }
  
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
  })
})

// Calculer la largeur dynamique de la colonne des événements
const dynamicLeftColumnWidth = computed(() => {
  const playerCount = props.displayedPlayers?.length || 0
  const hiddenCount = props.hiddenPlayersCount || 0
  const totalPlayers = playerCount + hiddenCount
  
  // Sur mobile (iPhone SE), utiliser des largeurs plus importantes pour la lisibilité
  if (windowWidth.value <= 375) {
    // iPhone SE : largeur fixe plus importante pour la lisibilité
    return '10rem' // 160px - suffisant pour lire noms de joueurs
  }
  // iPhone 16 Plus et écrans moyens
  else if (windowWidth.value <= 430) {
    return '8rem' // 128px
  }
  // Desktop et autres écrans
  else {
    // Si peu de joueurs (1-3), colonne plus étroite
    if (totalPlayers <= 3) {
      return '5rem' // 80px
    }
    // Si nombre moyen de joueurs (4-10), colonne moyenne
    else if (totalPlayers <= 10) {
      return '7rem' // 112px
    }
    // Si beaucoup de joueurs (11+), colonne plus large
    else {
      return '10rem' // 160px
    }
  }
})

// Computed
const participantsTitle = computed(() => {
  if (!props.displayedPlayers) return 'Participants (0)'
  const count = props.displayedPlayers.length || 0
  
  // Texte plus court sur mobile
  if (window.innerWidth <= 430) {
    return `Part. (${count})`
  }
  
  return `Participants (${count})`
})

const eventColumnWidth = ref(300) // Valeur par défaut

const updateEventColumnWidth = () => {
  if (windowWidth.value <= 375) {
    eventColumnWidth.value = 144 // 9rem pour iPhone 16 et plus petit
  } else if (windowWidth.value <= 430) {
    eventColumnWidth.value = 160 // 10rem pour iPhone 16 Plus
  } else if (windowWidth.value <= 768) {
    eventColumnWidth.value = 160 // 10rem pour écrans moyens
  } else {
    eventColumnWidth.value = 300 // Desktop - plus d'espace pour les titres d'événements
  }
}

// Écouter les changements de taille d'écran
onMounted(() => {
  updateEventColumnWidth()
  window.addEventListener('resize', updateEventColumnWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateEventColumnWidth)
})

// Fonctions utilitaires
const getEventIcon = (event) => {
  return EVENT_TYPE_ICONS[event.templateType] || '❓'
}

const getEventStatus = (event) => {
  return getEventStatusWithSelection(event, {
    getSelectionPlayers: props.getSelectionPlayers,
    getTotalRequiredCount: props.getTotalRequiredCount,
    countAvailablePlayers: props.countAvailablePlayers,
    isSelectionConfirmed: props.isSelectionConfirmed,
    isSelectionConfirmedByOrganizer: props.isSelectionConfirmedByOrganizer,
    casts: props.casts
  })
}

// Methods
const showPlayerDetails = (player) => {
  emit('player-selected', player)
}

const handleAvailabilityChanged = (data) => {
  emit('availability-changed', data)
}

const handleScroll = (event) => {
  emit('scroll', event)
}

const togglePlayerModal = () => {
  emit('toggle-player-modal')
}

const toggleEventModal = () => {
  emit('toggle-event-modal')
}

const toggleAvailability = (playerName, eventId) => {
  emit('toggle-availability', playerName, eventId)
}

const toggleSelectionStatus = (playerName, eventId, status, seasonId) => {
  emit('toggle-selection-status', playerName, eventId, status, seasonId)
}

const openAvailabilityModal = (data) => {
  emit('show-availability-modal', data)
}

const openConfirmationModal = (data) => {
  emit('show-confirmation-modal', data)
}

const openEventModal = (event) => {
  emit('event-click', event)
}

// Fonction pour ajouter tous les joueurs à la grille
async function addAllPlayersToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les joueurs de la saison...')
    
    // Charger tous les joueurs
    const allPlayers = await loadPlayers(props.seasonId)
    
    // Recharger les disponibilités pour tous les joueurs
    const newAvailability = await loadAvailability(allPlayers, props.events, props.seasonId)
    
    logger.debug(`📊 Chargé ${allPlayers.length} joueurs (mode "tous")`)
    logger.debug('✅ Tous les joueurs chargés avec leurs disponibilités')
    
    // Émettre l'événement pour notifier le parent
    emit('all-players-loaded', { players: allPlayers, availability: newAvailability })
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les joueurs:', error)
  }
}

// Fonction pour ajouter tous les événements à la grille
async function addAllEventsToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les événements de la saison...')
    
    // Émettre l'événement pour notifier le parent de charger tous les événements
    emit('all-events-loaded')
    
    logger.debug('✅ Demande de chargement de tous les événements envoyée')
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les événements:', error)
  }
}
</script>

<!-- Styles gérés par BaseGridView.vue -->
t