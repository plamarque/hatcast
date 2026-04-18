<template>
  <div 
    :class="containerClass"
    class="relative overflow-hidden flex items-center justify-center"
  >
    <!-- Google Avatar Image -->
    <img 
      v-if="avatarUrl && imageLoaded"
      :src="avatarUrl"
      :alt="`Avatar de ${displayName || email || 'utilisateur'}`"
      :class="imageClass"
      class="object-cover"
      @load="onImageLoad"
      @error="onImageError"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
    />
    
    <!-- Loading state -->
    <div 
      v-else-if="avatarUrl && !imageLoaded && !imageError"
      :class="loadingClass"
      class="animate-pulse bg-gray-400"
      :title="`Chargement avatar: ${avatarUrl}`"
    ></div>
    
    <!-- Hidden img to preload avatar -->
    <img 
      v-if="avatarUrl && !imageLoaded && !imageError"
      :src="avatarUrl"
      style="position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;"
      @load="onImageLoad"
      @error="onImageError"
      referrerpolicy="no-referrer"
      crossorigin="anonymous"
    />
    
    <!-- Fallback emoji -->
    <span 
      v-if="!avatarUrl || imageError"
      :class="emojiClass"
      class="select-none"
    >
      👤
    </span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { currentUser } from '../services/authState.js'
import { getFirebaseAuth } from '../services/firebase.js'
import logger from '../services/logger.js'

// Log component loading
logger.debug('🖼️ UserAvatar: Component loading', { 
  currentUserExists: !!currentUser.value,
  currentUserEmail: currentUser.value?.email || 'none'
})

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: String,
    default: 'full',
    validator: (value) => ['none', 'md', 'lg', 'full'].includes(value)
  }
})

const imageLoaded = ref(false)
const imageError = ref(false)
const attemptedFetch = ref(false)

// Computed properties for user data
const avatarUrl = computed(() => {
  if (!currentUser.value) return null
  
  // TEMPORARY: Force fallback to emoji for debugging
  // Google avatars are blocked by CORS/security policies in development
  // TODO: Fix Google avatar loading in production or use a proxy
  // return null
  
  // Google users have photoURL - but check if it's actually valid
  const photoURL = currentUser.value.photoURL
  if (photoURL && photoURL.trim() && photoURL !== 'null' && photoURL !== 'undefined') {
    let url = photoURL.trim()
    // Try to make Google avatar URLs more compatible by removing restrictive parameters
    if (url.includes('googleusercontent.com')) {
      // Remove the s96-c parameter which might cause CORS issues
      url = url.replace(/=s\d+-c$/, '=s96')
    }
    return url
  }
  
  return null
})

// Check if user has Google provider (even without avatar)
const hasGoogleProvider = computed(() => {
  if (!currentUser.value?.providerData) return false
  return currentUser.value.providerData.some(provider => provider.providerId === 'google.com')
})

// Function to attempt fetching Google avatar for existing users
async function attemptFetchGoogleAvatar() {
  if (attemptedFetch.value || avatarUrl.value || !hasGoogleProvider.value) {
    return
  }
  
  attemptedFetch.value = true
  
  try {
    const auth = getFirebaseAuth()
    if (!auth?.currentUser) return
    
    logger.info('🖼️ UserAvatar: Attempting to fetch Google avatar for existing user')
    
    // Method 1: Try to reload user data from Firebase
    await auth.currentUser.reload()
    
    // Force refresh of the current user object
    const refreshedUser = auth.currentUser
    if (refreshedUser && refreshedUser.photoURL && refreshedUser.photoURL !== currentUser.value?.photoURL) {
      logger.info('🖼️ UserAvatar: Found new photoURL after reload', { 
        newPhotoURL: refreshedUser.photoURL 
      })
      // The currentUser reactive ref should update automatically via authState
      return
    }
    
    // Method 2: If user has Google provider but no photoURL, try to generate one
    // This is a fallback for users who might have incomplete Google data
    const googleProvider = currentUser.value.providerData.find(p => p.providerId === 'google.com')
    if (googleProvider && googleProvider.uid) {
      // Try common Google avatar URL patterns
      const possibleAvatarUrls = [
        `https://lh3.googleusercontent.com/a/default-user=${googleProvider.uid}`,
        `https://lh3.googleusercontent.com/a-/default-user=${googleProvider.uid}`,
      ]
      
      // Test if any of these URLs work (we'll just try the first one)
      const testUrl = possibleAvatarUrls[0]
      logger.info('🖼️ UserAvatar: Trying generated Google avatar URL', { testUrl })
      
      // Note: We don't actually set this as avatarUrl here, just log for debugging
      // The real fix should come from proper Google Auth integration
    }
    
  } catch (error) {
    logger.warn('🖼️ UserAvatar: Failed to fetch Google avatar', error)
  }
}

const displayName = computed(() => {
  if (!currentUser.value) return null
  return currentUser.value.displayName
})

const email = computed(() => {
  if (!currentUser.value) return null
  return currentUser.value.email
})

// Size classes
const sizeClasses = {
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

// Computed classes
const containerClass = computed(() => {
  return `${sizeClasses[props.size].container} ${roundedClasses[props.rounded]}`
})

const imageClass = computed(() => {
  return `${sizeClasses[props.size].image} ${roundedClasses[props.rounded]}`
})

const emojiClass = computed(() => {
  return sizeClasses[props.size].emoji
})

const loadingClass = computed(() => {
  return `${sizeClasses[props.size].loading} ${roundedClasses[props.rounded]}`
})

// Image loading handlers
function onImageLoad() {
  imageLoaded.value = true
  imageError.value = false
  logger.debug('Avatar image loaded successfully', { url: avatarUrl.value })
}

function onImageError() {
  imageLoaded.value = false
  imageError.value = true
  logger.debug('Avatar image failed to load, using fallback', { url: avatarUrl.value })
}

// Reset states when avatar URL changes
watch(avatarUrl, (newUrl) => {
  if (newUrl) {
    imageLoaded.value = false
    imageError.value = false
    
    // Set a timeout to fallback if image doesn't load within 3 seconds
    setTimeout(() => {
      if (!imageLoaded.value && !imageError.value) {
        logger.warn('🖼️ UserAvatar: Image loading timeout, falling back to emoji', { url: newUrl })
        imageError.value = true
      }
    }, 3000)
  }
})

// Try to fetch Google avatar when user changes
watch(currentUser, (user) => {
  if (user) {
    // Reset fetch attempt for new user
    attemptedFetch.value = false
    // Attempt to fetch avatar if conditions are met
    setTimeout(() => attemptFetchGoogleAvatar(), 1000) // Small delay to let auth state settle
  }
}, { immediate: true })

// Log avatar info for debugging
watch(currentUser, (user) => {
  if (user) {
    logger.debug('🖼️ UserAvatar: User changed', {
      hasPhotoURL: !!user.photoURL,
      photoURL: user.photoURL || 'none',
      displayName: user.displayName || 'none',
      email: user.email || 'none',
      providers: user.providerData?.map(p => p.providerId) || []
    })
  }
}, { immediate: true })

// Debug the computed values
watch(avatarUrl, (url) => {
  logger.debug('🖼️ UserAvatar: avatarUrl changed', { 
    url: url || 'none',
    hasUrl: !!url
  })
}, { immediate: true })

watch([imageLoaded, imageError], ([loaded, error]) => {
  logger.info('🖼️ UserAvatar: Image state changed', { 
    loaded, 
    error,
    url: avatarUrl.value || 'none'
  })
})
</script>