<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4" @click="close">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-xl" @click.stop>
      <button @click="close" class="absolute right-3 top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">👤</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Mon compte</h2>
        <p class="text-sm text-gray-300">Gérez votre compte et vos préférences</p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center gap-2 mb-4">
        <button @click="activeTab='manage'" :class="tabClass('manage')">Gérer</button>
        <button @click="activeTab='notifications'" :class="tabClass('notifications')">Notifications</button>
        <button @click="activeTab='players'" :class="tabClass('players')">Joueurs</button>
      </div>

      <div class="space-y-3">

        <!-- Tab: Joueurs -->
        <div v-if="activeTab==='players'">
          <h3 class="text-white font-semibold mb-2">Mes joueurs associés</h3>
          <div v-if="associations.length === 0" class="text-sm text-gray-400">Aucun joueur associé pour le moment.</div>
          <ul v-else class="space-y-2">
            <li v-for="assoc in associations" :key="assocKey(assoc)" class="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300">
              <div class="flex items-center justify-between gap-3">
                <div class="truncate">
                  <div class="text-white font-semibold">{{ assoc.seasonName || assoc.seasonId || '—' }}</div>
                  <div class="text-gray-400 text-xs">Joueur : {{ assoc.playerName || '—' }}</div>
                </div>
                <button @click="$emit('manage-player', assoc)" class="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 text-xs">Gérer</button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Tab: Notifications -->
        <div v-else-if="activeTab==='notifications'" class="text-sm text-gray-300">
          <div class="p-3 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="prefs.notifyAvailability" class="w-4 h-4">
                <span>Recevoir les demandes de disponibilités</span>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="prefs.notifySelection" class="w-4 h-4">
                <span>Recevoir les emails de sélection</span>
              </label>
            </div>
            <div class="text-right">
              <button @click="savePrefs" :disabled="prefsLoading" class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">{{ prefsLoading ? '⏳' : 'Sauvegarder' }}</button>
            </div>
            <div v-if="prefsError" class="text-xs text-red-300">{{ prefsError }}</div>
            <div v-if="prefsSuccess" class="text-xs text-green-300">{{ prefsSuccess }}</div>
          </div>
        </div>

        <!-- Tab: Gérer -->
        <div v-else class="flex flex-col gap-3">
          <!-- Email editable -->
          <div class="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300">
            <label class="block text-xs text-gray-400 mb-2">Email</label>
            <div class="flex items-center gap-2">
              <input v-model="newEmail" type="email" class="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400" placeholder="nouvel@email.com" />
              <button @click="updateAccountEmail" :disabled="!canUpdateEmail || emailLoading" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ emailLoading ? '⏳' : 'Mettre à jour' }}
              </button>
            </div>
            <div v-if="emailError" class="mt-2 text-xs text-red-300">{{ emailError }}</div>
            <div v-if="emailSuccess" class="mt-2 text-xs text-green-300">{{ emailSuccess }}</div>
          </div>

          <div class="text-sm text-gray-400">Vous pouvez changer votre mot de passe pour sécuriser vos opérations sensibles.</div>
          <button @click="$emit('change-password')" class="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">Changer de mot de passe</button>
          <button @click="$emit('logout-device')" class="w-full px-4 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Déconnexion de cet appareil</button>
          <button @click="$emit('delete-account')" class="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-500">Supprimer mon compte</button>
        </div>
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
// import { verifyBeforeUpdateEmail } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { listAssociationsForEmail } from '../services/playerProtection.js'
import { setDoc } from 'firebase/firestore'
import { createAccountEmailUpdateLink } from '../services/magicLinks.js'
import { queueVerificationEmail } from '../services/emailService.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  seasonId: { type: String, default: null }
})

const emit = defineEmits(['close', 'manage-player', 'change-password', 'logout-device', 'delete-account'])

const email = ref('')
const associations = ref([])
const activeTab = ref('players')

function tabClass(tab) {
  return [
    'px-4 py-2 rounded-full text-sm transition-colors',
    activeTab.value === tab
      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
  ]
}

function assocKey(a) {
  return `${a.seasonId || 'global'}__${a.playerId}`
}

async function loadData() {
  try {
    email.value = auth?.currentUser?.email || ''
  } catch {}
  try {
    const raw = email.value ? await listAssociationsForEmail(email.value) : []
    // Enrichir avec le nom réel du joueur depuis la saison
    const enriched = []
    for (const a of raw) {
      let playerName = a.playerId
      try {
        if (a.seasonId) {
          const playerRef = doc(db, 'seasons', a.seasonId, 'players', a.playerId)
          const snap = await getDoc(playerRef)
          if (snap.exists()) playerName = snap.data().name || playerName
        }
      } catch {}
      enriched.push({ ...a, playerName })
    }
    associations.value = enriched
  } catch {
    associations.value = []
  }
}

function close() { emit('close') }

watch(() => props.show, (v) => { if (v) { loadData(); loadPrefs() } })
onMounted(() => { if (props.show) { loadData(); loadPrefs() } })

// Email update state
const newEmail = ref('')
const emailLoading = ref(false)
const emailError = ref('')
const emailSuccess = ref('')
const canUpdateEmail = ref(false)

watch(email, (v) => { newEmail.value = v || '' })
watch(newEmail, (v) => { canUpdateEmail.value = !!v && v.includes('@') && v !== email.value })

async function updateAccountEmail() {
  if (!canUpdateEmail.value) return
  emailLoading.value = true
  emailError.value = ''
  emailSuccess.value = ''
  try {
    // Générer un magic link custom et envoyer via notre pipeline email
    const link = await createAccountEmailUpdateLink({ currentEmail: email.value, newEmail: newEmail.value.trim() })
    await queueVerificationEmail({ toEmail: newEmail.value.trim(), verifyUrl: link.url, purpose: 'account_email_update', displayName: 'utilisateur' })
    emailSuccess.value = `Un email de vérification a été envoyé à ${newEmail.value.trim()}. Cliquez sur le lien pour confirmer le changement.`
  } catch (e) {
    emailError.value = (e?.code === 'auth/requires-recent-login')
      ? 'Veuillez vous reconnecter pour modifier votre email'
      : 'Impossible de mettre à jour l\'email'
  } finally {
    emailLoading.value = false
  }
}

// Preferences state
const prefs = ref({ notifyAvailability: true, notifySelection: true })
const prefsLoading = ref(false)
const prefsError = ref('')
const prefsSuccess = ref('')

async function loadPrefs() {
  try {
    if (!email.value) return
    const prefRef = doc(db, 'userPreferences', email.value)
    const snap = await getDoc(prefRef)
    if (snap.exists()) {
      const data = snap.data() || {}
      prefs.value.notifyAvailability = data.notifyAvailability !== false
      prefs.value.notifySelection = data.notifySelection !== false
    } else {
      prefs.value = { notifyAvailability: true, notifySelection: true }
    }
  } catch {}
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
</script>


