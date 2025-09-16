<template>
  <div class="view-header bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/30" 
       :class="{ 'sticky top-0 z-[110] shadow-lg': isSticky }"
       :style="headerStyle">
    <div class="w-full" :style="containerStyle">
      <div class="max-w-4xl mx-auto px-2">
        <div class="flex items-center justify-between gap-1">
          <!-- Dropdown de vue -->
          <div class="relative">
            <button
              @click="toggleViewDropdown"
              class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 sm:min-w-32"
              :class="{ 'bg-gray-700/50': showViewDropdown }"
            >
              <!-- Icône de la vue actuelle -->
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Spectacles -->
                <path v-if="currentView === 'events'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3zM9 4h6M9 8h6M9 12h6M9 16h6"/>
                <!-- Participants -->
                <path v-else-if="currentView === 'participants'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                <!-- Chronologique -->
                <path v-else-if="currentView === 'timeline'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18M12 3l4 4M12 3L8 7M12 21l4-4M12 21l-4-4"/>
              </svg>
              <span class="text-xs md:text-sm font-medium">{{ getViewLabel(currentView) }}</span>
              <svg class="w-3 h-3 md:w-4 md:h-4 transition-transform" :class="{ 'rotate-180': showViewDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Menu déroulant des vues -->
            <div v-if="showViewDropdown" class="absolute top-full left-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-xl overflow-hidden z-[1210]">
              <button
                @click="selectView('events')"
                class="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-gray-700/50 transition-colors text-sm"
                :class="{ 'bg-gray-700/50': currentView === 'events' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3zM9 4h6M9 8h6M9 12h6M9 16h6"/>
                </svg>
                <span>Spectacles</span>
              </button>
              
              <button
                @click="selectView('participants')"
                class="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-gray-700/50 transition-colors text-sm"
                :class="{ 'bg-gray-700/50': currentView === 'participants' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>Participants</span>
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
              class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32"
            >
              <!-- Avatar du joueur sélectionné (un seul joueur) -->
              <div v-if="selectedPlayer && !participantsDisplayText" class="flex-shrink-0">
                <PlayerAvatar
                  :player-id="selectedPlayer.id"
                  :player-name="selectedPlayer.name"
                  size="sm"
                  class="w-5 h-5"
                />
              </div>
              <!-- Icône "Tous" quand tous les participants -->
              <div v-else-if="participantsDisplayText === 'Tous'" class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-600 rounded-full">
                <span class="text-xs font-bold">T</span>
              </div>
              <!-- Icône "X/Y Participants" quand plusieurs participants -->
              <div v-else-if="participantsDisplayText && participantsDisplayText.includes('/')" class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-600 rounded-full">
                <span class="text-xs font-bold">👥</span>
              </div>
              <!-- Icône par défaut -->
              <div v-else class="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-600 rounded-full">
                <span class="text-xs font-bold">T</span>
              </div>
              <span class="flex-1 text-left text-xs md:text-sm truncate">
                {{ participantsDisplayText || (selectedPlayer ? selectedPlayer.name : 'Tous') }}
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
import PlayerAvatar from './PlayerAvatar.vue'

// Props
const props = defineProps({
  currentView: {
    type: String,
    required: true,
    validator: (value) => ['events', 'participants', 'timeline'].includes(value)
  },
  showPlayerSelector: {
    type: Boolean,
    default: false
  },
  selectedPlayer: {
    type: Object,
    default: null
  },
  participantsDisplayText: {
    type: String,
    default: null
  },
  // Style props
  headerStyle: {
    type: String,
    default: 'padding-top: max(4px, env(safe-area-inset-top) + 2px); padding-bottom: max(2px, env(safe-area-inset-bottom) + 2px);'
  },
  containerStyle: {
    type: String,
    default: 'padding-left: max(4px, env(safe-area-inset-left)); padding-right: max(4px, env(safe-area-inset-right));'
  },
  isSticky: {
    type: Boolean,
    default: true
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
    case 'events': return 'Spectacles'
    case 'participants': return 'Participants'
    case 'timeline': return 'Chronologique'
    default: return 'Lignes'
  }
}
</script>
