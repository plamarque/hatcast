<template>
  <div 
    class="flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all duration-200 min-h-20 p-3 md:p-5"
    @click="toggleAvailability"
  >
    <div class="flex items-center justify-center">
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
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  }
})

const emit = defineEmits(['toggle'])

const tooltipText = computed(() => {
  if (props.isSelected) {
    return `${props.playerName} est sélectionné pour cet événement`
  } else if (props.isAvailable === true) {
    return `${props.playerName} est disponible`
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
