<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[80] p-0 md:p-4" @click="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative text-center p-6 pb-4 border-b border-white/10">
        <button @click="close" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <div class="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-3xl">🎭</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-1">Sélection pour {{ event?.title }}</h2>
        <p class="text-sm md:text-base text-purple-300">{{ formatDateFull(event?.date) }}</p>

      </div>
      
      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <!-- 1) Statistiques (harmonisées avec les autres modales) -->
        <div class="grid grid-cols-3 gap-3 md:gap-4 mb-4">
          <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 md:p-4 rounded-lg border border-yellow-500/30 text-center">
            <div class="text-xl md:text-2xl font-bold text-yellow-300">{{ Math.max((event?.playerCount || 6) - selectedCount, 0) }}</div>
            <div class="text-xs md:text-sm text-yellow-300">Manquants</div>
          </div>
          <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 md:p-4 rounded-lg border border-cyan-500/30 text-center">
            <div class="text-xl md:text-2xl font-bold text-white">{{ availableCount }}</div>
            <div class="text-xs md:text-sm text-gray-300">Disponibles</div>
          </div>
          <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 md:p-4 rounded-lg border border-purple-500/30 text-center">
            <div class="text-xl md:text-2xl font-bold text-white">{{ selectedCount }}</div>
            <div class="text-xs md:text-sm text-gray-300">Sélectionnés</div>
          </div>
        </div>

        <!-- 2) Joueurs sélectionnés (avec édition inline et slots vides) -->
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-base md:text-lg font-semibold text-white">Joueurs sélectionnés</h3>
            <button @click="openHowItWorks" class="text-blue-300 hover:text-blue-200 p-1 rounded-full hover:bg-blue-500/10 transition-colors" title="Comment fonctionne la sélection automatique ?">
              <span class="text-sm">❓</span>
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-0">
            <div
              v-for="(slot, i) in slots"
              :key="'sel-slot-'+i"
              class="relative p-3 rounded-lg border text-center transition-colors"
              :class="slot
                ? [
                    'bg-gradient-to-r',
                    isPlayerUnavailable(slot)
                      ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : (!isPlayerAvailable(slot)
                          ? 'from-red-500/20 to-red-600/20 border-red-500/30'
                          : 'from-green-500/20 to-emerald-500/20 border-green-500/30')
                  ]
                : 'border-dashed border-white/20 hover:border-white/40 bg-white/5'"
            >
              <!-- Slot rempli -->
              <div v-if="slot" class="flex items-center justify-between gap-2">
                <div class="flex-1 text-white font-medium truncate" :title="slot">
                  <span v-if="isInSavedSelectionAndAvailable(slot)" class="text-purple-400 mr-2">🎭</span>
                  <span v-else-if="isPlayerAvailable(slot)" class="text-green-400 mr-2">✅</span>
                  <span v-else-if="isPlayerUnavailable(slot)" class="text-red-400 mr-2">❌</span>
                  <span v-else class="text-gray-400 mr-2">–</span>
                  {{ slot }}
                </div>
                <button
                  @click="clearSlot(i)"
                  class="text-white/80 hover:text-white rounded-full hover:bg-white/10 px-2 py-1"
                  title="Retirer ce joueur"
                >
                  ×
                </button>
              </div>

              <!-- Slot vide -->
              <div v-else class="flex items-center justify-center">
                <template v-if="editingSlotIndex === i">
                  <select
                    class="w-full bg-gray-800 text-white rounded-md p-2 border border-white/20 focus:outline-none"
                    @change="onChooseForSlot($event, i)"
                    @blur="cancelEditSlot()"
                  >
                    <option value="">— Choisir —</option>
                    <option v-for="name in availableOptionsForSlot(i)" :key="name" :value="name">{{ name }}</option>
                  </select>
                </template>
                <button
                  v-else
                  @click="startEditSlot(i)"
                  class="flex items-center gap-2 text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                  title="Ajouter un joueur"
                >
                  <span class="text-lg">＋</span>
                  <span class="text-sm">Ajouter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 3) Avertissement succinct si sélection incomplète -->
        <div v-if="hasIncompleteSelection" class="mb-3">
          <div class="flex items-center space-x-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div class="text-yellow-400">⚠️</div>
            <div class="text-yellow-200 text-sm">Sélection incomplète. Vérifie ci-dessous.</div>
          </div>
        </div>



        <!-- 5) Warning après changement de sélection -->
        <div v-if="hasSelection" class="mb-3">
          <div class="flex items-center space-x-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div class="text-yellow-400">⚠️</div>
            <div class="text-yellow-200 text-sm">Pensez à prévenir les gens de vos changements !</div>
          </div>
        </div>

        <!-- 6) Message de succès après sélection -->
        <div v-if="showSuccessMessage" class="mb-3">
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

        <!-- 5) (optionnel) Invitation concise supprimée pour éviter la redondance -->
      
      <!-- Anciennes sections redondantes supprimées -->
      
      </div>
      <!-- Footer sticky -->
      <div class="sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <button @click="handleSelection" :disabled="availableCount === 0" class="h-12 px-3 md:px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 whitespace-nowrap" :title="availableCount === 0 ? 'Aucun joueur disponible' : (hasSelection ? 'Relancer la sélection automatique' : 'Lancer la sélection automatique')">
          ✨ <span class="hidden sm:inline">Sélection Auto</span><span class="sm:hidden">Auto</span>
        </button>

        <button @click="openAnnounce" :disabled="!hasSelection" class="h-12 px-3 md:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
          📣 <span class="hidden sm:inline">Annoncer</span><span class="sm:hidden">Annoncer</span>
        </button>
        <button @click="handlePerfect" class="h-12 px-3 md:px-4 bg-gray-700 text-white rounded-lg flex-1 whitespace-nowrap">
          <span class="hidden sm:inline">Fermer</span><span class="sm:hidden">Fermer</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Popin Annoncer -->
  <EventAnnounceModal
    :show="showAnnounce"
    :event="event"
    :season-id="seasonId"
    :season-slug="seasonSlug"
    :players="players"
    mode="selection"
    :selected-players="currentSelection"
    @close="showAnnounce = false"
    @send-notifications="handleSendNotifications"
  />

  <!-- Popin Comment ça marche -->
  <HowItWorksModal :show="showHowItWorks" @close="showHowItWorks = false" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EventAnnounceModal from './EventAnnounceModal.vue'
import HowItWorksModal from './HowItWorksModal.vue'
import { saveSelection } from '../services/storage.js'

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
  },
  // Nouvelles props pour EventAnnounceModal
  seasonId: {
    type: String,
    default: ''
  },
  seasonSlug: {
    type: String,
    default: ''
  },
  players: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'selection', 'perfect', 'send-notifications'])

const copied = ref(false)
const copyButtonText = ref('Copier le message')
const showAnnounce = ref(false)
const showSuccessMessage = ref(false)
const successMessageText = ref('')
const isReselection = ref(false)
const showHowItWorks = ref(false)

// --- Manual slots state ---
const requiredCount = computed(() => props.event?.playerCount || 6)
const slots = ref([])
const editingSlotIndex = ref(null)





const allAvailableNames = computed(() => {
  return (props.players || [])
    .map(p => p.name)
    .filter(name => props.playerAvailability?.[name] === true)
    .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
})

function availableOptionsForSlot(index) {
  const used = new Set(slots.value.filter(Boolean))
  // If editing a slot that already had a value (rare here since editor opens for empty), allow keeping it
  const current = slots.value[index]
  if (current) used.delete(current)
  return allAvailableNames.value.filter(name => !used.has(name))
}

function startEditSlot(index) {
  editingSlotIndex.value = index
}

function cancelEditSlot() {
  editingSlotIndex.value = null
}

async function onChooseForSlot(event, index) {
  const value = event?.target?.value || ''
  if (value) {
    slots.value[index] = value
    // Sauvegarde automatique immédiate
    await autoSaveSelection()
  }
  editingSlotIndex.value = null
}

async function clearSlot(index) {
  slots.value[index] = null
  // Sauvegarde automatique immédiate
  await autoSaveSelection()
}

const slotsWarning = computed(() => {
  // Warn if more slots than available players
  const freeCount = availableOptionsForSlot(-1).length // -1 -> no exclusion, all available
  if (freeCount < requiredCount.value) {
    return ''
  }
  return ''
})

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
    showAnnounce.value = false
    // Initialize slots from current selection and requiredCount
    const filled = Array.isArray(props.currentSelection) ? [...props.currentSelection] : []
    const len = requiredCount.value
    slots.value = Array.from({ length: len }, (_, i) => filled[i] || null)
    editingSlotIndex.value = null
  }
})

// Rebuild slots when playerCount changes while open
watch([requiredCount, () => props.currentSelection, () => props.event?.id], () => {
  if (!props.show) return
  const filled = Array.isArray(props.currentSelection) ? [...props.currentSelection] : []
  const len = requiredCount.value
  // keep existing chosen values in order where possible
  const next = Array.from({ length: len }, (_, i) => filled[i] || slots.value[i] || null)
  slots.value = next.slice(0, len)
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
    // Silence in production; optional debug in development
    // eslint-disable-next-line no-console
    console.warn('Erreur lors de la copie du texte')
    alert('Impossible de copier le message.')
  })
}

function handleSelection() {
  emit('selection')
}

function handlePerfect() {
  emit('perfect')
}



async function autoSaveSelection() {
  if (!props.event?.id || !props.seasonId) return
  
  try {
    const players = slots.value.filter(Boolean)
    
    // Sauvegarde directe sans PIN (changements mineurs)
    await saveSelection(props.event.id, players, props.seasonId)
    
    // Feedback visuel subtil (optionnel)
    console.debug('Sélection sauvegardée automatiquement')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique:', error)
    // En cas d'erreur, on peut afficher un message discret
  }
}

function close() {
  emit('close')
}

function openAnnounce() {
  showAnnounce.value = true
}

function openHowItWorks() {
  showHowItWorks.value = true
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

function isInSavedSelectionAndAvailable(playerName) {
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
      successMessageText.value = `Sélection mise à jour pour ${props.event.title} du ${eventDate} : ${playersList}. Pensez à prévenir les joueurs via le bouton "Annoncer" !`
    } else {
      successMessageText.value = `Nouvelle sélection pour ${props.event.title} du ${eventDate} : ${playersList}. Pensez à prévenir les joueurs via le bouton "Annoncer" !`
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

// Fonction pour gérer l'envoi d'emails de sélection
function handleSendNotifications(data) {
  // Émettre l'événement vers le parent (GridBoard)
  emit('send-notifications', data)
}
</script>
