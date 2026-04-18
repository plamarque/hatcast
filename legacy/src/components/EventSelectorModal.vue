<template>
  <div v-if="show" data-testid="event-selector-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1400] md:p-4" @click="closeModalWithCheckboxes">
    <!-- Sur mobile: hauteur complète sans padding, sur desktop: centré avec padding -->
    <div class="flex md:items-center md:justify-center min-h-full h-full">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 md:rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-full md:h-auto md:max-h-[85vh]" @click.stop>
        <!-- Header -->
        <div class="p-3 md:p-6 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-lg md:text-2xl font-bold text-white">Filtrer les événements</h2>
            <button @click="closeModalWithCheckboxes" class="text-white/80 hover:text-white p-1.5 md:p-2 rounded-full hover:bg-white/10">
              ✖️
            </button>
          </div>
        </div>
        
        <!-- Content - flexible pour prendre l'espace disponible -->
        <div class="p-3 md:p-6 flex flex-col flex-1 overflow-hidden" @click="showFilterMenu = false">
          <!-- Input de recherche avec bouton filtre -->
          <div class="mb-3 md:mb-4 flex-shrink-0 relative flex items-center gap-2" @click.stop>
            <div class="flex-1 relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un événement..."
                class="w-full pl-3 pr-3 py-2 md:pl-4 md:pr-4 md:py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                @keyup.escape="closeModalWithCheckboxes"
                ref="searchInput"
              />
            </div>
            <!-- Bouton filtre -->
            <button
              @click.stop="showFilterMenu = !showFilterMenu"
              class="flex-shrink-0 p-2 rounded-lg hover:bg-gray-700 transition-colors relative"
              :class="activeFiltersCount > 0 ? 'text-purple-400' : 'text-gray-400'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <!-- Badge indicateur de filtres actifs -->
              <span v-if="activeFiltersCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {{ activeFiltersCount }}
              </span>
            </button>
            
            <!-- Menu contextuel des filtres -->
            <div
              v-if="showFilterMenu"
              class="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 py-2 px-3 min-w-[160px]"
              @click.stop
            >
              <div class="text-xs text-gray-400 mb-2 font-semibold">AFFICHER</div>
              <label class="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-700 rounded px-2 -mx-2">
                <input
                  v-model="showPastEvents"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
                />
                <span class="text-gray-200 text-sm">Passés</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer py-1.5 hover:bg-gray-700 rounded px-2 -mx-2">
                <input
                  v-model="showInactiveEvents"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
                />
                <span class="text-gray-200 text-sm">Inactifs</span>
              </label>
            </div>
          </div>

          <!-- Liste des événements - prend tout l'espace restant -->
          <div class="flex-1 overflow-y-auto -mx-2 px-2">
            <!-- Option "Tous les événements" -->
            <div
              data-testid="event-selector-option-all"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors mb-2"
              :class="!selectedEventId ? 'bg-purple-600/30 border border-purple-500/50' : ''"
              @click="selectAllEvents"
            >
              <div class="w-8 h-8 flex items-center justify-center bg-gray-600 rounded-full">
                <span class="text-sm font-bold">T</span>
              </div>
              <div class="flex-1">
                <span class="text-white font-medium">Tous les événements</span>
              </div>
              <input
                ref="allCheckboxRef"
                data-testid="event-selector-checkbox-all"
                type="checkbox"
                :checked="isAllChecked"
                @click.stop="toggleAllEvents"
                class="flex-shrink-0 w-5 h-5 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
                aria-label="Sélectionner ou désélectionner tous les événements"
              />
            </div>
            
            <!-- Liste filtrée des événements -->
            <div
              v-for="event in filteredEvents"
              :key="event.id"
              :data-testid="`event-selector-row-${event.id}`"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
              :class="selectedEventId === event.id ? 'bg-purple-600/30 border border-purple-500/50' : ''"
              @click="selectEvent(event)"
            >
              <!-- Icône de l'événement -->
              <div class="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full">
                <span class="text-lg">{{ getEventIcon(event) }}</span>
              </div>
              
              <!-- Informations de l'événement -->
              <div class="flex-1 min-w-0">
                <div class="text-white font-medium truncate">{{ event.title }}</div>
                <div class="text-gray-400 text-sm">{{ formatEventDate(event.date) }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ getEventStats(event) }}
                </div>
              </div>
              
              <!-- Statut de l'événement -->
              <div class="flex-shrink-0 flex flex-col items-end gap-1">
                <div v-if="event.archived" class="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-300" title="Événement archivé">
                  📁 Inactif
                </div>
                <div v-else-if="isEventPast(event.date)" class="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300" title="Événement passé">
                  ⏰ Passé
                </div>
                <div v-else class="text-xs px-2 py-1 rounded-full" :class="getEventStatusClass(event)" :title="getEventStatusText(event)">
                  {{ getEventStatusText(event) }}
                </div>
              </div>
              <input
                type="checkbox"
                :data-testid="`event-selector-checkbox-${event.id}`"
                :checked="checkedEventIds.has(event.id)"
                @click.stop="toggleEvent(event)"
                class="flex-shrink-0 w-5 h-5 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
                :aria-label="`Sélectionner ${event.title}`"
              />
            </div>
            
            <!-- Message si aucun résultat -->
            <div v-if="filteredEvents.length === 0" class="text-center py-8 text-gray-400">
              <div v-if="searchQuery.trim()">
                Aucun événement trouvé pour "{{ searchQuery }}"
              </div>
              <div v-else-if="!showPastEvents || !showInactiveEvents">
                Aucun événement actif à venir
                <div class="text-xs mt-2 text-gray-500">
                  Cochez "Passés" ou "Inactifs" pour voir plus d'événements
                </div>
              </div>
              <div v-else>
                Aucun événement disponible
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS } from '../services/storage.js'
import { getStatusLabel, getStatusColor } from '../services/eventStatusService.js'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  events: {
    type: Array,
    required: true
  },
  selectedEventId: {
    type: String,
    default: null
  },
  selectedEventIds: {
    type: [Array, Set],
    default: null
  },
  // Props pour calculer le statut des événements
  getSelectionPlayers: {
    type: Function,
    default: () => []
  },
  getTotalRequiredCount: {
    type: Function,
    default: () => 0
  },
  countAvailablePlayers: {
    type: Function,
    default: () => 0
  },
  countPlayersWithResponse: {
    type: Function,
    default: () => 0
  },
  isSelectionConfirmed: {
    type: Function,
    default: () => false
  },
  isSelectionConfirmedByOrganizer: {
    type: Function,
    default: () => false
  },
  casts: {
    type: Object,
    default: () => ({})
  },
  // Props pour les fonctionnalités de protection et statistiques
  isAvailable: {
    type: Function,
    default: () => false
  },
  players: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'event-selected', 'all-events-selected', 'events-selected'])

// État local
const searchQuery = ref('')
const searchInput = ref(null)
const allCheckboxRef = ref(null)
const checkedEventIds = ref(new Set())
const showPastEvents = ref(false)
const showInactiveEvents = ref(false)
const showFilterMenu = ref(false)

function initCheckedEventIds() {
  const ids = props.selectedEventIds
  if (ids && (Array.isArray(ids) ? ids.length : ids.size) > 0) {
    checkedEventIds.value = new Set(Array.isArray(ids) ? ids : Array.from(ids))
  } else if (props.selectedEventId) {
    checkedEventIds.value = new Set([props.selectedEventId])
  } else {
    checkedEventIds.value = new Set(props.events.map(e => e.id))
  }
}

// Calculer le nombre de filtres actifs
const activeFiltersCount = computed(() => {
  let count = 0
  if (showPastEvents.value) count++
  if (showInactiveEvents.value) count++
  return count
})

// Événements filtrés pour l'autocomplete
const filteredEvents = computed(() => {
  let filtered = [...props.events]
  
  // Appliquer le filtre de recherche par titre
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(event => event.title.toLowerCase().includes(query))
  }
  
  // Appliquer le filtre des événements passés (inversé : si NON coché, on masque)
  if (!showPastEvents.value) {
    const now = new Date()
    filtered = filtered.filter(event => {
      if (!event.date) return true
      const eventDate = new Date(event.date)
      return eventDate >= now
    })
  }
  
  // Appliquer le filtre des événements inactifs/archivés (inversé : si NON coché, on masque)
  if (!showInactiveEvents.value) {
    filtered = filtered.filter(event => !event.archived)
  }
  
  return filtered.slice(0, 20) // Limiter à 20 résultats
})

const allEventIds = computed(() => new Set(filteredEvents.value.map(e => e.id)))
const isAllChecked = computed(() => {
  if (allEventIds.value.size === 0) return false
  return [...allEventIds.value].every(id => checkedEventIds.value.has(id))
})
const isSomeChecked = computed(() => {
  const count = [...allEventIds.value].filter(id => checkedEventIds.value.has(id)).length
  return count > 0 && count < allEventIds.value.size
})

function toggleEvent(event) {
  const next = new Set(checkedEventIds.value)
  if (next.has(event.id)) {
    next.delete(event.id)
  } else {
    next.add(event.id)
  }
  checkedEventIds.value = next
}

function toggleAllEvents() {
  if (isAllChecked.value) {
    checkedEventIds.value = new Set()
  } else {
    checkedEventIds.value = new Set(allEventIds.value)
  }
}

// Fonctions
const closeModal = (applyCheckboxSelection = false) => {
  if (applyCheckboxSelection && checkedEventIds.value.size > 0) {
    emit('events-selected', Array.from(checkedEventIds.value))
  }
  emit('close')
}

const closeModalWithCheckboxes = () => {
  closeModal(true)
}

const selectEvent = (event) => {
  emit('event-selected', event)
  closeModal(false)
}

const selectAllEvents = () => {
  emit('all-events-selected', {
    showPastEvents: showPastEvents.value,
    showInactiveEvents: showInactiveEvents.value
  })
  closeModal(false)
}

// Fonction pour obtenir l'icône de l'événement
const getEventIcon = (event) => {
  return EVENT_TYPE_ICONS[event.templateType] || '❓'
}

// Fonction pour vérifier si un événement est passé
const isEventPast = (eventDate) => {
  if (!eventDate) return false
  const now = new Date()
  const eventDateObj = new Date(eventDate)
  return eventDateObj < now
}

// Fonction pour obtenir le statut d'un événement
const getEventStatus = (event) => {
  const eventId = event.id
  const selectedPlayers = props.getSelectionPlayers(eventId)
  const requiredCount = props.getTotalRequiredCount(event)
  const availableCount = props.countAvailablePlayers(eventId)
  const isConfirmedByOrganizer = props.isSelectionConfirmedByOrganizer(eventId)
  const isConfirmedByAllPlayers = props.isSelectionConfirmed(eventId)
  
  // Cas 0: Aucune composition → afficher "Prêt"
  if (selectedPlayers.length === 0) {
    return 'ready'
  }
  
  // Priorité : utiliser le statut calculé stocké en base
  const selection = props.casts[eventId]
  if (selection?.status && selection?.statusDetails) {
    return selection.status
  }

  // Cas 1: Composition incomplète
  if (selectedPlayers.length > 0) {
    const hasUnavailablePlayers = selectedPlayers.some(playerName => {
      // Vérifier si le joueur est disponible (nécessite une fonction isAvailable)
      return false // On ne peut pas vérifier sans isAvailable
    })
    const hasInsufficientPlayers = availableCount < requiredCount
    
    if (hasInsufficientPlayers) {
      return 'insufficient'
    }
  }
  
  // Cas 2: Pas assez de joueurs pour faire une composition
  if (availableCount < requiredCount) {
    return 'insufficient'
  }
  
  // Cas 3: Composition confirmée
  if (isConfirmedByOrganizer && isConfirmedByAllPlayers) {
    return 'confirmed'
  }
  
  // Cas 4: Composition en attente
  if (isConfirmedByOrganizer && !isConfirmedByAllPlayers) {
    return 'pending_confirmation'
  }
  
  // Cas 5: Composition complète mais non confirmée par l'organisateur
  if (selectedPlayers.length >= requiredCount) {
    return 'complete'
  }
  
  // Cas 6: Prêt pour la sélection
  return 'ready'
}


// Fonction pour obtenir le texte du statut (utilise la nomenclature standardisée)
const getEventStatusText = (event) => {
  const status = getEventStatus(event)
  return getStatusLabel(status)
}

// Fonction pour obtenir la classe CSS du statut (utilise la nomenclature standardisée)
const getEventStatusClass = (event) => {
  const status = getEventStatus(event)
  const colorClass = getStatusColor(status)
  // Convertir les classes existantes en format badge (sans bordure)
  return colorClass.replace('text-', 'text-').replace('bg-', 'bg-')
}

// Fonction pour obtenir les statistiques d'un événement
const getEventStats = (event) => {
  if (!props.players || props.players.length === 0) {
    return 'Aucune donnée'
  }
  
  const eventId = event.id
  let availableCount = 0
  let totalCount = props.players.length
  
  // Compter les joueurs disponibles pour cet événement
  props.players.forEach(player => {
    if (props.isAvailable(player.name, eventId)) {
      availableCount++
    }
  })
  
  // Obtenir le nombre de joueurs sélectionnés
  const selectedPlayers = props.getSelectionPlayers(eventId)
  const participationCount = selectedPlayers.length
  
  return `${availableCount} dispos / ${participationCount} participations`
}


// Focus sur l'input et initialiser les cases à cocher quand le modal s'ouvre
watch(() => props.show, (newShow) => {
  if (newShow) {
    showFilterMenu.value = false
    searchQuery.value = ''
    initCheckedEventIds()
    nextTick(() => {
      searchInput.value?.focus()
      if (allCheckboxRef.value) {
        allCheckboxRef.value.indeterminate = isSomeChecked.value
      }
    })
  }
})

watch(() => checkedEventIds.value.size, () => {
  nextTick(() => {
    if (allCheckboxRef.value) {
      allCheckboxRef.value.indeterminate = isSomeChecked.value
    }
  })
}, { immediate: true })
</script>
