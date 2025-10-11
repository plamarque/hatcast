<template>
  <div 
    class="flex items-center justify-center transition-all duration-200 font-medium text-white relative w-full h-full rounded-lg px-2 py-1 border"
    :class="[
      canEdit ? 'cursor-pointer hover:scale-105' : 'cursor-default',
      compact ? 'p-1 md:p-2 text-xs' : 'text-sm',
      getCellStatusClass()
    ]"
    @click.stop="handleClick"
  >
    <div class="flex flex-col items-center justify-center h-full min-h-[4rem]">
      <!-- Affichage des sélections -->
      <template v-if="isSelected">
        <!-- Affichage avec confirmation (2 lignes) -->
        <template v-if="playerSelectionStatus && playerSelectionStatus !== 'none'">
          <!-- Ligne 1: nom du rôle -->
          <div class="text-center">
            <span class="text-sm font-medium">
              {{ playerSelectionStatus === 'declined' ? 'Décliné' : getConfirmedRoleLabel() }}
            </span>
          </div>
          <!-- Ligne 2: emoji avec espacement cohérent -->
          <div class="flex items-center justify-center mt-1">
            <span class="text-lg">
              {{ playerSelectionStatus === 'pending' ? '⏳' : getRoleEmoji() }}
            </span>
          </div>
        </template>
        
        <!-- Affichage simple sélectionné (sans confirmation) -->
        <template v-else>
          <div class="flex flex-col items-center gap-1">
            <span class="text-sm font-medium">Sélectionné</span>
            <span class="text-lg">🎯</span>
          </div>
        </template>
      </template>
      
      <!-- Pas sélectionné -->
      <template v-else>
        <span class="text-center text-gray-400">
          -
        </span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ROLE_EMOJIS, ROLE_LABELS_SINGULAR, getRoleLabel } from '../services/storage.js'
import { getStatusClass } from '../utils/statusUtils.js'

// Props
const props = defineProps({
  playerName: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isSelectionConfirmed: {
    type: Boolean,
    default: false
  },
  isSelectionConfirmedByOrganizer: {
    type: Boolean,
    default: false
  },
  selectionStatus: {
    type: String,
    default: 'none' // 'none', 'pending', 'confirmed', 'declined'
  },
  // Compatibilité avec AvailabilityCell
  playerSelectionStatus: {
    type: String,
    default: 'pending' // 'pending', 'confirmed', 'declined'
  },
  seasonId: {
    type: String,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  // Données de sélection pour afficher le rôle
  selectionData: {
    type: Object,
    default: () => null
  },
  // Compatibilité avec AvailabilityCell
  availabilityData: {
    type: Object,
    default: () => ({
      available: false,
      roles: [],
      comment: null,
      isSelectionDisplay: false
    })
  },
  playerGender: {
    type: String,
    default: 'non-specified'
  }
})

// Emits
const emit = defineEmits([
  'selection-status-click',
  'player-selected'
])

// Computed properties
const playerSelectionStatus = computed(() => {
  // Utiliser playerSelectionStatus en priorité (compatibilité AvailabilityCell)
  return props.playerSelectionStatus || props.selectionStatus
})

// Fonctions utilitaires

function getConfirmedRoleLabel() {
  // Utiliser selectionData en priorité, sinon availabilityData
  const data = props.selectionData || props.availabilityData
  
  // Si on a un roleLabel direct (cas CastsView)
  if (data?.roleLabel) {
    return data.roleLabel
  }
  
  // Si on a des rôles dans un array (cas AvailabilityCell)
  if (data?.roles && data.roles.length > 0) {
    const role = data.roles[0]
    return getRoleLabel(role, props.playerGender, false) || 'Joue'
  }
  
  // Si on a un rôle direct (cas CastsView)
  if (data?.role) {
    return getRoleLabel(data.role, props.playerGender, false) || 'Joue'
  }
  
  return 'Joue' // Fallback si pas de rôle
}

function getRoleEmoji() {
  // Utiliser selectionData en priorité, sinon availabilityData
  const data = props.selectionData || props.availabilityData
  
  // Si on a un rôle direct (cas CastsView)
  if (data?.role) {
    return ROLE_EMOJIS[data.role] || '🎭'
  }
  
  // Si on a des rôles dans un array (cas AvailabilityCell)
  if (data?.roles && data.roles.length > 0) {
    const role = data.roles[0]
    return ROLE_EMOJIS[role] || '🎭'
  }
  
  return '🎭' // Fallback si pas de rôle
}

function getCellStatusClass() {
  return getStatusClass({
    isSelected: props.isSelected,
    playerSelectionStatus: playerSelectionStatus.value !== 'none' ? playerSelectionStatus.value : null,
    isAvailable: null,
    isUnavailable: false,
    isLoading: false,
    isError: false
  })
}

// Gestionnaires d'événements
function handleClick() {
  if (props.canEdit) {
    emit('selection-status-click', {
      playerName: props.playerName,
      eventId: props.eventId,
      currentStatus: playerSelectionStatus.value
    })
  } else {
    emit('player-selected', {
      name: props.playerName,
      id: props.playerName // Utiliser le nom comme ID pour l'instant
    })
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
