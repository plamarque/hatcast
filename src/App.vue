<template>
  <router-view />

  <button
    v-if="canInstallPwa"
    class="fixed bottom-4 right-4 z-50 rounded-full bg-sky-600 text-white px-4 py-2 shadow-lg hover:bg-sky-700 active:bg-sky-800"
    @click="installPwa"
  >
    Installer l’app
  </button>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const deferredPrompt = ref(null)
const canInstallPwa = ref(false)

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

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
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
