<template>
  <div 
    class="relative inline-block"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <!-- Contenu qui déclenche le tooltip -->
    <slot></slot>
    
    <!-- Tooltip personnalisé -->
    <div
      v-if="showTooltip"
      class="absolute z-[9999] px-3 py-2 text-xs text-white bg-gray-900 border border-gray-600 rounded-lg shadow-lg whitespace-pre-line font-normal"
      :class="tooltipPosition"
      style="pointer-events: none; width: 180px;"
    >
      {{ content }}
      <!-- Flèche du tooltip -->
      <div 
        class="absolute w-2 h-2 bg-gray-900 border-l border-b border-gray-600 transform rotate-45"
        :class="arrowPosition"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const showTooltip = ref(false)

// Position du tooltip avec gestion intelligente du positionnement
const tooltipPosition = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
    case 'bottom':
      return 'top-full mt-2 left-0 transform translate-x-2'
    case 'left':
      return 'right-full mr-2 top-1/2 transform -translate-y-1/2'
    case 'right':
      return 'left-full ml-2 top-1/2 transform -translate-y-1/2'
    default:
      return 'top-full mt-2 left-0 transform translate-x-2'
  }
})

// Position de la flèche
const arrowPosition = computed(() => {
  switch (props.position) {
    case 'top':
      return 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    case 'bottom':
      return 'bottom-full left-4 transform -translate-y-1/2'
    case 'left':
      return 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2'
    case 'right':
      return 'right-full top-1/2 transform -translate-y-1/2 translate-x-1/2'
    default:
      return 'bottom-full left-4 transform -translate-y-1/2'
  }
})
</script>

<style scoped>
/* Assurer que le tooltip reste visible */
.relative {
  position: relative;
}

/* Animation d'apparition */
.absolute {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* S'assurer que le tooltip passe au-dessus de tout */
:deep(.absolute) {
  z-index: 9999 !important;
}
</style>
