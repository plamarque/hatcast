<template>
  <div class="timeline-view">
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
          class="event-item flex items-center gap-3 md:gap-6 p-3 md:p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-200 cursor-pointer border border-gray-700/30"
          @click="$emit('event-click', event)"
        >
          <!-- Date compacte (numéro + jour) -->
          <div class="date-section flex-shrink-0 text-center">
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
            <!-- Indicateur de statut coloré (barre verticale) -->
            <div 
              class="status-indicator w-1 h-8 rounded-full flex-shrink-0"
              :class="getStatusColor(event.id)"
            ></div>
            
            <!-- Cellule de disponibilité -->
            <div class="availability-cell flex-shrink-0">
              <!-- Debug: selectedPlayerId = {{ selectedPlayerId }} -->
              <AvailabilityCell
                v-if="selectedPlayerId"
                :player-name="selectedPlayer.name"
                :event-id="event.id"
                :is-available="getPlayerAvailability(event.id)"
                :is-selected="isPlayerSelected(event.id)"
                :is-selection-confirmed="isSelectionConfirmed(event.id)"
                :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(event.id)"
                :player-selection-status="getPlayerSelectionStatus(event.id)"
                :season-id="seasonId"
                :disabled="event.archived === true"
                :availability-data="getAvailabilityData(event.id)"
                :event-title="event.title"
                :event-date="event.date ? event.date.toISOString() : ''"
                :is-protected="isPlayerProtected(event.id)"
                :player-gender="selectedPlayer.gender || 'non-specified'"
                @toggle="handleAvailabilityToggle"
                @toggle-selection-status="handleSelectionStatusToggle"
                @show-availability-modal="handleShowAvailabilityModal"
              />
              <!-- Statut global si aucun joueur sélectionné -->
              <div v-else class="status-text flex-shrink-0 min-w-0">
                <div class="text-sm font-semibold" :class="getStatusTextColor(event.id)">
                  {{ getEventStatus(event.id) }}
                </div>
              </div>
            </div>
            
            <!-- Titre de l'événement -->
            <div class="event-title flex-1 min-w-0">
              <div class="text-white font-medium text-base truncate">
                {{ event.title || 'Sans titre' }}
              </div>
              <div v-if="event.location" class="text-xs text-gray-400 truncate mt-1">
                📍 {{ event.location }}
              </div>
            </div>
            
            <!-- Icône du type d'événement -->
            <div class="event-icon flex-shrink-0 text-xl">
              {{ getEventTypeIcon(event) }}
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
import AvailabilityCell from './AvailabilityCell.vue'

export default {
  name: 'TimelineView',
  components: {
    AvailabilityCell
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
    }
  },
  emits: [
    'event-click',
    'player-click',
    'view-change',
    'availability-toggle',
    'selection-status-toggle',
    'show-availability-modal'
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
    
    const getEventStatus = (eventId) => {
      // Si un joueur spécifique est sélectionné, utiliser les données de disponibilité
      if (props.selectedPlayerId && props.availability && eventId) {
        try {
          const eventAvailability = props.availability[eventId]
          if (!eventAvailability) return 'Non renseigné'
          
          const totalPlayers = Object.keys(eventAvailability).length
          if (totalPlayers === 0) return 'Non renseigné'
          
          const availableCount = Object.values(eventAvailability).filter(status => 
            status === 'available' || status === 'confirmed'
          ).length
          
          if (availableCount === 0) return 'Aucune disponibilité'
          if (availableCount === totalPlayers) return 'Tous disponibles'
          return `${availableCount} dispo`
        } catch (error) {
          console.warn('Erreur lors du calcul du statut:', error)
          return 'Non renseigné'
        }
      }
      
      // Si "Tous" est sélectionné, afficher le statut général de l'événement/sélection
      if (props.events && eventId) {
        const event = props.events.find(e => e.id === eventId)
        if (!event) return 'Non renseigné'
        
        // Utiliser les fonctions de statut de sélection si disponibles
        if (props.getSelectionPlayers && props.getTotalRequiredCount && props.countAvailablePlayers) {
          const selectedPlayers = props.getSelectionPlayers(eventId)
          const requiredCount = props.getTotalRequiredCount(event)
          const availableCount = props.countAvailablePlayers(eventId)
          const isConfirmedByOrganizer = props.isSelectionConfirmedByOrganizer ? props.isSelectionConfirmedByOrganizer(eventId) : false
          const isConfirmedByAllPlayers = props.isSelectionConfirmed ? props.isSelectionConfirmed(eventId) : false
          
          // Cas 0: Aucune composition → afficher "Prêt"
          if (selectedPlayers.length === 0) {
            return 'Prêt'
          }
          
          // Priorité : utiliser le statut calculé stocké en base
          if (props.casts && props.casts[eventId]?.status && props.casts[eventId]?.statusDetails) {
            const status = props.casts[eventId].status
            switch (status) {
              case 'ready': return 'Prêt'
              case 'complete': return 'Complet'
              case 'confirmed': return 'Confirmé'
              case 'pending_confirmation': return 'À confirmer'
              case 'incomplete': return 'Incomplet'
              case 'insufficient': return 'Insuffisant'
              default: return 'Prêt'
            }
          }

          // Cas 1: Composition incomplète
          if (selectedPlayers.length > 0) {
            const hasUnavailablePlayers = selectedPlayers.some(playerName => !props.isAvailable(playerName, eventId))
            const hasInsufficientPlayers = availableCount < requiredCount
            
            if (hasUnavailablePlayers || hasInsufficientPlayers) {
              return 'Incomplet'
            }
          }
          
          // Cas 2: Pas assez de joueurs
          if (availableCount < requiredCount) {
            return 'Insuffisant'
          }
          
          // Cas 3: Composition confirmée par l'organisateur ET par tous les joueurs
          if (isConfirmedByAllPlayers) {
            return 'Confirmé'
          }
          
          // Cas 4: Composition confirmée par l'organisateur mais pas encore par tous les joueurs
          if (isConfirmedByOrganizer) {
            return 'À confirmer'
          }
          
          // Cas 5: Composition complète mais non confirmée par l'organisateur
          return 'Complet'
        }
        
        // Fallback si les fonctions ne sont pas disponibles
        return 'Prêt'
      }
      
      return 'Non renseigné'
    }
    
    const getStatusColor = (eventId) => {
      // Si un joueur spécifique est sélectionné, utiliser les données de disponibilité
      if (props.selectedPlayerId && props.availability && eventId) {
        try {
          const eventAvailability = props.availability[eventId]
          if (!eventAvailability) return 'bg-gray-500'
          
          const totalPlayers = Object.keys(eventAvailability).length
          if (totalPlayers === 0) return 'bg-gray-500'
          
          const availableCount = Object.values(eventAvailability).filter(status => 
            status === 'available' || status === 'confirmed'
          ).length
          
          if (availableCount === 0) return 'bg-red-500'
          if (availableCount === totalPlayers) return 'bg-green-500'
          return 'bg-purple-500'
        } catch (error) {
          console.warn('Erreur lors du calcul de la couleur:', error)
          return 'bg-gray-500'
        }
      }
      
      // Si "Tous" est sélectionné, utiliser les couleurs de statut de sélection
      if (props.events && eventId) {
        const event = props.events.find(e => e.id === eventId)
        if (!event) return 'bg-gray-500'
        
        // Utiliser les fonctions de statut de sélection si disponibles
        if (props.getSelectionPlayers && props.getTotalRequiredCount && props.countAvailablePlayers) {
          const selectedPlayers = props.getSelectionPlayers(eventId)
          const requiredCount = props.getTotalRequiredCount(event)
          const availableCount = props.countAvailablePlayers(eventId)
          const isConfirmedByOrganizer = props.isSelectionConfirmedByOrganizer ? props.isSelectionConfirmedByOrganizer(eventId) : false
          const isConfirmedByAllPlayers = props.isSelectionConfirmed ? props.isSelectionConfirmed(eventId) : false
          
          // Cas 0: Aucune composition → vert (Prêt)
          if (selectedPlayers.length === 0) {
            return 'bg-green-500'
          }
          
          // Priorité : utiliser le statut calculé stocké en base
          if (props.casts && props.casts[eventId]?.status && props.casts[eventId]?.statusDetails) {
            const status = props.casts[eventId].status
            switch (status) {
              case 'ready': return 'bg-green-500'
              case 'complete': return 'bg-blue-500'
              case 'confirmed': return 'bg-green-600'
              case 'pending_confirmation': return 'bg-yellow-500'
              case 'incomplete': return 'bg-orange-500'
              case 'insufficient': return 'bg-red-500'
              default: return 'bg-green-500'
            }
          }

          // Cas 1: Composition incomplète
          if (selectedPlayers.length > 0) {
            const hasUnavailablePlayers = selectedPlayers.some(playerName => !props.isAvailable(playerName, eventId))
            const hasInsufficientPlayers = availableCount < requiredCount
            
            if (hasUnavailablePlayers || hasInsufficientPlayers) {
              return 'bg-orange-500'
            }
          }
          
          // Cas 2: Pas assez de joueurs
          if (availableCount < requiredCount) {
            return 'bg-red-500'
          }
          
          // Cas 3: Composition confirmée par l'organisateur ET par tous les joueurs
          if (isConfirmedByAllPlayers) {
            return 'bg-green-600'
          }
          
          // Cas 4: Composition confirmée par l'organisateur mais pas encore par tous les joueurs
          if (isConfirmedByOrganizer) {
            return 'bg-yellow-500'
          }
          
          // Cas 5: Composition complète mais non confirmée par l'organisateur
          return 'bg-blue-500'
        }
        
        // Fallback si les fonctions ne sont pas disponibles
        return 'bg-green-500'
      }
      
      return 'bg-gray-500'
    }
    
    const getStatusTextColor = (eventId) => {
      if (!props.availability || !eventId) return 'text-gray-400'
      
      try {
        const eventAvailability = props.availability[eventId]
        if (!eventAvailability) return 'text-gray-400'
        
        const totalPlayers = Object.keys(eventAvailability).length
        if (totalPlayers === 0) return 'text-gray-400'
        
        const availableCount = Object.values(eventAvailability).filter(status => 
          status === 'available' || status === 'confirmed'
        ).length
        
        if (availableCount === 0) return 'text-red-400'
        if (availableCount === totalPlayers) return 'text-green-400'
        return 'text-purple-400'
      } catch (error) {
        console.warn('Erreur lors du calcul de la couleur du texte:', error)
        return 'text-gray-400'
      }
    }
    
    // Fonctions pour la disponibilité du joueur sélectionné
    const getPlayerAvailability = (eventId) => {
      if (!props.selectedPlayerId || !props.availability || !eventId) return false
      try {
        const eventAvailability = props.availability[eventId]
        if (!eventAvailability) return false
        return eventAvailability[props.selectedPlayerId] === 'available' || eventAvailability[props.selectedPlayerId] === 'confirmed'
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
    
    return {
      // Variables réactives
      showPlayerModal,
      
      // Computed properties
      selectedPlayer,
      groupedEventsByMonth,
      
      // Fonctions utilitaires
      getEventStatus,
      getStatusColor,
      getStatusTextColor,
      getEventTypeIcon,
      
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
      handleShowAvailabilityModal
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