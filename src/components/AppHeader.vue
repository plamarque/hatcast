<template>
  <header data-testid="app-header" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-area-top safe-area-x" :class="isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg' : 'bg-transparent'">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo HatCast à gauche OU bouton de retour -->
        <div class="flex items-center">
          <!-- Bouton de retour si showBackButton est true -->
          <button 
            v-if="showBackButton"
            @click="goBack"
            class="flex items-center text-white hover:text-purple-300 transition-colors duration-200 p-1.5 md:p-2 rounded-full hover:bg-white/10"
            title="Retour à l'accueil"
          >
            <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <!-- Logo HatCast si showBackButton est false -->
          <a v-else href="/" data-testid="home-link" class="flex items-center" title="Retour à l'accueil HatCast">
            <div class="relative w-48 h-12 md:w-56 md:h-14">
              <!-- Logo personnalisé si fourni -->
              <template v-if="customLogo">
                <img 
                  :src="customLogo" 
                  alt="Logo HatCast - Retour à l'accueil" 
                  class="w-auto h-full max-w-full object-contain drop-shadow-lg transform hover:scale-105 transition-all duration-300"
                />
              </template>
              <!-- Logo par défaut sinon -->
              <template v-else>
                <!-- Logo avec filtre blanc pour fond transparent (non scrollé) -->
                <template v-if="!isScrolled">
                  <img 
                    src="/logos/hatcast-logo-mobile.png" 
                    alt="Logo HatCast - Retour à l'accueil" 
                    class="w-full h-full drop-shadow-lg transform hover:scale-105 transition-all duration-300 md:hidden brightness-0 invert"
                  />
                  <img 
                    src="/logos/hatcast-logo-desktop.png" 
                    alt="Logo HatCast - Retour à l'accueil" 
                    class="w-full h-full drop-shadow-lg transform hover:scale-105 transition-all duration-300 hidden md:block brightness-0 invert"
                  />
                </template>
                <!-- Logo coloré pour fond blanc (scrollé) -->
                <template v-else>
                  <img 
                    src="/logos/hatcast-logo-mobile.png" 
                    alt="Logo HatCast - Retour à l'accueil" 
                    class="w-full h-full drop-shadow-lg transform hover:scale-105 transition-all duration-300 md:hidden"
                  />
                  <img 
                    src="/logos/hatcast-logo-desktop.png" 
                    alt="Logo HatCast - Retour à l'accueil" 
                    class="w-full h-full drop-shadow-lg transform hover:scale-105 transition-all duration-300 hidden md:block"
                  />
                </template>
              </template>
            </div>
          </a>
        </div>
        
        <!-- Navigation à droite -->
        <div class="flex items-center gap-2">
          <!-- Composant unifié pour la gestion du compte -->
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
          
          <!-- Actions supplémentaires via slot -->
          <slot name="actions"></slot>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { auth } from '../services/firebase.js'
import { currentUser, forceSync } from '../services/authState.js'
import AccountDropdown from './AccountDropdown.vue'
import { useRoute, useRouter } from 'vue-router'
import logger from '../services/logger.js'

const props = defineProps({
  isScrolled: { type: Boolean, default: false },
  customLogo: { type: String, default: null },
  isConnected: { type: Boolean, default: false },
  showBackButton: { type: Boolean, default: false }
})

const emit = defineEmits(['open-account-menu', 'open-help', 'open-preferences', 'open-players', 'logout', 'open-login', 'open-account-creation', 'open-development', 'open-administration'])

const route = useRoute()
const router = useRouter()

// Style du bouton selon l'état du scroll
const buttonClass = computed(() => {
  return props.isScrolled 
    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' 
    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
})

// Fonction de retour - redirige vers l'accueil
function goBack() {
  router.push('/')
}

// Forcer la synchronisation quand la route change
watch(() => route.path, () => {
  // Synchronisation immédiate puis avec un petit délai pour Firebase
  forceSync()
  setTimeout(() => {
    forceSync()
  }, 100)
}, { immediate: true })

onUnmounted(() => {
  // Cleanup de l'écouteur d'authentification
  if (window._appHeaderUnsubscribe) {
    window._appHeaderUnsubscribe()
    delete window._appHeaderUnsubscribe
  }
})

function openAccountMenu() {
  emit('open-account-menu')
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

function openLogin() {
  logger.info('🔑 AppHeader: openLogin() appelé')
  emit('open-login')
  logger.info('🔑 AppHeader: événement open-login émis')
}

function openAccountCreation() {
  emit('open-account-creation')
}

function openDevelopment() {
  emit('open-development')
}

function openAdministration() {
  emit('open-administration')
}
</script>
