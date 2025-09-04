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
              HatCast est une appli conçue pour faciliter <span class="text-white">la sélection des joueurs d'impro</span> pour les événements.
              L'idée est née au sein de <span class="text-purple-300">La Malice</span> pour <span class="text-white">dépersonnaliser une tâche délicate</span> qui créait des tensions depuis des années.
            </p>
          </div>

          <!-- Comment ça marche -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">Comment ça marche</h2>
            <p class="text-gray-200">
              L'asso déclare ses dates et le nombre de personnes nécessaires. Les joueurs indiquent leurs disponibilités. L'appli propose des sélections.
            </p>
          </div>

          <!-- Sélection auto ou manuelle -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
            <h2 class="text-xl font-semibold text-white">Sélection auto ou manuelle</h2>
            <p class="text-gray-200">
              Le <span class="text-white">mode sélection auto</span> s'appuie sur le hasard (pondéré) pour simplifier la vie. Vous pouvez aussi repasser en mode <span class="text-white">manuel</span> si besoin.
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
    <div v-if="showChangelog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4" @click="toggleChangelog">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <span class="text-blue-400">🆕</span>
            Nouveautés
          </h3>
          <button @click="toggleChangelog" class="text-white/80 hover:text-white text-xl">✖️</button>
        </div>

        <div v-if="changelogLoading" class="text-gray-400 text-sm text-center py-8">
          Chargement des nouveautés...
        </div>
        <div v-else-if="changelogError" class="text-red-300 text-sm text-center py-8">
          ❌ Impossible de charger les nouveautés
        </div>
        <div v-else-if="userFriendlyChangelog.length === 0" class="text-gray-400 text-sm text-center py-8">
          Aucune nouveauté récente
        </div>
        <div v-else class="space-y-4">
          <div v-for="version in userFriendlyChangelog" :key="version.version" class="space-y-3">
            <div class="flex items-center gap-2 pb-2 border-b border-white/10">
              <span class="text-white font-semibold text-lg">Version {{ version.version }}</span>
              <span class="text-gray-500 text-sm">{{ version.date }}</span>
            </div>
            <div class="space-y-2">
              <div v-for="change in version.changes" :key="change.id" class="text-sm text-gray-300 flex items-start gap-2">
                <span class="text-blue-300 text-lg flex-shrink-0">{{ change.emoji }}</span>
                <span class="leading-relaxed">{{ change.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-white/10 text-center">
          <button @click="toggleChangelog" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

// Version de l'application
const appVersion = ref('1.0.0')
const buildInfo = ref('')

// Changelog state
const changelogLoading = ref(false)
const changelogError = ref(false)
const userFriendlyChangelog = ref([])
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
  
  // Charger le changelog
  await loadChangelog()
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

// Dictionnaire de traductions prédéfinies
const predefinedTranslations = {
  // Nouvelles fonctionnalités
  'feat': { emoji: '✨', prefix: 'Nouvelle fonctionnalité' },
  'feature': { emoji: '✨', prefix: 'Nouvelle fonctionnalité' },
  
  // Corrections
  'fix': { emoji: '🐛', prefix: 'Correction' },
  'bugfix': { emoji: '🐛', prefix: 'Correction' },
  
  // Améliorations
  'improve': { emoji: '⚡', prefix: 'Amélioration' },
  'enhance': { emoji: '⚡', prefix: 'Amélioration' },
  'optimize': { emoji: '⚡', prefix: 'Optimisation' },
  
  // Interface utilisateur
  'ui': { emoji: '🎨', prefix: 'Interface' },
  'design': { emoji: '🎨', prefix: 'Design' },
  'style': { emoji: '🎨', prefix: 'Style' },
  
  // Mobile
  'mobile': { emoji: '📱', prefix: 'Mobile' },
  'responsive': { emoji: '📱', prefix: 'Responsive' },
  
  // Sécurité
  'security': { emoji: '🛡️', prefix: 'Sécurité' },
  'protect': { emoji: '🛡️', prefix: 'Protection' },
  
  // Performance
  'perf': { emoji: '🚀', prefix: 'Performance' },
  'performance': { emoji: '🚀', prefix: 'Performance' },
  
  // Documentation
  'docs': { emoji: '📚', prefix: 'Documentation' },
  'doc': { emoji: '📚', prefix: 'Documentation' },
  
  // Tests
  'test': { emoji: '🧪', prefix: 'Tests' },
  'testing': { emoji: '🧪', prefix: 'Tests' }
}

// Dictionnaire de traductions de mots clés
const keywordTranslations = {
  'add': 'ajout de',
  'adds': 'ajoute',
  'added': 'ajouté',
  'support': 'support',
  'system': 'système',
  'automatic': 'automatique',
  'selection': 'sélection',
  'player': 'joueur',
  'players': 'joueurs',
  'event': 'événement',
  'modique': 'modale',
  'events': 'événements',
  'season': 'saison',
  'seasons': 'saisons',
  'availability': 'disponibilité',
  'notifications': 'notifications',
  'push': 'push',
  'email': 'email',
  'templates': 'modèles',
  'authentication': 'authentification',
  'accounts': 'comptes',
  'interface': 'interface',
  'grid': 'grille',
  'filter': 'filtre',
  'filters': 'filtres',
  'development': 'développement',
  'tools': 'outils',
  'debugging': 'débogage',
  'audit': 'audit',
  'trail': 'traçabilité',
  'reminder': 'rappel',
  'reminders': 'rappels',
  'navigation': 'navigation',
  'tracking': 'suivi',
  'management': 'gestion',
  'algorithm': 'algorithme',
  'responsive': 'responsive',
  'mobile': 'mobile',
  'first': 'premier',
  'design': 'conception',
  'layout': 'mise en page',
  'accessibility': 'accessibilité',
  'usability': 'utilisabilité',
  'performance': 'performance',
  'optimization': 'optimisation',
  'security': 'sécurité',
  'enhancement': 'amélioration',
  'user': 'utilisateur',
  'experience': 'expérience',
  'database': 'base de données',
  'queries': 'requêtes',
  'synchronization': 'synchronisation',
  'issues': 'problèmes',
  'problems': 'problèmes',
  'resolve': 'résoudre',
  'correct': 'corriger',
  'update': 'mise à jour',
  'improve': 'améliorer',
  'enhance': 'améliorer',
  'optimize': 'optimiser'
}

// Fonction pour traduire un texte avec l'API Google Translate
async function translateText(text, targetLang = 'fr') {
  try {
    // Créer un AbortController pour le timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 secondes timeout
    
    // Utiliser l'API Google Translate gratuite (avec limitations)
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0]
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.debug('Translation API failed:', error)
    return null
  }
}

// Fonction pour traduire et simplifier les commits
async function translateCommit(commit) {
  // D'abord, essayer les traductions prédéfinies
  for (const [key, value] of Object.entries(predefinedTranslations)) {
    if (commit.toLowerCase().includes(key)) {
      const description = commit.replace(new RegExp(`^${key}:?\\s*`, 'i'), '').trim()
      
      // Traduire la description si elle n'est pas vide
      let translatedDescription = description
      if (description) {
        // Essayer de traduire avec l'API
        const apiTranslation = await translateText(description)
        if (apiTranslation) {
          translatedDescription = apiTranslation
        } else {
          // Si l'API échoue, garder l'anglais original
          translatedDescription = description
        }
      }
      
      return {
        emoji: value.emoji,
        description: translatedDescription
      }
    }
  }
  
  // Si pas de correspondance prédéfinie, essayer de traduire tout le commit
  const apiTranslation = await translateText(commit)
  if (apiTranslation) {
    return {
      emoji: '🔧',
      description: apiTranslation
    }
  }
  
  // Fallback final : garder l'anglais original
  return {
    emoji: '🔧',
    description: commit
  }
}

// Fonction de traduction manuelle des mots clés
function translateKeywords(text) {
  let translated = text
  
  // Remplacer les mots clés connus
  for (const [english, french] of Object.entries(keywordTranslations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi')
    translated = translated.replace(regex, french)
  }
  
  return translated
}

// Fonction pour charger le changelog
async function loadChangelog() {
  changelogLoading.value = true
  changelogError.value = false
  
  try {
    const response = await fetch('/changelog.md')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const content = await response.text()
    const versions = await parseChangelog(content)
    userFriendlyChangelog.value = versions.slice(0, 3) // Limiter aux 3 dernières versions
    
  } catch (error) {
    console.debug('Could not load changelog:', error)
    changelogError.value = true
    userFriendlyChangelog.value = []
  } finally {
    changelogLoading.value = false
  }
}

// Fonction pour parser le changelog
async function parseChangelog(content) {
  const versions = []
  const lines = content.split('\n')
  
  let currentVersion = null
  let currentChanges = []
  let inFeatureSection = false
  
  for (const line of lines) {
    // Détecter une nouvelle version (## [1.0.0] - 2025-01-01)
    const versionMatch = line.match(/^## \[([^\]]+)\](?:\s*-\s*(.+))?/)
    if (versionMatch) {
      // Sauvegarder la version précédente
      if (currentVersion) {
        versions.push({
          version: currentVersion.version,
          date: currentVersion.date,
          changes: currentChanges
        })
      }
      
      // Commencer une nouvelle version
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2] || ''
      }
      currentChanges = []
      inFeatureSection = false
      continue
    }
    
    // Détecter les sections de fonctionnalités
    if (line.includes('### ✨') || line.includes('### New Features') || line.includes('### Nouvelles fonctionnalités')) {
      inFeatureSection = true
      continue
    }
    
    // Détecter la fin d'une section (nouvelle section ou fin de version)
    if (line.startsWith('### ') && !line.includes('✨') && !line.includes('New Features') && !line.includes('Nouvelles fonctionnalités')) {
      inFeatureSection = false
      continue
    }
    
    // Détecter la fin d'une version (---)
    if (line.trim() === '---') {
      inFeatureSection = false
      continue
    }
    
    // Détecter les changements (- feat: ...) seulement dans les sections de fonctionnalités
    const changeMatch = line.match(/^-\s*(.+)/)
    if (changeMatch && currentVersion && inFeatureSection) {
      const commit = changeMatch[1]
      const translated = await translateCommit(commit)
      
      // Filtrer les commits techniques
      const technicalKeywords = ['chore:', 'refactor:', 'build:', 'ci:', 'deps:', 'dependencies']
      const isTechnical = technicalKeywords.some(keyword => commit.toLowerCase().startsWith(keyword))
      
      if (!isTechnical) {
        currentChanges.push({
          id: `${currentVersion.version}-${currentChanges.length}`,
          emoji: translated.emoji,
          description: translated.description
        })
      }
    }
  }
  
  // Ajouter la dernière version
  if (currentVersion) {
    versions.push({
      version: currentVersion.version,
      date: currentVersion.date,
      changes: currentChanges
    })
  }
  
  return versions
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
