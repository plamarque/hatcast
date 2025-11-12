<template>
  <div class="w-full">
    <!-- Encart d'avertissement -->
    <div v-if="showWarning" class="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-2 mb-3">
      <div class="flex items-start space-x-2">
        <div class="flex-shrink-0">
          <span class="text-yellow-400 text-sm">⚠️</span>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h3 class="text-yellow-200 font-medium text-xs mb-0.5">
                Vue en cours de construction
              </h3>
              <p class="text-yellow-100 text-xs leading-tight">
                Cette vue permet de voir les statistiques de participation et l'historique des compositions. 
                Elle est encore en cours de construction et peut contenir des imprécisions. 
                N'hésite pas à nous signaler toute imprécision.
              </p>
            </div>
            <button
              @click="dismissWarning"
              class="flex-shrink-0 text-yellow-200 hover:text-yellow-100 text-xs font-medium px-2 py-1 rounded transition-colors"
            >
              Ok, compris
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau avec colonnes de statistiques et événements -->
    <div class="overflow-x-auto casts-view" @scroll="handleScroll">
    <table class="w-full table-auto border-separate border-spacing-0" style="border-spacing: 0;">
      <!-- En-tête de la table -->
      <thead class="sticky top-0 z-[110]">
        <!-- Ligne d'en-tête de groupe -->
        <tr>
          <!-- Cellule vide pour la colonne de gauche -->
          <th 
            class="bg-gray-900 sticky left-0 z-[111]"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
            style="border: none; padding: 0;"
          ></th>
          
          <!-- En-tête de groupe DECORUM -->
          <template v-if="showStatsColumns">
            <th 
              colspan="6" 
              class="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-1.5 text-center rounded-tl"
              style="border: none; margin: 0;"
            >
              DECORUM
            </th>
            <!-- En-tête de groupe JEU -->
            <th 
              colspan="5" 
              class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1.5 text-center rounded-tr"
              style="border: none; margin: 0;"
            >
              JEU
            </th>
            <!-- Cellule vide pour BÉNÉVOLE -->
            <th colspan="1" class="rounded-tr" style="border: none; padding: 0; margin: 0;"></th>
          </template>
          
          <!-- Cellules vides pour les événements -->
          <th 
            v-for="event in props.events"
            :key="`group-${event.id}`"
            style="border: none; padding: 0;"
          ></th>
        </tr>
        
        <tr>
          <!-- Colonne de gauche (Bouton Exporter) -->
          <th 
            class="col-left bg-gray-900 px-4 py-3 text-center sticky left-0 z-[111]"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
          >
            <div class="flex flex-col space-y-2">
              <button
                @click="exportToExcel"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                <span>Exporter</span>
              </button>
              
              <button
                @click="toggleStatsColumns"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
                :title="showStatsColumns ? 'Masquer les statistiques' : 'Afficher les statistiques'"
              >
                <span>{{ showStatsColumns ? '📊' : '📈' }}</span>
                <span>{{ showStatsColumns ? 'Masquer' : 'Stats' }}</span>
              </button>
            </div>
          </th>
          
          <!-- Colonnes de comptage des rôles -->
          <template v-if="showStatsColumns">
            <!-- DÉCORUM -->
            <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200" style="width: 60px; min-width: 60px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🎤</span>
                <span>MC</span>
              </div>
            </th>
            <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200" style="width: 60px; min-width: 60px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🎧</span>
                <span>DJ</span>
              </div>
            </th>
            <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200" style="width: 80px; min-width: 80px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🙅</span>
                <span>ARBITRE</span>
              </div>
            </th>
            <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200" style="width: 75px; min-width: 75px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>💁</span>
                <span>ASSIST.</span>
              </div>
            </th>
            <th class="bg-violet-50 text-violet-700 text-xs px-2 py-2 text-center border-r border-b border-violet-200" style="width: 70px; min-width: 70px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🧢</span>
                <span>COACH</span>
              </div>
            </th>
            <th class="bg-violet-100 text-violet-800 text-xs font-bold px-2 py-2 text-center border-l-2 border-r border-b border-violet-200" style="width: 100px; min-width: 100px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>TOTAL</span>
                <span>DECORUM</span>
              </div>
            </th>
            
            <!-- JEU -->
            <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200" style="width: 90px; min-width: 90px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🎭</span>
                <span>JEU MATCH</span>
              </div>
            </th>
            <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200" style="width: 85px; min-width: 85px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🎭</span>
                <span>JEU CAB</span>
              </div>
            </th>
            <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200" style="width: 90px; min-width: 90px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🎭</span>
                <span>JEU LONG</span>
              </div>
            </th>
            <th class="bg-amber-50 text-amber-700 text-xs px-2 py-2 text-center border-r border-b border-amber-200" style="width: 90px; min-width: 90px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🎭</span>
                <span>JEU AUTRE</span>
              </div>
            </th>
            <th class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-2 text-center border-l-2 border-r border-b border-amber-200" style="width: 80px; min-width: 80px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>TOTAL</span>
                <span>JEU</span>
              </div>
            </th>
            
            <!-- BÉNÉVOLES -->
            <th class="bg-slate-100 text-slate-700 text-xs px-2 py-2 text-center border-l-2 border-r border-b border-slate-200 rounded-tr" style="width: 85px; min-width: 85px;">
              <div class="flex flex-col items-center space-y-0.5">
                <span>🤝</span>
                <span>BÉNÉVOLE</span>
              </div>
            </th>
          </template>
          
    <!-- En-têtes des événements -->
          <th
            v-for="event in props.events"
            :key="event.id"
            class="col-header col-event px-2 py-3 text-center"
            :style="{ width: `${eventColumnWidth}px`, minWidth: `${eventColumnWidth}px` }"
          >
      <div
        class="col-event rounded-xl flex items-center justify-center px-2 py-3 transition-all duration-200 cursor-pointer"
        :class="[
                event._isArchived 
            ? 'bg-gray-600/50 border border-gray-500/30 hover:bg-gray-600/70' 
                  : event._isPast 
              ? 'bg-amber-800/30 border border-amber-600/30 hover:bg-amber-800/50' 
              : 'bg-gray-800 border border-gray-700/30 hover:bg-gray-700'
        ]"
              :style="{ width: `${eventColumnWidth}px`, minWidth: `${eventColumnWidth}px` }"
              @click="openEventModal(event)"
      >
        <div class="flex flex-col items-center space-y-1 w-full">
          <!-- Emoji et titre empilés -->
          <div class="flex flex-col items-center gap-1 w-full">
                  <span class="text-sm">{{ getEventIcon(event) }}</span>
            <span 
              class="font-semibold text-sm text-center leading-tight line-clamp-2 overflow-hidden" 
              :class="[
                      event._isArchived 
                  ? 'text-gray-400' 
                        : event._isPast 
                    ? 'text-amber-200' 
                    : 'text-white'
              ]"
                    :title="event.title + (event._isArchived ? ' (Archivé)' : event._isPast ? ' (Passé)' : '')"
                  >
                    {{ event.title }}
                    <span v-if="event._isArchived" class="text-xs text-gray-500 ml-1">📁</span>
                    <span v-else-if="event._isPast" class="text-xs text-amber-400 ml-1">⏰</span>
            </span>
          </div>
          <!-- Date et statut empilés -->
          <div class="flex flex-col items-center space-y-1">
            <span 
              class="text-xs text-center font-normal"
              :class="[
                      event._isArchived 
                  ? 'text-gray-500' 
                        : event._isPast 
                    ? 'text-amber-300' 
                    : 'text-gray-400'
              ]"
            >
                    {{ formatEventDate(event.date) }}
            </span>
            <StatusBadge 
                    :event-id="event.id" 
                    :event-status="getEventStatus(event)" 
            />
          </div>
        </div>
      </div>
          </th>
        </tr>
      </thead>

      <!-- Corps de la table -->
      <tbody class="relative z-[45]">

        <!-- Lignes de joueurs -->
        <tr v-for="player in props.displayedPlayers" :key="player.id">
        <!-- Cellule joueur -->
        <td 
            class="left-col-td bg-gray-900 px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors sticky left-0 z-[50]"
          :style="{ 
            width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
            maxWidth: dynamicLeftColumnWidth 
          }"
          @click="showPlayerDetails(player)"
        >
          <div class="flex items-center space-x-2">
            <PlayerAvatar
              :player-id="player.id"
              :season-id="seasonId"
              :player-name="player.name"
              :player-gender="player.gender || 'non-specified'"
              :show-status-icons="true"
              :size="'lg'"
              :clickable="true"
              class="!w-10 !h-10"
              @click="showPlayerDetails(player)"
            />
            <span class="text-white font-medium text-sm">{{ player.name }}</span>
          </div>
        </td>
          
          <!-- Cellules de comptage des rôles -->
          <template v-if="showStatsColumns" v-for="(stats, index) in [playersRoleStats.get(player.name) || {mc: 0, dj: 0, referee: 0, assistantReferee: 0, coach: 0, jeuMatch: 0, jeuCab: 0, jeuLong: 0, jeuAutre: 0, totalJeu: 0, volunteer: 0}]" :key="`stats-${player.id}`">
            <!-- Colonnes de décorum -->
            <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200" style="width: 60px; min-width: 60px;">
              {{ stats.mc || '' }}
            </td>
            <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200" style="width: 60px; min-width: 60px;">
              {{ stats.dj || '' }}
            </td>
            <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200" style="width: 80px; min-width: 80px;">
              {{ stats.referee || '' }}
            </td>
            <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200" style="width: 75px; min-width: 75px;">
              {{ stats.assistantReferee || '' }}
            </td>
            <td class="bg-violet-50 text-violet-700 text-center text-sm border-r border-b border-violet-200" style="width: 70px; min-width: 70px;">
              {{ stats.coach || '' }}
            </td>
            <td class="bg-violet-100 text-violet-800 text-center text-sm font-bold border-l-2 border-r border-b border-violet-200" style="width: 100px; min-width: 100px;">
              {{ (stats.mc + stats.dj + stats.referee + stats.assistantReferee + stats.coach) || '' }}
            </td>
            
            <!-- Colonnes de jeu -->
            <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200" style="width: 90px; min-width: 90px;">
              {{ stats.jeuMatch || '' }}
            </td>
            <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200" style="width: 85px; min-width: 85px;">
              {{ stats.jeuCab || '' }}
            </td>
            <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200" style="width: 90px; min-width: 90px;">
              {{ stats.jeuLong || '' }}
            </td>
            <td class="bg-amber-50 text-amber-700 text-center text-sm border-r border-b border-amber-200" style="width: 90px; min-width: 90px;">
              {{ stats.jeuAutre || '' }}
            </td>
            <td class="bg-amber-100 text-amber-800 text-center text-sm font-bold border-l-2 border-r border-b border-amber-200" style="width: 80px; min-width: 80px;">
              {{ stats.totalJeu || '' }}
            </td>
            
            <!-- Colonne bénévoles -->
            <td class="bg-slate-100 text-slate-700 text-center text-sm border-l-2 border-r border-b border-slate-200" style="width: 85px; min-width: 85px;">
              {{ stats.volunteer || '' }}
            </td>
          </template>
        
        <!-- Cellules de sélection -->
        <td
            v-for="event in props.events"
          :key="`${player.id}-${event.id}`"
          class="col-event p-2 md:p-1"
            :style="{ width: `${eventColumnWidth}px`, minWidth: `${eventColumnWidth}px`, height: '4rem' }"
        >
          <SelectionCell
            :player-name="player.name"
            :event-id="event.id"
              :is-selected="getPlayerRoleInEvent(player.id, event.id) !== null"
              :is-selection-confirmed="props.isSelectionConfirmed(event.id)"
              :is-selection-confirmed-by-organizer="props.isSelectionConfirmedByOrganizer(event.id)"
              :player-selection-status="props.getPlayerSelectionStatus(player.name, event.id)"
            :season-id="seasonId"
            :can-edit="false"
              :availability-data="props.getAvailabilityData(player.name, event.id)"
            :player-gender="player.gender || 'non-specified'"
              :selection-data="getPlayerRoleInEvent(player.id, event.id) ? { role: getPlayerRoleInEvent(player.id, event.id), roleLabel: getPlayerRoleLabelInEvent(player.id, event.id, player.gender || 'non-specified') } : null"
              :roles-and-chances="getPlayerRolesAndChances(player.id, event.id, player.gender || 'non-specified')"
              :can-edit-events="canEditEvents"
              :is-past-event="event._isPast"
          />
        </td>
        </tr>
        
        <!-- Ligne "Afficher Plus" -->
        <tr v-if="!isAllPlayersView && hiddenPlayersCount > 0">
          <td 
            class="left-col-td bg-gray-800 px-4 py-3 border-r border-gray-700"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
          >
            <button
              class="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              @click="addAllPlayersToGrid"
            >
              <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-normal">+</span>
              </div>
              <span class="text-sm">
                voir les {{ hiddenPlayersCount }} autres
              </span>
            </button>
        </td>
        
          <!-- Cellules vides pour les colonnes de rôles et événements -->
          <td :colspan="showMoreColspan - 1" class="bg-gray-800"></td>
          
          <!-- Cellules vides pour "Afficher Plus" -->
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import PlayerAvatar from './PlayerAvatar.vue'
import SelectionCell from './SelectionCell.vue'
import StatusBadge from './StatusBadge.vue'
import { formatEventDate } from '../utils/dateUtils.js'
import { EVENT_TYPE_ICONS, ROLE_TEMPLATES, ROLES, getRoleLabel } from '../services/storage.js'
import { getEventStatusWithSelection } from '../services/eventStatusService.js'
import { loadPlayers, loadAvailability } from '../services/storage.js'
import logger from '../services/logger.js'

// Props
const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  displayedPlayers: {
    type: Array,
    required: true
  },
  isAllPlayersView: {
    type: Boolean,
    default: false
  },
  hiddenPlayersCount: {
    type: Number,
    default: 0
  },
  hiddenPlayersDisplayText: {
    type: String,
    default: ''
  },
  canEditAvailability: {
    type: Boolean,
    default: false
  },
  canEditEvents: {
    type: Boolean,
    default: false
  },
  getPlayerAvailability: {
    type: Function,
    required: true
  },
  headerOffsetX: {
    type: Number,
    default: 0
  },
  headerScrollX: {
    type: Number,
    default: 0
  },
  // Props supplémentaires pour AvailabilityCell
  seasonId: {
    type: String,
    required: true
  },
  chances: {
    type: Object,
    default: () => ({})
  },
  isAvailable: {
    type: Function,
    required: true
  },
  isSelected: {
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
  isSelectionComplete: {
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
  // Props pour le calcul du statut des événements
  getSelectionPlayers: {
    type: Function,
    required: true
  },
  getTotalRequiredCount: {
    type: Function,
    required: true
  },
  countAvailablePlayers: {
    type: Function,
    required: true
  },
  casts: {
    type: Object,
    default: () => ({})
  },
  // Props pour les événements cachés
  isAllEventsView: {
    type: Boolean,
    default: false
  },
  hiddenEventsCount: {
    type: Number,
    default: 0
  },
  hiddenEventsDisplayText: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'player-selected',
  'availability-changed',
  'scroll',
  'toggle-player-modal',
  'toggle-event-modal',
  'toggle-availability',
  'toggle-selection-status',
  'show-availability-modal',
  'event-click',
  'all-players-loaded',
  'all-events-loaded'
])

// State pour la réactivité de la largeur d'écran
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// State pour contrôler l'affichage des colonnes de statistiques
const showStatsColumns = ref(true)

// State pour contrôler l'affichage de l'avertissement
const showWarning = ref((() => {
  if (typeof window === 'undefined') return true
  const dismissed = localStorage.getItem('casts-view-warning-dismissed')
  return dismissed !== 'true'
})())

// Fonction pour masquer l'avertissement
function dismissWarning() {
  showWarning.value = false
  if (typeof window !== 'undefined') {
    localStorage.setItem('casts-view-warning-dismissed', 'true')
  }
}

// Écouter les changements de taille d'écran
onMounted(() => {
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
  }
  
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
  })
})

// Calculer la largeur dynamique de la colonne des événements
const dynamicLeftColumnWidth = computed(() => {
  const playerCount = props.displayedPlayers?.length || 0
  const hiddenCount = props.hiddenPlayersCount || 0
  const totalPlayers = playerCount + hiddenCount
  
  // Sur mobile (iPhone SE), utiliser des largeurs plus importantes pour la lisibilité
  if (windowWidth.value <= 375) {
    // iPhone SE : largeur fixe plus importante pour la lisibilité
    return '10rem' // 160px - suffisant pour lire noms de joueurs
  }
  // iPhone 16 Plus et écrans moyens
  else if (windowWidth.value <= 430) {
    return '8rem' // 128px
  }
  // Desktop et autres écrans
  else {
    // Si peu de joueurs (1-3), colonne plus étroite
    if (totalPlayers <= 3) {
      return '5rem' // 80px
    }
    // Si nombre moyen de joueurs (4-10), colonne moyenne
    else if (totalPlayers <= 10) {
      return '7rem' // 112px
    }
    // Si beaucoup de joueurs (11+), colonne plus large
    else {
      return '10rem' // 160px
    }
  }
})

// Fonctions de calcul des statistiques de rôles
function calculatePlayerRoleStats(playerName) {
  // Trouver l'ID du joueur à partir de son nom
  const player = props.displayedPlayers.find(p => p.name === playerName)
  if (!player) {
    console.log(`❌ Joueur ${playerName} non trouvé dans displayedPlayers`)
    return { mc: 0, dj: 0, referee: 0, assistantReferee: 0, coach: 0, jeuMatch: 0, jeuCab: 0, jeuLong: 0, jeuAutre: 0, totalJeu: 0, volunteer: 0 }
  }
  
  const playerId = player.id
  
  const stats = {
    // Rôles de décorum
    mc: 0,
    dj: 0,
    referee: 0,
    assistantReferee: 0,
    coach: 0,
    // Rôles de jeu (basés sur le type d'événement)
    jeuMatch: 0,
    jeuCab: 0,
    jeuLong: 0,
    jeuAutre: 0,
    // Total de toutes les participations en tant que joueur
    totalJeu: 0,
    // Bénévoles
    volunteer: 0
  }

  // Parcourir tous les événements pour compter les rôles
  props.events.forEach(event => {
    // Règle 1: L'événement ne doit pas être archivé
    if (event.archived === true) {
      return
    }
    
    // Utiliser les données de casts pour obtenir les sélections
    const eventCasts = props.casts[event.id] || {}
    
    // Règle 2: La sélection doit avoir été verrouillée (confirmée par l'organisateur)
    if (!eventCasts || !eventCasts.confirmed) {
      return
    }
    
    // Règle 3: Vérifier si le joueur a décliné
    let hasDeclined = false
    // Vérifier dans la nouvelle structure declined
    if (eventCasts.declined) {
      Object.values(eventCasts.declined).forEach(playerIds => {
        if (Array.isArray(playerIds)) {
          if (playerIds.includes(playerId)) {
            hasDeclined = true
          }
        }
      })
    }
    // Fallback sur l'ancienne structure playerStatuses
    if (!hasDeclined && eventCasts.playerStatuses && eventCasts.playerStatuses[playerId] === 'declined') {
      hasDeclined = true
    }
    
    if (hasDeclined) {
      return
    }
    
    // Trouver le joueur par son ID dans les rôles
    let playerRole = null
    if (eventCasts.roles) {
      // Chercher dans chaque rôle
      Object.entries(eventCasts.roles).forEach(([role, players]) => {
        if (Array.isArray(players)) {
          players.forEach(player => {
            // Comparer avec l'ID du joueur
            const playerIdentifier = typeof player === 'string' ? player : (player.id || player.name || player)
            if (playerIdentifier === playerId) {
              playerRole = role
            }
          })
        }
      })
    }
    
    if (playerRole) {
      // Compter les rôles de décorum
      switch (playerRole) {
        case 'mc':
          stats.mc++
          break
        case 'dj':
          stats.dj++
          break
        case 'referee':
          stats.referee++
          break
        case 'assistant_referee':
          stats.assistantReferee++
          break
        case 'coach':
          stats.coach++
          break
        case 'player':
          // Compter TOUTES les participations en tant que joueur dans totalJeu
          stats.totalJeu++
          
          // Compter selon le type d'événement spécifique pour les colonnes dédiées
          switch (event.templateType) {
            case 'match':
              stats.jeuMatch++
              break
            case 'cabaret':
              stats.jeuCab++
              break
            case 'longform':
              stats.jeuLong++
              break
            default:
              // Pour les autres types (freeform, catch, etc.), compter dans jeuAutre
              stats.jeuAutre++
              break
          }
          break
        case 'volunteer':
          stats.volunteer++
          break
      }
    }
  })

  return stats
}

// Fonction pour obtenir le rôle d'un joueur dans un événement spécifique
function getPlayerRoleInEvent(playerId, eventId) {
  const eventCasts = props.casts[eventId] || {}
  if (eventCasts.roles) {
    for (const [role, players] of Object.entries(eventCasts.roles)) {
      if (Array.isArray(players)) {
        for (const player of players) {
          const playerIdentifier = typeof player === 'string' ? player : (player.id || player.name || player)
          if (playerIdentifier === playerId) {
            return role
          }
        }
      }
    }
  }
  return null
}

// Fonction pour obtenir le label français du rôle d'un joueur dans un événement
function getPlayerRoleLabelInEvent(playerId, eventId, playerGender = 'non-specified') {
  const role = getPlayerRoleInEvent(playerId, eventId)
  if (role) {
    return getRoleLabel(role, playerGender)
  }
  return null
}

// Fonction pour obtenir les rôles et chances d'un joueur pour un événement
function getPlayerRolesAndChances(playerId, eventId, playerGender = 'non-specified') {
  // Si le joueur est sélectionné ET la composition est validée, on n'affiche pas les chances
  const selectedRole = getPlayerRoleInEvent(playerId, eventId)
  if (selectedRole && props.isSelectionConfirmedByOrganizer(eventId)) {
    return null
  }
  
  // Trouver le nom du joueur à partir de l'ID
  const player = props.displayedPlayers.find(p => p.id === playerId)
  if (!player) {
    return null
  }
  
  // Récupérer les données d'availability avec le nom du joueur
  const availabilityData = props.getAvailabilityData(player.name, eventId)
  
  if (!availabilityData?.available || !availabilityData?.roles || availabilityData.roles.length === 0) {
    return null
  }
  
  // Pour l'instant, afficher simplement les rôles disponibles sans calculer les chances
  // (l'algorithme de casting n'a pas encore été exécuté, donc toutes les chances seraient à 0)
  const rolesWithChances = availabilityData.roles.map(role => {
    const roleLabel = getRoleLabel(role, playerGender)
    return {
      role: role,
      label: roleLabel,
      chance: null  // Pas de pourcentage pour l'instant
    }
  })
  
  return rolesWithChances
}

// Computed property pour les statistiques de tous les joueurs
const playersRoleStats = computed(() => {
  const statsMap = new Map()
  
  props.displayedPlayers.forEach(player => {
    statsMap.set(player.name, calculatePlayerRoleStats(player.name))
  })
  
  return statsMap
})

// Computed property pour le colspan de la ligne "Afficher Plus"
const showMoreColspan = computed(() => {
  // 1 pour la colonne joueur + 11 colonnes de stats (si affichées) + nombre d'événements
  const baseColumns = 1 // colonne joueur
  const statsColumns = showStatsColumns.value ? 11 : 0 // colonnes de statistiques
  const eventColumns = props.events.length // colonnes d'événements
  return baseColumns + statsColumns + eventColumns
})

// Fonction pour basculer l'affichage des colonnes de statistiques
function toggleStatsColumns() {
  showStatsColumns.value = !showStatsColumns.value
}

// Fonction d'export vers Excel/Google Sheets
function exportToExcel() {
  try {
    // Créer les données pour l'export
    const exportData = []
    
    // En-têtes
    const headers = [
      'Joueur',
      'MC',
      'DJ', 
      'ARBITRE',
      'ASSIST.',
      'COACH',
      'TOTAL DECORUM',
      'JEU MATCH',
      'JEU CAB',
      'JEU LONG',
      'JEU AUTRE',
      'TOTAL JEU',
      'BÉNÉVOLE',
      ...props.events.map(event => event.title)
    ]
    exportData.push(headers)
    
    // Données pour chaque joueur
    props.displayedPlayers.forEach(player => {
      const stats = playersRoleStats.value.get(player.name) || {mc: 0, dj: 0, referee: 0, assistantReferee: 0, coach: 0, jeuMatch: 0, jeuCab: 0, jeuLong: 0, jeuAutre: 0, totalJeu: 0, volunteer: 0}
      const playerRow = [
        player.name,
        stats.mc,
        stats.dj,
        stats.referee,
        stats.assistantReferee,
        stats.coach,
        stats.mc + stats.dj + stats.referee + stats.assistantReferee + stats.coach,
        stats.jeuMatch,
        stats.jeuCab,
        stats.jeuLong,
        stats.jeuAutre,
        stats.totalJeu,
        stats.volunteer,
        ...props.events.map(event => {
          const roleLabel = getPlayerRoleLabelInEvent(player.id, event.id, player.gender || 'non-specified')
          return roleLabel || ''
        })
      ]
      exportData.push(playerRow)
    })
    
    // Convertir en CSV
    const csvContent = exportData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `compositions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    logger.debug('✅ Export CSV généré avec succès')
  } catch (error) {
    logger.error('❌ Erreur lors de l\'export:', error)
  }
}

// Computed
const participantsTitle = computed(() => {
  if (!props.displayedPlayers) return 'Participants (0)'
  const count = props.displayedPlayers.length || 0
  
  // Texte plus court sur mobile
  if (window.innerWidth <= 430) {
    return `Part. (${count})`
  }
  
  return `Participants (${count})`
})

const eventColumnWidth = ref(300) // Valeur par défaut

const updateEventColumnWidth = () => {
  if (windowWidth.value <= 375) {
    eventColumnWidth.value = 144 // 9rem pour iPhone 16 et plus petit
  } else if (windowWidth.value <= 430) {
    eventColumnWidth.value = 160 // 10rem pour iPhone 16 Plus
  } else if (windowWidth.value <= 768) {
    eventColumnWidth.value = 160 // 10rem pour écrans moyens
  } else {
    eventColumnWidth.value = 300 // Desktop - plus d'espace pour les titres d'événements
  }
}

// Écouter les changements de taille d'écran
onMounted(() => {
  updateEventColumnWidth()
  window.addEventListener('resize', updateEventColumnWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateEventColumnWidth)
})

// Fonctions utilitaires
const getEventIcon = (event) => {
  return EVENT_TYPE_ICONS[event.templateType] || '❓'
}

const getEventStatus = (event) => {
  return getEventStatusWithSelection(event, {
    getSelectionPlayers: props.getSelectionPlayers,
    getTotalRequiredCount: props.getTotalRequiredCount,
    countAvailablePlayers: props.countAvailablePlayers,
    isSelectionConfirmed: props.isSelectionConfirmed,
    isSelectionConfirmedByOrganizer: props.isSelectionConfirmedByOrganizer,
    casts: props.casts
  })
}

// Methods
const showPlayerDetails = (player) => {
  emit('player-selected', player)
}

const handleAvailabilityChanged = (data) => {
  emit('availability-changed', data)
}

const handleScroll = (event) => {
  emit('scroll', event)
}

const togglePlayerModal = () => {
  emit('toggle-player-modal')
}

const toggleEventModal = () => {
  emit('toggle-event-modal')
}

const toggleAvailability = (playerName, eventId) => {
  emit('toggle-availability', playerName, eventId)
}

const toggleSelectionStatus = (playerName, eventId, status, seasonId) => {
  emit('toggle-selection-status', playerName, eventId, status, seasonId)
}

const openAvailabilityModal = (data) => {
  emit('show-availability-modal', data)
}

const openConfirmationModal = (data) => {
  emit('show-confirmation-modal', data)
}

const openEventModal = (event) => {
  emit('event-click', event)
}

// Fonction pour ajouter tous les joueurs à la grille
async function addAllPlayersToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les joueurs de la saison...')
    
    // Charger tous les joueurs
    const allPlayers = await loadPlayers(props.seasonId)
    
    // Recharger les disponibilités pour tous les joueurs
    const newAvailability = await loadAvailability(allPlayers, props.events, props.seasonId)
    
    logger.debug(`📊 Chargé ${allPlayers.length} joueurs (mode "tous")`)
    logger.debug('✅ Tous les joueurs chargés avec leurs disponibilités')
    
    // Émettre l'événement pour notifier le parent
    emit('all-players-loaded', { players: allPlayers, availability: newAvailability })
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les joueurs:', error)
  }
}

// Fonction pour ajouter tous les événements à la grille
async function addAllEventsToGrid() {
  try {
    logger.debug('🔄 Chargement de tous les événements de la saison...')
    
    // Émettre l'événement pour notifier le parent de charger tous les événements
    emit('all-events-loaded')
    
    logger.debug('✅ Demande de chargement de tous les événements envoyée')
  } catch (error) {
    logger.error('❌ Erreur lors du chargement de tous les événements:', error)
  }
}
</script>

<!-- Styles gérés par BaseGridView.vue -->