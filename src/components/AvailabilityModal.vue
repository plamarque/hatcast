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
          ref="availabilityFormRef"
          :player-gender="playerGender"
          :player-id="playerId"
          :current-availability="localAvailability"
          :is-read-only="isReadOnly"
          :season-id="seasonId"
          :event-roles="eventRoles"
          :available-roles="availableRoles"
          @update:availability="handleAvailabilityUpdate"
          @status-button-clicked="handleStatusButtonClicked"
          @form-changed="(data) => { localAvailability.value = data; formDirty.value = true }"
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
import { ref, computed, watch, nextTick } from 'vue'
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

// Référence vers le composant AvailabilityForm pour accéder à ses données
const availabilityFormRef = ref(null)

// État local pour synchroniser avec AvailabilityForm
const localAvailability = ref({
  available: null,
  roles: [],
  comment: null
})

// Suivi de l'état initial pour activer/désactiver le bouton Enregistrer
const initialSnapshot = ref({ available: null, roles: [], comment: '' })
const formDirty = ref(false)

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
    initialSnapshot.value = {
      available: props.currentAvailability.available,
      roles: [...(props.currentAvailability.roles || [])],
      comment: props.currentAvailability.comment || ''
    }
    formDirty.value = false
  }
})

// Ne pas écraser l'édition en cours avec des rafraîchissements externes
// (désactivé pendant que la modale est ouverte et que l'utilisateur édite)
// Si nécessaire, on pourra re-synchroniser à la réouverture via le watcher props.show

// Gérer les mises à jour depuis AvailabilityForm
function handleAvailabilityUpdate(updatedData) {
  // Mettre à jour l'état local
  localAvailability.value = updatedData
}

// Sauvegarde au clic sur les boutons de statut
function handleStatusButtonClicked(availabilityStatus) {
  nextTick(() => {
    const latestData = availabilityFormRef.value && typeof availabilityFormRef.value.getCurrentData === 'function'
      ? availabilityFormRef.value.getCurrentData()
      : localAvailability.value
    localAvailability.value = latestData
    
    if (availabilityStatus === true) {
      // Sauvegarde sans fermer
      emit('save', { ...latestData, keepOpen: true })
      // Réinitialiser le snapshot pour refléter l'état sauvegardé
      initialSnapshot.value = {
        available: latestData.available,
        roles: [...(latestData.roles || [])],
        comment: latestData.comment || ''
      }
      formDirty.value = false
    } else if (availabilityStatus === false) {
      emit('not-available', latestData)
      initialSnapshot.value = {
        available: false,
        roles: [],
        comment: latestData.comment || ''
      }
      formDirty.value = false
    } else {
      emit('clear', latestData)
      initialSnapshot.value = {
        available: null,
        roles: [],
        comment: latestData.comment || ''
      }
      formDirty.value = false
    }
  })
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
  // Toujours récupérer les dernières données du formulaire (inclut le commentaire courant)
  const latestData = availabilityFormRef.value && typeof availabilityFormRef.value.getCurrentData === 'function'
    ? availabilityFormRef.value.getCurrentData()
    : localAvailability.value
  
  // Synchroniser l'état local
  localAvailability.value = latestData
  
  // Émettre selon le statut
  if (latestData.available === true) {
    emit('save', latestData)
    initialSnapshot.value = {
      available: latestData.available,
      roles: [...(latestData.roles || [])],
      comment: latestData.comment || ''
    }
    formDirty.value = false
  } else if (latestData.available === false) {
    emit('not-available', latestData)
    initialSnapshot.value = {
      available: latestData.available,
      roles: [],
      comment: latestData.comment || ''
    }
    formDirty.value = false
  } else {
    // available === null, "Non renseigné"
    emit('clear', latestData)
    initialSnapshot.value = {
      available: null,
      roles: [],
      comment: latestData.comment || ''
    }
    formDirty.value = false
  }
}
</script>
