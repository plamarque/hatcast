<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1370] p-2 sm:p-4">
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

        <!-- Commentaire de disponibilité (si disponible) -->
        <div v-if="availabilityComment" class="mb-4 sm:mb-6">
          <div class="text-xs sm:text-sm font-medium text-gray-300 mb-2">Note de disponibilité</div>
          <div class="p-2 sm:p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 italic text-xs sm:text-sm">
            "{{ availabilityComment }}"
          </div>
        </div>

        <!-- Actions de confirmation -->
        <div class="grid grid-cols-3 gap-2">
          <button
            @click="handleConfirm"
            class="px-3 py-3 bg-gradient-to-br from-purple-500/60 to-pink-500/60 hover:from-purple-500/80 hover:to-pink-500/80 text-white rounded-lg transition-all duration-300 font-medium"
          >
            <span class="flex flex-col items-center justify-center gap-1">
              <span class="text-lg">👍</span>
              <span class="text-xs">Confirmer</span>
            </span>
          </button>
          
          <button
            @click="handleDecline"
            class="px-3 py-3 bg-gradient-to-br from-red-500/60 to-orange-500/60 hover:from-red-500/80 hover:to-orange-500/80 text-white rounded-lg transition-all duration-300 font-medium"
          >
            <span class="flex flex-col items-center justify-center gap-1">
              <span class="text-lg">👎</span>
              <span class="text-xs">Décliner</span>
            </span>
          </button>
          
          <button
            @click="handlePending"
            class="px-3 py-3 bg-gradient-to-br from-orange-500/60 to-yellow-500/60 hover:from-orange-500/80 hover:to-yellow-500/80 text-white rounded-lg transition-all duration-300 font-medium"
          >
            <span class="flex flex-col items-center justify-center gap-1">
              <span class="text-lg">⏳</span>
              <span class="text-xs">À confirmer</span>
            </span>
          </button>
        </div>

        <!-- Message d'information -->
        <div class="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <div class="text-xs sm:text-sm text-blue-300">
            <div class="font-medium mb-1">💡 Astuce</div>
            <div>Tu peux changer ta réponse à tout moment en cliquant à nouveau sur ta cellule.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
    status: 'confirmed'
  })
}

function handleDecline() {
  emit('decline', {
    playerName: props.playerName,
    eventId: props.eventId,
    status: 'declined'
  })
}

function handlePending() {
  emit('pending', {
    playerName: props.playerName,
    eventId: props.eventId,
    status: 'pending'
  })
}
</script>
