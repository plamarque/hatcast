// Service pour tracker la navigation dans Firestore et permettre la redirection intelligente
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'
import logger from './logger.js'

const COLLECTION = 'userNavigation'

/**
 * Enregistre la page actuelle comme dernière page visitée dans Firestore
 * @param {string} userId - L'ID de l'utilisateur Firebase
 * @param {string} path - Le chemin de la page actuelle
 * @param {Object} additionalData - Données supplémentaires (eventId, seasonSlug, etc.)
 */
export async function trackPageVisit(userId, path, additionalData = {}) {
  try {
    if (!userId || !path) {
      logger.warn('Données manquantes pour tracker la navigation', { userId, path })
      return
    }

    // Ne pas tracker les pages d'authentification ou de reset
    const excludedPaths = ['/reset-password', '/magic', '/join', '/login', '/signup']
    if (excludedPaths.some(excluded => path.startsWith(excluded))) {
      logger.debug('Page exclue du tracking:', path)
      return
    }

    const navigationData = {
      userId,
      lastVisitedPage: path,
      lastVisitedAt: serverTimestamp(),
      deviceInfo: getDeviceInfo(),
      ...additionalData
    }

    // Utiliser l'email comme clé si pas d'UID (pour les utilisateurs non connectés)
    const docId = userId.includes('@') ? `email_${userId.replace(/[^a-zA-Z0-9]/g, '_')}` : userId
    
    await setDoc(doc(db, COLLECTION, docId), navigationData, { merge: true })
    logger.debug('Navigation trackée dans Firestore:', { userId, path, docId })
    
  } catch (error) {
    logger.error('Erreur lors du tracking de la navigation', error)
  }
}

/**
 * Enregistre l'interaction avec une modale dans Firestore
 * @param {string} userId - L'ID de l'utilisateur Firebase
 * @param {Object} modalData - Données de la modale (type, id, contexte)
 */
export async function trackModalInteraction(userId, modalData) {
  try {
    if (!userId || !modalData?.type) {
      logger.warn('Données manquantes pour tracker la modale', { userId, modalData })
      return
    }

    const interactionData = {
      userId,
      lastModalInteraction: {
        type: modalData.type,
        id: modalData.id,
        context: modalData.context || {},
        timestamp: serverTimestamp()
      },
      lastVisitedAt: serverTimestamp(),
      deviceInfo: getDeviceInfo()
    }

    // Utiliser l'email comme clé si pas d'UID
    const docId = userId.includes('@') ? `email_${userId.replace(/[^a-zA-Z0-9]/g, '_')}` : userId
    
    await setDoc(doc(db, COLLECTION, docId), interactionData, { merge: true })
    logger.debug('Interaction modale trackée dans Firestore:', { userId, modalData, docId })
    
  } catch (error) {
    logger.error('Erreur lors du tracking de l\'interaction modale', error)
  }
}

/**
 * Récupère la dernière page visitée depuis Firestore
 * @param {string} userId - L'ID de l'utilisateur Firebase ou email
 * @returns {Object|null} Les données de navigation ou null
 */
export async function getLastVisitedPage(userId) {
  try {
    if (!userId) {
      logger.warn('Aucun userId fourni pour récupérer la navigation')
      return null
    }

    const docId = userId.includes('@') ? `email_${userId.replace(/[^a-zA-Z0-9]/g, '_')}` : userId
    const docRef = doc(db, COLLECTION, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      logger.debug('Dernière page visitée récupérée:', data)
      return data
    } else {
      logger.debug('Aucune navigation trouvée pour:', userId)
      return null
    }
    
  } catch (error) {
    logger.error('Erreur lors de la récupération de la navigation', error)
    return null
  }
}

/**
 * Récupère la dernière interaction modale depuis Firestore
 * @param {string} userId - L'ID de l'utilisateur Firebase ou email
 * @returns {Object|null} Les données de la dernière interaction modale ou null
 */
export async function getLastModalInteraction(userId) {
  try {
    if (!userId) {
      logger.warn('Aucun userId fourni pour récupérer l\'interaction modale')
      return null
    }

    const docId = userId.includes('@') ? `email_${userId.replace(/[^a-zA-Z0-9]/g, '_')}` : userId
    const docRef = doc(db, COLLECTION, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.lastModalInteraction) {
        logger.debug('Dernière interaction modale récupérée:', data.lastModalInteraction)
        return data.lastModalInteraction
      }
    }
    
    logger.debug('Aucune interaction modale trouvée pour:', userId)
    return null
    
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'interaction modale', error)
    return null
  }
}

/**
 * Met à jour la dernière page visitée
 * @param {string} userId - L'ID de l'utilisateur Firebase ou email
 * @param {string} path - Le nouveau chemin
 * @param {Object} additionalData - Données supplémentaires
 */
export async function updateLastVisitedPage(userId, path, additionalData = {}) {
  try {
    if (!userId || !path) {
      logger.warn('Données manquantes pour mettre à jour la navigation', { userId, path })
      return
    }

    const docId = userId.includes('@') ? `email_${userId.replace(/[^a-zA-Z0-9]/g, '_')}` : userId
    const docRef = doc(db, COLLECTION, docId)
    
    await updateDoc(docRef, {
      lastVisitedPage: path,
      lastVisitedAt: serverTimestamp(),
      deviceInfo: getDeviceInfo(),
      ...additionalData
    })
    
    logger.debug('Navigation mise à jour:', { userId, path })
    
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la navigation', error)
  }
}

/**
 * Efface la navigation d'un utilisateur
 * @param {string} userId - L'ID de l'utilisateur Firebase ou email
 */
export async function clearNavigationHistory(userId) {
  try {
    if (!userId) {
      logger.warn('Aucun userId fourni pour effacer la navigation')
      return
    }

    const docId = userId.includes('@') ? `email_${userId.replace(/[^a-zA-Z0-9]/g, '_')}` : userId
    const docRef = doc(db, COLLECTION, docId)
    
    await setDoc(docRef, {
      userId,
      lastVisitedPage: null,
      lastVisitedAt: serverTimestamp(),
      cleared: true
    })
    
    logger.debug('Historique de navigation effacé pour:', userId)
    
  } catch (error) {
    logger.error('Erreur lors de l\'effacement de la navigation', error)
  }
}

/**
 * Vérifie si un chemin de redirection est valide
 * @param {string} path - Le chemin à vérifier
 * @returns {boolean} True si la page est valide
 */
export function isValidRedirectPath(path) {
  if (!path) return false
  
  // Vérifier que ce n'est pas une page d'authentification
  const excludedPaths = ['/reset-password', '/magic', '/join', '/login', '/signup']
  if (excludedPaths.some(excluded => path.startsWith(excluded))) {
    return false
  }
  
  // Vérifier que ce n'est pas la page actuelle
  if (path === window.location.pathname) {
    return false
  }
  
  return true
}

/**
 * Génère des informations sur l'appareil pour le tracking
 * @returns {Object} Informations sur l'appareil
 */
function getDeviceInfo() {
  try {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return { timestamp: new Date().toISOString() }
  }
}

/**
 * Récupère l'utilisateur actuel (UID ou email)
 * @returns {string|null} L'ID de l'utilisateur ou null
 */
export function getCurrentUserId() {
  try {
    // Essayer de récupérer depuis localStorage (fallback)
    const storedUserId = localStorage.getItem('hatcast_current_user_id')
    if (storedUserId) {
      return storedUserId
    }
    
    // Essayer de récupérer depuis l'URL (pour les liens de reset)
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    if (email) {
      return email
    }
    
    return null
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'ID utilisateur', error)
    return null
  }
}


