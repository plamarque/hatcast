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
import logger from '../services/logger.js'

const router = useRouter()
const loadingMessage = ref('Chargement...')

onMounted(async () => {
  try {
    loadingMessage.value = 'Vérification de votre session...'
    
    // Attendre que Firebase Auth soit initialisé
    await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      })
    })

    const user = auth.currentUser
    const userEmail = user?.email

    // Si pas d'utilisateur connecté, rediriger vers la page des saisons
    if (!userEmail) {
      logger.info('Utilisateur non connecté, redirection vers /seasons')
      router.replace('/seasons')
      return
    }

    loadingMessage.value = 'Récupération de vos préférences...'
    
    // Récupérer la dernière saison visitée
    const lastSeasonSlug = await getLastVisitedSeason()

    // Si aucune saison mémorisée, rediriger vers la page des saisons
    if (!lastSeasonSlug) {
      logger.info('Aucune saison mémorisée, redirection vers /seasons')
      router.replace('/seasons')
      return
    }

    loadingMessage.value = 'Vérification de la saison...'
    
    // Vérifier que la saison existe toujours
    try {
      const seasons = await getSeasons()
      const seasonExists = isSeasonValid(lastSeasonSlug, seasons)
      
      if (!seasonExists) {
        logger.info('Saison mémorisée n\'existe plus, redirection vers /seasons')
        // Nettoyer la préférence invalide
        await clearLastSeasonPreference(userEmail)
        router.replace('/seasons')
        return
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification des saisons', error)
      router.replace('/seasons')
      return
    }

    // Rediriger vers la saison mémorisée
    logger.info('Redirection vers la saison mémorisée', { seasonSlug: lastSeasonSlug })
    router.replace(`/season/${lastSeasonSlug}`)

  } catch (error) {
    logger.error('Erreur lors de la résolution de la saison', error)
    router.replace('/seasons')
  }
})


</script>
