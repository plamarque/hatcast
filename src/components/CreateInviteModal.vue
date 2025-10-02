<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-white">
          {{ mode === 'invite' ? 'Inviter un utilisateur' : 'Créer un Participant' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Toggle Mode -->
      <div class="flex bg-gray-700 rounded-lg p-1 mb-6">
        <button
          @click="mode = 'create'"
          :class="mode === 'create' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'"
          class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Créer un Participant
        </button>
        <button
          @click="mode = 'invite'"
          :class="mode === 'invite' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'"
          class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Inviter un utilisateur
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Prénom (mode invite) / Nom (mode create) -->
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-300 mb-2">
            {{ mode === 'invite' ? 'Prénom' : 'Nom' }} <span class="text-red-400">*</span>
          </label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :placeholder="mode === 'invite' ? 'Prénom' : 'Nom du participant'"
            :disabled="isLoading"
          />
        </div>

        <!-- Nom (uniquement en mode invite) -->
        <div v-if="mode === 'invite'">
          <label for="lastName" class="block text-sm font-medium text-gray-300 mb-2">
            Nom <span class="text-red-400">*</span>
          </label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Nom"
            :disabled="isLoading"
          />
        </div>

        <!-- Email (uniquement en mode invite) -->
        <div v-if="mode === 'invite'">
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email <span class="text-red-400">*</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="email@example.com"
            :disabled="isLoading"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-400">{{ emailError }}</p>
        </div>

        <!-- Genre -->
        <div>
          <label for="gender" class="block text-sm font-medium text-gray-300 mb-2">
            Genre (optionnel)
          </label>
          <select
            id="gender"
            v-model="form.gender"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :disabled="isLoading"
          >
            <option value="unknown">Non spécifié</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
        </div>

        <!-- Joueur associé (uniquement en mode invite) -->
        <div v-if="mode === 'invite'">
          <label for="linkedPlayerId" class="block text-sm font-medium text-gray-300 mb-2">
            Joueur associé (optionnel)
          </label>
          <select
            id="linkedPlayerId"
            v-model="form.linkedPlayerId"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :disabled="isLoading"
          >
            <option value="">Aucun joueur spécifique</option>
            <option
              v-for="player in availablePlayers"
              :key="player.id"
              :value="player.id"
            >
              {{ player.name }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-400">
            Si aucun joueur n'est sélectionné, un joueur sera créé automatiquement à l'acceptation de l'invitation.
          </p>
        </div>

        <!-- Option envoi email (uniquement en mode invite) -->
        <div v-if="mode === 'invite'" class="flex items-center space-x-3">
          <input
            id="sendEmail"
            v-model="form.sendEmail"
            type="checkbox"
            class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            :disabled="isLoading"
          />
          <label for="sendEmail" class="text-sm text-gray-300">
            Envoyer l'invitation par email maintenant
          </label>
        </div>

        <!-- Messages d'erreur/succès -->
        <div v-if="errorMessage" class="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
          <p class="text-red-300 text-sm">{{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="p-3 bg-green-900/50 border border-green-500/50 rounded-lg">
          <p class="text-green-300 text-sm">{{ successMessage }}</p>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            :disabled="isLoading"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            :disabled="isLoading || !isFormValid"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Création...' : (mode === 'invite' ? 'Créer & Inviter' : 'Créer le participant') }}
          </button>
        </div>
      </form>

      <!-- Lien partageable après création (uniquement en mode invite) -->
      <div v-if="shareableLink && mode === 'invite'" class="mt-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
        <h3 class="text-sm font-medium text-blue-300 mb-2">Lien d'invitation créé !</h3>
        <div class="flex space-x-2">
          <input
            :value="shareableLink"
            readonly
            class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          <button
            @click="copyLink"
            class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            {{ linkCopied ? 'Copié !' : 'Copier' }}
          </button>
        </div>
        <p class="mt-2 text-xs text-blue-300">
          Tu peux partager ce lien directement (WhatsApp, SMS, etc.) - l'invitation fonctionnera même sans email.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createInvite, linkExistingUserToSeasonAndPlayers } from '../services/users.js'
import { loadPlayers } from '../services/storage.js'
import logger from '../services/logger.js'

// Props
const props = defineProps({
  show: { type: Boolean, default: false },
  seasonId: { type: String, required: true },
  seasonName: { type: String, required: true },
  createdBy: { type: String, required: true }
})

// Emits
const emit = defineEmits(['close', 'invitation-created'])

// Mode de la modale
const mode = ref('create') // 'create' ou 'invite'

// État du formulaire
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  gender: 'unknown',
  linkedPlayerId: '',
  sendEmail: true
})

// État de l'interface
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailError = ref('')
const shareableLink = ref('')
const linkCopied = ref(false)
const availablePlayers = ref([])

// Validation du formulaire
const isFormValid = computed(() => {
  if (mode.value === 'invite') {
    // Mode invite : prénom, nom et email requis
    return form.value.firstName.trim() && 
           form.value.lastName.trim() && 
           form.value.email.trim() &&
           !emailError.value
  } else {
    // Mode create : seul le nom du participant est requis
    return form.value.firstName.trim()
  }
})

// Charger les joueurs disponibles
async function loadAvailablePlayers() {
  try {
    availablePlayers.value = await loadPlayers(props.seasonId)
  } catch (error) {
    logger.error('Erreur lors du chargement des joueurs', error)
  }
}

// Validation de l'email
async function validateEmail(email) {
  if (!email.trim()) {
    emailError.value = ''
    return
  }

  // Vérifier le format de base
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailError.value = 'Format d\'email invalide'
    return
  }

  emailError.value = ''
}

// Watcher pour la validation de l'email
watch(() => form.value.email, (newEmail) => {
  validateEmail(newEmail)
})

// Watcher pour réinitialiser le formulaire quand on change de mode
watch(mode, (newMode) => {
  // Réinitialiser les erreurs
  errorMessage.value = ''
  successMessage.value = ''
  emailError.value = ''
  shareableLink.value = ''
  
  // Réinitialiser le formulaire
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    gender: 'unknown',
    linkedPlayerId: '',
    sendEmail: true
  }
})

// Gestion de la soumission
async function handleSubmit() {
  if (!isFormValid.value) return

  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (mode.value === 'create') {
      // Mode "Créer un joueur" : créer directement un joueur sans invitation
      await createPlayerDirectly()
    } else {
      // Mode "Inviter un utilisateur" : créer une invitation
      await createUserInvitation()
    }

  } catch (error) {
    logger.error('Erreur lors de la création', error)
    errorMessage.value = 'Erreur lors de la création. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}

// Créer un joueur directement (sans invitation)
async function createPlayerDirectly() {
  const { addPlayer } = await import('../services/storage.js')
  
  // Créer le joueur avec les données minimales
  // En mode create, firstName contient le nom complet du participant
  const playerName = form.value.firstName.trim()
  const playerGender = form.value.gender

  const newPlayer = await addPlayer(playerName, props.seasonId, playerGender)
  
  successMessage.value = 'Participant créé avec succès !'
  emit('invitation-created')
  
  // Fermer après un délai
  setTimeout(() => {
    resetForm()
    emit('close')
  }, 2000)
}

// Créer une invitation utilisateur
async function createUserInvitation() {
  const result = await createInvite({
    seasonId: props.seasonId,
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    email: form.value.email.trim().toLowerCase(),
    gender: form.value.gender,
    linkedPlayerId: form.value.linkedPlayerId || null,
    sendEmail: form.value.sendEmail,
    createdBy: props.createdBy
  })

  if (!result.success) {
    if (result.error === 'EMAIL_EXISTS') {
      // Proposer de lier au compte existant
      const linkExisting = confirm(
        `L'email ${form.value.email} correspond déjà à un compte existant. ` +
        'Voulez-vous lier ce compte à la saison ?'
      )
      
      if (linkExisting) {
        await linkExistingUserToSeasonAndPlayers({
          seasonId: props.seasonId,
          email: form.value.email.trim().toLowerCase(),
          linkedPlayerId: form.value.linkedPlayerId || null,
          performedBy: props.createdBy
        })
        
        successMessage.value = 'Utilisateur existant lié à la saison avec succès !'
        emit('invitation-created')
        
        // Fermer après un délai
        setTimeout(() => {
          resetForm()
          emit('close')
        }, 2000)
      }
      return
    } else if (result.error === 'INVITATION_EXISTS') {
      errorMessage.value = 'Une invitation existe déjà pour cet email.'
      return
    } else {
      errorMessage.value = 'Erreur lors de la création de l\'invitation.'
      return
    }
  }

  // Succès
  shareableLink.value = result.shareableLink
  successMessage.value = form.value.sendEmail 
    ? 'Invitation créée et email envoyé !'
    : 'Invitation créée !'

  emit('invitation-created')

  // Fermer après un délai si pas de lien à copier
  if (!shareableLink.value) {
    setTimeout(() => {
      resetForm()
      emit('close')
    }, 2000)
  }
}

// Copier le lien
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareableLink.value)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (error) {
    logger.error('Erreur lors de la copie du lien', error)
  }
}

// Réinitialiser le formulaire
function resetForm() {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    gender: 'unknown',
    linkedPlayerId: '',
    sendEmail: true
  }
  errorMessage.value = ''
  successMessage.value = ''
  emailError.value = ''
  shareableLink.value = ''
  linkCopied.value = false
}

// Charger les joueurs quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    loadAvailablePlayers()
  } else {
    resetForm()
  }
})
</script>
