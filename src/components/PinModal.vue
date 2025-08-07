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
      
      <!-- Mode de saisie -->
      <div class="mb-4 flex justify-center">
        <div class="flex bg-gray-800 rounded-lg p-1">
          <button
            @click="inputMode = 'direct'"
            class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            :class="inputMode === 'direct' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'"
          >
            Saisie directe
          </button>
          <button
            @click="inputMode = 'keypad'"
            class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            :class="inputMode === 'keypad' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'"
          >
            Pavé numérique
          </button>
        </div>
      </div>
      
      <!-- Saisie directe -->
      <div v-if="inputMode === 'direct'" class="mb-6">
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
      
      <!-- Pavé numérique -->
      <div v-else class="mb-6">
        <div class="flex justify-center space-x-3 mb-4">
          <div 
            v-for="(digit, index) in 4" 
            :key="index"
            class="w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white bg-gray-800"
            :class="{ 'border-purple-500 bg-purple-900/20': pinCode.length > index }"
          >
            {{ pinCode[index] || '•' }}
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-3 mb-4">
          <button
            v-for="digit in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="digit"
            @click="addDigit(digit)"
            class="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"
          >
            {{ digit }}
          </button>
          <button
            @click="clearPin"
            class="w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"
          >
            C
          </button>
          <button
            @click="addDigit(0)"
            class="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"
          >
            0
          </button>
          <button
            @click="removeDigit"
            class="w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"
          >
            ←
          </button>
        </div>
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
const inputMode = ref('direct') // 'direct' ou 'keypad'
const pinInput = ref(null)

// Réinitialiser le PIN quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    pinCode.value = ''
    error.value = ''
    // Focus sur l'input si en mode direct
    if (inputMode.value === 'direct') {
      nextTick(() => {
        pinInput.value?.focus()
      })
    }
  }
})

// Focus automatique quand on change de mode
watch(inputMode, (newMode) => {
  if (newMode === 'direct' && props.show) {
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

function addDigit(digit) {
  if (pinCode.value.length < 4) {
    pinCode.value += digit.toString()
  }
}

function removeDigit() {
  pinCode.value = pinCode.value.slice(0, -1)
}

function clearPin() {
  pinCode.value = ''
  error.value = ''
}

function submit() {
  if (pinCode.value.length === 4) {
    emit('submit', pinCode.value)
  }
}

function cancel() {
  emit('cancel')
}

// Gestion des touches clavier
const handleKeydown = (event) => {
  if (!props.show) return
  
  if (event.key >= '0' && event.key <= '9') {
    if (inputMode.value === 'keypad') {
      addDigit(parseInt(event.key))
    }
  } else if (event.key === 'Backspace') {
    if (inputMode.value === 'keypad') {
      removeDigit()
    }
  } else if (event.key === 'Enter') {
    submit()
  } else if (event.key === 'Escape') {
    cancel()
  }
}

// Écouter les événements clavier
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>
