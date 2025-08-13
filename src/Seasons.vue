<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <!-- Section Hero -->
    <section class="hero-section relative overflow-hidden">
      <!-- Bouton d'aide flottant -->
      <button
        @click="showAppHelp = true"
        class="absolute right-4 top-4 z-10 text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
        title="Kezako ?"
        aria-label="Kezako ?"
      >
        <span class="text-2xl">❓</span>
      </button>
      
      <!-- Contenu du Hero à 2 colonnes -->
      <div class="hero-content py-20 md:py-28 px-4 relative z-10">
        <div class="container mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <!-- Colonne gauche : Logo HatCast et illustration -->
            <div class="text-center lg:text-left order-2 lg:order-1">
              <div class="hero-content-wrapper">
                
                <!-- Logo HatCast - Checkmark géométrique en masque -->
                <div class="hatcast-logo mb-8 flex justify-center lg:justify-start">
                  <div class="relative w-24 h-24 md:w-32 md:h-32">
                    <!-- Logo SVG externe avec gradient signature -->
                    <img 
                      src="/logo.svg" 
                      alt="Logo HatCast - Checkmark qui se transforme en masque" 
                      class="w-full h-full drop-shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-3"
                    />
                  </div>
                </div>
                
                <!-- Illustration avec mockup de l'app -->
                <div class="hero-illustration relative">
                  <!-- Mockup principal avec screenshot de la grille -->
                  <div class="relative mx-auto lg:mx-0 w-full max-w-lg">
                    <!-- Fond du mockup -->
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl border border-white/10">
                      <!-- Barre de titre du mockup -->
                      <div class="flex items-center gap-3 mb-4">
                        <div class="flex gap-2">
                          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div class="text-gray-400 text-sm">HatCast - Grille des disponibilités</div>
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
                    
                    <!-- Éléments flottants décoratifs -->
                    <div class="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl shadow-xl transform rotate-12"></div>
                    <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl shadow-xl transform -rotate-12"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Colonne droite : Contenu et CTA -->
            <div class="text-center lg:text-left order-1 lg:order-2">
              <!-- Titre principal -->
              <div class="hero-title mb-6">
                <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Tu joues quand ?
                </h1>
              </div>
              
              <!-- Sous-titre -->
              <div class="hero-subtitle mb-8">
                <p class="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  Arrêtez de vous prendre la tête pour savoir qui sera sur scène quand. 
                  Laissez chacun indiquer ses dispos et le hasard choisir pour vous !
                </p>
              </div>
              
              <!-- Call-to-action principal -->
              <div class="hero-cta mb-8">
                <button 
                  @click="showCreateModal = true"
                  class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 text-lg md:text-xl"
                >
                  🚀 Démarrez
                </button>
              </div>
              
              <!-- Indication subtile -->
              <div class="hero-hint">
                <div class="inline-flex items-center gap-2 text-gray-400 text-sm">
                  <span>↓</span>
                  <span>Vos saisons ci-dessous</span>
                  <span>↓</span>
                </div>
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

    <div class="container mx-auto px-4 pb-16" :aria-busy="isLoading">
      <!-- Grille des saisons (chargement) -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto animate-pulse">
        <div v-for="n in 8" :key="'skeleton-'+n" class="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8">
          <div class="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6"></div>
          <div class="h-6 bg-white/10 rounded mb-4 w-2/3 mx-auto"></div>
          <div class="h-px bg-white/10 mb-4"></div>
          <div class="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
        </div>
      </div>

      <!-- Grille des saisons (données) -->
      <div v-else-if="seasons.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div
          v-for="(season, index) in sortedSeasons"
          :key="season.id"
          class="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          <div @click="goToSeason(season.slug)" class="text-center cursor-pointer">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <span class="text-2xl">🎭</span>
            </div>
            <h2 class="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
              {{ season.name }}
            </h2>
            <div class="w-full bg-gradient-to-r from-transparent via-white/20 to-transparent h-px mb-4"></div>
            <p class="text-gray-300 text-sm">
              Cliquez pour accéder
            </p>
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
                <button @click="exportSeasonAvailabilityCsv(season); closeMenu()" class="w-full text-left px-4 py-2 text-sm text-emerald-300 hover:bg-white/10" role="menuitem">
                  Exporter CSV
                </button>
                <div class="border-t border-white/10 my-1"></div>
                <button @click="moveSeasonUp(index)" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10" role="menuitem">
                  Monter
                </button>
                <button @click="moveSeasonDown(index)" class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10" role="menuitem">
                  Descendre
                </button>
                <div class="border-t border-white/10 my-1"></div>
                <button @click="confirmDeleteSeason(season)" class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10" role="menuitem">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- Message si aucune saison -->
      <div v-if="!isLoading && seasons.length === 0" class="text-center py-16">
        <div class="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span class="text-4xl">🎪</span>
        </div>
        <h3 class="text-2xl font-bold text-white mb-4">Aucune saison créée</h3>
        <p class="text-gray-300 mb-8">Commencez par créer votre première saison de spectacles !</p>
        <button 
          @click="showCreateModal = true"
          class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"
        >
          Créer ma première saison
        </button>
      </div>
    </div>

    <!-- Modal de création de saison -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvelle saison</h2>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Nom de la saison</label>
          <input
            v-model="newSeasonName"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Ex: La Malice 2025-2026"
            @input="generateSlug"
          >
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
          <input
            v-model="newSeasonSlug"
            type="text"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="Ex: malice-2025-2026"
          >
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Code PIN (4 chiffres)</label>
          <input
            v-model="newSeasonPin"
            type="text"
            inputmode="numeric"
            maxlength="4"
            pattern="[0-9]{4}"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="1234"
            @input="validatePin"
          >
          <p class="text-xs text-gray-400 mt-1">Ce code protégera les opérations sensibles (suppressions, sélections)</p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelCreate"
            class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            @click="createSeason"
            :disabled="!newSeasonName.trim() || !newSeasonSlug.trim() || !newSeasonPin.trim() || newSeasonPin.length !== 4"
            class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
          >
            Créer
          </button>
        </div>
      </div>
    </div>

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
            @click="deleteSeasonWithPin"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de saisie du PIN -->
    <PinModal
      :show="showPinModal"
      :message="getPinModalMessage()"
      :error="pinErrorMessage"
      :session-info="getSessionInfo()"
      @submit="handlePinSubmit"
      @cancel="handlePinCancel"
    />

    <!-- Popin Aide (global) -->
    <AppHelpModal :show="showAppHelp" @close="showAppHelp = false" />

    <!-- Footer -->
    <footer class="mt-16 border-t border-white/10">
      <div class="container mx-auto px-4 py-6 text-center text-xs text-gray-400">
        <span>© Patrice Lamarque 2025</span>
        <span class="mx-2">•</span>
        <span>Licence MIT</span>
        <span class="mx-2">•</span>
        <a
          href="https://github.com/plamarque/hatcast"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-white/20 hover:decoration-white/40 hover:text-gray-200"
        >GitHub</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getSeasons, addSeason, deleteSeason, verifySeasonPin, setSeasonSortOrder } from './services/seasons.js'
import pinSessionManager from './services/pinSession.js'
import { useRouter } from 'vue-router'
import PinModal from './components/PinModal.vue'
import AppHelpModal from './components/AppHelpModal.vue'
import logger from './services/logger.js'
import { loadEvents, loadPlayers, loadAvailability, loadSelections } from './services/storage.js'

const seasons = ref([])
const isLoading = ref(true)
const router = useRouter()
const openMenuIndex = ref(null)

// État des modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const newSeasonName = ref('')
const newSeasonSlug = ref('')
const newSeasonPin = ref('')
const seasonToDelete = ref(null)

// Variables pour la protection par PIN
const showPinModal = ref(false)
const pendingOperation = ref(null)
const pinErrorMessage = ref('')
const showAppHelp = ref(false)



onMounted(async () => {
  try {
    // Charger vite les saisons pour afficher rapidement
    seasons.value = await getSeasons()
    logger.info('Saisons chargées', { count: seasons.value?.length || 0 })
    // Lancer les migrations en arrière-plan
    migrateMissingSortOrders().catch(err => logger.error('Migration sortOrder échouée', err))
  } finally {
    isLoading.value = false
  }
})

// Tri contrôlé: par sortOrder croissant, puis createdAt desc, puis nom
const sortedSeasons = computed(() => {
  return [...seasons.value].sort((a, b) => {
    const aOrder = typeof a.sortOrder === 'number' ? a.sortOrder : Number.MAX_SAFE_INTEGER
    const bOrder = typeof b.sortOrder === 'number' ? b.sortOrder : Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder

    // fallback: createdAt (Timestamp Firestore) desc
    const aCreated = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
    const bCreated = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
    if (aCreated !== bCreated) return bCreated - aCreated

    // dernier secours: nom asc
    return (a.name || '').localeCompare(b.name || '')
  })
})

function goToSeason(slug) {
  router.push(`/season/${slug}`)
}

function toggleMenu(index) {
  openMenuIndex.value = openMenuIndex.value === index ? null : index
}

function closeMenu() {
  openMenuIndex.value = null
}

async function migrateMissingSortOrders() {
  // Si aucune saison, rien à faire
  if (!seasons.value.length) return
  // Trouver l'ordre max existant
  const existingOrders = seasons.value
    .map(s => (typeof s.sortOrder === 'number' ? s.sortOrder : null))
    .filter(v => v !== null)
  let maxOrder = existingOrders.length ? Math.max(...existingOrders) : 0

  // Affecter un sortOrder aux saisons qui n'en ont pas, en les plaçant après
  for (const s of seasons.value) {
    if (typeof s.sortOrder !== 'number') {
      maxOrder += 1
      try {
        await setSeasonSortOrder(s.id, maxOrder)
        s.sortOrder = maxOrder
      } catch (e) {
        logger.error('Erreur migration sortOrder', { seasonName: s?.name, error: e })
      }
    }
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

async function moveSeasonUp(index) {
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
  } catch (e) {
    logger.error('Erreur lors du déplacement vers le haut', e)
  }
}

async function moveSeasonDown(index) {
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
  } catch (e) {
    logger.error('Erreur lors du déplacement vers le bas', e)
  }
}

// Génération automatique du slug
function generateSlug() {
  if (newSeasonName.value) {
    newSeasonSlug.value = newSeasonName.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
}

// Validation du PIN
function validatePin() {
  // Garder seulement les chiffres
  newSeasonPin.value = newSeasonPin.value.replace(/[^0-9]/g, '')
  // Limiter à 4 chiffres
  if (newSeasonPin.value.length > 4) {
    newSeasonPin.value = newSeasonPin.value.slice(0, 4)
  }
}

// Création de saison
async function createSeason() {
  if (!newSeasonName.value.trim() || !newSeasonSlug.value.trim() || !newSeasonPin.value.trim()) {
    alert('Veuillez remplir tous les champs, y compris le code PIN à 4 chiffres')
    return
  }

  if (newSeasonPin.value.length !== 4) {
    alert('Le code PIN doit contenir exactement 4 chiffres')
    return
  }

  try {
    await addSeason(newSeasonName.value.trim(), newSeasonSlug.value.trim(), newSeasonPin.value.trim())
    seasons.value = await getSeasons() // Recharger la liste
    await migrateMissingSortOrders() // Assigner un ordre si manquant (nouvelles saisons en dernier)
    cancelCreate()
  } catch (error) {
    logger.error('Erreur lors de la création de la saison', error)
    alert('Erreur lors de la création de la saison. Veuillez réessayer.')
  }
}

function cancelCreate() {
  showCreateModal.value = false
  newSeasonName.value = ''
  newSeasonSlug.value = ''
  newSeasonPin.value = ''
}

// Suppression de saison
function confirmDeleteSeason(season) {
  seasonToDelete.value = season
  showDeleteModal.value = true
}

async function deleteSeasonWithPin() {
  // Fermer la modal de confirmation
  showDeleteModal.value = false
  
  // Demander le PIN code avant de supprimer
  await requirePin({
    type: 'deleteSeason',
    data: { seasonId: seasonToDelete.value.id, seasonName: seasonToDelete.value.name }
  })
}

async function deleteSeasonConfirmed() {
  logger.debug('deleteSeasonConfirmed appelé', { hasSeason: !!seasonToDelete.value })
  if (!seasonToDelete.value) {
    logger.warn('Aucune saison à supprimer')
    return
  }

  try {
    logger.info('Suppression de la saison', { seasonId: seasonToDelete.value.id })
    await deleteSeason(seasonToDelete.value.id)
    logger.info('Saison supprimée, rechargement de la liste')
    seasons.value = await getSeasons() // Recharger la liste
    logger.info('Liste des saisons rechargée', { count: seasons.value?.length || 0 })
    cancelDelete()
  } catch (error) {
    logger.error('Erreur lors de la suppression de la saison', error)
    alert('Erreur lors de la suppression de la saison. Veuillez réessayer.')
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  seasonToDelete.value = null
}

// Fonctions pour la protection par PIN
function getPinModalMessage() {
  if (!pendingOperation.value) return 'Veuillez saisir le code PIN à 4 chiffres'
  
  const messages = {
    deleteSeason: 'Suppression de saison - Code PIN requis'
  }
  
  return messages[pendingOperation.value.type] || 'Code PIN requis'
}

async function requirePin(operation) {
  // Vérifier si le PIN est déjà en cache pour cette saison
  if (pinSessionManager.isPinCached(seasonToDelete.value.id)) {
    const cachedPin = pinSessionManager.getCachedPin(seasonToDelete.value.id)
    logger.debug('PIN en cache trouvé, utilisation automatique')
    
    // Vérifier que le PIN est toujours valide
    const isValid = await verifySeasonPin(seasonToDelete.value.id, cachedPin)
    if (isValid) {
      // Exécuter directement l'opération
      await executePendingOperation(operation)
      return
    } else {
      // PIN invalide, effacer le cache
      pinSessionManager.clearSession()
    }
  }
  
  // Afficher la modal de saisie du PIN
  pendingOperation.value = operation
  showPinModal.value = true
}

async function handlePinSubmit(pinCode) {
  logger.debug('PIN soumis pour l\'opération', { operationType: pendingOperation.value?.type })
  try {
    const seasonId = pendingOperation.value?.data?.seasonId || seasonToDelete.value?.id
    const isValid = await verifySeasonPin(seasonId, pinCode)
    logger.debug('PIN validé', { valid: isValid })
    
    if (isValid) {
      // Sauvegarder le PIN en session
      pinSessionManager.saveSession(seasonId, pinCode)
      
      logger.debug('PIN correct, fermeture de la modal et exécution de l\'opération')
      showPinModal.value = false
      const operationToExecute = pendingOperation.value
      pendingOperation.value = null
      
      // Exécuter l'opération en attente
      logger.debug('Appel de executePendingOperation', { operationType: operationToExecute?.type })
      await executePendingOperation(operationToExecute)
    } else {
      pinErrorMessage.value = 'Code PIN incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        pinErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification du PIN', error)
    pinErrorMessage.value = 'Erreur lors de la vérification du code PIN'
  }
}

function handlePinCancel() {
  showPinModal.value = false
  pendingOperation.value = null
  pinErrorMessage.value = ''
}

function getSessionInfo() {
  if (seasonToDelete.value && pinSessionManager.isPinCached(seasonToDelete.value.id)) {
    return {
      timeRemaining: pinSessionManager.getTimeRemaining(),
      isExpiringSoon: pinSessionManager.isExpiringSoon()
    }
  }
  return null
}

async function executePendingOperation(operation) {
  logger.debug('executePendingOperation appelé', { hasOperation: !!operation })
  if (!operation) {
    logger.warn('Aucune opération à exécuter')
    return
  }
  
  const { type, data } = operation
  logger.info('Exécution de l\'opération', { type })
  
  try {
    switch (type) {
      case 'deleteSeason':
        logger.info('Suppression de la saison', { seasonId: data.seasonId })
        await deleteSeason(data.seasonId)
        logger.info('Saison supprimée, rechargement de la liste')
        seasons.value = await getSeasons() // Recharger la liste
        logger.info('Liste des saisons rechargée', { count: seasons.value?.length || 0 })
        break
      default:
        logger.warn('Type d\'opération non reconnu', { type })
    }
  } catch (error) {
    logger.error('Erreur lors de l\'exécution de l\'opération', error)
    alert('Erreur lors de l\'opération. Veuillez réessayer.')
  }
}
</script>
