<template>
  <div
    class="relative p-3 rounded-lg border text-center transition-all duration-300"
    :class="[rootClasses, isClickable ? 'cursor-pointer' : '']"
    @click.stop="onClick"
  >
    <!-- Filled slot -->
    <div v-if="playerName" class="flex items-center justify-between gap-2">
      <div class="flex-1 flex items-center gap-2 min-w-0" :title="tooltip">
        <div class="flex-shrink-0">
          <PlayerAvatar 
            :player-id="playerId"
            :season-id="seasonId"
            :player-name="playerName"
            :player-gender="playerGender"
            size="sm"
          />
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-white font-medium truncate block text-left">{{ playerName }}</span>
        </div>
      </div>
      <div class="flex-shrink-0 flex flex-col items-center gap-1">
        <button
          v-if="rightText"
          class="px-2 py-1 rounded text-xs font-medium text-white bg-gray-800/50 hover:bg-gray-700/70"
          :title="rightTitle || ''"
          @click.stop="$emit('right-click', $event)"
        >
          {{ rightText }}%<span v-if="rightBrunoText" class="text-gray-400 ml-1">({{ rightBrunoText }}%)</span>
        </button>
        <div v-if="showRoleInfo" class="flex flex-col items-center gap-1">
          <span class="text-lg">{{ roleEmoji }}</span>
          <span class="text-gray-300 text-xs text-center">{{ roleLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Empty slot (readonly) -->
    <div v-else class="flex items-center justify-center">
      <div class="flex items-center gap-2 text-white/80 px-2 py-1 rounded-md">
        <span class="text-lg">＋</span>
        <span class="text-sm">{{ roleLabel }}</span>
        <span class="text-sm">{{ roleEmoji }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { getStatusClass } from '../utils/statusUtils.js'

const props = defineProps({
  playerId: { type: String, default: null },
  playerName: { type: String, default: null },
  playerGender: { type: String, default: 'non-specified' },
  roleKey: { type: String, required: true },
  roleLabel: { type: String, required: true },
  roleEmoji: { type: String, default: '🎭' },
  selectionStatus: { type: String, default: null }, // confirmed | pending | declined | null
  available: { type: Boolean, default: null },
  unavailable: { type: Boolean, default: null },
  isSelectionConfirmedByOrganizer: { type: Boolean, default: false },
  seasonId: { type: String, required: true },
  // Optional right-side badge text (e.g., chance percentage)
  rightText: { type: [String, Number], default: null },
  rightClass: { type: String, default: '' },
  rightTitle: { type: String, default: '' },
  // Bruno algorithm percentage to display in gray
  rightBrunoText: { type: [String, Number], default: null },
  // Control whether to display role emoji and label in the right column
  showRoleInfo: { type: Boolean, default: true },
})

const emit = defineEmits(['right-click', 'slot-click'])

const rootClasses = computed(() => {
  if (props.playerName) {
    return getStatusClass({
      isSelected: true, // Si on est dans CompositionSlot, on est forcément sélectionné
      playerSelectionStatus: props.selectionStatus,
      isAvailable: props.available,
      isUnavailable: props.unavailable,
      isLoading: false,
      isError: false
    })
  }
  return 'border-dashed border-white/20 bg-white/5'
})

const tooltip = computed(() => {
  if (!props.playerName) return ''
  if (props.isSelectionConfirmedByOrganizer) {
    switch (props.selectionStatus) {
      case 'confirmed': return 'Participation confirmée'
      case 'pending': return 'En attente de confirmation'
      case 'declined': return 'A décliné'
      default: return ''
    }
  }
  if (props.unavailable === true) return 'Indisponible'
  if (props.available === false) return 'Non disponible'
  return ''
})

const isClickable = computed(() => {
  // Clickable when a player is present and the organizer has confirmed the selection
  return !!props.playerName && !!props.isSelectionConfirmedByOrganizer
})

function onClick() {
  if (!isClickable.value) return
  emit('slot-click')
}
</script>

<style scoped>
</style>


