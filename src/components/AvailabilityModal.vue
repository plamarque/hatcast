<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[600] p-4">
    <div class="bg-gray-900 border border-gray-700 rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">
            {{ isReadOnly ? 'Détails de disponibilité' : 'Préciser ma disponibilité' }}
          </h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Informations de l'événement -->
        <div class="mt-3 text-sm text-gray-300">
          <div class="font-medium text-white">{{ eventTitle }}</div>
          <div>{{ formatDate(eventDate) }}</div>
        </div>
      </div>

      <!-- Contenu -->
      <div class="p-4">
        
        <!-- Actions rapides (déplacées en haut pour être toujours visibles) -->
        <div v-if="!isReadOnly" class="grid grid-cols-2 gap-3 mb-4">
          <button
            @click="handleSave"
            :class="[
              'px-4 py-3 text-white rounded-lg transition-all duration-300',
              currentlyAvailable 
                ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/25 hover:bg-green-700' 
                : 'bg-green-500/60 hover:bg-green-500/80'
            ]"
          >
            <span class="flex items-center justify-center gap-2">
              <span v-if="currentlyAvailable" class="text-green-200">✓</span>
              Disponible
            </span>
          </button>
          <button
            @click="handleNotAvailable"
            :class="[
              'px-4 py-3 text-white rounded-lg transition-all duration-300',
              currentlyNotAvailable 
                ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/25 hover:bg-red-700' 
                : 'bg-red-500/60 hover:bg-red-500/80'
            ]"
          >
            <span class="flex items-center justify-center gap-2">
              <span v-if="currentlyNotAvailable" class="text-red-200">✓</span>
              Pas dispo
            </span>
          </button>
        </div>
        
        <!-- Indicateur d'état pour les cas sans état défini -->
        <div v-if="!isReadOnly && !hasCurrentState" class="text-center mb-3">
          <span class="text-xs text-gray-400">
            Aucune disponibilité définie pour cet événement
          </span>
        </div>
        
        <!-- Rôles disponibles (seulement si des rôles sont définis) -->
        <div v-if="availableRoles.length > 0" class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-3">
            {{ isReadOnly ? 'Rôles sélectionnés' : 'Pour quels rôles es-tu disponible ?' }}
          </label>
          
          <div v-if="availableRoles.length === 0" class="space-y-3">
            <div class="text-center py-4 text-gray-400">
              <p>Aucun rôle spécifique n'est attendu pour cet événement.</p>
              <p class="text-sm mt-2">Tu peux indiquer ta disponibilité et ajouter un commentaire optionnel.</p>
            </div>
          </div>
          
          <div v-else class="space-y-3">
            <!-- Tous les rôles (version compacte, 2 colonnes partout) -->
            <div class="grid grid-cols-2 gap-1 md:gap-2">
              <label 
                v-for="role in availableRoles" 
                :key="role"
                class="flex items-center gap-2 md:gap-3 p-2 rounded cursor-pointer hover:bg-gray-800/50 transition-colors group"
                :class="{ 'bg-purple-500/10': selectedRoles.includes(role) }"
              >
                <input
                  type="checkbox"
                  :value="role"
                  v-model="selectedRoles"
                  :disabled="isReadOnly"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0"
                >
                <span class="text-base md:text-lg flex-shrink-0">{{ ROLE_EMOJIS[role] }}</span>
                <span class="text-xs md:text-sm text-white flex-1 min-w-0">{{ ROLE_LABELS_SINGULAR[role] }}</span>
                
                <!-- Pourcentage pour le rôle Comédien -->
                <span 
                  v-if="role === 'player' && chancePercent !== null"
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200"
                  :title="`~${chancePercent}% de chances d'être sélectionné`"
                >
                  {{ chancePercent }}%
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Commentaire -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            v-model="comment"
            :disabled="isReadOnly"
            placeholder="Ex: Dispo à partir de 16H pour monter le plateau..."
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
            rows="2"
          ></textarea>
        </div>

        <!-- Actions secondaires -->
        <div v-if="!isReadOnly" class="grid grid-cols-2 gap-3">
          <button
            @click="handleClear"
            class="px-4 py-3 bg-gray-500/40 text-white rounded-lg hover:bg-gray-500/60 transition-colors"
            title="Remettre à l'état initial (aucune disponibilité)"
          >
            Effacer
          </button>
          <button
            @click="handleSaveAndClose"
            class="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
        
        <div v-else class="flex justify-end gap-3">
          <button
            v-if="isProtected"
            @click="$emit('requestEdit')"
            class="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Modifier
          </button>
          <button
            @click="$emit('close')"
            class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ROLES, ROLE_EMOJIS, ROLE_LABELS_SINGULAR, ROLE_DISPLAY_ORDER } from '../services/storage.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerName: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  currentAvailability: {
    type: Object,
    default: () => ({
      available: false,
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
  chancePercent: {
    type: Number,
    default: null
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  eventRoles: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save', 'not-available', 'clear', 'requestEdit'])

const selectedRoles = ref([])
const comment = ref('')

// Computed property pour gérer l'affichage des rôles
const availableRoles = computed(() => {
  // Filtrer les rôles pour ne garder que ceux attendus (nombre > 0)
  return ROLE_DISPLAY_ORDER.filter(role => {
    const count = props.eventRoles[role] || 0
    return count > 0
  })
})

// Computed properties pour l'état actuel
const currentlyAvailable = computed(() => {
  return props.currentAvailability?.available === true
})

const currentlyNotAvailable = computed(() => {
  return props.currentAvailability?.available === false
})

const hasCurrentState = computed(() => {
  return props.currentAvailability?.available !== undefined && props.currentAvailability?.available !== null
})

// Initialiser les valeurs quand la modale s'ouvre
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Si aucune disponibilité n'a été saisie, pré-cocher les rôles attendus par défaut
    if (!props.currentAvailability.available && props.currentAvailability.roles.length === 0) {
      if (availableRoles.value.length > 0) {
        // Pré-cocher les rôles attendus, en priorité Comédien et Volontaire s'ils sont disponibles
        const defaultRoles = []
        if (props.eventRoles[ROLES.PLAYER] > 0) {
          defaultRoles.push(ROLES.PLAYER)
        }
        if (props.eventRoles[ROLES.VOLUNTEER] > 0) {
          defaultRoles.push(ROLES.VOLUNTEER)
        }
        // Si aucun des rôles par défaut n'est attendu, prendre le premier rôle attendu
        if (defaultRoles.length === 0 && availableRoles.value.length > 0) {
          defaultRoles.push(availableRoles.value[0])
        }
        selectedRoles.value = defaultRoles
      } else {
        // Aucun rôle défini : pas de rôles sélectionnés (disponible "en général")
        selectedRoles.value = []
      }
    } else {
      selectedRoles.value = [...props.currentAvailability.roles]
    }
    comment.value = props.currentAvailability.comment || ''
    // Rôles affichés
  }
})

// Initialiser aussi quand currentAvailability change
watch(() => props.currentAvailability, (newAvailability) => {
  if (props.show) {
            // Si aucune disponibilité n'a été saisie, pré-cocher les rôles attendus par défaut
        if (!newAvailability.available && (!newAvailability.roles || newAvailability.roles.length === 0)) {
          if (availableRoles.value.length > 0) {
            // Pré-cocher les rôles attendus, en priorité Comédien et Volontaire s'ils sont disponibles
            const defaultRoles = []
            if (props.eventRoles[ROLES.PLAYER] > 0) {
              defaultRoles.push(ROLES.PLAYER)
            }
            if (props.eventRoles[ROLES.VOLUNTEER] > 0) {
              defaultRoles.push(ROLES.VOLUNTEER)
            }
            // Si aucun des rôles par défaut n'est attendu, prendre le premier rôle attendu
            if (defaultRoles.length === 0 && availableRoles.value.length > 0) {
              defaultRoles.push(availableRoles.value[0])
            }
            selectedRoles.value = defaultRoles
          } else {
            // Aucun rôle défini : pas de rôles sélectionnés (disponible "en général")
            selectedRoles.value = []
          }
    } else {
      selectedRoles.value = [...(newAvailability.roles || [])]
    }
    comment.value = newAvailability.comment || ''
  }
}, { deep: true })

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function handleSaveAndClose() {
  // Déterminer automatiquement la disponibilité selon les rôles sélectionnés
  const hasSelectedRoles = selectedRoles.value.length > 0
  const hasComment = comment.value.trim().length > 0
  
  // Si des rôles sont sélectionnés ou qu'il y a un commentaire, considérer comme disponible
  const isAvailable = hasSelectedRoles || hasComment
  
  if (isAvailable) {
    emit('save', {
      available: true,
      roles: selectedRoles.value,
      comment: comment.value.trim() || null
    })
  } else {
    // Aucun rôle sélectionné et pas de commentaire = pas disponible
    emit('not-available', {
      available: false,
      roles: [],
      comment: null
    })
  }
}

function handleSave() {
  // Permettre la sauvegarde même sans rôles sélectionnés
  // L'utilisateur peut vouloir être disponible "en général"
  emit('save', {
    available: true,
    roles: selectedRoles.value,
    comment: comment.value.trim() || null
  })
}

function handleNotAvailable() {
  emit('not-available', {
    available: false,
    roles: [],
    comment: comment.value.trim() || null
  })
}

function handleClear() {
  emit('clear', {
    available: undefined,
    roles: [],
    comment: null
  })
}
</script>
