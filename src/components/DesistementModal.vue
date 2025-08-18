<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
      <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-500">
        <span class="text-3xl">🚫</span>
      </div>
      
      <h1 class="text-2xl font-bold text-white mb-4">Désistement</h1>
      
      <div v-if="step === 'identify'" class="space-y-4">
        <p class="text-gray-300 mb-6">
          Vous avez été sélectionné pour l'événement <strong>{{ eventTitle }}</strong> 
          du {{ eventDate }}. Signalez-vous si vous n'êtes plus disponible.
        </p>
        
        <div class="space-y-3">
          <label class="block text-left text-sm font-medium text-gray-300">
            Nom de la personne sélectionnée
          </label>
          <select 
            v-model="selectedPlayerName" 
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            :disabled="isLoading"
          >
            <option value="">Choisissez votre nom</option>
            <option v-for="player in selectedPlayers" :key="player" :value="player">
              {{ player }}
            </option>
          </select>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button 
            @click="cancel"
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            :disabled="isLoading"
          >
            Annuler
          </button>
          <button 
            @click="confirmDesistement"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            :disabled="!selectedPlayerName || isLoading"
          >
            <span v-if="isLoading">⏳</span>
            <span v-else>Confirmer le désistement</span>
          </button>
        </div>
      </div>
      
      <div v-else-if="step === 'success'" class="space-y-4">
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-500">
          <span class="text-3xl">✅</span>
        </div>
        
        <h2 class="text-xl font-bold text-white">Désistement enregistré</h2>
        <p class="text-gray-300">
          Merci de nous avoir prévenu, {{ selectedPlayerName }}. 
          Votre désistement a été enregistré.
        </p>
        
        <button 
          @click="close"
          class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retour à la saison
        </button>
      </div>
      
      <div v-else-if="step === 'error'" class="space-y-4">
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-500">
          <span class="text-3xl">❌</span>
        </div>
        
        <h2 class="text-xl font-bold text-white">Erreur</h2>
        <p class="text-gray-300">{{ errorMessage }}</p>
        
        <button 
          @click="step = 'identify'"
          class="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { setSingleAvailability } from '../services/storage.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  seasonId: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  selectedPlayers: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const step = ref('identify') // 'identify' | 'success' | 'error'
const selectedPlayerName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

function cancel() {
  emit('close')
}

function close() {
  emit('close')
  // Rediriger vers la saison
  router.push(`/season/${props.seasonSlug || 'default'}`)
}

async function confirmDesistement() {
  if (!selectedPlayerName.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
            // Marquer la personne comme indisponible pour cet événement
    await setSingleAvailability({
      seasonId: props.seasonId,
      playerName: selectedPlayerName.value,
      eventId: props.eventId,
      value: false // false = indisponible
    })
    
    // Passer à l'étape de succès
    step.value = 'success'
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors du désistement')
    errorMessage.value = 'Impossible d\'enregistrer votre désistement. Veuillez réessayer.'
    step.value = 'error'
  } finally {
    isLoading.value = false
  }
}
</script>
