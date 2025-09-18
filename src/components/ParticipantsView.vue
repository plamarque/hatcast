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
        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-normal">+</span>
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
          class="left-col-td bg-gray-800 rounded-xl px-4 py-3 m-1"
          :style="{ 
            width: dynamicLeftColumnWidth, 
            minWidth: windowWidth.value > 768 ? '6rem' : dynamicLeftColumnWidth, 
            maxWidth: dynamicLeftColumnWidth 
          }"
        >
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1 cursor-pointer hover:bg-gray-700/30 rounded p-1 -m-1 transition-colors" @click="openEventModal(event)">
              <span class="text-lg">{{ getEventIcon(event) }}</span>
              <span class="text-white font-medium text-sm line-clamp-2 overflow-hidden" :title="event.title">{{ event.title }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs">{{ formatEventDate(event.date) }}</span>
              <StatusBadge 
                :event-id="event.id" 
                :event-status="getEventStatus(event)" 
              />
            </div>
          </div>
        </td>
        
        <!-- Cellules de disponibilité -->
        <td
          v-for="player in players"
          :key="`${event.id}-${player.id}`"
          class="col-player p-2 md:p-1"
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
            :player-gender="player.gender || 'non-specified'"
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
        
        <!-- Cellule "Afficher Plus" - vide pour un aspect plus propre -->
        <td
          v-if="!isAllPlayersView && hiddenPlayersCount > 0"
          class="col-header bg-gray-800 px-2 py-3 text-center"
          :style="{ width: `${playerColumnWidth * 1.5}px`, minWidth: `${playerColumnWidth * 1.5}px` }"
        >
          <!-- Cellule vide pour un aspect plus propre -->
        </td>
      </tr>
    </template>
  </BaseGridView>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import BaseGridView from './BaseGridView.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import StatusBadge from './StatusBadge.vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS, ROLE_TEMPLATES } from '../services/storage.js'
import { getEventStatusWithSelection } from '../services/eventStatusService.js'

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
    // iPhone SE : largeur suffisante pour lire confortablement les titres
    return '11rem' // 176px - utilise l'espace restant
  }
  // iPhone 16 Plus et écrans moyens
  else if (windowWidth.value <= 430) {
    return '12rem' // 192px
  }
  // Desktop et autres écrans : largeur très compacte pour maximiser l'espace des colonnes joueurs
  // Si peu de joueurs (1-3), colonne très étroite
  if (totalPlayers <= 3) {
    return '3rem' // 48px - très compact
  }
  // Si nombre moyen de joueurs (4-10), colonne compacte
  else if (totalPlayers <= 10) {
    return '3.5rem' // 56px - très compact
  }
  // Si beaucoup de joueurs (11+), colonne plus large mais toujours très compacte
  else {
    return '4rem' // 64px - très compact
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
  // Vérifier que window est disponible (éviter les erreurs SSR)
  if (typeof window === 'undefined') return
  
  console.log('🔍 updatePlayerColumnWidth appelé, windowWidth.value:', windowWidth.value)
  
  if (windowWidth.value <= 375) {
    // iPhone SE : colonne joueur optimisée pour éviter le débordement
    // Avec colonne événements à 10rem (160px), il reste ~215px pour la colonne joueur
    playerColumnWidth.value = 200 // 12.5rem - ajusté pour la nouvelle largeur événements
    console.log('🔍 iPhone SE: playerColumnWidth.value =', playerColumnWidth.value)
  } else if (windowWidth.value <= 430) {
    // iPhone 16 Plus : plus d'espace disponible
    playerColumnWidth.value = 220 // 13.75rem
    console.log('🔍 iPhone 16 Plus: playerColumnWidth.value =', playerColumnWidth.value)
  } else if (windowWidth.value <= 768) {
    playerColumnWidth.value = 640 // 40rem pour écrans moyens - garder l'ancienne valeur
    console.log('🔍 Écrans moyens: playerColumnWidth.value =', playerColumnWidth.value)
  } else {
    playerColumnWidth.value = 200 // Desktop - encore plus large pour utiliser tout l'espace libéré
    console.log('🔍 Desktop: playerColumnWidth.value =', playerColumnWidth.value)
  }
  
  // Appliquer directement les styles avec !important via JavaScript
  nextTick(() => {
    // Cibler les cellules du corps (.col-player) et les en-têtes (.col-event)
    const colPlayers = document.querySelectorAll('.participants-view .col-player')
    const colEvents = document.querySelectorAll('.participants-view .col-event')
    
    // Appliquer aux cellules du corps (td)
    colPlayers.forEach(element => {
      element.style.setProperty('width', `${playerColumnWidth.value}px`, 'important')
      element.style.setProperty('min-width', `${playerColumnWidth.value}px`, 'important')
      element.style.setProperty('max-width', `${playerColumnWidth.value}px`, 'important')
    })
    
    // Appliquer aux en-têtes (th)
    colEvents.forEach(element => {
      element.style.setProperty('width', `${playerColumnWidth.value}px`, 'important')
      element.style.setProperty('min-width', `${playerColumnWidth.value}px`, 'important')
      element.style.setProperty('max-width', `${playerColumnWidth.value}px`, 'important')
    })
  })
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
