<template>
  <footer class="bg-gray-900/95 border-t border-white/10 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        
        <!-- Section gauche : HatCast, Aide, Contact, Copyright -->
        <div class="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-300">
          <div class="flex items-center gap-2">
            <span class="text-white font-medium">HatCast</span>
          </div>
          
          <div class="flex items-center gap-4">
            <button 
              @click="$emit('open-help')" 
              class="text-gray-300 hover:text-white transition-colors"
            >
              Aide
            </button>
            <a 
              href="mailto:impropick@gmail.com" 
              class="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
          
          <div class="flex items-center gap-2">
            <span>&copy; 2025</span>
          </div>
        </div>

        <!-- Section droite : GitHub, License MIT, Version -->
        <div class="flex items-center gap-4 text-sm text-gray-300">
          <a 
            href="https://github.com/plamarque/hatcast" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-gray-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span class="text-gray-400">•</span>
          <span>Licence MIT</span>
          <span class="text-gray-400">•</span>
          <span>v{{ appVersion }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Émettre les événements
const emit = defineEmits(['open-help'])

// Version de l'application
const appVersion = ref('1.0.0')

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
