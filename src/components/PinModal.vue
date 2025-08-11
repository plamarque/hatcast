<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🔒</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Code d'accès requis</h2>
        <p class="text-gray-300">{{ message }}</p>
        <div v-if="sessionInfo" class="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p class="text-sm text-green-400">
            Session active : {{ sessionInfo.timeRemaining }} min restantes
          </p>
        </div>
      </div>
      <!-- Saisie du code PIN -->
      <div class="mb-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Code PIN</label>
          <input
            v-model="pinCode"
            type="password"
            maxlength="4"
            pattern="[0-9]{4}"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            class="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-center text-2xl font-mono tracking-widest"
            placeholder="••••"
            @input="validatePinInput"
            @keydown.enter="submit"
            @keydown.escape="cancel"
            ref="pinInput"
          >
        </div>
        <p class="text-xs text-gray-400 text-center">Tapez directement votre code PIN à 4 chiffres</p>
      </div>
      
      <div v-if="error || props.error" class="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center">
        {{ error || props.error }}
      </div>
      
      <div class="flex justify-end space-x-3">
        <button
          @click="cancel"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="submit"
          :disabled="pinCode.length !== 4"
          class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Valider
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Veuillez saisir le code PIN à 4 chiffres'
  },
  error: {
    type: String,
    default: ''
  },
  sessionInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const pinCode = ref('')
const error = ref('')
const pinInput = ref(null)

// Réinitialiser le PIN quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    pinCode.value = ''
    error.value = ''
    // Focus sur l'input
    nextTick(() => {
      pinInput.value?.focus()
    })
  }
})

function validatePinInput() {
  // Garder seulement les chiffres
  pinCode.value = pinCode.value.replace(/[^0-9]/g, '')
  // Limiter à 4 chiffres
  if (pinCode.value.length > 4) {
    pinCode.value = pinCode.value.slice(0, 4)
  }
}

function submit() {
  if (pinCode.value.length === 4) {
    emit('submit', pinCode.value)
  }
}

function cancel() {
  emit('cancel')
}

// Aucun écouteur global nécessaire: la saisie se fait dans l'input
</script>
