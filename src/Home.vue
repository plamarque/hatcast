<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6 text-center">Saisons</h1>
    <div class="flex flex-wrap gap-6 justify-center">
      <div
        v-for="season in seasons"
        :key="season.id"
        class="bg-white shadow-lg rounded-lg p-6 w-64 cursor-pointer hover:shadow-xl transition"
        @click="goToSeason(season.slug)"
      >
        <h2 class="text-xl font-semibold mb-2 text-center">{{ season.name }}</h2>
        <p class="text-gray-500 text-center">Slug : {{ season.slug }}</p>
      </div>
    </div>
    <!-- Création de saison et suppression à venir -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSeasons } from './services/seasons.js'
import { useRouter } from 'vue-router'

const seasons = ref([])
const router = useRouter()

onMounted(async () => {
  seasons.value = await getSeasons()
  console.log('Saisons chargées:', seasons.value)
})

function goToSeason(slug) {
  router.push(`/season/${slug}`)
}
</script>
