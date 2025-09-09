<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header partagé -->
    <AppHeader 
      :is-scrolled="isScrolled"
      :is-connected="isConnected"
      @open-account-menu="openAccountMenu"
      @open-help="() => {}"
      @open-notifications="openNotifications"
      @open-players="openPlayers"
      @logout="handleLogout"
      @open-login="openAccountLogin"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
    />

    <!-- Contenu principal -->
    <div class="pt-24 pb-8 px-4">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header de la page -->
        <div class="mb-8">
          <button 
            @click="goBack" 
            class="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">❓</div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-white">Aide</h1>
              <p class="text-purple-300">L'appli pour organiser vos événements d'improvisation de manière simple et apaisée</p>
                                <div class="mt-2">
                                          <span class="text-gray-400 text-sm">
                        Version <button @click="toggleChangelog" class="text-white font-mono hover:text-blue-300 underline cursor-pointer transition-colors">{{ appVersion }}</button>
                      <span v-if="buildInfo" class="text-gray-500">• {{ buildInfo }}</span>
                    </span>
                  </div>
            </div>
          </div>
        </div>

        <!-- Contenu de l'aide -->
        <div class="space-y-6">
          
          <!-- C'est quoi ? -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">C'est quoi ?</h2>
            <p class="text-gray-200">
              HatCast est une appli conçue pour faciliter <span class="text-white">la composition des joueurs d'impro</span> pour les spectacles.
              L'idée est née au sein de <span class="text-purple-300">La Malice</span> pour <span class="text-white">dépersonnaliser une tâche délicate</span> qui créait des tensions depuis des années.
            </p>
          </div>

          <!-- Comment ça marche -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">Comment ça marche</h2>
            <p class="text-gray-200">
              L'asso déclare ses dates et le nombre de personnes nécessaires. Les joueurs indiquent leurs disponibilités. L'appli propose des compositions.
            </p>
          </div>

          <!-- Composition auto ou manuelle -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">Composition auto ou manuelle</h2>
            <p class="text-gray-200">
              Le <span class="text-white">mode composition auto</span> s'appuie sur le hasard (pondéré) pour simplifier la vie. Vous pouvez aussi repasser en mode <span class="text-white">manuel</span> si besoin.
            </p>
          </div>

          <!-- Pensée mobile • Libre d'utilisation -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">Pensée mobile • Libre d'utilisation</h2>
            <p class="text-gray-200">
              L'appli est <span class="text-white">pensée pour le mobile</span> et peut être utilisée librement par La Malice ou <span class="text-white">toute autre troupe</span>.
            </p>
          </div>

          <!-- Comptes (facultatif) -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">Comptes (facultatif)</h2>
            <p class="text-gray-200">
              Les joueurs qui le souhaitent peuvent créer un compte via leur email pour <span class="text-white">recevoir des notifications</span>,
              <span class="text-white">protéger leurs saisies</span> et bénéficier d'un meilleur confort d'utilisation.
            </p>
          </div>

          <!-- Statut & licence -->

              <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
                <h2 class="text-xl font-semibold text-white">Statut & licence</h2>
                <p class="text-gray-200">
                  Application <span class="text-white">en cours de développement</span>, <span class="text-white">sans garanties</span> à ce stade. Licence libre <span class="text-white">MIT</span>.
                </p>
                <p class="text-gray-200">
                  Contact & retours : <a href="mailto:impropick@gmail.com" class="text-blue-300 underline hover:text-blue-200">impropick@gmail.com</a>
                </p>
              </div>

        </div>
      </div>
    </div>

    <!-- Gestionnaire de modales unifié -->
    <ModalManager
      ref="modalManager"
      :show-account-login="showAccountLogin"
      :show-account-creation="showAccountCreation"
      :show-account-menu="showAccountMenu"
      :show-notifications="showNotifications"
      :show-players="showPlayers"
      :show-development-modal="showDevelopmentModal"
      @post-login-navigation="handlePostLoginNavigation"
      @account-created="handlePostLoginNavigation"
      @open-help="() => {}"
      @logout="handleLogout"
      @close-account-login="showAccountLogin = false"
      @close-account-creation="showAccountCreation = false"
      @close-account-menu="showAccountMenu = false"
      @close-notifications="showNotifications = false"
      @close-players="showPlayers = false"
      @close-development-modal="showDevelopmentModal = false"
    />

    <!-- Modal des Nouveautés -->
    <ChangelogModal 
      :show="showChangelog" 
      @close="showChangelog = false" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, isConnected } from '../services/authState.js'
import AppHeader from '../components/AppHeader.vue'
import ModalManager from '../components/ModalManager.vue'
import ChangelogModal from '../components/ChangelogModal.vue'
import logger from '../services/logger.js'

const router = useRouter()

// Variables réactives
const isScrolled = ref(false)

// Variables pour les modales
const showAccountLogin = ref(false)
const showAccountCreation = ref(false)
const showAccountMenu = ref(false)
const showNotifications = ref(false)
const showPlayers = ref(false)
const showDevelopmentModal = ref(false)

// Référence au gestionnaire de modales
const modalManager = ref(null)

// Version de l'application
const appVersion = ref('1.0.0')
const buildInfo = ref('')

// Changelog state
const showChangelog = ref(false)

// Charger la version depuis le fichier version.txt
onMounted(async () => {
  try {
    const response = await fetch('/version.txt')
    if (response.ok) {
      const content = await response.text()
      const lines = content.split('\n')
      
      // Première ligne = version
      if (lines[0]) {
        appVersion.value = lines[0]
      }
      
      // Deuxième ligne = info de build (si disponible)
      if (lines[1] && lines[1].includes('Production build')) {
        buildInfo.value = 'Production'
      } else if (lines[1] && lines[1].includes('Development')) {
        buildInfo.value = 'Development'
      }
    }
  } catch (error) {
    // En cas d'erreur, garder la version par défaut
    console.debug('Could not load version from version.txt:', error)
  }
})

// Navigation
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// Toggle changelog
const toggleChangelog = () => {
  showChangelog.value = !showChangelog.value
}


// Gestion des modales (réutilisé depuis HomePage)
const openAccountMenu = () => {
  showAccountMenu.value = true
}

const openAccountLogin = () => {
  showAccountLogin.value = true
}

const openAccountCreation = () => {
  showAccountCreation.value = true
}

const openNotifications = () => {
  showNotifications.value = true
}

const openPlayers = () => {
  showPlayers.value = true
}

const openDevelopment = () => {
  showDevelopmentModal.value = true
}

const handleLogout = () => {
  // Logique de déconnexion
  logger.info('User logged out from help page')
}

const handlePostLoginNavigation = () => {
  // Navigation après connexion
  showAccountLogin.value = false
  showAccountCreation.value = false
}
</script>
