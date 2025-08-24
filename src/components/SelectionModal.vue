<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[120] p-0 md:p-4" @click="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" @click.stop>
      <div class="relative p-4 md:p-6 border-b border-white/10">
        <button @click="close" title="Fermer" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        
        <!-- Layout horizontal compact -->
        <div class="flex items-start gap-4 md:gap-6">
          <!-- Icône illustrative -->
          <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center">
            <span class="text-xl md:text-2xl">🎭</span>
          </div>
          
          <!-- Informations principales -->
          <div class="flex-1 min-w-0">
            <h2 class="text-xl md:text-2xl font-bold text-white leading-tight mb-2">Sélection de l'équipe pour {{ event?.title }}</h2>
            
            <!-- Date + Badge nombre de joueurs + Statut de sélection -->
            <div class="flex items-center gap-3">
              <p class="text-base md:text-lg text-purple-300">{{ formatDateFull(event?.date) }}</p>
              
              <!-- Badge nombre de joueurs -->
              <div class="flex items-center gap-2 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-sm">
                <span class="text-blue-300 hidden md:inline">👥</span>
                <span class="text-blue-200">{{ event?.playerCount || 6 }} personnes</span>
              </div>
              
              <!-- Indicateur de statut de sélection -->
              <div 
                v-if="getSelectionStatus().type === 'ready'"
                class="px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-sm flex items-center gap-1"
                title="Prêt pour la sélection"
              >
                <span class="text-blue-300 text-xs hidden md:inline">🆕</span>
                <span class="text-blue-200 text-xs">Nouveau</span>
              </div>
              
              <SelectionStatusBadge
                v-else-if="getSelectionStatus().type"
                :status="getSelectionStatus().type"
                :show="true"
                :clickable="false"
                class="text-sm"
              />
              
              <div 
                v-else-if="getSelectionStatus().type === 'insufficient'"
                class="px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-sm flex items-center gap-1"
                title="Pas assez de personnes disponibles"
              >
                <span class="text-red-300 text-xs hidden md:inline">❌</span>
                <span class="text-red-200 text-xs">Manque</span>
              </div>
            </div>
          </div>
        </div>
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

        <!-- 2) Équipe sélectionnée (avec édition inline et slots vides) -->
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-base md:text-lg font-semibold text-white">Équipe sélectionnée</h3>
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
                    // Statuts de confirmation individuelle (priorité sur la disponibilité)
                    getPlayerSelectionStatus(slot) === 'declined'
                      ? 'from-red-500/20 to-orange-500/20 border-red-500/30'
                      : getPlayerSelectionStatus(slot) === 'confirmed'
                        ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
                        : getPlayerSelectionStatus(slot) === 'pending'
                          ? 'from-orange-500/20 to-yellow-500/20 border-orange-500/30'
                          // Statuts de disponibilité classique (seulement si pas de statut individuel)
                          : isPlayerUnavailable(slot)
                            ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                            : (!isPlayerAvailable(slot)
                                ? 'from-red-500/20 to-red-600/20 border-red-500/30'
                                : 'from-green-500/20 to-emerald-500/20 border-green-500/30')
                  ]
                : 'border-dashed border-white/20 hover:border-white/40 bg-white/5'"
            >
              <!-- Slot rempli -->
              <div v-if="slot" class="flex items-center justify-between gap-2">
                <div class="flex-1 text-white font-medium truncate" :title="getPlayerSlotTooltip(slot)">
                  <!-- Statut de confirmation individuel du joueur -->
                  <span v-if="getPlayerSelectionStatus(slot) === 'confirmed'" class="text-purple-400 mr-2">✅</span>
                  <span v-else-if="getPlayerSelectionStatus(slot) === 'declined'" class="text-red-400 mr-2">❌</span>
                  <span v-else-if="getPlayerSelectionStatus(slot) === 'pending'" class="text-orange-400 mr-2">⏳</span>
                  <!-- Statut de disponibilité classique -->
                  <span v-else-if="isInSavedSelectionAndAvailable(slot)" class="text-purple-400 mr-2">🎭</span>
                  <span v-else-if="isPlayerAvailable(slot)" class="text-green-400 mr-2">✅</span>
                  <span v-else-if="isPlayerUnavailable(slot)" class="text-red-400 mr-2">❌</span>
                  <span v-else class="text-gray-400 mr-2">–</span>
                  {{ slot }}
                </div>
                <button
                  v-if="!isSelectionConfirmedByOrganizer"
                  @click="clearSlot(i)"
                  class="text-white/80 hover:text-white rounded-full hover:bg-white/10 px-2 py-1"
                  title="Retirer cette personne"
                >
                  ×
                </button>
                <div v-else class="w-6 h-6"></div>
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
                  v-else-if="!isSelectionConfirmedByOrganizer"
                  @click="startEditSlot(i)"
                  class="flex items-center gap-2 text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                  title="Ajouter une personne"
                >
                  <span class="text-lg">＋</span>
                  <span class="text-sm">Ajouter</span>
                </button>
                <div v-else class="text-white/40 text-sm">Verrouillé</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message d'information pour sélection à confirmer -->
        <div v-if="isSelectionConfirmedByOrganizer && !isSelectionConfirmed && !hasDeclinedPlayers" class="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-blue-200 text-sm">
            <span>⏳</span>
            <span><strong>Sélection temporaire verrouillée :</strong> Les personnes sélectionnées doivent confirmer leur participation. La sélection sera définitivement confirmée une fois que toutes auront validé. Utilisez le bouton "Demander confirmation" pour les notifier !</span>
          </div>
        </div>

        <!-- Message d'information pour sélection avec joueurs déclinés -->
        <div v-if="isSelectionConfirmedByOrganizer && hasDeclinedPlayers" class="mb-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-orange-200 text-sm">
            <span>⚠️</span>
            <span><strong>Sélection incomplète :</strong> Certaines personnes ont décliné leur participation. Cliquez sur Déverrouiller pour relancer la sélection et remplacer les personnes manquantes.</span>
          </div>
        </div>

        <!-- Message d'information pour sélection définitive -->
        <div v-if="isSelectionConfirmed" class="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-green-200 text-sm">
            <span>✅</span>
            <span><strong>Sélection définitive :</strong> S'il y a des changements de dernière minute cliquez sur Déverrouiller pour réouvrir la sélection.</span>
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
      <div class="sticky bottom-0 w-full p-3 bg-gray-900/80 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <!-- Bouton Sélection Auto (visible seulement si organisateur n'a pas encore validé) -->
        <button 
          v-if="!isSelectionConfirmedByOrganizer"
          @click="handleSelection" 
          :disabled="availableCount === 0" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 whitespace-nowrap" 
          :title="availableCount === 0 ? 'Aucune personne disponible' : (hasSelection ? 'Relancer la sélection automatique' : 'Lancer la sélection automatique')"
        >
          ✨ <span class="hidden sm:inline">Sélection Auto</span><span class="sm:hidden">Auto</span>
        </button>

        <!-- Bouton Déverrouiller (visible seulement si organisateur a validé) -->
        <button 
          v-if="isSelectionConfirmedByOrganizer" 
          @click="handleUnconfirmSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-colors duration-300 flex-1 whitespace-nowrap"
          title="Déverrouiller la sélection pour permettre les modifications"
        >
          🔓 <span class="hidden sm:inline">Déverrouiller</span><span class="sm:hidden">Déverrouiller</span>
        </button>

        <!-- Bouton Valider (visible seulement si sélection complète et organisateur n'a pas encore validé) -->
        <button 
          v-if="hasSelection && !isSelectionConfirmedByOrganizer" 
          @click="handleConfirmSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Valider la sélection et demander confirmation aux personnes"
        >
          ⏳ <span class="hidden sm:inline">Valider</span><span class="sm:hidden">Valider</span>
        </button>

        <!-- Bouton Demander confirmation (visible seulement si organisateur a validé ET on peut annoncer) -->
        <button 
          v-if="hasSelection && isSelectionConfirmedByOrganizer && canAnnounce" 
          @click="openAnnounce" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Demander confirmation aux personnes sélectionnées"
        >
          ⏳ <span class="hidden sm:inline">Demander confirmation</span><span class="sm:hidden">Confirmation</span>
        </button>

        <button @click="handlePerfect" class="h-12 px-3 md:px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex-1 whitespace-nowrap">
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
    :selected-players="getSelectedPlayersArray()"
    :sending="sending"
    :is-selection-confirmed-by-all-players="isSelectionConfirmed"
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
import SelectionStatusBadge from './SelectionStatusBadge.vue'
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
    type: [Array, Object],
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
  },
  // Nouvelle prop: état d'envoi des notifications (contrôlé par le parent)
  sending: {
    type: Boolean,
    default: false
  },
  // Nouvelle prop pour le statut de confirmation
  isSelectionConfirmed: {
    type: Boolean,
    default: false
  },
  // Nouvelle prop pour distinguer la validation organisateur de la confirmation joueurs
  isSelectionConfirmedByOrganizer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'selection', 'perfect', 'send-notifications', 'updateSelection', 'confirm-selection', 'unconfirm-selection'])

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
  // Ne pas permettre l'édition si l'organisateur a validé la sélection
  if (props.isSelectionConfirmedByOrganizer) return
  editingSlotIndex.value = index
}

function cancelEditSlot() {
  editingSlotIndex.value = null
}

async function onChooseForSlot(event, index) {
  // Ne pas permettre la modification si l'organisateur a validé la sélection
  if (props.isSelectionConfirmedByOrganizer) return
  
  const value = event?.target?.value || ''
  if (value) {
    const previousValue = slots.value[index]
    slots.value[index] = value
    
    // Logger l'audit de resélection
    try {
      const { default: AuditClient } = await import('../services/auditClient.js')
      await AuditClient.logUserAction({
        type: 'player_reselected',
        category: 'selection',
        severity: 'info',
        data: {
          eventTitle: props.event?.title || 'Unknown',
          seasonSlug: props.event?.seasonSlug || 'unknown',
          playerName: value,
          slotIndex: index,
          previousPlayer: previousValue || null,
          action: 'manual_selection'
        },
        success: true,
        tags: ['selection', 'manual', 'reselection']
      })
    } catch (auditError) {
      console.warn('Erreur audit onChooseForSlot:', auditError)
    }
    
    // Sauvegarde automatique immédiate
    await autoSaveSelection()
  }
  editingSlotIndex.value = null
}

async function clearSlot(index) {
  // Ne pas permettre la suppression si l'organisateur a validé la sélection
  if (props.isSelectionConfirmedByOrganizer) return
  
  const removedPlayer = slots.value[index]
  slots.value[index] = null
  
  // Logger l'audit de désélection
  if (removedPlayer) {
    try {
      const { default: AuditClient } = await import('../services/auditClient.js')
      await AuditClient.logUserAction({
        type: 'player_deselected',
        category: 'selection',
        severity: 'info',
        data: {
          eventTitle: props.event?.title || 'Unknown',
          seasonSlug: props.event?.seasonSlug || 'unknown',
          playerName: removedPlayer,
          slotIndex: index,
          action: 'manual_deselection'
        },
        success: true,
        tags: ['selection', 'manual', 'deselection']
      })
    } catch (auditError) {
      console.warn('Erreur audit clearSlot:', auditError)
    }
  }
  
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
  // Si currentSelection est un tableau (ancienne structure)
  if (Array.isArray(props.currentSelection)) {
    return props.currentSelection && props.currentSelection.length > 0
  }
  // Si currentSelection est un objet (nouvelle structure)
  if (props.currentSelection && typeof props.currentSelection === 'object') {
    return props.currentSelection.players && props.currentSelection.players.length > 0
  }
  return false
})

// Fonction pour déterminer le statut de sélection (même logique que getEventStatus dans GridBoard)
function getSelectionStatus() {
  // Extraire le tableau de joueurs selon la structure
  let selectedPlayers = []
  if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection || []
  } else if (props.currentSelection && typeof props.currentSelection === 'object') {
    selectedPlayers = props.currentSelection.players || []
  }
  const requiredCount = props.event?.playerCount || 6
  const availableCount = props.availableCount || 0
  
  // Cas 1: Sélection incomplète (sélection existante avec problèmes)
  if (selectedPlayers.length > 0) {
    const hasUnavailablePlayers = selectedPlayers.some(playerName => !isPlayerAvailable(playerName))
    const hasInsufficientPlayers = availableCount < requiredCount
    
    if (hasUnavailablePlayers || hasInsufficientPlayers) {
      return {
        type: 'incomplete',
        hasUnavailablePlayers,
        hasInsufficientPlayers,
        unavailablePlayers: selectedPlayers.filter(playerName => !isPlayerAvailable(playerName)),
        availableCount,
        requiredCount
      }
    }
  }
  
  // Cas 2: Pas assez de joueurs pour faire une sélection
  if (availableCount < requiredCount) {
    return {
      type: 'insufficient',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 3: Assez de joueurs mais pas de sélection
  if (selectedPlayers.length === 0) {
    return {
      type: 'ready',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 4: Tous les joueurs ont confirmé → Confirmée (définitive)
  if (props.isSelectionConfirmed) {
    return {
      type: 'confirmed',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 5: Confirmée par l'organisateur uniquement → À confirmer (en attente des joueurs)
  if (props.isSelectionConfirmedByOrganizer) {
    return {
      type: 'pending_confirmation',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 6: Sélection complète mais non confirmée par l'organisateur
  return {
    type: 'complete',
    availableCount,
    requiredCount
  }
}

const hasIncompleteSelection = computed(() => {
  if (!hasSelection.value) return false
  
  // Extraire le tableau de joueurs selon la structure
  let selectedPlayers = []
  if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection || []
  } else if (props.currentSelection && typeof props.currentSelection === 'object') {
    selectedPlayers = props.currentSelection.players || []
  }
  
  // Vérifier si des joueurs sélectionnés ne sont plus disponibles
  const hasUnavailablePlayers = selectedPlayers.some(player => !isPlayerAvailable(player))
  
  // Vérifier s'il y a assez de joueurs disponibles pour compléter la sélection
  const requiredCount = props.event?.playerCount || 6
  const hasInsufficientPlayers = props.availableCount < requiredCount
  
  return hasUnavailablePlayers || hasInsufficientPlayers
})

// Vérifier si des joueurs ont décliné leur participation
const hasDeclinedPlayers = computed(() => {
  if (!props.currentSelection || typeof props.currentSelection !== 'object' || !props.currentSelection.playerStatuses) {
    return false
  }
  
  // Utiliser Object.entries pour éviter les problèmes avec les Proxy Vue
  const hasDeclined = Object.entries(props.currentSelection.playerStatuses).some(([playerName, status]) => status === 'declined')
  return hasDeclined
})

// Vérifier si la sélection est complète (assez de joueurs pour l'événement)
const isSelectionComplete = computed(() => {
  const selectedPlayers = getSelectedPlayersArray()
  const requiredCount = props.event?.playerCount || 6
  return selectedPlayers.length >= requiredCount
})

// Vérifier si on peut demander confirmation (sélection complète ET pas de joueurs déclinés)
const canAnnounce = computed(() => {
  return isSelectionComplete.value && !hasDeclinedPlayers.value
})

const incompleteSelectionMessage = computed(() => {
  if (!hasIncompleteSelection.value) return ''
  
  // Extraire le tableau de joueurs selon la structure
  let selectedPlayers = []
  if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection || []
  } else if (props.currentSelection && typeof props.currentSelection === 'object') {
    selectedPlayers = props.currentSelection.players || []
  }
  
  const unavailablePlayers = selectedPlayers.filter(player => !isPlayerAvailable(player))
  const requiredCount = props.event?.playerCount || 6
  
  if (unavailablePlayers.length > 0) {
    if (unavailablePlayers.length === 1) {
      return `${unavailablePlayers[0]} n'est plus disponible. Veuillez relancer la sélection.`
    } else {
      return `${unavailablePlayers.length} personnes ne sont plus disponibles. Veuillez relancer la sélection.`
    }
  } else if (props.availableCount < requiredCount) {
    return `Seulement ${props.availableCount} personnes disponibles pour ${requiredCount} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de personnes à sélectionner.`
  }
  
  return 'Sélection incomplète'
})

// Fonction helper pour récupérer le statut de confirmation d'un joueur
function getPlayerSelectionStatus(playerName) {
  // Si currentSelection est un objet avec playerStatuses (nouvelle structure)
  if (props.currentSelection && typeof props.currentSelection === 'object' && !Array.isArray(props.currentSelection) && props.currentSelection.playerStatuses) {
    return props.currentSelection.playerStatuses[playerName] || 'pending'
  }
  // Si currentSelection est un tableau simple (ancienne structure) ou pas de playerStatuses
  return 'pending'
}

// Fonction helper pour générer le tooltip d'un slot de joueur
function getPlayerSlotTooltip(playerName) {
  if (props.isSelectionConfirmedByOrganizer) {
    const status = getPlayerSelectionStatus(playerName)
    switch (status) {
      case 'confirmed':
        return `${playerName} a confirmé sa participation`
      case 'declined':
        return `${playerName} a décliné sa participation`
      case 'pending':
        return `${playerName} doit encore confirmer sa participation`
      default:
        return playerName
    }
  } else {
    // Tooltip classique basé sur la disponibilité
    if (isPlayerAvailable(playerName)) {
      return `${playerName} est disponible`
    } else if (isPlayerUnavailable(playerName)) {
      return `${playerName} n'est pas disponible`
    } else {
      return `${playerName} - disponibilité non indiquée`
    }
  }
}

const selectionMessage = computed(() => {
  if (!props.event || !hasSelection.value) return ''
  
  // Extraire le tableau de joueurs selon la structure
  let selectedPlayers = []
  if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection || []
  } else if (props.currentSelection && typeof props.currentSelection === 'object') {
    selectedPlayers = props.currentSelection.players || []
  }
  
  const eventDate = formatDateFull(props.event.date)
  const playersList = selectedPlayers.join(', ')
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
    let filled = []
    if (Array.isArray(props.currentSelection)) {
      filled = [...props.currentSelection]
    } else if (props.currentSelection && typeof props.currentSelection === 'object') {
      filled = [...(props.currentSelection.players || [])]
    }
    const len = requiredCount.value
    slots.value = Array.from({ length: len }, (_, i) => filled[i] || null)
    editingSlotIndex.value = null
  }
})

// Rebuild slots when playerCount changes while open
watch([requiredCount, () => props.currentSelection, () => props.event?.id], () => {
  if (!props.show) return
  let filled = []
  if (Array.isArray(props.currentSelection)) {
    filled = [...props.currentSelection]
  } else if (props.currentSelection && typeof props.currentSelection === 'object') {
    filled = [...(props.currentSelection.players || [])]
  }
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

async function handleConfirmSelection() {
  try {
    // Émettre l'événement de confirmation vers le parent
    emit('confirm-selection')
    
    // Le toast de succès est affiché par le parent (GridBoard.vue)
  } catch (error) {
    console.error('Erreur lors de la confirmation de la sélection:', error)
    showSuccessMessage.value = true
    successMessageText.value = 'Erreur lors de la validation de la sélection'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

async function handleUnconfirmSelection() {
  try {
    // Émettre l'événement de déverrouillage vers le parent
    emit('unconfirm-selection')
    
    // Le toast de succès est affiché par le parent (GridBoard.vue)
  } catch (error) {
    console.error('Erreur lors de la déverrouillage de la sélection:', error)
    showSuccessMessage.value = true
    successMessageText.value = 'Erreur lors de la déverrouillage de la sélection'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}




async function autoSaveSelection() {
  if (!props.event?.id || !props.seasonId) return
  
  // Ne pas sauvegarder automatiquement si l'organisateur a validé la sélection
  if (props.isSelectionConfirmedByOrganizer) return
  
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

function getSelectedPlayersArray() {
  if (Array.isArray(props.currentSelection)) return props.currentSelection
  if (props.currentSelection && typeof props.currentSelection === 'object') return props.currentSelection.players || []
  return []
}

function isPlayerSelected(playerName) {
  // Un joueur est "sélectionné" s'il est dans la sélection actuelle ET disponible
  return getSelectedPlayersArray().includes(playerName) && isPlayerAvailable(playerName)
}

function isInSavedSelectionAndAvailable(playerName) {
  return getSelectedPlayersArray().includes(playerName) && isPlayerAvailable(playerName)
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
    return 'Aucune personne disponible'
  } else if (props.availableCount < requiredCount) {
    return 'Pas assez de personnes disponibles'
  } else {
    return 'Aucune sélection effectuée'
  }
}

function getInvitationMessage() {
  const requiredCount = props.event?.playerCount || 6
  
  if (props.availableCount === 0) {
    return 'Aucune personne n\'est disponible pour cet événement. Veuillez d\'abord indiquer les disponibilités.'
  } else if (props.availableCount < requiredCount) {
    return `Seulement ${props.availableCount} personnes disponibles pour ${requiredCount} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de personnes à sélectionner.`
  } else {
    return 'Cliquez sur "Sélection Auto" pour lancer le tirage automatique des personnes'
  }
}

// Fonction pour afficher le message de succès (appelée depuis le parent)
function showSuccess(reselection = false, isPartialUpdate = false) {
  isReselection.value = reselection
  
  if (reselection) {
    const eventDate = formatDateFull(props.event.date)
    const playersList = getSelectedPlayersArray().join(', ')
    
    if (isPartialUpdate) {
      successMessageText.value = `Sélection mise à jour pour ${props.event.title} du ${eventDate} : ${playersList}`
    } else {
      successMessageText.value = `Nouvelle sélection pour ${props.event.title} du ${eventDate} : ${playersList}`
    }
  } else {
            successMessageText.value = 'Sélection effectuée avec succès ! Cliquez sur "Valider" pour notifier les personnes.'
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

// Fermer automatiquement la modale d'annonce quand l'envoi se termine côté parent
watch(() => props.sending, (now, prev) => {
  if (prev && !now) {
    showAnnounce.value = false
  }
})
</script>
