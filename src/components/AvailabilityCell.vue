<template>
  <div 
    class="flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all duration-200 min-h-20 p-3 md:p-5"
    @click="toggleAvailability"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="flex items-center justify-center gap-2">
      <!-- Afficher le badge au survol en remplacement de l'icône -->
      <template v-if="shouldShowChance && hover">
        <span class="text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-200"
              :title="tooltipText">
          {{ chancePercent }}%
        </span>
      </template>
      <template v-else>
        <span
          v-if="isSelected"
          class="text-2xl md:text-3xl hover:scale-110 transition-transform duration-200"
          :title="tooltipText"
        >
          🎭
        </span>
        <span
          v-else-if="isAvailable === true"
          class="text-2xl md:text-3xl hover:scale-110 transition-transform duration-200"
          :title="tooltipText"
        >
          ✅
        </span>
        <span
          v-else-if="isAvailable === false"
          class="text-2xl md:text-3xl hover:scale-110 transition-transform duration-200"
          :title="tooltipText"
        >
          ❌
        </span>
        <span
          v-else
          class="text-gray-500 hover:text-white transition-colors duration-200 text-xl"
          :title="tooltipText"
        >
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
  if (props.isSelected) {
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
  emit('toggle', props.playerName, props.eventId)
}
</script>
