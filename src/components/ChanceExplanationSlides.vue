<template>
  <div class="chance-explanation-slides">
    <!-- Texte explicatif -->
    <div class="text-gray-300 text-sm sm:text-xs mb-4 min-h-[60px]">
      <div v-if="currentSlide === 0" class="text-center">
        Pour tirer au sort parmi les <span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span> personnes disponibles, l'algorithme fait un peu comme si on mettait tous les noms sur un papier dans un sac et qu'on tirait au hasard...
      </div>
      <div v-if="currentSlide === 1" class="text-center">
        Si on faisait un tirage au sort simple, tout le monde aurait environ <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span>/<span class="text-green-400 font-semibold">{{ explanationData.availableCount }}</span> = <span class="text-yellow-400 font-semibold">{{ Math.round(explanationData.theoreticalSimpleChance) }}%</span> de chance d'être tiré au sort
      </div>
      <div v-if="currentSlide === 2" class="text-center">
        Mais par souci d'équité, on modifie la taille des bouts de papier en fonction du nombre de sélections passées.
      </div>
      <div v-if="currentSlide === 3" class="text-center">
        Les plus gros papiers ont plus de chances d'être tirés au hasard que les petits.
      </div>
      <div v-if="currentSlide === 4" class="text-center">
        On fait <span class="text-blue-400 font-semibold">{{ explanationData.requiredCount }}</span> tirage{{ explanationData.requiredCount > 1 ? 's' : '' }} dans le sac sans remettre les papiers tirés
      </div>
    </div>

    <!-- Zone image (slides statiques) -->
    <div class="relative bg-gray-800/50 rounded-lg p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] flex items-center justify-center mb-4 pb-2 sm:pb-4">
      <img
        :src="`/img/slide-${currentSlide + 1}.jpg`"
        :alt="`Explication algorithme, étape ${currentSlide + 1}`"
        class="chance-explanation-slide-img max-w-full max-h-[200px] sm:max-h-[300px] w-auto h-auto object-contain"
      />
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <!-- Bouton précédent -->
      <button
        @click="prevSlide"
        :disabled="currentSlide === 0"
        class="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        ← Précédent
      </button>

      <!-- Indicateurs de progression -->
      <div class="flex gap-2">
        <button
          v-for="(slide, index) in 5"
          :key="index"
          @click="goToSlide(index)"
          class="w-2 h-2 rounded-full transition-all"
          :class="currentSlide === index ? 'bg-blue-400 w-6' : 'bg-gray-600 hover:bg-gray-500'"
        />
      </div>

      <!-- Bouton suivant -->
      <button
        @click="nextSlide"
        :disabled="currentSlide === 4"
        class="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Suivant →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// explanationData: { availableCount, requiredCount, theoreticalSimpleChance } (minimal shape for slides text)
defineProps({
  explanationData: {
    type: Object,
    required: true
  },
  seasonId: {
    type: String,
    required: false,
    default: ''
  }
})

const currentSlide = ref(0)

function nextSlide() {
  if (currentSlide.value < 4) currentSlide.value++
}

function prevSlide() {
  if (currentSlide.value > 0) currentSlide.value--
}

function goToSlide(index) {
  currentSlide.value = index
}
</script>

<style scoped>
.chance-explanation-slide-img {
  max-width: 100%;
  object-fit: contain;
}
</style>

