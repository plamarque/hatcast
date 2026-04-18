<template>
  <div 
    class="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 w-full max-w-sm"
    :class="{ 'cursor-pointer hover:scale-105': clickable }"
    @click="handleClick"
  >
    <div class="text-center">
      <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg overflow-hidden">
        <img 
          v-if="season.logoUrl" 
          :src="season.logoUrl" 
          :alt="`Logo de ${season.name}`"
          class="w-full h-full object-cover"
        >
        <span v-else class="text-2xl">🎭</span>
      </div>
      <h2 class="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
        {{ season.name }}
      </h2>
      <p v-if="season.description" class="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
        {{ season.description }}
      </p>
      <p v-else class="text-gray-400 italic text-sm mb-4">Aucune description définie</p>
      <div class="w-full bg-gradient-to-br from-transparent via-white/20 to-transparent h-px mb-4"></div>
      
      <!-- Statistiques de la saison -->
      <div class="flex justify-center gap-6 text-sm mb-6">
        <div class="text-center">
          <div class="text-white font-semibold">{{ season.eventsCount || 0 }}</div>
          <div class="text-gray-400 text-xs">Événements</div>
        </div>
        <div class="text-center">
          <div class="text-white font-semibold">{{ season.playersCount || 0 }}</div>
          <div class="text-gray-400 text-xs">Participants</div>
        </div>
        <div class="text-center" v-if="showAvailabilities">
          <div class="text-white font-semibold">{{ season.availabilitiesCount || 0 }}</div>
          <div class="text-gray-400 text-xs">Disponibilités</div>
        </div>
      </div>

      <!-- Actions personnalisées -->
      <div v-if="$slots.actions" class="flex flex-wrap justify-center gap-3 mb-4">
        <slot name="actions"></slot>
      </div>

      <!-- ID de la saison -->
      <div class="mt-4 text-xs text-gray-400" v-if="showId">
        ID: {{ season.id || season.slug }}
      </div>
    </div>

    <!-- Menu 3 points (optionnel) -->
    <div v-if="showMenu" class="absolute top-4 right-4">
      <div class="relative" @click.stop>
        <button
          @click="toggleMenu"
          class="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          title="Options"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </button>
        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-44 bg-gray-900 border border-white/10 rounded-lg shadow-xl py-1 z-10"
          role="menu"
        >
          <slot name="menu-items"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  season: {
    type: Object,
    required: true
  },
  showAvailabilities: {
    type: Boolean,
    default: false
  },
  showId: {
    type: Boolean,
    default: true
  },
  showMenu: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['click', 'menu-toggle'])

// État local
const menuOpen = ref(false)

// Méthodes
function toggleMenu() {
  menuOpen.value = !menuOpen.value
  emit('menu-toggle', menuOpen.value)
}

function handleClick() {
  if (props.clickable) {
    emit('click', props.season)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
