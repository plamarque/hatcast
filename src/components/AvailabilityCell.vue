<template>
  <div 
    class="flex items-center justify-center transition-all duration-200 rounded font-medium text-white mx-0.5 my-0.25"
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
      <template v-if="shouldShowChance && isAvailable === true">
        <span class="text-[10px] md:text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 mt-1"
              :title="tooltipText">
          {{ chancePercent }}%
        </span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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
  }
})

const emit = defineEmits(['toggle', 'toggleSelectionStatus'])

const hover = ref(false)

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
</script>
