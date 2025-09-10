<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[1390] p-0 md:p-4" @click="close">
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
             <h2 class="text-xl md:text-2xl font-bold text-white leading-tight mb-2">
               Composition d'équipe {{ event?.title }}
             </h2>
            
            <!-- Date + Badge nombre de joueurs -->
            <div class="flex items-center gap-3">
              <p class="text-base md:text-lg text-purple-300">{{ formatDateFull(event?.date) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Content scrollable -->
      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <!-- Équipe composée (avec édition inline et slots vides) -->
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-base md:text-lg font-semibold text-white">Équipe</h3>
            
            <!-- Badge statut de composition -->
            <SelectionStatusBadge
              :status="getSelectionStatus().type"
              :show="true"
              :clickable="false"
              :reason="selectionIncompleteReason"
              class="text-sm"
            />
            
            <!-- Badge nombre de personnes -->
            <div class="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-xs">
              <span class="text-blue-300">👥</span>
              <span class="text-blue-200">{{ getTotalTeamSize() }} personnes</span>
            </div>
            
            <button @click="openHowItWorks" class="text-blue-300 hover:text-blue-200 p-1 rounded-full hover:bg-blue-500/10 transition-colors" title="Comment fonctionne la composition automatique ?">
              <span class="text-sm">❓</span>
            </button>

          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-0">
            <div
              v-for="slot in teamSlots"
              :key="'sel-slot-'+slot.index"
              class="relative p-3 rounded-lg border text-center transition-colors"
              :class="slot.player
                ? [
                    'bg-gradient-to-r',
                    // Statuts de confirmation individuelle (priorité sur la disponibilité)
                    getPlayerSelectionStatus(slot.player) === 'declined'
                      ? 'from-red-500/20 to-orange-500/20 border-red-500/30'
                      : getPlayerSelectionStatus(slot.player) === 'confirmed'
                        ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
                        : getPlayerSelectionStatus(slot.player) === 'pending'
                          ? 'from-orange-500/20 to-yellow-500/20 border-orange-500/30'
                          // Statuts de disponibilité classique (seulement si pas de statut individuel)
                          : isPlayerUnavailable(slot.player)
                            ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                            : (!isPlayerAvailable(slot.player)
                                ? 'from-red-500/20 to-red-600/20 border-red-500/30'
                                : 'from-green-500/20 to-emerald-500/20 border-green-500/30')
                  ]
                : 'border-dashed border-white/20 hover:border-white/40 bg-white/5'"
            >
              <!-- Slot rempli -->
              <div v-if="slot.player" class="flex items-center justify-between gap-2">
                <div class="flex-1 flex items-center gap-2 min-w-0" :title="getPlayerSlotTooltip(slot.player)">
                  <!-- Avatar du joueur -->
                  <div class="flex-shrink-0">
                    <PlayerAvatar 
                      :player-id="getPlayerIdFromName(slot.player)"
                      :season-id="seasonId"
                      :player-name="slot.player"
                      size="sm"
                    />
                  </div>
                  
                  <!-- Nom du joueur + emoji du rôle -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <span class="text-white font-medium truncate">{{ slot.player }}</span>
                      <span class="text-lg flex-shrink-0">{{ slot.roleEmoji }}</span>
                    </div>
                  </div>
                </div>
                <button
                  v-if="!isSelectionConfirmedByOrganizer || isPlayerDeclined(slot.player)"
                  @click="clearSlot(slot.index)"
                  class="text-white/80 hover:text-white rounded-full hover:bg-white/10 px-2 py-1"
                  title="Retirer cette personne"
                >
                  ×
                </button>
                <div v-else class="w-6 h-6"></div>
              </div>

              <!-- Slot vide -->
              <div v-else class="flex items-center justify-center">
                <template v-if="editingSlotIndex === slot.index">
                  <select
                    class="w-full bg-gray-800 text-white rounded-md p-2 border border-white/20 focus:outline-none"
                    @change="onChooseForSlot($event, slot.index)"
                    @blur="cancelEditSlot()"
                  >
                    <option value="">— Choisir —</option>
                    <option v-for="name in availableOptionsForSlot(slot.index)" :key="name" :value="name">{{ name }}</option>
                  </select>
                </template>
                <button
                  v-else-if="!isSelectionConfirmedByOrganizer"
                  @click="startEditSlot(slot.index)"
                  class="flex items-center gap-2 text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                  title="Ajouter un {{ slot.roleLabel.toLowerCase() }}"
                >
                  <span class="text-lg">＋</span>
                  <span class="text-sm">{{ slot.roleLabel }}</span>
                  <span class="text-sm">{{ slot.roleEmoji }}</span>
                </button>
                <div v-else class="text-white/40 text-sm">Verrouillé</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message d'information pour composition à confirmer -->
        <div v-if="isSelectionConfirmedByOrganizer && !isSelectionConfirmed && !hasDeclinedPlayers" class="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-blue-200 text-sm">
            <span>⏳</span>
            <span><strong>Composition temporaire verrouillée :</strong> Les personnes composées doivent confirmer leur participation. La composition sera définitivement confirmée une fois que toutes auront validé. Utilisez le bouton "Demander confirmation" pour les notifier !</span>
          </div>
        </div>

        <!-- Message d'information pour composition avec joueurs déclinés -->
        <div v-if="isSelectionConfirmedByOrganizer && hasDeclinedPlayers" class="mb-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-orange-200 text-sm">
            <span>⚠️</span>
            <span><strong>Composition incomplète :</strong> Certaines personnes ont décliné leur participation. Cliquez sur Déverrouiller pour relancer la composition et remplacer les personnes manquantes.</span>
          </div>
        </div>

        <!-- Message d'information pour composition définitive -->
        <div v-if="isSelectionConfirmed" class="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-green-200 text-sm">
            <span>✅</span>
            <span><strong>Composition définitive :</strong> S'il y a des changements de dernière minute cliquez sur Déverrouiller pour réouvrir la composition.</span>
          </div>
        </div>



        <!-- 6) Message de succès après composition -->
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
        <!-- Bouton Composition Auto (visible seulement si organisateur n'a pas encore validé) -->
        <button 
          v-if="!isSelectionConfirmedByOrganizer"
          @click="handleSelection" 
          :disabled="availableCount === 0" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 whitespace-nowrap" 
          :title="availableCount === 0 ? 'Aucune personne disponible' : (isSelectionComplete ? 'Relancer complètement la composition' : 'Compléter les slots vides')"
        >
          ✨ <span class="hidden sm:inline">Composition Auto</span><span class="sm:hidden">Auto</span>
        </button>

        <!-- Bouton Déverrouiller (visible seulement si organisateur a validé) -->
        <button 
          v-if="isSelectionConfirmedByOrganizer" 
          @click="handleUnconfirmSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-colors duration-300 flex-1 whitespace-nowrap"
          title="Déverrouiller la composition pour permettre les modifications"
        >
          🔓 <span class="hidden sm:inline">Déverrouiller</span><span class="sm:hidden">Déverrouiller</span>
        </button>

        <!-- Bouton Valider (visible seulement si composition complète et organisateur n'a pas encore validé) -->
        <button 
          v-if="hasSelection && !isSelectionConfirmedByOrganizer" 
          @click="handleConfirmSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Valider la composition et demander confirmation aux personnes"
        >
          ⏳ <span class="hidden sm:inline">Valider</span><span class="sm:hidden">Valider</span>
        </button>

        <!-- Bouton Demander confirmation (visible seulement si organisateur a validé ET on peut annoncer) -->
        <button 
          v-if="hasSelection && isSelectionConfirmedByOrganizer && canAnnounce" 
          @click="openAnnounce" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Demander confirmation aux personnes composées"
        >
          ⏳ <span class="hidden sm:inline">Demander confirmation</span><span class="sm:hidden">Confirmation</span>
        </button>

        <!-- Bouton Réinitialiser (visible seulement si il y a une sélection ET que la composition n'est pas verrouillée) -->
        <button 
          v-if="hasSelection && !isSelectionConfirmedByOrganizer" 
          @click="handleResetSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Supprimer complètement la composition et remettre le statut à 'Nouveau'"
        >
          🔄 <span class="hidden sm:inline">Réinitialiser</span><span class="sm:hidden">Reset</span>
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

  <!-- Modale de confirmation de relance de composition -->
  <Teleport to="body">
    <div v-if="showConfirmReselect" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9995] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">🎭</span>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Confirmer la composition automatique</h3>
        <p class="text-gray-300 text-sm leading-relaxed">
          <span v-if="hasExistingSelection">Une composition existe déjà pour cet événement.</span>
          <span v-else>La composition sera mise à jour : les personnes disponibles seront conservées, les slots vides seront complétés.</span>
        </p>
      </div>

      <div class="flex justify-end space-x-3">
        <button @click="cancelReselect" class="px-6 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
        <button @click="confirmReselect" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300">Confirmer</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EventAnnounceModal from './EventAnnounceModal.vue'
import HowItWorksModal from './HowItWorksModal.vue'
import SelectionStatusBadge from './SelectionStatusBadge.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { saveCast } from '../services/storage.js'
import { ROLE_DISPLAY_ORDER, ROLE_EMOJIS, ROLE_LABELS_SINGULAR } from '../services/storage.js'

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

const emit = defineEmits(['close', 'selection', 'perfect', 'send-notifications', 'updateSelection', 'confirm-selection', 'unconfirm-selection', 'reset-selection', 'confirm-reselect'])

const copied = ref(false)
const copyButtonText = ref('Copier le message')
const showAnnounce = ref(false)
const showSuccessMessage = ref(false)
const successMessageText = ref('')
const isReselection = ref(false)
const showHowItWorks = ref(false)

// Variables pour la modale de confirmation de reselection
const showConfirmReselect = ref(false)
const hasExistingSelection = ref(false)

// --- Manual slots state ---
const requiredCount = computed(() => props.event?.playerCount || 6)
const slots = ref([])
const editingSlotIndex = ref(null)

// Nouvelle logique pour les slots multi-rôles
const teamSlots = computed(() => {
  if (!props.event?.roles) {
    // Fallback pour les anciens événements sans rôles
    return generateSlotsForLegacyEvent()
  }
  
  return generateSlotsForMultiRoleEvent()
})

function generateSlotsForLegacyEvent() {
  // Ancienne logique : slots simples basés sur playerCount
  let filled = []
  if (!props.currentSelection) {
    filled = []
  } else if (Array.isArray(props.currentSelection)) {
    filled = [...props.currentSelection]
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    filled = [...props.currentSelection.players]
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    filled = [...new Set(allPlayers)]
  }
  
  const len = requiredCount.value
  return Array.from({ length: len }, (_, i) => ({
    index: i,
    player: filled[i] || null,
    role: 'player',
    roleEmoji: '🎭',
    roleLabel: 'Comédien',
    isEmpty: !filled[i],
    isLegacy: true
  }))
}

function generateSlotsForMultiRoleEvent() {
  const roles = props.event.roles
  const slots = []
  let slotIndex = 0
  
  // Parcourir les rôles dans l'ordre d'affichage
  for (const role of ROLE_DISPLAY_ORDER) {
    const count = roles[role] || 0
    if (count > 0) {
      // Récupérer les joueurs déjà composés pour ce rôle
      const selectedPlayers = props.currentSelection?.roles?.[role] || []
      
      // Filtrer les joueurs qui ont décliné
      const availablePlayers = selectedPlayers.filter(playerName => {
        if (!playerName) return false
        const status = props.currentSelection?.playerStatuses?.[playerName]
        return status !== 'declined'
      })
      
      // Créer les slots pour ce rôle
      for (let i = 0; i < count; i++) {
        const player = availablePlayers[i] || null
        slots.push({
          index: slotIndex++,
          player: player,
          role: role,
          roleEmoji: ROLE_EMOJIS[role],
          roleLabel: ROLE_LABELS_SINGULAR[role],
          isEmpty: !player,
          isLegacy: false
        })
      }
    }
  }
  
  return slots
}





const allAvailableNames = computed(() => {
  return (props.players || [])
    .map(p => p.name)
    .filter(name => props.playerAvailability?.[name] === true)
    .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
})

function availableOptionsForSlot(index) {
  // Récupérer tous les joueurs déjà utilisés dans tous les slots
  const used = new Set()
  teamSlots.value.forEach(slot => {
    if (slot.player) {
      used.add(slot.player)
    }
  })
  
  // Si on édite un slot qui a déjà une valeur, permettre de la garder
  const currentSlot = teamSlots.value.find(s => s.index === index)
  if (currentSlot && currentSlot.player) {
    used.delete(currentSlot.player)
  }
  
  return allAvailableNames.value.filter(name => !used.has(name))
}

function startEditSlot(index) {
  // Ne pas permettre l'édition si l'organisateur a validé la composition
  if (props.isSelectionConfirmedByOrganizer) return
  editingSlotIndex.value = index
}

function cancelEditSlot() {
  editingSlotIndex.value = null
}

async function onChooseForSlot(event, index) {
  // Ne pas permettre la modification si l'organisateur a validé la composition
  if (props.isSelectionConfirmedByOrganizer) return
  
  const value = event?.target?.value || ''
  if (value) {
    const currentSlot = teamSlots.value.find(s => s.index === index)
    const previousValue = currentSlot?.player || null
    
    // Mettre à jour le slot dans teamSlots
    if (currentSlot) {
      currentSlot.player = value
    }
    
    // Mettre à jour aussi l'ancien système de slots pour la compatibilité
    if (slots.value[index] !== undefined) {
      slots.value[index] = value
    }
    
    // Logger l'audit de recomposition
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
  // Trouver le slot et le joueur
  const currentSlot = teamSlots.value.find(s => s.index === index)
  const playerName = currentSlot?.player
  
  // Ne pas permettre la suppression si l'organisateur a validé la composition
  // SAUF si le joueur a décliné (cas de remplacement)
  if (props.isSelectionConfirmedByOrganizer && !isPlayerDeclined(playerName)) return
  
  const removedPlayer = currentSlot?.player || slots.value[index]
  
  // Vider le slot dans teamSlots
  if (currentSlot) {
    currentSlot.player = null
    currentSlot.isEmpty = true
  }
  
  // Vider aussi dans l'ancien système pour la compatibilité
  if (slots.value[index] !== undefined) {
    slots.value[index] = null
  }
  
    // Logger l'audit de décomposition
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
  if (!props.currentSelection) return false
  
  if (Array.isArray(props.currentSelection)) {
    // Ancienne structure (array direct)
    return props.currentSelection.length > 0
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    // Nouvelle structure avec players
    return props.currentSelection.players.length > 0
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    // Nouvelle structure multi-rôles : vérifier s'il y a des joueurs dans tous les rôles
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers) && rolePlayers.length > 0) {
        return true
      }
    }
  }
  return false
})

// Fonction pour déterminer le statut de composition (même logique que getEventStatus dans GridBoard)
function getSelectionStatus() {
  // Extraire le tableau de joueurs selon la structure (même logique que getSelectionPlayers dans GridBoard)
  let selectedPlayers = []
  
  if (!props.currentSelection) {
    selectedPlayers = []
  } else if (Array.isArray(props.currentSelection)) {
    // Ancienne structure (array direct)
    selectedPlayers = props.currentSelection
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    // Nouvelle structure avec players
    selectedPlayers = props.currentSelection.players
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    // Nouvelle structure multi-rôles : extraire tous les joueurs de tous les rôles
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    // Retourner un tableau unique (sans doublons)
    selectedPlayers = [...new Set(allPlayers)]
  }
  // Calculer le nombre total requis (même logique que getTotalRequiredCount dans GridBoard)
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  const availableCount = props.availableCount || 0
  
  // Cas 1: Composition incomplète (composition existante avec problèmes)
  if (selectedPlayers.length > 0) {
    const hasUnavailablePlayers = selectedPlayers.some(playerName => !isPlayerAvailable(playerName))
    const hasInsufficientPlayers = availableCount < requiredCount
    
    // Vérifier si des joueurs sélectionnés ont décliné
    const hasDeclinedPlayers = selectedPlayers.some(playerName => {
      return props.currentSelection?.playerStatuses?.[playerName] === 'declined'
    })
    
    if (hasUnavailablePlayers || hasInsufficientPlayers || hasDeclinedPlayers) {
      return {
        type: 'incomplete',
        hasUnavailablePlayers,
        hasInsufficientPlayers,
        hasDeclinedPlayers,
        unavailablePlayers: selectedPlayers.filter(playerName => !isPlayerAvailable(playerName)),
        declinedPlayers: selectedPlayers.filter(playerName => 
          props.currentSelection?.playerStatuses?.[playerName] === 'declined'
        ),
        availableCount,
        requiredCount
      }
    }
  }
  
  // Cas 2: Pas assez de joueurs pour faire une composition
  if (availableCount < requiredCount) {
    return {
      type: 'insufficient',
      availableCount,
      requiredCount
    }
  }
  
  // Cas 3: Assez de joueurs mais pas de composition
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
  
  // Cas 6: Composition complète mais non confirmée par l'organisateur
  return {
    type: 'complete',
    availableCount,
    requiredCount
  }
}

const hasIncompleteSelection = computed(() => {
  if (!hasSelection.value) return false
  
  // Extraire le tableau de joueurs selon la structure (même logique que getSelectionPlayers)
  let selectedPlayers = []
  
  if (!props.currentSelection) {
    selectedPlayers = []
  } else if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    selectedPlayers = props.currentSelection.players
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    selectedPlayers = [...new Set(allPlayers)]
  }
  
  // Vérifier si des joueurs composés ne sont plus disponibles
  const hasUnavailablePlayers = selectedPlayers.some(player => !isPlayerAvailable(player))
  
  // Vérifier si des joueurs sélectionnés ont décliné
  const hasDeclinedPlayers = selectedPlayers.some(player => {
    return props.currentSelection?.playerStatuses?.[player] === 'declined'
  })
  
  // Vérifier s'il y a assez de joueurs disponibles pour compléter la composition
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  const hasInsufficientPlayers = props.availableCount < requiredCount
  
  return hasUnavailablePlayers || hasInsufficientPlayers || hasDeclinedPlayers
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

// Fonction pour vérifier si un joueur spécifique a décliné
function isPlayerDeclined(playerName) {
  if (!playerName || !props.currentSelection || typeof props.currentSelection !== 'object' || !props.currentSelection.playerStatuses) {
    return false
  }
  
  return props.currentSelection.playerStatuses[playerName] === 'declined'
}

// Vérifier si la composition est complète (assez de joueurs pour l'événement)
const isSelectionComplete = computed(() => {
  const selectedPlayers = getSelectedPlayersArray()
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  return selectedPlayers.length >= requiredCount
})

// Vérifier si on peut demander confirmation (composition complète ET pas de joueurs déclinés)
const canAnnounce = computed(() => {
  return isSelectionComplete.value && !hasDeclinedPlayers.value
})

// Raison de l'incomplétude pour le tooltip du badge
const selectionIncompleteReason = computed(() => {
  if (!hasIncompleteSelection.value) return ''
  
  // Extraire le tableau de joueurs selon la structure (même logique que getSelectionPlayers)
  let selectedPlayers = []
  
  if (!props.currentSelection) {
    selectedPlayers = []
  } else if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    selectedPlayers = props.currentSelection.players
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    selectedPlayers = [...new Set(allPlayers)]
  }
  
  const unavailablePlayers = selectedPlayers.filter(player => !isPlayerAvailable(player))
  const declinedPlayers = selectedPlayers.filter(player => 
    props.currentSelection?.playerStatuses?.[player] === 'declined'
  )
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  
  if (declinedPlayers.length > 0) {
    if (declinedPlayers.length === 1) {
      return `Sélection incomplète : ${declinedPlayers[0]} a décliné`
    } else {
      return `Sélection incomplète : ${declinedPlayers.length} joueurs ont décliné`
    }
  } else if (unavailablePlayers.length > 0) {
    if (unavailablePlayers.length === 1) {
      return `Sélection incomplète : ${unavailablePlayers[0]} n'est plus disponible`
    } else {
      return `Sélection incomplète : ${unavailablePlayers.length} joueurs ne sont plus disponibles`
    }
  } else if (props.availableCount < requiredCount) {
    return `Sélection incomplète : Seulement ${props.availableCount} joueurs disponibles sur ${requiredCount} requis`
  }
  
  return 'Sélection incomplète : Problèmes détectés'
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
  
  // Extraire le tableau de joueurs selon la structure (même logique que getSelectionPlayers)
  let selectedPlayers = []
  if (!props.currentSelection) {
    selectedPlayers = []
  } else if (Array.isArray(props.currentSelection)) {
    selectedPlayers = props.currentSelection
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    selectedPlayers = props.currentSelection.players
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    selectedPlayers = [...new Set(allPlayers)]
  }
  
  const eventDate = formatDateFull(props.event.date)
  const playersList = selectedPlayers.join(', ')
  return `Composition pour ${props.event.title} du ${eventDate} : ${playersList}`
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
    if (!props.currentSelection) {
      filled = []
    } else if (Array.isArray(props.currentSelection)) {
      filled = [...props.currentSelection]
    } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
      filled = [...props.currentSelection.players]
    } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
      const allPlayers = []
      for (const rolePlayers of Object.values(props.currentSelection.roles)) {
        if (Array.isArray(rolePlayers)) {
          allPlayers.push(...rolePlayers)
        }
      }
      filled = [...new Set(allPlayers)]
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
  if (!props.currentSelection) {
    filled = []
  } else if (Array.isArray(props.currentSelection)) {
    filled = [...props.currentSelection]
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    filled = [...props.currentSelection.players]
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    filled = [...new Set(allPlayers)]
  }
  const len = requiredCount.value
  
  // Nettoyer complètement les slots et les remplir avec les nouvelles données
  // Ne pas conserver les anciennes valeurs résiduelles
  const next = Array.from({ length: len }, (_, i) => filled[i] || null)
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
  showReselectConfirmation()
}

function handlePerfect() {
  emit('perfect')
}

async function handleResetSelection() {
  if (!props.event?.id || !props.seasonId) return
  
  try {
    // Importer les fonctions nécessaires depuis storage.js
    const { deleteCast } = await import('../services/storage.js')
    
    // Supprimer la composition existante
    await deleteCast(props.event.id, props.seasonId)
    
    // Émettre l'événement pour mettre à jour l'interface parent
    emit('reset-selection')
    
    // Fermer la modale
    emit('close')
    
    // Afficher un message de succès
    showSuccessMessage.value = true
    successMessageText.value = 'Composition réinitialisée !'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la sélection:', error)
    showSuccessMessage.value = true
    successMessageText.value = 'Erreur lors de la réinitialisation'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

async function handleConfirmSelection() {
  try {
    // Émettre l'événement de confirmation vers le parent
    emit('confirm-selection')
    
    // Le toast de succès est affiché par le parent (GridBoard.vue)
  } catch (error) {
    console.error('Erreur lors de la confirmation de la composition:', error)
    showSuccessMessage.value = true
    successMessageText.value = 'Erreur lors de la validation de la composition'
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
    console.error('Erreur lors de la déverrouillage de la composition:', error)
    showSuccessMessage.value = true
    successMessageText.value = 'Erreur lors de la déverrouillage de la composition'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}





async function autoSaveSelection() {
  if (!props.event?.id || !props.seasonId) return
  
  // Ne pas sauvegarder automatiquement si l'organisateur a validé la composition
  if (props.isSelectionConfirmedByOrganizer) return
  
  try {
    // Construire la structure par rôle à partir de teamSlots
    const roles = {}
    
    teamSlots.value.forEach(slot => {
      if (slot.player) {
        if (!roles[slot.role]) {
          roles[slot.role] = []
        }
        roles[slot.role].push(slot.player)
      }
    })
    
    // Sauvegarde avec la nouvelle structure par rôle
    await saveCast(props.event.id, roles, props.seasonId)
    
    // Feedback visuel subtil (optionnel)
    console.debug('Composition sauvegardée automatiquement avec structure par rôle')
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
  if (!props.currentSelection) return []
  
  if (Array.isArray(props.currentSelection)) {
    // Ancienne structure (array direct)
    return props.currentSelection
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    // Nouvelle structure avec players
    return props.currentSelection.players
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    // Nouvelle structure multi-rôles : extraire tous les joueurs de tous les rôles
    const allPlayers = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    // Retourner un tableau unique (sans doublons)
    return [...new Set(allPlayers)]
  }
  
  return []
}

function isPlayerSelected(playerName) {
  // Un joueur est "composé" s'il est dans la composition actuelle ET disponible
  return getSelectedPlayersArray().includes(playerName) && isPlayerAvailable(playerName)
}

function isInSavedSelectionAndAvailable(playerName) {
  return getSelectedPlayersArray().includes(playerName) && isPlayerAvailable(playerName)
}

// Fonction pour calculer la taille totale de l'équipe
function getTotalTeamSize() {
  return props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((total, count) => total + (count || 0), 0)
    : (props.event?.playerCount || 6)
}

// Fonction helper pour récupérer l'ID du joueur à partir de son nom
function getPlayerIdFromName(playerName) {
  if (!playerName || !props.players) return null
  const player = props.players.find(p => p.name === playerName)
  return player?.id || null
}

// Fonctions pour l'invitation à la composition
function getInvitationIcon() {
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  
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
    return 'Aucune composition effectuée'
  }
}

function getInvitationMessage() {
  const requiredCount = props.event?.playerCount || 6
  
  if (props.availableCount === 0) {
    return 'Aucune personne n\'est disponible pour cet événement. Veuillez d\'abord indiquer les disponibilités.'
  } else if (props.availableCount < requiredCount) {
    return `Seulement ${props.availableCount} personnes disponibles pour ${requiredCount} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de personnes à composer.`
  } else {
            return 'Cliquez sur "Composition Auto" pour constituer une équipe automatiquement'
  }
}

// Fonction pour afficher le message de succès (appelée depuis le parent)
function showSuccess(reselection = false, isPartialUpdate = false) {
  isReselection.value = reselection
  
  if (reselection) {
    const eventDate = formatDateFull(props.event.date)
    const playersList = getSelectedPlayersArray().join(', ')
    
    if (isPartialUpdate) {
      successMessageText.value = `Composition mise à jour pour ${props.event.title} du ${eventDate} : ${playersList}`
    } else {
      successMessageText.value = `Nouvelle composition pour ${props.event.title} du ${eventDate} : ${playersList}`
    }
  } else {
            successMessageText.value = 'Composition effectuée avec succès ! Cliquez sur "Valider" pour notifier les personnes.'
  }
  
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 8000)
}

function hideSuccessMessage() {
  showSuccessMessage.value = false
}

// Fonctions pour la modale de confirmation de reselection
function showReselectConfirmation() {
  hasExistingSelection.value = props.currentSelection && props.currentSelection.length > 0
  showConfirmReselect.value = true
}

function cancelReselect() {
  showConfirmReselect.value = false
  hasExistingSelection.value = false
}

function confirmReselect() {
  showConfirmReselect.value = false
  hasExistingSelection.value = false
  // Émettre l'événement vers le parent pour déclencher la composition automatique
  emit('confirm-reselect')
}

// Exposer la fonction pour le parent
defineExpose({
  showSuccess,
  showReselectConfirmation
})

// Fonction pour gérer l'envoi d'emails de composition
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
