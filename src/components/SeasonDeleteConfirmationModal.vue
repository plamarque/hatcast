<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl">⚠️</span>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2>
        <p class="text-gray-300">Êtes-vous sûr de vouloir supprimer la saison "{{ season?.name }}" ?</p>
      </div>
      <p class="mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
        ⚠️ Cette action est irréversible et supprimera :<br>
        • Tous les événements<br>
        • Toutes les disponibilités<br>
        • Tous les joueurs<br>
        • Le logo de la saison
      </p>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          @click="$emit('confirm')"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  season: {
    type: Object,
    default: null
  }
})

defineEmits(['confirm', 'cancel'])
</script>
