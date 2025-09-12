<template>
  <div v-if="selectedEvent" class="space-y-4">
    <!-- En-tête avec titre et statut -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">
        {{ selectedEvent.title }}
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-400">
          {{ formatEventDate(selectedEvent.date) }}
        </span>
        <div v-if="eventStatus" class="flex items-center gap-1">
          <span 
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="getStatusBadgeClass(eventStatus.type)"
            :title="eventStatus.message"
          >
            {{ eventStatus.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Affichage par rôles -->
    <div class="space-y-3">
      <div 
        v-for="role in availableRoles" 
        :key="role"
        class="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
      >
        <!-- En-tête du rôle -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ ROLE_EMOJIS[role] }}</span>
            <span class="font-medium text-white">{{ getRoleLabel(role) }}</span>
            <span class="text-sm text-gray-400">
              ({{ getAvailableCountForRole(role) }}/{{ getRequiredCountForRole(role) }})
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Indicateur de statut du rôle -->
            <div 
              class="w-3 h-3 rounded-full"
              :class="getRoleStatusClass(role)"
              :title="getRoleStatusTooltip(role)"
            ></div>
            <span class="text-xs text-gray-400">
              {{ getRoleStatusText(role) }}
            </span>
          </div>
        </div>

        <!-- Liste des joueurs disponibles pour ce rôle -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div
            v-for="player in getPlayersForRole(role)"
            :key="player.id"
            class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50 transition-colors"
          >
            <!-- Avatar du joueur -->
            <div class="relative flex-shrink-0">
              <PlayerAvatar 
                :player-id="player.id"
                :season-id="seasonId"
                :player-name="player.name"
                :player-gender="player.gender || 'non-specified'"
                size="sm"
              />
              <!-- Statuts superposés -->
              <span
                v-if="preferredPlayerIdsSet.has(player.id)"
                class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center border border-gray-700"
                title="Ma personne"
              >
                ⭐
              </span>
              <span
                v-else-if="isPlayerProtectedInGrid(player.id)"
                class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center border border-gray-700"
                title="Personne protégée par mot de passe"
              >
                🔒
              </span>
            </div>

            <!-- Nom du joueur -->
            <span class="text-white text-sm flex-1 min-w-0 truncate">
              {{ player.name }}
            </span>

            <!-- Indicateurs de statut -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Statut de sélection -->
              <span 
                v-if="isPlayerSelected(player.name, selectedEvent.id)"
                class="px-2 py-1 rounded text-xs font-medium"
                :class="isSelectionConfirmed(selectedEvent.id) 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                  : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'"
              >
                {{ isSelectionConfirmed(selectedEvent.id) 
                  ? (player.gender === 'female' ? 'Confirmée' : player.gender === 'male' ? 'Confirmé' : 'Confirmé·e')
                  : (player.gender === 'female' ? 'Sélectionnée' : player.gender === 'male' ? 'Sélectionné' : 'Sélectionné·e') }}
              </span>
              
              <!-- Pourcentage de chance -->
              <span 
                v-if="chances[player.name]?.[selectedEvent.id] !== null && chances[player.name]?.[selectedEvent.id] !== undefined"
                class="px-2 py-1 rounded text-xs font-medium bg-purple-600/20 text-purple-400 border border-purple-600/30"
              >
                {{ chances[player.name]?.[selectedEvent.id] }}%
              </span>
            </div>
          </div>

          <!-- Message si aucun joueur disponible -->
          <div 
            v-if="getPlayersForRole(role).length === 0"
            class="col-span-full text-center py-4 text-gray-400 text-sm"
          >
            Aucun joueur disponible pour ce rôle
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import { 
  ROLES, 
  ROLE_EMOJIS, 
  ROLE_LABELS_SINGULAR, 
  ROLE_DISPLAY_ORDER,
  getRoleLabel 
} from '../services/storage.js'

const props = defineProps({
  selectedEvent: {
    type: Object,
    default: null
  },
  seasonId: {
    type: String,
    required: true
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
  chances: {
    type: Object,
    default: () => ({})
  },
  preferredPlayerIdsSet: {
    type: Set,
    default: () => new Set()
  },
  // Fonctions passées depuis le composant parent
  isAvailable: {
    type: Function,
    required: true
  },
  isPlayerSelected: {
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
  getAvailabilityData: {
    type: Function,
    required: true
  },
  isPlayerProtectedInGrid: {
    type: Function,
    required: true
  },
  isPlayerLoading: {
    type: Function,
    required: true
  },
  isPlayerAvailabilityLoaded: {
    type: Function,
    required: true
  },
  isPlayerError: {
    type: Function,
    required: true
  },
  getEventStatus: {
    type: Function,
    required: true
  },
  getEventTooltip: {
    type: Function,
    required: true
  },
  handleAvailabilityToggle: {
    type: Function,
    required: true
  },
  handlePlayerSelectionStatusToggle: {
    type: Function,
    required: true
  },
  openAvailabilityModal: {
    type: Function,
    required: true
  },
  isAvailableForRole: {
    type: Function,
    required: true
  },
  isSelectionComplete: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['close'])

// Computed properties
const availableRoles = computed(() => {
  if (!props.selectedEvent?.roles) return []
  
  return ROLE_DISPLAY_ORDER.filter(role => {
    const count = props.selectedEvent.roles[role] || 0
    return count > 0
  })
})


const eventStatus = computed(() => {
  if (!props.selectedEvent) return null
  return props.getEventStatus(props.selectedEvent.id)
})

// Fonctions utilitaires
function formatEventDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getRequiredCountForRole(role) {
  return props.selectedEvent?.roles?.[role] || 0
}

function getAvailableCountForRole(role) {
  return getPlayersForRole(role).length
}

function getPlayersForRole(role) {
  if (!props.selectedEvent) return []
  
  return props.players.filter(player => {
    return props.isAvailableForRole(player.name, role, props.selectedEvent.id)
  })
}

function getRoleStatusClass(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return 'bg-green-500'
  } else if (available > 0) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
}

function getRoleStatusTooltip(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return `Rôle complet : ${available}/${required} joueurs`
  } else if (available > 0) {
    return `Rôle incomplet : ${available}/${required} joueurs (manque ${required - available})`
  } else {
    return `Aucun joueur disponible : 0/${required} joueurs`
  }
}

function getRoleStatusText(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return 'Complet'
  } else if (available > 0) {
    return `Manque ${required - available}`
  } else {
    return 'Aucun'
  }
}

function getStatusBadgeClass(statusType) {
  switch (statusType) {
    case 'complete':
      return 'bg-green-600/20 text-green-400 border border-green-600/30'
    case 'incomplete':
      return 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
    case 'insufficient':
      return 'bg-red-600/20 text-red-400 border border-red-600/30'
    default:
      return 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
  }
}
</script>
