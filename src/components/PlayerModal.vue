<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[80] p-0 md:p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="relative text-center p-6 pb-4 border-b border-white/10">
        <button @click="closeModal" class="absolute right-3 top-3 text-white/80 hover:text-white">✖️</button>
        <div class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span class="text-2xl md:text-3xl">👤</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-1">{{ player?.name }}</h2>
        
        <!-- Indicateurs de statut -->
        <div class="flex items-center justify-center gap-2 mt-2">
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

      <!-- Content (scrollable) -->
      <div class="px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <!-- Stats condensées en 3 colonnes -->
        <div>
          <div class="grid grid-cols-3 gap-3 md:gap-4">
            <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 md:p-4 rounded-lg border border-cyan-500/30 text-center">
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.availability }}</div>
              <div class="text-xs md:text-sm text-gray-300">Disponibilités</div>
            </div>
            <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 md:p-4 rounded-lg border border-purple-500/30 text-center">
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.selection }}</div>
              <div class="text-xs md:text-sm text-gray-300">Sélections</div>
            </div>
            <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 md:p-4 rounded-lg border border-green-500/30 text-center">
              <div class="text-xl md:text-2xl font-bold text-white">{{ props.stats.ratio }}</div>
              <div class="text-xs md:text-sm text-gray-300">% de sélection</div>
            </div>
          </div>
        </div>

        <!-- Actions desktop -->
        <div class="hidden md:flex justify-center flex-wrap gap-3 mt-6">
          <!-- Boutons principaux -->
          <button @click="showProtectionModal = true" class="px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2">
            <span>{{ isProtectedForPlayer ? '🔓' : '🔒' }}</span>
            <span>
              {{ isProtectedForPlayer ? 'Déverrouiller' : 'Verrouiller' }}
            </span>
          </button>
          
          <!-- Menu 3-points pour actions secondaires -->
          <div class="relative" ref="playerMoreActionsRef">
            <button 
              @click="togglePlayerMoreActionsDesktop()"
              class="px-5 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-2"
              title="Plus d'actions"
            >
              <span>⋯</span><span>Plus</span>
            </button>
          </div>
          
          <!-- Bouton Fermer -->
          <button @click="closeModal" class="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300">
            Fermer
          </button>
          
          <!-- Dropdown des actions secondaires (positionné absolument) -->
          <teleport to="body">
            <div 
              v-if="showPlayerMoreActionsDesktop"
              ref="playerMoreActionsDropdownRef"
              class="w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[400] overflow-hidden"
              :style="playerMoreActionsStyle"
            >
              <button 
                @click="startEditing(); showPlayerMoreActionsDesktop = false" 
                class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
              >
                <span>✏️</span><span>Renommer</span>
              </button>
              <button 
                @click="handleDelete(); showPlayerMoreActionsDesktop = false" 
                class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <span>🗑️</span><span>Supprimer</span>
              </button>
            </div>
          </teleport>
        </div>

        <!-- Menu plus d'actions (mobile) - Supprimé, remplacé par un dropdown flottant -->
      </div>

      <!-- Footer sticky (mobile) -->
      <div class="md:hidden sticky bottom-0 w-full p-3 bg-gray-900/95 border-t border-white/10 backdrop-blur-sm flex items-center gap-2">
        <button @click="showProtectionModal = true" class="h-12 px-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex-[1.4]">
          {{ isProtectedForPlayer ? '🔓 Déverrouiller' : '🔒 Verrouiller' }}
        </button>
        <button @click="togglePlayerMoreActionsMobile()" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex items-center justify-center w-12">
          ⋯
        </button>
        <button @click="closeModal" class="h-12 px-4 bg-gray-700 text-white rounded-lg flex-1">
          Fermer
        </button>
      </div>
    </div>
  </div>

  <!-- Dropdown mobile pour actions d'événements (positionné absolument) -->
  <teleport to="body">
    <div 
      v-if="showPlayerMoreActions"
      ref="playerMoreActionsMobileDropdownRef"
      class="w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-[400] overflow-hidden md:hidden"
      :style="playerMoreActionsMobileStyle"
    >
      <!-- Actions secondaires -->
      <button @click="startEditing(); showPlayerMoreActions = false" class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/10">
        <span>✏️</span><span>Renommer</span>
      </button>
      <button @click="handleDelete(); showPlayerMoreActions = false" class="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center gap-2">
        <span>🗑️</span><span>Supprimer</span>
      </button>
    </div>
  </teleport>

  <!-- Modal d'édition du nom -->
  <div v-if="editing" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✏️ Renommer le joueur</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          v-model="editingName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
          ref="editNameInput"
        >
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

  <!-- Modal d'association du joueur -->
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
import { isPlayerProtected, isPlayerPasswordCached } from '../services/playerProtection.js'

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

const emit = defineEmits(['close', 'update', 'delete', 'refresh', 'advance-onboarding'])

const editing = ref(false)
const editingName = ref('')
const editNameInput = ref(null)
const showProtectionModal = ref(false)
const showPasswordVerification = ref(false)
const pendingAction = ref(null) // 'update' ou 'delete'
const showMoreActions = ref(false)
const showPlayerMoreActionsDesktop = ref(false)
const showPlayerMoreActions = ref(false)
const playerMoreActionsRef = ref(null)
const playerMoreActionsDropdownRef = ref(null)
const playerMoreActionsStyle = ref({ position: 'fixed', top: '0px', left: '0px' })
const playerMoreActionsMobileDropdownRef = ref(null)
const playerMoreActionsMobileStyle = ref({ position: 'fixed', top: '0px', left: '0px' })
const isProtectedForPlayer = ref(false)
const isOwnerForPlayer = ref(false)





// Fonctions de gestion
function closeModal() {
  emit('close')
  // Nettoyer les dropdowns
  showPlayerMoreActionsDesktop.value = false
  showPlayerMoreActions.value = false
  // Nettoyer les styles des dropdowns
  playerMoreActionsStyle.value = { position: 'fixed', top: '0px', left: '0px' }
  playerMoreActionsMobileStyle.value = { position: 'fixed', top: '0px', left: '0px' }
}

function startEditing() {
  editingName.value = props.player?.name || ''
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
}

async function saveEdit() {
  if (!editingName.value.trim()) return
  
  // Vérifier si le joueur est protégé
  const isProtected = await isPlayerProtected(props.player?.id, props.seasonId)
  if (isProtected) {
    // Vérifier s'il y a une session active
    const hasCachedPassword = isPlayerPasswordCached(props.player?.id)
    if (hasCachedPassword) {
      // Session active, procéder directement
      performUpdate()
    } else {
      // Pas de session, demander le mot de passe
      pendingAction.value = 'update'
      showPasswordVerification.value = true
    }
    return
  }
  
  // Si non protégé, procéder directement
  performUpdate()
}

function performUpdate() {
  emit('update', {
    playerId: props.player?.id,
    newName: editingName.value.trim()
  })
  
  editing.value = false
  editingName.value = ''
}

async function handleDelete() {
  // Vérifier si le joueur est protégé
  const isProtected = await isPlayerProtected(props.player?.id, props.seasonId)
  if (isProtected) {
    // Vérifier s'il y a une session active
    const hasCachedPassword = isPlayerPasswordCached(props.player?.id)
    if (hasCachedPassword) {
      // Session active, procéder directement
      performDelete()
    } else {
      // Pas de session, demander le mot de passe
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

function handleProtectionUpdate() {
  // Rafraîchir les données si nécessaire
  // Pas besoin d'émettre d'événement, la modal se fermera et les données seront rechargées
  // ou on peut émettre un événement spécifique pour le rafraîchissement
  emit('refresh')
}

function handlePasswordVerified(verificationData) {
  // Le mot de passe a été vérifié, procéder à l'action en cours
  if (pendingAction.value === 'update') {
    performUpdate()
  } else if (pendingAction.value === 'delete') {
    performDelete()
  }
  
  // Réinitialiser l'action en cours
  pendingAction.value = null
}

// Fonctions pour gérer les dropdowns des actions du joueur
function updatePlayerMoreActionsPosition() {
  try {
    const anchor = playerMoreActionsRef.value
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const gap = 8
    
    // Sur desktop, positionner au-dessus du bouton
    if (window.innerWidth > 768) {
      const top = Math.max(gap, Math.round(rect.top - gap))
      const left = Math.max(gap, Math.round(rect.left))
      playerMoreActionsStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 400
      }
    } else {
      // Sur mobile, positionner en dessous (pull-up style)
      const top = Math.min(window.innerHeight - gap, Math.round(rect.bottom + gap))
      const left = Math.max(gap, Math.round(rect.left))
      playerMoreActionsStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 400
      }
    }
  } catch {}
}

function updatePlayerMoreActionsMobilePosition() {
  try {
    // Pour mobile, positionner le dropdown au-dessus du bouton 3-points du footer
    const gap = 8
    const buttonHeight = 48 // hauteur du bouton 3-points (h-12)
    const dropdownHeight = 120 // estimation de la hauteur du dropdown
    
    // Positionner au-dessus du footer (pull-up style)
    const top = Math.max(gap, window.innerHeight - gap - buttonHeight - dropdownHeight)
    const left = Math.max(gap, Math.round(window.innerWidth - 200 - gap)) // 200 = largeur du dropdown (w-48)
    
    playerMoreActionsMobileStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 400
    }
  } catch {}
}

function togglePlayerMoreActionsDesktop() {
  showPlayerMoreActionsDesktop.value = !showPlayerMoreActionsDesktop.value
  if (showPlayerMoreActionsDesktop.value) {
    nextTick(() => updatePlayerMoreActionsPosition())
  }
}

function togglePlayerMoreActionsMobile() {
  showPlayerMoreActions.value = !showPlayerMoreActions.value
  if (showPlayerMoreActions.value) {
    nextTick(() => updatePlayerMoreActionsMobilePosition())
  }
}

// Réinitialiser l'édition quand la modal se ferme
watch(() => props.show, (newValue) => {
  if (!newValue) {
    editing.value = false
    editingName.value = ''
    pendingAction.value = null
    // Sécurité: s'assurer que le sous-modal protection est bien fermé
    showProtectionModal.value = false
    // Nettoyer les dropdowns
    showPlayerMoreActionsDesktop.value = false
    showPlayerMoreActions.value = false
  }
  if (newValue && props.player?.id) {
    isPlayerProtected(props.player.id, props.seasonId).then(v => { isProtectedForPlayer.value = !!v })
    import('../services/playerProtection.js').then(mod => {
      try { isOwnerForPlayer.value = !!mod.isPlayerPasswordCached(props.player.id) } catch { isOwnerForPlayer.value = false }
    })
  }
})

// Gestionnaires d'événements pour les dropdowns
onMounted(() => {
  // Gestionnaire de clic en dehors des dropdowns pour fermer automatiquement
  document.addEventListener('click', (event) => {
    // Gestion du dropdown desktop
    if (showPlayerMoreActionsDesktop.value) {
      const anchorEl = playerMoreActionsRef.value
      const dropdownEl = playerMoreActionsDropdownRef.value
      const clickedInsideAnchor = anchorEl && anchorEl.contains(event.target)
      const clickedInsideDropdown = dropdownEl && dropdownEl.contains(event.target)
      if (!clickedInsideAnchor && !clickedInsideDropdown) {
        showPlayerMoreActionsDesktop.value = false
      }
    }
    
    // Gestion du dropdown mobile
    if (showPlayerMoreActions.value) {
      const dropdownEl = playerMoreActionsMobileDropdownRef.value
      const clickedInsideDropdown = dropdownEl && dropdownEl.contains(event.target)
      if (!clickedInsideDropdown) {
        showPlayerMoreActions.value = false
      }
    }
  })
  
  // Gestionnaire de la touche Échap pour fermer les dropdowns
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (showPlayerMoreActionsDesktop.value) {
        showPlayerMoreActionsDesktop.value = false
      }
      if (showPlayerMoreActions.value) {
        showPlayerMoreActions.value = false
      }
    }
  })
  
  // Gestionnaires pour repositionner les dropdowns
  window.addEventListener('resize', () => {
    if (showPlayerMoreActionsDesktop.value) {
      updatePlayerMoreActionsPosition()
    }
    if (showPlayerMoreActions.value) {
      updatePlayerMoreActionsMobilePosition()
    }
  })
  
  window.addEventListener('scroll', () => {
    if (showPlayerMoreActionsDesktop.value) {
      updatePlayerMoreActionsPosition()
    }
    if (showPlayerMoreActions.value) {
      updatePlayerMoreActionsMobilePosition()
    }
  }, { passive: true })
})

// Exposer une méthode pour ouvrir la protection depuis le parent
defineExpose({
  openProtection() { showProtectionModal.value = true }
})

// Coachmark simple sur le bouton Protection quand onboardingStep === 4
const protectionCoachmark = ref({ position: null })

watch(() => props.show, (open) => {
  if (open && props.onboardingStep === 4) {
    nextTick(() => {
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
    })
  } else if (!open) {
    protectionCoachmark.value.position = null
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

