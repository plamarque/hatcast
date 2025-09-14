<template>
  <div class="relative" @click.stop>
    <!-- État de chargement -->
    <div v-if="isLoading" class="w-10 h-10 bg-gray-600 animate-pulse rounded-full"></div>
    
    <!-- Bouton Connexion si non connecté et chargement terminé -->
    <button
      v-else-if="!isConnected"
      data-testid="login-btn"
      @click="openLogin"
      class="px-2.5 py-1 md:px-4 md:py-2 text-xs md:text-base rounded-lg transition-all duration-300 border transition-colors"
      :class="buttonClass"
    >
      <!-- Mobile: icône suggestive pour gagner de l'espace -->
      <span class="md:hidden text-lg" title="Se connecter">🔑</span>
      <!-- Desktop: texte complet -->
      <span class="hidden md:inline">Connexion</span>
    </button>
    
    <!-- Icône avec dropdown si connecté et chargement terminé -->
    <button
      v-else
      data-testid="user-menu"
      @click="toggleDropdown"
      class="text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
      title="Mon compte"
      aria-label="Mon compte"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      ref="dropdownButton"
    >
      <UserAvatar size="md" />
    </button>
    
    <!-- Dropdown menu via teleport pour éviter les conflits de z-index -->
    <teleport to="body">
      <div
        v-if="isOpen && isConnected"
        class="fixed w-auto min-w-[180px] max-w-[200px] md:min-w-[200px] md:max-w-[240px] bg-gray-900 border border-white/20 rounded-lg shadow-xl py-1 z-[1250]"
        :style="dropdownStyle"
        role="menu"
      >
        <button 
          @click="openAccountMenu"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <div class="flex-shrink-0">
            <UserAvatar size="sm" />
          </div>
          <span class="truncate">Mon compte</span>
        </button>
        <button 
          @click="openPreferences"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">⚙️</span>
          <span class="truncate">Préférences</span>
        </button>
        <button 
          @click="openHelp"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">❓</span>
          <span class="truncate">Aide</span>
        </button>
        <button 
          @click="installApp"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">📱</span>
          <span class="truncate">Installer l'app</span>
        </button>
        
        <!-- Item Administration (Admin de saison ou Super Admin) -->
        <button 
          v-if="canManageRoles"
          @click="openAdministration"
          class="w-full text-left px-4 py-2 text-sm text-orange-300 hover:bg-orange-500/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">🛡️</span>
          <span class="truncate">Administration</span>
        </button>
        
        
        <!-- Item Développement (Super Admin ou développement local) -->
        <button 
          v-if="isSuperAdmin || isDevelopment"
          @click="openDevelopment"
          class="w-full text-left px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/10 flex items-center gap-2 md:gap-3 transition-colors duration-150" 
          role="menuitem"
        >
          <span class="text-base md:text-lg flex-shrink-0">🛠️</span>
          <span class="truncate">Développement</span>
        </button>
        
        <div class="border-t border-white/10 my-1"></div>
        <button 
          data-testid="logout-btn"
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
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { getFirebaseAuth } from '../services/firebase.js'
import AuditClient from '../services/auditClient.js'
import roleService from '../services/roleService.js'
import configService from '../services/configService.js'
import logger from '../services/logger.js'
import UserAvatar from './UserAvatar.vue'

const props = defineProps({
  isConnected: { type: Boolean, default: false },
  buttonClass: { type: String, default: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' }
})

// Debug log for props
watch(() => props.isConnected, (connected) => {
  logger.info('🔗 AccountDropdown: isConnected changed', { 
    connected,
    timestamp: new Date().toISOString()
  })
}, { immediate: true })

const emit = defineEmits(['open-account-menu', 'open-help', 'open-preferences', 'logout', 'open-login', 'open-account-creation', 'open-development', 'open-administration'])

const isOpen = ref(false)
const isLoading = ref(true)
const dropdownButton = ref(null)
const dropdownStyle = ref({})
const isSuperAdmin = ref(false)
const canManageRoles = ref(false)

// Détecter l'environnement de développement
const isDevelopment = computed(() => {
  return configService.getEnvironment() === 'development'
})

// Réinitialiser isLoading immédiatement quand isConnected change
watch(() => props.isConnected, (newValue) => {
  // Si l'état de connexion change, on peut afficher le contenu immédiatement
  isLoading.value = false
  // Vérifier le statut Super Admin si connecté
  if (newValue) {
    checkSuperAdminStatus()
  } else {
    // Utilisateur déconnecté, réinitialiser
    isSuperAdmin.value = false
    canManageRoles.value = false
  }
}, { immediate: true })

// Pas de délai artificiel - afficher immédiatement
onMounted(() => {
  isLoading.value = false
})

// Fonction de vérification Super Admin
async function checkSuperAdminStatus() {
  // En développement local, utiliser uniquement le fallback par email
  const currentUserEmail = getFirebaseAuth()?.currentUser?.email;
  if (currentUserEmail === 'patrice.lamarque@gmail.com') {
    logger.info('🔐 Mode développement: Super Admin détecté par email');
    isSuperAdmin.value = true;
    canManageRoles.value = true;
    return;
  }
  
  // Fallback temporaire pour impropick@gmail.com (Admin de saison)
  if (currentUserEmail === 'impropick@gmail.com') {
    logger.info('🔐 Mode développement: Admin de saison détecté par email');
    isSuperAdmin.value = false;
    canManageRoles.value = true;
    return;
  }
  
  // Pour les autres utilisateurs, essayer le service normal
  try {
    const superAdminStatus = await roleService.isSuperAdmin();
    isSuperAdmin.value = superAdminStatus;
    canManageRoles.value = superAdminStatus;
  } catch (error) {
    logger.warn('⚠️ Erreur lors de la vérification Super Admin:', error.message);
    isSuperAdmin.value = false;
    canManageRoles.value = false;
  }
}

function openLogin() {
  try {
    logger.info('🔑 AccountDropdown: openLogin() appelé')
    emit('open-login')
    logger.info('🔑 AccountDropdown: événement open-login émis')
  } catch (error) {
    logger.error('Erreur lors de l\'émission de open-login:', error)
    throw error // Re-lancer l'erreur pour Vue.js
  }
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

function openPreferences() {
  isOpen.value = false
  emit('open-preferences')
}

function openDevelopment() {
  isOpen.value = false
  emit('open-development')
}

function openAdministration() {
  logger.info('🛡️ openAdministration() appelée dans AccountDropdown');
  logger.info('🛡️ canManageRoles:', canManageRoles.value);
  logger.info('🛡️ isSuperAdmin:', isSuperAdmin.value);
  isOpen.value = false
  emit('open-administration')
}

function installApp() {
  isOpen.value = false
  logger.info('📱 Déclenchement manuel de l\'installation PWA depuis le menu utilisateur')
  
  // Déclencher l'événement global pour afficher la barre d'installation
  const installEvent = new CustomEvent('show-pwa-install-banner', {
    detail: { 
      source: 'user-menu',
      timestamp: Date.now()
    }
  })
  window.dispatchEvent(installEvent)
}

async function logout() {
  isOpen.value = false
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      logger.error('Firebase Auth non disponible pour la déconnexion')
      return
    }
    
    const userEmail = auth.currentUser?.email
    
    await auth.signOut()
    
    // Logger l'audit de déconnexion
    try {
      await AuditClient.logLogout(userEmail)
    } catch (auditError) {
      logger.warn('Erreur audit logout:', auditError)
    }
    
    // EFFACER TOUTES LES SESSIONS LOCALES à la déconnexion
    try {
      const { default: pinSessionManager } = await import('../services/pinSession.js')
      const { default: playerPasswordSessionManager } = await import('../services/playerPasswordSession.js')
      
      pinSessionManager.clearSession()
      playerPasswordSessionManager.clearAllSessions()
      logger.info('Sessions locales effacées à la déconnexion')
    } catch (sessionError) {
      logger.warn('Erreur lors de l\'effacement des sessions:', sessionError)
    }
    
    emit('logout')
  } catch (error) {
    logger.error('Erreur lors de la déconnexion:', error)
    
    // Logger l'erreur d'audit
    try {
      await AuditClient.logError(error, { context: 'logout_attempt' })
    } catch (auditError) {
      logger.warn('Erreur audit error:', auditError)
    }
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
