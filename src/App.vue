<template>
  <!-- Badge d'environnement flottant en bas -->
  <EnvironmentBadge />
  
  <div data-testid="app-loaded">
    <router-view />
  </div>

  <!-- Barre d'installation PWA moderne -->
  <Transition
    name="install-banner"
    appear
  >
    <div
      v-if="canInstallPwa && !bannerDismissed"
      class="fixed top-0 left-0 right-0 z-[99999] bg-black text-white shadow-lg border-b border-gray-800"
      @click="installPwa"
    >
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo et contenu principal -->
        <div class="flex items-center space-x-3 flex-1">
          <img
            src="/icons/icon-48x48.png"
            alt="HatCast"
            class="w-8 h-8 rounded-lg"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-lg text-white">HatCast</span>
            </div>
            <p class="text-sm text-gray-300 leading-tight">
              Installez l'app pour une meilleure expérience
            </p>
          </div>
        </div>

        <!-- Bouton d'installation -->
        <div class="flex items-center space-x-3">
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            @click.stop="installPwa"
          >
            Installer
          </button>
          
          <!-- Bouton de fermeture -->
          <button
            class="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            @click.stop="dismissBanner"
            aria-label="Fermer la barre d'installation"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- Barre de mise à jour PWA - Réutilise le design de la barre d'installation -->
  <Transition
    name="install-banner"
    appear
  >
    <div
      v-if="updateAvailable && !refreshing"
      class="fixed top-0 left-0 right-0 z-[99999] bg-black text-white shadow-lg border-b border-gray-800"
      @click="updateApp"
    >
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo et contenu principal -->
        <div class="flex items-center space-x-3 flex-1">
          <img
            src="/icons/icon-48x48.png"
            alt="HatCast"
            class="w-8 h-8 rounded-lg"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-lg text-white">HatCast</span>
            </div>
            <p class="text-sm text-gray-300 leading-tight">
              Une nouvelle version est disponible. Mettez à jour pour profiter des dernières améliorations.
            </p>
          </div>
        </div>

        <!-- Bouton de mise à jour -->
        <div class="flex items-center space-x-3">
          <button
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            @click.stop="updateApp"
          >
            Mettre à jour
          </button>
          
          <!-- Bouton de fermeture -->
          <button
            class="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            @click.stop="updateAvailable = false"
            aria-label="Fermer la barre de mise à jour"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- Barre de progression de mise à jour - Réutilise le design de la barre d'installation -->
  <Transition
    name="install-banner"
    appear
  >
    <div
      v-if="refreshing"
      class="fixed top-0 left-0 right-0 z-[99999] bg-black text-white shadow-lg border-b border-gray-800"
    >
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo et contenu principal -->
        <div class="flex items-center space-x-3 flex-1">
          <img
            src="/icons/icon-48x48.png"
            alt="HatCast"
            class="w-8 h-8 rounded-lg"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-lg text-white">HatCast</span>
            </div>
            <p class="text-sm text-gray-300 leading-tight">
              Mise à jour en cours... Veuillez patienter
            </p>
          </div>
        </div>

        <!-- Indicateur de progression -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <div class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span class="text-sm text-gray-300">Mise à jour...</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  

</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ensurePushNotificationsActive } from './services/notifications.js'
import EnvironmentBadge from './components/EnvironmentBadge.vue'
// Navigation tracking supprimé - remplacé par seasonPreferences

const deferredPrompt = ref(null)
const canInstallPwa = ref(false)
const updateAvailable = ref(false)
const refreshing = ref(false)
const bannerDismissed = ref(false)
const route = useRoute()

// Navigation tracking supprimé - remplacé par seasonPreferences

function handleBeforeInstallPrompt(event) {
  event.preventDefault()
  deferredPrompt.value = event
  canInstallPwa.value = true
  
  // Vérifier si l'utilisateur a déjà vu la barre récemment
  const lastShown = localStorage.getItem('hatcast-pwa-banner-last-shown')
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000 // 24 heures
  
  if (lastShown && (now - parseInt(lastShown)) < oneDay) {
    // Ne pas afficher si déjà montrée dans les dernières 24h
    canInstallPwa.value = false
  } else {
    // Marquer comme affichée maintenant
    localStorage.setItem('hatcast-pwa-banner-last-shown', now.toString())
  }
}

async function installPwa() {
  if (!deferredPrompt.value) return
  
  try {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installée avec succès')
      // Marquer comme installée pour éviter de re-afficher
      localStorage.setItem('hatcast-pwa-installed', 'true')
    } else {
      console.log('Installation PWA refusée par l\'utilisateur')
    }
  } catch (error) {
    console.error('Erreur lors de l\'installation PWA:', error)
  }
  
  // Quel que soit le choix, on remet à zéro
  canInstallPwa.value = false
  deferredPrompt.value = null
  bannerDismissed.value = true
}

function dismissBanner() {
  bannerDismissed.value = true
  // Marquer comme fermée pour éviter de re-afficher immédiatement
  localStorage.setItem('hatcast-pwa-banner-dismissed', Date.now().toString())
}

function handleAppInstalled() {
  canInstallPwa.value = false
  deferredPrompt.value = null
  bannerDismissed.value = true
  // Marquer comme installée
  localStorage.setItem('hatcast-pwa-installed', 'true')
}

// Vérifier si l'app est déjà installée au chargement
function checkIfAlreadyInstalled() {
  const isInstalled = localStorage.getItem('hatcast-pwa-installed')
  const wasDismissed = localStorage.getItem('hatcast-pwa-banner-dismissed')
  
  if (isInstalled === 'true') {
    canInstallPwa.value = false
    return
  }
  
  // Si fermée récemment, ne pas afficher immédiatement
  if (wasDismissed) {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000 // 1 heure
    if ((now - parseInt(wasDismissed)) < oneHour) {
      bannerDismissed.value = true
    }
  }
}

// Handle service worker updates
function handleServiceWorkerUpdate() {
  updateAvailable.value = true
}

function updateApp() {
  refreshing.value = true
  console.log('🚀 Début de la mise à jour PWA...')
  
  // Attendre un peu pour que l'utilisateur voie l'indicateur de progression
  setTimeout(async () => {
    try {
      console.log('📡 Vérification du service worker...')
      
      // Send message to service worker to skip waiting
      if ('serviceWorker' in navigator) {
        // Obtenir l'enregistrement du service worker
        const registration = await navigator.serviceWorker.getRegistration()
        console.log('🔍 Enregistrement SW trouvé:', registration)
        
        if (registration && registration.active) {
          console.log('✅ Service worker actif trouvé, envoi du message SKIP_WAITING...')
          
          // Envoyer le message au service worker actif
          registration.active.postMessage({ type: 'SKIP_WAITING' })
          console.log('📤 Message SKIP_WAITING envoyé')
          
          // Attendre un peu pour que le service worker traite le message
          await new Promise(resolve => setTimeout(resolve, 500))
          console.log('⏳ Attente de 500ms terminée')
          
          // Vérifier si le service worker a changé
          if (registration.waiting) {
            console.log('🔄 Service worker en attente détecté, attente de l\'activation...')
            
            // Attendre que le service worker soit activé
            await new Promise(resolve => {
              const checkWaiting = () => {
                if (!registration.waiting) {
                  console.log('✅ Service worker activé avec succès')
                  resolve()
                } else {
                  console.log('⏳ Service worker toujours en attente, nouvelle vérification dans 100ms...')
                  setTimeout(checkWaiting, 100)
                }
              }
              checkWaiting()
            })
          } else {
            console.log('ℹ️ Aucun service worker en attente')
          }
        } else {
          console.warn('⚠️ Aucun service worker actif trouvé')
        }
      } else {
        console.warn('⚠️ Service Worker non supporté sur cet appareil')
      }
      
      console.log('🔄 Rechargement de la page...')
      // Recharger la page pour appliquer la mise à jour
      window.location.reload()
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      // En cas d'erreur, remettre l'état et afficher un message
      refreshing.value = false
      alert(`Erreur lors de la mise à jour: ${error.message}\n\nVeuillez rafraîchir manuellement la page.`)
    }
  }, 1000) // Délai initial pour l'UX
}

function handlePwaUpdateTest() {
  updateAvailable.value = true
}

onMounted(() => {
  // Vérifier l'état d'installation au chargement
  checkIfAlreadyInstalled()
  
  // Vérifier et réactiver automatiquement les notifications push
  ensurePushNotificationsActive().then(status => {
    if (status.active) {
      console.log('Notifications push actives au démarrage')
    } else {
      console.log('Notifications push inactives au démarrage:', status.error)
    }
  })
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // Écouter l'événement de test de mise à jour PWA
  window.addEventListener('pwa-update-test', handlePwaUpdateTest)
  
  // Écouter l'événement pour déclencher manuellement la barre d'installation PWA
  window.addEventListener('show-pwa-install-banner', () => {
    console.log('📱 Déclenchement manuel de la barre d\'installation PWA')
    
    // Vérifier si on peut afficher la barre
    if (deferredPrompt.value && !bannerDismissed.value) {
      canInstallPwa.value = true
      bannerDismissed.value = false
      
      // Réinitialiser les timestamps pour permettre l'affichage
      localStorage.removeItem('hatcast-pwa-banner-last-shown')
      localStorage.removeItem('hatcast-pwa-banner-dismissed')
      
      console.log('✅ Barre d\'installation PWA affichée manuellement')
    } else {
      console.log('⚠️ Impossible d\'afficher la barre d\'installation PWA (déjà affichée ou non disponible)')
    }
  })
  
  // Check for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing.value) return
      updateAvailable.value = true
    })
    
    // Écouter les messages du service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATING') {
        console.log('Service worker en cours de mise à jour...')
      }
    })
    
    // Check for updates every hour
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update()
        }
      })
    }, 60 * 60 * 1000) // 1 hour
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
  window.removeEventListener('pwa-update-test', handlePwaUpdateTest)
  window.removeEventListener('show-pwa-install-banner', () => {})
})
</script>

<style>
/* Style personnalisé pour le curseur d'édition */
.edit-cursor,
[title^="Double-clic pour modifier"] {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><text x='0' y='14' font-size='16' style='font-family: Arial, sans-serif;'>✏️</text></svg>") 0 16, pointer;
}
</style>
