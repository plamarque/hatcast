<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1400] p-4" @click="$emit('close')">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col" @click.stop>
      <!-- Header (sticky) -->
      <div class="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 z-10">
        <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
          <span class="text-blue-400">🆕</span>
          Nouveautés
        </h3>
        <button @click="$emit('close')" class="text-white/80 hover:text-white text-xl">✖️</button>
      </div>

      <!-- Content (scrollable) -->
      <div class="flex-1 overflow-y-auto px-4 md:px-6">
        <div v-if="changelogLoading" class="text-gray-400 text-sm text-center py-8">
          Chargement des nouveautés...
        </div>
        <div v-else-if="changelogError" class="text-red-300 text-sm text-center py-8">
          ❌ Impossible de charger les nouveautés
        </div>
        <div v-else-if="userFriendlyChangelog.length === 0" class="text-gray-400 text-sm text-center py-8">
          Aucune nouveauté récente
        </div>
        <div v-else class="space-y-4 pb-4">
          <div v-for="version in userFriendlyChangelog" :key="version.version" class="space-y-3">
            <div class="flex items-center gap-2 pb-2 border-b border-white/10">
              <span class="text-white font-semibold text-lg">Version {{ version.version }}</span>
              <span class="text-gray-500 text-sm">{{ version.date }}</span>
            </div>
            <div class="space-y-2">
              <div v-for="change in version.changes" :key="change.id" class="text-sm text-gray-300 flex items-start gap-2">
                <span class="text-blue-300 text-lg flex-shrink-0">{{ change.emoji }}</span>
                <span class="leading-relaxed">{{ change.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer (sticky) -->
      <div class="border-t border-white/10 p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-center">
        <button @click="$emit('close')" class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import logger from '../services/logger.js'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Changelog state
const changelogLoading = ref(false)
const changelogError = ref(false)
const userFriendlyChangelog = ref([])

// Charger le changelog quand la modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue) {
    loadChangelog()
  }
})

// Fonction pour charger le changelog (JSON pré-généré uniquement)
async function loadChangelog() {
  changelogLoading.value = true
  changelogError.value = false
  
  try {
    // Load pre-generated JSON (last 3 versions, ready to display)
    const response = await fetch('/changelog.json')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const versions = await response.json()
    logger.debug('Raw changelog data loaded:', versions)
    
    // Transform the data to match expected format
    const transformedVersions = versions.map(version => {
      logger.debug(`Processing version ${version.version}:`, version.changes)
      
      const transformedChanges = version.changes.map((change, index) => {
        // Extract emoji and description from the change string
        const emojiMatch = change.match(/^([^\s]+)\s(.+)$/)
        if (emojiMatch) {
          const emoji = emojiMatch[1]
          const description = emojiMatch[2]
          logger.debug(`Change ${index}: emoji="${emoji}", description="${description}"`)
          return { id: `${version.version}-${index}`, emoji, description }
        } else {
          logger.debug(`Change ${index}: no emoji found, using as description: "${change}"`)
          return { id: `${version.version}-${index}`, emoji: '📝', description: change }
        }
      })
      
      return {
        version: version.version,
        date: version.date,
        changes: transformedChanges
      }
    })
    
    // Sort versions by version number (descending) as final safety barrier
    const sortedVersions = transformedVersions.sort((a, b) => {
      const versionA = a.version.split('.').map(Number)
      const versionB = b.version.split('.').map(Number)
      
      // Compare major, minor, patch in order
      for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0
        const numB = versionB[i] || 0
        if (numA !== numB) {
          return numB - numA // Descending order (newest first)
        }
      }
      return 0
    })
    
    logger.debug('Sorted changelog data:', sortedVersions)
    userFriendlyChangelog.value = sortedVersions
    
  } catch (error) {
    logger.debug('Could not load changelog:', error)
    changelogError.value = true
    userFriendlyChangelog.value = []
  } finally {
    changelogLoading.value = false
  }
}
</script>
