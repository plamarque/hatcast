<template>
  <div class="w-full overflow-x-auto" ref="gridboardRef" @scroll="handleScroll">
    <table class="w-full table-auto border-separate border-spacing-0">
      <!-- En-tête de la table -->
      <thead class="sticky top-0 z-[100]">
        <tr>
          <!-- Colonne de gauche -->
          <th class="col-left bg-gray-800 px-4 py-3 text-left">
            <span class="text-white font-medium text-sm">{{ leftColumnTitle }}</span>
          </th>
          
          <!-- En-têtes des colonnes -->
          <th
            v-for="item in headerItems"
            :key="item.id"
            class="col-header bg-gray-800 px-2 py-3 text-center"
            :style="{ width: `${itemColumnWidth}px`, minWidth: `${itemColumnWidth}px` }"
          >
            <slot name="headers" :item="item" :item-width="itemColumnWidth">
              <!-- Slot pour les en-têtes spécifiques à chaque vue -->
            </slot>
          </th>
          
          <!-- En-tête "Afficher Plus" si nécessaire -->
          <th
            v-if="!isAllPlayersView && hiddenPlayersCount > 0"
            class="col-header bg-blue-600 px-2 py-3 text-center"
            :style="{ width: `${itemColumnWidth}px`, minWidth: `${itemColumnWidth}px` }"
          >
            <slot name="show-more-header" :item-width="itemColumnWidth">
              <!-- Slot pour le bouton "Afficher Plus" -->
            </slot>
          </th>
        </tr>
      </thead>

      <!-- Corps de la table -->
      <tbody>
        <slot name="rows" :items="rowItems" :columns="columnItems" :item-width="itemColumnWidth">
          <!-- Slot pour les lignes spécifiques à chaque vue -->
        </slot>
      </tbody>
    </table>

    <!-- Indicateurs de scroll -->
    <div v-if="showLeftHint" class="absolute left-2 top-1/2 transform -translate-y-1/2 z-50">
      <div class="bg-gray-800 text-white p-2 rounded-full shadow-lg">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <div v-if="showRightHint" class="absolute right-2 top-1/2 transform -translate-y-1/2 z-50">
      <div class="bg-gray-800 text-white p-2 rounded-full shadow-lg">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  // Données de base
  events: {
    type: Array,
    required: true
  },
  displayedPlayers: {
    type: Array,
    required: true
  },
  
  // Configuration de l'affichage
  leftColumnTitle: {
    type: String,
    required: true
  },
  headerItems: {
    type: Array,
    required: true
  },
  rowItems: {
    type: Array,
    required: true
  },
  columnItems: {
    type: Array,
    required: true
  },
  
  // Configuration des colonnes
  itemColumnWidth: {
    type: Number,
    default: 80
  },
  
  // État de l'affichage
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
  
  // Permissions et fonctions
  canEditAvailability: {
    type: Boolean,
    default: false
  },
  getPlayerAvailability: {
    type: Function,
    required: true
  },
  
})

// Emits
const emit = defineEmits([
  'player-selected',
  'availability-changed',
  'scroll',
  'toggle-player-modal'
])

// Refs
const gridboardRef = ref(null)

// State
const showLeftHint = ref(false)
const showRightHint = ref(false)

// Methods
const handleScroll = (event) => {
  const el = event.target
  const { scrollLeft, scrollWidth, clientWidth } = el
  showLeftHint.value = scrollLeft > 2
  showRightHint.value = scrollLeft < scrollWidth - clientWidth - 2
  
  // Émettre l'événement de scroll pour synchroniser avec le parent
  emit('scroll', { scrollLeft })
}

const showPlayerDetails = (player) => {
  emit('player-selected', player)
}

const handleAvailabilityChanged = (data) => {
  emit('availability-changed', data)
}

const togglePlayerModal = () => {
  emit('toggle-player-modal')
}

// Lifecycle
onMounted(() => {
  // Ajouter un listener pour le scroll
  if (gridboardRef.value) {
    gridboardRef.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  // Nettoyer les listeners
  if (gridboardRef.value) {
    gridboardRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
/* Styles communs pour les vues de grille */
.col-left {
  width: 12rem;
  min-width: 12rem;
  max-width: 12rem;
}

.left-col-td {
  width: 12rem;
  min-width: 12rem;
  max-width: 12rem;
}

.col-player {
  width: 5rem;
  min-width: 5rem;
  max-width: 5rem;
}

.col-event {
  width: 7.5rem;
  min-width: 7.5rem;
  max-width: 7.5rem;
}

/* Responsive mobile - iPhone 16 Plus et plus */
@media (max-width: 430px) {
  .col-left {
    width: 6rem !important;
    min-width: 6rem !important;
    max-width: 6rem !important;
  }
  
  .left-col-td {
    width: 6rem !important;
    min-width: 6rem !important;
    max-width: 6rem !important;
  }
  
  .col-player {
    width: 5.5rem !important;
    min-width: 5.5rem !important;
    max-width: 5.5rem !important;
  }
  
  .col-event {
    width: 4.5rem !important;
    min-width: 4.5rem !important;
    max-width: 4.5rem !important;
  }
}

/* Responsive mobile - iPhone 16 et plus petit */
@media (max-width: 375px) {
  .col-left {
    width: 5.5rem !important;
    min-width: 5.5rem !important;
    max-width: 5.5rem !important;
  }
  
  .left-col-td {
    width: 5.5rem !important;
    min-width: 5.5rem !important;
    max-width: 5.5rem !important;
  }
  
  .col-player {
    width: 5rem !important;
    min-width: 5rem !important;
    max-width: 5rem !important;
  }
  
  .col-event {
    width: 4rem !important;
    min-width: 4rem !important;
    max-width: 4rem !important;
  }
}

/* Responsive mobile - écrans moyens */
@media (max-width: 768px) and (min-width: 431px) {
  .col-left {
    width: 8rem !important;
    min-width: 8rem !important;
    max-width: 8rem !important;
  }
  
  .left-col-td {
    width: 8rem !important;
    min-width: 8rem !important;
    max-width: 8rem !important;
  }
  
  .col-player {
    width: 5rem !important;
    min-width: 5rem !important;
    max-width: 5rem !important;
  }
  
  .col-event {
    width: 5rem !important;
    min-width: 5rem !important;
    max-width: 5rem !important;
  }
}
</style>
