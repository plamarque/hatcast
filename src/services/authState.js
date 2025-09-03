import { ref, computed } from 'vue'
import { getFirebaseAuth } from './firebase.js'
import logger from './logger.js'
// Navigation tracking supprimé - remplacé par seasonPreferences

// État global de l'authentification
const currentUser = ref(null)
const isInitialized = ref(false)
const isInitializing = ref(false)

// Computed properties
const isConnected = computed(() => {
  // Inclure les utilisateurs anonymes qui ont un email associé
  if (!currentUser.value) return false
  if (!currentUser.value.isAnonymous) return true
  // Pour les utilisateurs anonymes, vérifier s'ils ont un email dans localStorage
  return !!localStorage.getItem('userEmail')
})

const isAuthenticated = computed(() => {
  return !!currentUser.value
})

// Fonction pour forcer la synchronisation
function forceSync() {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      logger.debug('Firebase Auth pas encore disponible pour la synchronisation')
      return
    }
    
    if (auth?.currentUser) {
      const user = auth.currentUser
      if (user !== currentUser.value) {
        currentUser.value = user
        logger.debug('Synchronisation forcée de l\'état d\'authentification', { 
          user: currentUser.value?.email || 'non connecté' 
        })
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la synchronisation forcée', error)
  }
}

// Fonction pour initialiser le service
async function initialize() {
  if (isInitialized.value || isInitializing.value) {
    return
  }
  
  isInitializing.value = true
  
  try {
    // Récupérer l'instance Firebase Auth
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error('Firebase Auth n\'est pas encore disponible')
    }
    
    // Initialiser l'état immédiatement
    currentUser.value = auth.currentUser
    logger.debug('État initial de l\'utilisateur:', currentUser.value?.email || 'non connecté')
    
    // Écouter les changements d'état d'authentification
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const previousUser = currentUser.value
      currentUser.value = user
      isInitialized.value = true
      isInitializing.value = false
      
      // Debug log for auth state changes
      logger.info('🔑 AuthState: User changed', {
        hadUser: !!previousUser,
        hasUser: !!user,
        email: user?.email || 'none',
        photoURL: user?.photoURL || 'none',
        providers: user?.providerData?.map(p => p.providerId) || []
      })
      
      // Store user avatar for player avatars service
      if (user && user.email && user.photoURL) {
        try {
          const { storeUserAvatar } = await import('./playerAvatars.js')
          storeUserAvatar(user.email, user.photoURL)
        } catch (error) {
          logger.debug('Could not store user avatar:', error)
        }
      }
      

      
      // Tracking de navigation et audit pour les changements d'authentification
      try {
        if (user && !previousUser) {
          // Nouvelle connexion - logger l'audit (navigation tracking supprimé)
          
          // Logger la connexion
          const { default: AuditClient } = await import('./auditClient.js')
          await AuditClient.logLogin(user.email, 'firebase_auth')
          
        } else if (!user && previousUser) {
          // Déconnexion - effacer les sessions locales (navigation tracking supprimé)
          
          // Logger la déconnexion
          const { default: AuditClient } = await import('./auditClient.js')
          await AuditClient.logLogout(previousUser.email)
          
          // Effacer toutes les sessions locales (PIN et joueurs)
          try {
            const { default: pinSessionManager } = await import('./pinSession.js')
            const { default: playerPasswordSessionManager } = await import('./playerPasswordSession.js')
            
            pinSessionManager.clearSession()
            playerPasswordSessionManager.clearAllSessions()
            
            logger.info('Sessions locales effacées par le service centralisé')
          } catch (sessionError) {
            logger.warn('Erreur lors de l\'effacement des sessions locales:', sessionError)
          }
        }
      } catch (error) {
        // Log silencieux pour les erreurs de tracking non critiques
        if (error.code !== 'permission-denied') {
          logger.error('Erreur lors du tracking de navigation:', error)
        }
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
    if (isInitialized.value) {
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
      if (isInitialized.value) {
        clearInterval(checkInterval)
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
  if (!isInitialized.value && !isInitializing.value) {
    autoInitialize()
  }
}

// Initialiser automatiquement avec un délai pour laisser Firebase se charger
let retryCount = 0
const maxRetries = 20 // Augmenter le nombre de tentatives
const baseDelay = 500 // 500ms de base

function autoInitialize() {
  // Vérifier si Firebase est disponible ET complètement initialisé
  const auth = getFirebaseAuth()
  if (!auth || !window.firebaseInitialized) {
    if (retryCount < maxRetries) {
      // Calculer le délai avec backoff exponentiel (max 10 secondes)
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 10000)
      retryCount++
      
      logger.warn(`Firebase auth non disponible ou non initialisé, tentative ${retryCount}/${maxRetries} dans ${delay}ms`)
      setTimeout(autoInitialize, delay)
      return
    } else {
      logger.error('Nombre maximum de tentatives atteint, arrêt de l\'auto-initialisation')
      isInitializing.value = false
      return
    }
  }
  
  // Reset du compteur de tentatives
  retryCount = 0
  
  try {
    initialize()
  } catch (error) {
    logger.error('Erreur lors de l\'auto-initialisation:', error)
    // Réessayer avec backoff exponentiel
    if (retryCount < maxRetries) {
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 10000)
      retryCount++
      logger.warn(`Erreur d'initialisation, tentative ${retryCount}/${maxRetries} dans ${delay}ms`)
      setTimeout(autoInitialize, delay)
    } else {
      logger.error('Nombre maximum de tentatives atteint, arrêt de l\'auto-initialisation')
      isInitializing.value = false
    }
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
