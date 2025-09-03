<template>
  <!-- Modales d'authentification -->
  <AccountLoginModal 
    v-if="showAccountLogin" 
    :show="showAccountLogin"
    @close="closeAccountLogin"
    @success="$emit('post-login-navigation')"
    @open-account-creation="openAccountCreation"
  />
  
  <AccountCreationModal 
    v-if="showAccountCreation" 
    :show="showAccountCreation"
    @close="closeAccountCreation"
    @account-created="$emit('account-created')"
  />

  <!-- Menu du compte -->
  <AccountMenu 
    v-if="showAccountMenu" 
    :show="showAccountMenu"
    @close="closeAccountMenu"
    @open-help="$emit('open-help')"
    @open-notifications="openNotifications"
    @open-players="openPlayers"
    @logout="$emit('logout')"
  />

  <!-- Modales de notifications et joueurs -->
  <NotificationsModal 
    v-if="showNotifications" 
    :show="showNotifications"
    @close="closeNotifications"
  />
  
  <PlayersModal 
    v-if="showPlayers" 
    :show="showPlayers"
    @close="closePlayers"
  />

  <!-- Modal de développement -->
  <DevelopmentModal 
    v-if="showDevelopmentModal"
    :show="showDevelopmentModal"
    @close="closeDevelopmentModal"
  />
</template>

<script setup>
import AccountLoginModal from './AccountLoginModal.vue'
import AccountCreationModal from './AccountCreationModal.vue'
import AccountMenu from './AccountMenu.vue'
import NotificationsModal from './NotificationsModal.vue'
import PlayersModal from './PlayersModal.vue'
import DevelopmentModal from './DevelopmentModal.vue'

// Props pour contrôler l'affichage des modales
const props = defineProps({
  showAccountLogin: { type: Boolean, default: false },
  showAccountCreation: { type: Boolean, default: false },
  showAccountMenu: { type: Boolean, default: false },
  showNotifications: { type: Boolean, default: false },
  showPlayers: { type: Boolean, default: false },
  showDevelopmentModal: { type: Boolean, default: false }
})

// Événements émis vers le composant parent
const emit = defineEmits([
  'post-login-navigation',
  'account-created', 
  'open-help',
  'logout',
  'close-account-login',
  'close-account-creation',
  'close-account-menu',
  'close-notifications',
  'close-players',
  'close-development-modal'
])

// Fonctions pour ouvrir les modales
function openAccountLogin() {
  emit('update:showAccountLogin', true)
}

function openAccountCreation() {
  emit('update:showAccountCreation', true)
}

function openAccountMenu() {
  emit('update:showAccountMenu', true)
}

function openNotifications() {
  emit('update:showNotifications', true)
}

function openPlayers() {
  emit('update:showPlayers', true)
}

function openDevelopment() {
  emit('update:showDevelopmentModal', true)
}

// Fonctions pour fermer les modales
function closeAccountLogin() {
  emit('close-account-login')
}

function closeAccountCreation() {
  emit('close-account-creation')
}

function closeAccountMenu() {
  emit('close-account-menu')
}

function closeNotifications() {
  emit('close-notifications')
}

function closePlayers() {
  emit('close-players')
}

function closeDevelopmentModal() {
  emit('close-development-modal')
}

// Exposer les fonctions pour que le composant parent puisse les utiliser
defineExpose({
  openAccountLogin,
  openAccountCreation,
  openAccountMenu,
  openNotifications,
  openPlayers,
  openDevelopment
})
</script>
