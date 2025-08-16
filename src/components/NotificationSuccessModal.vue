<template>
  <div v-if="show" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center relative">
      <!-- Bouton de fermeture -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 text-xl font-bold"
        title="Fermer"
      >
        ✖️
      </button>
      
      <!-- Icône de succès -->
      <div class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-500">
        <span class="text-3xl">✅</span>
      </div>
      
      <!-- Titre -->
      <h1 class="text-2xl font-bold text-white mb-4">Notifications activées !</h1>
      
      <!-- Message principal condensé -->
      <p class="text-gray-300 mb-6">
        Nous enverrons désormais les alertes spectacle à <span class="font-semibold text-white">{{ email }}</span>
      </p>
      
      <!-- Conseil avec bénéfices expandables -->
      <div class="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <span class="text-blue-400 text-lg">💡</span>
          <div class="text-left flex-1">
            <p class="text-blue-300 text-sm font-medium mb-3">
              Psst... tant que tu y es : ajoute un mot de passe pour sécuriser ton compte !
            </p>
            
            <!-- Lien expandable avec contenu factorisé -->
            <AccountBenefitsHint :inline="true" />
          </div>
        </div>
      </div>
      
      <!-- Feedback de succès -->
      <div v-if="passwordEmailSent" class="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <div class="flex items-start gap-3">
          <span class="text-green-400 text-lg">✅</span>
          <div class="text-left">
            <p class="text-green-300 text-sm font-medium mb-1">Email envoyé !</p>
            <p class="text-green-200 text-sm">
              Vérifie ta boîte mail à <span class="font-mono">{{ email }}</span> et clique sur le lien pour créer ton mot de passe.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex gap-3">
        <!-- CTA principal : Créer mot de passe -->
        <button
          @click="createPassword"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
          :class="{ 'opacity-50 cursor-not-allowed': passwordEmailSent || passwordLoading }"
          :disabled="passwordEmailSent || passwordLoading"
        >
          <span v-if="passwordLoading" class="animate-spin">⏳</span>
          <span v-else>🔐 Créer mon mot de passe</span>
        </button>
        
        <!-- CTA de fermeture -->
        <button
          @click="$emit('close')"
          class="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium"
        >
          {{ passwordEmailSent ? 'Fermer' : 'Plus tard' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AccountBenefitsHint from './AccountBenefitsHint.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  seasonSlug: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'createPassword'])

const router = useRouter()
const passwordEmailSent = ref(false)
const passwordLoading = ref(false)

// Fonction pour créer un mot de passe
async function createPassword() {
  passwordLoading.value = true
  
  try {
    const { createUserWithEmailAndPassword, sendPasswordResetEmail } = await import('firebase/auth')
    const { auth } = await import('../services/firebase.js')
    
    console.log('🚀 Tentative de création de compte pour:', props.email)
    
    // 1. Créer l'utilisateur avec un mot de passe temporaire
    const tempPassword = 'TempPass123!' // Mot de passe temporaire sécurisé
    const userCredential = await createUserWithEmailAndPassword(auth, props.email, tempPassword)
    
    console.log('✅ Compte créé avec succès, UID:', userCredential.user.uid)
    
    // 2. Envoyer l'email de réinitialisation
    console.log('📧 Envoi de l\'email de réinitialisation...')
    await sendPasswordResetEmail(auth, props.email)
    
    console.log('✅ Email de réinitialisation envoyé avec succès à', props.email)
    
    // 3. Se déconnecter (car on était connecté avec le mot de passe temporaire)
    await auth.signOut()
    
    // Afficher le feedback de succès
    passwordEmailSent.value = true
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error)
    
    if (error.code === 'auth/email-already-in-use') {
      // L'utilisateur existe déjà, essayer d'envoyer directement l'email de réinitialisation
      try {
        console.log('📧 Utilisateur existant, envoi direct de l\'email de réinitialisation...')
        const { sendPasswordResetEmail } = await import('firebase/auth')
        await sendPasswordResetEmail(auth, props.email)
        
        console.log('✅ Email de réinitialisation envoyé avec succès à', props.email)
        passwordEmailSent.value = true
        
      } catch (resetError) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', resetError)
        // Gérer l'erreur de réinitialisation
      }
    } else if (error.code === 'auth/weak-password') {
      console.error('❌ Mot de passe temporaire trop faible')
    } else if (error.code === 'auth/invalid-email') {
      console.error('❌ Email invalide')
    } else {
      console.error('❌ Erreur inconnue:', error.message)
    }
  } finally {
    passwordLoading.value = false
  }
}


</script>
