<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header de saison partagé -->
    <SeasonHeader 
      :season-name="seasonName"
      :is-scrolled="false"
      :season-slug="seasonSlug"
      :is-connected="!!currentUser?.email"
      @go-back="goBack"
      @open-account-menu="openAccountMenu"
      @open-help="openHelp"
      @open-preferences="openPreferences"
      @open-players="openPlayers"
      @logout="handleLogout"
      @open-login="openAccount"
      @open-account="openAccount"
      @open-account-creation="openAccountCreation"
      @open-development="openDevelopment"
    />

    <!-- Contenu principal -->
    <div class="pt-24 pb-16 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- En-tête de la page -->
        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
            🛡️ Administration de la saison
          </h1>
          <p class="text-gray-300 text-lg">
            Gérer les rôles et permissions pour <span class="text-purple-300 font-semibold">{{ seasonName }}</span>
          </p>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xl">⚠️</span>
              <p class="text-red-200">{{ errorMessage }}</p>
            </div>
            <button 
              @click="errorMessage = ''"
              class="text-red-400 hover:text-red-300 text-lg"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Interface de gestion des rôles -->
        <div class="space-y-8">
          <!-- Section Admins de saison -->
          <div class="bg-gray-800/50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-2xl font-bold text-white mb-2">👑 Admins de saison</h2>
                <p class="text-gray-300">
                  Les admins peuvent créer, modifier et supprimer des événements
                </p>
              </div>
              <button
                @click="showAddAdminModal = true"
                class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ➕ Ajouter un admin
              </button>
            </div>

            <!-- Liste des admins -->
            <div v-if="seasonAdmins.length === 0" class="text-center py-8 text-gray-400">
              <span class="text-4xl mb-3 block">👥</span>
              <p>Aucun admin configuré pour cette saison</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="admin in seasonAdmins"
                :key="admin"
                class="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">👑</span>
                  <div>
                    <p class="text-white font-medium">{{ admin }}</p>
                    <p class="text-sm text-gray-400">Admin de saison</p>
                  </div>
                </div>
                <button
                  @click="removeAdmin(admin)"
                  class="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  :disabled="isLoading"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>

          <!-- Section Utilisateurs de saison -->
          <div class="bg-gray-800/50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-2xl font-bold text-white mb-2">👤 Utilisateurs de saison</h2>
                <p class="text-gray-300">
                  Les utilisateurs peuvent participer aux événements
                </p>
              </div>
              <button
                @click="showAddUserModal = true"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ➕ Ajouter un utilisateur
              </button>
            </div>

            <!-- Liste des utilisateurs -->
            <div v-if="seasonUsers.length === 0" class="text-center py-8 text-gray-400">
              <span class="text-4xl mb-3 block">👥</span>
              <p>Aucun utilisateur configuré pour cette saison</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="user in seasonUsers"
                :key="user"
                class="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">👤</span>
                  <div>
                    <p class="text-white font-medium">{{ user }}</p>
                    <p class="text-sm text-gray-400">Utilisateur de saison</p>
                  </div>
                </div>
                <button
                  @click="removeUser(user)"
                  class="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  :disabled="isLoading"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>

          <!-- Informations de la saison -->
          <div class="bg-gray-800/50 rounded-lg p-6">
            <h2 class="text-2xl font-bold text-white mb-4">📊 Informations de la saison</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-700/50 rounded-lg p-4">
                <div class="text-2xl font-bold text-purple-300">{{ seasonAdmins.length }}</div>
                <div class="text-sm text-gray-400">Admins</div>
              </div>
              <div class="bg-gray-700/50 rounded-lg p-4">
                <div class="text-2xl font-bold text-blue-300">{{ seasonUsers.length }}</div>
                <div class="text-sm text-gray-400">Utilisateurs</div>
              </div>
              <div class="bg-gray-700/50 rounded-lg p-4">
                <div class="text-2xl font-bold text-green-300">{{ totalMembers }}</div>
                <div class="text-sm text-gray-400">Total membres</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ModalManager
      :show-account-login="showAccountLogin"
      :show-account-creation="showAccountCreation"
      :show-account-menu="showAccountMenu"
      :show-preferences="showPreferences"
      :show-players="showPlayers"
      :show-development-modal="showDevelopmentModal"
      @post-login-navigation="handlePostLoginNavigation"
      @account-created="handlePostLoginNavigation"
      @open-help="() => {}"
      @logout="handleLogout"
      @close-account-login="showAccountLogin = false"
      @close-account-creation="showAccountCreation = false"
      @close-account-menu="showAccountMenu = false"
      @close-preferences="showPreferences = false"
      @close-players="showPlayers = false"
      @close-development-modal="showDevelopmentModal = false"
    />

    <!-- Modal d'ajout d'admin -->
    <div
      v-if="showAddAdminModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddAdminModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Ajouter un admin</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              v-model="newAdminEmail"
              type="email"
              placeholder="admin@example.com"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="addAdmin"
              :disabled="!newAdminEmail || isLoading"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Ajout...' : 'Ajouter' }}
            </button>
            <button
              @click="showAddAdminModal = false"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout d'utilisateur -->
    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddUserModal = false"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Ajouter un utilisateur</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              v-model="newUserEmail"
              type="email"
              placeholder="user@example.com"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="addUser"
              :disabled="!newUserEmail || isLoading"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Ajout...' : 'Ajouter' }}
            </button>
            <button
              @click="showAddUserModal = false"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFirebaseAuth } from '../services/firebase.js'
import { currentUser } from '../services/authState.js'
import { signOut } from 'firebase/auth'
import roleService from '../services/roleService.js'
import seasonRoleService from '../services/seasonRoleService.js'
import logger from '../services/logger.js'
import SeasonHeader from '../components/SeasonHeader.vue'
import ModalManager from '../components/ModalManager.vue'

// Props et route
const router = useRouter()
const route = useRoute()
const seasonSlug = computed(() => route.params.slug)
const seasonId = ref(null)
const seasonName = ref('')

// État d'authentification
const auth = getFirebaseAuth()

// Modales
const showAccountLogin = ref(false)
const showAccountCreation = ref(false)
const showAccountMenu = ref(false)
const showPreferences = ref(false)
const showPlayers = ref(false)
const showDevelopmentModal = ref(false)

// Gestion des rôles
const seasonAdmins = ref([])
const seasonUsers = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// Modales d'ajout
const showAddAdminModal = ref(false)
const showAddUserModal = ref(false)
const newAdminEmail = ref('')
const newUserEmail = ref('')

// Computed
const totalMembers = computed(() => seasonAdmins.value.length + seasonUsers.value.length)

// Fonctions de navigation
function goBack() {
  router.push(`/season/${seasonSlug.value}`)
}

function openAccountMenu() {
  showAccountMenu.value = true
}

function openHelp() {
  // TODO: Implémenter l'aide
}

function openPreferences() {
  showPreferences.value = true
}

function openPlayers() {
  showPlayers.value = true
}

function openAccount() {
  showAccountLogin.value = true
}

function openAccountCreation() {
  showAccountCreation.value = true
}

function openDevelopment() {
  showDevelopmentModal.value = true
}

async function handleLogout() {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    logger.error('Erreur lors de la déconnexion:', error)
  }
}

function handlePostLoginNavigation() {
  // Rediriger vers la page admin après connexion
  router.push(`/season/${seasonSlug.value}/admin`)
}

// Fonctions de gestion des rôles

async function loadSeasonRoles() {
  try {
    isLoading.value = true
    const roles = await seasonRoleService.listSeasonRoles(seasonId.value)
    seasonAdmins.value = roles.admins
    seasonUsers.value = roles.users
  } catch (error) {
    logger.error('Erreur lors du chargement des rôles:', error)
  } finally {
    isLoading.value = false
  }
}

async function addAdmin() {
  if (!newAdminEmail.value.trim()) return
  
  try {
    isLoading.value = true
    errorMessage.value = '' // Effacer les erreurs précédentes
    
    await seasonRoleService.addSeasonAdmin(seasonId.value, newAdminEmail.value.trim(), currentUser.value?.email)
    await loadSeasonRoles()
    
    const email = newAdminEmail.value.trim()
    newAdminEmail.value = ''
    showAddAdminModal.value = false
    
    logger.info(`✅ Admin ${email} ajouté avec succès`)
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de l\'admin:', error)
    
    // Afficher un message d'erreur utilisateur
    if (error.code === 'not-found') {
      errorMessage.value = 'Erreur : La saison n\'existe pas dans la base de données. Veuillez réessayer.'
    } else if (error.code === 'permission-denied') {
      errorMessage.value = 'Erreur : Vous n\'avez pas les permissions pour effectuer cette action.'
    } else {
      errorMessage.value = `Erreur lors de l'ajout de l'admin : ${error.message || 'Erreur inconnue'}`
    }
  } finally {
    isLoading.value = false
  }
}

async function removeAdmin(adminEmail) {
  if (!confirm(`Êtes-vous sûr de vouloir retirer ${adminEmail} des admins ?`)) return
  
  try {
    isLoading.value = true
    await seasonRoleService.removeSeasonAdmin(seasonId.value, adminEmail, currentUser.value?.email)
    await loadSeasonRoles()
    logger.info(`Admin ${adminEmail} retiré avec succès`)
  } catch (error) {
    logger.error('Erreur lors du retrait de l\'admin:', error)
  } finally {
    isLoading.value = false
  }
}

async function addUser() {
  if (!newUserEmail.value.trim()) return
  
  try {
    isLoading.value = true
    await seasonRoleService.addSeasonUser(seasonId.value, newUserEmail.value.trim(), currentUser.value?.email)
    await loadSeasonRoles()
    newUserEmail.value = ''
    showAddUserModal.value = false
    logger.info(`Utilisateur ${newUserEmail.value} ajouté avec succès`)
  } catch (error) {
    logger.error('Erreur lors de l\'ajout de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

async function removeUser(userEmail) {
  if (!confirm(`Êtes-vous sûr de vouloir retirer ${userEmail} des utilisateurs ?`)) return
  
  try {
    isLoading.value = true
    await seasonRoleService.removeSeasonUser(seasonId.value, userEmail, currentUser.value?.email)
    await loadSeasonRoles()
    logger.info(`Utilisateur ${userEmail} retiré avec succès`)
  } catch (error) {
    logger.error('Erreur lors du retrait de l\'utilisateur:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialisation
onMounted(async () => {
  // Récupérer l'ID de la saison depuis l'URL
  const slug = route.params.slug
  logger.info('🛡️ SeasonAdminPage: Initialisation avec slug:', slug)
  
  // Pour l'instant, utiliser le slug comme ID (à améliorer plus tard)
  seasonId.value = slug
  seasonName.value = `Saison ${slug}`
  
  // Charger les rôles (les permissions sont déjà vérifiées par le routeur)
  await loadSeasonRoles()
})
</script>
