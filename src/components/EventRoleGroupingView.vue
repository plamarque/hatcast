<template>
  <div v-if="selectedEvent" class="space-y-4">

    <!-- Affichage par rôles -->
    <div class="space-y-3">
      <div 
        v-for="role in availableRoles" 
        :key="role"
        class="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
      >
        <!-- En-tête du rôle -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ ROLE_EMOJIS[role] }}</span>
            <span class="font-medium text-white">{{ getRoleLabel(role) }}</span>
            <span class="text-sm text-gray-400">
              ({{ getAvailableCountForRole(role) }}/{{ getRequiredCountForRole(role) }})
            </span>
          </div>
          <div v-if="showRoleStatus" class="flex items-center gap-2">
            <!-- Indicateur de statut du rôle -->
            <div 
              class="w-3 h-3 rounded-full"
              :class="getRoleStatusClass(role)"
              :title="getRoleStatusTooltip(role)"
            ></div>
            <span class="text-xs text-gray-400">
              {{ getRoleStatusText(role) }}
            </span>
          </div>
        </div>

        <!-- Liste des joueurs disponibles pour ce rôle -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <div
            v-for="player in getPlayersForRole(role)"
            :key="player.id"
            :class="[
              isPlayerSelectedForRole(player.name, role, selectedEvent.id)
                ? 'rounded-lg transition-all duration-200 p-0 bg-transparent border-transparent'
                : 'p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 rounded-md hover:bg-gray-700/50 border-transparent'
            ]"
          >
            <!-- Use CompositionSlot for selected players for consistent rendering -->
            <div v-if="isPlayerSelectedForRole(player.name, role, selectedEvent.id)">
              <CompositionSlot
                :player-id="player.id"
                :player-name="player.name"
                :player-gender="player.gender || 'non-specified'"
                :role-key="role"
                :role-label="getRoleLabel(role)"
                :role-emoji="ROLE_EMOJIS[role]"
                :selection-status="getPlayerSelectionStatus(player.name, selectedEvent.id)"
                :available="isAvailable(player.name, selectedEvent.id)"
                :unavailable="isAvailable(player.name, selectedEvent.id) === false"
                :is-selection-confirmed-by-organizer="isSelectionConfirmedByOrganizer(selectedEvent.id)"
                :season-id="seasonId"
                :right-text="getPlayerChanceForRole(player.name, role, selectedEvent.id) || 0"
                :right-bruno-text="showBrunoAlgorithm ? getPlayerChanceForRoleBruno(player.name, role, selectedEvent.id) || 0 : null"
                :right-class="getChanceColorClass(getPlayerChanceForRole(player.name, role, selectedEvent.id))"
                :right-title="'Cliquer pour voir le détail du calcul'"
                :show-role-info="false"
                @right-click="(e) => showChanceDetails(e, player.name, role)"
                @slot-click="() => handleSlotClick(player, role)"
              />
            </div>

            <!-- Design classique pour joueurs non sélectionnés -->
            <template v-else>
              <!-- Avatar du joueur -->
              <div class="relative flex-shrink-0">
                <PlayerAvatar 
                  :player-id="player.id"
                  :season-id="seasonId"
                  :player-name="player.name"
                  :player-gender="player.gender || 'non-specified'"
                  size="sm"
                />
                <!-- Statuts superposés -->
                <span
                  v-if="preferredPlayerIdsSet.has(player.id)"
                  class="absolute -top-1 -right-1 text-yellow-400 text-xs bg-gray-900 rounded-full w-4 h-4 flex items-center justify-center border border-gray-700"
                  title="Ma personne"
                >
                  ⭐
                </span>
                <div class="absolute -top-1 -right-1">
                  <CustomTooltip
                    v-if="!isPlayerProtectedInGrid(player.id)"
                    :content="getUnprotectedPlayerTooltip(player)"
                    position="bottom"
                  >
                    <span class="text-orange-400 text-xs">
                      ⚠️
                    </span>
                  </CustomTooltip>
                </div>
              </div>

              <!-- Nom du joueur -->
              <span class="text-white text-lg font-medium flex-1 min-w-0 truncate">
                {{ player.name }}
              </span>

              <!-- Pourcentage de chances -->
              <span 
                @click="showChanceDetails($event, player.name, role)"
                class="px-2 py-1 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                :class="getChanceColorClass(getPlayerChanceForRole(player.name, role, selectedEvent.id))"
                :title="`Cliquer pour voir le détail du calcul`"
              >
                {{ getPlayerChanceForRole(player.name, role, selectedEvent.id) || 0 }}%
                <span v-if="showBrunoAlgorithm" class="text-gray-400 ml-1" title="Algorithme Bruno">
                  ({{ getPlayerChanceForRoleBruno(player.name, role, selectedEvent.id) || 0 }}%)
                </span>
              </span>
            </template>
          </div>

          <!-- Message si aucun joueur disponible -->
          <div 
            v-if="getPlayersForRole(role).length === 0"
            class="col-span-full text-center py-4 text-gray-400 text-sm"
          >
            Aucun joueur disponible pour ce rôle
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Mini-popup des explications de chances -->
  <div v-if="showChanceExplanation && explanationData" 
       data-explanation-popup
       class="fixed z-[1600] bg-gray-900 border border-gray-600 rounded-lg shadow-xl p-3 max-w-xs"
       :style="{
         left: `${explanationPosition.x}px`,
         top: `${explanationPosition.y}px`,
         transform: 'translateX(-50%)'
       }"
       @click.stop>
    <div class="text-xs">
      <div class="font-medium text-white mb-2">Explications</div>
      <div class="space-y-2">
        <!-- Sélections passées -->
        <div>
          <span class="text-purple-400 font-semibold">{{ explanationData.pastSelections }}</span> 
          <span class="text-gray-300"> sélection{{ explanationData.pastSelections > 1 ? 's' : '' }} passée{{ explanationData.pastSelections > 1 ? 's' : '' }}</span>
        </div>
        
        <!-- Places et candidats -->
        <div>
          <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span> 
          <span class="text-gray-300"> place{{ explanationData.requiredCount > 1 ? 's' : '' }}</span> 
          <span class="text-white">pour </span>
          <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span> 
          <span class="text-gray-300"> candidats</span>
        </div>
        
        <!-- Probabilités -->
        <div>
          <span class="text-gray-300">Probabilités :</span> 
          <span class="font-semibold" :class="explanationData.chance >= 20 ? 'text-emerald-400' : explanationData.chance >= 10 ? 'text-amber-400' : 'text-rose-400'">{{ Math.round(explanationData.chance) }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Bouton de fermeture -->
    <button @click="hideChanceExplanation" 
            class="absolute top-1 right-1 text-gray-400 hover:text-white text-xs">
      ×
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import AvailabilityCell from './AvailabilityCell.vue'
import CompositionSlot from './CompositionSlot.vue'
import CustomTooltip from './CustomTooltip.vue'
import { 
  ROLES, 
  ROLE_EMOJIS, 
  ROLE_LABELS_SINGULAR, 
  ROLE_DISPLAY_ORDER,
  ROLE_PRIORITY_ORDER,
  getRoleLabel 
} from '../services/storage.js'
import { getChanceColorClass } from '../services/chancesService.js'
import { calculateAllRoleChances, calculateAllRoleChancesBruno } from '../services/chancesService.js'
import configService from '../services/configService.js'

const props = defineProps({
  selectedEvent: {
    type: Object,
    default: null
  },
  seasonId: {
    type: String,
    required: true
  },
  players: {
    type: Array,
    default: () => []
  },
  availability: {
    type: Object,
    default: () => ({})
  },
  casts: {
    type: Object,
    default: () => ({})
  },
  chances: {
    type: Object,
    default: () => ({})
  },
  preferredPlayerIdsSet: {
    type: Set,
    default: () => new Set()
  },
  // Fonctions passées depuis le composant parent
  isAvailable: {
    type: Function,
    required: true
  },
  isPlayerSelected: {
    type: Function,
    required: true
  },
  isPlayerSelectedForRole: {
    type: Function,
    required: true
  },
  isSelectionConfirmed: {
    type: Function,
    required: true
  },
  isSelectionConfirmedByOrganizer: {
    type: Function,
    required: true
  },
  getPlayerSelectionStatus: {
    type: Function,
    required: true
  },
  getAvailabilityData: {
    type: Function,
    required: true
  },
  isPlayerProtectedInGrid: {
    type: Function,
    required: true
  },
  isPlayerLoading: {
    type: Function,
    required: true
  },
  isPlayerAvailabilityLoaded: {
    type: Function,
    required: true
  },
  isPlayerError: {
    type: Function,
    required: true
  },
  getEventStatus: {
    type: Function,
    required: true
  },
  getEventTooltip: {
    type: Function,
    required: true
  },
  handleAvailabilityToggle: {
    type: Function,
    required: true
  },
  handlePlayerSelectionStatusToggle: {
    type: Function,
    required: true
  },
  openAvailabilityModal: {
    type: Function,
    required: true
  },
  isAvailableForRole: {
    type: Function,
    required: true
  },
  isSelectionComplete: {
    type: Function,
    required: true
  },
  getPlayerRoleChances: {
    type: Function,
    required: true
  },
  countSelections: {
    type: Function,
    required: true
  },
  // Ouvrir la modale de confirmation depuis le parent (gère protections et droits)
  openConfirmationModal: {
    type: Function,
    required: true
  },
  // Rôles filtrés (optionnel, si non fourni utilise availableRoles)
  filteredRoles: {
    type: Array,
    default: null
  },
  // Afficher les indicateurs de statut des rôles (par défaut true)
  showRoleStatus: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

// État de la mini-popup des explications de chances
const showChanceExplanation = ref(false)
const explanationData = ref(null)
const explanationPosition = ref({ x: 0, y: 0 })

// Computed pour afficher l'algorithme Bruno seulement en dev/staging
const showBrunoAlgorithm = computed(() => {
  const environment = configService.getEnvironment()
  return environment === 'development' || environment === 'staging'
})

// Computed properties
const availableRoles = computed(() => {
  // Si des rôles filtrés sont fournis, les utiliser
  if (props.filteredRoles) {
    return props.filteredRoles
  }
  
  // Sinon, utiliser la logique par défaut
  if (!props.selectedEvent?.roles) return []
  
  return ROLE_PRIORITY_ORDER.filter(role => {
    const count = props.selectedEvent.roles[role] || 0
    return count > 0
  })
})


const eventStatus = computed(() => {
  if (!props.selectedEvent) return null
  return props.getEventStatus(props.selectedEvent.id)
})

// Fonctions utilitaires
function formatEventDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getRequiredCountForRole(role) {
  return props.selectedEvent?.roles?.[role] || 0
}

function getAvailableCountForRole(role) {
  return getPlayersForRole(role).length
}

function getPlayersForRole(role) {
  if (!props.selectedEvent) return []
  
  return props.players.filter(player => {
    return props.isAvailableForRole(player.name, role, props.selectedEvent.id)
  })
}

function getPlayerChanceForRole(playerName, role, eventId) {
  // Créer une fonction countSelections qui exclut l'événement en cours
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, eventId)
  }
  
  // Utiliser le même calcul que dans la popup d'explication
  // Calculer les chances pour tous les rôles (même logique que GridBoard)
  const allRoleChances = calculateAllRoleChances(
    props.selectedEvent, 
    props.players, 
    props.availability, 
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  const roleData = allRoleChances[role]
  if (!roleData || !roleData.candidates) {
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  return candidate ? Math.round(candidate.practicalChance) : null
}

function getPlayerChanceForRoleBruno(playerName, role, eventId) {
  // Créer une fonction countSelections qui exclut l'événement en cours
  const countSelectionsExcludingCurrentEvent = (playerName, role) => {
    if (!props.countSelections) return 0
    return props.countSelections(playerName, role, eventId)
  }
  
  // Calculer les chances selon l'algorithme Bruno
  const allRoleChancesBruno = calculateAllRoleChancesBruno(
    props.selectedEvent, 
    props.players, 
    props.availability, 
    countSelectionsExcludingCurrentEvent,
    props.isAvailableForRole
  )
  
  console.log('🔍 Bruno debug pour', playerName, role, ':', allRoleChancesBruno[role])
  
  const roleData = allRoleChancesBruno[role]
  if (!roleData || !roleData.candidates) {
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  console.log('🔍 Candidat Bruno trouvé:', candidate)
  
  return candidate ? Math.round(candidate.brunoChance) : null
}


function getChanceBadgeClass(chance) {
  // Utiliser le même style que dans la modale des chances
  if (chance >= 20) return 'bg-green-500/20 text-green-300'
  if (chance >= 10) return 'bg-yellow-500/20 text-yellow-300'
  return 'bg-red-500/20 text-red-300'
}

// Fonctions pour la mini-popup des explications
function showChanceDetails(event, playerName, role) {
  console.log('🖱️ Click on percentage:', { playerName, role, event })
  
  // Calculer la position de la popup
  const rect = event.target.getBoundingClientRect()
  explanationPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10
  }
  
  // Récupérer les données d'explication
  explanationData.value = getChanceExplanation(playerName, role)
  console.log('📊 Explanation data set:', explanationData.value)
  
  showChanceExplanation.value = true
  console.log('👁️ Show explanation:', showChanceExplanation.value)
}

function hideChanceExplanation() {
  showChanceExplanation.value = false
  explanationData.value = null
}

function getChanceExplanation(playerName, role) {
  console.log('🔍 Debug getChanceExplanation:', { playerName, role, selectedEvent: props.selectedEvent })
  
  if (!props.selectedEvent) {
    console.log('❌ Missing selectedEvent')
    return null
  }
  
  // Utiliser la même logique que dans la modale de chances
  const event = props.selectedEvent
  const eventId = event.id
  
  // Calculer les chances pour tous les rôles (même logique que GridBoard)
  const allRoleChances = calculateAllRoleChances(
    event, 
    props.players, 
    props.availability, 
    props.countSelections || (() => 0),
    props.isAvailableForRole
  )
  
  console.log('🔍 Calculated role chances:', allRoleChances)
  
  const roleData = allRoleChances[role]
  if (!roleData || !roleData.candidates) {
    console.log('❌ No role data found for role:', role)
    return null
  }
  
  const candidate = roleData.candidates.find(c => c.name === playerName)
  console.log('🔍 Candidate found:', candidate)
  console.log('🔍 Candidate pastSelections:', candidate?.pastSelections)
  console.log('🔍 Candidate malus:', candidate?.malus)
  console.log('🔍 Candidate practicalChance:', candidate?.practicalChance)
  
  // Debug des données de base
  console.log('🔍 Props countSelections function:', typeof props.countSelections)
  
  // Tester la fonction countSelections directement
  if (props.countSelections) {
    const directCount = props.countSelections(playerName, role)
    console.log('🔍 Direct countSelections call:', directCount)
    console.log('🔍 Expected pastSelections should match directCount:', directCount)
  }
  
  if (!candidate) {
    console.log('❌ No candidate found for player:', playerName)
    return null
  }
  
  const explanation = {
    playerName,
    role,
    chance: candidate.practicalChance || 0,
    requiredCount: roleData.requiredCount || 0,
    availableCount: roleData.availableCount || 0,
    malus: candidate.malus || 0,
    pastSelections: candidate.pastSelections || 0
  }
  
  console.log('✅ Explanation data:', explanation)
  return explanation
}

// Gestion des événements pour fermer la popup
function handleClickOutside(event) {
  if (showChanceExplanation.value && !event.target.closest('[data-explanation-popup]')) {
    hideChanceExplanation()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function getRoleStatusClass(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return 'bg-green-500'
  } else if (available > 0) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
}

function getRoleStatusTooltip(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return `Rôle complet : ${available}/${required} joueurs`
  } else if (available > 0) {
    return `Rôle incomplet : ${available}/${required} joueurs (manque ${required - available})`
  } else {
    return `Aucun joueur disponible : 0/${required} joueurs`
  }
}

function getRoleStatusText(role) {
  const available = getAvailableCountForRole(role)
  const required = getRequiredCountForRole(role)
  
  if (available >= required) {
    return 'Complet'
  } else if (available > 0) {
    return `Manque ${required - available}`
  } else {
    return 'Aucun'
  }
}

// Handle slot click to open confirmation modal
async function handleSlotClick(player, role) {
  if (!props.selectedEvent) return
  
  const event = props.selectedEvent
  const eventId = event.id
  const playerName = player.name
  const playerId = player.id

  // Get current availability data to pass the comment
  const availabilityData = props.getAvailabilityData(playerName, eventId)
  
  // Build confirmation modal data similar to AvailabilityCell
  const data = {
    playerName,
    playerId,
    playerGender: player.gender || 'non-specified',
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    assignedRole: role,
    availabilityComment: availabilityData?.comment || null,
    currentStatus: props.getPlayerSelectionStatus(playerName, eventId),
    seasonId: props.seasonId
  }

  // Use the openConfirmationModal function passed from parent
  if (typeof props.openConfirmationModal === 'function') {
    props.openConfirmationModal(data)
  } else {
    console.warn('openConfirmationModal function not available')
  }
}

// Fonction pour générer le tooltip d'avertissement pour les joueurs non-protégés
function getUnprotectedPlayerTooltip(player) {
  return `⚠️ ${player.name} non protégé
Disponibilités modifiables par tous`
}

</script>
