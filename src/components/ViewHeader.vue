<template>
  <div class="view-header sticky top-0 z-[110] bg-gray-900 border-b border-gray-700/30" 
       :style="headerStyle">
    <div class="w-full" :style="containerStyle">
      <div class="max-w-4xl mx-auto px-4">
        <div class="flex items-center justify-between gap-2">
          <!-- Dropdown de vue -->
          <div class="relative">
            <button
              @click="toggleViewDropdown"
              class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-gray-700/50': showViewDropdown }"
            >
              <!-- Icône de la vue actuelle -->
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Lignes -->
                <path v-if="currentView === 'lines'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                <!-- Colonnes -->
                <path v-else-if="currentView === 'columns'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4v16M15 4v16M3 8h18M3 16h18"/>
                <!-- Chronologique -->
                <path v-else-if="currentView === 'timeline'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18M12 3l4 4M12 3L8 7M12 21l4-4M12 21l-4-4"/>
              </svg>
              <span class="text-xs md:text-sm font-medium hidden sm:inline">{{ getViewLabel(currentView) }}</span>
              <span class="text-xs md:text-sm font-medium sm:hidden">{{ getViewLabel(currentView).substring(0, 5) }}</span>
              <svg class="w-3 h-3 md:w-4 md:h-4 transition-transform" :class="{ 'rotate-180': showViewDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Menu déroulant des vues -->
            <div v-if="showViewDropdown" class="absolute top-full left-0 mt-2 w-32 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-xl overflow-hidden z-[1210]">
              <button
                @click="selectView('lines')"
                class="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-gray-700/50 transition-colors text-sm"
                :class="{ 'bg-gray-700/50': currentView === 'lines' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <span>Lignes</span>
              </button>
              
              <button
                @click="selectView('columns')"
                class="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-gray-700/50 transition-colors text-sm"
                :class="{ 'bg-gray-700/50': currentView === 'columns' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4v16M15 4v16M3 8h18M3 16h18"/>
                </svg>
                <span>Colonnes</span>
              </button>
              
              <button
                @click="selectView('timeline')"
                class="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-gray-700/50 transition-colors text-sm"
                :class="{ 'bg-gray-700/50': currentView === 'timeline' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18M12 3l4 4M12 3L8 7M12 21l4-4M12 21l-4-4"/>
                </svg>
                <span>Chronologique</span>
              </button>
            </div>
          </div>
          
          <!-- Sélecteur de joueur (conditionnel) -->
          <div v-if="showPlayerSelector" class="relative">
            <button
              @click="togglePlayerModal"
              class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32"
            >
              <span class="flex-1 text-left text-xs md:text-sm truncate">
                {{ selectedPlayer ? selectedPlayer.name : 'Joueur' }}
              </span>
              <svg class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  currentView: {
    type: String,
    required: true,
    validator: (value) => ['lines', 'columns', 'timeline'].includes(value)
  },
  showPlayerSelector: {
    type: Boolean,
    default: false
  },
  selectedPlayer: {
    type: Object,
    default: null
  },
  // Style props
  headerStyle: {
    type: String,
    default: 'padding-top: max(48px, env(safe-area-inset-top) + 32px); padding-bottom: max(12px, env(safe-area-inset-bottom) + 48px);'
  },
  containerStyle: {
    type: String,
    default: 'padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right));'
  }
})

// Emits
const emit = defineEmits(['view-change', 'player-modal-toggle'])

// État local
const showViewDropdown = ref(false)

// Fonctions
function toggleViewDropdown() {
  showViewDropdown.value = !showViewDropdown.value
}

function selectView(view) {
  showViewDropdown.value = false
  emit('view-change', view)
}

function togglePlayerModal() {
  emit('player-modal-toggle')
}

function getViewLabel(view) {
  switch (view) {
    case 'lines': return 'Lignes'
    case 'columns': return 'Colonnes'
    case 'timeline': return 'Chronologique'
    default: return 'Lignes'
  }
}
</script>
