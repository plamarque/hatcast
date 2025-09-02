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
        
        <!-- Bouton Google Sign-In -->
        <button data-testid="google-signin-btn" @click="signInWithGoogle" :disabled="loading" class="w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium flex items-center justify-center gap-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span v-if="loading">⏳ Connexion...</span>
          <span v-else>Continuer avec Google</span>
        </button>
        
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
import { signInPlayer, resetPlayerPassword, signInWithGoogle as firebaseSignInWithGoogle } from '../services/firebase.js'
import playerPasswordSessionManager from '../services/playerPasswordSession.js'
import AuditClient from '../services/auditClient.js'

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
  if (newShow) {
    const prefilledEmail = localStorage.getItem('prefilledEmail')
    if (prefilledEmail) {
      email.value = prefilledEmail
      // Nettoyer localStorage après utilisation
      localStorage.removeItem('prefilledEmail')
    }
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
    
    // Logger l'erreur d'audit
    console.log('🔍 Tentative de logging d\'erreur d\'audit...')
    try {
      console.log('🔍 Appel de logError avec:', e, { context: 'login_attempt', email: email.value.trim() })
      await AuditClient.logError(e, { context: 'login_attempt', email: email.value.trim() })
      console.log('🔍 LogError terminé avec succès')
    } catch (auditError) {
      console.error('❌ Erreur audit error:', auditError)
      console.error('❌ Stack trace:', auditError.stack)
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
    
    // Logger l'erreur d'audit
    try {
      await AuditClient.logError(e, { context: 'password_reset_attempt', email: email.value.trim() })
    } catch (auditError) {
      console.warn('Erreur audit password reset error:', auditError)
    }
  } finally {
    loading.value = false
  }
}

function openAccountCreation() {
  emit('open-account-creation')
}

async function signInWithGoogle() {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const result = await firebaseSignInWithGoogle()
    const user = result.user
    
    // Automatic account creation happens at Firebase Auth level
    // No need for manual createUserWithEmailAndPassword
    
    if (staySignedIn.value && user.email) {
      // Mark device as trusted for Google account
      try { 
        playerPasswordSessionManager.saveSession(user.email) 
      } catch (sessionError) {
        console.warn('Could not save Google auth session:', sessionError)
      }
    }
    
    // Log audit for Google authentication
    try {
      await AuditClient.logLogin(user.email, 'google_auth', {
        isNewUser: result.isNewUser,
        displayName: user.displayName
      })
    } catch (auditError) {
      console.warn('Erreur audit Google login:', auditError)
    }
    
    success.value = result.isNewUser ? 
      'Compte créé et connexion réussie avec Google !' :
      'Connexion réussie avec Google !'
    
    // Emit success with user information
    emit('success', { 
      email: user.email,
      action: 'google_login_success',
      isNewUser: result.isNewUser,
      displayName: user.displayName
    })
  } catch (e) {
    let errorMessage = 'Erreur lors de la connexion avec Google'
    
    // Handle specific Google Auth errors
    if (e.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Connexion annulée'
    } else if (e.code === 'auth/popup-blocked') {
      errorMessage = 'Popup bloquée par le navigateur. Veuillez autoriser les popups.'
    } else if (e.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Connexion annulée'
    }
    
    error.value = errorMessage
    
    // Log audit error for Google authentication
    try {
      await AuditClient.logError(e, { 
        context: 'google_login_attempt',
        errorCode: e.code,
        errorMessage: e.message 
      })
    } catch (auditError) {
      console.error('Erreur audit Google error:', auditError)
    }
  } finally {
    loading.value = false
  }
}
</script>


