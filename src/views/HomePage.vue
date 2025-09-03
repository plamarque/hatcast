<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header partagé -->
    <AppHeader 
      :is-scrolled="isScrolled"
      :is-connected="isConnected"
      @open-account-menu="openAccountMenu"
      @open-help="scrollToHelp"
      @open-notifications="openNotifications"
      @open-players="openPlayers"
      @logout="handleLogout"
      @open-login="openAccountLogin"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
    />

    <!-- Section Hero -->
    <section class="hero-section relative overflow-hidden pt-24">
      <!-- Contenu du Hero à 2 colonnes -->
      <div class="hero-content py-16 md:py-24 px-4 relative z-10">
        <div class="container mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <!-- Colonne gauche : Contenu principal -->
            <div class="text-center order-2 lg:order-1">
              <div class="hero-content-wrapper">
                
                <!-- Illustration avec mockup de l'app (masquée sur mobile) -->
                <div class="hero-illustration relative hidden lg:block">
                  <!-- Mockup principal avec screenshot de la grille -->
                  <div class="relative mx-auto lg:mx-0 w-full max-w-lg">
                    <!-- Fond du mockup avec effet de profondeur -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl border border-white/10 relative overflow-hidden">
                      <!-- Halo lumineux en arrière-plan -->
                      <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
                      <!-- Contenu du mockup -->
                      <div class="relative z-10">
                        <!-- Barre de titre du mockup -->
                        <div class="flex items-center gap-3 mb-4">
                          <div class="flex gap-2">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div class="text-gray-400 text-sm">HatCast - Grille des disponibilités</div>
                        </div>
                      </div>
                      
                      <!-- Screenshot simulé de la grille -->
                      <div class="bg-gray-700 rounded-2xl p-4 min-h-[300px]">
                        <!-- En-tête avec événements -->
                        <div class="grid grid-cols-4 gap-2 mb-4">
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">15 Jan</div>
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">22 Jan</div>
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">29 Jan</div>
                          <div class="text-center text-xs text-gray-300 bg-gray-600 rounded p-2">5 Fév</div>
                        </div>
                        
                        <!-- Lignes des joueurs -->
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <div class="w-16 text-xs text-gray-300">Marie</div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-red-500/20 border border-red-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-gray-500/20 border border-gray-500/30 rounded"></div>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="w-16 text-xs text-gray-300">Pierre</div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-red-500/20 border border-red-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="w-16 text-xs text-gray-300">Sophie</div>
                            <div class="grid grid-cols-4 gap-2 flex-1">
                              <div class="h-6 bg-red-500/20 border border-red-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                              <div class="h-6 bg-green-500/20 border border-green-500/30 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    
                  <!-- Éléments flottants décoratifs -->
                  <div class="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl shadow-xl transform rotate-12 z-30"></div>
                  <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl shadow-xl transform -rotate-12 z-30 flex items-center justify-center">
                    <img src="/logos/hatcast-mask.png" alt="Masque HatCast" class="w-10 h-10 object-contain transform rotate-12" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Colonne droite : Contenu et CTA -->
            <div class="text-center lg:text-left order-1 lg:order-2">
              <!-- Titre principal -->
              <div class="hero-title mb-8">
                <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                  Faites vos équipes d'impro…<br>en un clin d'œil
                </h1>
              </div>
              
              <!-- Sous-titre -->
              <div class="hero-subtitle mb-10">
                <p class="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Plus de casse-tête pour savoir qui joue quand. Chacun indique ses dispos, 
                  <strong class="text-white">HatCast compose l'équipe pour vous</strong>, équitablement et sans tension.
                </p>
              </div>
              
              <!-- Call-to-action principal -->
              <div class="hero-cta mb-10">
                <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <router-link 
                    to="/seasons"
                    class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 text-lg md:text-xl"
                  >
                    🚀 Démarrez
                  </router-link>
                  
                  <!-- CTA secondaire discret -->
                  <button
                    @click="scrollToHelp"
                    class="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-medium py-3 px-6 rounded-lg hover:bg-cyan-500/10 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400/50"
                  >
                    <span>ℹ️</span>
                    En savoir plus
                  </button>
                </div>
              </div>
              
              <!-- Indication cliquable vers les saisons -->
              <div class="hero-hint text-center">
                <router-link
                  to="/seasons"
                  class="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-all duration-300 text-sm cursor-pointer group"
                >
                  <span class="group-hover:animate-bounce">🎪</span>
                  <span>Voir toutes les saisons en cours</span>
                  <span class="group-hover:animate-bounce">→</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Effets visuels du hero -->
      <div class="hero-background absolute inset-0 z-0">
        <!-- Cercles décoratifs -->
        <div class="absolute top-20 left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>

    <!-- Section Aide -->
    <section id="help" class="help-section py-16 bg-gradient-to-br from-gray-900/50 to-gray-800/50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Comment ça marche ?
          </h2>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            HatCast simplifie la gestion de vos équipes d'improvisation en 3 étapes simples.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <!-- Étape 1 -->
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-white font-bold">
              1
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Créez votre saison</h3>
            <p class="text-gray-300">
              Définissez le nom, la description et un code PIN pour sécuriser les opérations sensibles.
            </p>
          </div>

          <!-- Étape 2 -->
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-white font-bold">
              2
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Ajoutez vos événements</h3>
            <p class="text-gray-300">
              Planifiez vos spectacles avec dates, horaires et nombre de joueurs requis.
            </p>
          </div>

          <!-- Étape 3 -->
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-white font-bold">
              3
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Gérez les disponibilités</h3>
            <p class="text-gray-300">
              Chaque joueur indique ses dispos, HatCast compose automatiquement les équipes.
            </p>
          </div>
        </div>
      </div>
    </section>

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
      @open-help="scrollToHelp"
      @logout="handleLogout"
      @close-account-login="showAccountLogin = false"
      @close-account-creation="showAccountCreation = false"
      @close-account-menu="showAccountMenu = false"
      @close-notifications="showNotifications = false"
      @close-players="showPlayers = false"
      @close-development-modal="showDevelopmentModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLastVisitedSeason } from '../services/seasonPreferences.js'
import { currentUser, isConnected } from '../services/authState.js'
import AppHeader from '../components/AppHeader.vue'
import ModalManager from '../components/ModalManager.vue'
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

// Vérifier automatiquement s'il y a une saison mémorisée pour redirection
onMounted(async () => {
  try {
    // Vérifier d'abord le localStorage directement (plus rapide et fonctionne sans connexion)
    try {
      const lastSeason = localStorage.getItem('lastVisitedSeason')
      if (lastSeason) {
        logger.info('Saison mémorisée trouvée dans localStorage, redirection automatique vers', lastSeason)
        router.push(`/season/${lastSeason}`)
        return
      }
    } catch (error) {
      logger.warn('Erreur lors de la lecture localStorage', error)
    }
    
    // Si pas de saison dans localStorage et utilisateur connecté, essayer Firebase
    if (isConnected.value) {
      const lastSeason = await getLastVisitedSeason()
      if (lastSeason) {
        logger.info('Saison mémorisée trouvée dans Firebase, redirection automatique vers', lastSeason)
        router.push(`/season/${lastSeason}`)
        return
      }
    }
  } catch (error) {
    logger.warn('Erreur lors de la vérification de la saison mémorisée', error)
  }
})

// Fonctions de navigation
function scrollToHelp() {
  document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' })
}

// Fonctions pour les modales
function openAccountMenu() {
  showAccountMenu.value = true
}

function openAccountLogin() {
  logger.info('🔑 HomePage: openAccountLogin() appelé')
  showAccountLogin.value = true
}

function openAccountCreation() {
  logger.info('🔑 HomePage: openAccountCreation() appelé')
  showAccountCreation.value = true
}

function openNotifications() {
  showNotifications.value = true
}

function openPlayers() {
  showPlayers.value = true
}

function openDevelopment() {
  showDevelopmentModal.value = true
}

function handleLogout() {
  // Gérer la déconnexion
}

// Gérer la navigation post-connexion
async function handlePostLoginNavigation() {
  try {
    const lastSeason = await getLastVisitedSeason()
    if (lastSeason) {
      router.push(`/season/${lastSeason}`)
      return
    }
  } catch (error) {
    logger.warn('Impossible de récupérer la saison préférée', error)
  }
  
  // Rediriger vers la page des saisons si pas de saison mémorisée
  router.push('/seasons')
}

// Gestion du scroll
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50
  }
  
  window.addEventListener('scroll', handleScroll)
  
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>
