// src/services/playerProtection.js
import { db } from './firebase.js'
import logger from './logger.js'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { createEmailVerificationLink } from './magicLinks.js'
import playerPasswordSessionManager from './playerPasswordSession.js'

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
function addPreferredPlayerLocal(seasonId, playerId) {
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

function removePreferredPlayerLocal(seasonId, playerId) {
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
    const { collection, query, where, getDocs } = await import('firebase/firestore')
    const { db } = await import('./firebase.js')
    
    const protectionCollection = seasonId
      ? collection(db, 'seasons', seasonId, 'playerProtection')
      : collection(db, 'playerProtection')
    
    const emailQuery = query(protectionCollection, where('email', '==', email))
    const emailDocs = await getDocs(emailQuery)
    
    if (!emailDocs.empty) {
      const existingDoc = emailDocs.docs.find(doc => doc.id !== playerId)
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
    const protectionRef = seasonId
      ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
      : doc(db, 'playerProtection', playerId)
    
    await setDoc(protectionRef, {
      playerId,
      email,
      passwordHash,
      firebaseUid: userCredential.user.uid, // Stocker l'UID Firebase
      isProtected: true,
      createdAt: new Date()
    })
    
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
  const ref = seasonId
    ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
    : doc(db, 'playerProtection', playerId)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    await setDoc(ref, { playerId, email, isProtected: false, createdAt: new Date() })
  } else {
    await updateDoc(ref, { email, updatedAt: new Date() })
  }

  // Créer et retourner le lien de vérification
  const { url } = await createEmailVerificationLink({ seasonId, playerId, email })
  return { success: true, url }
}

// Etape 2: Marquer l'email comme vérifié via la page /magic
export async function markEmailVerifiedForProtection({ playerId, seasonId = null }) {
  const ref = seasonId
    ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
    : doc(db, 'playerProtection', playerId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Protection introuvable')
  await updateDoc(ref, { emailVerifiedAt: new Date() })
  return { success: true }
}

// Réinitialiser la vérification d'email pour permettre de ressaisir une autre adresse
export async function clearEmailVerificationForProtection({ playerId, seasonId = null }) {
  const ref = seasonId
    ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
    : doc(db, 'playerProtection', playerId)
  await updateDoc(ref, { emailVerifiedAt: null })
  return { success: true }
}

export async function unprotectPlayer(playerId, seasonId = null) {
  try {
    const protectionRef = seasonId
      ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
      : doc(db, 'playerProtection', playerId)
    
    // Désactiver la protection et purger l'email pour confidentialité
    await setDoc(protectionRef, {
      playerId,
      email: '',
      isProtected: false,
      emailVerifiedAt: null,
      updatedAt: new Date()
    })
    
    // Nettoyer la préférence locale pour ce joueur
    if (seasonId) removePreferredPlayerLocal(seasonId, playerId)

    return { success: true, email: '' }
  } catch (error) {
    logger.error('Erreur lors de la suppression de la protection', error)
    throw error
  }
}

export async function isPlayerProtected(playerId, seasonId = null) {
  try {
    const protectionRef = seasonId
      ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
      : doc(db, 'playerProtection', playerId)
    
    const protectionDoc = await getDoc(protectionRef)
    
    if (!protectionDoc.exists()) {
      return false
    }
    
    const protectionData = protectionDoc.data()
    return protectionData.isProtected === true
  } catch (error) {
    logger.error('Erreur lors de la vérification de protection', error)
    return false
  }
}

export async function getPlayerProtectionData(playerId, seasonId = null) {
  try {
    const protectionRef = seasonId
      ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
      : doc(db, 'playerProtection', playerId)
    
    const protectionDoc = await getDoc(protectionRef)
    
    if (!protectionDoc.exists()) {
      return null
    }
    
    return protectionDoc.data()
  } catch (error) {
    // Log silencieux pour les erreurs non critiques (ex: document inexistant)
    if (error.code !== 'not-found' && error.code !== 'permission-denied') {
      logger.error('Erreur lors de la récupération des données de protection', error)
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
    const protectionCollection = seasonId
      ? collection(db, 'seasons', seasonId, 'playerProtection')
      : collection(db, 'playerProtection')
    const snap = await getDocs(protectionCollection)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
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
    // Requête globale (sans saison)
    const globalQ = query(collection(db, 'playerProtection'), where('email', '==', email))
    const globalSnap = await getDocs(globalQ)
    globalSnap.forEach((d) => {
      const data = d.data()
      if (data?.isProtected) results.push({ seasonId: null, playerId: d.id, ...data })
    })

    // Rechercher dans toutes les saisons connues via la collection seasons
    const seasonsSnap = await getDocs(collection(db, 'seasons'))
    for (const s of seasonsSnap.docs) {
      const sid = s.id
      const qProt = query(collection(db, 'seasons', sid, 'playerProtection'), where('email', '==', email))
      const protSnap = await getDocs(qProt)
      protSnap.forEach((d) => {
        const data = d.data()
        if (data?.isProtected) results.push({ seasonId: sid, seasonName: s.data()?.name, playerId: d.id, ...data })
      })
    }
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
// Finaliser l'association après vérification de l'email (sans création de compte)
export async function finalizeProtectionAfterVerification({ playerId, seasonId = null }) {
  const ref = seasonId
    ? doc(db, 'seasons', seasonId, 'playerProtection', playerId)
    : doc(db, 'playerProtection', playerId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Protection introuvable')
  const data = snap.data()
  // Si l'email est présent et vérifié, activer la protection
  if (data?.email) {
    await updateDoc(ref, { isProtected: true, updatedAt: new Date() })
    return { success: true }
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


