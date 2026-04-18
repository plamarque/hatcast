// src/services/rolePreferencesService.js
import { getFirebaseAuth } from './firebase.js'
import firestoreService from './firestoreService.js'
import logger from './logger.js'
import { ROLES } from './storage.js'

/**
 * Service pour gérer les préférences de rôles des utilisateurs
 */

/**
 * Récupère les préférences de rôles de l'utilisateur connecté
 * @returns {Promise<Object>} Les préférences de rôles ou les valeurs par défaut
 */
export async function getUserRolePreferences() {
  try {
    const auth = getFirebaseAuth()
    const user = auth?.currentUser
    
    if (!user?.email) {
      logger.debug('Aucun utilisateur connecté, utilisation des préférences par défaut')
      return getDefaultRolePreferences()
    }

    const prefsData = await firestoreService.getDocument('userPreferences', user.email)
    
    if (prefsData?.rolePreferences) {
      logger.debug('Préférences de rôles récupérées', { 
        email: user.email, 
        preferences: prefsData.rolePreferences 
      })
      return prefsData.rolePreferences
    }

    // Si pas de préférences définies, retourner les valeurs par défaut
    logger.debug('Aucune préférence de rôles définie, utilisation des valeurs par défaut')
    return getDefaultRolePreferences()
  } catch (error) {
    logger.warn('Erreur lors de la récupération des préférences de rôles', error)
    return getDefaultRolePreferences()
  }
}

/**
 * Sauvegarde les préférences de rôles de l'utilisateur connecté
 * @param {Object} rolePreferences - Les préférences de rôles à sauvegarder
 * @returns {Promise<boolean>} True si la sauvegarde a réussi
 */
export async function saveUserRolePreferences(rolePreferences) {
  try {
    const auth = getFirebaseAuth()
    const user = auth?.currentUser
    
    if (!user?.email) {
      logger.warn('Impossible de sauvegarder les préférences : aucun utilisateur connecté')
      return false
    }

    // Valider les préférences
    const validatedPreferences = validateRolePreferences(rolePreferences)
    
    await firestoreService.setDocument('userPreferences', user.email, {
      rolePreferences: validatedPreferences,
      updatedAt: new Date()
    }, { merge: true })

    logger.debug('Préférences de rôles sauvegardées', { 
      email: user.email, 
      preferences: validatedPreferences 
    })
    return true
  } catch (error) {
    logger.error('Erreur lors de la sauvegarde des préférences de rôles', error)
    return false
  }
}

/**
 * Retourne les préférences de rôles par défaut
 * @returns {Object} Les préférences par défaut
 */
export function getDefaultRolePreferences() {
  return {
    // Par défaut, tous les rôles sont précochés (comportement actuel)
    preferredRoles: [ROLES.PLAYER, ROLES.VOLUNTEER, ROLES.DIRECTOR, ROLES.TECHNICIAN, ROLES.ORGANIZER],
    // Le rôle bénévole est toujours précoché et ne peut pas être désactivé
    volunteerAlwaysSelected: true
  }
}

/**
 * Valide et nettoie les préférences de rôles
 * @param {Object} preferences - Les préférences à valider
 * @returns {Object} Les préférences validées
 */
function validateRolePreferences(preferences) {
  const validRoles = Object.values(ROLES)
  
  // S'assurer que preferredRoles est un tableau
  let preferredRoles = Array.isArray(preferences.preferredRoles) 
    ? preferences.preferredRoles 
    : getDefaultRolePreferences().preferredRoles

  // Filtrer pour ne garder que les rôles valides
  preferredRoles = preferredRoles.filter(role => validRoles.includes(role))

  // S'assurer que le rôle bénévole est toujours inclus
  if (!preferredRoles.includes(ROLES.VOLUNTEER)) {
    preferredRoles.push(ROLES.VOLUNTEER)
  }

  return {
    preferredRoles,
    volunteerAlwaysSelected: true // Toujours true, non modifiable
  }
}

/**
 * Filtre les rôles disponibles selon les préférences de l'utilisateur
 * @param {Array} availableRoles - Les rôles disponibles pour l'événement
 * @param {Object} userPreferences - Les préférences de l'utilisateur
 * @returns {Array} Les rôles à pré-cocher
 */
export function getPreferredRolesForEvent(availableRoles, userPreferences) {
  console.log('getPreferredRolesForEvent appelée avec:', {
    availableRoles,
    userPreferences,
    hasPreferredRoles: !!userPreferences?.preferredRoles
  })
  
  if (!userPreferences?.preferredRoles) {
    console.log('Pas de préférences, retour des rôles disponibles:', availableRoles)
    return availableRoles
  }

  // Filtrer les rôles disponibles selon les préférences
  const preferredRoles = availableRoles.filter(role => 
    userPreferences.preferredRoles.includes(role)
  )
  
  console.log('Rôles filtrés selon les préférences:', preferredRoles)

  // S'assurer que le rôle bénévole est toujours inclus s'il est disponible
  if (availableRoles.includes(ROLES.VOLUNTEER) && !preferredRoles.includes(ROLES.VOLUNTEER)) {
    preferredRoles.push(ROLES.VOLUNTEER)
    console.log('Rôle bénévole ajouté automatiquement')
  }

  console.log('Rôles finaux retournés:', preferredRoles)
  return preferredRoles
}

/**
 * Vérifie si un rôle peut être désactivé par l'utilisateur
 * @param {string} role - Le rôle à vérifier
 * @returns {boolean} True si le rôle peut être désactivé
 */
export function canDisableRole(role) {
  // Le rôle bénévole ne peut jamais être désactivé
  return role !== ROLES.VOLUNTEER
}
