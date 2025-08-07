<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- Header avec titre principal -->
    <div class="text-center py-16 px-4">
      <h1 class="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
        Sélections Spectacle
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Gérez facilement les sélections pour vos spectacles.
      </p>
    </div>

    <div class="container mx-auto px-4 pb-16">
      <!-- Bouton Nouvelle saison -->
      <div class="flex justify-center mb-12">
        <button 
          @click="showCreateModal = true"
          class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"
        >
          ✨ Nouvelle saison
        </button>
      </div>
      
      <!-- Grille des saisons -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div
          v-for="season in seasons"
          :key="season.id"
          class="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          <div @click="goToSeason(season.slug)" class="text-center">
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
          
          <!-- Bouton de suppression -->
          <button 
            @click.stop="confirmDeleteSeason(season)"
            class="absolute top-4 right-4 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Supprimer cette saison"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Message si aucune saison -->
      <div v-if="seasons.length === 0" class="text-center py-16">
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
      @submit="handlePinSubmit"
      @cancel="handlePinCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSeasons, addSeason, deleteSeason, verifySeasonPin } from './services/seasons.js'
import { useRouter } from 'vue-router'
import PinModal from './components/PinModal.vue'

const seasons = ref([])
const router = useRouter()

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

onMounted(async () => {
  seasons.value = await getSeasons()
  console.log('Saisons chargées:', seasons.value)
})

function goToSeason(slug) {
  router.push(`/season/${slug}`)
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
    cancelCreate()
  } catch (error) {
    console.error('Erreur lors de la création de la saison:', error)
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
  console.log('deleteSeasonConfirmed appelé avec seasonToDelete:', seasonToDelete.value)
  if (!seasonToDelete.value) {
    console.log('Aucune saison à supprimer')
    return
  }

  try {
    console.log('Suppression de la saison ID:', seasonToDelete.value.id)
    await deleteSeason(seasonToDelete.value.id)
    console.log('Saison supprimée, rechargement de la liste...')
    seasons.value = await getSeasons() // Recharger la liste
    console.log('Nouvelle liste des saisons:', seasons.value)
    cancelDelete()
  } catch (error) {
    console.error('Erreur lors de la suppression de la saison:', error)
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
  pendingOperation.value = operation
  showPinModal.value = true
}

async function handlePinSubmit(pinCode) {
  console.log('PIN soumis:', pinCode, 'pour l\'opération:', pendingOperation.value)
  try {
    const seasonId = pendingOperation.value?.data?.seasonId || seasonToDelete.value?.id
    const isValid = await verifySeasonPin(seasonId, pinCode)
    console.log('PIN valide:', isValid)
    
    if (isValid) {
      console.log('PIN correct, fermeture de la modal et exécution de l\'opération')
      showPinModal.value = false
      const operationToExecute = pendingOperation.value
      pendingOperation.value = null
      
      // Exécuter l'opération en attente
      console.log('Appel de executePendingOperation avec:', operationToExecute)
      await executePendingOperation(operationToExecute)
    } else {
      pinErrorMessage.value = 'Code PIN incorrect'
      // Réinitialiser le message d'erreur après 3 secondes
      setTimeout(() => {
        pinErrorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du PIN:', error)
    pinErrorMessage.value = 'Erreur lors de la vérification du code PIN'
  }
}

function handlePinCancel() {
  showPinModal.value = false
  pendingOperation.value = null
  pinErrorMessage.value = ''
}

async function executePendingOperation(operation) {
  console.log('executePendingOperation appelé avec:', operation)
  if (!operation) {
    console.log('Aucune opération à exécuter')
    return
  }
  
  const { type, data } = operation
  console.log('Exécution de l\'opération:', type, 'avec données:', data)
  
  try {
    switch (type) {
      case 'deleteSeason':
        console.log('Suppression de la saison ID:', data.seasonId)
        await deleteSeason(data.seasonId)
        console.log('Saison supprimée, rechargement de la liste...')
        seasons.value = await getSeasons() // Recharger la liste
        console.log('Nouvelle liste des saisons:', seasons.value)
        break
      default:
        console.log('Type d\'opération non reconnu:', type)
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'opération:', error)
    alert('Erreur lors de l\'opération. Veuillez réessayer.')
  }
}
</script>
