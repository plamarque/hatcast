<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[170] p-4" @click="$emit('close')">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <button @click="$emit('close')" class="absolute right-3 top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">👤</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Se connecter</h2>
        <p class="text-sm text-gray-300">Connectez-vous pour gérer votre compte et vos préférences</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input data-testid="email-input" v-model="email" type="email" class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400" placeholder="votre@email.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
          <input data-testid="password-input" v-model="password" type="password" class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400" placeholder="Mot de passe">
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-gray-300 text-sm">
            <input type="checkbox" v-model="staySignedIn" class="w-4 h-4">
            <span>Rester connecté sur cet appareil</span>
          </label>
          <button data-testid="forgot-password-btn" @click="forgotPassword" class="text-sm text-blue-400 hover:text-blue-300 underline">Mot de passe oublié ?</button>
        </div>

        <div v-if="error" data-testid="error-message" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{{ error }}</div>
        <div v-if="success" data-testid="success-message" class="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">{{ success }}</div>

        <div class="flex justify-center gap-3 mt-2">
          <button data-testid="submit-btn" @click="login" :disabled="!canLogin || loading" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="animate-spin">⏳</span>
            <span v-else>Se connecter</span>
          </button>
          <button @click="$emit('close')" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">Fermer</button>
        </div>
        
        <!-- Séparateur -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-800 text-gray-400">ou</span>
          </div>
        </div>
        
        <!-- Bouton de création de compte -->
        <button data-testid="create-account-btn" @click="openAccountCreation" class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium">
          🚀 Créer un compte
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { signInPlayer, resetPlayerPassword } from '../services/firebase.js'
import playerPasswordSessionManager from '../services/playerPasswordSession.js'
import AuditClient from '../services/auditClient.js'
import logger from '../services/logger.js'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'success', 'open-account-creation'])

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const staySignedIn = ref(true)

// Récupérer l'email pré-rempli depuis localStorage quand la modal s'ouvre
watch(() => props.show, (newShow) => {
  logger.info('🔑 AccountLoginModal: props.show changé à', newShow)
  if (newShow) {
    logger.info('🔑 AccountLoginModal: Modal ouverte, récupération email pré-rempli')
    const prefilledEmail = localStorage.getItem('prefilledEmail')
    if (prefilledEmail) {
      email.value = prefilledEmail
      // Nettoyer localStorage après utilisation
      localStorage.removeItem('prefilledEmail')
    }
    logger.info('🔑 AccountLoginModal: Email actuel:', email.value)
  }
}, { immediate: true })

const canLogin = computed(() => !!email.value && email.value.includes('@') && !!password.value)

async function login() {
  if (!canLogin.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await signInPlayer(email.value.trim(), password.value)
    if (staySignedIn.value) {
      // Marquer l'appareil de confiance pour l'email du compte afin d'éviter la re-saisie
      try { playerPasswordSessionManager.saveSession(email.value.trim()) } catch {}
    }
    
    // Logger l'audit de connexion
    try {
      await AuditClient.logLogin(email.value.trim(), 'email_password')
    } catch (auditError) {
      console.warn('Erreur audit login:', auditError)
    }
    
    emit('success', { 
      email: email.value.trim(),
      action: 'login_success'
    })
  } catch (e) {
    error.value = 'Email ou mot de passe incorrect'
    
    // Logger la tentative de connexion échouée (info, pas une erreur)
    try {
      await AuditClient.logUserAction({
        type: 'login_attempt_failed',
        category: 'auth',
        severity: 'info',
        data: {
          email: AuditClient.obfuscateEmail(email.value.trim()),
          error: e.message || 'Invalid credentials',
          timestamp: new Date().toISOString()
        },
        success: false,
        tags: ['auth', 'login', 'failed_attempt']
      })
    } catch (auditError) {
      console.warn('Erreur audit login failed:', auditError)
    }
  } finally {
    loading.value = false
  }
}

async function forgotPassword() {
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Veuillez d\'abord saisir votre adresse email'
    return
  }
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    await resetPlayerPassword(email.value.trim())
    success.value = 'Un email de réinitialisation a été envoyé à votre adresse email'
    
    // Logger l'audit de reset de mot de passe
    try {
      await AuditClient.logUserAction({
        type: 'password_reset_requested',
        category: 'auth',
        severity: 'info',
        data: {
          email: AuditClient.obfuscateEmail(email.value.trim()),
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['auth', 'password_reset']
      })
    } catch (auditError) {
      console.warn('Erreur audit password reset:', auditError)
    }
  } catch (e) {
    error.value = 'Impossible d\'envoyer l\'email de réinitialisation'
    
    // Logger la tentative de reset échouée (info, pas une erreur)
    try {
      await AuditClient.logUserAction({
        type: 'password_reset_attempt_failed',
        category: 'auth',
        severity: 'info',
        data: {
          email: AuditClient.obfuscateEmail(email.value.trim()),
          error: e.message || 'Reset failed',
          timestamp: new Date().toISOString()
        },
        success: false,
        tags: ['auth', 'password_reset', 'failed_attempt']
      })
    } catch (auditError) {
      console.warn('Erreur audit password reset failed:', auditError)
    }
  } finally {
    loading.value = false
  }
}

function openAccountCreation() {
  emit('open-account-creation')
}
</script>


