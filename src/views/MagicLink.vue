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
import { verifyMagicLink, consumeMagicLink, verifyAccountEmailUpdateLink, consumeAccountEmailUpdateLink } from '../services/magicLinks.js'
import { auth } from '../services/firebase.js'
import { updateEmail as updateAuthEmail } from 'firebase/auth'
import { setSingleAvailability, setStorageMode } from '../services/storage.js'
import { db } from '../services/firebase.js'
import { doc, getDoc } from 'firebase/firestore'
import { markEmailVerifiedForProtection, finalizeProtectionAfterVerification } from '../services/playerProtection.js'
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
          router.push('/seasons')
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

    if (!token || !action) {
      status.value = 'error'
      title.value = 'Lien invalide'
      message.value = 'Paramètres manquants.'
      return
    }

    if (action === 'account_email_update') {
      const v = await verifyAccountEmailUpdateLink({ token })
      if (!v.valid) {
        status.value = 'error'
        title.value = 'Lien invalide'
        message.value = 'Le lien est invalide ou expiré.'
        return
      }
      try {
        await updateAuthEmail(auth.currentUser, v.data.newEmail)
        await consumeAccountEmailUpdateLink({ token })
        status.value = 'ok'
        title.value = 'Email mis à jour'
        message.value = 'Votre adresse email a été mise à jour avec succès.'
      } catch (e) {
        status.value = 'error'
        title.value = 'Action impossible'
        message.value = 'Veuillez vous reconnecter puis réessayer.'
      }
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
      // Activer la protection si l'email existe déjà (compte existant)
      try { await finalizeProtectionAfterVerification({ playerId, seasonId }) } catch {}
      await consumeMagicLink({ seasonId, playerId, eventId: 'protection', action })
      status.value = 'ok'
      title.value = 'Email vérifié'
      message.value = 'Merci ! Vous pouvez maintenant définir votre mot de passe.'
      // Renvoyer vers la saison de départ
      if (slug) {
        setTimeout(() => router.push(`/season/${slug}?player=${encodeURIComponent(playerId)}&verified=1`), 800)
      } else {
        setTimeout(() => router.push('/seasons'), 800)
      }
      return
    }

    if (action === 'activate_notifications') {
      // Activation des notifications pour un utilisateur non connecté
      try {
        const { processNotificationActivation } = await import('../services/notificationActivation.js')
        const result = await processNotificationActivation(token)
        
        if (result.success) {
          status.value = 'ok'
          title.value = 'Notifications activées !'
          
          // Message personnalisé selon si un compte a été créé
          if (result.accountStatus?.created) {
            message.value = `Parfait ! Tes notifications sont maintenant actives pour ${result.playerName}. Un compte a été créé avec ton email et tu recevras un email pour définir ton mot de passe.`
          } else {
            message.value = `Parfait ! Tes notifications sont maintenant actives pour ${result.playerName}. Tu recevras des alertes pour tes événements.`
          }
          
          // Ajouter une proposition de création de mot de passe
          message.value += `\n\n💡 Conseil : Pour une meilleure expérience, tu peux créer un mot de passe pour ton compte et te connecter directement à l'avenir.`
          
          // Redirection selon le type d'utilisateur
          if (result.accountStatus?.created) {
            // Nouvel utilisateur : afficher la modal de succès avec proposition de mot de passe
            if (slug && eventId) {
              router.push(`/season/${slug}?event=${eventId}&modal=event_details&notificationSuccess=1&email=${encodeURIComponent(result.email)}&playerName=${encodeURIComponent(result.playerName)}&eventId=${eventId}`)
            } else if (slug) {
              router.push(`/season/${slug}?notificationSuccess=1&email=${encodeURIComponent(result.email)}&playerName=${encodeURIComponent(result.playerName)}`)
            } else {
              router.push('/seasons')
            }
          } else {
            // Utilisateur existant : redirection directe vers l'événement (pas de modal de succès)
            if (slug && eventId) {
              router.push(`/season/${slug}?event=${eventId}&modal=event_details`)
            } else if (slug) {
              router.push(`/season/${slug}`)
            } else {
              router.push('/seasons')
            }
          }
        } else {
          throw new Error('Échec de l\'activation des notifications')
        }
      } catch (error) {
        logger.error('Erreur lors de l\'activation des notifications', error)
        status.value = 'error'
        title.value = 'Erreur d\'activation'
        message.value = 'Impossible d\'activer tes notifications. Veuillez réessayer.'
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

    // Si le joueur se déclare indisponible, le retirer de la sélection le cas échéant
    if (action === 'no') {
      try {
        const selRef = doc(db, 'seasons', seasonId, 'selections', eventId)
        const selSnap = await getDoc(selRef)
        if (selSnap.exists()) {
          const playersArr = Array.isArray(selSnap.data()?.players) ? selSnap.data().players : []
          const next = playersArr.filter((n) => n !== playerName)
          if (next.length !== playersArr.length) {
            await setDoc(selRef, { players: next }, { merge: true })
          }
        }
      } catch (_) {}
    }
    await consumeMagicLink({ seasonId, playerId, eventId, action })

    status.value = 'ok'
    title.value = 'Merci !'
    message.value = action === 'yes'
      ? 'Votre disponibilité a été enregistrée: Disponible.'
      : 'Votre disponibilité a été enregistrée: Non disponible. (Si vous étiez sélectionné(e), vous avez été retiré(e) de la sélection.)'

    // Redirection vers la page de l'événement pour afficher les détails
    if (slug) {
      setTimeout(() => router.push(`/season/${slug}/event/${eventId}`), 1200)
    } else {
      setTimeout(() => router.push('/seasons'), 1200)
    }
  } catch (err) {
    logger.error('Magic link error', err)
    status.value = 'error'
    title.value = 'Erreur'
    message.value = 'Impossible de traiter votre lien.'
  }
})
</script>


