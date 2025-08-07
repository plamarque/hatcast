<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeModal">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl" @click.stop>
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-3xl">👤</span>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">{{ player?.name }}</h2>
        <p class="text-xl text-purple-300">Détails du joueur</p>
      </div>
      
      <!-- Statistiques du joueur -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">📊 Statistiques</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
            <div class="text-2xl font-bold text-white">{{ props.stats.availability }}</div>
            <div class="text-sm text-gray-300">Disponibilités</div>
          </div>
          <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30">
            <div class="text-2xl font-bold text-white">{{ props.stats.selection }}</div>
            <div class="text-sm text-gray-300">Sélections</div>
          </div>
        </div>
        <div class="mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
          <div class="text-xl font-bold text-white">{{ props.stats.ratio }}%</div>
          <div class="text-sm text-gray-300">Taux de sélection</div>
        </div>
      </div>
      

      
      <!-- Actions -->
      <div class="flex justify-center space-x-3">
        <button 
          @click="startEditing"
          class="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Modifier</span>
        </button>
        <button 
          @click="handleDelete"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"
        >
          <span>🗑️</span>
          <span>Supprimer</span>
        </button>
        <button 
          @click="closeModal"
          class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>

  <!-- Modal d'édition du nom -->
  <div v-if="editing" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-white text-center">✏️ Modifier le joueur</h2>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nom</label>
        <input
          v-model="editingName"
          type="text"
          class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
          @keydown.esc="cancelEdit"
          @keydown.enter="saveEdit"
          ref="editNameInput"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button
          @click="cancelEdit"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="saveEdit"
          class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  player: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: () => ({ availability: 0, selection: 0, ratio: 0 })
  },

})

const emit = defineEmits(['close', 'update', 'delete'])

const editing = ref(false)
const editingName = ref('')
const editNameInput = ref(null)





// Fonctions de gestion
function closeModal() {
  emit('close')
}

function startEditing() {
  editingName.value = props.player?.name || ''
  editing.value = true
  nextTick(() => {
    if (editNameInput.value) {
      editNameInput.value.focus()
    }
  })
}

function cancelEdit() {
  editing.value = false
  editingName.value = ''
}

function saveEdit() {
  if (!editingName.value.trim()) return
  
  emit('update', {
    playerId: props.player?.id,
    newName: editingName.value.trim()
  })
  
  editing.value = false
  editingName.value = ''
}

function handleDelete() {
  emit('delete', props.player?.id)
}

// Réinitialiser l'édition quand la modal se ferme
watch(() => props.show, (newValue) => {
  if (!newValue) {
    editing.value = false
    editingName.value = ''
  }
})
</script>
