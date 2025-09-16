<template>
  <BaseGridView
    :events="events"
    :displayed-players="displayedPlayers"
    :left-column-title="'Joueurs'"
    :header-items="events"
    :row-items="displayedPlayers"
    :column-items="events"
    :item-column-width="eventColumnWidth"
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
    <!-- En-têtes des événements -->
    <template #headers="{ item, itemWidth }">
      <div
        class="col-event bg-gray-800 flex items-center justify-center px-2 py-3"
        :style="{ width: `${itemWidth}px`, minWidth: `${itemWidth}px` }"
      >
        <div class="flex flex-col items-center space-y-1 w-full">
          <!-- Emoji et titre empilés -->
          <div class="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-700/30 rounded p-1 -m-1 transition-colors w-full" @click="openEventModal(item)">
            <span class="text-lg">{{ getEventIcon(item) }}</span>
            <span class="text-white font-medium text-sm text-center leading-tight line-clamp-3 overflow-hidden" 
                  :title="item.title">
              {{ item.title }}
            </span>
          </div>
          <!-- Date et statut empilés -->
          <div class="flex flex-col items-center space-y-1">
            <span class="text-gray-400 text-xs text-center">{{ formatEventDate(item.date) }}</span>
            <span :class="getStatusColor(getEventStatus(item))" class="text-xs px-2 py-1 rounded-full">
              {{ getStatusLabel(getEventStatus(item)) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Lignes de joueurs -->
    <template #rows="{ items: players, columns: events, itemWidth }">
      <tr v-for="player in players" :key="player.id">
        <!-- Cellule joueur -->
        <td class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700">
          <div class="flex items-center space-x-2">
            <PlayerAvatar
              :player-id="player.id"
              :season-id="seasonId"
              :player-name="player.name"
              :player-gender="player.gender || 'non-specified'"
              :size="'sm'"
              class="w-6 h-6"
            />
            <span class="text-white font-medium text-sm">{{ player.name }}</span>
          </div>
        </td>
        
        <!-- Cellules de disponibilité -->
        <td
          v-for="event in events"
          :key="`${player.id}-${event.id}`"
          class="col-event border-r border-gray-700 p-0"
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
      </tr>
      
      <!-- Ligne "Afficher Plus" -->
      <tr v-if="!isAllPlayersView && hiddenPlayersCount > 0">
        <td class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700">
          <button
            class="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            @click="togglePlayerModal"
          >
            <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">+</span>
            </div>
            <span class="text-sm">
              Afficher Plus
              <br>
              <span class="text-blue-200 text-xs">{{ hiddenPlayersDisplayText }}</span>
            </span>
          </button>
        </td>
        
        <!-- Cellules vides pour "Afficher Plus" -->
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
const eventColumnWidth = computed(() => {
  // Largeur adaptative pour les colonnes d'événements selon la taille d'écran
  if (window.innerWidth <= 375) {
    return 140 // 8.75rem pour iPhone 16 et plus petit
  } else if (window.innerWidth <= 430) {
    return 160 // 10rem pour iPhone 16 Plus
  } else if (window.innerWidth <= 768) {
    return 180 // 11.25rem pour écrans moyens
  }
  return 200 // Desktop
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
</script>

<!-- Styles gérés par BaseGridView.vue -->
t