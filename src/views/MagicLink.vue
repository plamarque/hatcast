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
      message.value = 'Paramètres manquants. Vérifiez que le lien est complet.'
      return
    }

    // Validation supplémentaire pour les actions qui nécessitent des paramètres spécifiques
    if (action === 'verify_email' && (!seasonId || !playerId)) {
      status.value = 'error'
      title.value = 'Lien invalide'
      message.value = 'Lien de vérification incomplet : informations de saison ou de joueur manquantes.'
      return
    }

    if ((action === 'yes' || action === 'no') && (!seasonId || !playerId || !eventId)) {
      status.value = 'error'
      title.value = 'Lien invalide'
      message.value = 'Lien de disponibilité incomplet : informations manquantes.'
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
      let protectionResult = null
      try { 
        protectionResult = await finalizeProtectionAfterVerification({ playerId, seasonId }) 
      } catch {}
      
      // Si la protection a été activée avec succès, connecter l'utilisateur automatiquement
      if (protectionResult?.success && protectionResult?.email) {
        try {
          if (protectionResult.password) {
            // Compte créé ou existant avec mot de passe temporaire
            const { auth } = await import('../services/firebase.js')
            const { signInWithEmailAndPassword } = await import('firebase/auth')
            
            // Se connecter avec le compte (nouveau ou existant)
            const userCredential = await signInWithEmailAndPassword(auth, protectionResult.email, protectionResult.password)
            console.log('✅ Connexion automatique réussie avec le compte:', protectionResult.email)
            
            // Stocker les informations de protection pour GridBoard.vue
            localStorage.setItem('protectionActivated', 'true')
            localStorage.setItem('protectedPlayerId', playerId)
            localStorage.setItem('protectedSeasonId', seasonId)
            
            // Forcer la synchronisation de l'état d'authentification
            try {
              const { forceSync } = await import('../services/authState.js')
              forceSync()
              console.log('🔄 Synchronisation forcée de l\'état d\'authentification')
            } catch (error) {
              console.warn('Impossible de synchroniser l\'état d\'authentification:', error)
            }
            
          } else if (protectionResult.firebaseMagicLinkSent) {
            // Compte existant avec magic link Firebase envoyé
            console.log('✅ Protection activée pour compte existant avec magic link Firebase envoyé:', protectionResult.email)
            localStorage.setItem('protectionActivated', 'true')
            localStorage.setItem('protectedPlayerId', playerId)
            localStorage.setItem('protectedSeasonId', seasonId)
            
            // 🎯 NOUVEAU : Magic link Firebase envoyé, l'utilisateur doit cliquer dessus
            console.log('📧 Magic link Firebase envoyé pour connexion automatique')
            console.log('ℹ️ L\'utilisateur doit cliquer sur le lien dans l\'email pour se connecter')
            
          } else if (protectionResult.magicLinkAuth) {
            // Compte existant avec authentification via magic link
            console.log('✅ Protection activée pour compte existant avec auth magic link:', protectionResult.email)
            localStorage.setItem('protectionActivated', 'true')
            localStorage.setItem('protectedPlayerId', playerId)
            localStorage.setItem('protectedSeasonId', seasonId)
            
            // 🎯 NOUVEAU : Connexion automatique via magic link Firebase pour utilisateur existant
            try {
              const { auth } = await import('../services/firebase.js')
              const { isSignInWithEmailLink, signInWithEmailLink } = await import('firebase/auth')
              
              // Vérifier si l'URL actuelle est un magic link Firebase
              if (isSignInWithEmailLink(auth, window.location.href)) {
                console.log('🔗 Magic link Firebase détecté, tentative de connexion automatique')
                
                // Se connecter via le magic link Firebase (sans mot de passe)
                const userCredential = await signInWithEmailLink(auth, protectionResult.email)
                console.log('✅ Connexion automatique réussie via magic link Firebase pour compte existant:', protectionResult.email)
                
                // Forcer la synchronisation de l'état d'authentification
                try {
                  const { forceSync } = await import('../services/authState.js')
                  forceSync()
                  console.log('🔄 Synchronisation forcée de l\'état d\'authentification')
                } catch (error) {
                  console.warn('Impossible de synchroniser l\'état d\'authentification:', error)
                }
                
              } else {
                console.log('⚠️ URL actuelle n\'est pas un magic link Firebase valide')
              }
              
            } catch (magicLinkError) {
              console.warn('Échec de la connexion via magic link Firebase:', magicLinkError)
              // L'utilisateur devra se connecter manuellement
            }
            
          } else if (protectionResult.autoLoginFailed) {
            // Compte existant mais échec de la connexion automatique
            console.log('✅ Protection activée pour compte existant (connexion auto échouée):', protectionResult.email)
            localStorage.setItem('protectionActivated', 'true')
            localStorage.setItem('protectedPlayerId', playerId)
            localStorage.setItem('protectedSeasonId', seasonId)
            
            console.log('⚠️ Échec de la connexion automatique, connexion manuelle requise')
            
          } else {
            // Compte existant avec connexion automatique réussie
            console.log('✅ Protection activée pour compte existant avec connexion auto:', protectionResult.email)
            localStorage.setItem('protectionActivated', 'true')
            localStorage.setItem('protectedPlayerId', playerId)
            localStorage.setItem('protectedSeasonId', seasonId)
            
            // L'utilisateur est maintenant connecté automatiquement !
            console.log('✅ Connexion automatique réussie pour compte existant')
          }
          
        } catch (error) {
          console.error('Erreur lors de la connexion automatique:', error)
        }
      }
      
      await consumeMagicLink({ seasonId, playerId, eventId: 'protection', action })
      status.value = 'ok'
      
      if (protectionResult?.firebaseMagicLinkSent) {
        title.value = 'Protection activée !'
        message.value = 'Merci ! Votre compte est maintenant protégé. Un email de connexion automatique a été envoyé. Cliquez sur le lien pour vous connecter.'
      } else if (protectionResult?.magicLinkAuth) {
        title.value = 'Protection activée !'
        message.value = 'Merci ! Votre compte est maintenant protégé et vous êtes connecté automatiquement via le lien de vérification.'
      } else if (protectionResult?.autoLoginFailed) {
        title.value = 'Protection activée !'
        message.value = 'Merci ! Votre compte est maintenant protégé. Veuillez vous connecter manuellement pour voir vos favoris.'
      } else if (protectionResult?.existingAccount) {
        title.value = 'Protection activée !'
        message.value = 'Merci ! Votre compte est maintenant protégé et vous êtes connecté automatiquement.'
      } else {
        title.value = 'Protection activée !'
        message.value = 'Merci ! Votre compte est maintenant protégé et vous êtes connecté automatiquement.'
      }
                // Attendre un peu pour que Firestore propage les changements
          console.log('⏳ Attente de la propagation Firestore...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Renvoyer vers la saison de départ
          if (slug) {
            router.push(`/season/${slug}?player=${encodeURIComponent(playerId)}&verified=1`)
          } else {
            router.push('/seasons')
          }
      return
    }

    if (action === 'activate_notifications') {
      // Activation des notifications pour un utilisateur non connecté
      try {
        const { processNotificationActivation } = await import('../services/notificationActivation.js')
        const result = await processNotificationActivation(token)
        
        if (result.success) {
          console.log('✅ Activation des notifications réussie:', {
            success: result.success,
            email: result.email,
            playerName: result.playerName,
            accountStatus: result.accountStatus
          })
          
          status.value = 'ok'
          title.value = 'Notifications activées !'
          
          // Message personnalisé selon si un compte a été créé
          if (result.accountStatus?.created) {
            console.log('🎉 Compte créé, affichage du message de création de compte')
            message.value = `Parfait ! Tes notifications sont maintenant actives pour ${result.playerName}. Un compte a été créé avec ton email et tu recevras un email pour définir ton mot de passe.`
          } else {
            console.log('ℹ️ Compte existant, pas de modal de succès')
            message.value = `Parfait ! Tes notifications sont maintenant actives pour ${result.playerName}. Tu recevras des alertes pour tes spectacles.`
          }
          
          // Ajouter une proposition de création de mot de passe
          message.value += `\n\n💡 Conseil : Pour une meilleure expérience, tu peux créer un mot de passe pour ton compte et te connecter directement à l'avenir.`
          
          // Redirection selon le type d'utilisateur
          if (result.accountStatus?.created) {
            console.log('🎯 Nouvel utilisateur détecté, redirection avec modal de succès...', {
              slug,
              eventId,
              email: result.email,
              playerName: result.playerName
            })
            
            // Nouvel utilisateur : afficher la modal de succès avec proposition de mot de passe
            if (slug && eventId) {
              const redirectUrl = `/season/${slug}?event=${eventId}&modal=event_details&notificationSuccess=1&email=${encodeURIComponent(result.email)}&playerName=${encodeURIComponent(result.playerName)}&eventId=${eventId}`
              console.log('🔗 Redirection vers:', redirectUrl)
              router.push(redirectUrl)
            } else if (slug) {
              const redirectUrl = `/season/${slug}?notificationSuccess=1&email=${encodeURIComponent(result.email)}&playerName=${encodeURIComponent(result.playerName)}`
              console.log('🔗 Redirection vers:', redirectUrl)
              router.push(redirectUrl)
            } else {
              console.log('🔗 Redirection vers /seasons (pas de slug)')
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

    // Appliquer la disponibilité directement (bypass protections) - sauf pour 'confirm' et 'decline'
    if (action !== 'confirm' && action !== 'decline') {
      const newValue = action === 'yes' ? true : false
      await setSingleAvailability({ seasonId, playerName, eventId, value: newValue })
    }

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
    
    // Si le joueur décline sa participation à la sélection
    if (action === 'decline') {
      try {
        // Mettre à jour le statut du joueur dans la sélection
        const { updatePlayerSelectionStatus } = await import('../services/storage.js')
        await updatePlayerSelectionStatus(eventId, playerName, 'declined', seasonId)
        console.log('✅ Statut du joueur mis à jour : declined')
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du statut du joueur:', error)
      }
    }
    
    // Si le joueur confirme sa participation à la sélection
    if (action === 'confirm') {
      try {
        // Mettre à jour le statut du joueur dans la sélection
        const { updatePlayerSelectionStatus } = await import('../services/storage.js')
        await updatePlayerSelectionStatus(eventId, playerName, 'confirmed', seasonId)
        console.log('✅ Statut du joueur mis à jour : confirmed')
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du statut du joueur:', error)
      }
    }
    await consumeMagicLink({ seasonId, playerId, eventId, action })

    status.value = 'ok'
    title.value = 'Merci !'
    
    // Messages selon l'action
    if (action === 'confirm') {
      message.value = 'Votre participation a été confirmée ! Vous êtes maintenant "Joue" dans cette sélection.'
    } else if (action === 'decline') {
      message.value = 'Votre participation a été déclinée. Vous êtes maintenant "Décliné" dans cette sélection.'
    } else if (action === 'yes') {
      message.value = 'Votre disponibilité a été enregistrée: Disponible.'
    } else if (action === 'no') {
      message.value = 'Votre disponibilité a été enregistrée: Non disponible. (Si vous étiez sélectionné(e), vous avez été retiré(e) de la sélection.)'
    }

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
    
    // Messages d'erreur plus spécifiques selon le type d'erreur
    if (err.code === 'auth/invalid-action-code') {
      message.value = 'Ce lien de vérification est invalide ou a expiré.'
    } else if (err.code === 'auth/expired-action-code') {
      message.value = 'Ce lien de vérification a expiré. Veuillez demander un nouveau lien.'
    } else if (err.message && err.message.includes('seasonId')) {
      message.value = 'Lien de vérification invalide : saison introuvable.'
    } else if (err.message && err.message.includes('playerId')) {
      message.value = 'Lien de vérification invalide : joueur introuvable.'
    } else {
      message.value = 'Impossible de traiter votre lien. Veuillez vérifier que le lien est complet et valide.'
    }
  }
})
</script>


