<template>
  <BaseGridView
    :events="events"
    :displayed-players="displayedPlayers"
    :left-column-title="'Événements'"
    :header-items="displayedPlayers"
    :row-items="events"
    :column-items="displayedPlayers"
    :item-column-width="playerColumnWidth"
    :is-all-players-view="isAllPlayersView"
    :hidden-players-count="hiddenPlayersCount"
    :hidden-players-display-text="hiddenPlayersDisplayText"
    :can-edit-availability="canEditAvailability"
    :get-player-availability="getPlayerAvailability"
    :header-offset-x="headerOffsetX"
    :header-scroll-x="headerScrollX"
    @player-selected="showPlayerDetails"
    @availability-changed="handleAvailabilityChanged"
    @scroll="handleScroll"
    @toggle-player-modal="togglePlayerModal"
  >
    <!-- En-têtes des joueurs -->
    <template #headers="{ item, itemWidth }">
      <div
        class="flex flex-col items-center space-y-1 cursor-pointer hover:bg-gray-700 transition-colors p-2"
        @click="showPlayerDetails(item)"
      >
        <PlayerAvatar
          :player-id="item.id"
          :season-id="seasonId"
          :player-name="item.name"
          :player-gender="item.gender || 'non-specified'"
          :size="'sm'"
          class="w-6 h-6"
        />
        <span class="text-white text-xs text-center leading-tight">{{ item.name }}</span>
      </div>
    </template>
    
    <!-- En-tête "Afficher Plus" -->
    <template #show-more-header="{ itemWidth }">
      <div
        class="flex flex-col items-center space-y-1 cursor-pointer hover:bg-blue-700 transition-colors p-2"
        @click="togglePlayerModal"
      >
        <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <span class="text-blue-600 font-bold text-sm">+</span>
        </div>
        <span class="text-white text-xs text-center leading-tight">
          Afficher Plus
          <br>
          <span class="text-blue-200">{{ hiddenPlayersDisplayText }}</span>
        </span>
      </div>
    </template>

    <!-- Lignes d'événements -->
    <template #rows="{ items: events, columns: players, itemWidth }">
      <tr v-for="event in events" :key="event.id">
        <!-- Cellule événement -->
        <td class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1 cursor-pointer hover:bg-gray-700/30 rounded p-1 -m-1 transition-colors" @click="openEventModal(event)">
              <span class="text-lg">{{ getEventIcon(event) }}</span>
              <span class="text-white font-medium text-sm">{{ event.title }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs">{{ formatEventDate(event.date) }}</span>
              <span :class="getStatusColor(getEventStatus(event))" class="text-xs px-2 py-1 rounded-full">
                {{ getStatusLabel(getEventStatus(event)) }}
              </span>
            </div>
          </div>
        </td>
        
        <!-- Cellules de disponibilité -->
        <td
          v-for="player in players"
          :key="`${event.id}-${player.id}`"
          class="col-player border-r border-gray-700 p-0"
          :style="{ width: `${itemWidth}px`, minWidth: `${itemWidth}px`, height: '4rem' }"
        >
          <AvailabilityCell
            :player-name="player.name"
            :event-id="event.id"
            :is-available="isAvailable(player.name, event.id)"
            :is-selected="isSelected(player.name, event.id)"
            :is-selection-confirmed="isSelectionConfirmed(event.id)"
            :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(event.id)"
            :player-selection-status="getPlayerSelectionStatus(player.name, event.id)"
            :season-id="seasonId"
            :chance-percent="chances[player.name]?.[event.id] ?? null"
            :show-selected-chance="isSelectionComplete(event.id)"
            :disabled="event.archived === true"
            :availability-data="getAvailabilityData(player.name, event.id)"
            :event-title="event.title"
            :event-date="event.date"
            :is-protected="isPlayerProtectedInGrid(player.id)"
            @availability-changed="handleAvailabilityChanged"
            @toggle="toggleAvailability"
            @toggle-selection-status="toggleSelectionStatus"
            @show-availability-modal="openAvailabilityModal"
          />
        </td>
        
        <!-- Cellule "Afficher Plus" -->
        <td
          v-if="!isAllPlayersView && hiddenPlayersCount > 0"
          class="col-player border-r border-gray-700 p-0"
          :style="{ width: `${itemWidth}px`, minWidth: `${itemWidth}px`, height: '4rem' }"
        >
          <div class="h-full bg-gray-800 flex items-center justify-center min-h-16">
            <button
              class="text-blue-400 hover:text-blue-300 text-xs"
              @click="togglePlayerModal"
            >
              {{ hiddenPlayersDisplayText }}
            </button>
          </div>
        </td>
      </tr>
    </template>
  </BaseGridView>
</template>

<script setup>
import { computed } from 'vue'
import BaseGridView from './BaseGridView.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS, ROLE_TEMPLATES } from '../services/storage.js'

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
  getPlayerAvailability: {
    type: Function,
    required: true
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
  }
})

// Emits
const emit = defineEmits([
  'player-selected',
  'availability-changed',
  'scroll',
  'toggle-player-modal',
  'toggle-availability',
  'toggle-selection-status',
  'show-availability-modal',
  'event-click'
])

// Computed
const playerColumnWidth = computed(() => {
  // Largeur adaptative pour les colonnes de joueurs selon la taille d'écran
  if (window.innerWidth <= 375) {
    return 64 // 4rem pour iPhone 16 et plus petit
  } else if (window.innerWidth <= 430) {
    return 72 // 4.5rem pour iPhone 16 Plus
  } else if (window.innerWidth <= 768) {
    return 72 // 4.5rem pour écrans moyens
  }
  return 80 // Desktop
})

// Fonctions utilitaires
const getEventIcon = (event) => {
  return EVENT_TYPE_ICONS[event.templateType] || '❓'
}

const getEventStatus = (event) => {
  // Récupérer le statut depuis la composition si disponible
  if (event.cast && event.cast.status) {
    return event.cast.status
  }
  // Fallback : pas de composition = prêt
  return 'ready'
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'confirmed': return 'Confirmé'
    case 'pending_confirmation': return 'À confirmer'
    case 'complete': return 'Complet'
    case 'incomplete': return 'Incomplet'
    case 'insufficient': return 'Pas assez de joueurs'
    case 'ready': return 'Prêt'
    default: return 'Prêt'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'text-green-400 bg-green-900/30'
    case 'pending_confirmation': return 'text-yellow-400 bg-yellow-900/30'
    case 'complete': return 'text-blue-400 bg-blue-900/30'
    case 'incomplete': return 'text-orange-400 bg-orange-900/30'
    case 'insufficient': return 'text-red-400 bg-red-900/30'
    case 'ready': return 'text-gray-400 bg-gray-900/30'
    default: return 'text-gray-400 bg-gray-900/30'
  }
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

const toggleAvailability = (playerName, eventId) => {
  emit('toggle-availability', playerName, eventId)
}

const toggleSelectionStatus = (playerName, eventId, status, seasonId) => {
  emit('toggle-selection-status', playerName, eventId, status, seasonId)
}

const openAvailabilityModal = (data) => {
  emit('show-availability-modal', data)
}

const openEventModal = (event) => {
  emit('event-click', event)
}
</script>

<!-- Styles gérés par BaseGridView.vue -->
