<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header partagé -->
    <AppHeader 
      :is-scrolled="isScrolled"
      :is-connected="isConnected"
      custom-logo="/logos/hatcast-mask.png"
      @open-account-menu="openAccountMenu"
      @open-help="openHelp"
      @open-notifications="openNotifications"
      @open-players="openPlayers"
      @logout="handleLogout"
      @open-login="openAccountLogin"
      @open-account-creation="openAccountCreation"
    />

    <!-- Contenu principal -->
    <main class="relative z-10">
      <div class="container mx-auto px-4 py-4">
        <!-- Titre de la page -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-white mb-4">Saisons</h2>
          <p class="text-xl text-gray-300">Rejoins une saison existante ou crée la tienne</p>
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
            <div
              v-for="(season, index) in sortedSeasons"
              :key="season.id"
              class="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 w-full max-w-sm"
            >
              <div @click="goToSeason(season.slug)" class="text-center cursor-pointer">
                <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg overflow-hidden">
                  <img 
                    v-if="season.logoUrl" 
                    :src="season.logoUrl" 
                    :alt="`Logo de ${season.name}`"
                    class="w-full h-full object-cover"
                  >
                  <span v-else class="text-2xl">🎭</span>
                </div>
                <h2 class="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  {{ season.name }}
                </h2>
                <p v-if="season.description" class="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {{ season.description }}
                </p>
                <div class="w-full bg-gradient-to-br from-transparent via-white/20 to-transparent h-px mb-4"></div>
                <!-- Statistiques de la saison -->
                <div class="flex justify-center gap-6 text-sm">
                  <div class="text-center">
                    <div class="text-white font-semibold">{{ season.events?.length || 0 }}</div>
                    <div class="text-gray-400 text-xs">Spectacles</div>
                  </div>
                  <div class="text-center">
                    <div class="text-white font-semibold">{{ season.players?.length || 0 }}</div>
                    <div class="text-gray-400 text-xs">Participants</div>
                  </div>
                </div>

              </div>

              <!-- Menu 3 points -->
              <div class="absolute top-4 right-4">
                <div class="relative" @click.stop>
                  <button
                    @click="toggleMenu(index)"
                    class="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10"
                    :aria-expanded="openMenuIndex === index"
                    aria-haspopup="true"
                    title="Options"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                  </button>
                  <div
                    v-if="openMenuIndex === index"
                    class="absolute right-0 mt-2 w-44 bg-gray-900 border border-white/10 rounded-lg shadow-xl py-1 z-10"
                    role="menu"
                  >
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton Nouvelle saison -->
          <div class="text-center mt-12">
            <button
              @click="showCreateSeasonModal = true"
              class="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
            >
              <span>➕</span>
              Nouvelle saison
            </button>
          </div>

          <!-- Message si aucune saison -->
          <div v-if="!loading && seasons.length === 0" class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span class="text-4xl">🎪</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Aucune saison créée</h3>
            <p class="text-gray-300 mb-8">Commencez par créer votre première saison de spectacles !</p>
            <button 
              @click="showCreateSeasonModal = true"
              class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"
            >
              Créer ma première saison
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
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
          <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer la saison "{{ seasonToDelete?.name }}" ?</p>
        </div>
        <p class="mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
          ⚠️ Cette action est irréversible et supprimera toutes les données de cette saison.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelDelete"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            @click="deleteSeasonConfirmed"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de modification de saison -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">✏️</span>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Modifier la saison</h2>
          <p class="text-gray-300">Modifiez les informations de la saison "{{ seasonToEdit?.name }}"</p>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Nom de la saison</label>
          <input
            v-model="editSeasonName"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Ex: La Malice 2025-2026"
          >
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Description (optionnel)</label>
          <textarea
            v-model="editSeasonDescription"
            rows="3"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
            placeholder="Ex: Saison 2025-2026 de la troupe d'improvisation La Malice"
          ></textarea>
        </div>
        
        <!-- Section Logo -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Logo de la saison</label>
          <div class="flex items-center gap-4">
            <!-- Prévisualisation du logo -->
            <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
              <img 
                v-if="editSeasonLogoPreview" 
                :src="editSeasonLogoPreview" 
                :alt="`Logo de ${editSeasonName}`"
                class="w-full h-full object-cover"
              >
              <span v-else class="text-xl">🎭</span>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex flex-col gap-2">
              <button
                v-if="isConnected"
                type="button"
                @click="triggerLogoUpload"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                {{ editSeasonLogo ? 'Changer le logo' : 'Ajouter un logo' }}
              </button>
              <button
                v-else
                type="button"
                disabled
                class="px-4 py-2 bg-gray-600 text-gray-400 text-sm rounded-lg cursor-not-allowed"
                title="Connectez-vous pour ajouter un logo"
              >
                🔒 Connexion requise
              </button>
              <button
                v-if="editSeasonLogoPreview"
                type="button"
                @click="removeLogo"
                :disabled="isLogoDeleting"
                class="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isLogoDeleting" class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Suppression...
                </span>
                <span v-else>Supprimer</span>
              </button>
            </div>
          </div>
          
          <!-- Input file caché -->
          <input
            ref="logoFileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleLogoUpload"
          >
          
          <!-- Indicateur de chargement -->
          <div v-if="isLogoUploading" class="mt-2 text-sm text-blue-400 flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            Upload en cours...
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelEdit"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveSeasonEdit"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>

    <!-- Modales d'authentification -->
    <AccountLoginModal 
      v-if="showAccountLogin" 
      :show="showAccountLogin"
      @close="showAccountLogin = false"
      @success="handlePostLoginNavigation"
      @open-account-creation="openAccountCreation"
    />
    
    <AccountCreationModal 
      v-if="showAccountCreation" 
      :show="showAccountCreation"
      @close="showAccountCreation = false"
      @account-created="handlePostLoginNavigation"
    />

    <!-- Menu du compte -->
    <AccountMenu 
      v-if="showAccountMenu" 
      @close="showAccountMenu = false"
      @open-help="openHelp"
      @open-notifications="openNotifications"
      @open-players="openPlayers"
      @logout="handleLogout"
    />

    <!-- Modales de notifications et joueurs -->
    <NotificationsModal 
      v-if="showNotifications" 
      @close="showNotifications = false"
    />
    
    <PlayersModal 
      v-if="showPlayers" 
      @close="showPlayers = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSeasons, setSeasonSortOrder, updateSeason, deleteSeason } from '../services/seasons.js'
import { loadEvents, loadPlayers, loadAvailability, loadSelections } from '../services/storage.js'
import { currentUser, isConnected } from '../services/authState.js'
import { clearLastSeasonPreference } from '../services/seasonPreferences.js'
import { uploadImage, deleteImage, isFirebaseStorageUrl } from '../services/imageUpload.js'
import AppHeader from '../components/AppHeader.vue'
import CreateSeasonModal from '../components/CreateSeasonModal.vue'
import AccountLoginModal from '../components/AccountLoginModal.vue'
import AccountCreationModal from '../components/AccountCreationModal.vue'
import AccountMenu from '../components/AccountMenu.vue'
import NotificationsModal from '../components/NotificationsModal.vue'
import PlayersModal from '../components/PlayersModal.vue'
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

// Gérer la navigation post-connexion
async function handlePostLoginNavigation() {
  // Fermer la modal de connexion
  showAccountLogin.value = false
  
  // On est déjà sur /seasons, pas besoin de rediriger
  // Juste rafraîchir la page pour mettre à jour l'état de connexion
  logger.info('Connexion réussie sur /seasons, modal fermée')
}

// Fonctions de gestion des saisons
function goToSeason(slug) {
  router.push(`/season/${slug}`)
}

function toggleMenu(index) {
  openMenuIndex.value = openMenuIndex.value === index ? null : index
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
          
          // Filtrer les événements non archivés pour le comptage
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
    logger.debug(`Saisons chargées avec données: ${seasonsWithData.map(s => `${s.name}: ${s.events?.length || 0} spectacles, ${s.players?.length || 0} participants`).join(', ')}`)
  } catch (error) {
    logger.error('Erreur lors du chargement des saisons', error)
  } finally {
    loading.value = false
  }
}

// -------- Export CSV (saison) --------
async function exportSeasonAvailabilityCsv(season) {
  try {
    if (!season?.id) {
      alert('Saison introuvable')
      return
    }

    // Charger données de la saison
    const [events, players] = await Promise.all([
      loadEvents(season.id),
      loadPlayers(season.id)
    ])
    const [availability, selections] = await Promise.all([
      loadAvailability(players, events, season.id),
      loadSelections(season.id)
    ])

    // Construire l'en-tête
    const header = ['Joueur', ...events.map(e => formatCsvHeaderForEvent(e))]

    // Lignes
    const rows = []
    for (const player of players) {
      const name = player?.name || ''
      const availMap = availability?.[name] || {}
      const line = [name, ...events.map(e => cellValue(availMap[e.id], selections?.[e.id], name))]
      rows.push(line)
    }

    // Générer CSV (avec BOM pour Excel)
    const csv = toCsvString([header, ...rows])
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const base = season?.name || season?.slug || 'saison'
    const fileName = `${sanitizeFilename(base)}-disponibilites.csv`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Export CSV saison', { seasonId: season.id, events: events.length, players: players.length })
  } catch (err) {
    logger.error('Erreur export CSV', err)
    alert('Erreur lors de l\'export CSV. Veuillez réessayer.')
  }
}

// Fonctions utilitaires pour l'export CSV
function toDateObject(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

function formatCsvHeaderForEvent(event) {
  const dateObj = toDateObject(event?.date)
  const iso = dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : ''
  const title = event?.title || 'Sans titre'
  return `${iso} · ${title}`.trim()
}

function availabilityToString(value) {
  if (value === true || value === 'oui') return 'disponible'
  if (value === false || value === 'non') return 'non disponible'
  return ''
}

function toCsvString(matrix) {
  return matrix.map(row => row.map(csvEscape).join(',')).join('\n')
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function sanitizeFilename(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_. ]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|^\.+|\.+$/g, '')
    || 'fichier'
}

function cellValue(availabilityValue, selectedList, playerName) {
  const isSelected = Array.isArray(selectedList) && selectedList.includes(playerName)
  if (isSelected) {
    if (availabilityValue === false || availabilityValue === 'non') return 'non disponible'
    return 'sélectionné'
  }
  return availabilityToString(availabilityValue)
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

async function saveSeasonEdit() {
  if (!seasonToEdit.value) return
  
  try {
    const updates = {
      name: editSeasonName.value.trim(),
      description: editSeasonDescription.value.trim()
    }
    
    // Si un nouveau logo a été sélectionné, l'uploader
    if (editSeasonLogo.value) {
      try {
        isLogoUploading.value = true
        logger.info('Upload du nouveau logo...')
        const logoUrl = await uploadImage(editSeasonLogo.value, `season-logos/${seasonToEdit.value.id}`, {
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
    
    await updateSeason(seasonToEdit.value.id, updates)
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
  
  try {
    await deleteSeason(seasonToDelete.value.id)
    logger.info('Saison supprimée avec succès', { seasonId: seasonToDelete.value.id })
    
    // Recharger les saisons
    await loadSeasons()
    
    // Fermer la modale
    cancelDelete()
  } catch (error) {
    logger.error('Erreur lors de la suppression de la saison', error)
    alert('Erreur lors de la suppression de la saison. Veuillez réessayer.')
  }
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
