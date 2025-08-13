<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4" @click="close">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-xl" @click.stop>
      <button @click="close" class="absolute right-3 top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔔</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Notifications</h2>
        <p class="text-sm text-gray-300">Gérez vos préférences de notifications</p>
      </div>

      <div class="space-y-3">
        <!-- Section Emails -->
        <div class="p-3 rounded-lg border border-white/10 bg-white/5 space-y-3">
          <div class="text-white font-semibold text-sm mb-1">Emails</div>
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="prefs.notifyAvailability" class="w-4 h-4">
              <span>M'envoyer un email lorsqu'un événement a besoin de joueurs</span>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="prefs.notifySelection" class="w-4 h-4">
              <span>M'envoyer un email lorsque je suis concerné par une sélection</span>
            </label>
          </div>
        </div>

        <!-- Section Push (expérimental) -->
        <div class="p-3 rounded-lg border border-white/10 bg-white/5 space-y-3">
          <div class="text-white font-semibold text-sm mb-1">Push (expérimental)</div>
          <div class="text-xs text-emerald-200 mb-1">Fonctionnalité en test: activable uniquement ici.</div>
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="prefs.notifySelectionPush" class="w-4 h-4">
              <span>Me notifier lorsque je suis concerné par une sélection</span>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="prefs.notifyAvailabilityPush" class="w-4 h-4">
              <span>Me notifier lorsqu'un événement a besoin de joueurs</span>
            </label>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-white/10">
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
          <div class="flex items-center justify-between pt-2">
            <div class="text-xs text-gray-400">Test de notification push</div>
            <button @click="sendTestPush" :disabled="testPushLoading || !email" class="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500 disabled:opacity-50">{{ testPushLoading ? 'Envoi…' : 'Envoyer un test' }}</button>
          </div>
          <div v-if="testPushSuccess" class="text-xs text-green-300">Notification test envoyée (vérifiez votre appareil)</div>
          <div v-if="testPushError" class="text-xs text-red-300">{{ testPushError }}</div>
          <div v-if="fcmToken" class="text-[10px] text-gray-400 break-all">FCM token: {{ fcmToken }}</div>
          <div class="text-[10px] text-gray-500">VAPID: {{ vapidKeyPreview || 'indisponible' }}</div>
        </div>

        <div class="text-right">
          <button @click="savePrefs" :disabled="prefsLoading" class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">{{ prefsLoading ? '⏳' : 'Sauvegarder' }}</button>
        </div>
        <div v-if="prefsError" class="text-xs text-red-300">{{ prefsError }}</div>
        <div v-if="prefsSuccess" class="text-xs text-green-300">{{ prefsSuccess }}</div>
      </div>

      <div class="mt-6 text-center">
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { auth, db } from '../services/firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { queuePushMessage } from '../services/pushService.js'
import { canUsePush, requestAndGetToken } from '../services/notifications'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const email = ref('')
const prefs = ref({ notifyAvailability: true, notifySelection: true, notifySelectionPush: true, notifyAvailabilityPush: true })
const prefsLoading = ref(false)
const prefsError = ref('')
const prefsSuccess = ref('')
const testPushLoading = ref(false)
const testPushSuccess = ref('')
const testPushError = ref('')
const enablePushLoading = ref(false)
const fcmToken = ref(localStorage.getItem('fcmToken') || '')
const pushEnabledOnDevice = ref(false)
const vapidKeyPreview = (function maskKey(key) { try { return key ? (key.length > 20 ? key.slice(0,8) + '…' + key.slice(-6) : key) : '' } catch { return '' } })(import.meta.env?.VITE_FIREBASE_VAPID_KEY)

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

async function sendTestPush() {
  if (!email.value) return
  testPushLoading.value = true
  testPushError.value = ''
  testPushSuccess.value = ''
  try {
    await queuePushMessage({ toEmail: email.value, title: 'Test Impro Selector', body: 'Ceci est un test de notification', data: { url: '/' }, reason: 'manual_test' })
    testPushSuccess.value = 'OK'
  } catch (e) {
    testPushError.value = 'Échec de l\'envoi du test'
  } finally {
    testPushLoading.value = false
  }
}

async function enablePushOnThisDevice() {
  try {
    enablePushLoading.value = true
    const supported = await canUsePush()
    if (!supported) {
      testPushError.value = 'Push non supporté sur cet appareil'
      return
    }
    const swReg = window.__swReg
    const token = await requestAndGetToken(swReg)
    if (token) {
      fcmToken.value = token
      try { localStorage.setItem('fcmToken', token) } catch {}
      pushEnabledOnDevice.value = true
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
  } catch {}
  if (props.show) { loadPrefs() } 
})
</script>
