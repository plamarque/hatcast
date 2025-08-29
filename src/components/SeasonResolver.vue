<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
    <!-- Loading spinner -->
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p class="text-white text-lg">{{ loadingMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/firebase.js'
import { getSeasons } from '../services/seasons.js'
import { getLastVisitedSeason, clearLastSeasonPreference, isSeasonValid } from '../services/seasonPreferences.js'
import { currentUser, forceSync, waitForInitialization } from '../services/authState.js'
import logger from '../services/logger.js'

const router = useRouter()
const loadingMessage = ref('Chargement...')

onMounted(async () => {
  try {
    // Vérifier s'il y a un paramètre de page spécifique
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = urlParams.get('p')
    
    if (pageParam === 'reset-password') {
      logger.info('Redirection vers la page de reset password')
      router.replace('/reset-password')
      return
    }
    
    loadingMessage.value = 'Vérification de votre session...'
    
    // Forcer la synchronisation de l'état d'authentification
    forceSync()
    
    // Attendre que le service d'authentification soit initialisé
    await waitForInitialization()
    
    // Attendre que Firebase Auth soit initialisé avec un timeout
    const user = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout Firebase Auth'))
      }, 3000) // 3 secondes max
      
      const unsubscribe = auth.onAuthStateChanged((user) => {
        clearTimeout(timeout)
        unsubscribe()
        resolve(user)
      })
      
      // Si l'utilisateur est déjà connecté, résoudre immédiatement
      if (auth.currentUser) {
        clearTimeout(timeout)
        unsubscribe()
        resolve(auth.currentUser)
      }
    })

    const userEmail = user?.email

    // Si pas d'utilisateur connecté, rediriger vers la page d'accueil
    if (!userEmail) {
      logger.info('Utilisateur non connecté, redirection vers la page d\'accueil')
      router.replace('/')
      return
    }

    loadingMessage.value = 'Récupération de vos préférences...'
    
    // Récupérer la dernière saison visitée
    const lastSeasonSlug = await getLastVisitedSeason()

    // Si aucune saison mémorisée, rediriger vers la page d'accueil
    if (!lastSeasonSlug) {
      logger.info('Aucune saison mémorisée, redirection vers la page d\'accueil')
      router.replace('/')
      return
    }

    loadingMessage.value = 'Vérification de la saison...'
    
    // Vérifier que la saison existe toujours
    try {
      const seasons = await getSeasons()
      const seasonExists = isSeasonValid(lastSeasonSlug, seasons)
      
      if (!seasonExists) {
        logger.info('Saison mémorisée n\'existe plus, redirection vers la page d\'accueil')
        // Nettoyer la préférence invalide
        await clearLastSeasonPreference(userEmail)
        router.replace('/')
        return
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification des saisons', error)
      router.replace('/')
      return
    }

    // Rediriger vers la saison mémorisée
    logger.info('Redirection vers la saison mémorisée', { seasonSlug: lastSeasonSlug })
    router.replace(`/season/${lastSeasonSlug}`)

  } catch (error) {
    logger.error('Erreur lors de la résolution de la saison', error)
    router.replace('/')
  }
})

</script>
