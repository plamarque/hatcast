<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔐</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Vérification requise</h2>
        <p class="text-lg text-gray-300">{{ player?.name }}</p>
        <p class="text-sm text-gray-400 mt-2">Ce joueur est protégé par mot de passe</p>
      </div>

      <!-- Formulaire de vérification -->
      <div class="mb-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe du joueur</label>
            <input
              v-model="password"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Entrez le mot de passe"
              @keydown.enter="verifyPassword"
              ref="passwordInput"
            >
          </div>
          

        </div>
        
        <button
          @click="verifyPassword"
          :disabled="!password || loading"
          class="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>🔓</span>
          <span>{{ loading ? 'Vérification...' : 'Vérifier' }}</span>
        </button>
      </div>

      <!-- Mot de passe oublié -->
      <div class="mb-6 text-center">
        <button
          @click="showForgotPassword = true"
          class="text-sm text-blue-400 hover:text-blue-300 transition-colors underline"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ error }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="closeModal"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>

  <!-- Modal mot de passe oublié -->
  <div v-if="showForgotPassword" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4" @click="showForgotPassword = false">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">📧</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Mot de passe oublié</h2>
        <p class="text-lg text-gray-300">{{ player?.name }}</p>
      </div>

      <div class="mb-6">
        <p class="text-sm text-gray-300 mb-4">
          Un email de réinitialisation sera envoyé à l'adresse associée à ce joueur.
        </p>
        
        <button
          @click="sendResetEmail"
          :disabled="loading"
          class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>📧</span>
          <span>{{ loading ? 'Envoi...' : 'Envoyer l\'email' }}</span>
        </button>
      </div>

      <!-- Messages -->
      <div v-if="forgotPasswordError" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ forgotPasswordError }}</div>
      </div>

      <div v-if="forgotPasswordSuccess" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="text-green-300 text-sm">{{ forgotPasswordSuccess }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="showForgotPassword = false"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { verifyPlayerPassword, sendPasswordResetEmail } from '../services/playerProtection.js'
import { getSeasonPin } from '../services/seasons.js'
import playerPasswordSessionManager from '../services/playerPasswordSession.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  player: {
    type: Object,
    default: null
  },
  seasonId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'verified'])

const password = ref('')
const loading = ref(false)
const error = ref('')
const showForgotPassword = ref(false)
const forgotPasswordError = ref('')
const forgotPasswordSuccess = ref('')
const passwordInput = ref(null)

// Vérifier le mot de passe
async function verifyPassword() {
  if (!password.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Vérifier si c'est le PIN de saison
    const seasonPin = await getSeasonPin(props.seasonId)
    if (password.value === seasonPin) {
      // PIN de saison accepté
      emit('verified', { type: 'season_pin' })
      closeModal()
      return
    }
    
    // Vérifier le mot de passe du joueur
    const isValid = await verifyPlayerPassword(props.player.id, password.value, props.seasonId)
    
    if (isValid) {
      // Sauvegarder la session (déjà fait dans verifyPlayerPassword)
      emit('verified', { type: 'player_password' })
      closeModal()
    } else {
      error.value = 'Mot de passe incorrect. Veuillez réessayer.'
    }
  } catch (err) {
    console.error('Erreur lors de la vérification:', err)
    error.value = 'Erreur lors de la vérification. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

// Envoyer l'email de réinitialisation
async function sendResetEmail() {
  loading.value = true
  forgotPasswordError.value = ''
  forgotPasswordSuccess.value = ''
  
  try {
    const result = await sendPasswordResetEmail(props.player.id, props.seasonId)
    forgotPasswordSuccess.value = result.message || 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.'
  } catch (err) {
    console.error('Erreur lors de l\'envoi de l\'email:', err)
    forgotPasswordError.value = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

function closeModal() {
  emit('close')
  // Réinitialiser les champs
  password.value = ''
  error.value = ''
  showForgotPassword.value = false
  forgotPasswordError.value = ''
  forgotPasswordSuccess.value = ''
}

// Focus sur le champ mot de passe à l'ouverture
watch(() => props.show, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (passwordInput.value) {
        passwordInput.value.focus()
      }
    })
  }
})
</script>
