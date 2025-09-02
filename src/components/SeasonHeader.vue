<template>
  <div class="sticky top-0 z-[60] text-center py-3 md:py-6 px-2 md:px-4 relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900/95 backdrop-blur-sm border-b border-white/10">
    <!-- Flèche de retour - optimisée pour mobile avec marge réduite -->
    <button 
      @click="goBack"
      class="absolute left-1 md:left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-1.5 md:p-2 rounded-full hover:bg-white/10"
      title="Retour aux saisons"
    >
      <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    
    <!-- Titre de la saison - cliquable pour rafraîchir -->
    <h1 
      @click="refreshSeason"
      class="text-2xl md:text-4xl font-bold text-white mb-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent px-6 md:px-16 truncate max-w-full cursor-pointer hover:from-pink-300 hover:via-purple-300 hover:to-cyan-300 transition-all duration-200"
      :title="seasonSlug ? `Cliquer pour rafraîchir ${seasonName}` : seasonName"
    >
      {{ seasonName ? seasonName : 'Chargement...' }}
    </h1>
    
    <!-- Actions à droite - optimisées pour mobile -->
    <div class="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
      <!-- Desktop: actions visibles -->
      <div class="hidden md:flex items-center gap-2">
        <AccountDropdown 
          :is-connected="isConnected"
          :button-class="buttonClass"
          @open-account-menu="openAccountMenu"
          @open-help="openHelp"
          @open-notifications="openNotifications"
          @open-players="openPlayers"
          @logout="logout"
          @open-login="openLogin"
          @open-development="openDevelopment"
        />
        
        <!-- Icône aide seulement quand pas connecté (à côté du bouton connexion) -->
        <button
          v-if="!isConnected"
          @click="openHelp"
          class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
          title="Kezako ?"
          aria-label="Kezako ?"
        >
          <span class="text-2xl">❓</span>
        </button>
      </div>

      <!-- Mobile: icône portrait (même comportement que desktop) -->
      <div class="md:hidden">
        <AccountDropdown 
          :is-connected="isConnected"
          :button-class="buttonClass"
          @open-account-menu="openAccountMenu"
          @open-help="openHelp"
          @open-notifications="openNotifications"
          @open-players="openPlayers"
          @logout="logout"
          @open-login="openLogin"
          @open-development="openDevelopment"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getFirebaseAuth } from '../services/firebase.js'
import AccountDropdown from './AccountDropdown.vue'

const props = defineProps({
  seasonName: { type: String, default: '' },
  isScrolled: { type: Boolean, default: false },
  seasonSlug: { type: String, default: '' },
  isConnected: { type: Boolean, default: false }
})

const emit = defineEmits(['go-back', 'open-account-menu', 'open-help', 'open-notifications', 'open-players', 'logout', 'open-login', 'open-account', 'open-account-creation', 'open-development'])

// État de connexion reçu depuis le composant parent (GridBoard)
// Plus besoin de logique locale d'authentification

// Style du bouton selon l'état du scroll - même logique que AppHeader
const buttonClass = computed(() => {
  return props.isScrolled 
    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' 
    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
})

// Fonction pour rafraîchir la saison
function refreshSeason() {
  if (props.seasonSlug) {
    window.location.href = `/season/${props.seasonSlug}`
  }
}

// Plus besoin de gérer l'authentification localement
// L'état est maintenant reçu depuis GridBoard via la prop isConnected

onUnmounted(() => {
  // Cleanup de l'écouteur d'authentification
  if (window._seasonHeaderUnsubscribe) {
    window._seasonHeaderUnsubscribe()
    delete window._seasonHeaderUnsubscribe
  }
})

function goBack() {
  emit('go-back')
}

function openAccountMenu() {
  emit('open-account-menu')
}

function openLogin() {
  emit('open-login')
}

function openAccountCreation() {
  emit('open-account-creation')
}

function openHelp() {
  emit('open-help')
}

function openNotifications() {
  emit('open-notifications')
}

function openPlayers() {
  emit('open-players')
}

function logout() {
  emit('logout')
}

function openAccount() {
  emit('open-account')
}

function openDevelopment() {
  emit('open-development')
}
</script>
