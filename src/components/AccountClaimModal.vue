<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[160] p-4" @click="$emit('close')">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <button
        @click="$emit('close')"
        class="absolute right-3 top-3 text-white/80 hover:text-white"
        aria-label="Fermer"
        title="Fermer"
      >
        ✖️
      </button>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">👤</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-1">Associer un compte</h2>
        <p class="text-sm text-gray-300">Pour sécuriser les saisies de {{ player?.name }}</p>
      </div>

      <div v-if="step === 1" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Adresse email</label>
          <input v-model="email" type="email" class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400" placeholder="votre@email.com">
        </div>
        <div v-if="verificationSent" class="text-sm text-gray-300">Un email a été envoyé à {{ email }}. Cliquez sur le lien contenu dans l'email pour continuer.</div>
      </div>

      <div v-else-if="step === 2" class="space-y-4">
        <div class="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 text-sm flex items-center gap-2">
          <span>✅</span>
          <span>Adresse email vérifiée</span>
          <button type="button" @click="restartEmailStep" title="Changer d'adresse email" class="ml-auto px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors">✏️</button>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
          <input v-model="password" type="password" class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400" placeholder="Mot de passe sécurisé (min. 6 caractères)">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
          <input v-model="confirmPassword" type="password" class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400" placeholder="Confirmer le mot de passe">
        </div>
        <button @click="activateProtection" :disabled="!passwordsValid || loading" class="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>🔒</span>
          <span>{{ loading ? 'Association...' : 'Associer ce joueur' }}</span>
        </button>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{{ error }}</div>

      <div class="mt-6 flex justify-center gap-3">
        <button @click="$emit('close')" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">Fermer</button>
        <button v-if="step === 1" @click="sendVerificationEmail" :disabled="!validEmail || loading" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>✉️</span>
          <span>{{ loading ? 'Envoi...' : 'Envoyer le lien de vérification' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { startEmailVerificationForProtection, protectPlayer, getPlayerProtectionData, clearEmailVerificationForProtection } from '../services/playerProtection.js'
import { queueProtectionVerificationEmail } from '../services/emailService.js'
import { useRoute } from 'vue-router'

const props = defineProps({
  show: { type: Boolean, default: false },
  player: { type: Object, default: null },
  seasonId: { type: String, default: null }
})

const emit = defineEmits(['close', 'success'])

const step = ref(1)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const verificationSent = ref(false)
const route = useRoute()

const validEmail = computed(() => email.value && email.value.includes('@'))
const passwordsValid = computed(() => password.value && confirmPassword.value && password.value === confirmPassword.value && password.value.length >= 6)

async function sendVerificationEmail() {
  if (!validEmail.value || !props.player?.id) return
  loading.value = true
  error.value = ''
  try {
    // Toujours envoyer le lien de vérification, même si l'email existe déjà
    const res = await startEmailVerificationForProtection({ playerId: props.player.id, email: email.value.trim(), seasonId: props.seasonId })
    const slug = route.params?.slug
    const verifyUrl = `${res.url}${slug ? `&slug=${encodeURIComponent(slug)}` : ''}&player=${encodeURIComponent(props.player.id)}&open=protection`
    await queueProtectionVerificationEmail({ toEmail: email.value, playerName: props.player?.name || 'joueur', verifyUrl })
    verificationSent.value = true
  } catch (e) {
    // En cas d'erreur non bloquante, afficher un message générique
    error.value = 'Impossible d\'envoyer l\'email de vérification'
  } finally {
    loading.value = false
  }
}

async function restartEmailStep() {
  try {
    await clearEmailVerificationForProtection({ playerId: props.player.id, seasonId: props.seasonId })
  } catch {}
  step.value = 1
  verificationSent.value = false
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

async function refreshVerificationStatus() {
  try {
    const data = await getPlayerProtectionData(props.player?.id, props.seasonId)
    if (data?.email && data?.emailVerifiedAt) {
      step.value = 2
    } else {
      step.value = 1
    }
  } catch {
    step.value = 1
  }
}

onMounted(() => { refreshVerificationStatus() })
watch(() => props.show, (v) => { if (v) refreshVerificationStatus() })

async function activateProtection() {
  if (!passwordsValid.value) return
  loading.value = true
  error.value = ''
  try {
    await protectPlayer(props.player.id, email.value.trim(), password.value, props.seasonId)
    emit('success')
  } catch (e) {
    error.value = e?.message || 'Erreur lors de l\'association'
  } finally {
    loading.value = false
  }
}
</script>


