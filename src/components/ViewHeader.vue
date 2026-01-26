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
                <span class="flex-1 min-w-0 text-left flex flex-col items-stretch min-w-0">
                  <template v-if="selectedEvent">
                    <span class="text-xs md:text-sm font-medium truncate">{{ eventDisplayDate }}</span>
                    <span class="text-xs text-gray-400 truncate">{{ eventDisplayText }}</span>
                  </template>
                  <span v-else class="text-xs md:text-sm truncate">{{ eventDisplayText }}</span>
                </span>
                <svg class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Tab switcher à droite -->
          <!-- Mobile/Responsive: Dropdown avec icône de la vue courante -->
          <div v-if="isMobileOrResponsive" class="relative ml-auto mr-4 md:mr-6" ref="dropdownContainer">
            <div class="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              <!-- Bouton avec icône de la vue courante -->
              <button
                ref="dropdownButton"
                @click.stop="toggleViewDropdown"
                class="flex items-center justify-center w-10 h-10 rounded-md bg-gray-700 text-white transition-colors"
                :aria-expanded="showViewDropdown"
                aria-haspopup="true"
                aria-label="Changer de vue"
              >
                <!-- Icône Participants -->
                <svg v-if="currentView === 'participants'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
                </svg>
                <!-- Icône Spectacles -->
                <svg v-else-if="currentView === 'events'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
                </svg>
                <!-- Icône Agenda -->
                <svg v-else-if="currentView === 'timeline'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <!-- Icône Compositions -->
                <svg v-else-if="currentView === 'casts'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </button>
              
              <!-- Bouton dropdown (triangle) -->
              <button
                @click.stop="toggleViewDropdown"
                class="flex items-center justify-center w-8 h-10 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                aria-label="Ouvrir le menu de sélection de vue"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
            
            <!-- Dropdown menu -->
            <teleport to="body">
              <div
                v-if="showViewDropdown"
                class="fixed w-auto min-w-[180px] bg-gray-900 border border-white/20 rounded-lg shadow-xl py-1 z-[1250]"
                :style="dropdownStyle"
                role="menu"
                @click.stop
              >
                <button
                  v-for="viewInfo in allViewsInfo"
                  :key="viewInfo.view"
                  @click="selectViewFromDropdown(viewInfo.view)"
                  class="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors duration-150"
                  :class="viewInfo.isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'"
                  role="menuitem"
                >
                  <!-- Icône de la vue -->
                  <span class="flex-shrink-0">
                    <!-- Icône Participants -->
                    <svg v-if="viewInfo.view === 'participants'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
                    </svg>
                    <!-- Icône Spectacles -->
                    <svg v-else-if="viewInfo.view === 'events'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
                    </svg>
                    <!-- Icône Agenda -->
                    <svg v-else-if="viewInfo.view === 'timeline'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <!-- Icône Compositions -->
                    <svg v-else-if="viewInfo.view === 'casts'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                  </span>
                  
                  <!-- Libellé de la vue -->
                  <span class="flex-1">{{ viewInfo.label }}</span>
                  
                  <!-- Indicateur de vue active (checkmark) -->
                  <span v-if="viewInfo.isActive" class="flex-shrink-0 text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                </button>
              </div>
            </teleport>
          </div>
          
          <!-- Desktop: Affichage complet avec tous les boutons -->
          <div v-else class="flex bg-gray-800/50 rounded-lg p-1 mx-auto md:ml-auto md:mr-6">
            <template v-for="view in viewOrder" :key="view">
              <!-- Bouton Participants -->
              <button
                v-if="view === 'participants'"
                @click="selectView('participants')"
                class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
                :class="currentView === 'participants' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
                </svg>
                <span class="hidden sm:inline">Participants</span>
              </button>
              
              <!-- Bouton Spectacles -->
              <button
                v-if="view === 'events'"
                @click="selectView('events')"
                class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
                :class="currentView === 'events' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/>
                </svg>
                <span class="hidden sm:inline">Spectacles</span>
              </button>
              
              <!-- Bouton Agenda -->
              <button
                v-if="view === 'timeline'"
                @click="selectView('timeline')"
                class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
                :class="currentView === 'timeline' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="hidden sm:inline">Agenda</span>
              </button>
              
              <!-- Bouton Compositions -->
              <button
                v-if="view === 'casts'"
                @click="selectView('casts')"
                class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
                :class="currentView === 'casts' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                <span class="hidden sm:inline">Compositions</span>
              </button>
            </template>
          </div>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { EVENT_TYPE_ICONS } from '../services/storage.js'
import { isMobileOrPWA } from '../utils/deviceDetection.js'
import { formatEventDate } from '../utils/dateUtils.js'

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
  // Sinon, afficher le titre de l'événement (ligne secondaire, plus petit)
  return props.selectedEvent.title
})

const eventDisplayDate = computed(() => {
  if (!props.selectedEvent?.date) return ''
  return formatEventDate(props.selectedEvent.date)
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

// Variable réactive pour la largeur de la fenêtre (pour détecter le mode responsive)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// Mettre à jour la largeur lors du redimensionnement
function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

// Computed pour détecter si on est en mode mobile/responsive
const isMobileOrResponsive = computed(() => {
  // Détection PWA : vérifier si l'app est en mode standalone
  if (typeof window !== 'undefined') {
    // Mode standalone (PWA installée)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }
    
    // iOS Safari mode standalone
    if (window.navigator && window.navigator.standalone === true) {
      return true
    }
  }
  
  // Détection par largeur d'écran (mobile ou responsive < 768px)
  if (windowWidth.value < 768) {
    return true
  }
  
  // Détection mobile par user agent (fallback)
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || ''
    const mobileKeywords = [
      'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 
      'Windows Phone', 'Opera Mini', 'IEMobile', 'Mobile Safari', 
      'webOS', 'Palm'
    ]
    
    if (mobileKeywords.some(keyword => userAgent.includes(keyword))) {
      return true
    }
  }
  
  return false
})

// Ordre des vues selon le contexte (mobile/PWA/responsive ou desktop)
const viewOrder = computed(() => {
  if (isMobileOrResponsive.value) {
    // Sur mobile/PWA/responsive : Agenda en premier
    return ['timeline', 'participants', 'events', 'casts']
  }
  // Sur desktop : ordre actuel
  return ['participants', 'events', 'timeline', 'casts']
})

// État du dropdown pour mobile
const showViewDropdown = ref(false)
const dropdownButton = ref(null)
const dropdownContainer = ref(null)
const dropdownStyle = ref({})

// Computed pour les informations de la vue courante
const currentViewInfo = computed(() => {
  return {
    view: props.currentView,
    label: getViewLabel(props.currentView)
  }
})

// Computed pour toutes les vues avec leurs informations
const allViewsInfo = computed(() => {
  const views = ['timeline', 'participants', 'events', 'casts']
  return views.map(view => ({
    view,
    label: getViewLabel(view),
    isActive: view === props.currentView
  }))
})

// Fonction pour basculer le dropdown
function toggleViewDropdown() {
  showViewDropdown.value = !showViewDropdown.value
  if (showViewDropdown.value) {
    nextTick(() => updateDropdownPosition())
  }
}

// Fonction pour mettre à jour la position du dropdown
function updateDropdownPosition() {
  if (dropdownButton.value) {
    const rect = dropdownButton.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`
    }
  }
}

// Fonction pour sélectionner une vue et fermer le dropdown
function selectViewFromDropdown(view) {
  showViewDropdown.value = false
  selectView(view)
}

// Gestionnaire de clic en dehors du dropdown
function handleClickOutside(event) {
  if (showViewDropdown.value && 
      dropdownContainer.value && 
      !dropdownContainer.value.contains(event.target) &&
      dropdownButton.value &&
      !dropdownButton.value.contains(event.target)) {
    showViewDropdown.value = false
  }
}

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
    case 'casts': return 'Compositions'
    default: return 'Lignes'
  }
}

// Lifecycle hooks pour gérer les listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('resize', updateWindowWidth)
  // Initialiser la largeur
  updateWindowWidth()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('resize', updateWindowWidth)
})
</script>
