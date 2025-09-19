<template>
  <footer class="bg-gray-900 border-t border-white/10 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-[50]">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Mobile: Layout en 2 lignes pour réduire la hauteur -->
      <div class="block md:hidden">
        <div class="flex flex-wrap justify-center items-center gap-1 text-xs text-gray-300">
          <!-- Ligne 1: HatCast + Aide + Contact + Copyright -->
          <span class="text-white font-medium">HatCast</span>
          <span class="text-gray-500">•</span>
          <button 
            @click="$emit('open-help')" 
            class="text-gray-300 hover:text-white transition-colors"
          >
            Aide
          </button>
          <span class="text-gray-500">•</span>
          <a 
            href="mailto:impropick@gmail.com" 
            class="text-gray-300 hover:text-white transition-colors"
          >
            Contact
          </a>
          <span class="text-gray-500">•</span>
          <span>&copy; 2025</span>
        </div>
        <div class="flex flex-wrap justify-center items-center gap-1 text-xs text-gray-300 mt-1">
          <!-- Ligne 2: GitHub + Licence + Version + Badge environnement -->
          <a 
            href="https://github.com/plamarque/hatcast" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span class="text-gray-500">•</span>
          <span>Licence MIT</span>
          <span class="text-gray-500">•</span>
          <button 
            @click="showChangelog = true"
            class="text-gray-300 hover:text-white transition-colors cursor-pointer"
            :title="`Voir les nouveautés de la version ${appVersion}`"
          >
            v{{ appVersion }}
          </button>
          <span 
            v-if="environment !== 'production'"
            class="px-2 py-1 text-xs font-medium rounded ml-1"
            :class="environmentBadgeClass"
          >
            {{ getEnvironmentAbbreviation(environment) }}
          </span>
        </div>
      </div>
      
      <!-- Desktop: Layout original en une ligne -->
      <div class="hidden md:block">
        <div class="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-300">
          <!-- HatCast -->
          <span class="text-white font-medium">HatCast</span>
          
          <!-- Aide -->
          <button 
            @click="$emit('open-help')" 
            class="text-gray-300 hover:text-white transition-colors"
          >
            Aide
          </button>
          
          <!-- Contact -->
          <a 
            href="mailto:impropick@gmail.com" 
            class="text-gray-300 hover:text-white transition-colors"
          >
            Contact
          </a>
          
          <!-- Copyright -->
          <span>&copy; 2025</span>
          
          <!-- GitHub -->
          <a 
            href="https://github.com/plamarque/hatcast" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          
          <!-- Licence MIT -->
          <span>Licence MIT</span>
          
          <!-- Version -->
          <button 
            @click="showChangelog = true"
            class="text-gray-300 hover:text-white transition-colors cursor-pointer"
            :title="`Voir les nouveautés de la version ${appVersion}`"
          >
            v{{ appVersion }}
          </button>
          
          <!-- Badge environnement -->
          <span 
            v-if="environment !== 'production'"
            class="px-2 py-1 text-xs font-medium rounded"
            :class="environmentBadgeClass"
          >
            {{ getEnvironmentAbbreviation(environment) }}
          </span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Modal du changelog -->
  <ChangelogModal 
    :show="showChangelog" 
    @close="showChangelog = false" 
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ChangelogModal from './ChangelogModal.vue'
import configService from '../services/configService.js'

// Émettre les événements
const emit = defineEmits(['open-help'])

// Version de l'application
const appVersion = ref('1.0.0')

// État de la modal changelog
const showChangelog = ref(false)

// Environnement
const environment = ref('production')

// Classes CSS pour le badge environnement
const environmentBadgeClass = computed(() => {
  switch (environment.value) {
    case 'development':
      return 'bg-red-600 text-white'
    case 'staging':
      return 'bg-yellow-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
})

// Fonction pour obtenir l'abréviation de l'environnement
const getEnvironmentAbbreviation = (env) => {
  switch (env) {
    case 'development':
      return 'DEV'
    case 'staging':
      return 'STG'
    default:
      return env.toUpperCase()
  }
}

// Charger la version depuis le fichier version.txt
onMounted(async () => {
  try {
    // Détecter l'environnement
    environment.value = configService.getEnvironment()
    
    const response = await fetch('/version.txt')
    if (response.ok) {
      const content = await response.text()
      // Extraire la première ligne (version)
      const version = content.split('\n')[0]
      if (version) {
        appVersion.value = version
      }
    }
  } catch (error) {
    // En cas d'erreur, garder la version par défaut
    console.debug('Could not load version from version.txt:', error)
  }
})

</script>
