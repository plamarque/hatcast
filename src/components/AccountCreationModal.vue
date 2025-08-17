<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[170] p-4" @click="$emit('close')">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
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
            <span>Un email de vérification a été envoyé à {{ email }}. Vérifie ta boîte mail et clique sur le lien pour continuer.</span>
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
import { auth } from '../services/firebase.js'
import { getLastVisitedPage, isValidRedirectPath } from '../services/navigationTracker.js'
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

async function sendVerificationEmail() {
  if (!validEmail.value) return
  
  loading.value = true
  error.value = ''
  
  try {
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
