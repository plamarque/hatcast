<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
    <div class="text-center max-w-md mx-auto">
      <!-- Icône 404 -->
      <div class="text-8xl mb-6">🔍</div>
      
      <!-- Titre -->
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
        Page introuvable
      </h1>
      
      <!-- Description -->
      <p class="text-gray-300 text-lg mb-8">
        Désolé, la page que vous recherchez n'existe pas ou vous n'avez pas les permissions pour y accéder.
      </p>
      
      <!-- Actions -->
      <div class="space-y-4">
        <button
          @click="goHome"
          class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          🏠 Retour à l'accueil
        </button>
        
        <button
          @click="goBack"
          class="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300"
        >
          ← Retour
        </button>
      </div>
      
      <!-- Code d'erreur -->
      <div class="mt-8 text-sm text-gray-500">
        Code d'erreur: 404
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>
