<template>
  <div class="relative" @click.stop>
    <!-- État de chargement -->
    <div v-if="isLoading" class="w-10 h-10 bg-gray-600 animate-pulse rounded-full"></div>
    
    <!-- Bouton Connexion si non connecté et chargement terminé -->
    <button
      v-else-if="!isConnected"
      @click="openLogin"
      class="px-4 py-2 rounded-lg transition-all duration-300 border transition-colors"
      :class="buttonClass"
    >
      Connexion
    </button>
    
    <!-- Icône avec dropdown si connecté et chargement terminé -->
    <button
      v-else
      @click="toggleDropdown"
      class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
      title="Mon compte"
      aria-label="Mon compte"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      ref="dropdownButton"
    >
      <span class="text-2xl">👤</span>
    </button>
    
    <!-- Dropdown menu via teleport pour éviter les conflits de z-index -->
    <teleport to="body">
      <div
        v-if="isOpen && isConnected"
        class="fixed w-52 md:w-56 bg-gray-900 border border-white/20 rounded-lg shadow-xl py-1 z-[9999]"
        :style="dropdownStyle"
        role="menu"
      >
        <button 
          @click="openAccountMenu"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">👤</span>
          <span class="truncate">Mon compte</span>
        </button>
        <button 
          @click="openNotifications"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">🔔</span>
          <span class="truncate">Notifications</span>
        </button>
        <button 
          @click="openPlayers"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">👥</span>
          <span class="truncate">Mes joueurs</span>
        </button>
        <button 
          @click="openHelp"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">❓</span>
          <span class="truncate">Aide</span>
        </button>
        <div class="border-t border-white/10 my-1"></div>
        <button 
          @click="logout"
          class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">🚪</span>
          <span class="truncate">Se déconnecter</span>
        </button>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { auth } from '../services/firebase.js'

const props = defineProps({
  isConnected: { type: Boolean, default: false },
  buttonClass: { type: String, default: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' }
})

const emit = defineEmits(['open-account-menu', 'open-help', 'open-notifications', 'open-players', 'logout', 'open-login'])

const isOpen = ref(false)
const isLoading = ref(true)
const dropdownButton = ref(null)
const dropdownStyle = ref({})

// Réinitialiser isLoading immédiatement quand isConnected change
watch(() => props.isConnected, (newValue) => {
  // Si l'état de connexion change, on peut afficher le contenu immédiatement
  isLoading.value = false
}, { immediate: true })

// Pas de délai artificiel - afficher immédiatement
onMounted(() => {
  isLoading.value = false
})

function openLogin() {
  emit('open-login')
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => updateDropdownPosition())
  }
}

function updateDropdownPosition() {
  if (dropdownButton.value) {
    const rect = dropdownButton.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`
    }
  }
}

function openAccountMenu() {
  isOpen.value = false
  emit('open-account-menu')
}

function openHelp() {
  isOpen.value = false
  emit('open-help')
}

function openNotifications() {
  isOpen.value = false
  emit('open-notifications')
}

function openPlayers() {
  isOpen.value = false
  emit('open-players')
}

async function logout() {
  isOpen.value = false
  try {
    await auth.signOut()
    emit('logout')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

// Fermer le dropdown si on clique ailleurs
function closeDropdown() {
  isOpen.value = false
}

// Écouter les clics à l'extérieur pour fermer le dropdown
onMounted(() => {
  document.addEventListener('click', closeDropdown)
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('scroll', updateDropdownPosition, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition)
})
</script>
