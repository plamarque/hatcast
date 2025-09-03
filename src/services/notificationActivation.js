// Service pour gérer l'activation des notifications pour les utilisateurs non connectés
import firestoreService from './firestoreService.js'
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
 * Vérifie si un email existe déjà dans Firebase Auth
 * Retourne true si l'email existe, false sinon
 */
export async function checkEmailExists(email) {
  try {
    const { auth } = await import('./firebase.js')
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    
    // Essayer de créer un compte temporaire
    // Si ça échoue avec "email-already-in-use", l'email existe
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, 'temp_check_123')
      
      // Si on arrive ici, le compte a été créé, on le supprime immédiatement
      await userCredential.user.delete()
      
      logger.info('Email vérifié : nouveau (compte temporaire supprimé)', { email })
      return false
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        logger.info('Email vérifié : existant', { email })
        return true
      } else {
        // Autre erreur, on considère que l'email n'existe pas
        logger.warn('Erreur lors de la vérification de l\'email, considéré comme nouveau', { email, error: error.code })
        return false
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification de l\'email', error)
    return false
  }
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
    // Récupérer le nom complet de la saison depuis Firestore
    let seasonTitle = seasonSlug // Fallback au slug
          try {
        const seasonData = await firestoreService.getDocument('seasons', seasonId)
        if (seasonData) {
          seasonTitle = seasonData.title || seasonSlug
        }
      } catch (error) {
      console.warn('Impossible de récupérer le titre de la saison, utilisation du slug:', error)
    }

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
    await firestoreService.setDocument('notificationActivations', activationId, {
      seasonId,
      eventId,
      playerName,
      email,
      eventTitle,
      seasonSlug,
      magicLinkId: magicLink.id,
      magicLinkUrl: magicLink.url,
      requestedAt: new Date(),
      status: 'pending'
    })

    // Envoyer l'email avec le magic link
    await queueNotificationActivationEmail({
      toEmail: email,
      playerName,
      eventTitle,
      eventUrl: `${window.location.origin}/season/${seasonSlug}/event/${eventId}`,
      activationUrl: magicLink.url,
      seasonTitle: seasonTitle // Utiliser le nom complet de la saison
    })

    logger.info('Demande d\'activation des notifications créée', {
      activationId,
      email,
      playerName,
      eventId
    })

    return { success: true, activationId, method: 'firebase_magic_link' }
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
    const activations = await firestoreService.queryDocuments('notificationActivations', [
      firestoreService.where('status', '==', 'pending')
    ])
    
    for (const activation of activations) {
      if (activation.magicLinkUrl && activation.magicLinkUrl.includes(token)) {
        return { ...activation, activationId: activation.id }
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
    await firestoreService.setDocument('userPreferences', email, {
      ...preferences,
      updatedAt: new Date(),
      notificationActivatedAt: new Date()
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
    await firestoreService.updateDocument('notificationActivations', activationId, {
      status: 'completed',
      completedAt: new Date()
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
    const existing = await firestoreService.queryDocuments('playerAssociations', [
      firestoreService.where('email', '==', activationData.email),
      firestoreService.where('seasonId', '==', activationData.seasonId)
    ])
    
    if (existing.length > 0) {
      logger.info('Association joueur-email déjà existante', {
        email: activationData.email,
        seasonId: activationData.seasonId
      })
      return
    }

    // Créer l'association
    await firestoreService.setDocument('playerAssociations', `${activationData.seasonId}_${activationData.email}`, {
      email: activationData.email,
      seasonId: activationData.seasonId,
      playerName: activationData.playerName,
      associatedAt: new Date(),
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
 * Utilise une méthode plus fiable pour détecter les comptes existants
 */
async function createUserAccountIfNeeded(email) {
  try {
    const { auth } = await import('./firebase.js')
    const { createUserWithEmailAndPassword, sendPasswordResetEmail } = await import('firebase/auth')
    
    // Méthode plus fiable : essayer de créer le compte directement
    // Si ça échoue avec "email-already-in-use", le compte existe
    try {
      // Créer un compte avec un mot de passe temporaire
      const userCredential = await createUserWithEmailAndPassword(auth, email, 'temp_password_123')
      
      // Envoyer un email de réinitialisation de mot de passe
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
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        // Le compte existe déjà
        logger.info('Compte Firebase Auth existant trouvé', { email })
        return { created: false, reason: 'already_exists' }
      } else {
        // Autre erreur lors de la création
        logger.error('Erreur lors de la création du compte Firebase Auth', error)
        return { created: false, reason: 'creation_failed', error: error.message }
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification/création du compte Firebase Auth', error)
    return { created: false, reason: 'general_error', error: error.message }
  }
}
