<template>
  <!-- Contenu migré depuis l'ancien PlayerProtectionModal.vue -->
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click="closeModal">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <button
        @click="closeModal"
        class="absolute right-3 top-3 text-white/80 hover:text-white"
        aria-label="Fermer"
        title="Fermer"
      >
        ✖️
      </button>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔒</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">{{ isProtected ? 'Déverrouiller les disponibilités' : 'Verrouiller ce joueur' }}</h2>
        <p class="text-lg text-gray-300">{{ player?.name }}</p>
      </div>

      <!-- État d'association / compte -->
      <div class="mb-6">
        <div class="flex items-center justify-between p-4 rounded-lg" :class="isProtected ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ isProtected ? '🔒' : '🔓' }}</span>
            <div>
              <div class="font-semibold text-white">
                {{ isProtected
                  ? (isOwner ? 'Joueur associé à votre compte' : 'Ce joueur est associé à un compte utilisateur')
                  : 'Joueur sans compte' }}
              </div>
              <div class="text-sm text-gray-300">
                {{ isProtected
                  ? (isOwner ? 'Seul vous pouvez modifier' : 'Seul le titulaire peut modifier les disponibilités')
                  : 'Tout le monde peut modifier les disponibilités' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <!-- CTA vers la création de compte -->
      <div v-if="!isProtected" class="mb-6">
        <div class="text-sm text-gray-300">Vous pouvez protéger vos saisies de disponibilités avec un compte utilisateur.</div>
      </div>

      <!-- Dissocier: le formulaire s'affiche à la demande -->

      <!-- Messages d'erreur -->
      <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ error }}</div>
      </div>

      <!-- Messages de succès -->
      <div v-if="success" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="text-green-300 text-sm">{{ success }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <button
          @click="closeModal"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
        <button
          v-if="!isProtected"
          @click="showAccountClaim = true"
          class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
        >
          Associer un compte
        </button>
        <button
          v-else-if="!showDeactivateForm"
          @click="startDeactivateProtection"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          🔓 Dissocier
        </button>
      </div>
      
      <!-- Formulaire de dissociation -->
      <div v-if="isProtected && showDeactivateForm" class="space-y-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe de confirmation</label>
          <input
            v-model="deactivatePassword"
            type="password"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Entrez le mot de passe pour confirmer"
          >
        </div>
        <div class="flex gap-3 justify-center">
          <button
            @click="confirmDeactivateProtection"
            :disabled="!deactivatePassword || loading"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Dissociation...' : 'Confirmer' }}
          </button>
          <button
            @click="showDeactivateForm = false"
            class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
          >
            Annuler
          </button>
        </div>
      </div>
      
      <!-- Explication: pourquoi créer un compte ? -->
      <div v-if="!isProtected" class="mt-4">
        <button 
          @click="showExplanation = !showExplanation"
          class="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-between"
        >
          <h3 class="text-sm font-semibold text-blue-300">💡 A quoi sert un compte ?</h3>
          <span class="text-blue-300 transition-transform duration-200" :class="{ 'rotate-180': showExplanation }">▼</span>
        </button>
        <div 
          v-if="showExplanation"
          class="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-gray-300 space-y-2"
        >
          <div class="text-gray-300">Vous pouvez continuer à utiliser cette application sans compte, mais avec un compte, vous bénéficiez de nombreux avantages.</div>
          <div>• <span class="text-blue-300">Protéger vos saisies :</span> vous seul pourrez modifier les disponibilités de ce joueur</div>
          <div>• <span class="text-blue-300">Notifications :</span> recevez des emails lorsqu'il y a de nouvelles sélections</div>
          <div>• <span class="text-blue-300">Confort :</span> votre joueur reste toujours en haut de la liste</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal de création de compte / claim -->
  <AccountClaimModal
    :show="showAccountClaim"
    :player="player"
    :season-id="seasonId"
    @close="showAccountClaim = false"
    @success="handleClaimSuccess"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { unprotectPlayer, isPlayerProtected, verifyPlayerPassword } from '../services/playerProtection.js'
import { useRoute } from 'vue-router'
import AccountClaimModal from './AccountClaimModal.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  player: { type: Object, default: null },
  seasonId: { type: String, default: null },
  onboarding: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'update', 'onboarding-finished'])

const isProtected = ref(false)
const isOwner = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')
const showExplanation = ref(false)
const showDeactivateForm = ref(false)
const deactivatePassword = ref('')
const showAccountClaim = ref(false)
const route = useRoute()

const validEmail = computed(() => false)
const passwordsValid = computed(() => false)

function handleClaimSuccess() {
  success.value = 'Compte créé et joueur associé !'
  isProtected.value = true
  showAccountClaim.value = false
  emit('update')
}

async function checkProtectionStatus() {
  if (props.player?.id) {
    isProtected.value = await isPlayerProtected(props.player.id, props.seasonId)
    // Heuristique propriétaire: si un mot de passe a été validé récemment (session), considérer comme owner
    try {
      const { isPlayerPasswordCached } = await import('../services/playerProtection.js')
      isOwner.value = isPlayerPasswordCached(props.player.id)
    } catch { isOwner.value = false }
  }
}

async function sendVerificationEmail() {
  if (!validEmail.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await startEmailVerificationForProtection({ playerId: props.player.id, email: email.value.trim(), seasonId: props.seasonId })
    const slug = route.params?.slug
    const verifyUrl = `${res.url}${slug ? `&slug=${encodeURIComponent(slug)}` : ''}&player=${encodeURIComponent(props.player.id)}&open=protection`
    await queueProtectionVerificationEmail({ toEmail: email.value, playerName: props.player?.name || 'joueur', verifyUrl })
    verificationSent.value = true
  } catch (e) {
    logger.error('Erreur envoi email de vérification protection', e)
    error.value = e?.message || 'Impossible d\'envoyer l\'email de vérification'
  } finally {
    loading.value = false
  }
}

async function restartEmailStep() {
  try {
    const { clearEmailVerificationForProtection } = await import('../services/playerProtection.js')
    await clearEmailVerificationForProtection({ playerId: props.player.id, seasonId: props.seasonId })
  } catch {}
  step.value = 1
  verificationSent.value = false
  showVerifiedBanner.value = false
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

async function activateProtection() {
  if (!passwordsValid.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const emailToUse = verifiedEmail.value || email.value
    if (!emailToUse) throw new Error('Adresse email manquante')
    await protectPlayer(props.player.id, emailToUse, password.value, props.seasonId)
    success.value = 'Protection activée avec succès !'
    isProtected.value = true
    email.value = ''
    verifiedEmail.value = ''
    password.value = ''
    confirmPassword.value = ''
    emit('update')
    try { if (props.onboarding) emit('onboarding-finished') } catch {}
  } catch (err) {
    logger.error('Erreur lors de l\'activation de la protection', err)
    if (err.message && err.message.includes('email')) error.value = 'Cette adresse email est déjà utilisée par un autre joueur.'
    else error.value = 'Erreur lors de l\'activation de la protection. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

function startDeactivateProtection() {
  showDeactivateForm.value = true
  deactivatePassword.value = ''
  error.value = ''
}

async function confirmDeactivateProtection() {
  if (!deactivatePassword.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const isValid = await verifyPlayerPassword(props.player.id, deactivatePassword.value, props.seasonId)
    if (!isValid) { error.value = 'Mot de passe incorrect. Veuillez réessayer.'; return }
    const result = await unprotectPlayer(props.player.id, props.seasonId)
    success.value = 'Protection désactivée avec succès !'
    isProtected.value = false
    showDeactivateForm.value = false
    deactivatePassword.value = ''
    if (result.email) { email.value = result.email }
    emit('update')
  } catch (err) {
    logger.error('Erreur lors de la désactivation de la protection', err)
    error.value = 'Erreur lors de la désactivation de la protection. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

function closeModal() { emit('close') }

watch(() => props.player, () => { if (props.show && props.player) { checkProtectionStatus() } }, { immediate: true })

watch(() => props.show, (newValue) => {
  if (newValue && props.player) {
    error.value = ''
    success.value = ''
    showExplanation.value = false
    showDeactivateForm.value = false
    deactivatePassword.value = ''
    checkProtectionStatus()
    if (props.onboarding) { nextTick(() => {}) }
  }
})
</script>



