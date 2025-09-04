<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[170] p-4" @click="$emit('close')">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto my-auto" @click.stop>
      <button @click="$emit('close')" class="absolute right-3 top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>
      
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🚀</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Créer ton compte</h2>
        <p class="text-sm text-gray-300">Rejoins HatCast et profite de toutes les fonctionnalités !</p>
      </div>

      <!-- Étape 1: Saisie de l'email -->
      <div v-if="step === 1" class="space-y-4">
        <!-- Google Sign-Up Button (Primary) -->
        <button 
          data-testid="google-signup-btn" 
          @click="signUpWithGoogle" 
          :disabled="loading" 
          class="w-full px-6 py-4 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium shadow-lg border border-gray-200"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <div v-else class="flex items-center gap-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuer avec Google</span>
          </div>
        </button>
        
        <!-- Séparateur -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-800 text-gray-400">ou création avec email</span>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Adresse email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400" 
            placeholder="votre@email.com"
            @keydown.enter="sendVerificationEmail"
          >
        </div>
        
        <!-- Bénéfices du compte -->
        <AccountBenefitsHint />
        
        <!-- Message de succès -->
        <div v-if="verificationSent" class="space-y-4">
          <div class="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 text-sm flex items-center gap-2">
            <span>✅</span>
            <span>Un email de vérification a été envoyé à {{ email }}. Vérifie ta boîte mail et clique sur le lien pour continuer. Si tu ne reçois pas l'email dans quelques minutes, vérifie tes dossiers de spam/courrier indésirable.</span>
          </div>
          
          <!-- Instructions pour continuer -->
          <div class="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-200 text-sm">
            <p class="font-medium mb-2">📧 Prochaines étapes :</p>
            <ol class="list-decimal list-inside space-y-1 text-xs">
              <li>Vérifie ta boîte mail (et les spams si nécessaire)</li>
              <li>Clique sur le lien de vérification dans l'email</li>
              <li>Définis ton mot de passe sur la page qui s'ouvre</li>
              <li>Tu seras automatiquement connecté et redirigé</li>
            </ol>
          </div>
        </div>
        
        <!-- Messages d'erreur -->
        <div v-if="error" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{{ error }}</div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-center gap-3">
        <!-- Étape 1: Envoyer l'email de vérification -->
        <button 
          v-if="step === 1" 
          @click="sendVerificationEmail" 
          :disabled="!validEmail || loading" 
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>✉️</span>
          <span>{{ loading ? 'Envoi...' : 'Envoyer l\'email de vérification' }}</span>
        </button>
        
        <!-- Bouton fermer -->
        <button 
          v-if="step === 1" 
          @click="$emit('close')" 
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { getFirebaseAuth, signUpWithGoogle as firebaseSignUpWithGoogle } from '../services/firebase.js'
import AuditClient from '../services/auditClient.js'
// Navigation tracking supprimé - remplacé par seasonPreferences
import AccountBenefitsHint from './AccountBenefitsHint.vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'success'])

const step = ref(1)
const email = ref('')
const loading = ref(false)
const error = ref('')
const verificationSent = ref(false)

const validEmail = computed(() => email.value && email.value.includes('@'))

// Réinitialiser l'état quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    step.value = 1
    email.value = ''
    error.value = ''
    verificationSent.value = false
  }
})

async function signUpWithGoogle() {
  loading.value = true
  error.value = ''
  
  try {
    const user = await firebaseSignUpWithGoogle()
    
    // Store navigation state for post-signup redirect
    const currentNavigation = {
      lastVisitedPage: window.location.pathname + window.location.search,
      timestamp: Date.now(),
      email: user.email
    }
    localStorage.setItem('pendingAccountCreationNavigation', JSON.stringify(currentNavigation))
    
    // Log audit for Google sign-up
    try {
      await AuditClient.logUserAction({
        type: 'google_signup_success',
        category: 'auth',
        severity: 'info',
        data: {
          email: AuditClient.obfuscateEmail(user.email),
          isNewUser: user.metadata.creationTime === user.metadata.lastSignInTime,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['auth', 'google', 'signup', 'success']
      })
    } catch (auditError) {
      console.warn('Error logging Google sign-up audit:', auditError)
    }
    
    emit('success', { 
      email: user.email,
      action: 'google_signup_success',
      isNewUser: user.metadata.creationTime === user.metadata.lastSignInTime
    })
  } catch (e) {
    error.value = e.message || 'Erreur lors de l\'inscription avec Google'
    
    // Log failed Google sign-up attempt
    try {
      await AuditClient.logUserAction({
        type: 'google_signup_attempt_failed',
        category: 'auth',
        severity: 'info',
        data: {
          error: e.message || 'Google sign-up failed',
          code: e.code || 'unknown',
          timestamp: new Date().toISOString()
        },
        success: false,
        tags: ['auth', 'google', 'signup', 'failed_attempt']
      })
    } catch (auditError) {
      console.warn('Error logging Google sign-up failed audit:', auditError)
    }
  } finally {
    loading.value = false
  }
}

async function sendVerificationEmail() {
  if (!validEmail.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth not initialized')
    }
    
    // Créer un compte temporaire avec un mot de passe temporaire
    const tempPassword = 'TempPass123!' // Mot de passe temporaire sécurisé
    const userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), tempPassword)
    
    // Stocker la navigation actuelle pour la redirection après création de compte
    const currentNavigation = {
      lastVisitedPage: window.location.pathname + window.location.search,
      timestamp: Date.now(),
      email: email.value.trim()
    }
    localStorage.setItem('pendingAccountCreationNavigation', JSON.stringify(currentNavigation))
    
    // Envoyer l'email de réinitialisation de mot de passe
    await sendPasswordResetEmail(auth, email.value.trim())
    
    // Se déconnecter immédiatement (on garde juste le compte pour la vérification)
    await auth.signOut()
    
    verificationSent.value = true
    
  } catch (e) {
    console.error('Erreur lors de l\'envoi de l\'email:', e)
    
    if (e.code === 'auth/email-already-in-use') {
      error.value = 'Un compte existe déjà avec cette adresse email. Utilise le bouton "Se connecter" à la place.'
    } else if (e.code === 'auth/invalid-email') {
      error.value = 'Adresse email invalide.'
    } else if (e.code === 'auth/weak-password') {
      error.value = 'Erreur interne. Veuillez réessayer.'
    } else {
      error.value = 'Impossible d\'envoyer l\'email de vérification. Veuillez réessayer.'
    }
  } finally {
    loading.value = false
  }
}
</script>
