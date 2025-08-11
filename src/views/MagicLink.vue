<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
      <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
           :class="status === 'ok' ? 'bg-green-500' : status === 'loading' ? 'bg-blue-500' : 'bg-red-500'">
        <span class="text-3xl">{{ statusIcon }}</span>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">{{ title }}</h1>
      <p class="text-gray-300 mb-6">{{ message }}</p>
      <button @click="goToSeason"
              class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300">
        Ouvrir la saison
      </button>
    </div>
  </div>
  </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyMagicLink, consumeMagicLink } from '../services/magicLinks.js'
import { setSingleAvailability, setStorageMode } from '../services/storage.js'
import { db } from '../services/firebase.js'
import { doc, getDoc } from 'firebase/firestore'
import { markEmailVerifiedForProtection } from '../services/playerProtection.js'
import logger from '../services/logger.js'

const route = useRoute()
const router = useRouter()

const status = ref('loading') // loading | ok | error
const title = ref('Traitement en cours...')
const message = ref('Merci de patienter pendant la validation du lien.')

const statusIcon = computed(() => {
  if (status.value === 'loading') return '⏳'
  if (status.value === 'ok') return '✅'
  return '❌'
})

function goToSeason() {
  const slug = route.query.slug
  if (slug) {
    router.push(`/season/${slug}`)
  } else {
    router.push('/')
  }
}

onMounted(async () => {
  try {
    // Assurer le mode Firebase pour les écritures
    setStorageMode('firebase')
    // Plus de route de désistement dédiée: on traite uniquement les magic links
    
    const seasonId = String(route.query.sid || '')
    const playerId = String(route.query.pid || '')
    let eventId = String(route.query.eid || '')
    const token = String(route.query.t || '')
    const action = String(route.query.a || '') // 'yes' | 'no' | 'verify_email'
    const slug = String(route.query.slug || '')

    if (!seasonId || !playerId || !token || !action) {
      status.value = 'error'
      title.value = 'Lien invalide'
      message.value = 'Paramètres manquants.'
      return
    }

    if (action === 'verify_email') {
      eventId = 'protection'
    }

    const verification = await verifyMagicLink({ seasonId, playerId, eventId, token, action })
    if (!verification.valid) {
      status.value = 'error'
      title.value = 'Lien invalide'
      message.value = 'Le lien est invalide ou expiré.'
      return
    }

    if (action === 'verify_email') {
      // Vérification d'email pour protection de joueur
      await markEmailVerifiedForProtection({ playerId, seasonId })
      await consumeMagicLink({ seasonId, playerId, eventId: 'protection', action })
      status.value = 'ok'
      title.value = 'Email vérifié'
      message.value = 'Merci ! Vous pouvez maintenant définir votre mot de passe.'
      // Renvoyer vers la saison de départ
      if (slug) {
        setTimeout(() => router.push(`/season/${slug}?player=${encodeURIComponent(playerId)}&open=protection&verified=1`), 800)
      } else {
        setTimeout(() => router.push('/'), 800)
      }
      return
    }

    // Récupérer le nom du joueur pour écrire dans la collection availability (clé = name)
    const playerRef = doc(db, 'seasons', seasonId, 'players', playerId)
    const playerSnap = await getDoc(playerRef)
    const playerName = playerSnap.exists() ? (playerSnap.data().name || '') : ''
    if (!playerName) {
      status.value = 'error'
      title.value = 'Lien invalide'
      message.value = 'Joueur introuvable.'
      return
    }

    // Appliquer la disponibilité directement (bypass protections)
    const newValue = action === 'yes' ? true : false
    await setSingleAvailability({ seasonId, playerName, eventId, value: newValue })
    await consumeMagicLink({ seasonId, playerId, eventId, action })

    status.value = 'ok'
    title.value = 'Merci !'
    message.value = action === 'yes'
      ? 'Votre disponibilité a été enregistrée: Disponible.'
      : 'Votre disponibilité a été enregistrée: Non disponible.'

    // Redirection vers la page de l'événement pour afficher les détails
    if (slug) {
      setTimeout(() => router.push(`/season/${slug}/event/${eventId}`), 1200)
    } else {
      setTimeout(() => router.push('/'), 1200)
    }
  } catch (err) {
    logger.error('Magic link error', err)
    status.value = 'error'
    title.value = 'Erreur'
    message.value = 'Impossible de traiter votre lien.'
  }
})
</script>


