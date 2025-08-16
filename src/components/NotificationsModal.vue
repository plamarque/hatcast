<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4" @click="close">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-xl" @click.stop>
      <button @click="close" class="absolute right-3 top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>
      <!-- Header compact style modales -->
      <div class="mb-4 md:mb-6">
        <div class="flex items-start gap-4">
          <!-- Icône et titre à gauche -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg md:text-xl">🔔</span>
            </div>
            <div class="space-y-2">
              <h3 class="text-white font-semibold text-base md:text-lg">Notifications</h3>
              <p class="text-gray-400 text-xs md:text-sm">Ne ratez rien, soyez le premier prévenu !</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="border-t border-white/10 mb-4 md:mb-6"></div>

      <div class="space-y-4 md:space-y-6">
        <!-- Section Emails -->
        <div class="space-y-2 md:space-y-3">
          <h3 class="text-white font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
            <span class="text-blue-400">📧</span>
            Emails
          </h3>
          <div class="p-3 md:p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="prefs.notifyAvailability" class="w-4 h-4">
                <span class="text-sm text-white">M'envoyer un email lorsqu'un événement a besoin de joueurs</span>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="prefs.notifySelection" class="w-4 h-4">
                <span class="text-sm text-white">M'envoyer un email lorsque je suis concerné par une sélection</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Section Mobile (expérimental) -->
        <div class="space-y-2 md:space-y-3">
          <h3 class="text-white font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
            <span class="text-emerald-400">📱</span>
            Mobile (expérimental)
          </h3>
          <div class="p-3 md:p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <!-- Notifications sur cet appareil - déplacé en haut -->
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-400">Notifications sur cet appareil</div>
              <template v-if="!pushEnabledOnDevice">
                <button @click="enablePushOnThisDevice" :disabled="enablePushLoading" class="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500 disabled:opacity-50">{{ enablePushLoading ? '...' : 'Activer' }}</button>
              </template>
              <template v-else>
                <span class="inline-flex items-center text-xs text-gray-300">
                  <span class="mr-1 text-emerald-400">✓</span> Actif
                </span>
              </template>
            </div>
            
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="prefs.notifySelectionPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Me notifier lorsque je suis concerné par une sélection</span>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="prefs.notifyAvailabilityPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Me notifier lorsqu'un événement a besoin de joueurs</span>
              </label>
            </div>
            <div v-if="!pushEnabledOnDevice" class="text-xs text-gray-400 italic">⚠️ Ces préférences sont désactivées car les notifications de l'application ne sont pas actives sur cet appareil</div>
          </div>
        </div>

        <div v-if="prefsError" class="text-xs text-red-300">{{ prefsError }}</div>
        <div v-if="prefsSuccess" class="text-xs text-green-300">{{ prefsSuccess }}</div>
      </div>

      <div class="mt-6 flex justify-between items-center">
        <button @click="savePrefs" :disabled="prefsLoading" class="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50">{{ prefsLoading ? '⏳' : 'Sauvegarder' }}</button>
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../services/firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { queuePushMessage } from '../services/pushService.js'
import { canUsePush, requestAndGetToken, ensurePushNotificationsActive, startPushHealthCheck } from '../services/notifications'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const email = ref('')
const prefs = ref({ notifyAvailability: true, notifySelection: true, notifySelectionPush: true, notifyAvailabilityPush: true })
const prefsLoading = ref(false)
const prefsError = ref('')
const prefsSuccess = ref('')
const enablePushLoading = ref(false)
const fcmToken = ref(localStorage.getItem('fcmToken') || '')
const pushEnabledOnDevice = ref(false)

// Gestionnaire pour les changements d'état des notifications push
function handlePushStatusChanged(event) {
  const { active, token } = event.detail
  if (active && token) {
    fcmToken.value = token
    pushEnabledOnDevice.value = true
    localStorage.setItem('fcmToken', token)
    console.log('Notifications push réactivées automatiquement')
  } else {
    pushEnabledOnDevice.value = false
    fcmToken.value = ''
    localStorage.removeItem('fcmToken')
    console.log('Notifications push désactivées')
  }
}

async function loadPrefs() {
  try {
    if (!email.value) return
    const prefRef = doc(db, 'userPreferences', email.value)
    const snap = await getDoc(prefRef)
    if (snap.exists()) {
      const data = snap.data() || {}
      prefs.value.notifyAvailability = data.notifyAvailability !== false
      prefs.value.notifySelection = data.notifySelection !== false
      prefs.value.notifySelectionPush = data.notifySelectionPush !== false
      prefs.value.notifyAvailabilityPush = data.notifyAvailabilityPush !== false
    } else {
      prefs.value = { notifyAvailability: true, notifySelection: true, notifySelectionPush: true, notifyAvailabilityPush: true }
    }
  } catch {}
}

async function enablePushOnThisDevice() {
  try {
    enablePushLoading.value = true
    const supported = await canUsePush()
    if (!supported) {
      testPushError.value = 'Push non supporté sur cet appareil'
      return
    }
    
    const status = await ensurePushNotificationsActive()
    if (status.active) {
      fcmToken.value = status.token
      pushEnabledOnDevice.value = true
      localStorage.setItem('fcmToken', status.token)
      console.log('Notifications push activées avec succès')
    } else {
      testPushError.value = `Activation impossible: ${status.error}`
    }
  } catch (e) {
    const perm = (typeof Notification !== 'undefined') ? Notification.permission : 'unknown'
    const msg = (e && (e.message || e.code)) ? ` (${e.message || e.code})` : ''
    testPushError.value = `Activation impossible – permission: ${perm}${msg}`
  } finally {
    enablePushLoading.value = false
  }
}

async function savePrefs() {
  if (!email.value) return
  prefsLoading.value = true
  prefsError.value = ''
  prefsSuccess.value = ''
  try {
    const prefRef = doc(db, 'userPreferences', email.value)
    await setDoc(prefRef, { ...prefs.value }, { merge: true })
    prefsSuccess.value = 'Préférences sauvegardées'
  } catch (e) {
    prefsError.value = 'Impossible de sauvegarder vos préférences'
  } finally {
    prefsLoading.value = false
  }
}

function close() { emit('close') }

watch(() => props.show, (v) => { if (v) { loadPrefs() } })
onMounted(() => { 
  try {
    email.value = auth?.currentUser?.email || ''
    pushEnabledOnDevice.value = (typeof Notification !== 'undefined' && Notification.permission === 'granted' && !!localStorage.getItem('fcmToken'))
    
    // Démarrer la vérification automatique des notifications push
    startPushHealthCheck()
    
    // Écouter les changements d'état des notifications push
    window.addEventListener('push-status-changed', handlePushStatusChanged)
    
    // Vérifier l'état actuel des notifications push
    ensurePushNotificationsActive().then(status => {
      if (status.active) {
        fcmToken.value = status.token
        pushEnabledOnDevice.value = true
        localStorage.setItem('fcmToken', status.token)
      }
    })
  } catch {}
  if (props.show) { loadPrefs() } 
})

onUnmounted(() => {
  // Nettoyer les écouteurs d'événements
  window.removeEventListener('push-status-changed', handlePushStatusChanged)
})
</script>
