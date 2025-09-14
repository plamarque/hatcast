<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✨ Nouvelle saison</h2>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom de la saison</label>
        <input
          v-model="seasonName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Ex: La Malice 2025-2026"
          @input="generateSlug"
        >
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
        <input
          v-model="seasonSlug"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Ex: malice-2025-2026"
        >
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Description (optionnel)</label>
        <textarea
          v-model="seasonDescription"
          rows="3"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
          placeholder="Ex: Saison 2025-2026 de la troupe d'improvisation La Malice"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">Une brève description de votre saison</p>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Code PIN (4 chiffres)</label>
        <input
          v-model="seasonPin"
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
          @click="handleCancel"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="handleCreate"
          :disabled="!seasonName.trim() || !seasonSlug.trim() || !seasonPin.trim() || seasonPin.length !== 4"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span v-if="isSubmitting">Création...</span>
          <span v-else>Créer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { addSeason } from '../services/seasons.js'
import seasonRoleService from '../services/seasonRoleService.js'
import { currentUser } from '../services/authState.js'
import logger from '../services/logger.js'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'season-created'])

// Variables réactives
const seasonName = ref('')
const seasonSlug = ref('')
const seasonDescription = ref('')
const seasonPin = ref('')
const isSubmitting = ref(false)

// Génération automatique du slug
function generateSlug() {
  if (seasonName.value) {
    seasonSlug.value = seasonName.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

// Validation du PIN
function validatePin() {
  // Garder seulement les chiffres
  seasonPin.value = seasonPin.value.replace(/[^0-9]/g, '')
  // Limiter à 4 chiffres
  if (seasonPin.value.length > 4) {
    seasonPin.value = seasonPin.value.slice(0, 4)
  }
}

// Gérer l'annulation
function handleCancel() {
  resetForm()
  emit('close')
}

// Réinitialiser le formulaire
function resetForm() {
  seasonName.value = ''
  seasonSlug.value = ''
  seasonDescription.value = ''
  seasonPin.value = ''
}

// Gérer la création
async function handleCreate() {
  if (!seasonName.value.trim() || !seasonSlug.value.trim() || !seasonPin.value.trim()) {
    alert('Veuillez remplir tous les champs, y compris le code PIN à 4 chiffres')
    return
  }

  if (seasonPin.value.length !== 4) {
    alert('Le code PIN doit contenir exactement 4 chiffres')
    return
  }

  try {
    isSubmitting.value = true
    
    // Créer la saison
    const seasonId = await addSeason(
      seasonName.value.trim(), 
      seasonSlug.value.trim(), 
      seasonPin.value.trim(),
      seasonDescription.value.trim(),
      ''  // Pas de logo à la création
    )
    
    logger.info('Saison créée avec succès', { 
      seasonId,
      name: seasonName.value.trim(), 
      slug: seasonSlug.value.trim() 
    })
    
    // Initialiser les rôles avec le créateur comme admin
    if (currentUser.value?.email && seasonId) {
      await seasonRoleService.initializeSeasonRoles(seasonId, currentUser.value.email)
      logger.info('Rôles initialisés avec le créateur comme admin', {
        seasonId,
        creatorEmail: currentUser.value.email
      })
    } else {
      logger.warn('Impossible d\'initialiser les rôles: utilisateur non connecté ou ID de saison manquant', {
        hasUser: !!currentUser.value,
        hasEmail: !!currentUser.value?.email,
        seasonId
      })
    }
    
    // Émettre l'événement avec la nouvelle saison
    emit('season-created', {
      id: seasonId,
      name: seasonName.value.trim(),
      slug: seasonSlug.value.trim(),
      description: seasonDescription.value.trim(),
      pin: seasonPin.value.trim()
    })
    
    // Réinitialiser le formulaire
    resetForm()
    
  } catch (error) {
    logger.error('Erreur lors de la création de la saison', error)
    alert('Erreur lors de la création de la saison. Veuillez réessayer.')
  } finally {
    isSubmitting.value = false
  }
}

// Watcher pour réinitialiser le formulaire quand la modale se ferme
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>
