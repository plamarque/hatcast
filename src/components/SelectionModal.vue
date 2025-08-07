<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4" @click="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl" @click.stop>
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-3xl">🎭</span>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">Sélection pour {{ event?.title }}</h2>
        <p class="text-xl text-purple-300">{{ formatDateFull(event?.date) }}</p>
      </div>
      
      <!-- Statistiques -->
      <div class="mb-6">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
            <div class="text-2xl font-bold text-white">{{ event?.playerCount || 6 }}</div>
            <div class="text-sm text-gray-300">À sélectionner</div>
          </div>
          <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
            <div class="text-2xl font-bold text-white">{{ availableCount }}</div>
            <div class="text-sm text-gray-300">Disponibles</div>
          </div>
          <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30">
            <div class="text-2xl font-bold text-white">{{ selectedCount }}</div>
            <div class="text-sm text-gray-300">Sélectionnés</div>
          </div>
        </div>
      </div>
      

      
      <!-- Message de succès après sélection -->
      <div v-if="showSuccessMessage" class="mb-6">
        <div class="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
          <div class="text-blue-400 text-xl">✨</div>
          <div class="flex-1">
            <p class="text-blue-300 text-sm font-medium">{{ successMessageText }}</p>
          </div>
          <button 
            @click="hideSuccessMessage"
            class="text-blue-400 hover:text-blue-300 transition-colors"
            title="Fermer le message"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Warning de sélection incomplète -->
      <div v-if="hasIncompleteSelection" class="mb-6">
        <div class="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
          <div class="text-yellow-400 text-xl">⚠️</div>
          <div class="flex-1">
            <h3 class="text-yellow-300 text-sm font-semibold mb-1">Sélection incomplète</h3>
            <p class="text-yellow-200 text-sm">{{ incompleteSelectionMessage }}</p>
          </div>
        </div>
      </div>
      
      <!-- Section de sélection actuelle -->
      <div v-if="hasSelection" class="mb-6">
        <h3 class="text-lg font-semibold text-white mb-3">Joueurs sélectionnés :</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div
            v-for="player in currentSelection"
            :key="player"
            class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30 text-center"
            :class="{
              'from-red-500/20 to-red-600/20 border-red-500/30': !isPlayerAvailable(player),
              'from-yellow-500/20 to-orange-500/20 border-yellow-500/30': isPlayerUnavailable(player)
            }"
          >
            <span class="text-white font-medium">
              <span v-if="isPlayerSelected(player)" class="text-purple-400 mr-2">🎭</span>
              <span v-else-if="isPlayerAvailable(player)" class="text-green-400 mr-2">✅</span>
              <span v-else-if="isPlayerUnavailable(player)" class="text-red-400 mr-2">❌</span>
              <span v-else class="text-gray-400 mr-2">–</span>
              {{ player }}
            </span>
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="text-md font-semibold text-white mb-2">Message à envoyer :</h4>
          <div class="relative">
            <textarea
              :value="selectionMessage"
              class="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
              rows="3"
              readonly
            ></textarea>
            <button
              @click="copyToClipboard"
              class="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-2 hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
              :title="copyButtonText"
            >
              <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Section d'invitation à la sélection -->
      <div v-else class="mb-6">
        <div class="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div class="text-4xl mb-4">{{ getInvitationIcon() }}</div>
          <h3 class="text-xl font-semibold text-white mb-2">
            {{ getInvitationTitle() }}
          </h3>
          <p class="text-gray-300">
            {{ getInvitationMessage() }}
          </p>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex justify-center space-x-3">
        <button 
          @click="handleSelection"
          :disabled="availableCount === 0"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="availableCount === 0 ? 'Aucun joueur disponible' : (hasSelection ? 'Relancer la sélection automatique' : 'Lancer la sélection automatique')"
        >
          <span>✨</span>
          <span>Sélection Auto</span>
        </button>
        <button 
          v-if="hasSelection"
          @click="handlePerfect"
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>👍</span>
          <span>Parfait</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  event: {
    type: Object,
    default: null
  },
  currentSelection: {
    type: Array,
    default: () => []
  },
  availableCount: {
    type: Number,
    default: 0
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  // Props pour la gestion des disponibilités
  playerAvailability: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'selection', 'perfect'])

const copied = ref(false)
const copyButtonText = ref('Copier le message')
const showSuccessMessage = ref(false)
const successMessageText = ref('')
const isReselection = ref(false)

// Computed properties
const hasSelection = computed(() => {
  return props.currentSelection && props.currentSelection.length > 0
})

const hasIncompleteSelection = computed(() => {
  if (!hasSelection.value) return false
  
  // Vérifier si des joueurs sélectionnés ne sont plus disponibles
  const hasUnavailablePlayers = props.currentSelection.some(player => !isPlayerAvailable(player))
  
  // Vérifier s'il y a assez de joueurs disponibles pour compléter la sélection
  const requiredCount = props.event?.playerCount || 6
  const hasInsufficientPlayers = props.availableCount < requiredCount
  
  return hasUnavailablePlayers || hasInsufficientPlayers
})

const incompleteSelectionMessage = computed(() => {
  if (!hasIncompleteSelection.value) return ''
  
  const unavailablePlayers = props.currentSelection.filter(player => !isPlayerAvailable(player))
  const requiredCount = props.event?.playerCount || 6
  
  if (unavailablePlayers.length > 0) {
    if (unavailablePlayers.length === 1) {
      return `${unavailablePlayers[0]} n'est plus disponible. Veuillez relancer la sélection.`
    } else {
      return `${unavailablePlayers.length} joueurs ne sont plus disponibles. Veuillez relancer la sélection.`
    }
  } else if (props.availableCount < requiredCount) {
    return `Seulement ${props.availableCount} joueurs disponibles pour ${requiredCount} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de joueurs à sélectionner.`
  }
  
  return 'Sélection incomplète'
})

const selectionMessage = computed(() => {
  if (!props.event || !hasSelection.value) return ''
  
  const eventDate = formatDateFull(props.event.date)
  const playersList = props.currentSelection.join(', ')
  return `Sélection pour ${props.event.title} du ${eventDate} : ${playersList}`
})

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    copied.value = false
    copyButtonText.value = 'Copier le message'
    showSuccessMessage.value = false
    successMessageText.value = ''
    isReselection.value = false
  }
})

// Methods
function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string'
    ? new Date(dateValue)
    : dateValue.toDate?.() || dateValue
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function copyToClipboard() {
  const textToCopy = selectionMessage.value
  navigator.clipboard.writeText(textToCopy).then(() => {
    copied.value = true
    copyButtonText.value = 'Copié !'
    setTimeout(() => {
      copied.value = false
      copyButtonText.value = 'Copier le message'
    }, 2000)
  }).catch(err => {
    console.error('Erreur lors de la copie du texte:', err)
    alert('Impossible de copier le message.')
  })
}

function handleSelection() {
  emit('selection')
}

function handlePerfect() {
  emit('perfect')
}

function close() {
  emit('close')
}

// Fonctions pour vérifier la disponibilité des joueurs
function isPlayerAvailable(playerName) {
  return props.playerAvailability[playerName] === true
}

function isPlayerUnavailable(playerName) {
  return props.playerAvailability[playerName] === false
}

function isPlayerSelected(playerName) {
  // Un joueur est "sélectionné" s'il est dans la sélection actuelle ET disponible
  return props.currentSelection.includes(playerName) && isPlayerAvailable(playerName)
}

// Fonctions pour l'invitation à la sélection
function getInvitationIcon() {
  const requiredCount = props.event?.playerCount || 6
  
  if (props.availableCount === 0) {
    return '⚠️'
  } else if (props.availableCount < requiredCount) {
    return '⚠️'
  } else {
    return '🎲'
  }
}

function getInvitationTitle() {
  const requiredCount = props.event?.playerCount || 6
  
  if (props.availableCount === 0) {
    return 'Aucun joueur disponible'
  } else if (props.availableCount < requiredCount) {
    return 'Pas assez de joueurs disponibles'
  } else {
    return 'Aucune sélection effectuée'
  }
}

function getInvitationMessage() {
  const requiredCount = props.event?.playerCount || 6
  
  if (props.availableCount === 0) {
    return 'Aucun joueur n\'est disponible pour cet événement. Veuillez d\'abord indiquer les disponibilités.'
  } else if (props.availableCount < requiredCount) {
    return `Seulement ${props.availableCount} joueurs disponibles pour ${requiredCount} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de joueurs à sélectionner.`
  } else {
    return 'Cliquez sur "Sélection Auto" pour lancer le tirage automatique des joueurs'
  }
}

// Fonction pour afficher le message de succès (appelée depuis le parent)
function showSuccess(reselection = false, isPartialUpdate = false) {
  isReselection.value = reselection
  
  if (reselection) {
    const eventDate = formatDateFull(props.event.date)
    const playersList = props.currentSelection.join(', ')
    
    if (isPartialUpdate) {
      successMessageText.value = `Sélection mise à jour pour ${props.event.title} du ${eventDate} : ${playersList}`
    } else {
      successMessageText.value = `Nouvelle sélection pour ${props.event.title} du ${eventDate} : ${playersList}`
    }
  } else {
    successMessageText.value = 'Sélection effectuée avec succès !'
  }
  
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 8000)
}

function hideSuccessMessage() {
  showSuccessMessage.value = false
}

// Exposer la fonction pour le parent
defineExpose({
  showSuccess
})
</script>
