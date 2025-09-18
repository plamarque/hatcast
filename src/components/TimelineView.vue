<template>
  <div class="timeline-view bg-gray-900 relative z-[50] pt-6 pb-28">
    <!-- Contenu principal -->
    <div class="timeline-content">
      <!-- Debug info -->
      <div v-if="groupedEventsByMonth.length === 0" class="text-center py-12 text-white">
        <div>Debug: groupedEventsByMonth.length = {{ groupedEventsByMonth.length }}</div>
        <div>Events count: {{ events?.length || 0 }}</div>
      </div>
      
      <!-- Liste des mois avec événements -->
      <div v-for="monthData in groupedEventsByMonth" :key="monthData.monthKey" class="month-section mb-8 max-w-4xl mx-auto px-4">
      <!-- Séparateur de mois -->
      <div class="month-separator flex items-center gap-4 mb-6">
        <div class="flex-1 h-px bg-gray-600"></div>
        <div class="month-title text-xl font-bold text-white px-4 py-2 bg-gray-800/50 rounded-lg">
          {{ monthData.monthName }}
        </div>
        <div class="flex-1 h-px bg-gray-600"></div>
      </div>
      
      <!-- Liste des événements du mois -->
      <div class="events-list space-y-2 md:space-y-4">
        <div
          v-for="event in monthData.events"
          :key="event.id"
          class="event-item flex items-center gap-3 md:gap-6 p-3 md:p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-200 cursor-pointer border border-gray-700/30 relative"
          @click="$emit('event-click', event)"
        >
          <!-- Date compacte (numéro + jour) -->
          <div class="date-section flex-shrink-0 text-center w-16">
            <div class="date-number text-3xl font-bold text-white leading-none">
              {{ event.dayNumber }}
            </div>
            <div class="day-name text-xs text-gray-300 font-medium mt-1">
              {{ event.dayName }}
            </div>
          </div>
          
          <!-- Séparateur vertical -->
          <div class="separator w-px h-12 bg-gray-600 flex-shrink-0"></div>
          
          <!-- Contenu de l'événement -->
          <div class="event-content flex-1 flex items-center gap-2 md:gap-4">
            <!-- Cellule de disponibilité -->
            <div class="availability-cell flex-shrink-0">
              <AvailabilityCell
                v-if="selectedPlayerId"
                :player-name="selectedPlayer.name"
                :event-id="event.id"
                :is-available="isAvailable(selectedPlayer.name, event.id)"
                :is-selected="isPlayerSelected(selectedPlayer.name, event.id)"
                :is-selection-confirmed="isSelectionConfirmed(event.id)"
                :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(event.id)"
                :player-selection-status="getPlayerSelectionStatus(selectedPlayer.name, event.id)"
                :season-id="seasonId"
                :player-gender="selectedPlayer.gender || 'non-specified'"
                :chance-percent="chances?.[selectedPlayer.name]?.[event.id] ?? null"
                :show-selected-chance="isSelectionComplete ? isSelectionComplete(event.id) : false"
                :disabled="event.archived === true"
                :availability-data="getAvailabilityData(selectedPlayer.name, event.id)"
                :event-title="event.title"
                :event-date="event.date ? event.date.toISOString() : ''"
                :is-protected="isPlayerProtected(event.id)"
                @toggle="handleAvailabilityToggle"
                @toggle-selection-status="handleSelectionStatusToggle"
                @show-availability-modal="handleShowAvailabilityModal"
              />
            </div>
            
            <!-- Titre de l'événement -->
            <div class="event-title flex-1 min-w-0 md:max-w-2xl">
              <div class="flex items-center gap-3">
                <!-- Icône du type d'événement -->
                <div class="event-icon flex-shrink-0 text-xl">
                  {{ getEventTypeIcon(event) }}
                </div>
                <div class="text-white font-medium text-base line-clamp-2 leading-tight flex-1 min-w-0">
                  {{ event.title || 'Sans titre' }}
                </div>
              </div>
              <div v-if="event.location" class="text-xs text-gray-400 truncate mt-1">
                📍 {{ event.location }}
              </div>
              
              <!-- Badge de statut en dessous sur mobile, à droite sur desktop -->
              <div class="event-status mt-2 flex justify-start md:mt-0 md:absolute md:right-2 md:top-1/2 md:transform md:-translate-y-1/2">
                <StatusBadge 
                  :event-id="event.id" 
                  :event-status="getEventStatus(event.id)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <!-- Message si aucun événement -->
      <div v-if="groupedEventsByMonth.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📅</div>
        <div class="text-white text-lg mb-2">Aucun événement</div>
        <div class="text-gray-400 text-sm">Les événements apparaîtront ici</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { EVENT_TYPE_ICONS } from '../services/storage.js'
import { getEventStatusWithSelection } from '../services/eventStatusService.js'
import AvailabilityCell from './AvailabilityCell.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import StatusBadge from './StatusBadge.vue'

export default {
  name: 'TimelineView',
  components: {
    AvailabilityCell,
    PlayerAvatar,
    StatusBadge
  },
  props: {
    events: {
      type: Array,
      default: () => []
    },
    players: {
      type: Array,
      default: () => []
    },
    availability: {
      type: Object,
      default: () => ({})
    },
    casts: {
      type: Object,
      default: () => ({})
    },
    seasonId: {
      type: String,
      required: true
    },
    selectedPlayerId: {
      type: String,
      default: null
    },
    preferredPlayerIdsSet: {
      type: Set,
      default: () => new Set()
    },
    isAvailable: {
      type: Function,
      default: () => false
    },
    isPlayerSelected: {
      type: Function,
      default: () => false
    },
    isSelectionConfirmed: {
      type: Function,
      default: () => false
    },
    isSelectionConfirmedByOrganizer: {
      type: Function,
      default: () => false
    },
    getPlayerSelectionStatus: {
      type: Function,
      default: () => 'pending'
    },
    getAvailabilityData: {
      type: Function,
      default: () => ({})
    },
    isPlayerProtectedInGrid: {
      type: Function,
      default: () => false
    },
    chances: {
      type: Object,
      default: () => ({})
    },
    isSelectionComplete: {
      type: Function,
      default: () => false
    }
  },
  emits: [
    'event-click',
    'player-click',
    'view-change',
    'availability-toggle',
    'selection-status-toggle',
    'show-availability-modal',
    'player-selected',
    'all-players-selected'
  ],
  props: {
    events: Array,
    players: Array,
    availability: Object,
    casts: Object,
    seasonId: String,
    selectedPlayerId: String,
    preferredPlayerIdsSet: Set,
    isAvailable: Function,
    isPlayerSelected: Function,
    isSelectionConfirmed: Function,
    isSelectionConfirmedByOrganizer: Function,
    getPlayerSelectionStatus: Function,
    getAvailabilityData: Function,
    isPlayerProtectedInGrid: Function,
    getSelectionPlayers: Function,
    getTotalRequiredCount: Function,
    countAvailablePlayers: Function
  },
  setup(props, { emit }) {
    // Variables réactives
    const showPlayerModal = ref(false)
    
    // Computed properties
    const selectedPlayer = computed(() => {
      if (!props.selectedPlayerId || !props.players) return null
      return props.players.find(p => p.id === props.selectedPlayerId) || null
    })
    
    // Grouper les événements par mois
    const groupedEventsByMonth = computed(() => {
      console.log('TimelineView: groupedEventsByMonth computed, events:', props.events)

      // Vérifier que les données sont disponibles
      if (!props.events || !Array.isArray(props.events)) {
        console.log('TimelineView: Pas d\'événements ou pas un tableau')
        return []
      }

      const months = {}

      props.events.forEach(event => {
        if (!event || event.archived) return // Ignorer les événements archivés ou invalides

        try {
          const date = new Date(event.date)
          if (isNaN(date.getTime())) {
            console.warn('TimelineView: Date invalide pour l\'événement:', event)
            return
          }

          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          const monthName = getMonthYearName(date)

          if (!months[monthKey]) {
            months[monthKey] = {
              monthKey: monthKey,
              monthName: monthName,
              year: date.getFullYear(),
              month: date.getMonth(),
              events: []
            }
          }

          months[monthKey].events.push({
            ...event,
            date: date,
            dayNumber: date.getDate(),
            dayName: getDayName(date)
          })
        } catch (error) {
          console.warn('Erreur lors du traitement de l\'événement:', event, error)
        }
      })

      // Trier les événements dans chaque mois par date
      Object.values(months).forEach(month => {
        month.events.sort((a, b) => a.date - b.date)
      })

      const result = Object.values(months).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })

      console.log('TimelineView: groupedEventsByMonth result:', result)
      return result
    })
    
    // Fonctions utilitaires
    const getMonthYearName = (date) => {
      if (!date || !(date instanceof Date)) return 'Mois inconnu'
      const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
      return `${months[date.getMonth()]} ${date.getFullYear()}`
    }
    
    const getDayName = (date) => {
      if (!date || !(date instanceof Date)) return '?'
      const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
      return days[date.getDay()]
    }
    
    const getEventTypeIcon = (event) => {
      if (!event || !event.templateType) return '❓'
      return EVENT_TYPE_ICONS[event.templateType] || '❓'
    }
    
    const getPlayerName = (playerId) => {
      if (!props.players) return 'Joueur inconnu'
      const player = props.players.find(p => p.id === playerId)
      return player?.name || 'Joueur inconnu'
    }
    
    const getPlayerGender = (playerId) => {
      if (!props.players) return 'non-specified'
      const player = props.players.find(p => p.id === playerId)
      return player?.gender || 'non-specified'
    }
    
    const getEventStatus = (eventId) => {
      if (props.events && eventId) {
        const event = props.events.find(e => e.id === eventId)
        if (!event) return 'ready'
        
        return getEventStatusWithSelection(event, {
          getSelectionPlayers: props.getSelectionPlayers,
          getTotalRequiredCount: props.getTotalRequiredCount,
          countAvailablePlayers: props.countAvailablePlayers,
          isSelectionConfirmed: props.isSelectionConfirmed,
          isSelectionConfirmedByOrganizer: props.isSelectionConfirmedByOrganizer,
          casts: props.casts,
          selectedPlayerId: props.selectedPlayerId,
          availability: props.availability
        })
      }
      
      return 'ready'
    }
    
    
    
    // Fonctions pour la disponibilité du joueur sélectionné
    const getPlayerAvailability = (eventId) => {
      if (!props.selectedPlayerId || !props.availability || !eventId) {
        console.log('🔍 getPlayerAvailability: missing data', { selectedPlayerId: props.selectedPlayerId, availability: props.availability, eventId })
        return false
      }
      try {
        const playerAvailability = props.availability[props.selectedPlayerId]
        if (!playerAvailability) {
          console.log('🔍 getPlayerAvailability: no player availability for', props.selectedPlayerId)
          return false
        }
        const eventAvailability = playerAvailability[eventId]
        if (!eventAvailability) {
          console.log('🔍 getPlayerAvailability: no event availability for', eventId, 'for player', props.selectedPlayerId)
          return false
        }
        
        // Gestion du nouveau format avec rôles
        if (typeof eventAvailability === 'object' && eventAvailability.available !== undefined) {
          const isAvailable = eventAvailability.available === true
          console.log('🔍 getPlayerAvailability (new format):', { eventId, selectedPlayerId: props.selectedPlayerId, eventAvailability, isAvailable })
          return isAvailable
        }
        
        // Fallback pour l'ancien format (boolean direct)
        const isAvailable = eventAvailability === true
        console.log('🔍 getPlayerAvailability (old format):', { eventId, selectedPlayerId: props.selectedPlayerId, eventAvailability, isAvailable })
        return isAvailable
      } catch (error) {
        console.warn('Erreur lors de la vérification de la disponibilité:', error)
        return false
      }
    }
    
    // Utiliser les fonctions passées en props
    const isPlayerSelected = props.isPlayerSelected
    const isSelectionConfirmed = props.isSelectionConfirmed
    const isSelectionConfirmedByOrganizer = props.isSelectionConfirmedByOrganizer
    const getPlayerSelectionStatus = props.getPlayerSelectionStatus
    const getAvailabilityData = props.getAvailabilityData
    const isPlayerProtected = props.isPlayerProtectedInGrid
    
    // Handlers pour les événements de disponibilité
    const handleAvailabilityToggle = (playerName, eventId) => {
      emit('availability-toggle', playerName, eventId)
    }
    
    const handleSelectionStatusToggle = (playerName, eventId, status, seasonId) => {
      emit('selection-status-toggle', playerName, eventId, status, seasonId)
    }
    
    const handleShowAvailabilityModal = (data) => {
      emit('show-availability-modal', data)
    }
    
    // Handlers pour la sélection de participants
    const handlePlayerSelected = (player) => {
      emit('player-selected', player)
    }
    
    const handleAllPlayersSelected = () => {
      emit('all-players-selected')
    }
    
    return {
      // Variables réactives
      showPlayerModal,
      
      // Computed properties
      selectedPlayer,
      groupedEventsByMonth,
      
      // Fonctions utilitaires
      getEventStatus,
      getEventTypeIcon,
      getPlayerName,
      getPlayerGender,
      
      // Fonctions pour la disponibilité
      getPlayerAvailability,
      isPlayerSelected,
      isSelectionConfirmed,
      isSelectionConfirmedByOrganizer,
      getPlayerSelectionStatus,
      getAvailabilityData,
      isPlayerProtected,
      
      // Handlers
      handleAvailabilityToggle,
      handleSelectionStatusToggle,
      handleShowAvailabilityModal,
      handlePlayerSelected,
      handleAllPlayersSelected
    }
  }
}
</script>

<style scoped>
.timeline-view {
  color: white;
  background-color: #111827;
  min-height: 100vh;
  width: 100%;
}

.month-section {
  margin-bottom: 3rem;
}

.month-separator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.month-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  padding: 0.5rem 1rem;
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 0.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  transition: all 0.2s;
}

.event-item:hover {
  transform: scale(1.01);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.status-indicator {
  border-radius: 9999px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.event-title {
  min-width: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date-section {
  text-align: center;
}

.separator {
  width: 1px;
  height: 3rem;
  background-color: #4b5563;
  flex-shrink: 0;
}

/* Améliorer le contraste et les couleurs */
.date-number {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.day-name {
  color: #d1d5db;
  font-weight: 500;
}

/* Couleurs vives pour les statuts */
.status-indicator.bg-red-500 {
  background-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.status-indicator.bg-green-500 {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-indicator.bg-purple-500 {
  background-color: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
}

.status-indicator.bg-gray-500 {
  background-color: #6b7280;
  box-shadow: 0 0 8px rgba(107, 114, 128, 0.5);
}
</style>