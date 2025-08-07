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
          <div>• <span class="text-blue-300">Email requis :</span> Permet de réinitialiser le mot de passe en cas d'oubli</div>
        </div>
      </div>

      <!-- Formulaire de protection -->
      <div v-if="!isProtected" class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-4">🔐 Activer la protection</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Adresse email</label>
            <input
              v-model="email"
              type="email"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="votre@email.com"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Mot de passe sécurisé"
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
        </div>
        <button
          @click="activateProtection"
          :disabled="!canActivateProtection || loading"
          class="w-full mt-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>🔒</span>
          <span>{{ loading ? 'Activation...' : 'Activer la protection' }}</span>
        </button>
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
import { ref, computed, watch } from 'vue'
import { protectPlayer, unprotectPlayer, isPlayerProtected, verifyPlayerPassword, getPlayerEmail } from '../services/playerProtection.js'

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
  }
})

const emit = defineEmits(['close', 'update'])

const isProtected = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const showExplanation = ref(false)
const showDeactivateForm = ref(false)
const deactivatePassword = ref('')

const canActivateProtection = computed(() => {
  return email.value && 
         password.value && 
         confirmPassword.value && 
         password.value === confirmPassword.value &&
         password.value.length >= 6 &&
         email.value.includes('@')
})

// Vérifier l'état de protection au chargement
async function checkProtectionStatus() {
  if (props.player?.id) {
    isProtected.value = await isPlayerProtected(props.player.id, props.seasonId)
    
    // Charger l'email si le joueur n'est pas protégé
    if (!isProtected.value) {
      const playerEmail = await getPlayerEmail(props.player.id, props.seasonId)
      if (playerEmail) {
        email.value = playerEmail
      }
    }
  }
}

// Activer la protection
async function activateProtection() {
  if (!canActivateProtection.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    await protectPlayer(props.player.id, email.value, password.value, props.seasonId)
    success.value = 'Protection activée avec succès !'
    isProtected.value = true
    
    // Réinitialiser le formulaire
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    emit('update')
  } catch (err) {
    console.error('Erreur lors de l\'activation de la protection:', err)
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
    console.error('Erreur lors de la désactivation de la protection:', err)
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
    console.error('Erreur lors de la désactivation de la protection:', err)
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
    password.value = ''
    confirmPassword.value = ''
    error.value = ''
    success.value = ''
    showExplanation.value = false
    showDeactivateForm.value = false
    deactivatePassword.value = ''
    
    // Vérifier l'état de protection et charger l'email si nécessaire
    checkProtectionStatus()
  }
})
</script>
