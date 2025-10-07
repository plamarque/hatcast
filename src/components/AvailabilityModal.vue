<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1500] p-4">
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
        <!-- Utilisation du composant factorisé AvailabilityForm -->
        <AvailabilityForm
          :player-gender="playerGender"
          :player-id="playerId"
          :current-availability="localAvailability"
          :is-read-only="isReadOnly"
          :season-id="seasonId"
          :event-roles="eventRoles"
          :available-roles="availableRoles"
          @update:availability="handleAvailabilityUpdate"
        />

        <!-- Actions secondaires -->
        <div v-if="!isReadOnly" class="flex justify-end mt-4">
          <button
            @click="handleSaveAndClose"
            :class="[
              'px-6 py-3 text-white rounded-lg transition-colors',
              localAvailability.available === true && availableRoles.length > 0 
                ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 shadow-lg shadow-purple-500/25' 
                : 'bg-purple-600 hover:bg-purple-700'
            ]"
          >
            {{ localAvailability.available === true && availableRoles.length > 0 ? 'Enregistrer avec rôles' : 'Enregistrer' }}
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
import { ROLE_PRIORITY_ORDER } from '../services/storage.js'
import AvailabilityForm from './AvailabilityForm.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  playerName: {
    type: String,
    required: true
  },
  playerId: {
    type: String,
    required: false
  },
  playerGender: {
    type: String,
    default: 'non-specified'
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

// État local pour synchroniser avec AvailabilityForm
const localAvailability = ref({
  available: null,
  roles: [],
  comment: null
})

// Computed property pour gérer l'affichage des rôles
const availableRoles = computed(() => {
  // Filtrer les rôles pour ne garder que ceux attendus (nombre > 0)
  // et les trier par ordre de priorité du tirage
  const rolesWithSlots = ROLE_PRIORITY_ORDER.filter(role => {
    const count = props.eventRoles[role] || 0
    return count > 0
  })
  
  // Ajouter les rôles non définis dans ROLE_PRIORITY_ORDER à la fin (tri alphabétique)
  const undefinedRoles = Object.keys(props.eventRoles)
    .filter(role => props.eventRoles[role] > 0 && !ROLE_PRIORITY_ORDER.includes(role))
    .sort()
  
  return [...rolesWithSlots, ...undefinedRoles]
})

// Initialiser les valeurs quand la modale s'ouvre
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Initialiser l'état local avec les données de la prop
    localAvailability.value = {
      available: props.currentAvailability.available,
      roles: props.currentAvailability.roles || [],
      comment: props.currentAvailability.comment || null
    }
  }
})

// Initialiser aussi quand currentAvailability change
watch(() => props.currentAvailability, (newAvailability) => {
  if (props.show) {
    localAvailability.value = {
      available: newAvailability.available,
      roles: newAvailability.roles || [],
      comment: newAvailability.comment || null
    }
  }
}, { deep: true })

// Gérer les mises à jour depuis AvailabilityForm
function handleAvailabilityUpdate(updatedData) {
  localAvailability.value = updatedData
}

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
  // Utiliser l'état local pour émettre
  if (localAvailability.value.available === true) {
    emit('save', localAvailability.value)
  } else if (localAvailability.value.available === false) {
    emit('not-available', localAvailability.value)
  } else {
    // available === null, "Non renseigné"
    emit('clear', localAvailability.value)
  }
}
</script>
