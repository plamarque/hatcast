<template>
  <div class="season-header sticky top-0 z-[40] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900/95 backdrop-blur-sm border-b border-white/10" 
       style="padding-top: calc(env(safe-area-inset-top) + 1rem); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);">
    <!-- Conteneur principal avec alignement horizontal -->
    <div class="flex items-center justify-between py-3 md:py-6 px-4 md:px-6">
      
      <!-- Section gauche : bouton retour + logo -->
      <div class="flex items-center gap-3">
        <!-- Bouton retour à la vue complète (visible en mode composition) -->
        <button 
          v-if="isCompositionView"
          @click="returnToFullView"
          class="text-white hover:text-cyan-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10 flex-shrink-0"
          title="Retour à la vue complète"
        >
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
        </button>
        
        <!-- Flèche de retour (visible en mode normal) -->
        <button 
          v-else
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
          <!-- Bouton Administration de la saison -->
          <button
            v-if="isConnected && canManageRoles"
            @click="openAdministration"
            class="text-white hover:text-orange-300 transition-colors duration-200 p-2 rounded-full hover:bg-orange-500/10"
            :title="isSuperAdmin ? 'Administration de la saison (Super Admin)' : 'Administration de la saison'"
            :aria-label="isSuperAdmin ? 'Administration de la saison (Super Admin)' : 'Administration de la saison'"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
            </svg>
          </button>
          
          <!-- Indicateur de chargement des permissions (debug) -->
          <div
            v-if="isConnected && isCheckingRoles"
            class="text-orange-400 p-2"
            title="Vérification des permissions d'administration..."
          >
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
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
        <div class="md:hidden flex items-center gap-1">
          <!-- Bouton Administration de la saison (mobile) -->
          <button
            v-if="isConnected && canManageRoles"
            @click="openAdministration"
            class="text-white hover:text-orange-300 transition-colors duration-200 p-2 rounded-full hover:bg-orange-500/10"
            :title="isSuperAdmin ? 'Administration de la saison (Super Admin)' : 'Administration de la saison'"
            :aria-label="isSuperAdmin ? 'Administration de la saison (Super Admin)' : 'Administration de la saison'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
            </svg>
          </button>
          
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
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getFirebaseAuth } from '../services/firebase.js'
import AccountDropdown from './AccountDropdown.vue'
import permissionService from '../services/permissionService.js'
import configService from '../services/configService.js'
import logger from '../services/logger.js'

const props = defineProps({
  seasonName: { type: String, default: '' },
  isScrolled: { type: Boolean, default: false },
  seasonSlug: { type: String, default: '' },
  isConnected: { type: Boolean, default: false },
  showViewToggle: { type: Boolean, default: false },
  currentViewMode: { type: String, default: 'grid' },
  isAdminMode: { type: Boolean, default: false },
  seasonMeta: { type: Object, default: () => ({}) },
  isCompositionView: { type: Boolean, default: false }
})

const emit = defineEmits(['go-back', 'open-account-menu', 'open-help', 'open-preferences', 'open-players', 'logout', 'open-login', 'open-account', 'open-account-creation', 'open-development', 'open-administration', 'toggle-view-mode', 'return-to-full-view'])

// État de connexion reçu depuis le composant parent (GridBoard)
// Plus besoin de logique locale d'authentification

// Variables pour la gestion des rôles
const isSuperAdmin = ref(false)
const canManageRoles = ref(false)
const isCheckingRoles = ref(false)

// Détecter l'environnement de développement
const isDevelopment = computed(() => {
  return configService.getEnvironment() === 'development'
})

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

// Fonction de vérification Super Admin
async function checkSuperAdminStatus() {
  console.log('🔍 SeasonHeader: Début de checkSuperAdminStatus');
  console.log('🔍 SeasonHeader: Props reçues:', {
    isConnected: props.isConnected,
    seasonSlug: props.seasonSlug,
    seasonName: props.seasonName
  });
  isCheckingRoles.value = true;
  
  try {
    // S'assurer que permissionService est initialisé
    if (!permissionService.isInitialized) {
      console.log('🔍 SeasonHeader: Initialisation de permissionService');
      await permissionService.initialize();
    }
    
    console.log('🔍 SeasonHeader: Appel à permissionService.isSuperAdmin()');
    // Utiliser la fonction centralisée d'authState
    const superAdminStatus = await permissionService.isSuperAdmin();
    console.log('🔍 SeasonHeader: Résultat isSuperAdmin:', superAdminStatus);
    isSuperAdmin.value = superAdminStatus;
    
    // Vérifier si peut gérer les rôles (Super Admin ou Admin de saison)
    if (superAdminStatus) {
      // Super Admin a toujours accès à l'administration de toutes les saisons
      canManageRoles.value = true;
      console.log('🔍 SeasonHeader: Super Admin détecté, canManageRoles = true');
      logger.info('🔐 Raccourci Super Admin: accès administration accordé');
      return;
    }
    
    console.log('🔍 SeasonHeader: Pas Super Admin, vérification Season Admin pour:', props.seasonSlug);
    // Sinon, vérifier si Admin de saison pour cette saison spécifique
    if (props.seasonSlug) {
      const isSeasonAdmin = await permissionService.isSeasonAdmin(props.seasonSlug);
      console.log('🔍 SeasonHeader: Résultat isSeasonAdmin:', isSeasonAdmin);
      canManageRoles.value = isSeasonAdmin;
    } else {
      console.log('🔍 SeasonHeader: Pas de seasonSlug, canManageRoles = false');
      canManageRoles.value = false;
    }
    
    logger.info('🔐 Statut des rôles vérifié dans SeasonHeader:', {
      isSuperAdmin: isSuperAdmin.value,
      canManageRoles: canManageRoles.value,
      seasonSlug: props.seasonSlug
    });
  } catch (error) {
    logger.warn('⚠️ Erreur lors de la vérification des rôles dans SeasonHeader:', error);
    isSuperAdmin.value = false;
    canManageRoles.value = false;
  } finally {
    isCheckingRoles.value = false;
  }
}

// Surveiller les changements d'état de connexion pour vérifier les rôles
watch(() => props.isConnected, (newValue) => {
  console.log('🔍 SeasonHeader: watch isConnected changé:', newValue);
  if (newValue) {
    console.log('🔍 SeasonHeader: Utilisateur connecté, appel de checkSuperAdminStatus');
    checkSuperAdminStatus();
  } else {
    // Utilisateur déconnecté, réinitialiser
    console.log('🔍 SeasonHeader: Utilisateur déconnecté, réinitialisation');
    isSuperAdmin.value = false;
    canManageRoles.value = false;
  }
}, { immediate: true })

// Surveiller les changements de saison pour re-vérifier les rôles
watch(() => props.seasonSlug, () => {
  if (props.isConnected) {
    checkSuperAdminStatus();
  }
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

function returnToFullView() {
  emit('return-to-full-view')
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
