<template>
  <div class="container mx-auto py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Saisons</h1>
      <button 
        @click="showCreateModal = true"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Nouvelle saison
      </button>
    </div>
    
    <div class="flex flex-wrap gap-6 justify-center">
      <div
        v-for="season in seasons"
        :key="season.id"
        class="bg-white shadow-lg rounded-lg p-6 w-64 cursor-pointer hover:shadow-xl transition relative"
      >
        <div @click="goToSeason(season.slug)">
          <h2 class="text-xl font-semibold mb-2 text-center">{{ season.name }}</h2>
          <p class="text-gray-500 text-center">Slug : {{ season.slug }}</p>
        </div>
        <button 
          @click.stop="confirmDeleteSeason(season)"
          class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
          title="Supprimer cette saison"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- Modal de création de saison -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Nouvelle saison</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la saison</label>
          <input
            v-model="newSeasonName"
            type="text"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: La Malice 2025-2026"
            @input="generateSlug"
          >
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <input
            v-model="newSeasonSlug"
            type="text"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: malice-2025-2026"
          >
        </div>
        <div class="flex justify-end space-x-2">
          <button
            @click="cancelCreate"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            @click="createSeason"
            :disabled="!newSeasonName.trim() || !newSeasonSlug.trim()"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Créer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Confirmation</h2>
        <p class="mb-4">Êtes-vous sûr de vouloir supprimer la saison "{{ seasonToDelete?.name }}" ?</p>
        <p class="mb-4 text-sm text-red-600">Cette action est irréversible et supprimera toutes les données de cette saison.</p>
        <div class="flex justify-end space-x-2">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            @click="deleteSeasonConfirmed"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSeasons, addSeason, deleteSeason } from './services/seasons.js'
import { useRouter } from 'vue-router'

const seasons = ref([])
const router = useRouter()

// État des modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const newSeasonName = ref('')
const newSeasonSlug = ref('')
const seasonToDelete = ref(null)

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

// Création de saison
async function createSeason() {
  if (!newSeasonName.value.trim() || !newSeasonSlug.value.trim()) return

  try {
    await addSeason(newSeasonName.value.trim(), newSeasonSlug.value.trim())
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
}

// Suppression de saison
function confirmDeleteSeason(season) {
  seasonToDelete.value = season
  showDeleteModal.value = true
}

async function deleteSeasonConfirmed() {
  if (!seasonToDelete.value) return

  try {
    await deleteSeason(seasonToDelete.value.id)
    seasons.value = await getSeasons() // Recharger la liste
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
</script>
