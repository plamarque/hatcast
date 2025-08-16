// Service pour gérer l'activation des notifications pour les utilisateurs non connectés
import { db } from './firebase.js'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { createMagicLink } from './magicLinks.js'
import { queueNotificationActivationEmail } from './emailService.js'
import { canUsePush, requestAndGetToken } from './notifications.js'
import logger from './logger.js'

/**
 * Vérifie si un utilisateur non connecté doit être incité à activer les notifications
 */
export function shouldPromptForNotifications() {
  // Vérifier si l'utilisateur est connecté
  const isConnected = !!localStorage.getItem('fcmToken') || 
                     !!localStorage.getItem('userEmail') ||
                     !!localStorage.getItem('authUser')
  
  // Vérifier si les notifications sont déjà activées
  const notificationsEnabled = Notification.permission === 'granted' && 
                              !!localStorage.getItem('fcmToken')
  
  return !isConnected && !notificationsEnabled
}

/**
 * Crée une demande d'activation des notifications
 */
export async function createNotificationActivationRequest({
  seasonId,
  eventId,
  playerName,
  email,
  eventTitle,
  seasonSlug
}) {
  try {
    // Créer un magic link spécial pour l'activation des notifications
    const magicLink = await createMagicLink({
      seasonId,
      playerId: 'notification_activation',
      eventId,
      action: 'activate_notifications',
      slug: seasonSlug
    })

    // Enregistrer la demande dans Firestore
    const activationId = `${seasonId}_${eventId}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`
    await setDoc(doc(db, 'notificationActivations', activationId), {
      seasonId,
      eventId,
      playerName,
      email,
      eventTitle,
      seasonSlug,
      magicLinkId: magicLink.id,
      magicLinkUrl: magicLink.url,
      requestedAt: serverTimestamp(),
      status: 'pending'
    })

    // Envoyer l'email avec le magic link
    await queueNotificationActivationEmail({
      toEmail: email,
      playerName,
      eventTitle,
      eventUrl: `${window.location.origin}/season/${seasonSlug}/event/${eventId}`,
      activationUrl: magicLink.url
    })

    logger.info('Demande d\'activation des notifications créée', {
      activationId,
      email,
      playerName,
      eventId
    })

    return { success: true, activationId, magicLink }
  } catch (error) {
    logger.error('Erreur lors de la création de la demande d\'activation', error)
    throw error
  }
}

/**
 * Traite l'activation des notifications via magic link
 */
export async function processNotificationActivation(token) {
  try {
    // Récupérer les informations d'activation depuis le token
    const activationData = await getNotificationActivationData(token)
    if (!activationData) {
      throw new Error('Données d\'activation introuvables')
    }

    // Vérifier que le magic link est valide
    const { verifyMagicLink } = await import('./magicLinks.js')
    const verification = await verifyMagicLink({
      seasonId: activationData.seasonId,
      playerId: 'notification_activation',
      eventId: activationData.eventId,
      token,
      action: 'activate_notifications'
    })

    if (!verification.valid) {
      throw new Error('Magic link invalide ou expiré')
    }

    // Activer les notifications push sur cet appareil
    const pushStatus = await activatePushNotifications()
    
    // Créer automatiquement un compte Firebase Auth pour cet utilisateur
    const accountStatus = await createUserAccountIfNeeded(activationData.email)
    
    // Créer ou mettre à jour les préférences utilisateur
    await updateUserNotificationPreferences(activationData.email, {
      notifyAvailability: true,
      notifySelection: true,
      notifySelectionPush: true,
      notifyAvailabilityPush: true
    })

    // Marquer l'activation comme terminée
    await markActivationComplete(activationData.activationId)

    // Associer le joueur à cet email si ce n'est pas déjà fait
    await associatePlayerWithEmail(activationData)

    logger.info('Notifications activées avec succès', {
      email: activationData.email,
      playerName: activationData.playerName,
      pushStatus
    })

    return {
      success: true,
      email: activationData.email,
      playerName: activationData.playerName,
      pushStatus,
      accountStatus
    }
  } catch (error) {
    logger.error('Erreur lors de l\'activation des notifications', error)
    throw error
  }
}

/**
 * Récupère les données d'activation depuis le token
 */
async function getNotificationActivationData(token) {
  try {
    // Rechercher dans la collection des activations
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    const q = query(collection(db, 'notificationActivations'), where('status', '==', 'pending'))
    const snap = await getDocs(q)
    
    for (const doc of snap.docs) {
      const data = doc.data()
      if (data.magicLinkUrl && data.magicLinkUrl.includes(token)) {
        return { ...data, activationId: doc.id }
      }
    }
    
    return null
  } catch (error) {
    logger.error('Erreur lors de la récupération des données d\'activation', error)
    return null
  }
}

/**
 * Active les notifications push sur l'appareil
 */
async function activatePushNotifications() {
  try {
    if (!(await canUsePush())) {
      return { active: false, reason: 'not_supported' }
    }

    // Demander la permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { active: false, reason: 'permission_denied' }
    }

    // Obtenir le token FCM
    const token = await requestAndGetToken()
    if (!token) {
      return { active: false, reason: 'token_failed' }
    }

    return { active: true, token }
  } catch (error) {
    logger.error('Erreur lors de l\'activation des notifications push', error)
    return { active: false, reason: 'error', error: error.message }
  }
}

/**
 * Met à jour les préférences de notifications de l'utilisateur
 */
async function updateUserNotificationPreferences(email, preferences) {
  try {
    await setDoc(doc(db, 'userPreferences', email), {
      ...preferences,
      updatedAt: serverTimestamp(),
      notificationActivatedAt: serverTimestamp()
    }, { merge: true })
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des préférences', error)
    throw error
  }
}

/**
 * Marque l'activation comme terminée
 */
async function markActivationComplete(activationId) {
  try {
    await updateDoc(doc(db, 'notificationActivations', activationId), {
      status: 'completed',
      completedAt: serverTimestamp()
    })
  } catch (error) {
    logger.error('Erreur lors de la finalisation de l\'activation', error)
  }
}

/**
 * Associe le joueur à l'email de l'utilisateur
 */
async function associatePlayerWithEmail(activationData) {
  try {
    const { collection, query, where, getDocs, setDoc } = await import('firebase/firestore')
    
    // Vérifier si l'association existe déjà
    const q = query(
      collection(db, 'playerAssociations'),
      where('email', '==', activationData.email),
      where('seasonId', '==', activationData.seasonId)
    )
    const existing = await getDocs(q)
    
    if (!existing.empty) {
      logger.info('Association joueur-email déjà existante', {
        email: activationData.email,
        seasonId: activationData.seasonId
      })
      return
    }

    // Créer l'association
    await setDoc(doc(db, 'playerAssociations', `${activationData.seasonId}_${activationData.email}`), {
      email: activationData.email,
      seasonId: activationData.seasonId,
      playerName: activationData.playerName,
      associatedAt: serverTimestamp(),
      source: 'notification_activation'
    })

    logger.info('Joueur associé à l\'email', {
      email: activationData.email,
      playerName: activationData.playerName,
      seasonId: activationData.seasonId
    })
  } catch (error) {
    logger.error('Erreur lors de l\'association du joueur', error)
  }
}

/**
 * Active les notifications pour un utilisateur déjà connecté (sans email)
 */
export async function activateNotificationsForConnectedUser({
  seasonId,
  eventId,
  playerName,
  email,
  eventTitle,
  seasonSlug
}) {
  try {
    console.log('🔔 Activation directe des notifications pour utilisateur connecté')
    
    // Activer les notifications push sur cet appareil
    const pushStatus = await activatePushNotifications()
    
    // Mettre à jour les préférences utilisateur
    await updateUserNotificationPreferences(email, {
      notifyAvailability: true,
      notifySelection: true,
      notifySelectionPush: true,
      notifyAvailabilityPush: true
    })
    
    // Associer le joueur à cet email si ce n'est pas déjà fait
    await associatePlayerWithEmail({
      seasonId,
      eventId,
      playerName,
      email,
      eventTitle,
      seasonSlug
    })
    
    logger.info('Notifications activées directement pour utilisateur connecté', {
      email,
      playerName,
      eventId,
      pushStatus
    })
    
    return {
      success: true,
      email,
      playerName,
      pushStatus,
      directActivation: true
    }
  } catch (error) {
    logger.error('Erreur lors de l\'activation directe des notifications', error)
    throw error
  }
}

/**
 * Crée automatiquement un compte Firebase Auth si nécessaire
 */
async function createUserAccountIfNeeded(email) {
  try {
    // Vérifier si un compte existe déjà
    const { auth } = await import('./firebase.js')
    const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth')
    
    try {
      // Essayer de se connecter (compte existe)
      await signInWithEmailAndPassword(auth, email, 'temp_password_123')
      logger.info('Compte Firebase Auth existant trouvé', { email })
      return { created: false, reason: 'already_exists' }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Compte n'existe pas, le créer
        try {
          // Créer un compte avec un mot de passe temporaire
          const userCredential = await createUserWithEmailAndPassword(auth, email, 'temp_password_123')
          
          // Envoyer un email de réinitialisation de mot de passe
          const { sendPasswordResetEmail } = await import('firebase/auth')
          await sendPasswordResetEmail(auth, email)
          
          logger.info('Compte Firebase Auth créé avec succès', { 
            email, 
            uid: userCredential.user.uid 
          })
          
          return { 
            created: true, 
            reason: 'new_account_created',
            uid: userCredential.user.uid,
            passwordResetSent: true
          }
        } catch (createError) {
          logger.error('Erreur lors de la création du compte Firebase Auth', createError)
          return { created: false, reason: 'creation_failed', error: createError.message }
        }
      } else {
        // Autre erreur (mauvais mot de passe, etc.)
        logger.warn('Erreur de connexion Firebase Auth', { email, error: error.code })
        return { created: false, reason: 'auth_error', error: error.code }
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification/création du compte Firebase Auth', error)
    return { created: false, reason: 'general_error', error: error.message }
  }
}
