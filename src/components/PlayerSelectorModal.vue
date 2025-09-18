<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1500] p-4" @click="closeModal">
    <div class="flex items-center justify-center min-h-full">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <!-- Header -->
      <div class="p-6 border-b border-white/10">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">Choisir des Participants</h2>
          <button @click="closeModal" class="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">
            ✖️
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <!-- Input de recherche -->
        <div class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un participant..."
            class="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            @keyup.escape="closeModal"
            ref="searchInput"
          />
        </div>
        
        <!-- Liste des participants -->
        <div class="max-h-80 overflow-y-auto">
          <!-- Option "Tous" -->
          <div
            @click="selectAllPlayers"
            class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 rounded-lg transition-colors duration-200"
            :class="{ 'bg-gray-700': !selectedPlayerId }"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span class="text-white text-lg font-bold">👥</span>
            </div>
            <div>
              <div class="text-white font-medium">Tous</div>
              <div class="text-gray-400 text-sm">Charger tous les participants</div>
            </div>
          </div>
          
          <!-- Séparateur -->
          <div class="border-t border-gray-600 my-2"></div>
          
          <!-- Liste des participants filtrés -->
          <div
            v-for="player in filteredPlayers"
            :key="player.id"
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
              @avatar-loaded="(data) => console.log('Avatar chargé pour', player.name, data)"
              @avatar-error="(error) => console.log('Erreur avatar pour', player.name, error)"
            />
            <div class="flex-1">
              <div class="text-white font-medium">{{ player.name }}</div>
            </div>
            <!-- Icône de cadenas pour les participants protégés -->
            <div v-if="isPlayerProtected(player.id)" class="text-yellow-400 text-sm">
              🔒
            </div>
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

export default {
  name: 'PlayerSelectorModal',
  components: {
    PlayerAvatar
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
    }
  },
  emits: ['close', 'player-selected', 'all-players-selected', 'add-new-player'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const searchInput = ref(null)
    
    // Participants filtrés pour l'autocomplete
    const filteredPlayers = computed(() => {
      if (!searchQuery.value.trim()) {
        return props.players.slice(0, 20) // Limiter à 20 résultats par défaut
      }
      
      const query = searchQuery.value.toLowerCase().trim()
      return props.players
        .filter(player => player.name.toLowerCase().includes(query))
        .slice(0, 20)
    })
    
    // Fonctions
    const closeModal = () => {
      emit('close')
    }
    
    const selectPlayer = (player) => {
      emit('player-selected', player)
      closeModal()
    }
    
    const selectAllPlayers = () => {
      emit('all-players-selected')
      closeModal()
    }
    
    const addNewPlayer = () => {
      emit('add-new-player', searchQuery.value.trim())
      closeModal()
    }
    
    // Vérifier si un joueur est déjà affiché dans la grille
    const isPlayerAlreadyDisplayed = (playerId) => {
      return props.isPlayerAlreadyDisplayed(playerId)
    }
    
    // Focus sur l'input quand le modal s'ouvre
    watch(() => props.show, (newShow) => {
      if (newShow) {
        searchQuery.value = ''
        nextTick(() => {
          if (searchInput.value) {
            searchInput.value.focus()
          }
        })
      }
    })

    return {
      searchQuery,
      searchInput,
      filteredPlayers,
      closeModal,
      selectPlayer,
      selectAllPlayers,
      addNewPlayer,
      isPlayerAlreadyDisplayed
    }
  }
}
</script>
