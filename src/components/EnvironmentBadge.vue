<template>
  <div 
    v-if="environment !== 'production'" 
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
  >
    <div 
      class="px-3 py-2 rounded-full text-sm font-bold text-white shadow-lg border-2"
      :class="badgeClasses"
    >
      {{ environment.toUpperCase() }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import configService from '../services/configService.js'

const environment = ref('development')

onMounted(async () => {
  try {
    environment.value = configService.getEnvironment()
  } catch (error) {
    console.warn('Impossible de détecter l\'environnement:', error)
    environment.value = 'development'
  }
})

const badgeClasses = computed(() => {
  switch (environment.value) {
    case 'development':
      return 'bg-red-600 border-red-400 shadow-red-500/50'
    case 'staging':
      return 'bg-yellow-600 border-yellow-400 shadow-yellow-500/50'
    case 'production':
      return 'bg-green-600 border-green-400 shadow-green-500/50'
    default:
      return 'bg-gray-600 border-gray-400 shadow-gray-500/50'
  }
})
</script>
