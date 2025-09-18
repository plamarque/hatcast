<template>
  <div class="season-header sticky top-0 z-[40] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900/95 backdrop-blur-sm border-b border-white/10" 
       style="padding-top: calc(env(safe-area-inset-top) + 1rem); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);">
    <!-- Conteneur principal avec alignement horizontal -->
    <div class="flex items-center justify-between py-3 md:py-6 px-4 md:px-6">
      
      <!-- Section gauche : bouton retour + logo -->
      <div class="flex items-center gap-3">
        <!-- Flèche de retour -->
        <button 
          @click="goBack"
          class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10 flex-shrink-0"
          title="Retour aux saisons"
        >
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <!-- Logo de la saison -->
        <div 
          v-if="seasonMeta?.logoUrl"
          @click="refreshSeason"
          class="cursor-pointer hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
          :title="`Cliquer pour rafraîchir ${seasonName}`"
        >
          <div class="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden shadow-lg">
            <img 
              :src="seasonMeta.logoUrl" 
              :alt="`Logo de ${seasonName}`"
              class="w-full h-full object-cover"
            >
          </div>
        </div>
        <div 
          v-else
          @click="refreshSeason"
          class="cursor-pointer hover:opacity-80 transition-opacity duration-200 text-2xl md:text-3xl lg:text-4xl flex-shrink-0"
          :title="`Cliquer pour rafraîchir ${seasonName}`"
        >
          🎭
        </div>
      </div>
      
      <!-- Section centre : titre -->
      <div class="flex-1 text-center px-4">
        <!-- Titre de la saison - cliquable pour rafraîchir -->
        <h1 
          @click="refreshSeason"
          class="text-xl md:text-3xl font-bold text-white mb-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer hover:from-pink-300 hover:via-purple-300 hover:to-cyan-300 transition-all duration-200 truncate"
          :title="seasonSlug ? `Cliquer pour rafraîchir ${seasonName}` : seasonName"
        >
          {{ isAdminMode ? `⚙️ Administration - ${seasonName}` : (seasonName ? seasonName : 'Chargement...') }}
        </h1>
        
        <!-- Sous-titre pour le mode administration -->
        <p v-if="isAdminMode" class="text-gray-300 text-xs md:text-sm mt-1">
          Gérer les utilisateurs, événements et paramètres
        </p>
      </div>
      
      <!-- Section droite : actions -->
      <div class="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <!-- Desktop: actions visibles -->
        <div class="hidden md:flex items-center gap-2">
          <AccountDropdown 
            :is-connected="isConnected"
            :button-class="buttonClass"
            @open-account-menu="openAccountMenu"
            @open-help="openHelp"
            @open-preferences="openPreferences"
            @open-players="openPlayers"
            @logout="logout"
            @open-login="openLogin"
            @open-development="openDevelopment"
            @open-administration="openAdministration"
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
            @open-preferences="openPreferences"
            @open-players="openPlayers"
            @logout="logout"
            @open-login="openLogin"
            @open-development="openDevelopment"
            @open-administration="openAdministration"
          />
        </div>
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
  isConnected: { type: Boolean, default: false },
  showViewToggle: { type: Boolean, default: false },
  currentViewMode: { type: String, default: 'grid' },
  isAdminMode: { type: Boolean, default: false },
  seasonMeta: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['go-back', 'open-account-menu', 'open-help', 'open-preferences', 'open-players', 'logout', 'open-login', 'open-account', 'open-account-creation', 'open-development', 'open-administration', 'toggle-view-mode'])

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
  // Naviguer vers la page d'aide
  window.location.href = '/help'
}

function openPreferences() {
  emit('open-preferences')
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

function openAdministration() {
  emit('open-administration')
}

function toggleViewMode() {
  emit('toggle-view-mode')
}

// Fonctions supprimées - boutons déplacés dans GridBoard
</script>
