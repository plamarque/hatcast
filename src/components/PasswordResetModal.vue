<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1330] p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔑</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Nouveau mot de passe</h2>
        <p class="text-lg text-gray-300">{{ playerName }}</p>
      </div>

      <!-- Formulaire de réinitialisation -->
      <div class="mb-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Nouveau mot de passe</label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Nouveau mot de passe"
              @keydown.enter="resetPassword"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Confirmer le mot de passe"
              @keydown.enter="resetPassword"
            >
          </div>
        </div>
        
        <button
          @click="resetPassword"
          :disabled="!canResetPassword || loading"
          class="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>🔑</span>
          <span>{{ loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}</span>
        </button>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ error }}</div>
      </div>

      <!-- Messages de succès -->
      <div v-if="success" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="text-green-300 text-sm">{{ success }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="closeModal"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { updatePassword } from 'firebase/auth'
import { auth } from '../services/firebase.js'
import logger from '../services/logger.js'
import { updatePlayerPasswordInFirebaseAuth } from '../services/playerProtection.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerId: {
    type: String,
    default: null
  },
  playerName: {
    type: String,
    default: ''
  },
  seasonId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const canResetPassword = computed(() => {
  return newPassword.value && 
         confirmPassword.value && 
         newPassword.value === confirmPassword.value &&
         newPassword.value.length >= 6
})

async function resetPassword() {
  if (!canResetPassword.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Mettre à jour le mot de passe dans Firebase Auth
    await updatePlayerPasswordInFirebaseAuth(newPassword.value)
    
    success.value = 'Mot de passe réinitialisé avec succès !'
    
    // Réinitialiser les champs
    newPassword.value = ''
    confirmPassword.value = ''
    
    // Émettre l'événement de succès
    emit('success')
    
    // Fermer la modal après 2 secondes
    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (err) {
    logger.error('Erreur lors de la réinitialisation', err)
    
    if (err.code === 'auth/weak-password') {
      error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    } else if (err.code === 'auth/requires-recent-login') {
      error.value = 'Session expirée. Veuillez vous reconnecter'
    } else {
      error.value = 'Erreur lors de la réinitialisation. Veuillez réessayer'
    }
  } finally {
    loading.value = false
  }
}

function closeModal() {
  emit('close')
  // Réinitialiser les champs
  newPassword.value = ''
  confirmPassword.value = ''
  error.value = ''
  success.value = ''
}
</script>
