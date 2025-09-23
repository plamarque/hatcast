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
                      ? 'from-red-500/60 to-orange-500/60 border-red-500/30'
                      : getPlayerSelectionStatus(slot.player) === 'confirmed'
                        ? 'from-purple-500/60 to-pink-500/60 border-purple-500/30'
                        : getPlayerSelectionStatus(slot.player) === 'pending'
                          ? 'from-orange-500/60 to-yellow-500/60 border-orange-500/30'
                          // Statuts de disponibilité classique (seulement si pas de statut individuel)
                          : isPlayerUnavailable(slot.player)
                            ? 'from-yellow-500/60 to-orange-500/60 border-yellow-500/30'
                            : (!isPlayerAvailable(slot.player)
                                ? 'from-red-500/60 to-red-600/60 border-red-500/30'
                                : 'from-green-500/60 to-emerald-500/60 border-green-500/30')
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
                  v-if="canEditEvents && (!isSelectionConfirmedByOrganizer || isPlayerDeclined(slot.player))"
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
                  v-else
                  @click="startEditSlot(slot.index)"
                  class="flex items-center gap-2 text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                  :title="isSelectionConfirmedByOrganizer ? 'Ajouter un {{ slot.roleLabel.toLowerCase() }} (sélection verrouillée)' : 'Ajouter un {{ slot.roleLabel.toLowerCase() }}'"
                >
                  <span class="text-lg">＋</span>
                  <span class="text-sm">{{ slot.roleLabel }}</span>
                  <span class="text-sm">{{ slot.roleEmoji }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Section des joueurs déclinés -->
        <div v-if="hasDeclinedPlayers" class="mb-4">
          <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>❌</span>
            <span>Personnes ayant décliné</span>
            <span class="text-sm text-gray-400">(ne comptent pas dans la composition)</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="declinedPlayer in getDeclinedPlayers()"
              :key="'declined-'+declinedPlayer.name"
              class="p-3 rounded-lg border bg-gradient-to-r from-red-500/60 to-orange-500/60 border-red-500/30"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1 flex items-center gap-2 min-w-0">
                  <!-- Avatar du joueur -->
                  <div class="flex-shrink-0">
                    <PlayerAvatar 
                      :player-id="getPlayerIdFromName(declinedPlayer.name)"
                      :season-id="seasonId"
                      :player-name="declinedPlayer.name"
                      size="sm"
                    />
                  </div>
                  
                  <!-- Nom du joueur + emoji du rôle -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                      <span class="text-white font-medium truncate">{{ declinedPlayer.name }}</span>
                      <span class="text-lg flex-shrink-0">{{ declinedPlayer.roleEmoji }}</span>
                    </div>
                  </div>
                </div>
                <button
                  v-if="!isSelectionConfirmedByOrganizer"
                  @click="moveDeclinedToComposition(declinedPlayer)"
                  class="text-white/80 hover:text-white rounded-full hover:bg-white/10 px-2 py-1"
                  title="Remettre en composition"
                >
                  ↶
                </button>
                <div v-else class="w-6 h-6"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message d'information pour composition à confirmer -->
        <div v-if="isSelectionConfirmedByOrganizer && !isSelectionConfirmed && !hasDeclinedPlayers" class="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-blue-200 text-sm">
            <span>⏳</span>
            <span><strong>Composition verrouillée :</strong> Les personnes ci-dessus doivent confirmer leur participation. La composition sera définitivement confirmée lorsque tout le monde aura confirmé. Utilisez le bouton "Demander confirmation" pour les notifier !</span>
          </div>
        </div>

        <!-- Message d'information pour composition avec joueurs déclinés -->
        <div v-if="isSelectionConfirmedByOrganizer && hasDeclinedPlayers" class="mb-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div class="flex items-center gap-2 text-orange-200 text-sm">
            <span>⚠️</span>
            <span><strong>Équipe incomplète :</strong> Certaines personnes ont décliné leur participation. Cliquez sur "Compléter" pour compléter les places vides avec de nouvelles personnes</span>
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
        <!-- Bouton Composition Auto (visible seulement si organisateur n'a pas encore validé ET permissions d'édition) -->
        <button 
          v-if="!isSelectionConfirmedByOrganizer && canEditEvents"
          @click="handleSelection" 
          :disabled="availableCount === 0" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 whitespace-nowrap" 
          :title="availableCount === 0 ? 'Aucune personne disponible' : (isSelectionComplete ? 'Relancer complètement la composition' : 'Compléter les slots vides')"
        >
          ✨ <span class="hidden sm:inline">Composition Auto</span><span class="sm:hidden">Auto</span>
        </button>

        <!-- Bouton Compléter Compo (visible seulement si organisateur a validé ET qu'il y a des slots vides ET permissions d'édition) -->
        <button 
          v-if="isSelectionConfirmedByOrganizer && hasEmptySlots && canEditEvents" 
          @click="handleCompleteSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-colors duration-300 flex-1 whitespace-nowrap"
          title="Compléter les slots vides avec des joueurs disponibles"
        >
          🔧 <span class="hidden sm:inline">Compléter</span><span class="sm:hidden">Compléter</span>
        </button>

        <!-- Bouton Déverrouiller (visible seulement si organisateur a validé ET permissions d'édition) -->
        <button 
          v-if="isSelectionConfirmedByOrganizer && canEditEvents" 
          @click="handleUnconfirmSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-colors duration-300 flex-1 whitespace-nowrap"
          title="Déverrouiller la composition pour permettre les modifications"
        >
          🔓 <span class="hidden sm:inline">Déverrouiller</span><span class="sm:hidden">Déverrouiller</span>
        </button>

        <!-- Bouton Valider (visible seulement si composition complète et organisateur n'a pas encore validé ET permissions d'édition) -->
        <button 
          v-if="hasSelection && !isSelectionConfirmedByOrganizer && canEditEvents" 
          @click="handleConfirmSelection" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Valider la composition et demander confirmation aux personnes"
        >
          ⏳ <span class="hidden sm:inline">Valider</span><span class="sm:hidden">Valider</span>
        </button>

        <!-- Bouton Demander confirmation (visible seulement si organisateur a validé ET permissions d'édition) -->
        <button 
          v-if="hasSelection && isSelectionConfirmedByOrganizer && canEditEvents" 
          @click="openAnnounce" 
          class="h-12 px-3 md:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex-1 whitespace-nowrap"
          title="Demander confirmation aux personnes composées"
        >
          ⏳ <span class="hidden sm:inline">Demander confirmation</span><span class="sm:hidden">Confirmation</span>
        </button>

        <!-- Bouton Réinitialiser (visible seulement si il y a une sélection ET que la composition n'est pas verrouillée ET permissions d'édition) -->
        <button 
          v-if="hasSelection && !isSelectionConfirmedByOrganizer && canEditEvents" 
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
import { ref, computed, watch, nextTick } from 'vue'
import EventAnnounceModal from './EventAnnounceModal.vue'
import HowItWorksModal from './HowItWorksModal.vue'
import SelectionStatusBadge from './SelectionStatusBadge.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { saveCast } from '../services/storage.js'
import { ROLE_DISPLAY_ORDER, ROLE_EMOJIS, ROLE_LABELS_SINGULAR } from '../services/storage.js'
import { getPlayerCastStatus } from '../services/castService.js'

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
  availability: {
    type: Object,
    default: () => ({})
  },
  isAvailableForRole: {
    type: Function,
    default: () => false
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
  },
  // Prop pour vérifier les permissions d'édition (admin de saison)
  canEditEvents: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'selection', 'perfect', 'send-notifications', 'updateCast', 'confirm-selection', 'unconfirm-selection', 'reset-selection', 'confirm-reselect', 'complete-selection'])

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
  return Array.from({ length: len }, (_, i) => {
    const playerId = filled[i] || null
    const playerName = playerId ? getPlayerNameFromId(playerId) : null
    return {
      index: i,
      player: playerName, // Afficher le nom du joueur, pas l'ID
      playerId: playerId, // Garder l'ID pour les opérations internes
      role: 'player',
      roleEmoji: '🎭',
      roleLabel: 'Comédien',
      isEmpty: !playerName,
      isLegacy: true
    }
  })
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
      
      // Créer les slots pour ce rôle (afficher tous les joueurs, même ceux qui ont décliné)
      for (let i = 0; i < count; i++) {
        const playerId = selectedPlayers[i] || null
        const playerName = playerId ? getPlayerNameFromId(playerId) : null
        slots.push({
          index: slotIndex++,
          player: playerName, // Afficher le nom du joueur, pas l'ID
          playerId: playerId, // Garder l'ID pour les opérations internes
          role: role,
          roleEmoji: ROLE_EMOJIS[role],
          roleLabel: ROLE_LABELS_SINGULAR[role],
          isEmpty: !playerName,
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
    .filter(name => {
      // Vérifier si le joueur est disponible pour au moins un rôle
      if (!props.event?.roles) {
        return props.isAvailableForRole(name, 'player', props.event?.id)
      }
      
      // Pour les événements multi-rôles, vérifier si disponible pour au moins un rôle requis
      for (const role of Object.keys(props.event.roles)) {
        if (props.event.roles[role] > 0 && props.isAvailableForRole(name, role, props.event.id)) {
          return true
        }
      }
      return false
    })
    .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
})


function availableOptionsForSlot(index) {
  // Récupérer le slot actuel pour connaître son rôle
  const currentSlot = teamSlots.value.find(s => s.index === index)
  if (!currentSlot) {
    return []
  }
  
  const requiredRole = currentSlot.role
  
  // Récupérer tous les joueurs déjà utilisés dans tous les slots
  const used = new Set()
  teamSlots.value.forEach(slot => {
    if (slot.player) {
      used.add(slot.player)
    }
  })
  
  // Si on édite un slot qui a déjà une valeur, permettre de la garder
  if (currentSlot && currentSlot.player) {
    used.delete(currentSlot.player)
  }
  
  // Filtrer les joueurs disponibles pour ce rôle spécifique
  return allAvailableNames.value.filter(name => {
    // Vérifier que le joueur n'est pas déjà utilisé
    if (used.has(name)) {
      return false
    }
    
    // Vérifier que le joueur est disponible pour ce rôle spécifique
    return props.isAvailableForRole(name, requiredRole, props.event?.id)
  })
}

function startEditSlot(index) {
  // Permettre l'édition des slots vides même si la sélection est verrouillée
  // (pour complétion manuelle des slots vides)
  editingSlotIndex.value = index
}

function cancelEditSlot() {
  editingSlotIndex.value = null
}

async function onChooseForSlot(event, index) {
  // Permettre la sélection dans les slots vides même si la sélection est verrouillée
  // (pour complétion manuelle des slots vides)
  
  const playerName = event?.target?.value || ''
  if (playerName) {
    const currentSlot = teamSlots.value.find(s => s.index === index)
    const previousValue = currentSlot?.player || null
    
    // Convertir le nom en ID pour la sauvegarde
    const playerId = getPlayerIdFromName(playerName)
    if (!playerId) {
      console.error('ID de joueur non trouvé pour:', playerName)
      return
    }
    
    // Mettre à jour le slot dans teamSlots (afficher le nom, sauvegarder l'ID)
    if (currentSlot) {
      currentSlot.player = playerName // Affichage
      currentSlot.playerId = playerId // Sauvegarde
    }
    
    // Mettre à jour aussi l'ancien système de slots pour la compatibilité (avec protection)
    if (slots.value && slots.value[index] !== undefined) {
      // Utiliser nextTick pour éviter les problèmes de démontage
      await nextTick()
      if (slots.value && slots.value[index] !== undefined) {
        slots.value[index] = playerId // Sauvegarder l'ID
      }
    }
    
    // Logger l'audit de recomposition
    try {
      const { default: AuditClient } = await import('../services/auditClient.js')
      await AuditClient.logUserAction({
        type: 'player_recast',
        category: 'cast',
        severity: 'info',
        data: {
          eventTitle: props.event?.title || 'Unknown',
          seasonSlug: props.event?.seasonSlug || 'unknown',
          playerName: value,
          slotIndex: index,
          previousPlayer: previousValue || null
        },
        success: true,
        tags: ['cast', 'manual', 'recast']
      })
    } catch (auditError) {
      console.warn('Erreur audit onChooseForSlot:', auditError)
    }
    
    // Sauvegarde automatique immédiate (inclut le recalcul du statut et l'émission d'événement)
    if (props.isSelectionConfirmedByOrganizer) {
      // Sauvegarde spéciale pour les slots vides dans une sélection verrouillée
      await saveEmptySlotSelection()
    } else {
      await autoSaveSelection()
    }
  }
  editingSlotIndex.value = null
}

async function clearSlot(index) {
  // Trouver le slot et le joueur
  const currentSlot = teamSlots.value.find(s => s.index === index)
  const playerName = currentSlot?.player
  
  // Ne pas permettre la suppression si l'organisateur a validé la composition
  // SAUF si le joueur a décliné (cas de remplacement)
  if (props.isSelectionConfirmedByOrganizer && !isPlayerDeclined(playerName)) {
    return
  }
  
  const removedPlayer = currentSlot?.player || slots.value[index]
  const role = currentSlot?.role || 'player'
  
  // Si c'est un joueur décliné, le supprimer complètement
  if (isPlayerDeclined(playerName)) {
    // Vider le slot dans teamSlots
    if (currentSlot) {
      currentSlot.player = null
      currentSlot.playerId = null
      currentSlot.isEmpty = true
    }
    
    // Vider aussi dans l'ancien système pour la compatibilité
    if (slots.value && slots.value[index] !== undefined) {
      await nextTick()
      if (slots.value && slots.value[index] !== undefined) {
        slots.value[index] = null
      }
    }
  } else {
    // Si c'est un joueur normal, le déplacer vers les déclinés
    await movePlayerToDeclined(playerName, role)
    
    // Vider le slot dans teamSlots
    if (currentSlot) {
      currentSlot.player = null
      currentSlot.playerId = null
      currentSlot.isEmpty = true
    }
    
    // Vider aussi dans l'ancien système pour la compatibilité
    if (slots.value && slots.value[index] !== undefined) {
      await nextTick()
      if (slots.value && slots.value[index] !== undefined) {
        slots.value[index] = null
      }
    }
  }
  
  // Logger l'audit de suppression manuelle
  if (removedPlayer) {
    try {
      const { logManualCastRemoval } = await import('../services/selectionAuditService.js')
      const currentSlot = teamSlots.value.find(s => s.index === index)
      
      await logManualCastRemoval({
        eventId: props.event.id,
        eventTitle: props.event.title || 'Unknown',
        seasonSlug: props.event.seasonSlug || 'unknown',
        removedPlayer,
        role: currentSlot?.role || 'player',
        source: 'selection_modal'
      })
    } catch (auditError) {
      console.warn('Erreur audit suppression manuelle:', auditError)
    }
  }
  
  // Ne plus modifier automatiquement la disponibilité du joueur quand on l'enlève de la sélection
  // Le joueur garde sa disponibilité originale qu'il a définie lui-même
  
  // Sauvegarde immédiate même si la sélection est verrouillée (pour les joueurs déclinés)
  await saveSlotChanges()
  
  // Recalculer le statut après la sauvegarde
  try {
    const { updateCastStatus } = await import('../services/storage.js')
    await updateCastStatus(props.event.id, props.seasonId)
    
    // Émettre un événement pour que le parent recharge les données
    emit('updateCast')
  } catch (error) {
    console.warn('Erreur lors du recalcul du statut:', error)
  }
}

// Fonction pour sauvegarder les changements de slots même quand la sélection est verrouillée
async function saveSlotChanges() {
  if (!props.event?.id || !props.seasonId) {
    return
  }
  
  try {
    // Construire la structure par rôle à partir de teamSlots
    const roles = {}
    
    teamSlots.value.forEach(slot => {
      if (slot.playerId) { // Utiliser l'ID pour la sauvegarde
        if (!roles[slot.role]) {
          roles[slot.role] = []
        }
        roles[slot.role].push(slot.playerId)
      }
    })
    
    // Sauvegarder avec la nouvelle structure par rôle en préservant le statut de confirmation et les joueurs déclinés
    const { saveCast } = await import('../services/storage.js')
    await saveCast(props.event.id, roles, props.seasonId, { 
      preserveConfirmed: true,
      declined: props.currentSelection?.declined || {} // Préserver la section déclinés
    })
    
    // Émettre un événement pour que le parent recharge les données
    emit('updateCast')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des changements de slots:', error)
  }
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

// Fonction pour déterminer le statut de composition (utilise le statut calculé stocké en base)
function getSelectionStatus() {
  // Si la sélection a un statut calculé stocké, l'utiliser
  if (props.currentSelection?.status && props.currentSelection?.statusDetails) {
    return {
      type: props.currentSelection.status,
      ...props.currentSelection.statusDetails
    }
  }
  
  // Fallback : calculer le statut localement (logique de compatibilité)
  const selectedPlayers = extractSelectedPlayers(props.currentSelection)
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  const availableCount = props.availableCount || 0
  
  // Logique de fallback simplifiée
  if (selectedPlayers.length === 0) {
    return { type: 'ready', availableCount, requiredCount }
  }
  
  const hasEmptySlots = teamSlots.value.some(slot => !slot.player)
  if (hasEmptySlots) {
    return { type: 'incomplete', hasEmptySlots: true, availableCount, requiredCount }
  }
  
  if (props.isSelectionConfirmed) {
    return { type: 'confirmed', availableCount, requiredCount }
  }
  
  if (props.isSelectionConfirmedByOrganizer) {
    return { type: 'pending_confirmation', availableCount, requiredCount }
  }
  
  return { type: 'complete', availableCount, requiredCount }
}

// Fonction helper pour extraire les joueurs sélectionnés
function extractSelectedPlayers(selection) {
  if (!selection) return []
  
  if (Array.isArray(selection)) {
    return selection
  } else if (selection.players && Array.isArray(selection.players)) {
    return selection.players
  } else if (selection.roles && typeof selection.roles === 'object') {
    const allPlayers = []
    for (const rolePlayers of Object.values(selection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayers.push(...rolePlayers)
      }
    }
    return [...new Set(allPlayers)]
  }
  
  return []
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

// Computed property pour détecter s'il y a des slots vides (vraiment vides, pas des joueurs déclinés)
const hasEmptySlots = computed(() => {
  // Un slot est vide seulement s'il n'y a pas de joueur assigné (null/undefined)
  // Les joueurs déclinés sont toujours affichés dans leur slot
  const hasEmpty = teamSlots.value.some(slot => !slot.player)
  console.debug('🔍 hasEmptySlots check:', { 
    teamSlots: teamSlots.value.map(s => ({ player: s.player, isEmpty: s.isEmpty })),
    hasEmpty 
  })
  return hasEmpty
})

// Vérifier si des joueurs ont décliné leur participation
const hasDeclinedPlayers = computed(() => {
  if (!props.currentSelection || typeof props.currentSelection !== 'object') {
    return false
  }
  
  // Vérifier dans la nouvelle structure declined
  if (props.currentSelection.declined && Object.keys(props.currentSelection.declined).length > 0) {
    return true
  }
  
  // Fallback sur l'ancienne structure playerStatuses
  if (props.currentSelection.playerStatuses) {
    const hasDeclined = Object.entries(props.currentSelection.playerStatuses).some(([playerId, status]) => status === 'declined')
    return hasDeclined
  }
  
  return false
})

// Fonction pour vérifier si un joueur spécifique a décliné
function isPlayerDeclined(playerName) {
  if (!playerName || !props.currentSelection || typeof props.currentSelection !== 'object' || !props.currentSelection.playerStatuses) {
    return false
  }
  
  // Convertir le nom en ID pour chercher dans playerStatuses
  const playerId = getPlayerIdFromName(playerName)
  if (!playerId) {
    return false
  }
  
  return props.currentSelection.playerStatuses[playerId] === 'declined'
}

// Vérifier si la composition est complète (assez de joueurs pour l'événement, excluant les déclinés)
const isSelectionComplete = computed(() => {
  // Compter seulement les joueurs dans les slots normaux (pas les déclinés)
  const activePlayers = teamSlots.value.filter(slot => slot.player).length
  const requiredCount = props.event?.roles && typeof props.event.roles === 'object' 
    ? Object.values(props.event.roles).reduce((sum, count) => sum + (count || 0), 0)
    : (props.event?.playerCount || 6)
  return activePlayers >= requiredCount
})

// canAnnounce supprimé : on peut toujours notifier les joueurs "à confirmer"

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
  return getPlayerCastStatus(props.currentSelection, playerName, props.players)
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

async function handleCompleteSelection() {
  try {
    // Émettre l'événement de complétion vers le parent
    emit('complete-selection')
    
    // Le toast de succès est affiché par le parent (GridBoard.vue)
  } catch (error) {
    console.error('Erreur lors de la complétion de la composition:', error)
    showSuccessMessage.value = true
    successMessageText.value = 'Erreur lors de la complétion de la composition'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}





// Fonction de sauvegarde spéciale pour les slots vides dans une sélection verrouillée
async function saveEmptySlotSelection() {
  if (!props.event?.id || !props.seasonId) return
  
  try {
    // Construire la structure par rôle à partir de teamSlots
    const roles = {}
    
    teamSlots.value.forEach(slot => {
      if (slot.playerId) { // Utiliser l'ID pour la sauvegarde
        if (!roles[slot.role]) {
          roles[slot.role] = []
        }
        roles[slot.role].push(slot.playerId)
      }
    })
    
    // Sauvegarder avec la nouvelle structure par rôle en préservant le statut de confirmation et les joueurs déclinés
    const { saveCast } = await import('../services/storage.js')
    await saveCast(props.event.id, roles, props.seasonId, { 
      preserveConfirmed: true,
      declined: props.currentSelection?.declined || {} // Préserver la section déclinés
    })
    
    // Recalculer le statut après la sauvegarde
    try {
      const { updateCastStatus } = await import('../services/storage.js')
      await updateCastStatus(props.event.id, props.seasonId)
    } catch (error) {
      console.warn('Erreur lors du recalcul du statut:', error)
    }
    
    // Émettre un événement pour que le parent recharge les données
    emit('updateCast')
    
    console.debug('Slot vide sauvegardé dans une sélection verrouillée')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du slot vide:', error)
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
      if (slot.playerId) { // Utiliser l'ID pour la sauvegarde
        if (!roles[slot.role]) {
          roles[slot.role] = []
        }
        roles[slot.role].push(slot.playerId)
      }
    })
    
    // Sauvegarde avec la nouvelle structure par rôle en préservant les joueurs déclinés
    await saveCast(props.event.id, roles, props.seasonId, { 
      declined: props.currentSelection?.declined || {} // Préserver la section déclinés
    })
    
    // Recalculer le statut après la sauvegarde
    try {
      const { updateCastStatus } = await import('../services/storage.js')
      await updateCastStatus(props.event.id, props.seasonId)
    } catch (error) {
      console.warn('Erreur lors du recalcul du statut:', error)
    }
    
    // Émettre un événement pour que le parent recharge les données
    emit('updateCast')
    
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
  // Vérifier si le joueur est disponible pour au moins un rôle
  if (!props.event?.roles) {
    return props.isAvailableForRole(playerName, 'player', props.event?.id)
  }
  
  // Pour les événements multi-rôles, vérifier si disponible pour au moins un rôle requis
  for (const role of Object.keys(props.event.roles)) {
    if (props.event.roles[role] > 0 && props.isAvailableForRole(playerName, role, props.event.id)) {
      return true
    }
  }
  return false
}

function isPlayerUnavailable(playerName) {
  return !isPlayerAvailable(playerName)
}

function getSelectedPlayersArray() {
  if (!props.currentSelection) return []
  
  if (Array.isArray(props.currentSelection)) {
    // Ancienne structure (array direct) - peut contenir des IDs ou des noms
    return props.currentSelection.map(item => {
      // Si c'est un ID, le convertir en nom
      const player = props.players?.find(p => p.id === item)
      return player ? player.name : item
    })
  } else if (props.currentSelection.players && Array.isArray(props.currentSelection.players)) {
    // Nouvelle structure avec players - peut contenir des IDs ou des noms
    return props.currentSelection.players.map(item => {
      // Si c'est un ID, le convertir en nom
      const player = props.players?.find(p => p.id === item)
      return player ? player.name : item
    })
  } else if (props.currentSelection.roles && typeof props.currentSelection.roles === 'object') {
    // Nouvelle structure multi-rôles : extraire tous les joueurs de tous les rôles
    const allPlayerIds = []
    for (const rolePlayers of Object.values(props.currentSelection.roles)) {
      if (Array.isArray(rolePlayers)) {
        allPlayerIds.push(...rolePlayers)
      }
    }
    // Convertir les IDs en noms pour l'affichage
    const allPlayerNames = [...new Set(allPlayerIds)].map(playerId => {
      return getPlayerNameFromId(playerId)
    }).filter(Boolean) // Filtrer les noms non trouvés
    
    return allPlayerNames
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

function getPlayerNameFromId(playerId) {
  if (!playerId || !props.players) return null
  const player = props.players.find(p => p.id === playerId)
  return player?.name || playerId // Fallback sur l'ID si nom non trouvé
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

// Fonctions pour gérer les joueurs déclinés
function getDeclinedPlayers() {
  if (!props.currentSelection || !props.currentSelection.declined) {
    return []
  }
  
  const declinedPlayers = []
  
  // Parcourir tous les rôles déclinés
  Object.entries(props.currentSelection.declined).forEach(([role, playerIds]) => {
    if (Array.isArray(playerIds)) {
      playerIds.forEach(playerId => {
        const playerName = getPlayerNameFromId(playerId)
        if (playerName) {
          declinedPlayers.push({
            name: playerName,
            role: role,
            roleEmoji: getRoleEmoji(role)
          })
        }
      })
    }
  })
  
  return declinedPlayers
}

function getRoleEmoji(role) {
  const roleEmojis = {
    player: '🎭',
    dj: '🎧',
    mc: '🎤'
  }
  return roleEmojis[role] || '🎭'
}

async function moveDeclinedToComposition(declinedPlayer) {
  try {
    // Trouver un slot vide pour ce rôle
    const emptySlot = teamSlots.value.find(slot => 
      !slot.player && slot.role === declinedPlayer.role
    )
    
    if (!emptySlot) {
      console.warn('Aucun slot vide trouvé pour le rôle:', declinedPlayer.role)
      return
    }
    
    // Remplir le slot
    emptySlot.player = declinedPlayer.name
    emptySlot.playerId = getPlayerIdFromName(declinedPlayer.name)
    
    // Retirer le joueur de la liste des déclinés
    await removeFromDeclined(declinedPlayer.name, declinedPlayer.role)
    
    // Sauvegarder
    await autoSaveSelection()
    
    console.log('Joueur remis en composition:', declinedPlayer.name)
  } catch (error) {
    console.error('Erreur lors du déplacement du joueur décliné:', error)
  }
}

async function movePlayerToDeclined(playerName, role) {
  const playerId = getPlayerIdFromName(playerName)
  if (!playerId) return
  
  // Créer une copie de la structure declined existante
  const currentDeclined = props.currentSelection?.declined || {}
  const newDeclined = { ...currentDeclined }
  
  // Ajouter le joueur à la liste des déclinés pour ce rôle
  if (!newDeclined[role]) {
    newDeclined[role] = []
  }
  if (!newDeclined[role].includes(playerId)) {
    newDeclined[role].push(playerId)
  }
  
  // Sauvegarder avec la nouvelle structure
  const { saveCast } = await import('../services/storage.js')
  await saveCast(props.event.id, props.currentSelection.roles, props.seasonId, { 
    declined: newDeclined,
    preserveConfirmed: true 
  })
}

async function removeFromDeclined(playerName, role) {
  if (!props.currentSelection || !props.currentSelection.declined) {
    return
  }
  
  const playerId = getPlayerIdFromName(playerName)
  if (!playerId) return
  
  // Créer une copie de la structure declined
  const newDeclined = { ...props.currentSelection.declined }
  
  if (newDeclined[role] && Array.isArray(newDeclined[role])) {
    newDeclined[role] = newDeclined[role].filter(id => id !== playerId)
    
    // Si le rôle est vide, le supprimer
    if (newDeclined[role].length === 0) {
      delete newDeclined[role]
    }
  }
  
  // Sauvegarder avec la nouvelle structure
  const { saveCast } = await import('../services/storage.js')
  await saveCast(props.event.id, props.currentSelection.roles, props.seasonId, { 
    declined: newDeclined,
    preserveConfirmed: true 
  })
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
