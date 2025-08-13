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

      <div class="space-y-3">
        <!-- Contenu principal : Gestion du compte -->
        <div class="flex flex-col gap-3">
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
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { createAccountEmailUpdateLink } from '../services/magicLinks.js'
import { queueVerificationEmail } from '../services/emailService.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  seasonId: { type: String, default: null }
})

const emit = defineEmits(['close', 'manage-player', 'change-password', 'logout-device', 'delete-account'])

const email = ref('')

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

function close() { emit('close') }

watch(() => props.show, (v) => { 
  if (v) { 
    try {
      email.value = auth?.currentUser?.email || ''
    } catch {}
  } 
})
onMounted(() => { 
  if (props.show) { 
    try {
      email.value = auth?.currentUser?.email || ''
    } catch {}
  } 
})
</script>


