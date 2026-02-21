<template>
  <div v-if="show" data-testid="player-selector-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1500] md:p-4" @click="closeModalWithCheckboxes">
    <!-- Sur mobile: hauteur complète sans padding, sur desktop: centré avec padding -->
    <div class="flex md:items-center md:justify-center min-h-full h-full">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 md:rounded-2xl shadow-2xl w-full max-w-md flex flex-col h-full md:h-auto md:max-h-[85vh]" @click.stop>
      <!-- Header -->
      <div class="p-3 md:p-6 border-b border-white/10 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-lg md:text-2xl font-bold text-white">Filtrer les participants</h2>
          <button @click="closeModalWithCheckboxes" class="text-white/80 hover:text-white p-1.5 md:p-2 rounded-full hover:bg-white/10">
            ✖️
          </button>
        </div>
      </div>
      
      <!-- Content - flexible pour prendre l'espace disponible -->
      <div class="p-3 md:p-6 flex flex-col flex-1 overflow-hidden">
        <!-- Input de recherche -->
        <div class="mb-3 md:mb-4 flex-shrink-0">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un participant..."
            class="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            @keyup.escape="closeModalWithCheckboxes"
            ref="searchInput"
          />
        </div>
        
        <!-- Liste des participants - prend tout l'espace restant -->
        <div class="flex-1 overflow-y-auto -mx-2 px-2">
          <!-- Option "Tous" -->
          <div
            data-testid="player-selector-option-all"
            @click="selectAllPlayers"
            class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200"
            :class="{ 'bg-gray-700': !selectedPlayerId }"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-bold">👥</span>
            </div>
            <div class="flex-1">
              <div class="text-white font-medium">Tous</div>
              <div class="text-gray-400 text-sm">Charger tous les participants</div>
            </div>
            <input
              ref="allCheckboxRef"
              data-testid="player-selector-checkbox-all"
              type="checkbox"
              :checked="isAllChecked"
              @click.stop="toggleAllPlayers"
              class="flex-shrink-0 w-5 h-5 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
              aria-label="Sélectionner ou désélectionner tous les participants"
            />
          </div>
          
          <!-- Séparateur -->
          <div class="border-t border-gray-600 my-2"></div>
          
          <!-- Liste des participants (favoris en premier) -->
          <div
            v-for="player in filteredPlayers"
            :key="player.id"
            :data-testid="`player-selector-row-${player.id}`"
            @click="selectPlayer(player)"
            class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200 relative"
            :class="{ 'bg-gray-700': selectedPlayerId === player.id }"
          >
            <PlayerAvatar 
              :player-id="player.id"
              :season-id="seasonId"
              :player-name="player.name"
              size="md"
              :player-gender="player.gender || 'non-specified'"
              :show-status-icons="true"
              :is-preferred="preferredPlayerIdsSet.has(player.id)"
              :is-protected="isPlayerProtected(player.id)"
              @avatar-loaded="(data) => console.log('Avatar chargé pour', player.name, data)"
              @avatar-error="(error) => console.log('Erreur avatar pour', player.name, error)"
            />
            <div class="flex-1">
              <div class="text-white font-medium">{{ player.name }}</div>
              <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>{{ getPlayerStats(player) }}</span>
                <CustomTooltip
                  v-if="!isPlayerProtected(player.id)"
                  :content="getUnprotectedPlayerTooltip(player)"
                  position="top"
                >
                  <span class="text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-400/30 rounded cursor-help">
                    ⚠️ Non protégé
                  </span>
                </CustomTooltip>
              </div>
            </div>
            <input
              type="checkbox"
              :data-testid="`player-selector-checkbox-${player.id}`"
              :checked="checkedPlayerIds.has(player.id)"
              @click.stop="togglePlayer(player)"
              class="flex-shrink-0 w-5 h-5 text-purple-600 bg-gray-700 border-gray-500 rounded focus:ring-purple-500"
              :aria-label="`Sélectionner ${player.name}`"
            />
          </div>
          
          <!-- Option "Ajouter un participant" -->
          <div class="border-t border-gray-600 my-2"></div>
          <div
            @click="addNewPlayer"
            class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-bold">+</span>
            </div>
            <div>
              <div class="text-white font-medium">Ajouter un participant</div>
              <div class="text-gray-400 text-sm">Créer un nouveau participant pour vos événements</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import CustomTooltip from './CustomTooltip.vue'

export default {
  name: 'PlayerSelectorModal',
  components: {
    PlayerAvatar,
    CustomTooltip
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    players: {
      type: Array,
      required: true
    },
    seasonId: {
      type: String,
      required: true
    },
    selectedPlayerId: {
      type: String,
      default: null
    },
    selectedPlayerIds: {
      type: [Array, Set],
      default: null
    },
    preferredPlayerIdsSet: {
      type: Set,
      default: () => new Set()
    },
    isPlayerProtected: {
      type: Function,
      default: () => false
    },
    isPlayerAlreadyDisplayed: {
      type: Function,
      default: () => false
    },
    // Props pour les statistiques des joueurs
    events: {
      type: Array,
      default: () => []
    },
    isAvailable: {
      type: Function,
      default: () => false
    },
    getSelectionPlayers: {
      type: Function,
      default: () => []
    }
  },
  emits: ['close', 'player-selected', 'all-players-selected', 'players-selected', 'add-new-player'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const searchInput = ref(null)
    const allCheckboxRef = ref(null)
    const checkedPlayerIds = ref(new Set())

    // Initialiser checkedPlayerIds à l'ouverture du modal
    function initCheckedPlayerIds() {
      const ids = props.selectedPlayerIds
      if (ids && (Array.isArray(ids) ? ids.length : ids.size) > 0) {
        checkedPlayerIds.value = new Set(Array.isArray(ids) ? ids : Array.from(ids))
      } else if (props.selectedPlayerId) {
        checkedPlayerIds.value = new Set([props.selectedPlayerId])
      } else {
        // Mode "Tous" : cocher toutes les cases
        checkedPlayerIds.value = new Set(props.players.map(p => p.id))
      }
    }

    // Participants filtrés pour l'autocomplete
    const filteredPlayers = computed(() => {
      let players = props.players
      
      // Appliquer le filtre de recherche si nécessaire
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        players = players.filter(player => player.name.toLowerCase().includes(query))
      }
      
      // Séparer les joueurs favoris des autres
      const favoritePlayers = players.filter(player => props.preferredPlayerIdsSet.has(player.id))
      const otherPlayers = players.filter(player => !props.preferredPlayerIdsSet.has(player.id))
      
      // Retourner d'abord les favoris, puis les autres (limiter à 20 au total)
      const allPlayers = [...favoritePlayers, ...otherPlayers]
      return allPlayers.slice(0, 20)
    })

    const allPlayerIds = computed(() => new Set(props.players.map(p => p.id)))
    const isAllChecked = computed(() => {
      if (allPlayerIds.value.size === 0) return false
      return [...allPlayerIds.value].every(id => checkedPlayerIds.value.has(id))
    })
    const isSomeChecked = computed(() => {
      const count = [...allPlayerIds.value].filter(id => checkedPlayerIds.value.has(id)).length
      return count > 0 && count < allPlayerIds.value.size
    })

    function togglePlayer(player) {
      const next = new Set(checkedPlayerIds.value)
      if (next.has(player.id)) {
        next.delete(player.id)
      } else {
        next.add(player.id)
      }
      checkedPlayerIds.value = next
    }

    function toggleAllPlayers() {
      if (isAllChecked.value) {
        checkedPlayerIds.value = new Set()
      } else {
        checkedPlayerIds.value = new Set(allPlayerIds.value)
      }
    }
    
    // Fonctions
    const closeModal = (applyCheckboxSelection = false) => {
      if (applyCheckboxSelection && checkedPlayerIds.value.size > 0) {
        emit('players-selected', Array.from(checkedPlayerIds.value))
      }
      emit('close')
    }

    const closeModalWithCheckboxes = () => {
      closeModal(true)
    }
    
    const selectPlayer = (player) => {
      emit('player-selected', player)
      closeModal(false)
    }
    
    const selectAllPlayers = () => {
      emit('all-players-selected')
      closeModal(false)
    }
    
    const addNewPlayer = () => {
      emit('add-new-player', searchQuery.value.trim())
      closeModal(false)
    }
    
    // Fonction pour obtenir les statistiques d'un joueur
    const getPlayerStats = (player) => {
      if (!props.events || props.events.length === 0) {
        return 'Aucun événement'
      }
      
      let availableCount = 0
      let selectedCount = 0
      
      // Compter les événements où le joueur est disponible et sélectionné
      props.events.forEach(event => {
        if (props.isAvailable(player.name, event.id)) {
          availableCount++
        }
        
        const selectedPlayers = props.getSelectionPlayers(event.id)
        if (selectedPlayers.includes(player.name)) {
          selectedCount++
        }
      })
      
      return `${availableCount} dispos / ${selectedCount} sélections`
    }
    
    // Vérifier si un joueur est déjà affiché dans la grille
    const isPlayerAlreadyDisplayed = (playerId) => {
      return props.isPlayerAlreadyDisplayed(playerId)
    }
    
    // Focus sur l'input et initialiser les cases à cocher quand le modal s'ouvre
    watch(() => props.show, (newShow) => {
      if (newShow) {
        searchQuery.value = ''
        initCheckedPlayerIds()
        nextTick(() => {
          if (searchInput.value) {
            searchInput.value.focus()
          }
        })
      }
    })

    // Mettre à jour l'état indeterminate de la checkbox "Tous"
    watch(() => checkedPlayerIds.value.size, () => {
      nextTick(() => {
        if (allCheckboxRef.value) {
          allCheckboxRef.value.indeterminate = isSomeChecked.value
        }
      })
    }, { immediate: true })

    // Fonction pour générer le tooltip d'avertissement pour les joueurs non-protégés
    const getUnprotectedPlayerTooltip = (player) => {
      return `⚠️ ${player.name} non protégé
Disponibilités modifiables par tous`
    }

    return {
      searchQuery,
      searchInput,
      allCheckboxRef,
      filteredPlayers,
      checkedPlayerIds,
      isAllChecked,
      isSomeChecked,
      togglePlayer,
      toggleAllPlayers,
      closeModal,
      closeModalWithCheckboxes,
      selectPlayer,
      selectAllPlayers,
      addNewPlayer,
      isPlayerAlreadyDisplayed,
      getPlayerStats,
      getUnprotectedPlayerTooltip
    }
  }
}
</script>
