<template>
    <div class="view-header bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/30 w-full flex items-center justify-between"
         :class="{ 'sticky top-0 left-0 z-[120] shadow-lg': isSticky }"
         :style="headerStyle + '; ' + containerStyle">
          <!-- Sélecteur de joueur (à gauche) -->
          <div v-if="showPlayerSelector" class="relative flex-shrink-0 ml-4 md:ml-6">
            <button
              @click="togglePlayerModal"
              class="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors min-w-24 md:min-w-32"
            >
              <!-- Avatar du joueur sélectionné (un seul joueur) -->
              <div v-if="selectedPlayer && !participantsDisplayText" class="flex-shrink-0">
                <PlayerAvatar
                  :player-id="selectedPlayer.id"
                  :player-name="selectedPlayer.name"
                  :season-id="seasonId"
                  :player-gender="selectedPlayer.gender || playerGender"
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

          <!-- Tab switcher à droite -->
          <div class="flex bg-gray-800/50 rounded-lg p-1 mr-4 md:mr-6">
            <button
              @click="selectView('events')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'events' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3zM9 4h6M9 8h6M9 12h6M9 16h6"/>
              </svg>
              <span class="hidden sm:inline">Spectacles</span>
            </button>
            
            <button
              @click="selectView('participants')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'participants' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="hidden sm:inline">Participants</span>
            </button>
            
            <button
              @click="selectView('timeline')"
              class="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors"
              :class="currentView === 'timeline' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="hidden sm:inline">Chronologique</span>
            </button>
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
  seasonId: {
    type: String,
    required: true
  },
  playerGender: {
    type: String,
    default: 'non-specified'
  },
  // Style props
  headerStyle: {
    type: String,
    default: 'padding-top: max(4px, env(safe-area-inset-top) + 2px); padding-bottom: 8px;'
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

// Fonctions

function selectView(view) {
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
