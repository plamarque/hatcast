<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔒</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Protection du joueur</h2>
        <p class="text-lg text-gray-300">{{ player?.name }}</p>
      </div>

      <!-- État de protection -->
      <div class="mb-6">
        <div class="flex items-center justify-between p-4 rounded-lg" :class="isProtected ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-500/20 border border-gray-500/30'">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ isProtected ? '🔒' : '🔓' }}</span>
            <div>
              <div class="font-semibold text-white">{{ isProtected ? 'Protégé' : 'Non protégé' }}</div>
              <div class="text-sm text-gray-300">{{ isProtected ? 'Modifications sécurisées' : 'Modifications libres' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Explication de la protection -->
      <div class="mb-6">
        <button 
          @click="showExplanation = !showExplanation"
          class="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-between"
        >
          <h3 class="text-sm font-semibold text-blue-300">💡 Pourquoi protéger son joueur ?</h3>
          <span class="text-blue-300 transition-transform duration-200" :class="{ 'rotate-180': showExplanation }">▼</span>
        </button>
        <div 
          v-if="showExplanation"
          class="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-gray-300 space-y-1"
        >
          <div>• <span class="text-blue-300">Protection des disponibilités :</span> Seul vous pouvez modifier vos disponibilités</div>
          <div>• <span class="text-blue-300">Protection du nom :</span> Seul vous pouvez changer votre nom de joueur</div>
          <div>• <span class="text-blue-300">Email requis :</span> Permet de réinitialiser le mot de passe en cas d'oubli et de recevoir des notifications quand des changements surviennent</div>
          <div>• <span class="text-blue-300">Confort de saisie :</span> après authentification par mot de passe, votre ligne est automatiquement remontée en haut de la grille sur cet appareil, pour un accès plus rapide</div>
        </div>
      </div>

      <!-- Flow pas à pas -->
      <div v-if="!isProtected" class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-4">🔐 Activer la protection</h3>
        <!-- Indicateur d'étapes -->
        <div class="flex items-center justify-center gap-3 mb-4 text-sm">
          <div :class="['px-3 py-1 rounded-full border', step === 1 ? 'bg-blue-500/20 border-blue-400 text-blue-200' : 'bg-green-500/20 border-green-400 text-green-200']">1. Email</div>
          <div class="text-gray-400">→</div>
          <div :class="['px-3 py-1 rounded-full border', step === 2 ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200' : step > 2 ? 'bg-green-500/20 border-green-400 text-green-200' : 'bg-gray-500/20 border-gray-400 text-gray-200']">2. Mot de passe</div>
        </div>
        <!-- Etape 1: Email -->
        <div v-if="step === 1" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Adresse email</label>
            <input
              v-model="email"
              type="email"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="votre@email.com"
            >
          </div>
          <button
            @click="sendVerificationEmail"
            :disabled="!validEmail || loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span v-if="loading" class="animate-spin">⏳</span>
            <span v-else>✉️</span>
            <span>{{ loading ? 'Envoi...' : 'Envoyer le lien de vérification' }}</span>
          </button>
          <div v-if="verificationSent" class="text-sm text-gray-300">
            Un email de vérification a été envoyé. Cliquez sur le lien reçu, puis revenez ici.
          </div>
        </div>

        <!-- Etape 2: Mot de passe + activation -->
        <div v-else-if="step === 2" class="space-y-4">
          <div v-if="showVerifiedBanner" class="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 text-sm flex items-center gap-2">
            <span>✅</span>
            <span>Adresse email vérifiée</span>
            <button
              type="button"
              @click="restartEmailStep"
              title="Changer d'adresse email"
              class="ml-auto px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >✏️</button>
          </div>
          <div class="text-sm text-gray-300">Définissez maintenant votre mot de passe.</div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Mot de passe sécurisé (min. 6 caractères)"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Confirmer le mot de passe"
            >
          </div>
          <button
            @click="activateProtection"
            :disabled="!passwordsValid || loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin">⏳</span>
            <span v-else>🔒</span>
            <span>{{ loading ? 'Activation...' : 'Activer la protection' }}</span>
          </button>
        </div>
        
      </div>

      <!-- Désactiver la protection -->
      <div v-if="isProtected" class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-4">🔓 Désactiver la protection</h3>
        <p class="text-sm text-gray-300 mb-4">
          Attention : désactiver la protection supprimera définitivement le mot de passe et l'email associés.
        </p>
        
        <!-- Formulaire de vérification pour désactiver -->
        <div v-if="showDeactivateForm" class="space-y-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe de confirmation</label>
            <input
              v-model="deactivatePassword"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Entrez le mot de passe pour confirmer"
            >
          </div>
          <button
            @click="confirmDeactivateProtection"
            :disabled="!deactivatePassword || loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span v-if="loading" class="animate-spin">⏳</span>
            <span v-else>🔓</span>
            <span>{{ loading ? 'Désactivation...' : 'Confirmer la désactivation' }}</span>
          </button>
          <button
            @click="showDeactivateForm = false"
            class="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
          >
            Annuler
          </button>
        </div>
        
        <!-- Bouton pour commencer la désactivation -->
        <button
          v-if="!showDeactivateForm"
          @click="startDeactivateProtection"
          :disabled="loading"
          class="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span>🔓</span>
          <span>Désactiver la protection</span>
        </button>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ error }}</div>
      </div>

      <!-- Messages de succès -->
      <div v-if="success" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="text-green-300 text-sm">{{ success }}</div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center">
        <button
          @click="closeModal"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { protectPlayer, unprotectPlayer, isPlayerProtected, verifyPlayerPassword, getPlayerEmail, startEmailVerificationForProtection } from '../services/playerProtection.js'
import logger from '../services/logger.js'
import { queueProtectionVerificationEmail } from '../services/emailService.js'
import { useRoute } from 'vue-router'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  player: {
    type: Object,
    default: null
  },
  seasonId: {
    type: String,
    default: null
  },
  onboarding: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update', 'onboarding-finished'])

const isProtected = ref(false)
const step = ref(1) // 1 email, 2 password
const email = ref('')
const verifiedEmail = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const showExplanation = ref(false)
const showDeactivateForm = ref(false)
const deactivatePassword = ref('')
const verificationSent = ref(false)
const showVerifiedBanner = ref(false)
const route = useRoute()

const validEmail = computed(() => email.value && email.value.includes('@'))
const passwordsValid = computed(() => password.value && confirmPassword.value && password.value === confirmPassword.value && password.value.length >= 6)

// Vérifier l'état de protection au chargement
async function checkProtectionStatus() {
  if (props.player?.id) {
    isProtected.value = await isPlayerProtected(props.player.id, props.seasonId)
    if (!isProtected.value) {
      // Ne pas pré-remplir l'email pour confidentialité
      email.value = ''
      // Charger données protection pour récupérer l'email vérifié en interne
      try {
        const data = await (await import('../services/playerProtection.js')).getPlayerProtectionData(props.player.id, props.seasonId)
        verifiedEmail.value = data?.email || ''
        const verified = !!data?.emailVerifiedAt
        step.value = verified ? 2 : 1
        // Afficher la bannière uniquement si on revient du magic link
        const fromVerified = route.query?.verified === '1'
        showVerifiedBanner.value = fromVerified && verified
      } catch {
        verifiedEmail.value = ''
        step.value = 1
        showVerifiedBanner.value = false
      }
    }
  }
}

async function hasVerifiedEmail() {
  try {
    const data = await (await import('../services/playerProtection.js')).getPlayerProtectionData(props.player.id, props.seasonId)
    verifiedEmail.value = data?.email || ''
    const fromVerified = route.query?.verified === '1'
    showVerifiedBanner.value = !!fromVerified
    return !!data?.email && !!data?.emailVerifiedAt
  } catch {
    verifiedEmail.value = ''
    return false
  }
}

// Etape 1 -> envoyer le mail de vérification
async function sendVerificationEmail() {
  if (!validEmail.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    // Crée le lien de vérif et envoie l'email
    const res = await startEmailVerificationForProtection({ playerId: props.player.id, email: email.value.trim(), seasonId: props.seasonId })
    // Ajouter le contexte de redirection (slug + player + open)
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

// Recommencer à l'étape email (permet de saisir une autre adresse)
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

// Activer la protection
async function activateProtection() {
  if (!passwordsValid.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const emailToUse = verifiedEmail.value || email.value
    if (!emailToUse) {
      throw new Error('Adresse email manquante')
    }
    await protectPlayer(props.player.id, emailToUse, password.value, props.seasonId)
    success.value = 'Protection activée avec succès !'
    isProtected.value = true
    
    // Réinitialiser le formulaire
    email.value = ''
    verifiedEmail.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    emit('update')
    // Fin d'onboarding si demandé
    try {
      if (props.onboarding) emit('onboarding-finished')
    } catch {}
  } catch (err) {
    logger.error('Erreur lors de l\'activation de la protection', err)
    if (err.message && err.message.includes('email')) {
      error.value = 'Cette adresse email est déjà utilisée par un autre joueur.'
    } else {
      error.value = 'Erreur lors de l\'activation de la protection. Veuillez réessayer.'
    }
  } finally {
    loading.value = false
  }
}

// Commencer la désactivation (afficher le formulaire de vérification)
function startDeactivateProtection() {
  showDeactivateForm.value = true
  deactivatePassword.value = ''
  error.value = ''
}

// Confirmer la désactivation avec vérification du mot de passe
async function confirmDeactivateProtection() {
  if (!deactivatePassword.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Vérifier le mot de passe avant de désactiver
    const isValid = await verifyPlayerPassword(props.player.id, deactivatePassword.value, props.seasonId)
    
    if (!isValid) {
      error.value = 'Mot de passe incorrect. Veuillez réessayer.'
      return
    }
    
    // Mot de passe correct, désactiver la protection
    const result = await unprotectPlayer(props.player.id, props.seasonId)
    success.value = 'Protection désactivée avec succès !'
    isProtected.value = false
    showDeactivateForm.value = false
    deactivatePassword.value = ''
    
    // Pré-remplir l'email avec celui qui était sauvegardé
    if (result.email) {
      email.value = result.email
    }
    
    emit('update')
  } catch (err) {
    logger.error('Erreur lors de la désactivation de la protection', err)
    error.value = 'Erreur lors de la désactivation de la protection. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

// Désactiver la protection (ancienne fonction, gardée pour compatibilité)
async function deactivateProtection() {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    await unprotectPlayer(props.player.id, props.seasonId)
    success.value = 'Protection désactivée avec succès !'
    isProtected.value = false
    emit('update')
  } catch (err) {
    logger.error('Erreur lors de la désactivation de la protection', err)
    error.value = 'Erreur lors de la désactivation de la protection. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

function closeModal() {
  emit('close')
}

// Surveiller les changements de joueur
watch(() => props.player, () => {
  if (props.show && props.player) {
    checkProtectionStatus()
  }
}, { immediate: true })

// Surveiller l'ouverture de la modal
watch(() => props.show, (newValue) => {
  if (newValue && props.player) {
    // Réinitialiser les champs (sauf email qui sera chargé par checkProtectionStatus)
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    error.value = ''
    success.value = ''
    showExplanation.value = false
    showDeactivateForm.value = false
    deactivatePassword.value = ''
    step.value = 1
    verificationSent.value = false
    
    // Vérifier l'état de protection et charger l'email si nécessaire
    checkProtectionStatus()
    // Si onboarding, mettre en avant le flux email -> mot de passe
    if (props.onboarding) {
      nextTick(() => {
        // Rien de bloquant ici; on pourrait poser des coachmarks si besoin
      })
    }
  }
})
</script>
