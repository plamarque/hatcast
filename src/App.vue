<template>
  <router-view />

  <button
    v-if="canInstallPwa"
    class="fixed bottom-4 right-4 z-50 rounded-full bg-sky-600 text-white px-4 py-2 shadow-lg hover:bg-sky-700 active:bg-sky-800"
    @click="installPwa"
  >
    Installer l’app
  </button>
  
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

function handleBeforeInstallPrompt(event) {
  event.preventDefault()
  deferredPrompt.value = event
  canInstallPwa.value = true
}

async function installPwa() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  // Quel que soit le choix, on remet à zéro; le navigateur décidera quand ré-émettre l'événement
  canInstallPwa.value = false
  deferredPrompt.value = null
}

function handleAppInstalled() {
  canInstallPwa.value = false
  deferredPrompt.value = null
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
