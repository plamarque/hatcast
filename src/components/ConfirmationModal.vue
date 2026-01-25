<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1400] p-2 sm:p-4">
    <div class="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto mx-2">
      <!-- Header -->
      <div class="p-3 sm:p-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg sm:text-xl font-bold text-white">
            Confirmer ma participation
          </h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Informations de l'événement -->
        <div class="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-300">
          <div class="font-medium text-white">{{ eventTitle }}</div>
          <div>{{ formatDate(eventDate) }}</div>
        </div>
      </div>

      <!-- Contenu -->
      <div class="p-3 sm:p-4">
        <!-- Rôle assigné -->
        <div class="mb-4 sm:mb-6">
          <div class="text-xs sm:text-sm font-medium text-gray-300 mb-2">Rôle assigné</div>
          <div class="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-800 border border-gray-600 rounded-lg">
            <span class="text-xl sm:text-2xl">{{ getRoleEmoji(assignedRole) }}</span>
            <span class="text-white font-medium text-sm sm:text-base">{{ getRoleLabelLocal(assignedRole) }}</span>
          </div>
        </div>

        <!-- Actions de confirmation -->
        <div class="grid grid-cols-3 gap-2 mb-4 sm:mb-6">
          <button
            @click="handleConfirm"
            :class="[
              'px-3 py-3 text-white rounded-lg transition-all duration-300 font-medium',
              isConfirmed 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400 shadow-lg shadow-purple-500/25' 
                : 'bg-gradient-to-br from-purple-500/60 to-pink-500/60 hover:from-purple-500/80 hover:to-pink-500/80'
            ]"
          >
            <span class="flex flex-col items-center justify-center gap-1">
              <span class="flex items-center gap-1">
                <span v-if="isConfirmed" class="text-purple-200 text-sm">✓</span>
                <span class="text-lg">👍</span>
              </span>
              <span class="text-xs">Confirmer</span>
            </span>
          </button>
          
          <button
            @click="handleDecline"
            :class="[
              'px-3 py-3 text-white rounded-lg transition-all duration-300 font-medium',
              isDeclined 
                ? 'bg-gradient-to-br from-red-600 to-orange-600 border-2 border-red-400 shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-br from-red-500/60 to-orange-500/60 hover:from-red-500/80 hover:to-orange-500/80'
            ]"
          >
            <span class="flex flex-col items-center justify-center gap-1">
              <span class="flex items-center gap-1">
                <span v-if="isDeclined" class="text-red-200 text-sm">✓</span>
                <span class="text-lg">👎</span>
              </span>
              <span class="text-xs">Décliner</span>
            </span>
          </button>
          
          <button
            @click="handlePending"
            :class="[
              'px-3 py-3 text-white rounded-lg transition-all duration-300 font-medium',
              isPending 
                ? 'bg-gradient-to-br from-orange-600 to-yellow-600 border-2 border-orange-400 shadow-lg shadow-orange-500/25' 
                : 'bg-gradient-to-br from-orange-500/60 to-yellow-500/60 hover:from-orange-500/80 hover:to-yellow-500/80'
            ]"
          >
            <span class="flex flex-col items-center justify-center gap-1">
              <span class="flex items-center gap-1">
                <span v-if="isPending" class="text-orange-200 text-sm">✓</span>
                <span class="text-lg">⏳</span>
              </span>
              <span class="text-xs">À confirmer</span>
            </span>
          </button>
        </div>

        <!-- Saisie d'une note facultative -->
        <div>
          <div class="text-xs sm:text-sm font-medium text-gray-300 mb-2">Ajouter une note (optionnel)</div>
          <textarea
            v-model="comment"
            class="w-full p-2 sm:p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            :placeholder="'Ex: j\'arrive vers 18h30, ok pour le bar'"
          />
          <div class="text-[11px] sm:text-xs text-gray-500 mt-1">Visible par l'organisateur·ice.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ROLES, ROLE_EMOJIS, ROLE_LABELS_SINGULAR, getRoleLabel } from '../services/storage.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerName: {
    type: String,
    required: true
  },
  playerGender: {
    type: String,
    default: 'non-specified'
  },
  eventId: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  assignedRole: {
    type: String,
    required: true
  },
  availabilityComment: {
    type: String,
    default: null
  },
  currentStatus: {
    type: String,
    default: 'pending'
  }
})

const emit = defineEmits(['close', 'confirm', 'decline', 'pending'])

const comment = ref(props.availabilityComment || '')
watch(() => props.availabilityComment, (val) => {
  comment.value = val || ''
})

// Computed properties pour déterminer le statut actuel
const isConfirmed = computed(() => {
  return props.currentStatus === 'confirmed'
})

const isDeclined = computed(() => {
  return props.currentStatus === 'declined'
})

const isPending = computed(() => {
  return props.currentStatus === 'pending'
})

function getRoleEmoji(role) {
  return ROLE_EMOJIS[role] || '🎭'
}

function getRoleLabelLocal(role) {
  return getRoleLabel(role, props.playerGender, false) || role
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function handleConfirm() {
  emit('confirm', {
    playerName: props.playerName,
    eventId: props.eventId,
    status: 'confirmed',
    comment: comment.value
  })
}

function handleDecline() {
  emit('decline', {
    playerName: props.playerName,
    eventId: props.eventId,
    status: 'declined',
    comment: comment.value
  })
}

function handlePending() {
  emit('pending', {
    playerName: props.playerName,
    eventId: props.eventId,
    status: 'pending',
    comment: comment.value
  })
}
</script>
