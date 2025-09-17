<template>
  <BaseGridView
    class="participants-view"
    :events="props.events"
    :displayed-players="props.displayedPlayers"
    :left-column-title="eventsTitle"
    :header-items="props.displayedPlayers"
    :row-items="props.events"
    :column-items="props.displayedPlayers"
    :item-column-width="playerColumnWidth.value"
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
        class="flex flex-col items-center space-y-1 cursor-pointer hover:bg-gray-700 transition-colors p-2"
        @click="togglePlayerModal"
      >
        <div class="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-sm">+</span>
        </div>
        <span class="text-white text-xs text-center leading-tight">
          Afficher Plus
          <br>
          <span class="text-blue-200">{{ hiddenPlayersDisplayText }}</span>
        </span>
      </div>
    </template>

    <!-- Lignes d'événements (vue participants) -->
    <template #rows="{ items: events, columns: players, itemWidth }">
      <tr v-for="event in events" :key="event.id">
        <!-- Cellule événement -->
        <td 
          class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700"
          :style="{ width: dynamicLeftColumnWidth, minWidth: dynamicLeftColumnWidth, maxWidth: dynamicLeftColumnWidth }"
        >
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1 cursor-pointer hover:bg-gray-700/30 rounded p-1 -m-1 transition-colors" @click="openEventModal(event)">
              <span class="text-lg">{{ getEventIcon(event) }}</span>
              <span class="text-white font-medium text-sm">{{ event.title }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs">{{ formatEventDate(event.date) }}</span>
              <span :class="getStatusColor(getEventStatus(event))" class="text-xs px-2 py-1 rounded-full font-normal">
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
      </tr>
    </template>
  </BaseGridView>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import BaseGridView from './BaseGridView.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS, ROLE_TEMPLATES } from '../services/storage.js'
import { getEventStatusWithSelection, getStatusLabel, getStatusColor } from '../services/eventStatusService.js'

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
  },
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
    required: true
  },
  headerOffsetX: {
    type: Number,
    default: 0
  },
  headerScrollX: {
    type: Number,
    default: 0
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

// Calculer la largeur dynamique de la colonne des événements
const dynamicLeftColumnWidth = computed(() => {
  const playerCount = props.displayedPlayers?.length || 0
  const hiddenCount = props.hiddenPlayersCount || 0
  const totalPlayers = playerCount + hiddenCount
  
  // Dans la vue Participants, la colonne des événements contient plus d'infos (titre, date, statut)
  // Si peu de joueurs (1-3), colonne plus étroite mais suffisante
  if (totalPlayers <= 3) {
    return '9rem' // 144px (augmenté de 7rem)
  }
  // Si nombre moyen de joueurs (4-10), colonne moyenne
  else if (totalPlayers <= 10) {
    return '11rem' // 176px (augmenté de 9rem)
  }
  // Si beaucoup de joueurs (11+), colonne plus large
  else {
    return '14rem' // 224px (augmenté de 12rem)
  }
})

// Computed
const eventsTitle = computed(() => {
  if (!props.events) return 'Événements (0)'
  const count = props.events.length || 0
  
  // Texte plus court sur mobile
  if (window.innerWidth <= 430) {
    return `Évén. (${count})`
  }
  
  return `Événements (${count})`
})

const playerColumnWidth = ref(120) // Valeur par défaut

const updatePlayerColumnWidth = () => {
  if (window.innerWidth <= 375) {
    playerColumnWidth.value = 576 // 36rem pour iPhone 16 et plus petit
  } else if (window.innerWidth <= 430) {
    playerColumnWidth.value = 640 // 40rem pour iPhone 16 Plus
  } else if (window.innerWidth <= 768) {
    playerColumnWidth.value = 640 // 40rem pour écrans moyens
  } else {
    playerColumnWidth.value = 120 // Desktop - plus d'espace pour les noms de joueurs
  }
}

// Écouter les changements de taille d'écran
onMounted(() => {
  updatePlayerColumnWidth()
  window.addEventListener('resize', updatePlayerColumnWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePlayerColumnWidth)
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
