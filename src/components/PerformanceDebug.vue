<template>
  <div v-if="showDebug" class="fixed bottom-4 right-4 z-[2000] bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-sm">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold text-white">📊 Performance</h3>
      <button 
        @click="toggleDebug" 
        class="text-white/60 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10"
      >
        {{ showDebug ? 'Masquer' : 'Afficher' }}
      </button>
    </div>
    
    <div class="space-y-2 text-xs">
      <div v-if="gridLoadingTime" class="text-green-400">
        🚀 Grille totale: {{ gridLoadingTime }}ms
      </div>
        <div v-if="gridVisibleTime" class="text-cyan-400">
          👁️ Grille visible: {{ gridVisibleTime }}ms
        </div>
        <div v-if="currentPlayerLoadedTime" class="text-green-400">
          🚀 Joueur connecté: {{ currentPlayerLoadedTime }}ms
        </div>
        <div v-if="favoritesLoadedTime" class="text-yellow-400">
          ⭐ Favoris: {{ favoritesLoadedTime }}ms
        </div>
        <div v-if="availabilityCompleteTime" class="text-orange-400">
          ✅ Disponibilités complètes: {{ availabilityCompleteTime }}ms
        </div>
      <div v-if="eventDetailTime" class="text-blue-400">
        📋 Détail: {{ eventDetailTime }}ms
      </div>
      <div class="text-gray-400">
        📊 {{ measurementsCount }} mesures
      </div>
    </div>
    
    <div class="mt-3 pt-2 border-t border-white/10">
      <button 
        @click="exportData" 
        class="text-xs text-purple-400 hover:text-purple-300"
      >
        📤 Exporter
      </button>
      <button 
        @click="clearData" 
        class="text-xs text-red-400 hover:text-red-300 ml-3"
      >
        🗑️ Effacer
      </button>
    </div>
  </div>
  
  <!-- Bouton flottant pour activer le debug -->
  <button 
    v-if="!showDebug" 
    @click="toggleDebug"
    class="fixed bottom-4 right-4 z-[2000] w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center text-lg"
    title="Afficher les performances"
  >
    📊
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import performanceService from '../services/performanceService.js'
import logger from '../services/logger.js'

const showDebug = ref(false)
const measurements = ref([])

// Computed properties pour les temps principaux
const gridLoadingTime = computed(() => {
  const measurement = performanceService.getMeasurement('grid_loading')
  return measurement ? measurement.duration.toFixed(0) : null
})

const gridVisibleTime = computed(() => {
  const measurement = performanceService.getMeasurement('grid_loading_grid_visible')
  return measurement ? measurement.duration.toFixed(0) : null
})

const currentPlayerLoadedTime = computed(() => {
  const measurement = performanceService.getMeasurement('load_availability_progressive_current_player_loaded')
  return measurement ? measurement.duration.toFixed(0) : null
})

const favoritesLoadedTime = computed(() => {
  const measurement = performanceService.getMeasurement('load_availability_progressive_favorites_loaded')
  return measurement ? measurement.duration.toFixed(0) : null
})

const availabilityCompleteTime = computed(() => {
  const measurement = performanceService.getMeasurement('load_availability_progressive_availability_complete')
  return measurement ? measurement.duration.toFixed(0) : null
})

const eventDetailTime = computed(() => {
  const measurement = performanceService.getMeasurement('event_detail_loading')
  return measurement ? measurement.duration.toFixed(0) : null
})

const availabilityTime = computed(() => {
  const measurement = performanceService.getMeasurement('load_availability')
  return measurement ? measurement.duration.toFixed(0) : null
})

const measurementsCount = computed(() => {
  return performanceService.getAllMeasurements().length
})

function toggleDebug() {
  showDebug.value = !showDebug.value
  if (showDebug.value) {
    updateMeasurements()
  }
}

function updateMeasurements() {
  measurements.value = performanceService.getAllMeasurements()
}

function exportData() {
  const data = {
    timestamp: new Date().toISOString(),
    measurements: performanceService.getAllMeasurements(),
    summary: performanceService.getSummary()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  logger.info('📤 Données de performance exportées')
}

function clearData() {
  performanceService.cleanup(0) // Supprimer toutes les mesures
  updateMeasurements()
  logger.info('🗑️ Données de performance effacées')
}

// Mettre à jour les mesures toutes les secondes quand le debug est actif
let updateInterval = null

onMounted(() => {
  // Vérifier si le debug est activé via localStorage
  const debugEnabled = localStorage.getItem('performance-debug') === 'true'
  if (debugEnabled) {
    showDebug.value = true
    updateMeasurements()
  }
  
  // Écouter les événements du menu développement
  window.addEventListener('performance-debug-toggle', (event) => {
    showDebug.value = event.detail.enabled
    if (event.detail.enabled) {
      updateMeasurements()
    }
  })
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// Surveiller les changements de showDebug
watch(() => showDebug.value, (newValue) => {
  localStorage.setItem('performance-debug', newValue.toString())
  
  if (newValue) {
    updateMeasurements()
    updateInterval = setInterval(updateMeasurements, 1000)
  } else {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }
})
</script>
