// src/services/playerProtection.js
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { createEmailVerificationLink } from './magicLinks.js'
import playerPasswordSessionManager from './playerPasswordSession.js'
import { queueVerificationEmail } from './emailService.js'

// Fonction simple pour hasher un mot de passe (pour la démo)
// En production, utilisez bcrypt ou une bibliothèque de hachage sécurisée
function simpleHash(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

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

// Structure des données de protection d'un joueur
// {
//   playerId: string,
//   email: string,
//   passwordHash: string,
//   isProtected: boolean,
//   createdAt: timestamp
// }

export async function protectPlayer(playerId, email, password, seasonId = null) {
  try {
    logger.info('Début protectPlayer', { playerId, seasonId })
    
    // Vérifier si l'email est déjà utilisé
    const existingProtection = await getPlayerProtectionData(playerId, seasonId)
    if (existingProtection && existingProtection.isProtected) {
      throw new Error('Ce joueur est déjà protégé')
    }
    
    // Vérifier si l'email est déjà utilisé par un autre joueur
    const emailDocs = await firestoreService.queryDocuments(
      seasonId ? 'seasons' : 'playerProtection',
      [firestoreService.where('email', '==', email)],
      seasonId ? seasonId : null,
      'playerProtection'
    )
    
    if (emailDocs.length > 0) {
      const existingDoc = emailDocs.find(doc => doc.id !== playerId)
      if (existingDoc) {
        throw new Error('Cette adresse email est déjà utilisée par un autre joueur')
      }
    }
    
    // Créer un compte Firebase Auth pour ce joueur
    logger.debug('Création du compte Firebase Auth...')
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const { auth } = await import('./firebase.js')
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    logger.info('Compte Firebase Auth créé', { uid: userCredential.user.uid })
    
    // Hasher le mot de passe pour Firestore
    const passwordHash = simpleHash(password)
    
    // Sauvegarder dans Firestore
    if (seasonId) {
      await firestoreService.setDocument('seasons', seasonId, {
        playerId,
        email,
        passwordHash,
        firebaseUid: userCredential.user.uid, // Stocker l'UID Firebase
        isProtected: true,
        createdAt: new Date()
      }, false, 'playerProtection', playerId)
    } else {
      await firestoreService.setDocument('playerProtection', playerId, {
        playerId,
        email,
        passwordHash,
        firebaseUid: userCredential.user.uid, // Stocker l'UID Firebase
        isProtected: true,
        createdAt: new Date()
      })
    }
    
    logger.info('Protection sauvegardée dans Firestore')

    // Sauvegarder une préférence locale: ce joueur est privilégié pour cette saison (multi support)
    if (seasonId) addPreferredPlayerLocal(seasonId, playerId)
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de la protection du joueur', error)
    throw error
  }
}

// Etape 1: Démarrer la vérification email - envoie un magic link de vérification
export async function startEmailVerificationForProtection({ playerId, email, seasonId = null }) {
  // On n'empêche plus l'envoi si l'email existe déjà.
  // La vérification par email prouvera la possession, et l'association sera gérée après vérification.

  // Stocker provisoirement l'email saisi (sans activer la protection)
  let existing
  if (seasonId) {
    existing = await firestoreService.getDocument('seasons', seasonId, 'playerProtection', playerId)
    if (!existing) {
      await firestoreService.setDocument('seasons', seasonId, { playerId, email, isProtected: false, createdAt: new Date() }, false, 'playerProtection', playerId)
    } else {
      await firestoreService.updateDocument('seasons', seasonId, { email, updatedAt: new Date() }, 'playerProtection', playerId)
    }
  } else {
    existing = await firestoreService.getDocument('playerProtection', playerId)
    if (!existing) {
      await firestoreService.setDocument('playerProtection', playerId, { playerId, email, isProtected: false, createdAt: new Date() })
    } else {
      await firestoreService.updateDocument('playerProtection', playerId, { email, updatedAt: new Date() })
    }
  }

  // Créer et retourner le lien de vérification
  const { url } = await createEmailVerificationLink({ seasonId, playerId, email })
  
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
    // Ne pas faire échouer la fonction si l'email échoue
  }
  
  return { success: true, url }
}

// Etape 2: Marquer l'email comme vérifié et activer la protection
export async function markEmailVerifiedForProtection({ playerId, seasonId = null }) {
  let snap
  if (seasonId) {
    snap = await firestoreService.getDocument('seasons', seasonId, 'playerProtection', playerId)
    if (!snap) throw new Error('Protection introuvable')
    
    // Activer la protection et marquer l'email comme vérifié
    await firestoreService.updateDocument('seasons', seasonId, { 
      emailVerifiedAt: new Date(),
      isProtected: true,
      updatedAt: new Date()
    }, 'playerProtection', playerId)
    
    logger.info('✅ Protection activée pour le joueur', { playerId, seasonId })
  } else {
    snap = await firestoreService.getDocument('playerProtection', playerId)
    if (!snap) throw new Error('Protection introuvable')
    
    // Activer la protection et marquer l'email comme vérifié
    await firestoreService.updateDocument('playerProtection', playerId, { 
      emailVerifiedAt: new Date(),
      isProtected: true,
      updatedAt: new Date()
    })
    
    logger.info('✅ Protection activée pour le joueur (global)', { playerId })
  }
  
  // Sauvegarder l'avatar du joueur si l'utilisateur est connecté
  try {
    const { currentUser } = await import('./authState.js')
    logger.info('🔍 Debug: Checking current user for avatar save', { 
      hasCurrentUser: !!currentUser.value,
      hasPhotoURL: !!currentUser.value?.photoURL,
      hasEmail: !!snap.email,
      playerId,
      seasonId
    })
    
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
    } else {
      logger.info('❌ Avatar non sauvegardé - conditions non remplies', {
        hasCurrentUser: !!currentUser.value,
        hasPhotoURL: !!currentUser.value?.photoURL,
        hasEmail: !!snap.email
      })
    }
  } catch (error) {
    logger.error('❌ Erreur lors de la sauvegarde de l\'avatar:', error)
  }
  
  return { success: true }
}

// Réinitialiser la vérification d'email pour permettre de ressaisir une autre adresse
export async function clearEmailVerificationForProtection({ playerId, seasonId = null }) {
  if (seasonId) {
    await firestoreService.updateDocument('seasons', seasonId, { emailVerifiedAt: null }, 'playerProtection', playerId)
  } else {
    await firestoreService.updateDocument('playerProtection', playerId, { emailVerifiedAt: null })
  }
  return { success: true }
}

export async function unprotectPlayer(playerId, seasonId = null) {
  try {
    // Désactiver la protection et purger l'email pour confidentialité
    if (seasonId) {
      await firestoreService.setDocument('seasons', seasonId, {
        playerId,
        email: '',
        isProtected: false,
        emailVerifiedAt: null,
        updatedAt: new Date()
      }, false, 'playerProtection', playerId)
    } else {
      await firestoreService.setDocument('playerProtection', playerId, {
        playerId,
        email: '',
        isProtected: false,
        emailVerifiedAt: null,
        updatedAt: new Date()
      })
    }
    
    // Supprimer l'avatar du joueur pour restaurer l'avatar par défaut
    try {
      const { deletePlayerAvatar } = await import('./playerAvatars.js')
      await deletePlayerAvatar(playerId, seasonId)
      logger.info('✅ Avatar supprimé pour le joueur déprotégé', { playerId, seasonId })
    } catch (error) {
      logger.debug('Could not delete player avatar:', error)
    }
    
    // Nettoyer la préférence locale pour ce joueur
    if (seasonId) removePreferredPlayerLocal(seasonId, playerId)

    return { success: true, email: '' }
  } catch (error) {
    logger.error('Erreur lors de la suppression de la protection', error)
    throw error
  }
}

export async function isPlayerProtected(playerId, seasonId = null) {
  // Vérifier que les paramètres sont valides
  if (!playerId || typeof playerId !== 'string') {
    return false
  }
  
  try {
    let protectionDoc
    if (seasonId) {
      protectionDoc = await firestoreService.getDocument('seasons', seasonId, 'playerProtection', playerId)
    } else {
      protectionDoc = await firestoreService.getDocument('playerProtection', playerId)
    }
    
    if (!protectionDoc) {
      return false
    }
    
    return protectionDoc.isProtected === true
  } catch (error) {
    // Log silencieux pour les erreurs non critiques
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

export async function getPlayerProtectionData(playerId, seasonId = null) {
  // Vérifier que les paramètres sont valides
  if (!playerId || typeof playerId !== 'string') {
    return null
  }
  
  try {
    let protectionDoc
    if (seasonId) {
      protectionDoc = await firestoreService.getDocument('seasons', seasonId, 'playerProtection', playerId)
    } else {
      protectionDoc = await firestoreService.getDocument('playerProtection', playerId)
    }
    
    return protectionDoc
  } catch (error) {
    // Log silencieux pour les erreurs non critiques (ex: document inexistant)
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.warn('Erreur lors de la récupération des données de protection', {
        playerId,
        seasonId,
        errorCode: error.code,
        errorMessage: error.message
      })
    }
    return null
  }
}

// Récupérer l'email d'un joueur (même non protégé)
export async function getPlayerEmail(playerId, seasonId = null) {
  try {
    const protectionData = await getPlayerProtectionData(playerId, seasonId)
    return protectionData?.email || ''
  } catch (error) {
    // Log silencieux pour les erreurs non critiques
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur lors de la récupération de l\'email', error)
    }
    return ''
  }
}

// Lister les protections (pour récupérer emails des joueurs protégés)
export async function listProtectedPlayers(seasonId = null) {
  try {
    if (seasonId) {
      // Protection pour une saison spécifique
      const protections = await firestoreService.getDocuments('seasons', seasonId, 'playerProtection')
      return protections.map(protection => ({ id: protection.id, ...protection }))
    } else {
      // Protection globale (racine)
      const protections = await firestoreService.getDocuments('playerProtection')
      return protections.map(protection => ({ id: protection.id, ...protection }))
    }
  } catch (error) {
    // Log silencieux pour les erreurs non critiques
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur lors du chargement des protections', error)
    }
    return []
  }
}

// Lister toutes les associations (toutes saisons) pour un email donné
export async function listAssociationsForEmail(email) {
  try {
    const results = []
    
    // Rechercher dans toutes les saisons connues via la collection seasons
    const seasons = await firestoreService.getDocuments('seasons')
    logger.debug(`listAssociationsForEmail: Recherche dans ${seasons.length} saisons pour ${email}`)
    
    for (const season of seasons) {
      const sid = season.id
      const seasonName = season.name || sid
      logger.debug(`listAssociationsForEmail: Vérification de la saison ${sid} (${seasonName})`)
      
      try {
        // Rechercher les protections de joueurs pour cet email dans cette saison
        const protections = await firestoreService.queryDocuments(
          'seasons', 
          [firestoreService.where('email', '==', email)], 
          sid, 
          'playerProtection'
        )
        
        logger.debug(`listAssociationsForEmail: ${protections.length} documents de protection trouvés dans ${sid}`)
        
        protections.forEach((protection) => {
          logger.debug(`listAssociationsForEmail: Document ${protection.id} dans ${sid}:`, { 
            email: protection.email, 
            isProtected: protection.isProtected, 
            firebaseUid: protection.firebaseUid 
          })
          
          if (protection?.isProtected) {
            results.push({ 
              seasonId: sid, 
              seasonName: seasonName, 
              playerId: protection.id, 
              ...protection 
            })
            logger.debug(`listAssociationsForEmail: Association ajoutée pour ${sid}/${protection.id}`)
          }
        })
      } catch (seasonError) {
        // Log silencieux pour les erreurs de saison individuelle
        if (seasonError.code !== 'not-found' && seasonError.code !== 'permission-denied') {
          logger.warn(`Erreur lors de la lecture de la saison ${sid}:`, seasonError)
        }
        continue // Continuer avec la saison suivante
      }
    }
    
    logger.debug(`listAssociationsForEmail: ${results.length} associations trouvées pour ${email}`)
    return results
  } catch (error) {
    // Log silencieux pour les erreurs non critiques
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur listAssociationsForEmail', error)
    }
    return []
  }
}

export async function verifyPlayerPassword(playerId, password, seasonId = null) {
  try {
    const protectionData = await getPlayerProtectionData(playerId, seasonId)
    
    if (!protectionData || !protectionData.isProtected) {
      return false
    }
    
    // Si on a un email, tenter Firebase Auth
    if (protectionData.email) {
      logger.debug('Vérification avec Firebase Auth')
      
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        const { auth } = await import('./firebase.js')
        
        // Essayer de se connecter avec Firebase Auth
        await signInWithEmailAndPassword(auth, protectionData.email, password)
        
        // Si la connexion réussit, le mot de passe est correct
        logger.debug('Mot de passe Firebase Auth valide')
        
        // Marquer l'appareil de confiance (pas de stockage du MDP)
        playerPasswordSessionManager.saveSession(playerId)
        // Enregistrer la préférence locale de joueur privilégié pour cette saison (multi)
        if (seasonId) addPreferredPlayerLocal(seasonId, playerId)
        
        return true
      } catch (firebaseError) {
        logger.debug('Mot de passe Firebase Auth invalide', { code: firebaseError.code })
        return false
      }
    } else {
      // Fallback : vérifier avec le hash stocké (pour les anciens comptes)
      logger.debug('Vérification avec hash local')
      const inputHash = simpleHash(password)
      const isValid = protectionData.passwordHash === inputHash
      
        if (isValid) {
        playerPasswordSessionManager.saveSession(playerId)
        // Enregistrer la préférence locale de joueur privilégié pour cette saison (multi)
        if (seasonId) addPreferredPlayerLocal(seasonId, playerId)
      }
      
      return isValid
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification du mot de passe', error)
    return false
  }
}
// Finaliser l'association après vérification de l'email et créer un compte Firebase Auth
export async function finalizeProtectionAfterVerification({ playerId, seasonId = null }) {
  const ref = seasonId
    ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
    : doc(db, 'playerProtection', playerId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Protection introuvable')
  const data = snap.data()
  
  // Si l'email est présent et vérifié, activer la protection
  if (data?.email) {
    try {
      // Créer un compte Firebase Auth pour cet email
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('./firebase.js')
      
      // Générer un mot de passe sécurisé
      const password = Math.random().toString(36).slice(-12) + 'A1!'
      
      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, password)
      logger.info('Compte Firebase Auth créé après vérification d\'email', { uid: userCredential.user.uid })
      
      // Mettre à jour Firestore avec le firebaseUid et activer la protection
      logger.info('Mise à jour du document playerProtection avec firebaseUid', { 
        ref: ref.path, 
        firebaseUid: userCredential.user.uid,
        playerId,
        seasonId 
      })
      
      await updateDoc(ref, { 
        isProtected: true, 
        firebaseUid: userCredential.user.uid,
        updatedAt: new Date() 
      })
      
      return { 
        success: true, 
        email: data.email,
        playerId: playerId,
        seasonId: seasonId,
        firebaseUid: userCredential.user.uid,
        password: password // Pour la connexion automatique
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        logger.info('Email déjà utilisé, connexion automatique via magic link')
        
        // 🎯 NOUVEAU : Connexion automatique pour les utilisateurs existants via magic link
        try {
          // Récupérer l'utilisateur existant par email
          const { getAuth, fetchSignInMethodsForEmail } = await import('firebase/auth')
          const { auth } = await import('./firebase.js')
          
          // Vérifier que l'email existe et a des méthodes de connexion
          const signInMethods = await fetchSignInMethodsForEmail(auth, data.email)
          if (signInMethods.length > 0) {
            logger.info('Utilisateur existant trouvé, envoi de magic link Firebase pour connexion auto')
            
            // 🎯 NOUVEAU : Envoyer un vrai magic link Firebase pour la connexion auto
            try {
              const { sendSignInLinkToEmail } = await import('firebase/auth')
              
              // Créer l'URL de redirection après connexion
              const actionCodeSettings = {
                url: `${window.location.origin}/magic?action=signin&playerId=${playerId}&seasonId=${seasonId}`,
                handleCodeInApp: true
              }
              
              // Envoyer le magic link Firebase
              await sendSignInLinkToEmail(auth, data.email, actionCodeSettings)
              logger.info('Magic link Firebase envoyé pour connexion automatique')
              
              // Activer la protection
              await updateDoc(ref, { isProtected: true, updatedAt: new Date() })
              
              return { 
                success: true, 
                email: data.email,
                playerId: playerId,
                seasonId: seasonId,
                existingAccount: true,
                magicLinkAuth: true,
                firebaseMagicLinkSent: true
              }
              
            } catch (magicLinkError) {
              logger.warn('Échec de l\'envoi du magic link Firebase:', magicLinkError)
              
              // Fallback : activation de la protection sans connexion auto
              await updateDoc(ref, { isProtected: true, updatedAt: new Date() })
              
              return { 
                success: true, 
                email: data.email,
                playerId: playerId,
                seasonId: seasonId,
                existingAccount: true,
                magicLinkAuth: true,
                autoLoginFailed: true
              }
            }
          } else {
            logger.warn('Email sans méthodes de connexion Firebase')
            throw new Error('Email sans compte Firebase valide')
          }
        } catch (autoLoginError) {
          logger.warn('Échec de la connexion automatique pour utilisateur existant', autoLoginError)
          
          // Fallback : activation de la protection sans connexion auto
          await updateDoc(ref, { isProtected: true, updatedAt: new Date() })
          
          return { 
            success: true, 
            email: data.email,
            playerId: playerId,
            seasonId: seasonId,
            existingAccount: true,
            autoLoginFailed: true
          }
        }
      } else {
        throw error
      }
    }
  }
  throw new Error('Email non défini pour cette protection')
}

// Vérifier si un joueur a une session active (mot de passe en cache)
export function isPlayerPasswordCached(playerId) {
  return playerPasswordSessionManager.isPasswordCached(playerId)
}

// Récupérer le mot de passe en cache pour un joueur
export function getCachedPlayerPassword(playerId) {
  // Compat: ne renvoie plus de mot de passe. Indisponible par design.
  return null
}

export async function sendPasswordResetEmail(playerId, seasonId = null) {
  try {
    logger.info('Début sendPasswordResetEmail', { playerId, seasonId })
    
    const protectionData = await getPlayerProtectionData(playerId, seasonId)
    logger.debug('Protection data disponible')
    
    if (!protectionData || !protectionData.isProtected) {
      throw new Error('Joueur non protégé')
    }
    
    logger.debug('Email à utiliser (masqué)')
    
    // Vérifier si on a un firebaseUid (compte Firebase Auth créé)
    if (protectionData.firebaseUid) {
      logger.debug('Utilisation du compte Firebase Auth existant')
      const { sendPasswordResetEmail } = await import('firebase/auth')
      const { auth } = await import('./firebase.js')
      
          logger.debug('Tentative d\'envoi d\'email')
    await sendPasswordResetEmail(auth, protectionData.email)
    logger.info('Email envoyé avec succès via Firebase Auth')
    } else {
      logger.debug('Pas de compte Firebase Auth, création temporaire...')
      
      // Créer un compte Firebase Auth temporaire pour envoyer l'email
      const { createUserWithEmailAndPassword, sendPasswordResetEmail } = await import('firebase/auth')
      const { auth } = await import('./firebase.js')
      
      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
      
      try {
        // Créer le compte
        const userCredential = await createUserWithEmailAndPassword(auth, protectionData.email, tempPassword)
        logger.info('Compte temporaire créé', { uid: userCredential.user.uid })
        
        // Envoyer l'email de réinitialisation
        await sendPasswordResetEmail(auth, protectionData.email)
        logger.info('Email envoyé avec succès')
        
        // Mettre à jour Firestore avec le firebaseUid
        const { updateDoc } = await import('firebase/firestore')
        const { db } = await import('./firebase.js')
        
        const protectionRef = seasonId
          ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
          : doc(db, 'playerProtection', playerId)
        
        await updateDoc(protectionRef, {
          firebaseUid: userCredential.user.uid
        })
        
      } catch (createError) {
        if (createError.code === 'auth/email-already-in-use') {
          logger.debug('Email déjà utilisé, tentative d\'envoi direct...')
          // L'email existe déjà, essayer d'envoyer directement
          await sendPasswordResetEmail(auth, protectionData.email)
          logger.info('Email envoyé avec succès')
        } else {
          throw createError
        }
      }
    }
    
    return { success: true, message: 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.' }
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email de réinitialisation', { error })
    
    // Gestion des erreurs spécifiques Firebase
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

// Mettre à jour le mot de passe d'un joueur dans Firestore
export async function updatePlayerPasswordInFirestore(playerId, newPassword, seasonId = null) {
  try {
    // Hasher le nouveau mot de passe
    const passwordHash = simpleHash(newPassword)
    
    // Mettre à jour dans Firestore
    const protectionRef = seasonId
      ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
      : doc(db, 'playerProtection', playerId)
    
    await updateDoc(protectionRef, {
      passwordHash,
      updatedAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du mot de passe', error)
    throw error
  }
}

// Fonction pour gérer la demande de mot de passe lors de la modification des disponibilités
export async function requirePlayerPasswordForAvailability(operation) {
  // Cette fonction est un placeholder qui sera gérée par le composant GridBoard
  // Elle retourne une promesse qui sera résolue par le composant
  return new Promise((resolve, reject) => {
    // Le composant GridBoard gère l'affichage de la modal et la résolution
    // Cette fonction est appelée pour déclencher le processus de vérification
    logger.debug('Demande de mot de passe pour disponibilité')
    
    // Pour l'instant, on rejette avec une erreur pour forcer la gestion côté composant
    reject(new Error('Gestion de mot de passe à implémenter côté composant'))
  })
}


