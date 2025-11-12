<template>
  <div 
    class="flex items-center justify-center transition-all duration-200 font-medium text-white relative w-full h-full rounded-lg px-2 py-1 border"
    :class="[
      canEdit ? 'cursor-pointer hover:scale-105' : 'cursor-default',
      compact ? 'p-1 md:p-2 text-xs' : 'text-sm',
      getCellStatusClass()
    ]"
    :title="tooltipForPastEvent"
    @click.stop="handleClick"
  >
    <div class="flex flex-col items-center justify-center h-full min-h-[4rem]">
      <!-- Pour les événements passés : afficher seulement un tiret si pas membre confirmé -->
      <template v-if="isPastEvent && !isConfirmedMember">
        <span class="text-center text-gray-400">
          -
        </span>
      </template>
      
      <!-- Affichage normal pour les événements futurs ou les membres confirmés d'événements passés -->
      <!-- Affichage des sélections (seulement si composition validée par l'organisateur OU si admin - playerSelectionStatus est déjà filtré par getPlayerSelectionStatus qui inclut les admins d'événement) -->
      <template v-else-if="isSelected && (isSelectionConfirmedByOrganizer || playerSelectionStatus)">
        <!-- Affichage avec confirmation (2 lignes) -->
        <template v-if="playerSelectionStatus && playerSelectionStatus !== 'none'">
          <!-- Ligne 1: nom du rôle avec pourcentage si en présélection -->
          <div class="text-center">
            <span class="text-sm font-medium">
              <template v-if="playerSelectionStatus === 'declined'">
                Décliné
              </template>
              <template v-else>
                {{ getConfirmedRoleLabel() }}<template v-if="playerSelectionStatus === 'pending' && selectedRoleChance !== null && selectedRoleChance !== undefined"> ({{ selectedRoleChance }}%)</template>
              </template>
            </span>
          </div>
          <!-- Ligne 2: emoji avec espacement cohérent -->
          <div class="flex items-center justify-center gap-1 mt-1">
            <span class="text-lg">
              {{ playerSelectionStatus === 'pending' ? '⏳' : getRoleEmoji() }}
            </span>
            <span v-if="playerSelectionStatus === 'pending'" class="text-xs text-gray-400">
              {{ isSelectionConfirmedByOrganizer ? 'à confirmer' : getPreselectedLabel() }}
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
        <!-- Pour les événements avec équipe confirmée (mais non passés), afficher un tiret gris pour tous les non-sélectionnés -->
        <template v-if="!isPastEvent && isSelectionConfirmedByOrganizer && !isSelected">
          <span class="text-center text-gray-400">
            -
          </span>
        </template>
        <!-- Affichage détaillé pour les événements sans équipe confirmée ou passés -->
        <template v-else>
          <!-- Si le joueur a décliné, afficher "Décliné" -->
          <template v-if="playerSelectionStatus === 'declined'">
            <div class="flex flex-col items-center gap-1">
              <span class="text-sm font-medium text-orange-300">Décliné</span>
              <span class="text-lg">❌</span>
            </div>
          </template>
          <!-- Afficher les rôles et chances si disponibles -->
          <template v-else-if="rolesAndChances && rolesAndChances.length > 0">
            <div class="text-center text-xs">
              <span class="text-white">Dispo pour : </span>
              <template v-for="(roleChance, index) in rolesAndChances" :key="roleChance.role">
                <span :class="getChanceTextClass(roleChance.chance)">
                  <template v-if="roleChance.chance !== null && roleChance.chance !== undefined">
                    {{ roleChance.label }} ({{ roleChance.chance }}%)
                  </template>
                  <template v-else>
                    {{ roleChance.label }}
                  </template>
                </span>
                <template v-if="index < rolesAndChances.length - 1">
                  <span class="text-white">, </span>
                </template>
              </template>
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
          <!-- Pour les événements avec équipe en préparation : afficher un tiret gris pour pas-dispos et non renseignés -->
          <template v-else-if="!isPastEvent && !isSelectionConfirmedByOrganizer && !isSelected && (availabilityData?.available === false || !availabilityData || availabilityData.available === null || availabilityData.available === undefined)">
            <span class="text-center text-gray-400">
              -
            </span>
          </template>
          <!-- Afficher "Pas dispo" si indisponible (pour les événements sans équipe) -->
          <template v-else-if="availabilityData && availabilityData.available === false">
            <span class="text-center text-red-300">
              Pas dispo
            </span>
          </template>
          <!-- Afficher "Non renseigné" si pas de données (pour les événements sans équipe) -->
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
  },
  // Indique si l'événement est passé (pour simplifier l'affichage dans la vue Compositions)
  isPastEvent: {
    type: Boolean,
    default: false
  },
  // Pourcentage de chance pour le rôle assigné en présélection
  selectedRoleChance: {
    type: Number,
    default: null
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

const isConfirmedMember = computed(() => {
  return props.isSelected && props.isSelectionConfirmedByOrganizer && playerSelectionStatus.value === 'confirmed'
})

const tooltipForPastEvent = computed(() => {
  if (!props.isPastEvent || isConfirmedMember.value) return ''
  
  // Construire le tooltip en fonction de l'état
  if (playerSelectionStatus.value === 'declined') {
    return 'A décliné la sélection'
  }
  
  if (playerSelectionStatus.value === 'pending') {
    return 'Sélectionné - en attente de confirmation'
  }
  
  if (props.availabilityData && props.availabilityData.available && props.availabilityData.roles && props.availabilityData.roles.length > 0) {
    const roles = props.availabilityData.roles.map(role => getRoleLabel(role, props.playerGender, false)).join(', ')
    return `Disponible : ${roles}`
  }
  
  if (props.availabilityData && props.availabilityData.available === false) {
    return 'Pas disponible'
  }
  
  if (props.rolesAndChances && props.rolesAndChances.length > 0) {
    const roles = props.rolesAndChances.map(rc => rc.label).join(', ')
    return `Disponible : ${roles}`
  }
  
  return 'Disponibilité non renseignée'
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

function getPreselectedLabel() {
  // Accorder "présélectionné" selon le genre du joueur
  if (props.playerGender === 'female') {
    return 'pré-sélectionnée'
  }
  if (props.playerGender === 'non-specified') {
    return 'pré-sélectionné·e'
  }
  // Pour 'male', utiliser la forme masculine
  return 'pré-sélectionné'
}

function getChanceTextClass(chance) {
  if (chance >= 80) return 'text-green-300 font-semibold'
  if (chance >= 60) return 'text-yellow-300'
  if (chance >= 40) return 'text-orange-300'
  if (chance >= 20) return 'text-red-300'
  return 'text-gray-400'
}

function getCellStatusClass() {
  // Pour les événements passés : simplifier l'affichage
  // Seuls les membres confirmés de la compo gardent leur style violet
  // Tous les autres états deviennent gris (status-undefined)
  if (props.isPastEvent) {
    const isConfirmedMember = props.isSelected && props.isSelectionConfirmedByOrganizer && playerSelectionStatus.value === 'confirmed'
    if (!isConfirmedMember) {
      return 'status-undefined' // Gris pour tous les autres cas
    }
    // Si c'est un membre confirmé, continuer avec la logique normale pour avoir le violet
  }
  
  // Pour les événements avec équipe confirmée (mais non passés) : simplifier l'affichage
  // Seuls les membres sélectionnés gardent leur style (violet/orange selon statut)
  // Tous les autres états (non sélectionnés) deviennent gris (status-undefined)
  if (!props.isPastEvent && props.isSelectionConfirmedByOrganizer && !props.isSelected) {
    return 'status-undefined' // Gris pour tous les non-sélectionnés
  }
  
  // Pour les événements avec équipe en préparation (non confirmée) : simplifier l'affichage
  // Pour les joueurs non sélectionnés qui sont pas-dispos ou non renseignés, afficher en gris
  if (!props.isPastEvent && !props.isSelectionConfirmedByOrganizer && !props.isSelected) {
    const isUnavailable = props.availabilityData && props.availabilityData.available === false
    const isNotSpecified = !props.availabilityData || props.availabilityData.available === null || props.availabilityData.available === undefined
    if (isUnavailable || isNotSpecified) {
      return 'status-undefined' // Gris pour pas-dispos et non renseignés
    }
  }
  
  // Si le joueur a décliné, toujours afficher le statut declined (orange)
  if (playerSelectionStatus.value === 'declined') {
    return getStatusClass({
      isSelected: false,
      playerSelectionStatus: 'declined',
      isAvailable: null,
      isUnavailable: false,
      isLoading: false,
      isError: false
    })
  }
  
  // PRIORITÉ : Si le joueur est sélectionné (même si la composition n'est pas validée),
  // utiliser le statut de confirmation pour déterminer la couleur du fond
  if (props.isSelected && playerSelectionStatus.value && playerSelectionStatus.value !== 'none') {
    return getStatusClass({
      isSelected: true, // Toujours true si le joueur est sélectionné
      playerSelectionStatus: playerSelectionStatus.value,
      isAvailable: null, // Ignorer la disponibilité pour les sélectionnés
      isUnavailable: false,
      isLoading: false,
      isError: false
    })
  }
  
  // Si le joueur n'est pas sélectionné, utiliser la disponibilité
  // Si le joueur est disponible mais pas sélectionné, afficher en vert
  const isAvailableNotSelected = !props.isSelected && props.rolesAndChances && props.rolesAndChances.length > 0
  
  // Si le joueur est sélectionné mais n'a pas de statut de confirmation, utiliser les données de disponibilité
  const isAvailableFromData = props.isSelected && !playerSelectionStatus.value && props.availabilityData && props.availabilityData.available && props.availabilityData.roles && props.availabilityData.roles.length > 0
  
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
    isSelected: false, // Pas sélectionné, utiliser la disponibilité
    playerSelectionStatus: null,
    isAvailable: isAvailable,
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
