<template>
  <header data-testid="app-header" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg' : 'bg-transparent'">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo HatCast à gauche -->
        <div class="flex items-center">
          <a href="/" data-testid="home-link" class="flex items-center" title="Retour à l'accueil HatCast">
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
            @open-notifications="openNotifications"
            @open-players="openPlayers"
            @logout="logout"
            @open-login="openLogin"
            @open-development="openDevelopment"
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
import { currentUser, isConnected, forceSync } from '../services/authState.js'
import AccountDropdown from './AccountDropdown.vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  isScrolled: { type: Boolean, default: false },
  customLogo: { type: String, default: null }
})

const emit = defineEmits(['open-account-menu', 'open-help', 'open-notifications', 'open-players', 'logout', 'open-login', 'open-account-creation', 'open-development'])

const route = useRoute()

// Style du bouton selon l'état du scroll
const buttonClass = computed(() => {
  return props.isScrolled 
    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' 
    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
})

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

function openLogin() {
  console.log('🔑 AppHeader: openLogin() appelé')
  emit('open-login')
  console.log('🔑 AppHeader: événement open-login émis')
}

function openAccountCreation() {
  emit('open-account-creation')
}

function openDevelopment() {
  emit('open-development')
}
</script>
