// src/services/players.js
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { createEmailVerificationLink } from './magicLinks.js'
import playerPasswordSessionManager from './playerPasswordSession.js'
import { queueVerificationEmail } from './emailService.js'

// Clé de préférence locale pour remonter le(s) joueur(s) protégé(s) en tête du tri
function getPreferredPlayerStorageKey(seasonId) {
  return `seasonPreferredPlayer:${seasonId || 'global'}`
}

// Utilitaires de persistance multi-préférés (compat: accepte ancien format string)
export function addPreferredPlayerLocal(seasonId, playerId) {
  try {
    const key = getPreferredPlayerStorageKey(seasonId)
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify([playerId]))
      return
    }
    if (raw.startsWith('[')) {
      const arr = JSON.parse(raw)
      if (!arr.includes(playerId)) {
        arr.push(playerId)
        localStorage.setItem(key, JSON.stringify(arr))
      }
    } else {
      if (raw !== playerId) {
        localStorage.setItem(key, JSON.stringify([raw, playerId]))
      }
    }
  } catch (_) {}
}

export function removePreferredPlayerLocal(seasonId, playerId) {
  try {
    const key = getPreferredPlayerStorageKey(seasonId)
    const raw = localStorage.getItem(key)
    if (!raw) return
    if (raw.startsWith('[')) {
      const arr = JSON.parse(raw).filter(id => id !== playerId)
      if (arr.length === 0) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(arr))
    } else if (raw === playerId) {
      localStorage.removeItem(key)
    }
  } catch (_) {}
}

// Vérifier si un joueur est protégé
export async function isPlayerProtected(playerId, seasonId = null) {
  if (!playerId || typeof playerId !== 'string') {
    return false
  }
  
  try {
    if (seasonId) {
      const playerDoc = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
      return playerDoc && playerDoc.email && playerDoc.isProtected !== false
    }
    return false // Pas de protection globale dans le nouveau système
  } catch (error) {
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.warn('Erreur lors de la vérification de protection', {
        playerId,
        seasonId,
        errorCode: error.code,
        errorMessage: error.message
      })
    }
    return false
  }
}

// Récupérer les données d'un joueur
export async function getPlayerData(playerId, seasonId = null) {
  if (!playerId || typeof playerId !== 'string') {
    return null
  }
  
  try {
    if (seasonId) {
      const playerDoc = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
      if (playerDoc && playerDoc.email) {
        return {
          id: playerId,
          playerId: playerId,
          email: playerDoc.email,
          isProtected: playerDoc.isProtected !== false,
          firebaseUid: playerDoc.firebaseUid || null,
          photoURL: playerDoc.photoURL || null,
          emailVerifiedAt: playerDoc.emailVerifiedAt || null,
          createdAt: playerDoc.createdAt || null,
          updatedAt: playerDoc.updatedAt || null
        }
      }
    }
    return null
  } catch (error) {
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.warn('Erreur lors de la récupération des données du joueur', {
        playerId,
        seasonId,
        errorCode: error.code,
        errorMessage: error.message
      })
    }
    return null
  }
}

// Récupérer l'email d'un joueur
export async function getPlayerEmail(playerId, seasonId = null) {
  try {
    const playerData = await getPlayerData(playerId, seasonId)
    return playerData?.email || ''
  } catch (error) {
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur lors de la récupération de l\'email', error)
    }
    return ''
  }
}

// Lister les joueurs protégés
export async function listProtectedPlayers(seasonId = null) {
  try {
    if (seasonId) {
      const players = await firestoreService.getDocuments('seasons', seasonId, 'players')
      const protectedPlayers = players
        .filter(player => player.email && player.isProtected !== false)
        .map(player => ({
          id: player.id,
          playerId: player.id,
          email: player.email,
          isProtected: player.isProtected !== false,
          firebaseUid: player.firebaseUid || null,
          photoURL: player.photoURL || null,
          emailVerifiedAt: player.emailVerifiedAt || null,
          createdAt: player.createdAt || null,
          updatedAt: player.updatedAt || null
        }))
      
      return protectedPlayers
    }
    return [] // Pas de protection globale dans le nouveau système
  } catch (error) {
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur lors du chargement des protections', error)
    }
    return []
  }
}

// Cache global pour les associations par email
const associationsCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Lister toutes les associations (toutes saisons) pour un email donné
export async function listAssociationsForEmail(email) {
  if (!email) return []
  
  // Vérifier le cache d'abord
  const cacheKey = `associations_${email}`
  const cached = associationsCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    logger.debug('Cache hit pour listAssociationsForEmail', { email, count: cached.data.length })
    return cached.data
  }
  
  try {
    const results = []
    const seasons = await firestoreService.getDocuments('seasons')
    
    // Optimisation: traiter les saisons en parallèle au lieu de séquentiellement
    const seasonPromises = seasons.map(async (season) => {
      const sid = season.id
      const seasonName = season.name || sid
      
      try {
        const players = await firestoreService.queryDocuments(
          'seasons', 
          [firestoreService.where('email', '==', email)], 
          sid, 
          'players'
        )
        
        return players.map((player) => {
          if (player?.email && player.email === email) {
            return { 
              seasonId: sid, 
              seasonName: seasonName, 
              playerId: player.id, 
              email: player.email,
              isProtected: player.isProtected !== false,
              firebaseUid: player.firebaseUid,
              playerName: player.name || player.id // Inclure le nom directement
            }
          }
          return null
        }).filter(Boolean)
      } catch (seasonError) {
        if (seasonError.code !== 'not-found' && seasonError.code !== 'permission-denied') {
          logger.warn(`Erreur lors de la lecture de la saison ${sid}:`, seasonError)
        }
        return []
      }
    })
    
    const seasonResults = await Promise.all(seasonPromises)
    seasonResults.forEach(seasonAssociations => {
      results.push(...seasonAssociations)
    })
    
    // Mettre en cache le résultat
    associationsCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    })
    
    logger.debug('Associations chargées et mises en cache', { email, count: results.length })
    return results
  } catch (error) {
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur listAssociationsForEmail', error)
    }
    return []
  }
}

// Fonction pour invalider le cache des associations
export function invalidateAssociationsCache(email = null) {
  if (email) {
    associationsCache.delete(`associations_${email}`)
    logger.debug('Cache invalidé pour email', email)
  } else {
    associationsCache.clear()
    logger.debug('Cache des associations complètement vidé')
  }
}

// Protéger un joueur
export async function protectPlayer(playerId, email, password, seasonId = null) {
  try {
    logger.info('Début protectPlayer', { playerId, seasonId })
    
    // Vérifier si l'email est déjà utilisé
    const existingProtection = await getPlayerData(playerId, seasonId)
    if (existingProtection && existingProtection.isProtected) {
      throw new Error('Ce joueur est déjà protégé')
    }
    
    // Vérifier si l'email est déjà utilisé par un autre joueur
    const emailDocs = await firestoreService.queryDocuments(
      'seasons', 
      [firestoreService.where('email', '==', email)], 
      seasonId, 
      'players'
    )
    
    if (emailDocs.length > 0) {
      const existingDoc = emailDocs.find(doc => doc.id !== playerId)
      if (existingDoc) {
        throw new Error('Cette adresse email est déjà utilisée par un autre joueur')
      }
    }
    
    // Créer un compte Firebase Auth pour ce joueur (seulement si un mot de passe est fourni)
    let user = null
    if (password) {
      logger.debug('Création du compte Firebase Auth...')
      const { createPlayerAccount } = await import('./firebase.js')
      
      user = await createPlayerAccount(email, password)
      logger.info('Compte Firebase Auth créé', { uid: user.uid })
    } else {
      logger.debug('Association directe sans création de compte Firebase Auth')
    }
    
    // Sauvegarder dans la collection players
    if (seasonId) {
      const updateData = {
        email: email,
        isProtected: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Ajouter firebaseUid seulement si un compte a été créé
      if (user) {
        updateData.firebaseUid = user.uid
      }
      
      await firestoreService.updateDocument('seasons', seasonId, updateData, 'players', playerId)
    }
    
    logger.info('Protection sauvegardée dans Firestore')

    // Invalider le cache des associations pour cet email
    if (email) {
      invalidateAssociationsCache(email)
    }

    // Sauvegarder une préférence locale
    if (seasonId) addPreferredPlayerLocal(seasonId, playerId)
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de la protection du joueur', error)
    throw error
  }
}

// Démarrer la vérification email
export async function startEmailVerificationForProtection({ playerId, email, seasonId = null, returnUrl = null }) {
  // Stocker provisoirement l'email saisi (sans activer la protection)
  if (seasonId) {
    const existing = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
    if (!existing) {
      await firestoreService.setDocument('seasons', seasonId, { 
        email, 
        isProtected: false, 
        createdAt: new Date() 
      }, false, 'players', playerId)
    } else {
      await firestoreService.updateDocument('seasons', seasonId, { 
        email, 
        updatedAt: new Date() 
      }, 'players', playerId)
    }
  }

  // Créer et retourner le lien de vérification
  const { url } = await createEmailVerificationLink({ seasonId, playerId, email, returnUrl })
  
  // Envoyer l'email de vérification
  logger.info('🚀 Début envoi email de vérification', { playerId, email, url })
  try {
    const result = await queueVerificationEmail({ 
      toEmail: email, 
      verifyUrl: url, 
      purpose: 'player_protection', 
      displayName: playerId 
    })
    logger.info('✅ Email de vérification envoyé avec succès', { playerId, email, result })
  } catch (error) {
    logger.error('❌ Erreur lors de l\'envoi de l\'email de vérification', { playerId, email, error })
  }
  
  return { success: true, url }
}

// Marquer l'email comme vérifié et activer la protection
export async function markEmailVerifiedForProtection({ playerId, seasonId = null }) {
  if (seasonId) {
    const snap = await firestoreService.getDocument('seasons', seasonId, 'players', playerId)
    if (!snap) throw new Error('Protection introuvable')
    
    // Activer la protection et marquer l'email comme vérifié
    await firestoreService.updateDocument('seasons', seasonId, { 
      emailVerifiedAt: new Date(),
      isProtected: true,
      updatedAt: new Date()
    }, 'players', playerId)
    
    logger.info('✅ Protection activée pour le joueur', { playerId, seasonId })
  }
  
  // Sauvegarder l'avatar du joueur si l'utilisateur est connecté
  try {
    const { currentUser } = await import('./authState.js')
    if (currentUser.value && currentUser.value.photoURL && snap.email) {
      const { savePlayerAvatar } = await import('./playerAvatars.js')
      const success = await savePlayerAvatar(playerId, currentUser.value.photoURL, snap.email, seasonId)
      logger.info('✅ Avatar sauvegardé pour le joueur', { 
        playerId, 
        seasonId, 
        email: snap.email,
        success,
        photoURL: currentUser.value.photoURL
      })
    }
  } catch (error) {
    logger.error('❌ Erreur lors de la sauvegarde de l\'avatar:', error)
  }
  
  return { success: true }
}

// Réinitialiser la vérification d'email
export async function clearEmailVerificationForProtection({ playerId, seasonId = null }) {
  if (seasonId) {
    await firestoreService.updateDocument('seasons', seasonId, { 
      emailVerifiedAt: null,
      updatedAt: new Date()
    }, 'players', playerId)
  }
  return { success: true }
}

// Désactiver la protection d'un joueur
export async function unprotectPlayer(playerId, seasonId = null) {
  try {
    if (seasonId) {
      await firestoreService.updateDocument('seasons', seasonId, {
        email: '',
        isProtected: false,
        emailVerifiedAt: null,
        updatedAt: new Date()
      }, 'players', playerId)
    }
    
    // Supprimer l'avatar du joueur
    try {
      const { deletePlayerAvatar } = await import('./playerAvatars.js')
      await deletePlayerAvatar(playerId, seasonId)
      logger.info('✅ Avatar supprimé pour le joueur déprotégé', { playerId, seasonId })
    } catch (error) {
      logger.debug('Could not delete player avatar:', error)
    }
    
    // Nettoyer la préférence locale
    if (seasonId) removePreferredPlayerLocal(seasonId, playerId)

    // Invalider le cache des associations (on ne connaît pas l'email ici, donc on invalide tout)
    invalidateAssociationsCache()

    return { success: true, email: '' }
  } catch (error) {
    logger.error('Erreur lors de la suppression de la protection', error)
    throw error
  }
}

// Vérifier le mot de passe d'un joueur
export async function verifyPlayerPassword(playerId, password, seasonId = null) {
  try {
    const playerData = await getPlayerData(playerId, seasonId)
    
    if (!playerData || !playerData.isProtected) {
      return false
    }
    
    if (playerData.email) {
      logger.debug('Vérification avec Firebase Auth')
      
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        const { auth } = await import('./firebase.js')
        
        await signInWithEmailAndPassword(auth, playerData.email, password)
        logger.debug('Mot de passe Firebase Auth valide')
        
        playerPasswordSessionManager.saveSession(playerId)
        if (seasonId) addPreferredPlayerLocal(seasonId, playerId)
        
        return true
      } catch (firebaseError) {
        logger.debug('Mot de passe Firebase Auth invalide', { code: firebaseError.code })
        return false
      }
    }
    
    return false
  } catch (error) {
    logger.error('Erreur lors de la vérification du mot de passe', error)
    return false
  }
}

// Envoyer un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(playerId, seasonId = null) {
  try {
    logger.info('Début sendPasswordResetEmail', { playerId, seasonId })
    
    const playerData = await getPlayerData(playerId, seasonId)
    
    if (!playerData || !playerData.isProtected) {
      throw new Error('Joueur non protégé')
    }
    
    if (!playerData.email) {
      throw new Error('Email non disponible pour ce joueur')
    }
    
    // Vérifier si on a un firebaseUid
    if (playerData.firebaseUid) {
      logger.debug('Utilisation du compte Firebase Auth existant')
      const { sendPasswordResetEmail } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('./firebase.js')
      
      const auth = getFirebaseAuth()
      if (!auth) {
        throw new Error('Firebase Auth non initialisé')
      }
      
      await sendPasswordResetEmail(auth, playerData.email)
      logger.info('Email envoyé avec succès via Firebase Auth')
    } else {
      logger.debug('Pas de compte Firebase Auth, création temporaire...')
      
      const { createUserWithEmailAndPassword, sendPasswordResetEmail } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('./firebase.js')
      
      const auth = getFirebaseAuth()
      if (!auth) {
        throw new Error('Firebase Auth non initialisé')
      }
      
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, playerData.email, tempPassword)
        logger.info('Compte Firebase Auth créé pour le reset', { uid: userCredential.user.uid })
        
        // Mettre à jour Firestore avec le firebaseUid
        if (seasonId) {
          await firestoreService.updateDocument('seasons', seasonId, {
            firebaseUid: userCredential.user.uid,
            updatedAt: new Date()
          }, 'players', playerId)
        }
        
        logger.info('firebaseUid mis à jour dans Firestore')
        
      } catch (createError) {
        if (createError.code === 'auth/email-already-in-use') {
          logger.debug('Email déjà utilisé, tentative d\'envoi direct...')
          await sendPasswordResetEmail(auth, playerData.email)
        } else {
          throw createError
        }
      }
    }
    
    await sendPasswordResetEmail(auth, playerData.email)
    logger.info('Email envoyé avec succès')
    
    return { success: true, message: 'Email de réinitialisation envoyé ! Si vous ne recevez pas l\'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.' }
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email de réinitialisation', { 
      error,
      message: error?.message,
      code: error?.code,
      playerId,
      seasonId
    })
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('Aucun compte trouvé avec cette adresse email')
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives. Veuillez réessayer plus tard')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Adresse email invalide')
    } else {
      throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`)
    }
  }
}

// Mettre à jour le mot de passe d'un joueur dans Firebase Auth
export async function updatePlayerPasswordInFirebaseAuth(newPassword) {
  try {
    const { updatePassword } = await import('firebase/auth')
    const { auth } = await import('./firebase.js')
    
    if (!auth.currentUser) {
      throw new Error('Aucun utilisateur connecté')
    }
    
    await updatePassword(auth.currentUser, newPassword)
    
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du mot de passe', error)
    throw error
  }
}

// Vérifier si un joueur a une session active
export function isPlayerPasswordCached(playerId) {
  return playerPasswordSessionManager.isPasswordCached(playerId)
}



// Finaliser l'association après vérification de l'email et créer un compte Firebase Auth
export async function finalizeProtectionAfterVerification({ playerId, seasonId = null }) {
  try {
    // Lire les données du joueur
    const playerData = await getPlayerData(playerId, seasonId)
    if (!playerData || !playerData.email) {
      throw new Error('Email non défini pour cette protection')
    }
    
    // Si l'email est présent et vérifié, activer la protection
    try {
      // Créer un compte Firebase Auth pour cet email
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('./firebase.js')
      
      // Générer un mot de passe sécurisé
      const password = Math.random().toString(36).slice(-12) + 'A1!'
      
      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, playerData.email, password)
      logger.info('Compte Firebase Auth créé après vérification d\'email', { uid: userCredential.user.uid })
      
      // Mettre à jour dans players avec le firebaseUid et activer la protection
      if (seasonId) {
        await firestoreService.updateDocument('seasons', seasonId, {
          isProtected: true,
          firebaseUid: userCredential.user.uid,
          updatedAt: new Date()
        }, 'players', playerId)
      }
      
      return { 
        success: true, 
        email: playerData.email,
        playerId: playerId,
        seasonId: seasonId,
        firebaseUid: userCredential.user.uid,
        password: password
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        logger.info('Email déjà utilisé, activation de la protection sans création de compte')
        
        // Activer la protection même si le compte existe déjà
        if (seasonId) {
          await firestoreService.updateDocument('seasons', seasonId, {
            isProtected: true,
            updatedAt: new Date()
          }, 'players', playerId)
        }
        
        return { 
          success: true, 
          email: playerData.email,
          playerId: playerId,
          seasonId: seasonId,
          existingAccount: true
        }
      } else {
        throw error
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la finalisation de la protection', error)
    throw error
  }
}

