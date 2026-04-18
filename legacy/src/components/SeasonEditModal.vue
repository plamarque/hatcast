<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">✏️</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Modifier la saison</h2>
        <p class="text-gray-300">Modifiez les informations de la saison "{{ season?.name }}"</p>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom de la saison</label>
        <input
          v-model="localEditSeasonName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Ex: La Malice 2025-2026"
        >
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Description (optionnel)</label>
        <textarea
          v-model="localEditSeasonDescription"
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
              v-if="localEditSeasonLogoPreview" 
              :src="localEditSeasonLogoPreview" 
              :alt="`Logo de ${localEditSeasonName}`"
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
              {{ localEditSeasonLogo ? 'Changer le logo' : 'Ajouter un logo' }}
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
              v-if="localEditSeasonLogoPreview"
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
          @click="handleCancel"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="handleSave"
          class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { uploadImage, deleteImage, isFirebaseStorageUrl } from '../services/imageUpload.js'
import logger from '../services/logger.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  season: {
    type: Object,
    default: null
  },
  isConnected: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['save', 'cancel'])

// État local
const localEditSeasonName = ref('')
const localEditSeasonDescription = ref('')
const localEditSeasonLogo = ref(null)
const localEditSeasonLogoPreview = ref('')
const isLogoUploading = ref(false)
const isLogoDeleting = ref(false)
const logoFileInput = ref(null)

// Synchroniser avec les props
watch(() => props.season, (newSeason) => {
  if (newSeason) {
    localEditSeasonName.value = newSeason.name || ''
    localEditSeasonDescription.value = newSeason.description || ''
    localEditSeasonLogo.value = null
    localEditSeasonLogoPreview.value = newSeason.logoUrl || ''
  }
}, { immediate: true })

// Fonctions pour la gestion du logo (copiées exactement de SeasonsPage)
function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner un fichier image')
    return
  }
  
  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Le fichier est trop volumineux (max 5MB)')
    return
  }
  
  localEditSeasonLogo.value = file
  
  // Prévisualiser l'image
  const reader = new FileReader()
  reader.onload = (e) => {
    localEditSeasonLogoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function triggerLogoUpload() {
  logoFileInput.value?.click()
}

async function removeLogo() {
  if (!localEditSeasonLogoPreview.value) return
  
  try {
    isLogoDeleting.value = true
    
    // Si c'est un logo existant sur Firebase Storage, le supprimer
    if (props.season?.logoUrl && isFirebaseStorageUrl(props.season.logoUrl)) {
      await deleteImage(props.season.logoUrl)
      logger.info('Logo supprimé du storage')
    }
    
    // Réinitialiser la prévisualisation
    localEditSeasonLogoPreview.value = ''
    localEditSeasonLogo.value = null
    
    // Réinitialiser l'input file
    if (logoFileInput.value) {
      logoFileInput.value.value = ''
    }
    
  } catch (error) {
    logger.error('Erreur lors de la suppression du logo:', error)
    alert('Erreur lors de la suppression du logo')
  } finally {
    isLogoDeleting.value = false
  }
}

function handleSave() {
  const updates = {
    name: localEditSeasonName.value.trim(),
    description: localEditSeasonDescription.value.trim()
  }
  
  // Si un nouveau logo a été sélectionné, le passer aussi
  if (localEditSeasonLogo.value) {
    updates.logoFile = localEditSeasonLogo.value
    updates.logoPreview = localEditSeasonLogoPreview.value
  }
  
  emit('save', updates)
}

function handleCancel() {
  // Réinitialiser les valeurs
  localEditSeasonName.value = props.season?.name || ''
  localEditSeasonDescription.value = props.season?.description || ''
  localEditSeasonLogo.value = null
  localEditSeasonLogoPreview.value = props.season?.logoUrl || ''
  
  emit('cancel')
}
</script>
