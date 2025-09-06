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
        <div v-if="!isReadOnly" class="grid grid-cols-3 gap-2 mb-4">
          <button
            @click="handleSave"
            :class="[
              'px-3 py-3 text-white rounded-lg transition-all duration-300',
              currentlyAvailable 
                ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/25 hover:bg-green-700' 
                : 'bg-green-500/60 hover:bg-green-500/80'
            ]"
          >
            <span class="flex items-center justify-center gap-2">
              <span v-if="currentlyAvailable" class="text-green-200">✓</span>
              Dispo
            </span>
          </button>
          <button
            @click="handleNotAvailable"
            :class="[
              'px-3 py-3 text-white rounded-lg transition-all duration-300',
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
          <button
            @click="handleClear"
            :class="[
              'px-3 py-3 text-white rounded-lg transition-all duration-300',
              currentlyUnknown 
                ? 'bg-gray-600 border-2 border-gray-400 shadow-lg shadow-gray-500/25 hover:bg-gray-700' 
                : 'bg-gray-500/60 hover:bg-gray-500/80'
            ]"
          >
            <span class="flex items-center justify-center gap-2">
              <span v-if="currentlyUnknown" class="text-gray-200">✓</span>
              Je sais pas
            </span>
          </button>
        </div>
        
        <!-- Indicateur d'état pour les cas sans état défini -->
        <div v-if="!isReadOnly && !hasCurrentState" class="text-center mb-3">
          <span class="text-xs text-gray-400">
            Aucune disponibilité définie pour cet événement
          </span>
        </div>
        
        <!-- Indication pour choisir les rôles -->
        <div v-if="!isReadOnly && currentlyAvailable && availableRoles.length > 0" class="text-center mb-3">
          <span class="text-sm text-purple-300">
            ✨ Choisis les rôles pour lesquels tu es disponible
          </span>
        </div>
        
        <!-- Rôles disponibles (seulement si des rôles sont définis ET que "Dispo" est sélectionné) -->
        <div v-if="availableRoles.length > 0 && currentlyAvailable" class="mb-4">
          <label v-if="isReadOnly" class="block text-sm font-medium text-gray-300 mb-3">
            Rôles sélectionnés
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
        <div v-if="!isReadOnly" class="flex justify-end">
          <button
            @click="handleSaveAndClose"
            :class="[
              'px-6 py-3 text-white rounded-lg transition-colors',
              currentlyAvailable && availableRoles.length > 0 
                ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 shadow-lg shadow-purple-500/25' 
                : 'bg-purple-600 hover:bg-purple-700'
            ]"
          >
            {{ currentlyAvailable && availableRoles.length > 0 ? 'Enregistrer avec rôles' : 'Enregistrer' }}
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
const selectedAvailability = ref(null) // null = pas défini, true = dispo, false = pas dispo

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

// Initialiser les valeurs quand la modale s'ouvre
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Initialiser selectedAvailability basé sur l'état actuel
    if (props.currentAvailability.available === null || props.currentAvailability.available === undefined) {
      // Aucune disponibilité définie : pré-cocher "Je sais pas" par défaut
      selectedAvailability.value = null
    } else {
      selectedAvailability.value = props.currentAvailability.available
    }
    
    // Initialiser les rôles selon l'état de disponibilité
    if (props.currentAvailability.available === true) {
      // Disponible : utiliser les rôles existants ou pré-cocher par défaut
      if (props.currentAvailability.roles && props.currentAvailability.roles.length > 0) {
        selectedRoles.value = [...props.currentAvailability.roles]
      } else if (availableRoles.value.length > 0) {
        // Pré-cocher les rôles attendus, en priorité Comédien et Bénévole s'ils sont disponibles
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
        selectedRoles.value = []
      }
    } else {
      // Pas disponible ou je sais pas : pas de rôles sélectionnés
      selectedRoles.value = []
    }
    comment.value = props.currentAvailability.comment || ''
    // Rôles affichés
  }
})

// Initialiser aussi quand currentAvailability change
watch(() => props.currentAvailability, (newAvailability) => {
  if (props.show) {
    // Initialiser selectedAvailability basé sur l'état actuel
    if (newAvailability.available === null || newAvailability.available === undefined) {
      // Aucune disponibilité définie : pré-cocher "Je sais pas" par défaut
      selectedAvailability.value = null
    } else {
      selectedAvailability.value = newAvailability.available
    }
    
    // Initialiser les rôles selon l'état de disponibilité
    if (newAvailability.available === true) {
      // Disponible : utiliser les rôles existants ou pré-cocher par défaut
      if (newAvailability.roles && newAvailability.roles.length > 0) {
        selectedRoles.value = [...newAvailability.roles]
      } else if (availableRoles.value.length > 0) {
        // Pré-cocher les rôles attendus, en priorité Comédien et Bénévole s'ils sont disponibles
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
        selectedRoles.value = []
      }
    } else {
      // Pas disponible ou je sais pas : pas de rôles sélectionnés
      selectedRoles.value = []
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
  // Utiliser l'état sélectionné par l'utilisateur
  if (selectedAvailability.value === true) {
    emit('save', {
      available: true,
      roles: selectedRoles.value,
      comment: comment.value.trim() || null
    })
  } else if (selectedAvailability.value === false) {
    emit('not-available', {
      available: false,
      roles: [],
      comment: comment.value.trim() || null
    })
  } else {
    // selectedAvailability.value === null, "Je sais pas" avec commentaire possible
    emit('clear', {
      available: null,
      roles: [],
      comment: comment.value.trim() || null
    })
  }
}

function handleSave() {
  // Mettre à jour l'état sélectionné
  selectedAvailability.value = true
  
  // Si aucun rôle n'est sélectionné, pré-cocher les rôles par défaut
  if (selectedRoles.value.length === 0 && availableRoles.value.length > 0) {
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
  }
  
  // Si aucun rôle n'est attendu, fermer directement la modale
  if (availableRoles.value.length === 0) {
    emit('save', {
      available: true,
      roles: selectedRoles.value,
      comment: comment.value.trim() || null
    })
  }
  // Sinon, laisser la modale ouverte pour que l'utilisateur puisse choisir les rôles
}

function handleNotAvailable() {
  // Mettre à jour l'état sélectionné
  selectedAvailability.value = false
  // Vider les rôles car on n'est pas disponible
  selectedRoles.value = []
  
  // Fermer directement la modale car pas de rôles à choisir
  emit('not-available', {
    available: false,
    roles: [],
    comment: comment.value.trim() || null
  })
}

function handleClear() {
  // Mettre à jour l'état sélectionné
  selectedAvailability.value = null
  selectedRoles.value = []
  // Ne pas vider le commentaire, il peut être utile pour "Je sais pas"
  
  // Fermer directement la modale car pas de rôles à choisir
  emit('clear', {
    available: null,
    roles: [],
    comment: comment.value.trim() || null
  })
}
</script>
