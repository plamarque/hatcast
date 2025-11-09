// FCM push notifications helper
import { isSupported, getToken, onMessage, deleteToken } from 'firebase/messaging'
import { getMessaging, getFirebaseAuth } from './firebase'
import firestoreService from './firestoreService.js'
import configService from './configService.js'
import { getApp } from 'firebase/app'

export async function canUsePush() {
  try {
    return await isSupported()
  } catch {
    return false
  }
}

async function getActiveServiceWorkerRegistration() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return null
  
  // En mode développement, ne pas essayer d'enregistrer le SW
  // Temporairement activé pour les tests
  // if (import.meta.env?.DEV) {
  //   logger.info('🔇 Service Worker désactivé en mode développement')
  //   return null
  // }
  
  // Essayer de récupérer une registration existante
  const existingReg = await navigator.serviceWorker.getRegistration()
  if (existingReg && existingReg.active) {
    return existingReg
  }
  
  // Si pas de registration active, en créer une nouvelle
  const reg = await navigator.serviceWorker.register('/service-worker.js')
  
  // Attendre que le SW soit actif
  return new Promise((resolve) => {
    if (reg.active) {
      resolve(reg)
      return
    }
    
    const onChange = () => {
      if (reg.active) {
        reg.removeEventListener('statechange', onChange)
        resolve(reg)
      }
    }
    
    reg.addEventListener('statechange', onChange)
  })
}

export async function requestAndGetToken(serviceWorkerRegistration) {
  if (!(await canUsePush())) return null
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const messaging = getMessaging(getApp())
  
  // Fallback: si aucune registration n'est passée, attendre un SW actif
  let swReg = serviceWorkerRegistration || await getActiveServiceWorkerRegistration()
  const token = await getToken(messaging, swReg ? { vapidKey: configService.getVapidKey(), serviceWorkerRegistration: swReg } : { vapidKey: configService.getVapidKey() })
  
  // Persist token with user identity (by email if available)
  try {
    // Attendre que l'auth soit complètement initialisé avant de récupérer l'utilisateur
    const { waitForInitialization } = await import('./authState.js')
    await waitForInitialization()
    
    // Maintenant on peut récupérer l'utilisateur en toute sécurité
    const auth = getFirebaseAuth()
    const email = auth?.currentUser?.email
    
    if (!email || email === 'anonymous') {
      console.error('❌ Utilisateur non connecté, impossible de sauvegarder le token FCM')
      console.error('   auth:', auth ? 'présent' : 'null')
      console.error('   currentUser:', auth?.currentUser ? 'présent' : 'null')
      console.error('   email:', email || 'null')
      // Retourner quand même le token pour qu'il soit sauvegardé en local
      // mais NE PAS essayer de le sauvegarder dans Firestore
      return token
    }
    
    if (token) {
      // Vérifier que firestoreService est initialisé
      if (!firestoreService.isInitialized) {
        console.warn('⚠️ FirestoreService pas encore initialisé, tentative d\'initialisation...')
        await firestoreService.initialize()
      }
      
      // Vérifier que this.db est valide
      if (!firestoreService.db) {
        console.error('❌ FirestoreService.db est null, impossible de sauvegarder le token')
        throw new Error('FirestoreService.db est null')
      }
      
      // Récupérer les tokens existants pour gérer multi-device
      const existingDoc = await firestoreService.getDocument('userPushTokens', email)
      const existingTokens = existingDoc?.tokens || []
      
      // Ajouter le nouveau token seulement s'il n'existe pas déjà (multi-device support)
      const updatedTokens = existingTokens.includes(token) 
        ? existingTokens 
        : [...existingTokens, token]
      
      console.log(`🔍 Sauvegarde token: ${updatedTokens.length} device(s) total`)
      
      await firestoreService.setDocument('userPushTokens', email, {
        tokens: updatedTokens, // Array de tokens (multi-device)
        lastToken: token,
        email,
        updatedAt: new Date(),
        userAgent: navigator.userAgent,
        lastActivation: new Date()
      }, true) // merge: true
      
      console.log('✅ Token push sauvegardé avec succès dans userPushTokens')
    }
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du token push:', {
      error: error.message,
      stack: error.stack,
      firestoreServiceState: {
        isInitialized: firestoreService.isInitialized,
        hasDb: !!firestoreService.db,
        environment: firestoreService.getEnvironmentInfo()
      }
    })
  }
  return token
}

// Fonction pour vérifier et réactiver automatiquement les notifications push
export async function ensurePushNotificationsActive() {
  // En mode développement, désactiver les notifications push
  // Temporairement activé pour les tests
  // if (import.meta.env?.DEV) {
  //   logger.info('🔇 Notifications push désactivées en mode développement')
  //   return { active: false, error: 'Notifications désactivées en développement' }
  // }
  
  try {
    // Vérifier si on a déjà un token valide
    const existingToken = localStorage.getItem('fcmToken')
    if (existingToken) {
      // Vérifier si le token est toujours valide
      const messaging = getMessaging(getApp())
      try {
        // Essayer de récupérer le token actuel
        const currentToken = await getToken(messaging, { vapidKey: configService.getVapidKey() })
        if (currentToken === existingToken) {
          // Token toujours valide
          return { active: true, token: currentToken }
        }
      } catch {
        // Token expiré ou invalide
      }
    }
    
    // Réactiver les notifications push
    const swReg = await getActiveServiceWorkerRegistration()
    const token = await requestAndGetToken(swReg)
    if (token) {
      localStorage.setItem('fcmToken', token)
      return { active: true, token }
    }
    
    return { active: false, error: 'Failed to get token' }
  } catch (error) {
    return { active: false, error: error.message }
  }
}

// Vérifier périodiquement l'état des notifications push
export function startPushHealthCheck() {
  // DÉSACTIVÉ EN LOCAL pour éviter le spam de logs
  // Temporairement activé pour les tests
  // if (import.meta.env?.DEV) {
  //   logger.info('🔇 Push health check désactivé en mode développement')
  //   return
  // }
  
  // Vérifier toutes les 5 minutes
  setInterval(async () => {
    try {
      const status = await ensurePushNotificationsActive()
      if (!status.active) {
        console.log('Push notifications inactive, attempting to reactivate...')
        // Émettre un événement pour informer l'UI
        window.dispatchEvent(new CustomEvent('push-status-changed', { detail: status }))
      }
    } catch (error) {
      console.warn('Push health check failed:', error)
    }
  }, 5 * 60 * 1000) // 5 minutes
}

// Listener pour les messages en foreground
export async function setupForegroundMessageListener() {
  if (!(await canUsePush())) return
  
  const messaging = getMessaging(getApp())
  
  // Écouter les messages quand l'app est au premier plan
  onMessage(messaging, (payload) => {
    console.log('📱 Message reçu en foreground:', payload)
    
    const { title, body } = payload.data || {}
    
    // Afficher une notification même en foreground
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title || 'Notification', {
        body: body || '',
        icon: '/icons/manifest-icon-192.maskable.png',
        data: payload.data
      })
    }
  })
}

// Surveiller automatiquement les changements de token FCM
export async function monitorTokenChanges() {
  if (!(await canUsePush())) return
  
  const messaging = getMessaging(getApp())
  
  // Vérifier toutes les heures si le token a changé
  setInterval(async () => {
    try {
      const currentStoredToken = localStorage.getItem('fcmToken')
      if (!currentStoredToken) return // Pas de token initial
      
      const currentToken = await getToken(messaging, { 
        vapidKey: configService.getVapidKey() 
      })
      
      if (currentToken && currentToken !== currentStoredToken) {
        console.log('🔄 Token FCM rafraîchi automatiquement')
        
        // Sauvegarder le nouveau token
        localStorage.setItem('fcmToken', currentToken)
        
        // Mettre à jour dans Firestore
        // Attendre que l'auth soit initialisé
        const { waitForInitialization } = await import('./authState.js')
        await waitForInitialization()
        
        const auth = getFirebaseAuth()
        const email = auth?.currentUser?.email
        
        if (email && email !== 'anonymous') {
          // Vérifier que firestoreService est initialisé
          if (!firestoreService.isInitialized) {
            await firestoreService.initialize()
          }
          
          if (!firestoreService.db) {
            console.error('❌ FirestoreService.db est null lors du refresh du token')
            return
          }
          
          // Récupérer les tokens existants
          const existingDoc = await firestoreService.getDocument('userPushTokens', email)
          const existingTokens = existingDoc?.tokens || []
          
          // Remplacer l'ancien token par le nouveau
          const updatedTokens = existingTokens
            .filter(t => t !== currentStoredToken) // Supprimer l'ancien
            .concat(currentToken) // Ajouter le nouveau
          
          await firestoreService.setDocument('userPushTokens', email, {
            tokens: updatedTokens,
            lastToken: currentToken,
            email,
            updatedAt: new Date(),
            userAgent: navigator.userAgent,
            lastRefresh: new Date(),
            refreshReason: 'auto'
          }, true) // merge: true
          
          console.log('✅ Token FCM mis à jour automatiquement dans Firestore')
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification du token:', error)
    }
  }, 60 * 60 * 1000) // Toutes les heures
}

// Initialiser tous les listeners de notifications push
export async function initializePushNotifications() {
  console.log('🔔 Initialisation des notifications push...')
  
  // Écouter les messages foreground
  await setupForegroundMessageListener()
  
  // Surveiller les changements de token
  await monitorTokenChanges()
  
  // Health check périodique (déjà existant)
  startPushHealthCheck()
  
  console.log('✅ Notifications push initialisées')
}

export function onForegroundMessage(callback) {
  const messaging = getMessaging(getApp())
  return onMessage(messaging, callback)
}

export async function revokePushToken() {
  try {
    const messaging = getMessaging(getApp())
    await deleteToken(messaging)
  } catch {}
}


