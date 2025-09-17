<template>
  <div class="w-full overflow-x-auto" ref="gridboardRef" @scroll="handleScroll">
    <table class="w-full table-auto border-separate border-spacing-0">
      <!-- En-tête de la table -->
      <thead class="sticky top-0 z-[105] shadow-lg">
        <tr>
          <!-- Colonne de gauche -->
          <th 
            class="col-left bg-gray-800 px-4 py-3 text-left sticky left-0 z-[106]"
            :style="{ width: dynamicLeftColumnWidth, minWidth: dynamicLeftColumnWidth, maxWidth: dynamicLeftColumnWidth }"
          >
            <span class="text-white font-medium text-sm">{{ leftColumnTitle }}</span>
          </th>
          
          <!-- En-têtes des colonnes -->
          <th
            v-for="item in headerItems"
            :key="item.id"
            class="col-header col-event bg-gray-800 px-2 py-3 text-center"
            :style="{ width: `${itemColumnWidth}px`, minWidth: `${itemColumnWidth}px`, backgroundColor: '#ffff00' }"
          >
            <slot name="headers" :item="item" :item-width="itemColumnWidth">
              <!-- Slot pour les en-têtes spécifiques à chaque vue -->
            </slot>
          </th>
          
          <!-- En-tête "Afficher Plus" si nécessaire -->
          <th
            v-if="!isAllPlayersView && hiddenPlayersCount > 0"
            class="col-header bg-gray-800 px-2 py-3 text-center"
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

// Calculer la largeur dynamique de la colonne des événements
const dynamicLeftColumnWidth = computed(() => {
  const playerCount = props.headerItems.length
  const hiddenCount = props.hiddenPlayersCount || 0
  const totalPlayers = playerCount + hiddenCount
  
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
})

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
  width: 5rem;
  min-width: 5rem;
  max-width: 5rem;
}

.left-col-td {
  width: 5rem;
  min-width: 5rem;
  max-width: 5rem;
  position: sticky;
  left: 0;
  z-index: 105;
  background-color: #1f2937; /* bg-gray-800 pour correspondre à l'en-tête */
}

.col-player {
  width: 6rem;
  min-width: 6rem;
  max-width: 6rem;
}

.col-event {
  width: 5rem;
  min-width: 5rem;
  max-width: 5rem;
}

/* Responsive mobile - iPhone 16 Plus et plus */
/* DEBUG: ROUGE=colonne gauche, VERT=colonnes joueurs, BLEU=colonnes événements */
@media (max-width: 430px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  .col-left {
    background-color: #ff0000 !important;
  }
  
  .left-col-td {
    background-color: #1f2937 !important; /* bg-gray-800 pour correspondre à l'en-tête */
  }
  
  /* Vue Spectacles : largeur gérée dynamiquement via :style dans les composants */
  
  /* Vue Participants : largeur gérée dynamiquement via :style dans les composants */
  
  .col-player {
    width: 20rem !important;
    min-width: 20rem !important;
    max-width: 20rem !important;
    background-color: #00ff00 !important;
  }
  
  .col-event {
    width: 10rem !important;
    min-width: 10rem !important;
    max-width: 10rem !important;
    background-color: #0000ff !important;
  }
}

/* Responsive mobile - iPhone 16 et plus petit */
@media (max-width: 375px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  .col-left {
    background-color: #ff0000 !important;
  }
  
  .left-col-td {
    background-color: #1f2937 !important; /* bg-gray-800 pour correspondre à l'en-tête */
  }
  
  /* Vue Spectacles : largeur gérée dynamiquement via :style dans les composants */
  
  .col-player {
    width: 18rem !important;
    min-width: 18rem !important;
    max-width: 18rem !important;
    background-color: #00ff00 !important;
  }
  
  .col-event {
    width: 9rem !important;
    min-width: 9rem !important;
    max-width: 9rem !important;
    background-color: #0000ff !important;
  }
}

/* Responsive mobile - écrans moyens */
@media (max-width: 768px) and (min-width: 431px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
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
