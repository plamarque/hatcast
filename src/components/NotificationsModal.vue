<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">🔔 Préférences de notifications</h2>
        <button @click="close" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
      </div>

      <!-- Onglets -->
      <div class="flex border-b border-white/10 mb-6">
        <button 
          @click="activeTab = 'email'"
          class="px-4 py-2 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'email' 
            ? 'text-blue-400 border-b-2 border-blue-400' 
            : 'text-gray-400 hover:text-white'"
        >
          📧 Emails
        </button>
        <button 
          @click="activeTab = 'mobile'"
          class="px-4 py-2 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'mobile' 
            ? 'text-emerald-400 border-b-2 border-emerald-400' 
            : 'text-gray-400 hover:text-white'"
        >
          📱 Mobile
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
                <!-- Onglet Email -->
        <div v-if="activeTab === 'email'" class="space-y-4">
          
          <!-- Affichage de l'email actuel -->
          <div class="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
            <div class="text-blue-200 text-sm">Nous enverrons des emails à l'adresse : <span class="text-blue-100 font-semibold">{{ email || 'Non connecté' }}</span></div>
          </div>
          
          <!-- Notifications d'événements -->
           <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
             <h4 class="text-sm font-medium text-gray-300 mb-3">Événements</h4>
             <div class="space-y-3">
               <div class="flex items-center justify-between">
                 <label class="flex items-center gap-2">
                   <input type="checkbox" v-model="prefs.notifyAvailability" class="w-4 h-4">
                   <span class="text-sm text-white">M'envoyer un email lorsqu'un événement a besoin de personnes</span>
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

          <!-- Rappels automatiques -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Rappels automatiques</h4>
            <p class="text-xs text-gray-400 italic mb-3">🚧 Bientôt disponible</p>
            <div class="space-y-3 opacity-50">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" v-model="prefs.notifyReminder7Days" disabled class="w-4 h-4 cursor-not-allowed">
                  <span class="text-sm text-gray-400">Rappel automatique 7 jours avant un événement</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" v-model="prefs.notifyReminder1Day" disabled class="w-4 h-4 cursor-not-allowed">
                  <span class="text-sm text-gray-400">Rappel automatique 1 jour avant un événement</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Mobile -->
        <div v-if="activeTab === 'mobile'" class="space-y-4">
          
          <!-- Avertissement expérimental -->
          <div class="p-3 rounded-lg border border-orange-500/30 bg-orange-500/10">
            <div class="flex items-center gap-2 text-sm text-orange-300">
              <span>⚠️</span>
              <span>Les notifications mobiles sont encore expérimentales</span>
            </div>
          </div>
          
          <!-- État des notifications sur cet appareil -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Notifications sur cet appareil</h4>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-white">Statut</span>
              <template v-if="!pushEnabledOnDevice">
                <button @click="enablePushOnThisDevice" :disabled="enablePushLoading" class="px-3 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500 disabled:opacity-50">
                  {{ enablePushLoading ? '...' : 'Activer' }}
                </button>
              </template>
              <template v-else>
                <span class="inline-flex items-center text-xs text-gray-300">
                  <span class="mr-1 text-emerald-400">✓</span> Actif
                </span>
              </template>
            </div>
            
            <div v-if="!pushEnabledOnDevice" class="text-xs text-gray-400 italic">
              ⚠️ Ces préférences sont désactivées car les notifications de l'application ne sont pas actives sur cet appareil
            </div>
          </div>

                     <!-- Notifications d'événements -->
           <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
             <h4 class="text-sm font-medium text-gray-300 mb-3">Événements</h4>
             <div class="space-y-3">
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
             </div>
           </div>

          <!-- Rappels automatiques -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Rappels automatiques</h4>
            <p class="text-xs text-gray-400 italic mb-3">🚧 Bientôt disponible</p>
            <div class="space-y-3 opacity-50">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" v-model="prefs.notifyReminder7DaysPush" disabled class="w-4 h-4 cursor-not-allowed">
                  <span class="text-sm text-gray-400">Rappel 7 jours avant (notifications)</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-not-allowed">
                  <input type="checkbox" v-model="prefs.notifyReminder1DayPush" disabled class="w-4 h-4 cursor-not-allowed">
                  <span class="text-sm text-gray-400">Rappel 1 jour avant (notifications)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages d'erreur/succès -->
      <div v-if="prefsError" class="mt-4 text-xs text-red-300">{{ prefsError }}</div>
      <div v-if="prefsSuccess" class="mt-4 text-xs text-green-300">{{ prefsSuccess }}</div>

      <!-- Boutons d'action -->
      <div class="mt-6 flex justify-between items-center">
        <button @click="savePrefs" :disabled="prefsLoading" class="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50">
          {{ prefsLoading ? '⏳' : 'Sauvegarder' }}
        </button>
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800">
          Fermer
        </button>
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
const prefs = ref({ 
  notifyAvailability: true, 
  notifySelection: true, 
  notifySelectionPush: true, 
  notifyAvailabilityPush: true,
  notifyReminder7Days: true,
  notifyReminder1Day: true,
  notifyReminder7DaysPush: true,
  notifyReminder1DayPush: true
})
const prefsLoading = ref(false)
const prefsError = ref('')
const prefsSuccess = ref('')
const enablePushLoading = ref(false)
const fcmToken = ref(localStorage.getItem('fcmToken') || '')
const pushEnabledOnDevice = ref(false)
const activeTab = ref('email') // Onglet actif par défaut

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
      prefs.value.notifyReminder7Days = data.notifyReminder7Days !== false
      prefs.value.notifyReminder1Day = data.notifyReminder1Day !== false
      prefs.value.notifyReminder7DaysPush = data.notifyReminder7DaysPush !== false
      prefs.value.notifyReminder1DayPush = data.notifyReminder1DayPush !== false
    } else {
      prefs.value = { notifyAvailability: true, notifySelection: true, notifySelectionPush: true, notifyAvailabilityPush: true, notifyReminder7Days: true, notifyReminder1Day: true, notifyReminder7DaysPush: true, notifyReminder1DayPush: true }
    }
  } catch {}
}

async function enablePushOnThisDevice() {
  try {
    enablePushLoading.value = true
    const supported = await canUsePush()
    if (!supported) {
      prefsError.value = 'Push non supporté sur cet appareil'
      return
    }
    
    const status = await ensurePushNotificationsActive()
    if (status.active) {
      fcmToken.value = status.token
      pushEnabledOnDevice.value = true
      localStorage.setItem('fcmToken', status.token)
      console.log('Notifications push activées avec succès')
    } else {
      prefsError.value = `Activation impossible: ${status.error}`
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

watch(() => props.show, (v) => { 
  if (v) { 
    try {
      email.value = auth?.currentUser?.email || ''
      loadPrefs()
    } catch {}
  } 
})

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
