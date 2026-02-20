<template>
  <div class="w-full overflow-x-auto bg-gray-900 min-h-full" ref="gridboardRef" @scroll="handleScroll">
    <table 
      class="w-full table-auto border-separate border-spacing-0" 
      :style="{
        borderSpacing: windowWidth <= 430 ? '6px 8px' : '4px 8px'
      }"
    >
      <!-- En-tête de la table -->
      <thead class="sticky top-0 z-[110]">
        <tr>
          <!-- Colonne de gauche -->
          <th 
            class="col-left bg-gray-900 rounded-xl px-4 py-3 text-left sticky left-0 z-[111]"
            :style="{ 
              width: dynamicLeftColumnWidth, 
              minWidth: windowWidth.value > 768 ? '6rem' : dynamicLeftColumnWidth, 
              maxWidth: dynamicLeftColumnWidth 
            }"
          >
            <span class="text-white font-medium text-sm ml-1">{{ leftColumnTitle }}</span>
          </th>
          
          <!-- En-têtes des colonnes -->
          <th
            v-for="item in headerItems"
            :key="item.id"
            class="col-header col-event px-2 py-3 text-center"
            :style="{ width: `${itemColumnWidth}px`, minWidth: `${itemColumnWidth}px` }"
          >
            <slot name="headers" :item="item" :item-width="itemColumnWidth">
              <!-- Slot pour les en-têtes spécifiques à chaque vue -->
            </slot>
          </th>
          
          <!-- En-tête "Afficher Tous" pour les joueurs si nécessaire -->
          <th
            v-if="!isAllPlayersView && hiddenPlayersCount > 0"
            class="col-header px-2 py-3 text-center"
            :style="{ width: `${itemColumnWidth * 1.5}px`, minWidth: `${itemColumnWidth * 1.5}px` }"
          >
            <slot name="show-more-header" :item-width="itemColumnWidth">
              <!-- Slot pour le bouton "Afficher Tous" des joueurs -->
            </slot>
          </th>
          
          <!-- En-tête "Afficher Tous" pour les événements si nécessaire -->
          <th
            v-if="!isAllEventsView && hiddenEventsCount > 0"
            class="col-header px-2 py-3 text-center"
            :style="{ width: `${itemColumnWidth * 1.5}px`, minWidth: `${itemColumnWidth * 1.5}px` }"
          >
            <slot name="show-more-events-header" :item-width="itemColumnWidth">
              <!-- Slot pour le bouton "Afficher Tous" des événements -->
            </slot>
          </th>
        </tr>
      </thead>

      <!-- Corps de la table -->
      <tbody class="relative z-[45]">
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
  
  // Props pour les événements cachés
  isAllEventsView: {
    type: Boolean,
    default: false
  },
  hiddenEventsCount: {
    type: Number,
    default: 0
  },
  hiddenEventsDisplayText: {
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
  'toggle-player-modal',
  'toggle-event-modal'
])

// Refs
const gridboardRef = ref(null)

// State
const showLeftHint = ref(false)
const showRightHint = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// Écouter les changements de taille d'écran
onMounted(() => {
  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
  }
  
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
  })
})

// Calculer la largeur dynamique de la colonne des événements
const dynamicLeftColumnWidth = computed(() => {
  const playerCount = props.headerItems.length
  const hiddenCount = props.hiddenPlayersCount || 0
  const totalPlayers = playerCount + hiddenCount
  
  // Sur mobile, utiliser des largeurs optimisées pour la vue Participants
  if (windowWidth.value <= 375) {
    // iPhone SE : largeur suffisante pour lire confortablement les titres
    return '11rem' // 176px - utilise l'espace restant
  }
  else if (windowWidth.value <= 430) {
    // iPhone 16 Plus : largeur équilibrée
    return '12rem' // 192px
  }
  
  // Desktop et autres écrans : largeur adaptée au nombre de joueurs
  // Si peu de joueurs (1-3), colonne compacte
  if (totalPlayers <= 3) {
    return '8rem' // 128px - compact mais suffisant
  }
  // Si nombre moyen de joueurs (4-10), colonne équilibrée
  else if (totalPlayers <= 10) {
    return '10rem' // 160px - équilibré
  }
  // Si beaucoup de joueurs (11-20), colonne plus large
  else if (totalPlayers <= 20) {
    return '12rem' // 192px - plus d'espace
  }
  // Si très nombreux joueurs (21+), colonne très large
  else {
    return '14rem' // 224px - maximum d'espace pour le contenu
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

const toggleEventModal = () => {
  emit('toggle-event-modal')
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
  z-index: 115;
  background-color: #1f2937; /* bg-gray-800 pour correspondre à l'en-tête */
}

.col-player {
  width: 6rem;
  min-width: 6rem;
  max-width: 6rem;
}

/* .col-event width gérée dynamiquement via :style dans les composants */

/* Responsive mobile - iPhone 16 Plus et plus */
/* DEBUG: ROUGE=colonne gauche, VERT=colonnes joueurs, BLEU=colonnes événements */
@media (max-width: 430px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
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
  
  /* .col-event width gérée dynamiquement via :style dans les composants */
}

/* Responsive mobile - iPhone 16 et plus petit */
@media (max-width: 375px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
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
  
  /* .col-event width gérée dynamiquement via :style dans les composants */
}

/* Responsive mobile - écrans moyens */
@media (max-width: 768px) and (min-width: 431px) {
  /* Largeurs gérées dynamiquement via :style dans les composants */
  
  .col-player {
    width: 5rem !important;
    min-width: 5rem !important;
    max-width: 5rem !important;
  }
  
  /* .col-event width gérée dynamiquement via :style dans les composants */
}

/* Largeurs gérées dynamiquement via JavaScript */
</style>
