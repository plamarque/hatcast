<template>
  <div class="space-y-4">
    <!-- Actions rapides (les 3 boutons de choix) -->
    <div class="grid grid-cols-3 gap-2">
      <button
        @click="handleAvailabilityChange(true)"
        :disabled="isReadOnly"
        :class="[
          'px-3 py-3 text-white rounded-lg transition-all duration-300',
          currentlyAvailable 
            ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/25 hover:bg-green-700' 
            : 'bg-green-500/60 hover:bg-green-500/80',
          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          <span v-if="currentlyAvailable" class="text-green-200">✓</span>
          Dispo
        </span>
      </button>
      <button
        @click="handleAvailabilityChange(false)"
        :disabled="isReadOnly"
        :class="[
          'px-3 py-3 text-white rounded-lg transition-all duration-300',
          currentlyNotAvailable 
            ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/25 hover:bg-red-700' 
            : 'bg-red-500/60 hover:bg-red-500/80',
          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          <span v-if="currentlyNotAvailable" class="text-red-200">✓</span>
          Pas dispo
        </span>
      </button>
      <button
        @click="handleAvailabilityChange(null)"
        :disabled="isReadOnly"
        :class="[
          'px-3 py-3 text-white rounded-lg transition-all duration-300',
          currentlyUnknown 
            ? 'bg-gray-600 border-2 border-gray-400 shadow-lg shadow-gray-500/25 hover:bg-gray-700' 
            : 'bg-gray-500/60 hover:bg-gray-500/80',
          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <span class="flex items-center justify-center gap-2">
          <span v-if="currentlyUnknown" class="text-gray-200">✓</span>
          Non renseigné
        </span>
      </button>
    </div>
    
    <!-- Libellé d'état clair sous les boutons -->
    <div v-if="currentlyUnknown || currentlyNotAvailable" class="text-center">
      <span v-if="currentlyUnknown" class="text-xs text-gray-400">
        Tu n'as pas renseigné de dispo.
      </span>
      <span v-else-if="currentlyNotAvailable" class="text-xs text-gray-400">
        Tu n'es pas disponible pour cet événement.
      </span>
    </div>
    
    <!-- Indication pour choisir les rôles -->
    <div v-if="currentlyAvailable && availableRoles.length > 0" class="text-center">
      <span class="text-xs text-gray-400">
        ✨ Choisis les rôles pour lesquels tu es disponible
      </span>
    </div>
    
    <!-- Rôles disponibles (seulement si des rôles sont définis ET que "Dispo" est sélectionné) -->
    <div v-if="availableRoles.length > 0 && currentlyAvailable" class="space-y-3">
      <label v-if="isReadOnly" class="block text-sm font-medium text-gray-300">
        Rôles sélectionnés
      </label>
      
      <!-- Tous les rôles (version compacte, 2 colonnes) -->
      <div class="grid grid-cols-2 gap-1 md:gap-2">
        <label 
          v-for="role in availableRoles" 
          :key="role"
          class="flex items-center gap-2 md:gap-3 p-2 rounded cursor-pointer hover:bg-gray-800/50 transition-colors group"
          :class="{ 
            'bg-purple-500/10': selectedRoles.includes(role),
            'cursor-not-allowed opacity-50': isReadOnly
          }"
        >
          <input
            type="checkbox"
            :value="role"
            v-model="selectedRoles"
            :disabled="isReadOnly || !canDisableRole(role)"
            class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0"
          >
          <span class="text-base md:text-lg flex-shrink-0">{{ ROLE_EMOJIS[role] }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-xs md:text-sm text-white">{{ getRoleLabel(role, playerGender, false) }}</div>
            <!-- Indicateur pour le rôle bénévole non modifiable -->
            <div 
              v-if="role === ROLES.VOLUNTEER && !canDisableRole(role)"
              class="text-xs text-yellow-400"
            >
              (obligatoire)
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Commentaire (toujours affiché) -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Commentaire (optionnel)
      </label>
      <textarea
        v-model="comment"
        :disabled="isReadOnly"
        placeholder="Ex: Dispo à partir de 16H pour monter le plateau..."
        class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
        :class="{ 'opacity-50 cursor-not-allowed': isReadOnly }"
        rows="2"
      ></textarea>
    </div>
    <!-- Actions: bouton Enregistrer intégré -->
    <div v-if="!isReadOnly" class="flex justify-end mt-4">
      <button
        @click="onSaveClick"
        :disabled="!canSave"
        :class="[
          'px-6 py-2 text-white rounded-lg transition-colors font-medium',
          canSave ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 text-gray-300 cursor-not-allowed'
        ]"
      >
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ROLES, ROLE_EMOJIS, getRoleLabel, saveAvailabilityWithRoles } from '../services/storage.js'
import { getUserRolePreferences, getPreferredRolesForEvent, canDisableRole } from '../services/rolePreferencesService.js'
import { listAssociationsForEmail } from '../services/players.js'
import { currentUser } from '../services/authState.js'

const props = defineProps({
  playerGender: {
    type: String,
    default: 'non-specified'
  },
  playerId: {
    type: String,
    required: false
  },
  currentAvailability: {
    type: Object,
    default: () => ({
      available: null,
      roles: [],
      comment: null
    })
  },
  isReadOnly: {
    type: Boolean,
    default: false
  },
  seasonId: {
    type: String,
    default: null
  },
  eventRoles: {
    type: Object,
    default: () => ({})
  },
  // Pour les préférences de rôles
  availableRoles: {
    type: Array,
    default: () => []
  },
  // Activer la persistance interne (autonome)
  selfPersist: {
    type: Boolean,
    default: false
  },
  // Contexte requis pour la persistance interne
  playerName: {
    type: String,
    required: false
  },
  eventId: {
    type: String,
    required: false
  }
})

const emit = defineEmits(['update:availability', 'update:roles', 'update:comment', 'status-button-clicked', 'save-requested', 'availability-saved'])

const selectedRoles = ref([])
const comment = ref('')
// plus utilisé: on remonte l'état via form-changed/editing
const selectedAvailability = ref(null) // null = pas défini, true = dispo, false = pas dispo
const userRolePreferences = ref(null)
const favoritePlayerIds = ref(new Set())
const isUpdatingFromProps = ref(false) // Flag pour éviter les boucles de réactivité

// Computed properties pour l'état actuel
const currentlyAvailable = computed(() => {
  return selectedAvailability.value === true
})

const currentlyNotAvailable = computed(() => {
  return selectedAvailability.value === false
})

const currentlyUnknown = computed(() => {
  return selectedAvailability.value === null
})

const hasCurrentState = computed(() => {
  return props.currentAvailability?.available !== undefined && props.currentAvailability?.available !== null
})

// Mémo de la dernière valeur émise pour éviter les boucles de synchro
const lastEmittedData = ref(null)

function normalizeComment(value) {
  return value == null ? '' : String(value)
}

function areRolesEqual(a = [], b = []) {
  const sa = [...a].sort()
  const sb = [...b].sort()
  if (sa.length !== sb.length) return false
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] !== sb[i]) return false
  }
  return true
}

function isSameAvailability(a, b) {
  if (!a || !b) return false
  return (
    a.available === b.available &&
    normalizeComment(a.comment) === normalizeComment(b.comment) &&
    areRolesEqual(a.roles, b.roles)
  )
}

// Snapshot initial pour la logique canSave (commentaire et rôles)
const initialSnapshot = ref({ comment: '', roles: [] })

const canSave = computed(() => {
  const commentChanged = normalizeComment(comment.value) !== normalizeComment(initialSnapshot.value.comment)
  const rolesChanged = selectedAvailability.value === true && !areRolesEqual(selectedRoles.value, initialSnapshot.value.roles)
  return commentChanged || rolesChanged
})

// Charger les préférences de rôles de l'utilisateur
async function loadUserRolePreferences() {
  try {
    userRolePreferences.value = await getUserRolePreferences()
  } catch (error) {
    console.warn('Erreur lors du chargement des préférences de rôles:', error)
    userRolePreferences.value = null
  }
}

// Charger les joueurs favoris de l'utilisateur
async function loadFavoritePlayers() {
  try {
    const user = currentUser.value
    if (!user?.email || !props.seasonId) {
      favoritePlayerIds.value = new Set()
      return
    }
    
    const assocs = await listAssociationsForEmail(user.email)
    const seasonal = assocs.filter(a => a.seasonId === props.seasonId)
    
    if (seasonal.length > 0) {
      const playerIds = seasonal.map(a => a.playerId)
      favoritePlayerIds.value = new Set(playerIds)
    } else {
      favoritePlayerIds.value = new Set()
    }
  } catch (error) {
    console.warn('Erreur lors du chargement des favoris:', error)
    favoritePlayerIds.value = new Set()
  }
}

// Fonction pour vérifier si le joueur actuel est un favori de l'utilisateur connecté
function isCurrentPlayerFavorite() {
  const currentPlayerId = props.playerId
  return currentPlayerId ? favoritePlayerIds.value.has(currentPlayerId) : false
}

// Fonction pour obtenir les rôles à pré-cocher selon les préférences
function getDefaultRolesToSelect() {
  // Vérifier si le joueur actuel est un favori de l'utilisateur connecté
  if (!isCurrentPlayerFavorite()) {
    // Fallback vers l'ancien comportement si pas un favori
    const defaultRoles = []
    if (props.eventRoles[ROLES.PLAYER] > 0) {
      defaultRoles.push(ROLES.PLAYER)
    }
    if (props.eventRoles[ROLES.VOLUNTEER] > 0) {
      defaultRoles.push(ROLES.VOLUNTEER)
    }
    if (defaultRoles.length === 0 && props.availableRoles.length > 0) {
      defaultRoles.push(props.availableRoles[0])
    }
    return defaultRoles
  }
  
  if (!userRolePreferences.value || props.availableRoles.length === 0) {
    // Fallback vers l'ancien comportement si pas de préférences
    const defaultRoles = []
    if (props.eventRoles[ROLES.PLAYER] > 0) {
      defaultRoles.push(ROLES.PLAYER)
    }
    if (props.eventRoles[ROLES.VOLUNTEER] > 0) {
      defaultRoles.push(ROLES.VOLUNTEER)
    }
    if (defaultRoles.length === 0 && props.availableRoles.length > 0) {
      defaultRoles.push(props.availableRoles[0])
    }
    return defaultRoles
  }

  // Utiliser les préférences de l'utilisateur (seulement pour les favoris)
  const preferredRoles = getPreferredRolesForEvent(props.availableRoles, userRolePreferences.value)
  return preferredRoles
}

// Fonction pour s'assurer que le rôle bénévole est toujours sélectionné
function ensureVolunteerRoleSelected() {
  if (props.availableRoles.includes(ROLES.VOLUNTEER) && !selectedRoles.value.includes(ROLES.VOLUNTEER)) {
    selectedRoles.value.push(ROLES.VOLUNTEER)
  }
}

// Gérer le changement de disponibilité
function handleAvailabilityChange(available) {
  if (props.isReadOnly) return
  
  selectedAvailability.value = available
  
  // Si on passe à "Dispo", pré-cocher les rôles selon les préférences
  if (available === true && props.availableRoles.length > 0) {
    if (selectedRoles.value.length === 0) {
      selectedRoles.value = getDefaultRolesToSelect()
    }
  } else {
    // Sinon, vider les rôles
    selectedRoles.value = []
  }
  
  // Notifier le parent qu'il y a eu un changement dans le formulaire (pour activer le bouton Enregistrer)
  emitChanges()
  
  if (props.selfPersist) {
    // Persistance rapide interne
    persistCurrent(available === true)
  } else {
    // Comportement actuel: informer le parent
    emit('status-button-clicked', available)
  }
}

// Émettre tous les changements au parent
function emitChanges() {
  // Ne pas émettre si on est en train de mettre à jour depuis les props (éviter les boucles)
  if (isUpdatingFromProps.value) return
  
  const payload = {
    available: selectedAvailability.value,
    roles: selectedRoles.value,
    comment: comment.value
  }
  lastEmittedData.value = {
    available: payload.available,
    roles: [...payload.roles],
    comment: normalizeComment(payload.comment)
  }
  emit('update:availability', payload)
}

// Watcher pour détecter les changements de rôles
watch(selectedRoles, () => {
  ensureVolunteerRoleSelected()
  // Notifier uniquement pour l'état visuel (pas d'update de disponibilité)
  emitChanges()
}, { deep: true })

// Notifier les changements lors de la saisie du commentaire (sans émettre d'update)
watch(comment, () => {
  emitChanges()
})

// Note: On n'émet PAS les changements lors de la saisie du commentaire
// Le commentaire sera sauvegardé lors du clic sur un bouton de choix ou sur "Enregistrer"

// Exposer une méthode pour récupérer les données actuelles du formulaire
function getCurrentData() {
  return {
    available: selectedAvailability.value,
    roles: selectedRoles.value,
    comment: comment.value
  }
}

// Exposer la méthode au parent via defineExpose
defineExpose({
  getCurrentData
})

// Initialiser les valeurs quand les props changent
watch(() => props.currentAvailability, async (newAvailability) => {
  // Activer le flag pour éviter les boucles de réactivité
  isUpdatingFromProps.value = true
  
  // Charger les préférences de rôles de l'utilisateur
  await loadUserRolePreferences()
  
  // Charger les joueurs favoris
  await loadFavoritePlayers()
  
  // Si la nouvelle dispo est identique à la dernière émise, ne rien réinitialiser
  const normalizedIncoming = {
    available: newAvailability.available ?? null,
    roles: Array.isArray(newAvailability.roles) ? newAvailability.roles : [],
    comment: normalizeComment(newAvailability.comment)
  }
  if (lastEmittedData.value && isSameAvailability(normalizedIncoming, lastEmittedData.value)) {
    isUpdatingFromProps.value = false
    return
  }

  // Initialiser selectedAvailability basé sur l'état actuel
  if (newAvailability.available === null || newAvailability.available === undefined) {
    selectedAvailability.value = null
  } else {
    selectedAvailability.value = newAvailability.available
  }
  
  // Initialiser les rôles selon l'état de disponibilité
  if (newAvailability.available === true) {
    // Disponible : utiliser les rôles existants ou pré-cocher selon les préférences
    if (newAvailability.roles && newAvailability.roles.length > 0) {
      selectedRoles.value = [...newAvailability.roles]
    } else if (props.availableRoles.length > 0) {
      // Utiliser les préférences de l'utilisateur pour pré-cocher les rôles
      selectedRoles.value = getDefaultRolesToSelect()
    } else {
      selectedRoles.value = []
    }
  } else {
    // Pas disponible ou je sais pas : pas de rôles sélectionnés
    selectedRoles.value = []
  }
  comment.value = normalizeComment(newAvailability.comment)
  // Mettre à jour le snapshot initial pour la logique canSave
  initialSnapshot.value = {
    comment: comment.value,
    roles: [...selectedRoles.value]
  }
  
  // Désactiver le flag après la mise à jour (utiliser nextTick pour s'assurer que tous les watchers sont passés)
  await nextTick()
  isUpdatingFromProps.value = false
}, { immediate: true, deep: true })

async function persistCurrent(keepOpen) {
  try {
    if (!props.seasonId || !props.playerName || !props.eventId) {
      emit('save-requested', getCurrentData())
      return
    }
    await saveAvailabilityWithRoles({
      seasonId: props.seasonId,
      playerName: props.playerName,
      eventId: props.eventId,
      available: selectedAvailability.value,
      roles: selectedAvailability.value === true ? selectedRoles.value : [],
      comment: normalizeComment(comment.value)
    })
    emit('availability-saved', { ...getCurrentData(), keepOpen: !!keepOpen })
    initialSnapshot.value = {
      comment: normalizeComment(comment.value),
      roles: [...selectedRoles.value]
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Erreur persistance disponibilité:', e)
  }
}

function onSaveClick() {
  if (props.selfPersist) {
    persistCurrent(false)
  } else {
    emit('save-requested', getCurrentData())
  }
}
</script>
