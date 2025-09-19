<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 safe-area-all">
    <div class="text-center py-12 px-4">
      <h1 class="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        {{ seasonName || 'Rejoindre la saison' }}
      </h1>
      <p class="text-gray-300">Inscrivez-vous pour indiquer vos disponibilités aux événements</p>
    </div>

    <div class="container mx-auto px-4 pb-16">
      <div class="max-w-xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-6 text-center">Je rejoins la saison</h2>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Votre nom</label>
            <input
              v-model="playerName"
              type="text"
              class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Ex: Marie Dupont"
              @keydown.enter.prevent="submit"
            >
          </div>

          

          <div class="flex items-center justify-end gap-3 pt-2">
            <button @click="goToSeason" class="px-5 py-3 text-gray-300 hover:text-white transition-colors">Annuler</button>
            <button
              :disabled="!playerName.trim() || isSubmitting"
              @click="submit"
              class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
            >
              Rejoindre
            </button>
          </div>
        </div>

        <div v-if="feedback" class="mt-6 text-sm text-gray-200">
          {{ feedback }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import firestoreService from '../services/firestoreService.js'
import { addPlayer } from '../services/storage.js'
import logger from '../services/logger.js'

const route = useRoute()
const router = useRouter()

const seasonSlug = route.params.slug
const seasonId = ref('')
const seasonName = ref('')

const playerName = ref('')
const isSubmitting = ref(false)
const feedback = ref('')

onMounted(async () => {
  // Charger la saison par slug via firestoreService
  const seasons = await firestoreService.queryDocuments('seasons', [
    firestoreService.where('slug', '==', seasonSlug)
  ])
  if (seasons.length > 0) {
    const seasonDoc = seasons[0]
    seasonId.value = seasonDoc.id
    seasonName.value = seasonDoc.name
    document.title = `Rejoindre : ${seasonName.value}`
  } else {
    feedback.value = 'Saison introuvable'
  }
})

function goToSeason() {
  router.push(`/season/${seasonSlug}`)
}

async function submit() {
  if (!playerName.value.trim() || !seasonId.value) return
  isSubmitting.value = true
  feedback.value = ''
  try {
    await addPlayer(playerName.value.trim(), seasonId.value)
    feedback.value = 'Inscription réussie. Vous pouvez maintenant indiquer vos disponibilités.'

    // Déclencher le mini-tutoriel "joueur" sur la grille pour cette saison
    try {
      localStorage.setItem(`startPlayerTour:${seasonId.value}`, '1')
      // Masquer l'onboarding créateur pour cet utilisateur
      localStorage.setItem(`dismissCreatorOnboarding:${seasonId.value}`, '1')
    } catch {}

    // Redirection douce après un court délai
    setTimeout(() => {
      goToSeason()
    }, 600)
  } catch (err) {
    logger.error('Erreur inscription', err)
    feedback.value = `Erreur lors de l'inscription: ${err?.message || 'Veuillez réessayer'}`
  } finally {
    isSubmitting.value = false
  }
}
</script>


