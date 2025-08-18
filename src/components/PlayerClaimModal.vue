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
        <h2 class="text-2xl font-bold text-white mb-2">{{ isProtected ? 'Désactiver la protection' : 'Protège tes saisies' }}</h2>
      </div>

      <!-- État d'association / compte -->
      <div class="mb-6">
        <div class="flex items-center justify-between p-4 rounded-lg" :class="isProtected ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ isProtected ? '🔒' : '🔓' }}</span>
            <div>
              <div class="font-semibold text-white">
                {{ isProtected
                              ? (isOwner ? `${player?.name} est associée à votre compte` : `${player?.name} est associée à un compte utilisateur`)
            : `${player?.name} n'a pas de compte` }}
              </div>
              <div class="text-sm text-gray-300">
                {{ isProtected
                  ? (isOwner ? 'Seul vous pouvez modifier' : 'Seul le titulaire peut modifier les disponibilités')
                  : 'Tout le monde peut modifier ses disponibilités 😱' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <!-- CTA vers la création de compte -->
      <div v-if="!isProtected" class="mb-6">
        <div class="text-sm text-gray-300">Si tu es bien {{ player?.name }}, tu peux protéger tes saisies à l'aide d'un compte utilisateur.</div>
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
          v-if="!isProtected"
          @click="showAccountClaim = true"
          class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
        >
          C'est moi !
        </button>
        <button
          v-else
          @click="startDeactivateProtection"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          🔓 Continuer
        </button>
        <button
          @click="closeModal"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Annuler
        </button>
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

  <!-- Modal de vérification du mot de passe -->
  <PasswordVerificationModal
    :show="showPasswordVerification"
    :player="player"
    :seasonId="seasonId"
    @close="showPasswordVerification = false"
    @verified="handlePasswordVerified"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { unprotectPlayer, isPlayerProtected, isPlayerPasswordCached, getPlayerProtectionData } from '../services/playerProtection.js'
import { useRoute } from 'vue-router'
import AccountClaimModal from './AccountClaimModal.vue'
import PasswordVerificationModal from './PasswordVerificationModal.vue'


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
// Hint state is now inside AccountBenefitsHint component
const showAccountClaim = ref(false)
const route = useRoute()
const showPasswordVerification = ref(false)

const validEmail = computed(() => false)
const passwordsValid = computed(() => false)

async function handleClaimSuccess(data) {
  success.value = 'Compte créé et personne associée !'
  isProtected.value = true
  showAccountClaim.value = false
  
  // Connecter automatiquement l'utilisateur après l'association
  if (data?.email && data?.password) {
    try {
      // Stocker l'email pour pré-remplir dans la modale "Ne rate rien"
      localStorage.setItem('prefilledEmail', data.email)
      
      // Connecter l'utilisateur avec Firebase Auth
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('../services/firebase.js')
      
      await signInWithEmailAndPassword(auth, data.email, data.password)
      
      // Émettre un événement pour informer le parent que l'utilisateur est connecté
      emit('update', { 
        action: 'protection_activated',
        email: data.email,
        playerId: props.player?.id
      })
      
      console.log('✅ Utilisateur connecté automatiquement après activation de la protection')
    } catch (error) {
      console.error('Erreur lors de la connexion automatique:', error)
      // En cas d'erreur, on continue normalement
    }
  }
  
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
            await queueProtectionVerificationEmail({ toEmail: email.value, playerName: props.player?.name || 'personne', verifyUrl })
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
            if (err.message && err.message.includes('email')) error.value = 'Cette adresse email est déjà utilisée par une autre personne.'
    else error.value = 'Erreur lors de l\'activation de la protection. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

function startDeactivateProtection() {
  error.value = ''
  // Si le mot de passe du joueur est déjà en cache, on peut dissocier directement
  try {
    if (props.player?.id && isPlayerPasswordCached(props.player.id)) {
      performUnprotect()
      return
    }
  } catch {}
  // Sinon, ouvrir la modal standard de vérification (gère aussi le PIN et MDP oublié)
  showPasswordVerification.value = true
}

async function performUnprotect() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const result = await unprotectPlayer(props.player.id, props.seasonId)
            success.value = 'Protection désactivée!'
    isProtected.value = false
    if (result.email) { email.value = result.email }
    emit('update')
  } catch (err) {
    logger.error('Erreur lors de la désactivation de la protection', err)
    error.value = 'Erreur lors de la désactivation de la protection. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

function handlePasswordVerified() {
  showPasswordVerification.value = false
  performUnprotect()
}

function closeModal() { emit('close') }

watch(() => props.player, () => { if (props.show && props.player) { checkProtectionStatus() } }, { immediate: true })

watch(() => props.show, (newValue) => {
  if (newValue && props.player) {
    error.value = ''
    success.value = ''
    showPasswordVerification.value = false
    checkProtectionStatus()
    if (props.onboarding) { nextTick(() => {}) }
  }
})
</script>



