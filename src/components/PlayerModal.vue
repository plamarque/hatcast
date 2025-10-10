<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4" @click="closeModal">
    <div data-testid="player-modal" class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative p-4 md:p-6 border-b border-white/10">
        <button @click="closeModal" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        
        <!-- Layout horizontal compact -->
        <div class="flex items-center gap-4 md:gap-6">
          <!-- Avatar du joueur avec statuts superposés -->
          <div class="relative flex-shrink-0">
            <PlayerAvatar 
              :player-id="player?.id || ''"
              :season-id="seasonId"
              :player-name="player?.name || ''"
              :player-gender="player?.gender || 'non-specified'"
              size="xl"
              :show-status-icons="false"
            />
          </div>
          
          <!-- Informations principales -->
          <div class="flex-1 min-w-0">
            <!-- Nom du joueur et boutons d'action -->
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-xl md:text-2xl font-bold text-white leading-tight">{{ player?.name }}</h2>
              
              <!-- Dropdown des actions -->
              <div v-if="canEditPlayers" class="relative">
                <button
                  @click="showPlayerActionsDropdown = !showPlayerActionsDropdown"
                  class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                  title="Actions du joueur"
                >
                  <svg class="w-4 h-4 transform transition-transform duration-200" :class="{ 'rotate-180': showPlayerActionsDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Menu dropdown -->
                <div v-if="showPlayerActionsDropdown" class="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[180px]">
                  
                  <!-- Actions admin -->
                  <!-- En-tête admin -->
                  <div class="px-3 py-1 text-xs text-gray-400 font-medium">
                    Actions administrateur
                  </div>
                  
                  <!-- Action Modifier -->
                  <button
                    @click="startEditing(); showPlayerActionsDropdown = false"
                    class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <span>✏️</span>
                    <span>Modifier</span>
                  </button>
                  
                  <!-- Action Protéger/Déprotéger -->
                  <button
                    @click="showProtectionModal = true; showPlayerActionsDropdown = false"
                    class="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded flex items-center gap-2"
                    :class="isProtectedForPlayer ? 'text-green-400' : 'text-yellow-400'"
                    :title="`État: ${isProtectedForPlayer ? 'protégé' : 'non protégé'}`"
                  >
                    <span>{{ isProtectedForPlayer ? '🔓' : '🔒' }}</span>
                    <span>{{ isProtectedForPlayer ? 'Déprotéger' : 'Protéger' }}</span>
                  </button>
                  
                  <!-- Action Supprimer -->
                  <button
                    @click="handleDelete(); showPlayerActionsDropdown = false"
                    class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded flex items-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Indicateurs de statut - déplacés sous le nom -->
            <div class="flex items-center gap-2">
              <!-- Indicateur de protection -->
              <div v-if="isProtected" class="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                <span class="text-yellow-400 text-sm">🔒</span>
                <span class="text-yellow-300 text-xs font-medium">Protégé</span>
              </div>
              
              <!-- Indicateur de favori -->
              <div v-if="isPreferred" class="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                <span class="text-purple-400 text-sm">⭐</span>
                <span class="text-purple-300 text-xs font-medium">Favori</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content (scrollable) -->
      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <!-- Stats condensées en 3 cases -->
        <div>
          <div class="grid grid-cols-3 gap-3 md:gap-4">
            <!-- Disponibilités -->
            <div 
              class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 md:p-4 rounded-lg border border-green-500/30 text-center relative cursor-help"
              @mouseenter="hoveredStat = 'availabilities'"
              @mouseleave="hoveredStat = null"
            >
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.timesAvailable }} <span class="font-normal text-sm md:text-lg">({{ props.stats.availability }}%)</span></div>
              <div class="text-xs md:text-sm text-gray-300">Disponibilités</div>
              <!-- Tooltip -->
              <div 
                v-if="hoveredStat === 'availabilities'"
                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50"
              >
                Disponibilités + sélections non déclinées<br>
                Taux = ({{ props.stats.timesAvailable }} ÷ {{ props.stats.totalNonArchivedEvents || 'total' }}) × 100
              </div>
            </div>
            
            <!-- Sélections avec taux -->
            <div 
              class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 md:p-4 rounded-lg border border-purple-500/30 text-center relative cursor-help"
              @mouseenter="hoveredStat = 'selections'"
              @mouseleave="hoveredStat = null"
            >
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.selection }} <span class="font-normal text-sm md:text-lg">({{ props.stats.ratio }}%)</span></div>
              <div class="text-xs md:text-sm text-gray-300">Sélections</div>
              <!-- Tooltip -->
              <div 
                v-if="hoveredStat === 'selections'"
                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50"
              >
                Sélections confirmées non déclinées<br>
                Taux = ({{ props.stats.totalInitialSelections || (props.stats.selection + props.stats.declines) }} ÷ {{ props.stats.timesAvailable }}) × 100
              </div>
            </div>
            
            <!-- Désistements -->
            <div 
              class="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-3 md:p-4 rounded-lg border border-red-500/30 text-center relative cursor-help"
              @mouseenter="hoveredStat = 'declines'"
              @mouseleave="hoveredStat = null"
            >
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.declines }} <span class="font-normal text-sm md:text-lg">({{ props.stats.declineRate }}%)</span></div>
              <div class="text-xs md:text-sm text-gray-300">Désistements</div>
              <!-- Tooltip -->
              <div 
                v-if="hoveredStat === 'declines'"
                class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50"
              >
                Sélections déclinées<br>
                Taux = ({{ props.stats.declines }} ÷ {{ props.stats.totalInitialSelections || (props.stats.selection + props.stats.declines) }}) × 100
              </div>
            </div>
          </div>
        </div>

        <!-- Historique des sélections -->
        <div v-if="props.stats.monthlyActivityWithDetails && hasAnyActivity" class="mt-6">
          <h3 class="text-sm font-medium text-gray-300 mb-3">Ma saison en un clin d'œil</h3>
        <div class="bg-gray-800/50 rounded-lg p-4 relative">
          <div class="grid grid-cols-12 gap-2 items-end relative" :style="{ height: `${Math.max(128, maxActivityInMonth * 32 + 16)}px` }">
            <!-- Cases d'activité -->
            <div 
              v-for="(monthActivity, displayIndex) in reorderedMonthlyData" 
              :key="displayIndex"
              class="flex flex-col items-center relative"
            >
                
                <!-- Cases pour chaque activité du mois -->
                <div 
                  v-for="(activity, activityIndex) in monthActivity" 
                  :key="activityIndex"
                  class="absolute group cursor-pointer"
                  :style="{ 
                    bottom: `${activityIndex * 32}px`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }"
                  @mouseenter="hoveredActivity = activity"
                  @mouseleave="hoveredActivity = null"
                >
                  <!-- Case colorée selon le statut -->
                  <div 
                    class="w-6 h-6 rounded shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center text-sm"
                    :class="getStatusColor(activity.type, activity.status)"
                    @click="showSelectionDetails(activity)"
                  >
                    <span v-if="activity.type === 'selection' && activity.role">
                      {{ ROLE_EMOJIS[activity.role] || '🎭' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Tooltip global au survol -->
            <div 
              v-if="hoveredActivity" 
              class="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-[9999]"
              :style="getTooltipPosition(hoveredActivity)"
            >
              <div class="font-medium">{{ hoveredActivity.eventTitle }}</div>
              <div class="text-gray-300">{{ hoveredActivity.eventDate ? hoveredActivity.eventDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : 'N/A' }}</div>
              <div v-if="hoveredActivity.type === 'selection'">
                {{ getRoleLabelByGender(hoveredActivity.role) }}
                <span v-if="hoveredActivity.status === 'confirmed'"> - Confirmé</span>
                <span v-else-if="hoveredActivity.status === 'pending'"> - En attente</span>
                <span v-else-if="hoveredActivity.status === 'declined'"> - Décliné</span>
              </div>
              <div v-else-if="hoveredActivity.type === 'availability'">
                <span v-if="hoveredActivity.status === 'available'">Disponible</span>
                <span v-else-if="hoveredActivity.status === 'unavailable'">Indisponible</span>
                <span v-else-if="hoveredActivity.status === 'unanswered'">Non renseigné</span>
                <span v-else>Non renseigné</span>
              </div>
            </div>
            
            <!-- Labels des mois -->
            <div class="grid grid-cols-12 gap-2 mt-2">
              <div 
                v-for="(monthData, displayIndex) in reorderedMonthlyData" 
                :key="displayIndex"
                class="text-center"
              >
                <div class="text-xs text-gray-400">
                  {{ getMonthAbbrFromIndex(displayIndex) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rôles favoris -->
        <div v-if="props.stats.favoriteRoles && props.stats.favoriteRoles.length > 0" class="mt-6">
          <h3 class="text-sm font-medium text-gray-300 mb-3">Rôles favoris</h3>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="favoriteRole in props.stats.favoriteRoles" 
              :key="favoriteRole.role"
              class="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-2 rounded-lg border border-indigo-500/30 flex items-center gap-2"
            >
              <span class="text-lg">{{ ROLE_EMOJIS[favoriteRole.role] || '🎭' }}</span>
              <span class="text-sm text-white font-medium">{{ getRoleLabelByGender(favoriteRole.role) }}</span>
              <span class="text-xs text-gray-400">({{ favoriteRole.count }})</span>
            </div>
          </div>
        </div>

        <!-- Actions desktop -->
        <div class="hidden md:flex justify-center flex-wrap gap-3 mt-6">
          <!-- Bouton Planning -->
          <button @click="showAvailabilityGrid" class="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2">
            <span>📅</span>
            <span>Planning</span>
          </button>
          
          <!-- Bouton Fermer -->
          <button @click="closeModal" class="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">
            Fermer
          </button>
          
        </div>

        <!-- Menu plus d'actions (mobile) - Supprimé, remplacé par un dropdown flottant -->
      </div>

      <!-- Footer sticky (mobile) -->
      <div class="md:hidden sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <button @click="showAvailabilityGrid" class="h-12 px-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex-1">
          📅
        </button>
        <button @click="closeModal" class="h-12 px-3 bg-gray-700 text-white rounded-lg flex-1">
          Fermer
        </button>
      </div>
    </div>
  </div>


  <!-- Modal d'édition du nom -->
  <div v-if="editing" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9996] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✏️ Modifier la personne</h2>
      
      <!-- Nom -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          v-model="editingName"
          type="text"
          :class="[
            'w-full p-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400',
            editNameError ? 'border-red-500' : 'border-gray-600'
          ]"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
          @input="validateEditName"
          ref="editNameInput"
        >
        <div v-if="editNameError" class="mt-2 text-sm text-red-400">
          {{ editNameError }}
        </div>
      </div>

      <!-- Comment on t'appelle ? -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-3">Quel genre utiliser pour la désigner ?</label>
        <div class="space-y-3">
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="editingGender"
              type="radio"
              value="female"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">Féminin (ex: une improvisatrice)</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="editingGender"
              type="radio"
              value="male"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">Masculin (ex: un improvisateur)</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              v-model="editingGender"
              type="radio"
              value="non-specified"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
            >
            <span class="text-white group-hover:text-purple-300 transition-colors">Non spécifié (ex: un.e improvisateur.trice)</span>
          </label>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="cancelEdit"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="saveEdit"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>

        <!-- Modal d'association de la personne -->
<PlayerClaimModal
  :show="showProtectionModal"
  :player="player"
  :seasonId="seasonId"
  :onboarding="onboardingStep === 4"
  @close="showProtectionModal = false"
  @update="handleProtectionUpdate"
  @onboarding-finished="$emit('advance-onboarding', 5)"
/>

  <!-- Modal de vérification du mot de passe -->
  <PasswordVerificationModal
    :show="showPasswordVerification"
    :player="player"
    :seasonId="seasonId"
    @close="showPasswordVerification = false"
    @verified="handlePasswordVerified"
  />

    <!-- Modal des détails de sélection -->
    <div v-if="showSelectionDetailsModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" @click="showSelectionDetailsModal = false">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
      <!-- Header -->
      <div class="relative p-4 md:p-6 border-b border-white/10">
        <button @click="showSelectionDetailsModal = false" class="absolute right-3 top-3 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">✖️</button>
        <h3 class="text-lg font-bold text-white">Détails de la sélection</h3>
      </div>
      
      <!-- Content -->
      <div v-if="selectedSelection" class="px-4 md:px-6 py-4 md:py-6">
        <div class="space-y-4">
          <!-- Rôle et Statut de confirmation -->
          <div v-if="selectedSelection.type === 'selection'" class="flex items-center gap-3">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              :class="getStatusColor(selectedSelection.type, selectedSelection.status)"
            >
              <span>{{ ROLE_EMOJIS[selectedSelection.role] || '🎭' }}</span>
            </div>
            <div>
              <div class="text-sm text-gray-400">Rôle</div>
              <div class="text-white font-medium text-lg">
                {{ getRoleLabelByGender(selectedSelection.role) }}
              </div>
              <div class="text-sm text-gray-300">
                <span v-if="selectedSelection.status === 'confirmed'" class="text-green-400">✅ Confirmé</span>
                <span v-else-if="selectedSelection.status === 'pending'" class="text-orange-400">⏳ En attente</span>
                <span v-else-if="selectedSelection.status === 'declined'" class="text-red-400">❌ Décliné</span>
              </div>
            </div>
          </div>
          
          <!-- Disponibilité (seulement si pas de sélection) -->
          <div v-if="selectedSelection.type !== 'selection'" class="flex items-center gap-3">
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              :class="getStatusColor(selectedSelection.type, selectedSelection.status)"
            >
              <span v-if="selectedSelection.status === 'available'">✅</span>
              <span v-else-if="selectedSelection.status === 'unavailable'">❌</span>
              <span v-else-if="selectedSelection.status === 'unanswered'">❓</span>
              <span v-else>❓</span>
            </div>
            <div>
              <div class="text-sm text-gray-400">Disponibilité</div>
              <div class="text-white font-medium">
                <span v-if="selectedSelection.status === 'available'" class="text-green-400">Disponible</span>
                <span v-else-if="selectedSelection.status === 'unavailable'" class="text-red-400">Indisponible</span>
                <span v-else-if="selectedSelection.status === 'unanswered'" class="text-gray-400">Non renseigné</span>
                <span v-else class="text-gray-400">Non renseigné</span>
              </div>
            </div>
          </div>
          
          <!-- Événement -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-lg">
              {{ EVENT_TYPE_ICONS[selectedSelection.eventType] || '❓' }}
            </div>
            <div>
              <div class="text-sm text-gray-400">Événement</div>
              <div class="text-white font-medium">{{ selectedSelection.eventTitle }}</div>
            </div>
          </div>
          
          <!-- Date -->
          <div>
            <div class="text-sm text-gray-400">Date</div>
            <div class="text-white font-medium">{{ selectedSelection.eventDate ? selectedSelection.eventDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Date non disponible' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="px-4 md:px-6 py-4 border-t border-white/10">
        <button 
          @click="showSelectionDetailsModal = false"
          class="w-full px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import PlayerClaimModal from './PlayerClaimModal.vue'
import PasswordVerificationModal from './PasswordVerificationModal.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { isPlayerProtected, isPlayerPasswordCached } from '../services/players.js'
import { currentUser } from '../services/authState.js'
import permissionService from '../services/permissionService.js'
import { ROLE_EMOJIS, ROLE_LABELS_SINGULAR, ROLE_LABELS_BY_GENDER, EVENT_TYPE_ICONS } from '../services/storage.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  player: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: () => ({ availability: 0, selection: 0, ratio: 0, declines: 0, declineRate: 0, favoriteRoles: [], monthlyActivityWithDetails: Array(12).fill(null).map(() => []) })
  },
  availability: {
    type: Object,
    default: () => ({})
  },
  seasonId: {
    type: String,
    default: null
  },
  onboardingStep: {
    type: Number,
    default: 0
  },
  onboardingPlayerId: {
    type: [String, null],
    default: null
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  isPreferred: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update', 'delete', 'refresh', 'advance-onboarding', 'avatar-updated', 'show-availability-grid'])

// Fonctions helper pour le graphique mensuel
const getBarHeight = (count) => {
  const maxCount = Math.max(...reorderedMonthlyData.value)
  if (maxCount === 0) return '0px'
  // S'assurer qu'il y a toujours une hauteur minimale visible pour les barres non nulles
  const percentage = (count / maxCount) * 100
  return `${Math.max(percentage, count > 0 ? 8 : 0)}%`
}


// Réorganiser les données mensuelles dans l'ordre septembre-août
const reorderedMonthlyData = computed(() => {
  if (!props.stats.monthlyActivityWithDetails) return []
  
  // Les données originales sont dans l'ordre janvier-décembre (0-11)
  // On les réorganise pour septembre-août (8,9,10,11,0,1,2,3,4,5,6,7)
  const originalData = props.stats.monthlyActivityWithDetails
  const reordered = [
    originalData[8],  // Septembre
    originalData[9],  // Octobre
    originalData[10], // Novembre
    originalData[11], // Décembre
    originalData[0],  // Janvier
    originalData[1],  // Février
    originalData[2],  // Mars
    originalData[3],  // Avril
    originalData[4],  // Mai
    originalData[5],  // Juin
    originalData[6],  // Juillet
    originalData[7]   // Août
  ]
  
  return reordered
})

// Vérifier s'il y a de l'activité
const hasAnyActivity = computed(() => {
  return reorderedMonthlyData.value.some(monthActivity => monthActivity.length > 0)
})

// Calculer le maximum d'activité dans un mois
const maxActivityInMonth = computed(() => {
  return Math.max(...reorderedMonthlyData.value.map(monthActivity => monthActivity.length))
})

// Fonction pour obtenir l'abréviation du mois selon l'index d'affichage (septembre-août)
const getMonthAbbrFromIndex = (displayIndex) => {
  const monthAbbrs = ['SEP', 'OCT', 'NOV', 'DÉC', 'JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ']
  return monthAbbrs[displayIndex]
}

// Variables pour les détails de sélection
const selectedSelection = ref(null)
const showSelectionDetailsModal = ref(false)

// Variable pour le tooltip au survol
const hoveredActivity = ref(null)

// Variables pour les tooltips des statistiques
const hoveredStat = ref(null)

// Fonction pour calculer la position du tooltip
const getTooltipPosition = (activity) => {
  if (!activity) return {}
  
  // Trouver l'index du mois dans reorderedMonthlyData
  const monthIndex = reorderedMonthlyData.value.findIndex(monthActivity => 
    monthActivity.some(a => a === activity)
  )
  
  if (monthIndex === -1) return {}
  
  // Calculer la position X (centre de la colonne)
  const columnWidth = 100 / 12 // 12 colonnes
  const leftPercent = (monthIndex * columnWidth) + (columnWidth / 2)
  
  // Calculer la position Y (au-dessus de la case)
  const activityIndex = reorderedMonthlyData.value[monthIndex].findIndex(a => a === activity)
  const bottomPx = activityIndex * 32 + 16 // 16px de marge + 32px par case
  const topPx = Math.max(128, maxActivityInMonth.value * 32 + 16) - bottomPx + 8 // 8px de marge au-dessus
  
  return {
    left: `${leftPercent}%`,
    top: `${topPx}px`,
    transform: 'translateX(-50%)'
  }
}

// Fonction pour obtenir la couleur selon le type et statut
const getStatusColor = (type, status) => {
  if (type === 'selection') {
    switch (status) {
      case 'confirmed': return 'status-confirmed'
      case 'pending': return 'status-pending'
      case 'declined': return 'status-declined'
      default: return 'status-undefined'
    }
  } else if (type === 'availability') {
    switch (status) {
      case 'available': return 'status-available'
      case 'unavailable': return 'status-unavailable'
      case 'unanswered': return 'status-unanswered'
      default: return 'status-undefined'
    }
  }
  return 'status-undefined'
}

// Fonction pour obtenir le label de rôle accordé au genre du joueur
const getRoleLabelByGender = (role) => {
  const playerGender = props.player?.gender || 'non-specified'
  return ROLE_LABELS_BY_GENDER[playerGender]?.[role] || ROLE_LABELS_SINGULAR[role] || role
}

// Fonction pour obtenir la couleur de disponibilité
const getAvailabilityColor = (status) => {
  if (status === 'available') return 'status-available'
  if (status === 'unavailable') return 'status-unavailable'
  return 'status-undefined'
}

// Fonction pour afficher les détails d'une activité
const showSelectionDetails = (activity) => {
  // Enrichir les données avec les informations de disponibilité
  const enrichedActivity = { ...activity }
  
  // Récupérer la disponibilité pour cet événement
  if (props.player?.name) {
    const playerAvailability = props.availability[props.player.name]?.[activity.eventId]
    if (playerAvailability !== undefined) {
      if (typeof playerAvailability === 'boolean') {
        enrichedActivity.availabilityStatus = playerAvailability ? 'available' : 'unavailable'
      } else if (typeof playerAvailability === 'object' && playerAvailability.available !== undefined) {
        enrichedActivity.availabilityStatus = playerAvailability.available ? 'available' : 'unavailable'
      }
    }
  }
  
  selectedSelection.value = enrichedActivity
  showSelectionDetailsModal.value = true
}

const editing = ref(false)
const editingName = ref('')
const editingGender = ref('non-specified')

// Variables pour les permissions
const canEditPlayers = ref(false)
const isSuperAdmin = ref(false)
const editNameInput = ref(null)
const showProtectionModal = ref(false)
const showPasswordVerification = ref(false)
const pendingAction = ref(null) // 'update' ou 'delete'
const showMoreActions = ref(false)
const showPlayerActionsDropdown = ref(false)
const editNameError = ref('')
const isEditSessionVerified = ref(false) // Mémorise si la vérification a été faite pour cette session d'édition
const isProtectedForPlayer = ref(false)
const isOwnerForPlayer = ref(false)

// Coachmark simple sur le bouton Protection quand onboardingStep === 4
const protectionCoachmark = ref({ position: null })





// Fonctions de gestion
function closeModal() {
  emit('close')
}

// Fermer le dropdown des actions quand on clique en dehors
function handleClickOutside(event) {
  if (showPlayerActionsDropdown.value && !event.target.closest('.relative')) {
    showPlayerActionsDropdown.value = false
  }
}

function showAvailabilityGrid() {
  emit('show-availability-grid', props.player?.id)
  closeModal()
}

async function startEditing() {
  // Vérifier si le joueur est protégé avant d'ouvrir la modale d'édition
  const isProtected = await isPlayerProtected(props.player?.id, props.seasonId)
  if (isProtected) {
    // Vérifier s'il y a une session active ET que l'utilisateur est connecté
    const hasCachedPassword = isPlayerPasswordCached(props.player?.id)
    const isConnected = !!currentUser.value?.email
    if (isConnected && hasCachedPassword) {
      // Session active ET utilisateur connecté, procéder directement
      openEditModal()
    } else {
      // Pas de session ou pas connecté, demander le mot de passe
      pendingAction.value = 'edit'
      showPasswordVerification.value = true
    }
    return
  }
  
  // Si non protégé, procéder directement
  openEditModal()
}

function openEditModal() {
  editingName.value = props.player?.name || ''
  editingGender.value = props.player?.gender || 'non-specified'
  editNameError.value = ''
  editing.value = true
  nextTick(() => {
    if (editNameInput.value) {
      editNameInput.value.focus()
    }
  })
}

function cancelEdit() {
  editing.value = false
  editingName.value = ''
  editingGender.value = 'non-specified'
  editNameError.value = ''
  isEditSessionVerified.value = false
}

function validateEditName() {
  editNameError.value = ''
  
  if (!editingName.value.trim()) {
    editNameError.value = 'Le nom du joueur ne peut pas être vide'
    return false
  }
  
  // Vérifier si le nom est différent du nom actuel
  const trimmedName = editingName.value.trim()
  if (trimmedName === props.player?.name) {
    return true // Pas d'erreur si c'est le même nom
  }
  
  // Pour la validation côté client, on ne peut pas vérifier les doublons
  // car on n'a pas accès à la liste complète des joueurs
  // La validation côté serveur dans updatePlayer() s'en chargera
  return true
}

async function saveEdit() {
  // Validation côté client
  if (!validateEditName()) {
    return
  }
  
  if (!editingName.value.trim()) return
  
  // Vérifier si le joueur est protégé
  const isProtected = await isPlayerProtected(props.player?.id, props.seasonId)
  if (isProtected) {
    // Si la session d'édition a déjà été vérifiée, procéder directement
    if (isEditSessionVerified.value) {
      await performUpdate()
      return
    }
    
    // Vérifier s'il y a une session active ET que l'utilisateur est connecté
    const hasCachedPassword = isPlayerPasswordCached(props.player?.id)
    const isConnected = !!currentUser.value?.email
    if (isConnected && hasCachedPassword) {
      // Session active ET utilisateur connecté, procéder directement
      await performUpdate()
    } else {
      // Pas de session ou pas connecté, demander le mot de passe
      pendingAction.value = 'update'
      showPasswordVerification.value = true
    }
    return
  }
  
  // Si non protégé, procéder directement
  await performUpdate()
}

function performUpdate() {
  return new Promise((resolve, reject) => {
    emit('update', {
      playerId: props.player?.id,
      newName: editingName.value.trim(),
      newGender: editingGender.value
    })
    
    // Ne pas fermer le mode d'édition ici, attendre la réponse
    // Le parent devra appeler une méthode pour fermer le mode d'édition
  })
}

async function handleDelete() {
  // Vérifier si le joueur est protégé
  const isProtected = await isPlayerProtected(props.player?.id, props.seasonId)
  if (isProtected) {
    // Vérifier s'il y a une session active ET que l'utilisateur est connecté
    const hasCachedPassword = isPlayerPasswordCached(props.player?.id)
    const isConnected = !!currentUser.value?.email
    if (isConnected && hasCachedPassword) {
      // Session active ET utilisateur connecté, procéder directement
      performDelete()
    } else {
      // Pas de session ou pas connecté, demander le mot de passe
      pendingAction.value = 'delete'
      showPasswordVerification.value = true
    }
    return
  }
  
  // Si non protégé, procéder directement
  performDelete()
}

function performDelete() {
  emit('delete', props.player?.id)
}

async function handleProtectionUpdate() {
  // Recharger complètement l'état de protection depuis le backend
  if (props.player?.id) {
    try {
      console.log('🔄 Rechargement de l\'état de protection depuis le backend...')
      const { isPlayerProtected } = await import('../services/players.js')
      isProtectedForPlayer.value = await isPlayerProtected(props.player.id, props.seasonId)
      console.log('✅ État de protection rechargé:', isProtectedForPlayer.value)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'état de protection:', error)
    }
  }
  
  // Émettre l'événement de rafraîchissement pour la grille
  emit('refresh')
  
  // Émettre aussi l'événement d'update d'avatar
  emit('avatar-updated', { playerId: props.player?.id, seasonId: props.seasonId })
}

async function handlePasswordVerified(verificationData) {
  // Le mot de passe a été vérifié, procéder à l'action en cours
  if (pendingAction.value === 'edit') {
    openEditModal()
    // Marquer que la session d'édition est vérifiée
    isEditSessionVerified.value = true
  } else if (pendingAction.value === 'update') {
    await performUpdate()
  } else if (pendingAction.value === 'delete') {
    performDelete()
  }
  
  // Réinitialiser l'action en cours
  pendingAction.value = null
}


// Réinitialiser l'édition quand la modal se ferme
watch(() => props.show, (newValue) => {
  if (!newValue) {
    editing.value = false
    editingName.value = ''
    pendingAction.value = null
    isEditSessionVerified.value = false
    showPlayerActionsDropdown.value = false
    // Sécurité: s'assurer que le sous-modal protection est bien fermé
    showProtectionModal.value = false
  }
  if (newValue && props.player?.id) {
    isPlayerProtected(props.player.id, props.seasonId).then(v => { isProtectedForPlayer.value = !!v })
    import('../services/players.js').then(mod => {
      try { 
        // Seulement considérer comme owner si l'utilisateur est connecté ET a un cache
        const isConnected = !!currentUser.value?.email
        isOwnerForPlayer.value = isConnected && !!mod.isPlayerPasswordCached(props.player.id) 
      } catch { isOwnerForPlayer.value = false }
    })
  }
})


// Exposer des méthodes pour le parent
defineExpose({
  openProtection() { showProtectionModal.value = true },
  setEditError: (error) => {
    editNameError.value = error
  },
  closeEditMode: () => {
    editing.value = false
    editingName.value = ''
    editingGender.value = 'non-specified'
    editNameError.value = ''
  }
})

// Fonction de vérification des permissions
async function checkPermissions() {
  try {
    if (!props.seasonId || !currentUser.value?.email) return;
    
    // Vérifier d'abord si l'utilisateur est Super Admin
    const superAdminStatus = await permissionService.isSuperAdmin();
    isSuperAdmin.value = superAdminStatus;
    
    // Si Super Admin, raccourci : pas besoin de vérifier les rôles de saison
    if (superAdminStatus) {
      canEditPlayers.value = true;
      console.log('🔐 Raccourci Super Admin: permissions complètes accordées');
      return;
    }
    
    // Sinon, vérifier si l'utilisateur est admin de cette saison
    let isSeasonAdmin = false;
    if (currentUserEmail && props.seasonId) {
      isSeasonAdmin = await permissionService.isUserSeasonAdmin(props.seasonId, currentUserEmail);
    }
    
    // L'utilisateur peut modifier/supprimer les joueurs s'il est admin de la saison
    canEditPlayers.value = isSeasonAdmin;
    
    console.log('🔐 Permissions vérifiées:', {
      email: currentUserEmail,
      superAdmin: superAdminStatus,
      seasonAdmin: isSeasonAdmin,
      canEdit: canEditPlayers.value
    });
  } catch (error) {
    console.warn('Erreur lors de la vérification des permissions:', error);
    canEditPlayers.value = false;
    isSuperAdmin.value = false;
  }
}

// Initialisation
onMounted(() => {
  checkPermissions();
  // Ajouter l'écouteur pour fermer le dropdown en cliquant en dehors
  document.addEventListener('click', handleClickOutside);
});

// Nettoyage
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Re-vérifier les permissions à chaque ouverture du modal
watch(() => props.show, async (open) => {
  try {
    if (open && props.seasonId) {
      await checkPermissions();
    }
    
    if (open && props.onboardingStep === 4) {
      nextTick(() => {
        try {
          const btns = document.querySelectorAll('button')
          let target = null
          btns.forEach((b) => {
            if (!target && b.textContent && b.textContent.includes('Protection')) target = b
          })
          if (target) {
            const rect = target.getBoundingClientRect()
            protectionCoachmark.value.position = {
              x: Math.round(rect.right + 8),
              y: Math.round(rect.top + window.scrollY - 4)
            }
          }
        } catch (error) {
          console.warn('Erreur lors de la configuration du coachmark:', error);
        }
      })
    } else if (!open) {
      protectionCoachmark.value.position = null
    }
  } catch (error) {
    console.warn('Erreur dans le watcher du modal:', error);
  }
})
</script>

<style scoped>
.coachmark {
  position: relative;
}
.coachmark:after {
  content: '';
  position: absolute;
  top: -8px;
  left: 16px;
  border-width: 0 8px 8px 8px;
  border-style: solid;
  border-color: transparent transparent rgba(17,24,39,1) transparent;
}
</style>

