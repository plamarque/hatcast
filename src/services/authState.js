import { ref, computed } from 'vue'
import { auth } from './firebase.js'
import logger from './logger.js'
import { trackPageVisit, clearNavigationHistory } from './navigationTracker.js'

// État global de l'authentification
const currentUser = ref(null)
const isInitialized = ref(false)
const isInitializing = ref(false)

// Computed properties
const isConnected = computed(() => {
  return !!currentUser.value && !currentUser.value?.isAnonymous
})

const isAuthenticated = computed(() => {
  return !!currentUser.value
})

// Fonction pour forcer la synchronisation
function forceSync() {
  try {
    const user = auth.currentUser
    if (user !== currentUser.value) {
      currentUser.value = user
      logger.debug('Synchronisation forcée de l\'état d\'authentification', { 
        user: currentUser.value?.email || 'non connecté' 
      })
    }
  } catch (error) {
    logger.error('Erreur lors de la synchronisation forcée', error)
  }
}

// Fonction pour initialiser le service
function initialize() {
  logger.debug('Tentative d\'initialisation du service d\'authentification', {
    isInitialized: isInitialized.value,
    isInitializing: isInitializing.value
  })
  
  if (isInitialized.value || isInitializing.value) {
    logger.debug('Service déjà initialisé ou en cours d\'initialisation, sortie')
    return
  }
  
  isInitializing.value = true
  logger.debug('Marquage du service comme en cours d\'initialisation')
  
  try {
    // Initialiser l'état immédiatement
    currentUser.value = auth.currentUser
    logger.debug('État initial de l\'utilisateur:', currentUser.value?.email || 'non connecté')
    
    // Écouter les changements d'état d'authentification
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const previousUser = currentUser.value
      currentUser.value = user
      isInitialized.value = true
      isInitializing.value = false
      
      logger.debug('État d\'authentification changé', { 
        isLoggedIn: !!user, 
        email: user?.email || 'non connecté' 
      })
      
      // Tracking de navigation pour les changements d'authentification
      try {
        if (user && !previousUser) {
          // Nouvelle connexion - tracker la page actuelle
          const currentPath = window.location.pathname
          if (currentPath && currentPath !== '/') {
            await trackPageVisit(user.uid, currentPath)
            logger.debug('Navigation trackée pour nouvelle connexion:', currentPath)
          }
        } else if (!user && previousUser) {
          // Déconnexion - effacer l'historique de navigation
          await clearNavigationHistory(previousUser.uid)
          logger.debug('Historique de navigation effacé pour déconnexion')
        }
      } catch (error) {
        logger.error('Erreur lors du tracking de navigation:', error)
      }
    })
    
    // Stocker la fonction de cleanup
    window._authStateUnsubscribe = unsubscribe
    
    logger.info('Service d\'état d\'authentification initialisé avec succès')
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation du service d\'authentification:', error)
    isInitializing.value = false
  }
}

// Fonction pour nettoyer
function cleanup() {
  if (window._authStateUnsubscribe) {
    window._authStateUnsubscribe()
    delete window._authStateUnsubscribe
  }
  isInitialized.value = false
  isInitializing.value = false
}

// Fonction pour attendre l'initialisation
function waitForInitialization() {
  return new Promise((resolve, reject) => {
    logger.debug('waitForInitialization appelé', { 
      isInitialized: isInitialized.value, 
      isInitializing: isInitializing.value 
    })
    
    if (isInitialized.value) {
      logger.debug('Service déjà initialisé, résolution immédiate')
      resolve()
      return
    }
    
    // Si le service n'est pas en cours d'initialisation, c'est un problème
    if (!isInitializing.value) {
      logger.warn('Service d\'authentification non initialisé et non en cours d\'initialisation')
      reject(new Error('Service d\'authentification non initialisé'))
      return
    }
    
    const checkInterval = setInterval(() => {
      logger.debug('Vérification de l\'initialisation...', { 
        isInitialized: isInitialized.value, 
        isInitializing: isInitializing.value 
      })
      
      if (isInitialized.value) {
        clearInterval(checkInterval)
        logger.debug('Service initialisé, résolution')
        resolve()
      }
    }, 100)
    
    // Timeout de sécurité
    setTimeout(() => {
      clearInterval(checkInterval)
      logger.warn('Timeout de waitForInitialization, rejet de la promesse')
      reject(new Error('Timeout d\'initialisation du service d\'authentification'))
    }, 5000)
  })
}

// Fonction pour forcer l'initialisation
function forceInitialize() {
  logger.debug('Initialisation forcée demandée')
  if (!isInitialized.value && !isInitializing.value) {
    autoInitialize()
  }
}

// Initialiser automatiquement avec un délai pour laisser Firebase se charger
function autoInitialize() {
  logger.debug('Tentative d\'auto-initialisation du service d\'authentification')
  
  // Vérifier si Firebase est disponible
  if (typeof auth === 'undefined' || !auth) {
    logger.warn('Firebase auth non disponible, nouvelle tentative dans 500ms')
    setTimeout(autoInitialize, 500)
    return
  }
  
  try {
    initialize()
  } catch (error) {
    logger.error('Erreur lors de l\'auto-initialisation:', error)
    // Réessayer dans 1 seconde
    setTimeout(autoInitialize, 1000)
  }
}

// Démarrer l'auto-initialisation
setTimeout(autoInitialize, 100)

export {
  currentUser,
  isConnected,
  isAuthenticated,
  isInitialized,
  isInitializing,
  forceSync,
  initialize,
  cleanup,
  waitForInitialization,
  forceInitialize
}
