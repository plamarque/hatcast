<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1070] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-2xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">⚙️ Mes préférences</h2>
        <button @click="close" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
      </div>

      <!-- Onglets -->
      <div class="flex border-b border-white/10 mb-6">
        <button 
          @click="activeTab = 'roles'"
          class="px-4 py-2 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'roles' 
            ? 'text-purple-400 border-b-2 border-purple-400' 
            : 'text-gray-400 hover:text-white'"
        >
          🎭 Rôles
        </button>
        <button 
          @click="activeTab = 'emails'"
          class="px-4 py-2 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'emails' 
            ? 'text-blue-400 border-b-2 border-blue-400' 
            : 'text-gray-400 hover:text-white'"
        >
          📧 Emails
        </button>
        <button 
          @click="activeTab = 'notifications'"
          class="px-4 py-2 text-sm font-medium transition-colors duration-200"
          :class="activeTab === 'notifications' 
            ? 'text-emerald-400 border-b-2 border-emerald-400' 
            : 'text-gray-400 hover:text-white'"
        >
          🔔 Notifications
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="space-y-6">
        <!-- Onglet Rôles -->
        <div v-if="activeTab === 'roles'" class="space-y-4">
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
            <h4 class="text-sm font-medium text-gray-300 mb-3">🎭 Mes rôles préférés</h4>
            <p class="text-xs text-gray-400 mb-4">
              Choisis les rôles que tu veux voir pré-cochés par défaut quand tu indiques ta disponibilité.
            </p>
            
            <div class="grid grid-cols-2 gap-3">
              <div 
                v-for="role in allRoles" 
                :key="role"
                class="relative flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                @mouseenter="role === ROLES.VOLUNTEER ? showVolunteerTooltip = true : null"
                @mouseleave="role === ROLES.VOLUNTEER ? showVolunteerTooltip = false : null"
                @click="role === ROLES.VOLUNTEER ? toggleVolunteerTooltip() : null"
              >
                <input
                  type="checkbox"
                  :value="role"
                  v-model="rolePreferences.preferredRoles"
                  :disabled="!canDisableRole(role)"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0"
                >
                <span class="text-lg flex-shrink-0">{{ ROLE_EMOJIS[role] }}</span>
                <span class="text-sm text-white flex-1">{{ ROLE_LABELS_SINGULAR[role] }}</span>
                
                <!-- Tooltip riche pour le rôle bénévole -->
                <div 
                  v-if="role === ROLES.VOLUNTEER && showVolunteerTooltip"
                  class="absolute z-10 left-0 right-0 top-full mt-2 p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400/30 shadow-xl"
                  @click.stop
                >
                  <div class="flex items-start gap-2 text-xs text-white">
                    <span class="text-base flex-shrink-0">💡</span>
                    <div>
                      <strong class="font-semibold">Astuce :</strong>
                      <span class="ml-1">Le rôle bénévole est toujours pré-coché car si tu es disponible, tu peux toujours aider !</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Emails -->
        <div v-if="activeTab === 'emails'" class="space-y-6">
          <!-- Affichage de l'email actuel -->
          <div class="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
            <div class="text-blue-200 text-sm">Nous enverrons des emails à l'adresse : <span class="text-blue-100 font-semibold">{{ email || 'Non connecté' }}</span></div>
          </div>
          
          <!-- Notifications de spectacles -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Notifications</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyAvailability" class="w-4 h-4">
                  <span class="text-sm text-white">M'envoyer un email lorsqu'un spectacle a besoin de personnes</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifySelection" class="w-4 h-4">
                  <span class="text-sm text-white">M'envoyer un email lorsque je suis concerné par une composition</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Rappels automatiques -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Rappels automatiques</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyReminder7Days" class="w-4 h-4">
                  <span class="text-sm text-white">Rappel automatique 7 jours avant un spectacle</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyReminder1Day" class="w-4 h-4">
                  <span class="text-sm text-white">Rappel automatique 1 jour avant un spectacle</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyAvailabilityReminderEmail" class="w-4 h-4">
                  <span class="text-sm text-white">Rappels hebdomadaires si je n'ai pas indiqué mes disponibilités</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Notifications -->
        <div v-if="activeTab === 'notifications'" class="space-y-6">
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
              <div class="flex flex-col">
                <span class="text-sm text-white">Statut</span>
                <span class="text-xs text-gray-400 mt-1">
                  {{ pushEnabledOnDevice ? 'Les notifications sont actives' : 'Activer pour recevoir des notifications sur cet appareil' }}
                </span>
              </div>
              <div class="flex gap-2">
                <button 
                  v-if="!pushEnabledOnDevice"
                  @click="enablePushOnThisDevice" 
                  :disabled="enablePushLoading" 
                  class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  <span v-if="enablePushLoading">⏳ Activation...</span>
                  <span v-else>✓ Activer</span>
                </button>
                <button 
                  v-else
                  @click="disablePushOnThisDevice" 
                  :disabled="enablePushLoading" 
                  class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  <span v-if="enablePushLoading">⏳ Désactivation...</span>
                  <span v-else>✕ Désactiver</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="!pushEnabledOnDevice" class="text-xs text-gray-400 italic p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            ⚠️ Les préférences ci-dessous sont désactivées car les notifications ne sont pas actives sur cet appareil
          </div>

          <!-- Notifications de spectacles -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Notifications</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifySelectionPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                  <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Me notifier lorsque je suis concerné par une composition</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyAvailabilityPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                  <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Me notifier en cas de nouveau spectacle</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Rappels automatiques -->
          <div class="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 class="text-sm font-medium text-gray-300 mb-3">Rappels automatiques</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyReminder7DaysPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                  <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Rappel automatique 7 jours avant un spectacle</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyReminder1DayPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                  <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Rappel automatique 1 jour avant un spectacle</span>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="notificationPrefs.notifyAvailabilityReminderPush" :disabled="!pushEnabledOnDevice" class="w-4 h-4">
                  <span class="text-sm text-white" :class="{ 'text-gray-400': !pushEnabledOnDevice }">Rappels hebdomadaires si je n'ai pas indiqué mes disponibilités</span>
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
        <button 
          @click="savePrefs" 
          :disabled="prefsLoading" 
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
        >
          <span v-if="prefsLoading" class="animate-spin">⏳</span>
          <span v-else>💾</span>
          {{ prefsLoading ? 'Sauvegarde...' : 'Enregistrer' }}
        </button>
        <button @click="close" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-colors duration-200">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ROLES, ROLE_EMOJIS, ROLE_LABELS_SINGULAR, ROLE_DISPLAY_ORDER } from '../services/storage.js'
import { getUserRolePreferences, saveUserRolePreferences, canDisableRole } from '../services/rolePreferencesService.js'
import { queuePushMessage } from '../services/pushService.js'
import { canUsePush, requestAndGetToken, ensurePushNotificationsActive, startPushHealthCheck } from '../services/notifications'
import { currentUser, isConnected } from '../services/authState.js'
import { auth } from '../services/firebase.js'
import firestoreService from '../services/firestoreService.js'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const email = ref('')
const activeTab = ref('roles') // Onglet actif par défaut

// Préférences de rôles
const rolePreferences = ref({
  preferredRoles: [],
  volunteerAlwaysSelected: true
})

// Préférences de notifications
const notificationPrefs = ref({
  notifyAvailability: true,
  notifySelection: true,
  notifyReminder7Days: true,
  notifyReminder1Day: true,
  notifySelectionPush: true,
  notifyAvailabilityPush: true,
  notifyReminder7DaysPush: true,
  notifyReminder1DayPush: true,
  notifyAvailabilityReminderEmail: true,
  notifyAvailabilityReminderPush: true
})

// Fonction pour s'assurer que toutes les propriétés sont initialisées
function ensureNotificationPrefsInitialized() {
  const defaultPrefs = {
    notifyAvailability: true,
    notifySelection: true,
    notifyReminder7Days: true,
    notifyReminder1Day: true,
    notifySelectionPush: true,
    notifyAvailabilityPush: true,
    notifyReminder7DaysPush: true,
    notifyReminder1DayPush: true,
    notifyAvailabilityReminderEmail: true,
    notifyAvailabilityReminderPush: true
  }
  
  for (const [key, defaultValue] of Object.entries(defaultPrefs)) {
    if (notificationPrefs.value[key] === undefined) {
      console.warn(`Initialisation de la propriété manquante: ${key} = ${defaultValue}`)
      notificationPrefs.value[key] = defaultValue
    }
  }
}

// Fonction pour s'assurer que rolePreferences est correctement initialisé
function ensureRolePreferencesInitialized() {
  if (!rolePreferences.value) {
    console.warn('rolePreferences est null/undefined, initialisation...')
    rolePreferences.value = {
      preferredRoles: [ROLES.PLAYER, ROLES.VOLUNTEER, ROLES.DIRECTOR, ROLES.TECHNICIAN, ROLES.ORGANIZER],
      volunteerAlwaysSelected: true
    }
  }
  
  if (!Array.isArray(rolePreferences.value.preferredRoles)) {
    console.warn('preferredRoles n\'est pas un tableau, initialisation...')
    rolePreferences.value.preferredRoles = [ROLES.PLAYER, ROLES.VOLUNTEER, ROLES.DIRECTOR, ROLES.TECHNICIAN, ROLES.ORGANIZER]
  }
  
  // S'assurer que le rôle bénévole est toujours présent
  if (!rolePreferences.value.preferredRoles.includes(ROLES.VOLUNTEER)) {
    console.warn('Rôle bénévole manquant, ajout automatique...')
    rolePreferences.value.preferredRoles.push(ROLES.VOLUNTEER)
  }
  
  if (rolePreferences.value.volunteerAlwaysSelected === undefined) {
    console.warn('volunteerAlwaysSelected est undefined, initialisation...')
    rolePreferences.value.volunteerAlwaysSelected = true
  }
}

const prefsLoading = ref(false)
const prefsError = ref('')
const prefsSuccess = ref('')
const enablePushLoading = ref(false)
const fcmToken = ref(localStorage.getItem('fcmToken') || '')
const pushEnabledOnDevice = ref(false)
const showVolunteerTooltip = ref(false)

// Tous les rôles disponibles
const allRoles = ROLE_DISPLAY_ORDER

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

// Charger les préférences
async function loadPrefs() {
  try {
    if (!email.value) {
      console.log('Aucun email, impossible de charger les préférences')
      return
    }
    
    console.log('Chargement des préférences pour:', email.value)
    
    // Utiliser firestoreService pour charger les préférences
    const data = await firestoreService.getDocument('userPreferences', email.value)
    
    if (data) {
      console.log('Préférences trouvées:', data)
      
      // Charger les préférences de rôles
      if (data.rolePreferences) {
        rolePreferences.value = data.rolePreferences
        // S'assurer que le rôle bénévole est toujours présent
        if (!rolePreferences.value.preferredRoles.includes(ROLES.VOLUNTEER)) {
          rolePreferences.value.preferredRoles.push(ROLES.VOLUNTEER)
        }
        console.log('Préférences de rôles chargées:', rolePreferences.value)
      } else {
        // Utiliser les préférences par défaut
        rolePreferences.value = {
          preferredRoles: [ROLES.PLAYER, ROLES.VOLUNTEER, ROLES.DIRECTOR, ROLES.TECHNICIAN, ROLES.ORGANIZER],
          volunteerAlwaysSelected: true
        }
        console.log('Préférences de rôles par défaut appliquées:', rolePreferences.value)
      }
      
      // Charger les préférences de notifications
      notificationPrefs.value.notifyAvailability = data.notifyAvailability !== false
      notificationPrefs.value.notifySelection = data.notifySelection !== false
      notificationPrefs.value.notifyReminder7Days = data.notifyReminder7Days !== false
      notificationPrefs.value.notifyReminder1Day = data.notifyReminder1Day !== false
      notificationPrefs.value.notifySelectionPush = data.notifySelectionPush !== false
      notificationPrefs.value.notifyAvailabilityPush = data.notifyAvailabilityPush !== false
      notificationPrefs.value.notifyReminder7DaysPush = data.notifyReminder7DaysPush !== false
      notificationPrefs.value.notifyReminder1DayPush = data.notifyReminder1DayPush !== false
      notificationPrefs.value.notifyAvailabilityReminderEmail = data.notifyAvailabilityReminderEmail !== false
      notificationPrefs.value.notifyAvailabilityReminderPush = data.notifyAvailabilityReminderPush !== false
    } else {
      // Préférences par défaut
      rolePreferences.value = {
        preferredRoles: [ROLES.PLAYER, ROLES.VOLUNTEER, ROLES.DIRECTOR, ROLES.TECHNICIAN, ROLES.ORGANIZER],
        volunteerAlwaysSelected: true
      }
      notificationPrefs.value = {
        notifyAvailability: true,
        notifySelection: true,
        notifyReminder7Days: true,
        notifyReminder1Day: true,
        notifySelectionPush: true,
        notifyAvailabilityPush: true,
        notifyReminder7DaysPush: true,
        notifyReminder1DayPush: true,
        notifyAvailabilityReminderEmail: true,
        notifyAvailabilityReminderPush: true
      }
      console.log('Aucune préférence trouvée, utilisation des valeurs par défaut:', rolePreferences.value)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des préférences:', error)
  }
}

async function enablePushOnThisDevice() {
  try {
    enablePushLoading.value = true
    prefsError.value = ''
    prefsSuccess.value = ''
    
    // Vérifier que l'utilisateur est connecté AVANT de commencer
    if (!email.value) {
      prefsError.value = 'Tu dois être connecté pour activer les notifications'
      console.error('❌ Tentative d\'activation sans être connecté')
      return
    }
    
    console.log('🔔 Activation des notifications pour:', email.value)
    
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
      console.log('✅ Notifications push activées avec succès pour', email.value)
      prefsSuccess.value = '✓ Notifications activées avec succès !'
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        prefsSuccess.value = ''
      }, 3000)
    } else {
      prefsError.value = `Activation impossible: ${status.error}`
    }
  } catch (e) {
    const perm = (typeof Notification !== 'undefined') ? Notification.permission : 'unknown'
    const msg = (e && (e.message || e.code)) ? ` (${e.message || e.code})` : ''
    prefsError.value = `Activation impossible – permission: ${perm}${msg}`
    console.error('❌ Erreur lors de l\'activation:', e)
  } finally {
    enablePushLoading.value = false
  }
}

async function disablePushOnThisDevice() {
  try {
    enablePushLoading.value = true
    prefsError.value = ''
    prefsSuccess.value = ''
    
    // Supprimer le token du localStorage
    localStorage.removeItem('fcmToken')
    
    // Mettre à jour l'état local
    fcmToken.value = ''
    pushEnabledOnDevice.value = false
    
    console.log('Notifications push désactivées sur cet appareil')
    prefsSuccess.value = '✓ Notifications désactivées. Tu peux les réactiver pour obtenir un nouveau token.'
    
    // Effacer le message après 5 secondes
    setTimeout(() => {
      prefsSuccess.value = ''
    }, 5000)
  } catch (e) {
    console.error('Erreur lors de la désactivation:', e)
    prefsError.value = `Erreur lors de la désactivation: ${e.message}`
  } finally {
    enablePushLoading.value = false
  }
}

// Fonction pour nettoyer les données avant sauvegarde
function cleanDataForSave(data) {
  if (data === null || data === undefined) {
    return null
  }
  
  if (typeof data !== 'object') {
    return data
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForSave(item)).filter(item => item !== undefined)
  }
  
  const cleaned = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      console.warn(`Valeur undefined détectée pour la clé: ${key}`)
      continue
    }
    
    const cleanedValue = cleanDataForSave(value)
    if (cleanedValue !== undefined) {
      cleaned[key] = cleanedValue
    }
  }
  return cleaned
}

// Sauvegarder les préférences
async function savePrefs() {
  if (!email.value) {
    prefsError.value = 'Aucun utilisateur connecté'
    return
  }
  
  console.log('Sauvegarde des préférences:', {
    email: email.value,
    rolePreferences: rolePreferences.value,
    notificationPrefs: notificationPrefs.value
  })
  
  prefsLoading.value = true
  prefsError.value = ''
  prefsSuccess.value = ''
  
  try {
    // S'assurer que toutes les propriétés sont initialisées
    ensureNotificationPrefsInitialized()
    ensureRolePreferencesInitialized()
    
    // Vérifier l'état des notificationPrefs avant sauvegarde
    console.log('État des notificationPrefs avant sauvegarde:', notificationPrefs.value)
    console.log('État des rolePreferences avant sauvegarde:', rolePreferences.value)
    
    // Préparer les données à sauvegarder
    const rawData = {
      ...notificationPrefs.value,
      rolePreferences: rolePreferences.value,
      updatedAt: new Date()
    }
    
    console.log('Données brutes avant nettoyage:', rawData)
    
    // Nettoyer les données pour éviter les valeurs undefined
    const dataToSave = cleanDataForSave(rawData)
    
    console.log('Données à sauvegarder (nettoyées):', dataToSave)
    
    // Vérification finale : s'assurer qu'il n'y a pas de valeurs undefined
    const hasUndefined = JSON.stringify(dataToSave).includes('undefined')
    if (hasUndefined) {
      console.error('Valeurs undefined détectées dans les données finales!', dataToSave)
      throw new Error('Données contiennent des valeurs undefined')
    }
    
    await firestoreService.setDocument('userPreferences', email.value, dataToSave, true)
    prefsSuccess.value = 'Préférences sauvegardées avec succès !'
    console.log('Préférences sauvegardées avec succès')
  } catch (e) {
    console.error('Erreur lors de la sauvegarde:', e)
    prefsError.value = `Impossible de sauvegarder vos préférences: ${e.message}`
  } finally {
    prefsLoading.value = false
  }
}

function close() { 
  emit('close') 
}

function toggleVolunteerTooltip() {
  showVolunteerTooltip.value = !showVolunteerTooltip.value
}

// Watcher pour s'assurer que le rôle bénévole reste toujours composé
watch(() => rolePreferences.value.preferredRoles, (newRoles) => {
  if (newRoles && !newRoles.includes(ROLES.VOLUNTEER)) {
    newRoles.push(ROLES.VOLUNTEER)
  }
}, { deep: true })

// Watcher sur l'état d'authentification pour détecter les changements d'utilisateur
watch(() => currentUser.value, (newUser) => {
  console.log('Changement d\'utilisateur détecté:', newUser ? { email: newUser.email, uid: newUser.uid } : null)
  if (newUser && newUser.email) {
    email.value = newUser.email
    console.log('Email mis à jour:', email.value)
    // Recharger les préférences si la modale est ouverte
    if (props.show) {
      loadPrefs()
    }
  } else {
    email.value = ''
    console.log('Utilisateur déconnecté')
  }
})

watch(() => props.show, async (v) => { 
  if (v) { 
    console.log('Modale ouverte, détection de l\'utilisateur...')
    try {
      // Méthode de fallback : essayer d'abord authState, puis Firebase Auth directement
      let user = null
      let userEmail = ''
      
      try {
        // Essayer authState d'abord - éviter de logger l'objet réactif directement
        user = currentUser.value
        console.log('Utilisateur depuis authState:', user ? { email: user.email, uid: user.uid } : null)
        console.log('État de connexion:', isConnected.value)
        
        if (user && user.email) {
          userEmail = user.email
        }
      } catch (authStateError) {
        console.warn('Erreur avec authState, fallback vers Firebase Auth:', authStateError.message)
      }
      
      // Fallback vers Firebase Auth si authState échoue
      if (!userEmail) {
        try {
          const firebaseUser = auth?.currentUser
          console.log('Utilisateur depuis Firebase Auth:', firebaseUser ? { email: firebaseUser.email, uid: firebaseUser.uid } : null)
          if (firebaseUser && firebaseUser.email) {
            userEmail = firebaseUser.email
            user = firebaseUser
          }
        } catch (firebaseError) {
          console.warn('Erreur avec Firebase Auth:', firebaseError.message)
        }
      }
      
      if (userEmail) {
        email.value = userEmail
        console.log('Email détecté:', email.value)
        await loadPrefs()
      } else {
        console.log('Aucun utilisateur connecté détecté')
        email.value = ''
        prefsError.value = 'Aucun utilisateur connecté. Veuillez vous reconnecter.'
      }
    } catch (error) {
      console.error('Erreur lors de la détection de l\'utilisateur:', error.message)
      email.value = ''
      prefsError.value = `Erreur lors de la détection de l'utilisateur: ${error.message}`
    }
  } 
})

onMounted(() => { 
  try {
    console.log('Composant monté, détection de l\'utilisateur...')
    
    // Méthode de fallback pour détecter l'utilisateur
    let userEmail = ''
    
    try {
      // Essayer authState d'abord - éviter de logger l'objet réactif directement
      const user = currentUser.value
      console.log('Utilisateur depuis authState au montage:', user ? { email: user.email, uid: user.uid } : null)
      if (user && user.email) {
        userEmail = user.email
      }
    } catch (authStateError) {
      console.warn('Erreur avec authState au montage, fallback vers Firebase Auth:', authStateError.message)
    }
    
    // Fallback vers Firebase Auth si authState échoue
    if (!userEmail) {
      try {
        const firebaseUser = auth?.currentUser
        console.log('Utilisateur depuis Firebase Auth au montage:', firebaseUser ? { email: firebaseUser.email, uid: firebaseUser.uid } : null)
        if (firebaseUser && firebaseUser.email) {
          userEmail = firebaseUser.email
        }
      } catch (firebaseError) {
        console.warn('Erreur avec Firebase Auth au montage:', firebaseError.message)
      }
    }
    
    if (userEmail) {
      email.value = userEmail
      console.log('Email au montage:', email.value)
    } else {
      console.log('Aucun utilisateur au montage')
      email.value = ''
    }
    
    pushEnabledOnDevice.value = (typeof Notification !== 'undefined' && Notification.permission === 'granted' && !!localStorage.getItem('fcmToken'))
    
    // Écouter les changements d'état des notifications push
    window.addEventListener('pushStatusChanged', handlePushStatusChanged)
    
    // Démarrer la surveillance de la santé des notifications push
    startPushHealthCheck()
  } catch (error) {
    console.error('Erreur au montage:', error.message)
  }
})

onUnmounted(() => {
  // Nettoyer l'écouteur d'événements
  window.removeEventListener('pushStatusChanged', handlePushStatusChanged)
})
</script>
