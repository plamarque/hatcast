<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 safe-area-all flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">HATCAST</h1>
        <p class="text-gray-300">Finalise ton inscription</p>
      </div>

      <!-- Contenu principal -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
        
        <!-- État de chargement -->
        <div v-if="isLoading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p class="text-gray-300">Vérification de l'invitation...</p>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="text-center">
          <div class="text-6xl mb-4">❌</div>
          <h2 class="text-xl font-bold text-white mb-2">Invitation invalide</h2>
          <p class="text-gray-300 mb-6">{{ errorMessage }}</p>
          <button
            @click="goHome"
            class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        <!-- Formulaire d'acceptation -->
        <div v-else-if="invitation" class="space-y-6">
          <div class="text-center">
            <div class="text-6xl mb-4">🎭</div>
            <h2 class="text-xl font-bold text-white mb-2">Bienvenue sur HATCAST !</h2>
            <p class="text-gray-300">
              Tu es invité(e) à rejoindre la saison 
              <span class="text-purple-400 font-medium">{{ seasonName }}</span>
            </p>
          </div>

          <form @submit.prevent="handleAccept" class="space-y-4">
            <!-- Informations pré-remplies -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  :value="invitation.email"
                  readonly
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                />
              </div>

              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-300 mb-1">
                  Prénom <span class="text-red-400">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  :placeholder="invitation.firstName || 'Ton prénom'"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-300 mb-1">
                  Nom <span class="text-red-400">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  :placeholder="invitation.lastName || 'Ton nom'"
                />
              </div>

              <div>
                <label for="gender" class="block text-sm font-medium text-gray-300 mb-1">
                  Genre (optionnel)
                </label>
                <select
                  id="gender"
                  v-model="form.gender"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="unknown">Non spécifié</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
            </div>

            <!-- Mot de passe -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe (optionnel)
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Laisse vide pour un compte sans mot de passe"
              />
              <p class="mt-1 text-xs text-gray-400">
                Tu pourras te connecter avec Google ou demander une réinitialisation de mot de passe.
              </p>
            </div>

            <!-- Messages d'erreur -->
            <div v-if="errorMessage" class="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <p class="text-red-300 text-sm">{{ errorMessage }}</p>
            </div>

            <!-- Bouton de soumission -->
            <button
              type="submit"
              class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
              :disabled="isSubmitting || !isFormValid"
            >
              <svg
                v-if="isSubmitting"
                class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Création du compte...' : 'Créer mon compte et rejoindre' }}
            </button>
          </form>

          <!-- Informations supplémentaires -->
          <div class="text-center text-sm text-gray-400">
            <p>En créant ton compte, tu acceptes de rejoindre la saison {{ seasonName }}.</p>
            <p class="mt-1">Tu pourras te connecter avec ton email et mot de passe après la création.</p>
          </div>
        </div>

        <!-- État de succès -->
        <div v-if="success" class="text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-xl font-bold text-white mb-2">Compte créé avec succès !</h2>
          <p class="text-gray-300 mb-6">
            Bienvenue dans la saison {{ seasonName }} ! Tu peux maintenant accéder à la saison.
          </p>
          <div class="animate-pulse">
            <p class="text-purple-400">Redirection vers la saison...</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-gray-400 text-sm">
        <p>© 2024 HATCAST - Gestion de disponibilités</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { acceptInvitation, validateInvitationToken } from '../services/users.js'
import { getFirebaseAuth } from '../services/firebase.js'
import logger from '../services/logger.js'

const route = useRoute()
const router = useRouter()

// État de l'application
const isLoading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const invitation = ref(null)
const seasonName = ref('')
const success = ref(false)
const isSubmitting = ref(false)

// Formulaire
const form = ref({
  firstName: '',
  lastName: '',
  gender: 'unknown',
  password: ''
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.firstName.trim() && form.value.lastName.trim()
})

// Initialisation
onMounted(async () => {
  await validateInvitation()
})

// Valider l'invitation
async function validateInvitation() {
  try {
    const token = route.query.token
    const email = route.query.email
    const seasonId = route.query.season

    if (!token || !email || !seasonId) {
      throw new Error('Paramètres d\'invitation manquants')
    }

    // Valider le token d'invitation
    const validation = await validateInvitationToken(token, email, seasonId)
    
    if (!validation.valid) {
      switch (validation.reason) {
        case 'not_found':
          throw new Error('Invitation non trouvée')
        case 'expired':
          throw new Error('Cette invitation a expiré')
        case 'not_pending':
          throw new Error('Cette invitation n\'est plus valide')
        default:
          throw new Error('Invitation invalide')
      }
    }

    invitation.value = validation.invitation
    
    // Pré-remplir le formulaire
    form.value.firstName = invitation.value.firstName || ''
    form.value.lastName = invitation.value.lastName || ''
    form.value.gender = invitation.value.gender || 'unknown'

    // Charger le nom de la saison
    const { default: firestoreService } = await import('../services/firestoreService.js')
    const seasonData = await firestoreService.getDocument('seasons', seasonId)
    seasonName.value = seasonData?.name || 'cette saison'

    isLoading.value = false

  } catch (err) {
    logger.error('Erreur lors de la validation de l\'invitation', err)
    error.value = true
    errorMessage.value = err.message
    isLoading.value = false
  }
}

// Accepter l'invitation
async function handleAccept() {
  if (!isFormValid.value || !invitation.value) return

  try {
    isSubmitting.value = true
    errorMessage.value = ''

    const result = await acceptInvitation({
      invitationId: invitation.value.id,
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      gender: form.value.gender,
      password: form.value.password || null
    })

    if (!result.success) {
      throw new Error('Erreur lors de l\'acceptation de l\'invitation')
    }

    // Connexion automatique si un Firebase UID a été créé
    if (result.user.firebaseUid) {
      try {
        const auth = getFirebaseAuth()
        if (auth) {
          // Pour un utilisateur avec Firebase UID créé, on ne peut pas se connecter automatiquement
          // car on n'a pas le mot de passe. L'utilisateur devra se connecter manuellement
          // ou utiliser la réinitialisation de mot de passe
          logger.info('Utilisateur créé avec Firebase UID, connexion manuelle requise')
        } else {
          logger.info('Firebase Auth non disponible, connexion manuelle requise')
        }
      } catch (authError) {
        logger.warn('Impossible de connecter automatiquement l\'utilisateur', authError)
        // Continuer sans connexion automatique
      }
    }

    success.value = true

    // Redirection vers la saison après un délai
    setTimeout(() => {
      router.push(`/season/${route.query.season}`)
    }, 2000)

  } catch (err) {
    logger.error('Erreur lors de l\'acceptation de l\'invitation', err)
    errorMessage.value = err.message || 'Erreur lors de la création du compte'
  } finally {
    isSubmitting.value = false
  }
}

// Retour à l'accueil
function goHome() {
  router.push('/')
}
</script>
