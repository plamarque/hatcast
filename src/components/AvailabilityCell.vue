<template>
  <div 
    class="flex items-center justify-center transition-all duration-200 rounded font-medium text-white mx-0.5 my-0.25"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105',
      compact ? 'min-h-0 p-1 md:p-2 text-xs' : 'min-h-20 p-2 md:p-3 text-sm',
      // Couleurs de fond appliquées directement à la cellule - plus lumineuses et attrayantes
      isSelected && isAvailable === true ? 'bg-gradient-to-br from-purple-500/60 to-pink-500/60' : '',
      !isSelected && isAvailable === true ? 'bg-green-500/60' : '',
      isAvailable === false ? 'bg-red-500/60' : '',
      isAvailable === null || isAvailable === undefined ? 'bg-gray-500/40' : ''
    ]"
    @click="toggleAvailability"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="flex items-center justify-center">
      <!-- Afficher le badge au survol en remplacement de l'icône -->
      <template v-if="shouldShowChance && hover">
        <span class="text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-200"
              :title="tooltipText">
          {{ chancePercent }}%
        </span>
      </template>
      <template v-else>
        <!-- Texte du statut -->
        <span v-if="isSelected && isAvailable === true" class="text-center">
          Joue
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

const emit = defineEmits(['toggle'])

const hover = ref(false)

const shouldShowChance = computed(() => {
  if (props.chancePercent == null) return false
  if (props.isAvailable !== true) return false
  if (props.isSelected && !props.showSelectedChance) return false
  return true
})

const tooltipText = computed(() => {
  if (props.disabled) {
    return 'Événement archivé — désarchivez pour modifier'
  }
  if (props.isSelected && props.isAvailable === true) {
    if (shouldShowChance.value) {
      return `${props.playerName} est sélectionné pour cet événement • avait ~${props.chancePercent}% de chances`
    }
    return `${props.playerName} est sélectionné pour cet événement`
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
  emit('toggle', props.playerName, props.eventId)
}
</script>
