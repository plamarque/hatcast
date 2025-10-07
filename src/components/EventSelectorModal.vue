<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1400] md:p-4" @click="closeModal">
    <!-- Sur mobile: hauteur complète sans padding, sur desktop: centré avec padding -->
    <div class="flex md:items-center md:justify-center min-h-full h-full">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 md:rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-full md:h-auto md:max-h-[85vh]" @click.stop>
        <!-- Header -->
        <div class="p-6 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Filtrer les événements</h2>
            <button @click="closeModal" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">
              ✖️
            </button>
          </div>
        </div>
        
        <!-- Content - flexible pour prendre l'espace disponible -->
        <div class="p-6 flex flex-col flex-1 overflow-hidden">
          <!-- Input de recherche -->
          <div class="mb-4 flex-shrink-0">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un événement..."
              class="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              @keyup.escape="closeModal"
              ref="searchInput"
            />
          </div>
          
          <!-- Options de filtrage -->
          <div class="mb-4 flex-shrink-0">
            <div class="flex gap-2 text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="hidePastEvents"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span class="text-gray-300">Masquer les événements passés</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="hideArchivedEvents"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span class="text-gray-300">Masquer les événements archivés</span>
              </label>
            </div>
          </div>

          <!-- Liste des événements - prend tout l'espace restant -->
          <div class="flex-1 overflow-y-auto -mx-2 px-2">
            <!-- Option "Tous les événements" -->
            <div
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
            </div>
            
            <!-- Liste filtrée des événements -->
            <div
              v-for="event in filteredEvents"
              :key="event.id"
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
                <div v-if="event.archived" class="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-300 border border-gray-400/30" title="Événement archivé">
                  📁 Inactif
                </div>
                <div v-else-if="isEventPast(event.date)" class="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30" title="Événement passé">
                  ⏰ Passé
                </div>
                <div v-else class="text-xs px-2 py-1 rounded-full" :class="getEventStatusClass(event)" :title="getEventStatusText(event)">
                  {{ getEventStatusText(event) }}
                </div>
              </div>
            </div>
            
            <!-- Message si aucun résultat -->
            <div v-if="filteredEvents.length === 0" class="text-center py-8 text-gray-400">
              <div v-if="searchQuery.trim()">
                Aucun événement trouvé pour "{{ searchQuery }}"
              </div>
              <div v-else-if="hidePastEvents || hideArchivedEvents">
                Aucun événement correspond aux filtres sélectionnés
                <div class="text-xs mt-2 text-gray-500">
                  Essayez de désactiver les filtres "Masquer les événements passés" ou "Masquer les événements archivés"
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
const emit = defineEmits(['close', 'event-selected', 'all-events-selected'])

// État local
const searchQuery = ref('')
const searchInput = ref(null)
const hidePastEvents = ref(true)
const hideArchivedEvents = ref(true)

// Événements filtrés pour l'autocomplete
const filteredEvents = computed(() => {
  let filtered = [...props.events]
  
  // Appliquer le filtre de recherche par titre
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(event => event.title.toLowerCase().includes(query))
  }
  
  // Appliquer le filtre des événements passés
  if (hidePastEvents.value) {
    const now = new Date()
    filtered = filtered.filter(event => {
      if (!event.date) return true
      const eventDate = new Date(event.date)
      return eventDate >= now
    })
  }
  
  // Appliquer le filtre des événements archivés
  if (hideArchivedEvents.value) {
    filtered = filtered.filter(event => !event.archived)
  }
  
  return filtered.slice(0, 20) // Limiter à 20 résultats
})

// Fonctions
const closeModal = () => {
  emit('close')
}

const selectEvent = (event) => {
  emit('event-selected', event)
  closeModal()
}

const selectAllEvents = () => {
  emit('all-events-selected', {
    hidePastEvents: hidePastEvents.value,
    hideArchivedEvents: hideArchivedEvents.value
  })
  closeModal()
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
  // Convertir les classes existantes en format badge
  return colorClass.replace('text-', 'text-').replace('bg-', 'bg-') + ' border border-current/30'
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


// Focus sur l'input quand le modal s'ouvre
watch(() => props.show, (newShow) => {
  if (newShow) {
    nextTick(() => {
      searchInput.value?.focus()
      searchQuery.value = '' // Reset search query
    })
  }
})
</script>
