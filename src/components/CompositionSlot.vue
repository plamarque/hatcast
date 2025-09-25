<template>
  <div
    class="relative p-3 rounded-lg border text-center transition-all duration-300"
    :class="rootClasses"
  >
    <!-- Filled slot -->
    <div v-if="playerName" class="flex items-center justify-between gap-2">
      <div class="flex-1 flex items-center gap-2 min-w-0" :title="tooltip">
        <div class="flex-shrink-0">
          <PlayerAvatar 
            :player-id="playerId"
            :season-id="seasonId"
            :player-name="playerName"
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
          class="px-2 py-1 rounded text-xs font-medium"
          :class="rightClass"
          :title="rightTitle || ''"
          @click.stop="$emit('right-click')"
        >
          {{ rightText }}
        </button>
        <div v-if="!rightText" class="flex flex-col items-center gap-1">
          <span class="text-lg">{{ roleEmoji }}</span>
          <span class="text-gray-300 text-xs text-center">{{ roleLabel }}</span>
        </div>
        <div v-else class="flex flex-col items-center gap-1">
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
})

defineEmits(['right-click'])

const rootClasses = computed(() => {
  if (props.playerName) {
    // Priority: selection status > availability
    if (props.selectionStatus === 'declined') {
      return 'bg-gradient-to-r from-red-500/60 to-orange-500/60 border-red-500/30'
    }
    if (props.selectionStatus === 'confirmed') {
      return 'bg-gradient-to-r from-purple-500/60 to-pink-500/60 border-purple-500/30'
    }
    if (props.selectionStatus === 'pending') {
      return 'bg-gradient-to-r from-orange-500/60 to-yellow-500/60 border-orange-500/30'
    }
    if (props.unavailable === true) {
      return 'bg-gradient-to-r from-yellow-500/60 to-orange-500/60 border-yellow-500/30'
    }
    if (props.available === false) {
      return 'bg-gradient-to-r from-red-500/60 to-red-600/60 border-red-500/30'
    }
    return 'bg-gradient-to-r from-green-500/60 to-emerald-500/60 border-green-500/30'
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
</script>

<style scoped>
</style>


