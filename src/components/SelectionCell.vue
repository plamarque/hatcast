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
      <!-- Affichage des sélections (seulement si composition validée par l'organisateur OU si admin) -->
      <template v-if="isSelected && (isSelectionConfirmedByOrganizer || canEditEvents)">
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
      
      <!-- Pas sélectionné OU sélectionné mais non validé -->
      <template v-else>
        <!-- Afficher les rôles et chances si disponibles -->
        <template v-if="rolesAndChances && rolesAndChances.length > 0">
          <div class="flex flex-col space-y-1 text-xs">
            <div 
              v-for="roleChance in rolesAndChances" 
              :key="roleChance.role"
              class="text-center"
              :class="getChanceTextClass(roleChance.chance)"
            >
              <template v-if="roleChance.chance !== null && roleChance.chance !== undefined">
                {{ roleChance.label }} ({{ roleChance.chance }}%)
              </template>
              <template v-else>
                {{ roleChance.label }}
              </template>
            </div>
          </div>
        </template>
        <!-- Sinon, afficher les disponibilités depuis availabilityData -->
        <template v-else-if="availabilityData && availabilityData.available && availabilityData.roles && availabilityData.roles.length > 0">
          <div class="flex flex-col space-y-1 text-xs">
            <div 
              v-for="role in availabilityData.roles" 
              :key="role"
              class="text-center text-green-400"
            >
              {{ getRoleLabel(role) }}
            </div>
          </div>
        </template>
        <!-- Afficher "Pas dispo" si indisponible -->
        <template v-else-if="availabilityData && availabilityData.available === false">
          <span class="text-center text-red-300">
            Pas dispo
          </span>
        </template>
        <!-- Afficher "Non renseigné" si pas de données -->
        <template v-else-if="!availabilityData || availabilityData.available === null || availabilityData.available === undefined">
          <span class="text-center text-gray-400">
            Non renseigné
          </span>
        </template>
        <!-- Sinon afficher un tiret -->
        <template v-else>
          <span class="text-center text-gray-400">
            -
          </span>
        </template>
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
  canEditEvents: {
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
  },
  // Données des rôles et chances pour les joueurs disponibles non sélectionnés
  rolesAndChances: {
    type: Array,
    default: () => null
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

function getChanceTextClass(chance) {
  if (chance >= 80) return 'text-green-300 font-semibold'
  if (chance >= 60) return 'text-yellow-300'
  if (chance >= 40) return 'text-orange-300'
  if (chance >= 20) return 'text-red-300'
  return 'text-gray-400'
}

function getCellStatusClass() {
  // Si le joueur est sélectionné mais la composition n'est pas validée par l'organisateur,
  // afficher comme disponible (vert) au lieu de sélectionné (rouge)
  const isSelectedButNotValidated = props.isSelected && !props.isSelectionConfirmedByOrganizer
  
  // Si le joueur est disponible mais pas sélectionné, afficher en vert
  const isAvailableNotSelected = !props.isSelected && props.rolesAndChances && props.rolesAndChances.length > 0
  
  // Si le joueur est sélectionné mais non validé, utiliser les données de disponibilité
  const isAvailableFromData = isSelectedButNotValidated && props.availabilityData && props.availabilityData.available && props.availabilityData.roles && props.availabilityData.roles.length > 0
  
  // Déterminer si le joueur est indisponible (pas dispo)
  const isUnavailable = props.availabilityData && props.availabilityData.available === false
  
  // Déterminer si le joueur n'a pas renseigné sa disponibilité
  const isNotSpecified = !props.availabilityData || props.availabilityData.available === null || props.availabilityData.available === undefined
  
  // Logique de disponibilité
  let isAvailable = null
  if (isAvailableNotSelected || isAvailableFromData) {
    isAvailable = true
  } else if (isUnavailable) {
    isAvailable = false
  } else if (isNotSpecified) {
    isAvailable = null // Non renseigné
  }
  
  return getStatusClass({
    isSelected: props.isSelected && props.isSelectionConfirmedByOrganizer, // Seulement si validé
    playerSelectionStatus: playerSelectionStatus.value !== 'none' ? playerSelectionStatus.value : null,
    isAvailable: isAvailable,
    isUnavailable: false, // Pas utilisé dans getStatusClass
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
