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
              
              <!-- Icône Modifier (visible seulement pour les admins) -->
              <button
                v-if="canEditPlayers"
                @click="startEditing"
                class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                title="Modifier cette personne"
              >
                <span class="text-lg">✏️</span>
              </button>
              
              <!-- Icône Supprimer (visible seulement pour les admins) -->
              <button
                v-if="canEditPlayers"
                @click="handleDelete"
                class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                title="Supprimer cette personne"
              >
                <span class="text-lg">🗑️</span>
              </button>
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
        <!-- Stats condensées en 3 colonnes -->
        <div>
          <div class="grid grid-cols-3 gap-3 md:gap-4">
           <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 md:p-4 rounded-lg border border-cyan-500/30 text-center">
             <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.timesAvailable }} <span class="font-normal">({{ props.stats.availability }}%)</span></div>
             <div class="text-xs md:text-sm text-gray-300">Disponibilités</div>
           </div>
            <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 md:p-4 rounded-lg border border-purple-500/30 text-center">
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.selection }}</div>
              <div class="text-xs md:text-sm text-gray-300">Participations</div>
            </div>
            <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 md:p-4 rounded-lg border border-green-500/30 text-center">
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.ratio }}%</div>
              <div class="text-xs md:text-sm text-gray-300">Taux de sélection</div>
            </div>
          </div>
        </div>

        <!-- Actions desktop -->
        <div class="hidden md:flex justify-center flex-wrap gap-3 mt-6">
          <!-- Boutons principaux -->
          <button @click="showProtectionModal = true" data-testid="protect-button" class="px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2">
            <span>{{ isProtectedForPlayer ? '🔓' : '🔒' }}</span>
            <span>
              {{ isProtectedForPlayer ? 'Désactiver la protection' : 'Protéger' }}
            </span>
          </button>
          
          <!-- Bouton Voir disponibilités -->
          <button @click="showAvailabilityGrid" class="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2">
            <span>📊</span>
            <span>Voir disponibilités</span>
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
        <button @click="showProtectionModal = true" data-testid="protect-button" class="h-12 px-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex-1">
          {{ isProtectedForPlayer ? '🔓' : '🔒' }}
        </button>
        <button @click="showAvailabilityGrid" class="h-12 px-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex-1">
          📊
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
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import PlayerClaimModal from './PlayerClaimModal.vue'
import PasswordVerificationModal from './PasswordVerificationModal.vue'
import PlayerAvatar from './PlayerAvatar.vue'
import { isPlayerProtected, isPlayerPasswordCached } from '../services/players.js'
import { currentUser } from '../services/authState.js'
import roleService from '../services/roleService.js'
import { isSuperAdmin as checkSuperAdmin } from '../services/authState.js'

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
    default: () => ({ availability: 0, selection: 0, ratio: 0 })
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
    
    // Utiliser la fonction centralisée d'authState
    const superAdminStatus = await checkSuperAdmin();
    isSuperAdmin.value = superAdminStatus;
    
    // Vérifier aussi si l'utilisateur est admin de cette saison
    let isSeasonAdmin = false;
    if (currentUserEmail && props.seasonId) {
      const { seasonRoleService } = await import('../services/seasonRoleService.js');
      isSeasonAdmin = await seasonRoleService.isUserSeasonAdmin(props.seasonId, currentUserEmail);
    }
    
    // L'utilisateur peut modifier/supprimer les joueurs s'il est Super Admin OU admin de la saison
    canEditPlayers.value = superAdminStatus || isSeasonAdmin;
    
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

