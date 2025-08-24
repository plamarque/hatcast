<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
      <!-- Croix de fermeture -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        title="Fermer"
      >
        <span class="text-xl">✖️</span>
      </button>
      
      <!-- En-tête -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600">
          <span class="text-xl">🔔</span>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Ne rate rien !</h2>
        <p class="text-gray-300 text-sm">
          Crée un compte pour recevoir des alertes en temps réel sur les spectacles.
        </p>
      </div>

      <!-- Formulaire email -->
      <div v-if="!emailSent" class="space-y-4">
        <!-- Affichage de l'email actuel si connecté -->
        <div v-if="currentUserEmail" class="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <div class="text-blue-200 text-sm font-medium mb-1">📧 Ton email actuel :</div>
          <div class="text-blue-100 text-sm">{{ currentUserEmail }}</div>
          <div class="text-blue-300 text-xs mt-1">C'est à cette adresse que tes notifications seront envoyées</div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Ton adresse email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="currentUserEmail || 'votre@email.com'"
            class="w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors"
            :class="[
              email && !canSend 
                ? 'border-red-500 focus:border-red-500' 
                : email && canSend 
                ? 'border-green-500 focus:border-green-500' 
                : 'border-white/20 focus:border-purple-500'
            ]"
            :disabled="loading"
          />
          <!-- Indicateur de validation en temps réel -->
          <div v-if="email && !loading" class="mt-2 text-xs">
            <span v-if="canSend" class="text-green-400">✅ Email valide</span>
            <span v-else class="text-red-400">❌ Format d'email invalide</span>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex gap-3">
          <!-- Bouton principal : Activer les notifications -->
          <button
            @click="sendMagicLink"
            :disabled="!canSend || loading"
            class="flex-1 px-6 py-3 rounded-lg transition-all duration-300 font-medium"
            :class="[
              canSend && !loading
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            ]"
          >
            <span v-if="loading" class="animate-spin">⏳</span>
            <span v-else>Activer les notifications</span>
          </button>
          
          <!-- Bouton secondaire : Pas Maintenant -->
          <button
            @click="$emit('close')"
            class="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
          >
            Pas Maintenant
          </button>
        </div>
      </div>

      <!-- Confirmation email envoyé -->
      <div v-else class="text-center">
        <p class="text-green-400 text-sm mb-4">
          Email envoyé à <span class="font-medium text-white">{{ email }}</span>
        </p>
        <p class="text-gray-300 text-xs">
          Clique sur le lien qu'il contient pour activer tes notifications
        </p>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="error" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div class="text-red-300 text-sm">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createNotificationActivationRequest } from '../services/notificationActivation.js'
import logger from '../services/logger.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerName: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  seasonId: {
    type: String,
    required: true
  },
  seasonSlug: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'success', 'show-login'])

const email = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)
const currentUserEmail = ref('')

const canSend = computed(() => {
  // Validation d'email simple et fiable
  // Accepte: lettres, chiffres, +, -, ., _, @
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  const emailValue = email.value
  const regexTest = emailRegex.test(emailValue)
  const loadingValue = loading.value
  const isValid = emailValue && regexTest && !loadingValue
  
  return isValid
})

// Récupérer l'email de l'utilisateur connecté au montage du composant
onMounted(async () => {
  try {
    const { auth } = await import('../services/firebase.js')
    if (auth.currentUser?.email) {
      currentUserEmail.value = auth.currentUser.email
      // Pré-remplir le champ email avec l'email de l'utilisateur connecté
      email.value = auth.currentUser.email
    }
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'email utilisateur:', err)
  }
})

async function sendMagicLink() {
  if (!canSend.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    console.log('🚀 Début de l\'activation des notifications...')
    
    // Vérifier si l'utilisateur est déjà connecté
    const { auth } = await import('../services/firebase.js')
    
    const isAlreadyConnected = auth.currentUser?.email === email.value
    
    if (isAlreadyConnected) {
      console.log('✅ Utilisateur déjà connecté, activation directe...')
      
      // Activation directe des notifications (pas d'email)
      const { activateNotificationsForConnectedUser } = await import('../services/notificationActivation.js')
      const result = await activateNotificationsForConnectedUser({
        seasonId: props.seasonId,
        eventId: props.eventId,
        playerName: props.playerName,
        email: email.value,
        eventTitle: props.eventTitle,
        seasonSlug: props.seasonSlug
      })
      
      console.log('✅ Notifications activées directement:', result)
      
      // Afficher le succès directement
      emailSent.value = true
      emit('success', { email: email.value, playerName: props.playerName, directActivation: true })
      
    } else {
      console.log('📧 Utilisateur non connecté, vérification de l\'email...')
      
      // Vérifier si l'email existe déjà dans Firebase
      const { checkEmailExists } = await import('../services/notificationActivation.js')
      const emailExists = await checkEmailExists(email.value)
      
      if (emailExists) {
        console.log('🎯 Email existant détecté, affichage du popup de connexion')
        
        // Fermer cette modal et émettre un événement pour afficher le popup de connexion
        emit('close')
        emit('show-login', { 
          email: email.value, 
          playerName: props.playerName,
          eventId: props.eventId,
          seasonId: props.seasonId,
          seasonSlug: props.seasonSlug
        })
        
        return
      }
      
      console.log('📧 Nouvel email, envoi de l\'email d\'activation...')
      
      // Créer la demande d'activation des notifications (avec email)
      const result = await createNotificationActivationRequest({
        seasonId: props.seasonId,
        eventId: props.eventId,
        playerName: props.playerName,
        email: email.value,
        eventTitle: props.eventTitle,
        seasonSlug: props.seasonSlug
      })
      
      console.log('✅ Résultat de la création:', result)
      
      emailSent.value = true
      emit('success', { email: email.value, playerName: props.playerName, directActivation: false })
    }
    
    logger.info('Activation des notifications terminée', {
      email: email.value,
      playerName: props.playerName,
      eventId: props.eventId,
      directActivation: isAlreadyConnected
    })
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'activation:', err)
    logger.error('Erreur lors de l\'activation des notifications', err)
    error.value = 'Impossible d\'activer les notifications. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>
