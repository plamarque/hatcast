<template>
  <router-view />

  <!-- Barre d'installation PWA moderne -->
  <Transition
    name="install-banner"
    appear
  >
    <div
      v-if="canInstallPwa && !bannerDismissed"
      class="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-lg border-b border-gray-800"
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
  
  <!-- Bouton de mise à jour PWA -->
  <button
    v-if="updateAvailable && !refreshing"
    class="fixed bottom-4 right-4 z-50 rounded-full bg-green-600 text-white px-4 py-2 shadow-lg hover:bg-green-700 active:bg-green-800"
    @click="updateApp"
  >
    🔄 Mettre à jour
  </button>
  
  <!-- Indicateur de mise à jour en cours -->
  <div
    v-if="refreshing"
    class="fixed bottom-4 right-4 z-50 rounded-full bg-green-600 text-white px-4 py-2 shadow-lg"
  >
    🔄 Mise à jour...
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const deferredPrompt = ref(null)
const canInstallPwa = ref(false)
const updateAvailable = ref(false)
const refreshing = ref(false)
const bannerDismissed = ref(false)

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
  // Send message to service worker to skip waiting
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.postMessage({ type: 'SKIP_WAITING' })
  }
  // Reload the page to apply the update
  window.location.reload()
}

onMounted(() => {
  // Vérifier l'état d'installation au chargement
  checkIfAlreadyInstalled()
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // Check for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing.value) return
      updateAvailable.value = true
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
})
</script>

<style>
/* Style personnalisé pour le curseur d'édition */
.edit-cursor,
[title^="Double-clic pour modifier"] {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><text x='0' y='14' font-size='16' style='font-family: Arial, sans-serif;'>✏️</text></svg>") 0 16, pointer;
}
</style>
