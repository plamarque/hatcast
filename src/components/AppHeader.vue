<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg' : 'bg-gray-900/20 backdrop-blur-sm'">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo HatCast à gauche -->
        <div class="flex items-center">
          <a href="/" class="flex items-center">
            <div class="relative w-48 h-12 md:w-56 md:h-14">
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
import AccountDropdown from './AccountDropdown.vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  isScrolled: { type: Boolean, default: false }
})

const emit = defineEmits(['open-account-menu', 'open-help', 'open-notifications', 'open-players', 'logout', 'open-login'])

const route = useRoute()

// État de connexion géré localement et de manière cohérente
const currentUser = ref(null)

// Vérifier l'état de connexion de manière cohérente
const isConnected = computed(() => {
  return !!currentUser.value && !currentUser.value?.isAnonymous
})

// Style du bouton selon l'état du scroll
const buttonClass = computed(() => {
  return props.isScrolled 
    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' 
    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
})

// Gestion de l'état d'authentification
function onAuthStateChanged(user) {
  currentUser.value = user
}

// Forcer la synchronisation de l'état d'authentification
function forceAuthSync() {
  currentUser.value = auth.currentUser
}

onMounted(() => {
  // Initialiser l'état de connexion immédiatement
  currentUser.value = auth.currentUser
  
  // Écouter les changements d'état d'authentification
  const unsubscribe = auth.onAuthStateChanged(onAuthStateChanged)
  
  // Stocker la fonction de cleanup pour onUnmounted
  window._appHeaderUnsubscribe = unsubscribe
})

// Forcer la synchronisation quand la route change
watch(() => route.path, () => {
  // Petit délai pour laisser le temps à Firebase de se synchroniser
  setTimeout(() => {
    forceAuthSync()
  }, 100)
})

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
  emit('open-login')
}
</script>
