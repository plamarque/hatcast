import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { currentUser } from './authState.js'

/**
 * Service de gestion des profils utilisateur
 * Gère le pseudo et les préférences utilisateur
 */

/**
 * Récupère le profil utilisateur actuel
 * @returns {Promise<Object|null>} Profil utilisateur ou null si non trouvé
 */
export async function getUserProfile() {
  try {
    const user = currentUser.value
    if (!user || !user.email) {
      logger.debug('Aucun utilisateur connecté pour récupérer le profil')
      return null
    }

    const profile = await firestoreService.getDocument('userProfiles', user.email)
    logger.debug('Profil utilisateur récupéré', { email: user.email, hasProfile: !!profile })
    return profile
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil utilisateur', error)
    return null
  }
}

/**
 * Récupère le pseudo de l'utilisateur actuel
 * @returns {Promise<string|null>} Pseudo ou null si non défini
 */
export async function getUserPseudo() {
  try {
    const profile = await getUserProfile()
    return profile?.pseudo || null
  } catch (error) {
    logger.error('Erreur lors de la récupération du pseudo', error)
    return null
  }
}

/**
 * Crée ou met à jour le profil utilisateur
 * @param {Object} profileData - Données du profil
 * @returns {Promise<Object>} Profil créé/mis à jour
 */
export async function saveUserProfile(profileData) {
  try {
    const user = currentUser.value
    if (!user || !user.email) {
      throw new Error('Utilisateur non connecté')
    }

    const profile = {
      email: user.email,
      firebaseUid: user.uid,
      updatedAt: new Date(),
      ...profileData
    }

    // Si c'est une création, ajouter createdAt
    if (!profile.createdAt) {
      profile.createdAt = new Date()
    }

    await firestoreService.setDocument('userProfiles', user.email, profile, true)
    logger.info('Profil utilisateur sauvegardé', { email: user.email, pseudo: profile.pseudo })
    return profile
  } catch (error) {
    logger.error('Erreur lors de la sauvegarde du profil utilisateur', error)
    throw error
  }
}

/**
 * Définit le pseudo de l'utilisateur
 * @param {string} pseudo - Nouveau pseudo
 * @returns {Promise<Object>} Profil mis à jour
 */
export async function setUserPseudo(pseudo) {
  try {
    if (!pseudo || !pseudo.trim()) {
      throw new Error('Le pseudo ne peut pas être vide')
    }

    const trimmedPseudo = pseudo.trim()
    const profile = await saveUserProfile({ pseudo: trimmedPseudo })
    
    logger.info('Pseudo utilisateur défini', { 
      email: profile.email, 
      pseudo: trimmedPseudo 
    })
    
    return profile
  } catch (error) {
    logger.error('Erreur lors de la définition du pseudo', error)
    throw error
  }
}

/**
 * Met à jour le pseudo et synchronise les noms des joueurs associés
 * @param {string} newPseudo - Nouveau pseudo
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export async function updateUserPseudo(newPseudo) {
  try {
    const user = currentUser.value
    if (!user || !user.email) {
      throw new Error('Utilisateur non connecté')
    }

    const trimmedPseudo = newPseudo.trim()
    if (!trimmedPseudo) {
      throw new Error('Le pseudo ne peut pas être vide')
    }

    // Récupérer l'ancien pseudo
    const currentProfile = await getUserProfile()
    const oldPseudo = currentProfile?.pseudo

    // Mettre à jour le profil
    const updatedProfile = await saveUserProfile({ pseudo: trimmedPseudo })

    // Si l'ancien pseudo existait, mettre à jour tous les joueurs associés
    if (oldPseudo && oldPseudo !== trimmedPseudo) {
      await updatePlayersWithNewPseudo(oldPseudo, trimmedPseudo, user.email)
    }

    logger.info('Pseudo utilisateur mis à jour', { 
      email: user.email, 
      oldPseudo, 
      newPseudo: trimmedPseudo 
    })

    return {
      success: true,
      profile: updatedProfile,
      oldPseudo,
      newPseudo: trimmedPseudo
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du pseudo', error)
    throw error
  }
}

/**
 * Met à jour tous les joueurs associés à un email avec le nouveau pseudo
 * @param {string} oldPseudo - Ancien pseudo
 * @param {string} newPseudo - Nouveau pseudo
 * @param {string} userEmail - Email de l'utilisateur
 */
async function updatePlayersWithNewPseudo(oldPseudo, newPseudo, userEmail) {
  try {
    logger.info('Mise à jour des joueurs avec le nouveau pseudo', { 
      oldPseudo, 
      newPseudo, 
      userEmail 
    })

    // Récupérer toutes les associations de cet utilisateur
    const { listAssociationsForEmail } = await import('./playerProtection.js')
    const associations = await listAssociationsForEmail(userEmail)

    // Mettre à jour chaque joueur associé qui porte l'ancien nom
    for (const association of associations) {
      try {
        if (association.seasonId) {
          // Récupérer le joueur
          const player = await firestoreService.getDocument(
            'seasons', 
            association.seasonId, 
            'players', 
            association.playerId
          )

          // Si le joueur porte l'ancien pseudo, le mettre à jour
          if (player && player.name === oldPseudo) {
            await firestoreService.updateDocument(
              'seasons',
              association.seasonId,
              { name: newPseudo },
              'players',
              association.playerId
            )
            
            logger.info('Joueur mis à jour avec le nouveau pseudo', {
              seasonId: association.seasonId,
              playerId: association.playerId,
              oldName: oldPseudo,
              newName: newPseudo
            })
          }
        }
      } catch (error) {
        logger.warn('Erreur lors de la mise à jour d\'un joueur', {
          error: error.message,
          seasonId: association.seasonId,
          playerId: association.playerId
        })
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des joueurs avec le nouveau pseudo', error)
    throw error
  }
}

/**
 * Initialise le pseudo avec le nom du premier joueur protégé ou créé
 * @param {string} playerName - Nom du joueur
 * @returns {Promise<Object>} Profil mis à jour
 */
export async function initializePseudoWithPlayerName(playerName) {
  try {
    const user = currentUser.value
    if (!user || !user.email) {
      throw new Error('Utilisateur non connecté')
    }

    // Vérifier si le pseudo est déjà défini
    const currentProfile = await getUserProfile()
    if (currentProfile?.pseudo) {
      logger.debug('Pseudo déjà défini, pas d\'initialisation', { 
        email: user.email, 
        existingPseudo: currentProfile.pseudo 
      })
      return currentProfile
    }

    // Définir le pseudo avec le nom du joueur
    const profile = await setUserPseudo(playerName)
    
    logger.info('Pseudo initialisé avec le nom du joueur', { 
      email: user.email, 
      pseudo: playerName 
    })
    
    return profile
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation du pseudo', error)
    throw error
  }
}
