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
      <div v-else-if="oobCode" class="space-y-6">
        <div class="text-center">
          <p class="text-gray-300 mb-4">
            Réinitialisation pour <span class="font-semibold text-white">{{ email }}</span>
          </p>
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
import { signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, safeVerifyPasswordResetCode, safeConfirmPasswordReset } from '../services/firebase.js'
import logger from '../services/logger.js'
// Navigation tracking supprimé - remplacé par seasonPreferences

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
  console.log('🚀 PasswordReset onMounted STARTED')
  try {
    // 🔍 DEBUG: Capture environment info
    const debugInfo = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      route: {
        path: route.path,
        query: route.query,
        params: route.params
      }
    }
    
    console.log('🔍 PasswordReset DEBUG INFO:', debugInfo)
    
    // Récupérer les paramètres de l'URL (support Firebase Auth + Magic Links)
    const { oobCode: firebaseToken, email: emailParam, player: playerId, token: magicToken } = route.query
    
    console.log('🔍 URL PARAMETERS EXTRACTED:', {
      hasFirebaseToken: !!firebaseToken,
      hasMagicToken: !!magicToken,
      hasEmail: !!emailParam,
      hasPlayer: !!playerId,
      allParams: route.query,
      firebaseTokenLength: firebaseToken?.length || 0,
      magicTokenLength: magicToken?.length || 0
    })
    
    // Support pour les magic links (ancien système)
    if (magicToken && playerId) {
      console.log('🔗 Utilisation du système Magic Link')
      oobCode.value = magicToken
      email.value = playerId // Dans notre cas, playerId = email
      loading.value = false
      return
    }
    
    // Support pour Firebase Auth (nouveau système)
    if (!firebaseToken) {
      console.log('❌ NO FIREBASE TOKEN FOUND')
      error.value = 'Lien de réinitialisation incomplet'
      loading.value = false
      return
    }

    console.log('✅ FIREBASE TOKEN FOUND, setting oobCode.value')
    oobCode.value = firebaseToken
    
    // 🔍 DEBUG: Pre-verification checks
    console.log('🔍 PRE-VERIFICATION CHECKS:', {
      authInstance: !!auth,
      authType: typeof auth,
      safeVerifyFunction: !!safeVerifyPasswordResetCode,
      safeVerifyFunctionType: typeof safeVerifyPasswordResetCode,
      tokenLength: firebaseToken.length,
      tokenStart: firebaseToken.substring(0, 10) + '...',
      tokenEnd: '...' + firebaseToken.substring(firebaseToken.length - 10)
    })
    
    // Récupérer l'email depuis le token Firebase
    try {
      console.log('🔍 STARTING TOKEN VERIFICATION...')
      
      // 🔍 Utiliser le wrapper sécurisé qui gère l'initialisation automatiquement
      const emailFromToken = await safeVerifyPasswordResetCode(firebaseToken)
      
      console.log('✅ TOKEN VERIFICATION SUCCESS!')
      console.log('🔍 Email récupéré depuis le token:', emailFromToken)
      console.log('🔍 Email details:', {
        email: emailFromToken,
        length: emailFromToken?.length,
        type: typeof emailFromToken
      })
      
      email.value = emailFromToken
      
    } catch (verifyError) {
      console.log('❌ TOKEN VERIFICATION FAILED!', verifyError)
      console.log('❌ Error details:', {
        message: verifyError.message,
        code: verifyError.code,
        name: verifyError.name,
        stack: verifyError.stack,
        type: typeof verifyError,
        cause: verifyError.cause
      })
      
      // 🔍 DEBUG: Additional error context
      console.log('🔍 Error context:', {
        tokenUsed: firebaseToken.substring(0, 20) + '...',
        authState: auth?.currentUser ? 'authenticated' : 'not authenticated',
        timestamp: new Date().toISOString()
      })
      
      error.value = 'Lien de réinitialisation invalide ou expiré'
      loading.value = false
      return
    }
    
    loading.value = false
    
  } catch (err) {
    console.log('❌ CRITICAL ERROR in onMounted:', err)
    console.log('❌ Error details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
      type: typeof err
    })
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
    logger.debug('Début réinitialisation avec token (masqué)')
    
    // Déterminer si c'est un magic link ou Firebase Auth
    const isUsingMagicLink = route.query.player && route.query.token
    
    if (isUsingMagicLink) {
      logger.info('🔗 Réinitialisation via Magic Link avec Cloud Function')
      
      // Utiliser la Cloud Function pour réinitialiser avec token custom
      logger.info('🔍 Paramètres envoyés à la Cloud Function:', {
        email: email.value,
        token: oobCode.value?.substring(0, 6) + '••••••',
        passwordLength: newPassword.value?.length
      })
      
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const functions = getFunctions()
      logger.info('🔍 Functions instance créée')
      
      const resetPasswordFunction = httpsCallable(functions, 'resetPasswordWithCustomToken')
      logger.info('🔍 Callable function créée')
      
      logger.info('🔍 Appel de la Cloud Function...')
      const result = await resetPasswordFunction({
        email: email.value,
        token: oobCode.value, // Notre token custom
        newPassword: newPassword.value
      })
      
      logger.info('🔍 Réponse reçue, type:', typeof result)
      logger.info('🔍 Result complet:', result)
      logger.info('🔍 Result.data type:', typeof result?.data)
      logger.info('🔍 Result.data:', result?.data)
      
      if (result?.data) {
        logger.info('🔍 Success:', result.data.success)
        logger.info('🔍 Error:', result.data.error)
        logger.info('🔍 Details:', result.data.details)
        logger.info('🔍 Message:', result.data.message)
      } else {
        logger.error('❌ Aucune data dans la réponse!')
      }
      
      if (!result.data.success) {
        const errorMessage = result.data.details || result.data.error || 'Erreur lors de la réinitialisation'
        throw new Error(errorMessage)
      }
      
      logger.info('✅ Mot de passe réinitialisé via Cloud Function')
    } else {
      console.log('🔑 Réinitialisation via Firebase Auth avec oobCode')
      await safeConfirmPasswordReset(oobCode.value, newPassword.value)
      console.log('✅ Mot de passe Firebase Auth mis à jour')
    }
    
    // Pas besoin de mettre à jour Firestore, Firebase Auth gère tout !
    logger.info('Réinitialisation terminée avec Firebase Auth')
    
    // Login automatique avec le nouveau mot de passe
    try {
      logger.debug('Tentative de connexion automatique...')
      const userCredential = await signInWithEmailAndPassword(auth, email.value, newPassword.value)
      logger.info('Connexion automatique réussie après reset', { uid: userCredential.user.uid })
      
      // Message adapté au contexte (création de compte ou réinitialisation)
      const pendingAccountCreation = localStorage.getItem('pendingAccountCreationNavigation')
      if (pendingAccountCreation) {
        resetSuccess.value = 'Compte créé avec succès ! Redirection...'
      } else {
        resetSuccess.value = 'Mot de passe réinitialisé et connexion réussie ! Redirection...'
      }
      
      // Rediriger vers l'accueil après 2 secondes
      setTimeout(() => {
        goHome()
      }, 2000)
    } catch (loginError) {
      logger.error('Erreur lors de la connexion automatique', loginError)
      resetSuccess.value = 'Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
      
      // Rediriger vers l'accueil après 3 secondes
      setTimeout(() => {
        goHome()
      }, 3000)
    }
  } catch (err) {
    logger.error('❌ Erreur lors de la réinitialisation', {
      message: err.message,
      code: err.code,
      stack: err.stack,
      fullError: err
    })
    
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

async function goHome() {
  try {
    // 1. Essayer de récupérer la navigation depuis localStorage (priorité haute)
    // Vérifier d'abord la création de compte, puis la réinitialisation de mot de passe
    let pendingNavigation = localStorage.getItem('pendingAccountCreationNavigation')
    let isAccountCreation = true
    
    if (!pendingNavigation) {
      pendingNavigation = localStorage.getItem('pendingPasswordResetNavigation')
      isAccountCreation = false
    }
    
    if (pendingNavigation) {
      try {
        const navigationData = JSON.parse(pendingNavigation)
        const { lastVisitedPage, timestamp, email: storedEmail } = navigationData
        
        // Vérifier que c'est récent (moins de 1 heure) et pour le bon email
        const isRecent = (Date.now() - timestamp) < 3600000 // 1 heure
        const isCorrectEmail = storedEmail === email.value
        
        if (isRecent && isCorrectEmail && isValidRedirectPath(lastVisitedPage)) {
          logger.info('✅ Redirection vers la page sauvegardée:', lastVisitedPage)
          
          // Nettoyer le localStorage approprié
          if (isAccountCreation) {
            localStorage.removeItem('pendingAccountCreationNavigation')
            logger.info('🎉 Compte créé avec succès, redirection vers la page d\'origine')
          } else {
            localStorage.removeItem('pendingPasswordResetNavigation')
            logger.info('🔑 Mot de passe réinitialisé, redirection vers la page d\'origine')
          }
          
          // Si le contexte indique un retour vers "Mon Compte", restaurer l'état complet
          if (navigationData.returnToAccountMenu) {
            // Construire l'URL avec tous les paramètres nécessaires
            const baseUrl = new URL(lastVisitedPage, window.location.origin)
            const searchParams = new URLSearchParams(baseUrl.search)
            
            // Restaurer l'état des modales
            if (navigationData.modalState) {
              const { modalState } = navigationData
              
              // Restaurer les paramètres d'événement si nécessaire
              if (modalState.eventId) {
                searchParams.set('event', modalState.eventId)
                searchParams.set('modal', 'event_details')
              }
              
              // Restaurer les paramètres de joueur si nécessaire
              if (modalState.playerId) {
                searchParams.set('player', modalState.playerId)
                searchParams.set('modal', 'player_details')
              }
              
              // Ajouter le paramètre pour ouvrir "Mon Compte"
              searchParams.set('open', 'account')
            }
            
            const redirectUrl = `${baseUrl.pathname}?${searchParams.toString()}`
            logger.info('🔄 Redirection vers "Mon Compte" avec état complet:', redirectUrl)
            router.push(redirectUrl)
          } else {
            router.push(lastVisitedPage)
          }
          return
        } else {
          logger.info('⚠️ Navigation sauvegardée invalide ou expirée, nettoyage...')
          localStorage.removeItem('pendingPasswordResetNavigation')
        }
      } catch (parseError) {
        logger.error('Erreur lors du parsing de la navigation sauvegardée:', parseError)
        localStorage.removeItem('pendingPasswordResetNavigation')
      }
    }
    
    // 2. Fallback : essayer de récupérer depuis Firestore
    const navigationData = await getLastVisitedPage(email.value)
    
    if (navigationData?.lastVisitedPage && isValidRedirectPath(navigationData.lastVisitedPage)) {
      logger.info('Redirection vers la dernière page visitée (Firestore):', navigationData.lastVisitedPage)
      router.push(navigationData.lastVisitedPage)
    } else {
      logger.info('Aucune page précédente valide, redirection vers les saisons')
      router.push('/seasons')
    }
  } catch (error) {
    logger.error('Erreur lors de la récupération de la navigation, redirection vers les saisons', error)
    router.push('/seasons')
  }
}


</script>
