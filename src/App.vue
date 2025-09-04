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
      v-if="updateAvailable && !refreshing && isPwaInstalled()"
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
  
  <!-- Modal d'instructions d'installation PWA -->
  <PWAInstallModal 
    :show="showInstallModal" 
    :browser-info="installModalBrowserInfo"
    @close="showInstallModal = false"
    @retry-install="retryInstallFromModal"
  />
  
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
import PWAInstallModal from './components/PWAInstallModal.vue'
import logger from './services/logger.js'
import AuditClient from './services/auditClient.js'
// Navigation tracking supprimé - remplacé par seasonPreferences

const deferredPrompt = ref(null)
const canInstallPwa = ref(false)
const updateAvailable = ref(false)
const refreshing = ref(false)
const bannerDismissed = ref(false)
const route = useRoute()

// PWA Install Modal
const showInstallModal = ref(false)
const installModalBrowserInfo = ref({})

// Navigation tracking supprimé - remplacé par seasonPreferences

function handleBeforeInstallPrompt(event) {
  event.preventDefault()
  deferredPrompt.value = event
  // Le prompt natif est disponible, on peut l'utiliser plus tard
  logger.info('🎯 Prompt d\'installation natif capturé et stocké')
}

async function installPwa() {
  // Stratégie intelligente : essayer l'installation native, sinon montrer les instructions
  const browserInfo = getBrowserInfo()
  
  // 🎯 AUDIT PRINCIPAL: L'utilisateur a cliqué sur "Installer"
  await AuditClient.safeLogUserAction(createPWAAuditData('INSTALL_CLICKED', browserInfo, {
    hasNativePrompt: !!deferredPrompt.value,
    strategy: deferredPrompt.value ? 'native_prompt' : 'manual_instructions'
  }))
  
  if (deferredPrompt.value) {
    // Stratégie A : Installation native disponible
    try {
      logger.info('🚀 Déclenchement de l\'installation native')
      
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        logger.info('✅ PWA installée avec succès via prompt natif')
        localStorage.setItem('hatcast-pwa-installed', 'true')
        canInstallPwa.value = false
        bannerDismissed.value = true
        
        // 🎯 AUDIT: Installation réussie
        await AuditClient.safeLogUserAction(createPWAAuditData('INSTALL_SUCCESS', browserInfo, {
          method: 'native_prompt_accepted'
        }))
      } else {
        logger.info('❌ Installation PWA refusée par l\'utilisateur')
        
        // 🎯 AUDIT: Installation refusée
        await AuditClient.safeLogUserAction(createPWAAuditData('INSTALL_FAILED', browserInfo, {
          reason: 'user_declined',
          method: 'native_prompt_declined'
        }))
        
        // Laisser la barre ouverte au cas où l'utilisateur change d'avis
      }
      
      deferredPrompt.value = null
    } catch (error) {
      logger.error('❌ Erreur lors de l\'installation native:', error)
      
      // 🎯 AUDIT: Erreur technique
      await AuditClient.safeLogUserAction(createPWAAuditData('INSTALL_FAILED', browserInfo, {
        reason: 'technical_error',
        error: error.message,
        errorName: error.name
      }))
      
      // Fallback vers les instructions
      showInstallInstructions()
    }
  } else {
    // Stratégie B : Pas d'installation native, montrer les instructions
    logger.info('📖 Pas de prompt natif disponible - affichage des instructions')
    
    showInstallInstructions()
  }
}

function dismissBanner() {
  bannerDismissed.value = true
  // Marquer comme fermée pour éviter de re-afficher immédiatement
  localStorage.setItem('hatcast-pwa-banner-dismissed', Date.now().toString())
}

async function handleAppInstalled() {
  const browserInfo = getBrowserInfo()
  
  // Audit: app installée via événement système
  await AuditClient.safeLogUserAction(createPWAAuditData('APP_INSTALLED_EVENT', browserInfo, {
    installedViaEvent: true,
    method: 'system_event'
  }))
  
  canInstallPwa.value = false
  deferredPrompt.value = null
  bannerDismissed.value = true
  // Marquer comme installée
  localStorage.setItem('hatcast-pwa-installed', 'true')
}

// Vérifier si on doit afficher la barre d'installation
function checkIfShouldShowInstallBanner() {
  // Si l'app est déjà installée, ne pas afficher
  if (isPwaInstalled()) {
    canInstallPwa.value = false
    return
  }
  
  // Vérifier si l'utilisateur a explicitement fermé la barre récemment
  const wasDismissed = localStorage.getItem('hatcast-pwa-banner-dismissed')
  if (wasDismissed) {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000 // 24 heures (moins agressif)
    if ((now - parseInt(wasDismissed)) < oneDay) {
      bannerDismissed.value = true
      logger.info('🤐 Barre PWA masquée - fermée récemment par l\'utilisateur')
      return
    }
  }
  
  // Afficher la barre pour tous les nouveaux utilisateurs ou après le délai
  canInstallPwa.value = true
  bannerDismissed.value = false
  logger.info('📱 Barre d\'installation PWA affichée - première visite ou délai écoulé')
}

// Vérifier si la PWA est réellement installée (mode standalone ou display-mode)
function isPwaInstalled() {
  // Vérifier le localStorage d'abord
  if (localStorage.getItem('hatcast-pwa-installed') === 'true') {
    return true
  }
  
  // Vérifier si on est en mode standalone (PWA installée)
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    // Marquer comme installée dans le localStorage pour cohérence
    localStorage.setItem('hatcast-pwa-installed', 'true')
    return true
  }
  
  // Vérifier d'autres indicateurs PWA
  if (window.navigator && window.navigator.standalone === true) {
    // iOS Safari mode standalone
    localStorage.setItem('hatcast-pwa-installed', 'true')
    return true
  }
  
  return false
}

// Créer les données d'audit pour les actions PWA
function createPWAAuditData(action, browserInfo, additionalData = {}) {
  return {
    type: `PWA_${action}`,
    category: 'pwa',
    severity: 'info',
    data: {
      action: action.toLowerCase(),
      ...browserInfo,
      hasNativePrompt: !!deferredPrompt.value,
      isInstalled: isPwaInstalled(),
      url: window.location.href,
      ...additionalData
    },
    tags: ['pwa', 'installation', action.toLowerCase()]
  }
}

// Fonctions de détection précise du navigateur et OS
function getBrowserInfo() {
  const userAgent = navigator.userAgent
  
  // Détection OS de base
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)
  const isWindows = /Windows/.test(userAgent)
  const isLinux = /Linux/.test(userAgent) && !isAndroid
  
  // Détection navigateur précise
  const isChrome = /Chrome/.test(userAgent) && !/Edg|OPR|Brave|Samsung|Chromium/.test(userAgent)
  const isEdge = /Edg/.test(userAgent)
  const isSafari = /Safari/.test(userAgent) && !/Chrome|Chromium/.test(userAgent)
  const isFirefox = /Firefox/.test(userAgent)
  const isSamsung = /SamsungBrowser/.test(userAgent)
  const isBrave = /Brave/.test(userAgent)
  const isOpera = /OPR/.test(userAgent)
  
  // Détections spécifiques importantes
  const isChromeIOS = isIOS && /CriOS/.test(userAgent)
  const isFirefoxIOS = isIOS && /FxiOS/.test(userAgent)
  const isEdgeIOS = isIOS && /EdgiOS/.test(userAgent)
  const isChromeMobile = isAndroid && isChrome
  const isChromeDesktop = (isWindows || isMac || isLinux) && isChrome
  const isSafariMobile = isIOS && isSafari
  const isSafariDesktop = isMac && isSafari
  
  // Version iOS pour instructions spécifiques
  const iOSVersion = isIOS ? parseFloat((userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/) || [])[1]) : null
  
  return { 
    isIOS, isMac, isAndroid, isWindows, isLinux,
    isChrome, isEdge, isSafari, isFirefox, isSamsung, isBrave, isOpera,
    isChromeIOS, isFirefoxIOS, isEdgeIOS, isChromeMobile, isChromeDesktop,
    isSafariMobile, isSafariDesktop, iOSVersion
  }
}

// Afficher des instructions d'installation spécifiques au navigateur
function showInstallInstructions() {
  const browserInfo = getBrowserInfo()
  
  // Masquer la bannière d'installation pour laisser place à la modale
  canInstallPwa.value = false
  
  // Stocker les informations du navigateur pour la modal
  installModalBrowserInfo.value = browserInfo
  
  // Afficher la modal
  showInstallModal.value = true
  
  logger.info('📖 Modal d\'instructions d\'installation PWA affichée:', {
    platform: { 
      isIOS: browserInfo.isIOS, 
      isAndroid: browserInfo.isAndroid, 
      isMac: browserInfo.isMac, 
      isWindows: browserInfo.isWindows 
    },
    browser: { 
      isChromeIOS: browserInfo.isChromeIOS, 
      isSafariMobile: browserInfo.isSafariMobile, 
      isChromeMobile: browserInfo.isChromeMobile, 
      isChromeDesktop: browserInfo.isChromeDesktop, 
      isSafariDesktop: browserInfo.isSafariDesktop, 
      isFirefox: browserInfo.isFirefox, 
      isEdge: browserInfo.isEdge, 
      isSamsung: browserInfo.isSamsung 
    },
    iOSVersion: browserInfo.iOSVersion
  })
}

// Afficher manuellement la barre d'installation (pour le menu utilisateur)
async function showInstallBannerManually() {
  const browserInfo = getBrowserInfo()
  
  // 🎯 AUDIT: Click sur "Installer l'app" dans le menu utilisateur
  await AuditClient.safeLogUserAction(createPWAAuditData('INSTALL_CLICKED', browserInfo, {
    source: 'user_menu',
    hasNativePrompt: !!deferredPrompt.value,
    isAlreadyInstalled: isPwaInstalled()
  }))
  
  // Vérifier si l'app est déjà installée
  if (isPwaInstalled()) {
    logger.info('📱 App déjà installée - pas d\'affichage de la barre')
    alert('📱 L\'application HatCast est déjà installée sur cet appareil !')
    return
  }
  
  // Forcer l'affichage de la barre même si elle a été fermée récemment
  canInstallPwa.value = true
  bannerDismissed.value = false
  
  // Réinitialiser les timestamps pour permettre l'affichage
  localStorage.removeItem('hatcast-pwa-banner-dismissed')
  
  logger.info('📱 Barre d\'installation PWA affichée manuellement depuis le menu utilisateur')
}

// Réessayer l'installation depuis la modal
function retryInstallFromModal() {
  logger.info('🔄 Tentative de réessai d\'installation depuis la modal')
  
  if (deferredPrompt.value) {
    // On a un prompt natif, on l'utilise
    installPwa()
  } else {
    // Pas de prompt natif, on affiche la barre d'installation
    showInstallBannerManually()
  }
}

// Handle service worker updates
function handleServiceWorkerUpdate() {
  // Ne proposer de mise à jour que si la PWA est installée
  if (isPwaInstalled()) {
    updateAvailable.value = true
    logger.info('🔄 Mise à jour PWA disponible')
  } else {
    logger.info('ℹ️ Mise à jour disponible mais PWA non installée - ignorée')
  }
}

async function updateApp() {
  const browserInfo = getBrowserInfo()
  
  // 🎯 AUDIT: L'utilisateur a cliqué sur "Mettre à jour"
  await AuditClient.safeLogUserAction(createPWAAuditData('UPDATE_CLICKED', browserInfo, {
    action: 'pwa_update_button_clicked',
    isInstalled: isPwaInstalled()
  }))
  
  refreshing.value = true
  logger.info('🚀 Début de la mise à jour PWA...')
  
  // Attendre un peu pour que l'utilisateur voie l'indicateur de progression
  setTimeout(async () => {
    try {
      logger.info('📡 Vérification du service worker...')
      
      // Send message to service worker to skip waiting
      if ('serviceWorker' in navigator) {
        // Obtenir l'enregistrement du service worker
        const registration = await navigator.serviceWorker.getRegistration()
        logger.info('🔍 Enregistrement SW trouvé:', registration)
        
        if (registration && registration.active) {
          logger.info('✅ Service worker actif trouvé, envoi du message SKIP_WAITING...')
          
          // Envoyer le message au service worker actif
          registration.active.postMessage({ type: 'SKIP_WAITING' })
          logger.info('📤 Message SKIP_WAITING envoyé')
          
          // Attendre un peu pour que le service worker traite le message
          await new Promise(resolve => setTimeout(resolve, 500))
          logger.info('⏳ Attente de 500ms terminée')
          
          // Vérifier si le service worker a changé
          if (registration.waiting) {
            logger.info('🔄 Service worker en attente détecté, attente de l\'activation...')
            
            // Attendre que le service worker soit activé
            await new Promise(resolve => {
              const checkWaiting = () => {
                if (!registration.waiting) {
                  logger.info('✅ Service worker activé avec succès')
                  resolve()
                } else {
                  logger.info('⏳ Service worker toujours en attente, nouvelle vérification dans 100ms...')
                  setTimeout(checkWaiting, 100)
                }
              }
              checkWaiting()
            })
          } else {
            logger.info('ℹ️ Aucun service worker en attente')
          }
        } else {
          logger.warn('⚠️ Aucun service worker actif trouvé')
        }
      } else {
        logger.warn('⚠️ Service Worker non supporté sur cet appareil')
      }
      
      // 🎯 AUDIT: Mise à jour réussie (avant rechargement)
      await AuditClient.safeLogUserAction(createPWAAuditData('UPDATE_SUCCESS', browserInfo, {
        action: 'pwa_update_completed',
        method: 'service_worker_updated'
      }))
      
      logger.info('🔄 Rechargement de la page...')
      // Recharger la page pour appliquer la mise à jour
      window.location.reload()
    } catch (error) {
      logger.error('❌ Erreur lors de la mise à jour:', error)
      
      // 🎯 AUDIT: Erreur de mise à jour
      await AuditClient.safeLogUserAction(createPWAAuditData('UPDATE_FAILED', browserInfo, {
        action: 'pwa_update_failed',
        error: error.message,
        errorName: error.name
      }))
      
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
  // Vérifier si on doit afficher la barre d'installation
  checkIfShouldShowInstallBanner()
  
  // Vérifier et réactiver automatiquement les notifications push
  ensurePushNotificationsActive().then(status => {
    if (status.active) {
      logger.info('Notifications push actives au démarrage')
    } else {
      logger.info('Notifications push inactives au démarrage:', status.error)
    }
  })
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // Écouter l'événement de test de mise à jour PWA
  window.addEventListener('pwa-update-test', handlePwaUpdateTest)
  
  // Écouter l'événement pour déclencher manuellement la barre d'installation PWA
  window.addEventListener('show-pwa-install-banner', () => {
    showInstallBannerManually()
  })
  
  // Check for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing.value) return
      // Ne proposer de mise à jour que si la PWA est installée
      if (isPwaInstalled()) {
        updateAvailable.value = true
        logger.info('🔄 Service worker mis à jour - PWA installée')
      } else {
        logger.info('ℹ️ Service worker mis à jour mais PWA non installée - ignoré')
      }
    })
    
    // Écouter les messages du service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATING') {
        logger.info('Service worker en cours de mise à jour...')
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
