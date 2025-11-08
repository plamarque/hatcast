<template>
    <div class="view-header bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/30 w-full flex items-center flex-wrap gap-2"
         :class="{ 'sticky top-0 left-0 z-[120] shadow-lg': isSticky }"
         :style="headerStyle + '; ' + containerStyle">
          <!-- Filtres (à gauche) -->
          <div v-if="showPlayerSelector || showEventSelector" class="flex items-center gap-2 ml-4 md:ml-6">
            <!-- Sélecteur de joueur -->
            <div v-if="showPlayerSelector" class="relative">
              <button
                @click="togglePlayerModal"
                class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32 max-w-[240px] md:max-w-[300px]"
              >
                <!-- Avatar du joueur sélectionné (un seul joueur) -->
                <div v-if="showPlayerAvatar" class="flex-shrink-0">
                  <PlayerAvatar
                    :player-id="selectedPlayer.id"
                    :player-name="selectedPlayer.name"
                    :season-id="seasonId"
                    :player-gender="selectedPlayer.gender || 'non-specified'"
                    size="sm"
                    class="w-5 h-5"
                  />
                </div>
              <!-- Icône "Tous les joueurs" quand aucun joueur spécifique sélectionné -->
              <div v-else class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-600 rounded-full">
                <span class="text-xs">👥</span>
              </div>
                <span class="flex-1 min-w-0 text-left text-xs md:text-sm truncate">
                  {{ displayText }}
                </span>
                <svg class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            <!-- Sélecteur d'événement -->
            <div v-if="showEventSelector" class="relative">
              <button
                @click="toggleEventModal"
                class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32 max-w-[240px] md:max-w-[300px]"
              >
                <!-- Icône de l'événement sélectionné -->
                <div v-if="showEventIcon" class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-700 rounded-full">
                  <span class="text-sm">{{ selectedEventIcon }}</span>
                </div>
                <!-- Icône "Tous les événements" quand aucun événement spécifique sélectionné -->
                <div v-else class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-600 rounded-full">
                  <span class="text-xs">🎭</span>
                </div>
                <span class="flex-1 min-w-0 text-left text-xs md:text-sm truncate">
                  {{ eventDisplayText }}
                </span>
                <svg class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Tab switcher à droite -->
          <div class="flex bg-gray-800/50 rounded-lg p-1 mx-auto md:ml-auto md:mr-6">
            <button
              @click="selectView('participants')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'participants' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
              </svg>
              <span class="hidden sm:inline">Participants</span>
            </button>
            
            <button
              @click="selectView('events')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'events' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
              </svg>
              <span class="hidden sm:inline">Spectacles</span>
            </button>
            
            <button
              @click="selectView('timeline')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'timeline' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="hidden sm:inline">Agenda</span>
            </button>
            
            <button
              @click="selectView('casts')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'casts' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              <span class="hidden sm:inline">Compositions</span>
            </button>
          </div>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { EVENT_TYPE_ICONS } from '../services/storage.js'

// Props
const props = defineProps({
  currentView: {
    type: String,
    required: true,
    validator: (value) => ['events', 'participants', 'timeline', 'casts'].includes(value)
  },
  showPlayerSelector: {
    type: Boolean,
    default: false
  },
  selectedPlayer: {
    type: Object,
    default: null
  },
  seasonId: {
    type: String,
    required: true
  },
  // Props pour le sélecteur d'événements
  showEventSelector: {
    type: Boolean,
    default: false
  },
  selectedEvent: {
    type: Object,
    default: null
  },
  events: {
    type: Array,
    default: () => []
  },
  // Style props
  headerStyle: {
    type: String,
    default: 'padding-top: max(8px, env(safe-area-inset-top) + 6px); padding-bottom: 12px;'
  },
  containerStyle: {
    type: String,
    default: 'padding-left: max(4px, env(safe-area-inset-left)); padding-right: max(4px, env(safe-area-inset-right));'
  },
  isSticky: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['view-change', 'player-modal-toggle', 'event-modal-toggle'])

// Logique d'affichage du dropdown
const displayText = computed(() => {
  // Si aucun joueur sélectionné, afficher "Tous"
  if (!props.selectedPlayer) {
    return 'Tous'
  }
  // Sinon, afficher le nom du joueur
  return props.selectedPlayer.name
})

const showPlayerAvatar = computed(() => {
  // Afficher l'avatar seulement si un joueur spécifique est sélectionné
  return !!props.selectedPlayer
})

// Logique d'affichage du sélecteur d'événements
const eventDisplayText = computed(() => {
  // Si aucun événement sélectionné, afficher "Tous"
  if (!props.selectedEvent) {
    return 'Tous'
  }
  // Sinon, afficher le titre de l'événement
  return props.selectedEvent.title
})

const showEventIcon = computed(() => {
  // Afficher l'icône seulement si un événement spécifique est sélectionné
  return !!props.selectedEvent
})

const selectedEventIcon = computed(() => {
  if (!props.selectedEvent) return 'T'
  // Utiliser l'icône de l'événement selon son templateType
  return EVENT_TYPE_ICONS[props.selectedEvent.templateType] || '❓'
})

// Debug: surveiller les changements d'état via les props
watch(() => props.selectedPlayer, (selectedPlayer) => {
  console.log('🔍 ViewHeader: player selection changed:', {
    selectedPlayerId: selectedPlayer?.id,
    selectedPlayerName: selectedPlayer?.name,
    selectedPlayerObject: selectedPlayer,
    displayText: displayText.value,
    showPlayerAvatar: showPlayerAvatar.value,
    currentView: props.currentView
  })
}, { immediate: true })

// Fonctions

function selectView(view) {
  emit('view-change', view)
}

function togglePlayerModal() {
  emit('player-modal-toggle')
}

function toggleEventModal() {
  emit('event-modal-toggle')
}

function getViewLabel(view) {
  switch (view) {
    case 'events': return 'Spectacles'
    case 'participants': return 'Participants'
    case 'timeline': return 'Agenda'
    default: return 'Lignes'
  }
}
</script>
