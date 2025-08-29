<template>
  <div 
    class="flex items-center justify-center transition-all duration-200 rounded font-medium text-white mx-0.5 my-0.25 relative"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105',
      compact ? 'min-h-0 p-1 md:p-2 text-xs' : 'min-h-20 p-2 md:p-3 text-sm',
      // Couleurs de fond appliquées directement à la cellule - plus lumineuses et attrayantes
      isSelected && isAvailable === true && playerSelectionStatus === 'confirmed' ? 'bg-gradient-to-br from-purple-500/60 to-pink-500/60' : '',
      isSelected && isAvailable === true && playerSelectionStatus === 'pending' ? 'bg-gradient-to-br from-orange-500/60 to-yellow-500/60' : '',
      isSelected && isAvailable === true && playerSelectionStatus === 'declined' ? 'bg-gradient-to-br from-red-500/60 to-orange-500/60' : '',
      !isSelected && isAvailable === true ? 'bg-green-500/60' : '',
      isAvailable === false ? 'bg-red-500/60' : '',
      isAvailable === null || isAvailable === undefined ? 'bg-gray-500/40' : ''
    ]"
    @click="toggleAvailability"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="flex flex-col items-center justify-center">
      <!-- Texte du statut -->
      <span v-if="isSelected && isAvailable === true && playerSelectionStatus === 'confirmed'" class="text-center">
        Joue
      </span>
      <span v-else-if="isSelected && isAvailable === true && playerSelectionStatus === 'pending'" class="text-center">
        À confirmer
      </span>
      <span v-else-if="isSelected && isAvailable === true && playerSelectionStatus === 'declined'" class="text-center">
        Décliné
      </span>
      <span v-else-if="isAvailable === true" class="text-center">
        Disponible
      </span>
      <span v-else-if="isAvailable === false" class="text-center">
        Pas disponible
      </span>
      <span v-else class="text-center text-gray-400">
        –
      </span>
      
      <!-- Afficher le pourcentage de chances en permanence sous "Disponible" -->
      <!-- Supprimé : déplacé dans la modale de disponibilité -->
      
      <!-- Afficher tous les rôles et l'icône de commentaire -->
      <template v-if="isAvailable === true && !compact">
        <div class="flex items-center gap-1 mt-1">
          <!-- Tous les rôles -->
          <div class="flex items-center gap-0.5">
            <span 
              v-for="(role, index) in displayRoles" 
              :key="role"
              class="text-lg md:text-base"
              :title="`Rôle: ${ROLE_LABELS[role]}`"
            >
              {{ ROLE_EMOJIS[role] }}
            </span>
            <span 
              v-if="hasMoreRoles" 
              class="text-base md:text-sm text-gray-400"
              :title="`Et ${hiddenRolesCount} autre(s) rôle(s)`"
            >
              ...
            </span>
          </div>
          
          <!-- Icône commentaire -->
          <span 
            v-if="hasComment" 
            class="text-base md:text-sm cursor-pointer hover:text-yellow-300 transition-colors ml-1"
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
import { ROLE_EMOJIS, ROLE_LABELS, ROLE_DISPLAY_ORDER } from '../services/storage.js'

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
      comment: null
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
  }
})

const emit = defineEmits(['toggle', 'toggleSelectionStatus', 'show-availability-modal'])

const hover = ref(false)

// Computed properties pour le nouveau format
const allRoles = computed(() => {
  // Vérifier si on a des données de disponibilité avec rôles
  if (!props.availabilityData || !props.availabilityData.roles) {
    return []
  }
  
  // Si c'est un tableau, le trier selon l'ordre d'affichage
  if (Array.isArray(props.availabilityData.roles)) {
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

const shouldShowChance = computed(() => {
  if (props.chancePercent == null) return false
  if (props.isAvailable !== true) return false
  // Toujours afficher le pourcentage pour les joueurs disponibles
  return true
})

const tooltipText = computed(() => {
  if (props.disabled) {
    return 'Événement archivé — désarchivez pour modifier'
  }
  if (props.isSelected && props.isAvailable === true) {
    if (props.isSelectionConfirmedByOrganizer) {
      // Statut individuel du joueur
      switch (props.playerSelectionStatus) {
        case 'pending':
          return `${props.playerName} est sélectionné et doit confirmer sa participation • Cliquer pour changer le statut`
        case 'confirmed':
          return `${props.playerName} a confirmé sa participation • Cliquer pour changer le statut`
        case 'declined':
          return `${props.playerName} a décliné sa participation • Cliquer pour changer le statut`
        default:
          return `${props.playerName} est sélectionné • Cliquer pour changer le statut`
      }
    } else {
      if (shouldShowChance.value) {
        return `${props.playerName} est sélectionné et doit confirmer • avait ~${props.chancePercent}% de chances`
      }
      return `${props.playerName} est sélectionné et doit confirmer`
    }
  } else if (props.isAvailable === true) {
    return props.chancePercent != null
      ? `${props.playerName} est disponible • ~${props.chancePercent}% de chances d'être sélectionné`
      : `${props.playerName} est disponible`
  } else if (props.isAvailable === false) {
    return `${props.playerName} n'est pas disponible`
  } else {
    return `Cliquer pour indiquer la disponibilité de ${props.playerName}`
  }
})

function toggleAvailability() {
  if (props.disabled) return
  
  // Si le joueur est dans la sélection validée par l'organisateur, gérer le cycle de confirmation
  if (props.isSelected && props.isAvailable === true && props.isSelectionConfirmedByOrganizer) {
    // Cycle de confirmation : pending → confirmed → declined → pending
    const nextStatus = getNextSelectionStatus(props.playerSelectionStatus)
    emit('toggleSelectionStatus', props.playerName, props.eventId, nextStatus, props.seasonId)
  } else {
    // Cycle classique de disponibilité
    emit('toggle', props.playerName, props.eventId)
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
