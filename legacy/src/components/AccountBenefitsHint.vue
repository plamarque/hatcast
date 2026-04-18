<template>
  <!-- Mode standalone (comme avant) -->
  <div v-if="!inline" class="mt-4">
    <button
      @click="isExpanded = !isExpanded"
      class="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-between"
    >
      <h3 class="text-sm font-semibold text-blue-300">💡 À quoi sert un compte ?</h3>
      <span class="text-blue-300 transition-transform duration-200" :class="{ 'rotate-180': isExpanded }">▼</span>
    </button>
    <div
      v-if="isExpanded"
      class="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-gray-300 space-y-2"
    >
      <BenefitsContent />
    </div>
  </div>

  <!-- Mode inline (pour s'intégrer dans d'autres composants) -->
  <div v-else>
    <button
      @click="isExpanded = !isExpanded"
      class="text-blue-300 hover:text-blue-200 text-sm font-medium flex items-center gap-2 transition-colors"
    >
      <span>À quoi sert un compte ?</span>
      <span class="transition-transform duration-200" :class="{ 'rotate-180': isExpanded }">▼</span>
    </button>
    <div
      v-if="isExpanded"
      class="mt-3 pt-3 border-t border-blue-500/20 text-sm text-gray-300 space-y-2"
    >
      <BenefitsContent />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BenefitsContent from './BenefitsContent.vue'

const props = defineProps({
  inline: {
    type: Boolean,
    default: false
  }
})

const isExpanded = ref(false)
</script>


