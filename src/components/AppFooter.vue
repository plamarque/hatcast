<template>
  <footer class="bg-gray-900/95 border-t border-white/10 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-sm text-gray-300">
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
import { ref, onMounted } from 'vue'
import ChangelogModal from './ChangelogModal.vue'

// Émettre les événements
const emit = defineEmits(['open-help'])

// Version de l'application
const appVersion = ref('1.0.0')

// État de la modal changelog
const showChangelog = ref(false)

// Charger la version depuis le fichier version.txt
onMounted(async () => {
  try {
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
