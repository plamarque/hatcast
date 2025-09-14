<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header partagé -->
    <AppHeader 
      :is-scrolled="isScrolled"
      :is-connected="isConnected"
      :show-back-button="true"
      @open-administration="openAdministration"
      @open-account-menu="openAccountMenu"
      @open-help="openHelp"
      @open-notifications="openNotifications"
      @open-players="openPlayers"
      @logout="handleLogout"
      @open-login="openAccountLogin"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
    />

    <!-- Contenu principal -->
    <main class="relative z-10">
      <div class="container mx-auto px-4 py-4">
        <!-- Titre de la page -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-white mb-4">Saisons</h2>
          <p class="text-xl text-gray-300">Rejoins une saison existante ou crée la tienne</p>
          
          <!-- Bouton Nouvelle saison (gère la connexion automatiquement) -->
          <div class="mt-6">
            <button
              @click="handleNewSeasonClick"
              class="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl text-base hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
            >
              <span>➕</span>
              Nouvelle saison
            </button>
          </div>
        </div>

        <!-- Section des saisons -->
        <div class="pb-16" :aria-busy="loading">
          <!-- Grille des saisons (chargement) -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center place-content-center animate-pulse">
            <div v-for="n in 8" :key="'skeleton-'+n" class="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
              <div class="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6"></div>
              <div class="h-6 bg-white/10 rounded mb-4 w-2/3 mx-auto"></div>
              <div class="h-px bg-white/10 mb-4"></div>
              <div class="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
            </div>
          </div>

          <!-- Grille des saisons (données) -->
          <div v-else-if="seasons.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto justify-items-center place-content-center">
            <SeasonCard
              v-for="(season, index) in sortedSeasons"
              :key="season.id"
              :season="season"
              :show-availabilities="false"
              :show-id="false"
              :show-menu="true"
              :clickable="true"
              @click="goToSeason(season.slug)"
              @menu-toggle="(isOpen) => toggleMenu(index, isOpen)"
            >
              <template #menu-items>
                <button @click="exportSeasonAvailabilityCsv(season); closeMenu()" class="w-full text-left px-4 py-2 text-sm text-emerald-300 hover:bg-white/10 flex items-center gap-2" role="menuitem">
                  <span>📊</span>
                  Exporter CSV
                </button>
                <div class="border-t border-white/10 my-1"></div>
                <button @click="moveSeasonUp(index)" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2" role="menuitem">
                  <span>⬆️</span>
                  Avancer
                </button>
                <button @click="moveSeasonDown(index)" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2" role="menuitem">
                  <span>⬇️</span>
                  Reculer
                </button>
                <div class="border-t border-white/10 my-1"></div>
                <button @click="openEditModal(season)" class="w-full text-left px-4 py-2 text-sm text-blue-300 hover:bg-white/10 flex items-center gap-2" role="menuitem">
                  <span>✏️</span>
                  Modifier
                </button>
                <div class="border-t border-white/10 my-1"></div>
                <button @click="confirmDeleteSeason(season)" class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2" role="menuitem">
                  <span>🗑️</span>
                  Supprimer
                </button>
              </template>
            </SeasonCard>
          </div>

          <!-- Message si aucune saison -->
          <div v-if="!loading && seasons.length === 0" class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span class="text-4xl">🎪</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Aucune saison créée</h3>
            <p class="text-gray-300 mb-8">Commencez par créer votre première saison d'événements !</p>
            
            <!-- Bouton Nouvelle saison -->
            <button
              @click="handleNewSeasonClick"
              class="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
            >
              <span>➕</span>
              Nouvelle saison
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de création de saison -->
    <CreateSeasonModal 
      :show="showCreateSeasonModal"
      @close="showCreateSeasonModal = false"
      @season-created="handleSeasonCreated"
    />

    <!-- Modal de confirmation de suppression -->
    <SeasonDeleteConfirmationModal
      :show="showDeleteModal"
      :season="seasonToDelete"
      @confirm="deleteSeasonConfirmed"
      @cancel="cancelDelete"
    />

    <!-- Modal de modification de saison -->
    <SeasonEditModal
      :show="showEditModal"
      :season="seasonToEdit"
      :is-connected="isConnected"
      @save="handleSeasonEditSave"
      @cancel="cancelEdit"
    />

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
      @account-created="handleAccountCreated"
      @open-help="openHelp"
      @logout="handleLogout"
      @close-account-login="showAccountLogin = false"
      @close-account-creation="showAccountCreation = false"
      @close-account-menu="showAccountMenu = false"
      @close-notifications="showNotifications = false"
      @close-players="showPlayers = false"
      @close-development-modal="showDevelopmentModal = false"
    />

    <!-- Footer principal -->
    <AppFooter @open-help="openHelp" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSeasons, setSeasonSortOrder, updateSeason, deleteSeason, exportSeasonAvailabilitiesCsv, deleteSeasonDirect } from '../services/seasons.js'
import { loadEvents, loadPlayers, loadAvailability, loadCasts } from '../services/storage.js'
import { currentUser, isConnected } from '../services/authState.js'
import { clearLastSeasonPreference } from '../services/seasonPreferences.js'
import { uploadImage, deleteImage, isFirebaseStorageUrl } from '../services/imageUpload.js'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import CreateSeasonModal from '../components/CreateSeasonModal.vue'
import ModalManager from '../components/ModalManager.vue'
import SeasonCard from '../components/SeasonCard.vue'
import SeasonDeleteConfirmationModal from '../components/SeasonDeleteConfirmationModal.vue'
import SeasonEditModal from '../components/SeasonEditModal.vue'

import logger from '../services/logger.js'

const router = useRouter()
const seasons = ref([])
const showCreateSeasonModal = ref(false)
const loading = ref(true)
const isScrolled = ref(false)

// Variables pour le menu des saisons
const openMenuIndex = ref(null)
const seasonToDelete = ref(null)
const seasonToEdit = ref(null)
const editSeasonName = ref('')
const editSeasonDescription = ref('')
const editSeasonLogo = ref(null)
const editSeasonLogoPreview = ref('')
const isLogoUploading = ref(false)
const isLogoDeleting = ref(false)
const logoFileInput = ref(null)
const showDeleteModal = ref(false)
const showEditModal = ref(false)

// Variables pour les modales
const showAccountLogin = ref(false)
const showAccountCreation = ref(false)
const showAccountMenu = ref(false)
const showNotifications = ref(false)
const showPlayers = ref(false)
const showDevelopmentModal = ref(false)

// Référence au gestionnaire de modales
const modalManager = ref(null)

// Flag pour mémoriser l'intention de créer une saison
const wantsToCreateSeason = ref(false)



// État de connexion (importé depuis authState)

// Computed properties
const sortedSeasons = computed(() => {
  return [...seasons.value].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})

// Style du bouton
const buttonClass = computed(() => {
  return 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
})

// Fonctions pour les modales
function openAccountMenu() {
  showAccountMenu.value = true
}

function openHelp() {
  // Gérer l'ouverture de l'aide
}

function openNotifications() {
  showNotifications.value = true
}

function openPlayers() {
  showPlayers.value = true
}

function openDevelopment() {
  logger.info('🚀 SeasonsPage: openDevelopment() appelé')
  logger.debug('showDevelopmentModal avant =', showDevelopmentModal.value)
  showDevelopmentModal.value = true
  logger.debug('showDevelopmentModal après =', showDevelopmentModal.value)
}

function openAdministration() {
  // Depuis la page des saisons, rediriger vers l'administration de la première saison disponible
  if (sortedSeasons.value && sortedSeasons.value.length > 0) {
    const firstSeason = sortedSeasons.value[0]
    router.push(`/season/${firstSeason.slug}/admin`)
  }
}

function handleLogout() {
  // Gérer la déconnexion
}

function openAccountLogin() {
  logger.info('🔑 SeasonsPage: openAccountLogin() appelé')
  logger.debug('showAccountLogin avant =', showAccountLogin.value)
  showAccountLogin.value = true
  logger.debug('showAccountLogin après =', showAccountLogin.value)
  logger.debug('showAccountLogin type =', typeof showAccountLogin.value)
  logger.debug('showAccountLogin ref =', showAccountLogin)
  
  // Debug du composant modal
  logger.debug('Composant AccountLoginModal importé =', !!AccountLoginModal)
  logger.debug('Template modal présent =', !!document.querySelector('[data-testid="email-input"]'))
}

function openAccountCreation() {
  logger.info('🔑 SeasonsPage: openAccountCreation() appelé')
  logger.debug('showAccountCreation avant =', showAccountCreation.value)
  showAccountCreation.value = true
  logger.debug('showAccountCreation après =', showAccountCreation.value)
  logger.debug('showAccountCreation type =', typeof showAccountCreation.value)
  logger.debug('showAccountCreation ref =', showAccountCreation)
  
  // Debug du composant modal
  logger.debug('Composant AccountCreationModal importé =', !!AccountCreationModal)
  logger.debug('Template modal présent =', !!document.querySelector('[data-testid="create-account-modal"]'))
}



// Gérer la création de compte réussie
async function handleAccountCreated() {
  // Fermer la modal de création de compte
  showAccountCreation.value = false
  
  // Vérifier si l'utilisateur voulait créer une saison
  if (wantsToCreateSeason.value) {
    logger.info('Nouveau compte créé voulait créer une saison, ouverture de la modale')
    showCreateSeasonModal.value = true
    wantsToCreateSeason.value = false // Reset le flag
  } else if (seasons.length === 0) {
    // Si l'utilisateur vient de créer un compte et qu'il n'y a pas de saisons,
    // lui proposer d'en créer une
    logger.info('Nouveau compte créé sans saisons, ouverture de la modale de création')
    showCreateSeasonModal.value = true
  }
}

// Gérer le clic sur le bouton "Nouvelle saison"
function handleNewSeasonClick() {
  if (isConnected.value) {
    // Si connecté, ouvrir directement la modale de création
    showCreateSeasonModal.value = true
  } else {
    // Si non connecté, mémoriser l'intention et ouvrir la modale de connexion
    wantsToCreateSeason.value = true
    openAccountLogin()
  }
}

// Gérer la navigation post-connexion
async function handlePostLoginNavigation() {
  // Fermer la modal de connexion
  showAccountLogin.value = false
  
  // Vérifier si l'utilisateur voulait créer une saison
  if (wantsToCreateSeason.value) {
    logger.info('Utilisateur connecté voulait créer une saison, ouverture de la modale')
    showCreateSeasonModal.value = true
    wantsToCreateSeason.value = false // Reset le flag
  } else if (seasons.length === 0) {
    // Si l'utilisateur vient de se connecter et qu'il n'y a pas de saisons,
    // lui proposer d'en créer une
    logger.info('Utilisateur connecté sans saisons, ouverture de la modale de création')
    showCreateSeasonModal.value = true
  } else {
    // On est déjà sur /seasons, pas besoin de rediriger
    // Juste rafraîchir la page pour mettre à jour l'état de connexion
    logger.info('Connexion réussie sur /seasons, modal fermée')
  }
}

// Fonctions de gestion des saisons
function goToSeason(slug) {
  router.push(`/season/${slug}`)
}

function toggleMenu(index, isOpen = null) {
  if (isOpen !== null) {
    openMenuIndex.value = isOpen ? index : null
  } else {
    openMenuIndex.value = openMenuIndex.value === index ? null : index
  }
}

function closeMenu() {
  openMenuIndex.value = null
}



// Charger les saisons avec leurs données complètes
async function loadSeasons() {
  try {
    loading.value = true
    const seasonsData = await getSeasons()
    
    // Charger les événements et joueurs pour chaque saison
    const seasonsWithData = await Promise.all(
      seasonsData.map(async (season) => {
        try {
          const [events, players] = await Promise.all([
            loadEvents(season.id),
            loadPlayers(season.id)
          ])
          
          // Filtrer les événements actifs pour le comptage
          const activeEvents = (events || []).filter(event => !event.archived)
          
          return {
            ...season,
            events: activeEvents, // On stocke seulement les événements actifs
            players: players || []
          }
        } catch (error) {
          logger.warn(`Erreur lors du chargement des données pour la saison ${season.name}`, error)
          return {
            ...season,
            events: [],
            players: []
          }
        }
      })
    )
    
    seasons.value = seasonsWithData
    logger.debug(`Saisons chargées avec données: ${seasonsWithData.map(s => `${s.name}: ${s.events?.length || 0} événements, ${s.players?.length || 0} participants`).join(', ')}`)
  } catch (error) {
    logger.error('Erreur lors du chargement des saisons', error)
  } finally {
    loading.value = false
  }
}

// -------- Export CSV (saison) --------
async function exportSeasonAvailabilityCsv(season) {
  await exportSeasonAvailabilitiesCsv(season, {
    onSuccess: () => {
      logger.info('Export CSV réussi', { seasonId: season.id })
    },
    onError: (error) => {
      alert('Erreur lors de l\'export CSV. Veuillez réessayer.')
    }
  })
}


// -------- Déplacement des saisons --------
async function moveSeasonUp(index) {
  closeMenu()
  const list = [...sortedSeasons.value]
  if (index >= list.length - 1) return
  const current = list[index]
  const next = list[index + 1]
  const temp = current.sortOrder
  current.sortOrder = next.sortOrder
  next.sortOrder = temp
  try {
    await Promise.all([
      setSeasonSortOrder(current.id, current.sortOrder),
      setSeasonSortOrder(next.id, next.sortOrder)
    ])
    // Recharger les saisons pour mettre à jour l'affichage
    await loadSeasons()
  } catch (e) {
    logger.error('Erreur lors du déplacement vers le bas (Avancer)', e)
  }
}

async function moveSeasonDown(index) {
  closeMenu()
  if (index <= 0) return
  const list = [...sortedSeasons.value]
  const current = list[index]
  const prev = list[index - 1]
  const temp = current.sortOrder
  current.sortOrder = prev.sortOrder
  prev.sortOrder = temp
  try {
    await Promise.all([
      setSeasonSortOrder(current.id, current.sortOrder),
      setSeasonSortOrder(prev.id, prev.sortOrder)
    ])
    // Recharger les saisons pour mettre à jour l'affichage
    await loadSeasons()
  } catch (e) {
    logger.error('Erreur lors du déplacement vers le haut (Reculer)', e)
  }
}

// -------- Modification de saison --------
function openEditModal(season) {
  seasonToEdit.value = season
  editSeasonName.value = season.name
  editSeasonDescription.value = season.description || ''
  editSeasonLogo.value = null
  editSeasonLogoPreview.value = season.logoUrl || ''
  showEditModal.value = true
  closeMenu()
}

// Fonctions pour la gestion du logo
function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (file) {
    editSeasonLogo.value = file
    isLogoUploading.value = true
    
    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      editSeasonLogoPreview.value = e.target.result
      isLogoUploading.value = false
    }
    reader.onerror = () => {
      isLogoUploading.value = false
    }
    reader.readAsDataURL(file)
  }
}

async function removeLogo() {
  try {
    isLogoDeleting.value = true
    
    // Supprimer le fichier du storage s'il existe
    if (seasonToEdit.value?.logoUrl && isFirebaseStorageUrl(seasonToEdit.value.logoUrl)) {
      try {
        await deleteImage(seasonToEdit.value.logoUrl)
        logger.info('Logo supprimé du storage')
      } catch (deleteError) {
        logger.warn('Erreur lors de la suppression du logo du storage:', deleteError)
        // Continuer même si la suppression du fichier échoue
      }
    }
    
    // Mettre à jour la saison dans Firestore (supprimer logoUrl)
    await updateSeason(seasonToEdit.value.id, { logoUrl: null })
    logger.info('Logo supprimé de la saison')
    
    // Mettre à jour l'état local
    seasonToEdit.value.logoUrl = null
    editSeasonLogo.value = null
    editSeasonLogoPreview.value = ''
    
    // Recharger les saisons pour mettre à jour l'affichage
    await loadSeasons()
    
    logger.info('Logo supprimé avec succès')
  } catch (error) {
    logger.error('Erreur lors de la suppression du logo:', error)
    alert('Erreur lors de la suppression du logo. Veuillez réessayer.')
  } finally {
    isLogoDeleting.value = false
  }
}

function triggerLogoUpload() {
  if (logoFileInput.value) {
    logoFileInput.value.click()
  }
}

function cancelEdit() {
  showEditModal.value = false
  seasonToEdit.value = null
  editSeasonName.value = ''
  editSeasonDescription.value = ''
  editSeasonLogo.value = null
  editSeasonLogoPreview.value = ''
  isLogoUploading.value = false
}

async function handleSeasonEditSave(updates) {
  if (!seasonToEdit.value) return
  
  try {
    // Si un nouveau logo a été sélectionné, l'uploader
    if (updates.logoFile) {
      try {
        isLogoUploading.value = true
        logger.info('Upload du nouveau logo...')
        const logoUrl = await uploadImage(updates.logoFile, `season-logos/${seasonToEdit.value.id}`, {
          resize: true,
          maxWidth: 64,   // Taille exacte d'affichage
          maxHeight: 64,
          quality: 0.6    // Qualité réduite car très petit
        })
        updates.logoUrl = logoUrl
        
        // Supprimer l'ancien logo s'il existe
        if (seasonToEdit.value.logoUrl && isFirebaseStorageUrl(seasonToEdit.value.logoUrl)) {
          try {
            await deleteImage(seasonToEdit.value.logoUrl)
            logger.info('Ancien logo supprimé')
          } catch (deleteError) {
            logger.warn('Erreur lors de la suppression de l\'ancien logo:', deleteError)
          }
        }
      } catch (uploadError) {
        logger.error('Erreur lors de l\'upload du logo:', uploadError)
        throw new Error('Impossible d\'uploader le logo. Veuillez réessayer.')
      } finally {
        isLogoUploading.value = false
      }
    }
    
    // Nettoyer les données avant la mise à jour
    const cleanUpdates = {
      name: updates.name,
      description: updates.description
    }
    if (updates.logoUrl) {
      cleanUpdates.logoUrl = updates.logoUrl
    }
    
    await updateSeason(seasonToEdit.value.id, cleanUpdates)
    logger.info('Saison modifiée avec succès', { seasonId: seasonToEdit.value.id })
    
    // Recharger les saisons
    await loadSeasons()
    
    // Fermer la modale
    cancelEdit()
  } catch (error) {
    logger.error('Erreur lors de la modification de la saison', error)
    alert('Erreur lors de la modification de la saison. Veuillez réessayer.')
  }
}

// -------- Suppression de saison --------
function confirmDeleteSeason(season) {
  seasonToDelete.value = season
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  seasonToDelete.value = null
}

async function deleteSeasonConfirmed() {
  if (!seasonToDelete.value) return
  
  await deleteSeasonDirect(seasonToDelete.value, {
    onSuccess: () => {
      logger.info('Saison supprimée avec succès', { seasonId: seasonToDelete.value.id })
      // Recharger les saisons
      loadSeasons()
      // Fermer la modale
      cancelDelete()
    },
    onError: (error) => {
      alert('Erreur lors de la suppression de la saison. Veuillez réessayer.')
    }
  })
}

// Gérer la création d'une nouvelle saison
function handleSeasonCreated(newSeason) {
  showCreateSeasonModal.value = false
  // Recharger les saisons
  loadSeasons()
  // Rediriger vers la nouvelle saison
  if (newSeason?.slug) {
    router.push(`/season/${newSeason.slug}`)
  }
}

// Nettoyer la préférence de saison pour éviter la redirection automatique
async function clearSeasonPreference() {
  try {
    if (isConnected.value) {
      await clearLastSeasonPreference()
      logger.info('Préférence de saison nettoyée pour éviter la redirection automatique')
    }
  } catch (error) {
    logger.warn('Erreur lors du nettoyage de la préférence de saison', error)
  }
}



onMounted(async () => {
  // Supprimer la préférence de saison mémorisée lors de la visite de cette page
  try {
    // Forcer la suppression du localStorage immédiatement (fonctionne sans connexion)
    try {
      localStorage.removeItem('lastVisitedSeason')
      localStorage.removeItem('lastVisitedSeasonTimestamp')
      logger.info('Préférence de saison nettoyée dans localStorage lors de la visite de /seasons')
    } catch (error) {
      logger.warn('Erreur lors du nettoyage localStorage', error)
    }
    
    // Si connecté, nettoyer aussi Firebase (optionnel)
    if (isConnected.value) {
      try {
        await clearLastSeasonPreference()
        logger.info('Préférence de saison nettoyée dans Firebase lors de la visite de /seasons')
      } catch (error) {
        logger.warn('Erreur lors du nettoyage Firebase, mais localStorage est déjà nettoyé', error)
      }
    }
  } catch (error) {
    logger.warn('Erreur lors du nettoyage de la préférence de saison', error)
  }
  
  loadSeasons()
})

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
