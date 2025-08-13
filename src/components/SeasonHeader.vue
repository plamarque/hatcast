<template>
  <div class="sticky top-0 z-[60] text-center py-4 md:py-6 px-4 relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900/95 backdrop-blur-sm border-b border-white/10">
    <!-- Flèche de retour -->
    <button 
      @click="goBack"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
      title="Retour aux saisons"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    
    <h1 class="text-4xl font-bold text-white mb-0 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
      {{ seasonName ? seasonName : 'Chargement...' }}
    </h1>
    
    <!-- Actions à droite -->
    <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
      <!-- Desktop: actions visibles -->
      <div class="hidden md:flex items-center gap-2">
        <AccountDropdown 
          :is-connected="isConnected"
          :button-class="buttonClass"
          @open-account-menu="openAccountMenu"
          @open-help="openHelp"
          @logout="logout"
          @open-login="openLogin"
        />
        
        <button
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
          @logout="logout"
          @open-login="openLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { auth } from '../services/firebase.js'
import AccountDropdown from './AccountDropdown.vue'

const props = defineProps({
  seasonName: { type: String, default: '' },
  isScrolled: { type: Boolean, default: false }
})

const emit = defineEmits(['go-back', 'open-account-menu', 'open-help', 'logout', 'open-login', 'open-account'])

// État de connexion géré localement et de manière cohérente
const currentUser = ref(null)

// Vérifier l'état de connexion de manière cohérente
const isConnected = computed(() => {
  return !!currentUser.value && !currentUser.value?.isAnonymous
})

// Style du bouton selon l'état du scroll - même logique que AppHeader
const buttonClass = computed(() => {
  return props.isScrolled 
    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' 
    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
})



// Gestion de l'état d'authentification
function onAuthStateChanged(user) {
  currentUser.value = user
}

onMounted(() => {
  // Initialiser l'état de connexion
  currentUser.value = auth.currentUser
  
  // Écouter les changements d'état d'authentification
  const unsubscribe = auth.onAuthStateChanged(onAuthStateChanged)
  
  // Stocker la fonction de cleanup pour onUnmounted
  window._seasonHeaderUnsubscribe = unsubscribe
})

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

function openHelp() {
  emit('open-help')
}

function logout() {
  emit('logout')
}

function openAccount() {
  emit('open-account')
}
</script>
