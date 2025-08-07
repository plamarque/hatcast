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
      <div v-else-if="playerData" class="space-y-6">
        <div class="text-center">
          <p class="text-gray-300">Joueur : <span class="font-semibold text-white">{{ playerData.name }}</span></p>
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
import { updatePassword } from 'firebase/auth'
import { auth } from '../services/firebase.js'
import { getPlayerProtectionData, updatePlayerPasswordInFirestore } from '../services/playerProtection.js'
import { getSeasonBySlug } from '../services/seasons.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const playerData = ref(null)
const seasonId = ref(null)

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
    const { player, season, token } = route.query
    
    // Si on a un token Firebase (oobCode), on doit d'abord le vérifier
    if (token && !player && !season) {
      console.log('🔍 [DEBUG] Token Firebase détecté:', token)
      
      // Vérifier le token Firebase
      const { confirmPasswordReset } = await import('firebase/auth')
      const { auth } = await import('../services/firebase.js')
      
      try {
        // Le token est valide, on peut maintenant chercher le joueur
        // Pour cela, on va chercher dans toutes les saisons
        const { collection, getDocs } = await import('firebase/firestore')
        const { db } = await import('../services/firebase.js')
        
        // Chercher dans toutes les saisons
        const seasonsRef = collection(db, 'seasons')
        const seasonsSnapshot = await getDocs(seasonsRef)
        
        let foundPlayer = null
        let foundSeason = null
        
        for (const seasonDoc of seasonsSnapshot.docs) {
          const protectionRef = collection(db, 'seasons', seasonDoc.id, 'playerProtection')
          const protectionSnapshot = await getDocs(protectionRef)
          
          for (const protectionDoc of protectionSnapshot.docs) {
            const protectionData = protectionDoc.data()
            if (protectionData.firebaseUid) {
              // Vérifier si ce compte correspond au token
              // Pour l'instant, on va chercher par email dans les logs Firebase
              console.log('🔍 [DEBUG] Vérification protection:', protectionData)
            }
          }
        }
        
        // Pour l'instant, on va utiliser une approche simplifiée
        // En production, il faudrait stocker le mapping token -> player
        error.value = 'Token Firebase reçu. Veuillez utiliser le lien direct avec player et season.'
        loading.value = false
        return
        
      } catch (firebaseError) {
        console.error('❌ [ERROR] Erreur Firebase:', firebaseError)
        error.value = 'Token de réinitialisation invalide ou expiré'
        loading.value = false
        return
      }
    }
    
    // Approche normale avec player et season
    if (!player || !season || !token) {
      error.value = 'Lien de réinitialisation incomplet'
      loading.value = false
      return
    }

    // Vérifier le token (en production, vérifiez le token avec Firebase)
    // Pour l'instant, on fait confiance au token
    
    // Récupérer les informations de la saison
    const seasonData = await getSeasonBySlug(season)
    if (!seasonData) {
      error.value = 'Saison non trouvée'
      loading.value = false
      return
    }
    
    seasonId.value = seasonData.id
    
    // Récupérer les informations du joueur
    const protectionData = await getPlayerProtectionData(player, seasonId.value)
    if (!protectionData || !protectionData.isProtected) {
      error.value = 'Joueur non trouvé ou non protégé'
      loading.value = false
      return
    }
    
    // Récupérer le nom du joueur depuis la collection players
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('../services/firebase.js')
    
    const playerRef = doc(db, 'seasons', seasonId.value, 'players', player)
    const playerDoc = await getDoc(playerRef)
    
    if (!playerDoc.exists()) {
      error.value = 'Joueur non trouvé'
      loading.value = false
      return
    }
    
    playerData.value = {
      id: player,
      name: playerDoc.data().name,
      email: protectionData.email
    }
    
  } catch (err) {
    console.error('Erreur lors de la vérification du lien:', err)
    error.value = 'Erreur lors de la vérification du lien'
  } finally {
    loading.value = false
  }
})

async function resetPassword() {
  if (!canResetPassword.value) return
  
  resetLoading.value = true
  resetError.value = ''
  resetSuccess.value = ''
  
  try {
    // Mettre à jour le mot de passe dans Firebase Auth
    await updatePassword(auth.currentUser, newPassword.value)
    
    // Mettre à jour le hash dans Firestore
    await updatePlayerPasswordInFirestore(playerData.value.id, newPassword.value, seasonId.value)
    
    resetSuccess.value = 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
    
    // Rediriger vers l'accueil après 3 secondes
    setTimeout(() => {
      goHome()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la réinitialisation:', err)
    
    if (err.code === 'auth/weak-password') {
      resetError.value = 'Le mot de passe doit contenir au moins 6 caractères'
    } else if (err.code === 'auth/requires-recent-login') {
      resetError.value = 'Session expirée. Veuillez cliquer sur le lien dans votre email à nouveau'
    } else {
      resetError.value = 'Erreur lors de la réinitialisation. Veuillez réessayer'
    }
  } finally {
    resetLoading.value = false
  }
}

function goHome() {
  router.push('/')
}
</script>
