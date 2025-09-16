<template>
  <div 
    :class="containerClass"
    class="relative overflow-hidden flex items-center justify-center"
  >
    <!-- User Avatar (if player is associated) -->
    <img 
      v-if="userPhotoURL && imageLoaded"
      :src="userPhotoURL"
      :alt="`Avatar de ${playerName || 'joueur'}`"
      :class="imageClass"
      class="object-cover"
      @load="onImageLoad"
      @error="onImageError"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
    />
    
    <!-- Loading state -->
    <div 
      v-else-if="userPhotoURL && !imageLoaded && !imageError"
      :class="loadingClass"
      class="animate-pulse bg-gray-400"
    ></div>
    
    <!-- Hidden img to preload avatar -->
    <img 
      v-if="userPhotoURL && !imageLoaded && !imageError"
      :src="userPhotoURL"
      style="position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;"
      @load="onImageLoad"
      @error="onImageError"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
    />
    
    <!-- Fallback emoji -->
    <span 
      v-if="!userPhotoURL || imageError"
      :class="emojiClass"
      class="select-none"
    >
      {{ fallbackEmoji }}
    </span>

    <!-- Status icons (only if showStatusIcons is true) -->
    <template v-if="showStatusIcons">
      <!-- Indicateur de favori -->
      <span 
        v-if="isPreferred"
        class="absolute -top-1 -right-1 text-yellow-400 text-sm bg-gray-900 rounded-full w-5 h-5 flex items-center justify-center border border-gray-700"
        title="Ma personne"
      >
        ⭐
      </span>
      
      <!-- Indicateur de protection -->
      <span 
        v-else-if="isProtected"
        class="absolute -top-1 -right-1 text-yellow-400 text-sm bg-gray-900 rounded-full w-5 h-5 flex items-center justify-center border border-gray-700"
        title="Personne protégée par mot de passe"
      >
        🔒
      </span>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getPlayerAvatar } from '../services/playerAvatars.js'
import logger from '../services/logger.js'

const props = defineProps({
  playerId: {
    type: String,
    required: true
  },
  seasonId: {
    type: String,
    default: null
  },
  playerName: {
    type: String,
    default: ''
  },
  playerGender: {
    type: String,
    default: 'non-specified',
    validator: (value) => ['male', 'female', 'non-specified'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: String,
    default: 'full',
    validator: (value) => ['none', 'md', 'lg', 'full'].includes(value)
  },
  showStatusIcons: {
    type: Boolean,
    default: false
  },
  isPreferred: {
    type: Boolean,
    default: false
  },
  isProtected: {
    type: Boolean,
    default: false
  }
})

const imageLoaded = ref(false)
const imageError = ref(false)
const userPhotoURL = ref(null)
const associatedUserEmail = ref(null)
const isAssociated = ref(false)

// Size classes
const sizeClasses = {
  xs: {
    container: 'w-4 h-4',
    image: 'w-4 h-4',
    emoji: 'text-xs',
    loading: 'w-4 h-4'
  },
  sm: {
    container: 'w-6 h-6',
    image: 'w-6 h-6',
    emoji: 'text-sm',
    loading: 'w-6 h-6'
  },
  md: {
    container: 'w-8 h-8',
    image: 'w-8 h-8',
    emoji: 'text-lg',
    loading: 'w-8 h-8'
  },
  lg: {
    container: 'w-10 h-10 md:w-12 md:h-12',
    image: 'w-10 h-10 md:w-12 md:h-12',
    emoji: 'text-lg md:text-xl',
    loading: 'w-10 h-10 md:w-12 md:h-12'
  },
  xl: {
    container: 'w-16 h-16',
    image: 'w-16 h-16',
    emoji: 'text-2xl',
    loading: 'w-16 h-16'
  }
}

// Rounded classes
const roundedClasses = {
  none: '',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
}

// Gender-based styling
const genderStyles = {
  male: {
    emoji: '👨',
    bgGradient: 'from-blue-500 to-blue-600'
  },
  female: {
    emoji: '👩',
    bgGradient: 'from-pink-500 to-pink-600'
  },
  'non-specified': {
    emoji: '👤',
    bgGradient: 'from-gray-600 to-gray-700'
  }
}

// Computed classes
const containerClass = computed(() => {
  const genderStyle = genderStyles[props.playerGender] || genderStyles['non-specified']
  return `${sizeClasses[props.size].container} ${roundedClasses[props.rounded]} bg-gradient-to-br ${genderStyle.bgGradient}`
})

const imageClass = computed(() => {
  return `${sizeClasses[props.size].image} ${roundedClasses[props.rounded]}`
})

const emojiClass = computed(() => {
  return sizeClasses[props.size].emoji
})

const fallbackEmoji = computed(() => {
  const genderStyle = genderStyles[props.playerGender] || genderStyles['non-specified']
  return genderStyle.emoji
})

const loadingClass = computed(() => {
  return `${sizeClasses[props.size].loading} ${roundedClasses[props.rounded]}`
})

// Fetch player association and user avatar
async function fetchPlayerAssociation() {
  if (!props.playerId) return
  
  try {
    const result = await getPlayerAvatar(props.playerId, props.seasonId)
    
    if (result.isAssociated) {
      associatedUserEmail.value = result.email
      isAssociated.value = true
      
      if (result.photoURL) {
        // Sanitize Google avatar URLs like in UserAvatar
        let url = result.photoURL.trim()
        if (url.includes('googleusercontent.com')) {
          url = url.replace(/=s\d+-c$/, '=s96')
        }
        userPhotoURL.value = url
      }
      
      // Association trouvée (pas de log pour éviter la pollution)
    } else {
      // Pas de log pour les associations non trouvées (cas normal)
    }
  } catch (error) {
    logger.warn('PlayerAvatar: Error fetching association', error)
  }
}

// Image loading handlers
function onImageLoad() {
  imageLoaded.value = true
  imageError.value = false
  // Image chargée avec succès (pas de log pour éviter la pollution)
}

function onImageError() {
  imageLoaded.value = false
  imageError.value = true
  // Image échouée, utilisation du fallback (pas de log pour éviter la pollution)
}

// Reset states when avatar URL changes
watch(userPhotoURL, (newUrl) => {
  if (newUrl) {
    imageLoaded.value = false
    imageError.value = false
    
    // Set a timeout to fallback if image doesn't load within 3 seconds
    setTimeout(() => {
      if (!imageLoaded.value && !imageError.value) {
        logger.warn('PlayerAvatar: Image loading timeout, falling back to emoji', { 
          playerId: props.playerId,
          url: newUrl 
        })
        imageError.value = true
      }
    }, 3000)
  }
})

// Fetch association when component mounts or props change
watch([() => props.playerId, () => props.seasonId], () => {
  if (props.playerId) {
    // Reset state
    userPhotoURL.value = null
    associatedUserEmail.value = null
    isAssociated.value = false
    imageLoaded.value = false
    imageError.value = false
    
    // Fetch new data
    fetchPlayerAssociation()
  }
}, { immediate: true })

// Écouter les événements de mise à jour d'avatar
let avatarUpdateListener = null

onMounted(() => {
  avatarUpdateListener = (event) => {
    const { playerId: updatedPlayerId, seasonId: updatedSeasonId } = event.detail
    if (updatedPlayerId === props.playerId && 
        (updatedSeasonId === props.seasonId || (!updatedSeasonId && !props.seasonId))) {
      // Cache vidé, rechargement de l'avatar (pas de log pour éviter la pollution)
      
      // Reset state and refetch
      userPhotoURL.value = null
      associatedUserEmail.value = null
      isAssociated.value = false
      imageLoaded.value = false
      imageError.value = false
      
      fetchPlayerAssociation()
    }
  }
  
  window.addEventListener('avatar-cache-cleared', avatarUpdateListener)
})

onUnmounted(() => {
  if (avatarUpdateListener) {
    window.removeEventListener('avatar-cache-cleared', avatarUpdateListener)
  }
})
</script>
