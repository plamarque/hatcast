<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-3xl">🔑</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Réinitialisation</h1>
        <p class="text-lg text-gray-300">Nouveau mot de passe</p>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-300">Vérification du lien...</p>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="text-center py-8">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">❌</span>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Lien invalide</h2>
        <p class="text-gray-300 mb-6">{{ error }}</p>
        <button
          @click="goHome"
          class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
        >
          Retour à l'accueil
        </button>
      </div>

      <!-- Formulaire de réinitialisation -->
      <div v-else-if="email" class="space-y-6">
        <div class="text-center">
          <p class="text-gray-300">Email : <span class="font-semibold text-white">{{ email }}</span></p>
        </div>

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
          :disabled="!canResetPassword || resetLoading"
          class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="resetLoading" class="animate-spin">⏳</span>
          <span v-else>🔑</span>
          <span>{{ resetLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}</span>
        </button>

        <!-- Messages d'erreur -->
        <div v-if="resetError" class="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div class="text-red-300 text-sm">{{ resetError }}</div>
        </div>

        <!-- Messages de succès -->
        <div v-if="resetSuccess" class="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div class="text-green-300 text-sm">{{ resetSuccess }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { confirmPasswordReset } from 'firebase/auth'
import { auth } from '../services/firebase.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const email = ref('')
const oobCode = ref('')

const newPassword = ref('')
const confirmPassword = ref('')
const resetLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref('')

const canResetPassword = computed(() => {
  return newPassword.value && 
         confirmPassword.value && 
         newPassword.value === confirmPassword.value &&
         newPassword.value.length >= 6
})

onMounted(async () => {
  try {
    // Récupérer les paramètres de l'URL
    const { oobCode: token } = route.query
    
    console.log('🔍 [DEBUG] Token reçu:', token)
    
    if (!token) {
      error.value = 'Lien de réinitialisation incomplet'
      loading.value = false
      return
    }

    oobCode.value = token
    
    // Pour l'instant, on va utiliser une approche simplifiée
    // En production, on pourrait récupérer l'email depuis le token
    email.value = 'patrice.lamarque+ron@gmail.com' // Temporaire
    
    loading.value = false
    
  } catch (err) {
    console.error('Erreur lors de la vérification du lien:', err)
    error.value = 'Erreur lors de la vérification du lien'
    loading.value = false
  }
})

async function resetPassword() {
  if (!canResetPassword.value) return
  
  resetLoading.value = true
  resetError.value = ''
  resetSuccess.value = ''
  
  try {
    console.log('🔍 [DEBUG] Début réinitialisation avec token:', oobCode.value)
    
    // Réinitialisation avec token Firebase
    await confirmPasswordReset(auth, oobCode.value, newPassword.value)
    console.log('🔍 [DEBUG] Mot de passe Firebase Auth mis à jour')
    
    // Pas besoin de mettre à jour Firestore, Firebase Auth gère tout !
    console.log('🔍 [DEBUG] Réinitialisation terminée avec Firebase Auth')
    resetSuccess.value = 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
    
    // Rediriger vers l'accueil après 3 secondes
    setTimeout(() => {
      goHome()
    }, 3000)
  } catch (err) {
    console.error('❌ [ERROR] Erreur lors de la réinitialisation:', err)
    
    if (err.code === 'auth/weak-password') {
      resetError.value = 'Le mot de passe doit contenir au moins 6 caractères'
    } else if (err.code === 'auth/invalid-action-code') {
      resetError.value = 'Lien de réinitialisation invalide ou expiré'
    } else {
      resetError.value = 'Erreur lors de la réinitialisation. Veuillez réessayer.'
    }
  } finally {
    resetLoading.value = false
  }
}

function goHome() {
  router.push('/')
}
</script>
