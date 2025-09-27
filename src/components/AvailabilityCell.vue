<template>
  <div 
    class="flex items-center justify-center transition-all duration-200 font-medium text-white relative w-full h-full rounded-lg px-2 py-1 z-10"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105',
      compact ? 'p-1 md:p-2 text-xs' : 'text-sm',
      // Couleurs de fond appliquées directement à la cellule - plus lumineuses et attrayantes
      isSelected && isAvailable === true && playerSelectionStatus === 'confirmed' ? 'bg-gradient-to-br from-purple-500/60 to-pink-500/60' : '',
      isSelected && isAvailable === true && playerSelectionStatus === 'pending' ? 'bg-gradient-to-br from-orange-500/60 to-yellow-500/60' : '',
      isSelected && isAvailable === true && playerSelectionStatus === 'declined' ? 'bg-gradient-to-br from-red-500/60 to-orange-500/60' : '',
      !isSelected && isAvailable === true ? 'bg-green-500/60' : '',
      isAvailable === false ? 'bg-red-500/60' : '',
      isAvailable === null || isAvailable === undefined ? 'bg-gray-500/40' : '',
      // États de chargement
      isLoading ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30' : '',
      isError ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30' : ''
    ]"
    @click.stop="toggleAvailability"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="flex flex-col items-center justify-center h-full min-h-[4rem]">
      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="flex items-center gap-1">
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
      </div>
      
      <!-- Indicateur d'erreur -->
      <div v-else-if="isError" class="text-center text-red-300">
        ⚠️
      </div>
      
      <!-- Contenu normal -->
      <template v-else>
        <!-- Affichage avec confirmation (2 lignes) -->
        <template v-if="isSelected && isAvailable === true && isSelectionConfirmedByOrganizer">
          <!-- Ligne 1: Icône rôle + nom du rôle ou "Décliné" -->
          <div class="flex items-center gap-1 text-center">
            <span class="text-lg">
              {{ playerSelectionStatus === 'pending' ? '❓' : getRoleEmoji() }}
            </span>
            <span class="text-sm font-medium">
              {{ playerSelectionStatus === 'declined' ? 'Décliné' : getConfirmedRoleLabel() }}
            </span>
          </div>
          
          <!-- Ligne 2: Statut de confirmation (seulement pour à confirmer) -->
          <div v-if="playerSelectionStatus === 'pending'" class="text-xs text-center mt-1">
            [à confirmer]
          </div>
          <!-- Pas de ligne 2 pour confirmé et décliné -->
        </template>
        
        <!-- Affichage classique sans confirmation -->
        <template v-else>
          <span v-if="isAvailable === true" class="text-center">
            Dispo
          </span>
          <span v-else-if="isAvailable === false" class="text-center">
            Pas dispo
          </span>
          <span v-else class="text-center text-gray-400">
            Non renseigné
          </span>
        </template>
      </template>
      
      <!-- Afficher le pourcentage de chances en permanence sous "Disponible" -->
      <!-- Supprimé : déplacé dans la modale de disponibilité -->
      
      <!-- Afficher tous les rôles et l'icône de commentaire (seulement si pas de confirmation) -->
      <template v-if="isAvailable === true && hasSpecificRoles && !(isSelected && isSelectionConfirmedByOrganizer)">
        <div class="flex items-center gap-1 mt-1">
          <!-- Rôles (soit tous les rôles de disponibilité, soit le rôle de composition) -->
          <div class="flex items-center gap-0.5">
            <span 
              v-for="(role, index) in displayRoles" 
              :key="role"
              :class="compact ? 'text-sm' : 'text-lg md:text-base'"
              :title="isSelectionDisplay ? `Composé comme ${ROLE_LABELS_SINGULAR[role]}` : `Rôle: ${ROLE_LABELS_SINGULAR[role]}`"
            >
              {{ ROLE_EMOJIS[role] }}
            </span>
            <span 
              v-if="hasMoreRoles && !isSelectionDisplay" 
              :class="compact ? 'text-xs' : 'text-base md:text-sm'"
              class="text-gray-400"
              :title="`Et ${hiddenRolesCount} autre(s) rôle(s)`"
            >
              ...
            </span>
          </div>
          
          <!-- Icône commentaire -->
          <span 
            v-if="hasComment" 
            :class="compact ? 'text-xs' : 'text-base md:text-sm'"
            class="cursor-pointer hover:text-yellow-300 transition-colors ml-1"
            @click.stop="showCommentModal"
            title="Voir le commentaire"
          >
            📝
          </span>
        </div>
      </template>
      
      <!-- Icône commentaire seule (quand pas de rôles spécifiques) -->
      <template v-if="isAvailable === true && !hasSpecificRoles && hasComment && !(isSelected && isSelectionConfirmedByOrganizer)">
        <div class="flex items-center justify-center mt-1">
          <span 
            :class="compact ? 'text-xs' : 'text-base md:text-sm'"
            class="cursor-pointer hover:text-yellow-300 transition-colors"
            @click.stop="showCommentModal"
            title="Voir le commentaire"
          >
            📝
          </span>
        </div>
      </template>
      
      <!-- Icône commentaire pour les "Pas dispo" avec commentaire -->
      <template v-if="isAvailable === false && hasComment">
        <div class="flex items-center justify-center mt-1">
          <span 
            :class="compact ? 'text-xs' : 'text-base md:text-sm'"
            class="cursor-pointer hover:text-yellow-300 transition-colors"
            @click.stop="showCommentModal"
            title="Voir le commentaire"
          >
            📝
          </span>
        </div>
      </template>
      
      <!-- Icône commentaire pour les "Non renseigné" avec commentaire -->
      <template v-if="(isAvailable === null || isAvailable === undefined) && hasComment">
        <div class="flex items-center justify-center mt-1">
          <span 
            :class="compact ? 'text-xs' : 'text-base md:text-sm'"
            class="cursor-pointer hover:text-yellow-300 transition-colors"
            @click.stop="showCommentModal"
            title="Voir le commentaire"
          >
            📝
          </span>
        </div>
      </template>
      
      <!-- Debug des computed properties -->
      <template v-if="isAvailable === true && !compact && false">
        <div class="text-xs text-gray-400 mt-1">
          AllRoles: {{ allRoles.length }} | DisplayRoles: {{ displayRoles.length }} | Roles: {{ JSON.stringify(props.availabilityData?.roles) }}
        </div>
      </template>
      
      <!-- Debug: afficher les données pour vérifier -->
      <template v-if="isAvailable === true && !compact && false">
        <div class="text-xs text-gray-400 mt-1">
          Debug: {{ JSON.stringify(props.availabilityData) }}
        </div>
      </template>
      
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ROLE_EMOJIS, ROLE_LABELS_SINGULAR, ROLE_DISPLAY_ORDER, getRoleLabel } from '../services/storage.js'

const props = defineProps({
  playerName: {
    type: String,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  eventId: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: null
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
  playerSelectionStatus: {
    type: String,
    default: 'pending' // 'pending', 'confirmed', 'declined'
  },
  seasonId: {
    type: String,
    default: null
  },
  chancePercent: {
    type: Number,
    default: null
  },
  showSelectedChance: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // Nouvelles props pour le format avec rôles
  availabilityData: {
    type: Object,
    default: () => ({
      available: false,
      roles: [],
      comment: null,
      isSelectionDisplay: false
    })
  },
  eventTitle: {
    type: String,
    default: ''
  },
  eventDate: {
    type: String,
    default: ''
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  playerGender: {
    type: String,
    default: 'non-specified'
  },
  // Nouvelles props pour le chargement progressif
  isLoading: {
    type: Boolean,
    default: false
  },
  isLoaded: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  }
})

// Debug logs removed for cleaner console output

const emit = defineEmits(['toggle', 'toggleSelectionStatus', 'show-availability-modal', 'show-confirmation-modal'])

const hover = ref(false)

// Computed properties pour le nouveau format
const allRoles = computed(() => {
  // Vérifier si on a des données de disponibilité avec rôles
  if (!props.availabilityData || !props.availabilityData.roles) {
    return []
  }
  
  // Si c'est un tableau, le traiter
  if (Array.isArray(props.availabilityData.roles)) {
    // Filtrer les rôles selon l'ordre d'affichage
    return ROLE_DISPLAY_ORDER.filter(role => props.availabilityData.roles.includes(role))
  }
  
  return []
})

const displayRoles = computed(() => {
  // Afficher maximum 3 rôles pour éviter l'encombrement
  return allRoles.value.slice(0, 3)
})

const hasMoreRoles = computed(() => {
  return allRoles.value.length > 3
})

const hiddenRolesCount = computed(() => {
  return Math.max(0, allRoles.value.length - 3)
})

const hasComment = computed(() => {
  return props.availabilityData?.comment && props.availabilityData.comment.trim() !== ''
})

const isSelectionDisplay = computed(() => {
  return props.availabilityData?.isSelectionDisplay === true
})

// Vérifier s'il y a des rôles spécifiques
const hasSpecificRoles = computed(() => {
  return allRoles.value.length > 0
})

// Fonction pour obtenir le libellé du rôle confirmé
function getConfirmedRoleLabel() {
  if (!props.availabilityData?.roles || props.availabilityData.roles.length === 0) {
    return 'Joue' // Fallback si pas de rôle
  }
  
  // Prendre le premier rôle (normalement il n'y en a qu'un en cas de composition)
  const role = props.availabilityData.roles[0]
  return getRoleLabel(role, props.playerGender, false) || 'Joue'
}

// Fonction pour obtenir l'emoji du rôle confirmé
function getRoleEmoji() {
  if (!props.availabilityData?.roles || props.availabilityData.roles.length === 0) {
    return '🎭' // Fallback si pas de rôle
  }
  
  // Prendre le premier rôle (normalement il n'y en a qu'un en cas de composition)
  const role = props.availabilityData.roles[0]
  return ROLE_EMOJIS[role] || '🎭'
}

const shouldShowChance = computed(() => {
  if (props.chancePercent == null) return false
  if (props.isAvailable !== true) return false
  // Toujours afficher le pourcentage pour les joueurs disponibles
  return true
})

const tooltipText = computed(() => {
  if (props.disabled) {
    return 'Événement inactif — activez pour modifier'
  }
  if (props.isSelected && props.isAvailable === true) {
    if (props.isSelectionConfirmedByOrganizer) {
      // Statut individuel du joueur
      switch (props.playerSelectionStatus) {
        case 'pending':
          return `${props.playerName} est composé et doit confirmer sa participation • Cliquer pour changer le statut`
        case 'confirmed':
          return `${props.playerName} a confirmé sa participation • Cliquer pour changer le statut`
        case 'declined':
          return `${props.playerName} a décliné sa participation • Cliquer pour changer le statut`
        default:
          return `${props.playerName} est composé • Cliquer pour changer le statut`
      }
    } else {
      if (shouldShowChance.value) {
        return `${props.playerName} est composé et doit confirmer • avait ~${props.chancePercent}% de chances`
      }
      return `${props.playerName} est composé et doit confirmer`
    }
  } else if (props.isAvailable === true) {
    return props.chancePercent != null
      ? `${props.playerName} est disponible • ~${props.chancePercent}% de chances d'être composé`
      : `${props.playerName} est disponible`
  } else if (props.isAvailable === false) {
    return `${props.playerName} n'est pas disponible`
  } else {
    return `Cliquer pour indiquer la disponibilité de ${props.playerName}`
  }
})

function toggleAvailability() {
  console.log('🖱️ DEBUG toggleAvailability appelée:')
  console.log('  - playerName:', props.playerName)
  console.log('  - isSelected:', props.isSelected)
  console.log('  - playerSelectionStatus:', props.playerSelectionStatus)
  console.log('  - isAvailable:', props.isAvailable)
  console.log('  - disabled:', props.disabled)
  
  if (props.disabled) {
    console.log('❌ DEBUG toggleAvailability: disabled, sortie')
    return
  }
  
  // Si le joueur est sélectionné (peu importe si la sélection est confirmée par l'organisateur ou pas), ouvrir la modal de confirmation
  if (props.isSelected) {
    // Ouvrir la modal de confirmation au lieu de cycler directement
    console.log('🎯 DEBUG toggleAvailability: branche confirmation, émission show-confirmation-modal')
    emit('show-confirmation-modal', {
      playerName: props.playerName,
      playerGender: props.playerGender,
      eventId: props.eventId,
      eventTitle: props.eventTitle,
      eventDate: props.eventDate,
      assignedRole: props.availabilityData?.roles?.[0] || 'player',
      availabilityComment: props.availabilityData?.comment || null,
      currentStatus: props.playerSelectionStatus
    })
  } else {
    // Si pas sélectionné, ouvrir la modal de disponibilité
    console.log('🎯 DEBUG toggleAvailability: branche disponibilité, émission show-availability-modal')
    emit('show-availability-modal', {
      playerName: props.playerName,
      eventId: props.eventId,
      eventTitle: props.eventTitle,
      eventDate: props.eventDate,
      availabilityData: props.availabilityData,
      isReadOnly: false,
      chancePercent: props.chancePercent,
      isProtected: props.isProtected,
      eventRoles: props.eventRoles
    })
  }
}

function getNextSelectionStatus(currentStatus) {
  switch (currentStatus) {
    case 'pending':
      return 'confirmed'
    case 'confirmed':
      return 'declined'
    case 'declined':
      return 'pending'
    default:
      return 'pending'
  }
}

function showCommentModal() {
  console.log('🔍 showCommentModal - isProtected:', props.isProtected, 'playerName:', props.playerName)
  emit('show-availability-modal', {
    playerName: props.playerName,
    eventId: props.eventId,
    eventTitle: props.eventTitle,
    eventDate: props.eventDate,
    availabilityData: props.availabilityData,
    isReadOnly: props.isProtected, // Suivre la même logique que le clic sur la cellule
    isProtected: props.isProtected // Transmettre aussi isProtected pour la cohérence
  })
}
</script>
