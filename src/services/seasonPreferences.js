// src/services/seasonPreferences.js
import { auth } from './firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'
import logger from './logger.js'

// Clés de stockage
const LAST_SEASON_KEY = 'lastVisitedSeason'
const LAST_SEASON_TIMESTAMP_KEY = 'lastVisitedSeasonTimestamp'

/**
 * Mémorise la dernière saison visitée par l'utilisateur
 * @param {string} seasonSlug - Le slug de la saison visitée
 */
export async function rememberLastVisitedSeason(seasonSlug) {
  if (!seasonSlug) return

  try {
    const user = auth.currentUser
    const userEmail = user?.email

    // Sauvegarder dans localStorage (fallback rapide)
    try {
      localStorage.setItem(LAST_SEASON_KEY, seasonSlug)
      localStorage.setItem(LAST_SEASON_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      logger.warn('Erreur lors de la sauvegarde localStorage', error)
    }

    // Si utilisateur connecté, sauvegarder dans Firebase (persistant)
    if (userEmail) {
      try {
        const userPrefsRef = doc(db, 'userPreferences', userEmail)
        await setDoc(userPrefsRef, {
          lastVisitedSeason: seasonSlug,
          lastVisitedSeasonTimestamp: Date.now()
        }, { merge: true })
        logger.debug('Préférence de saison sauvegardée dans Firebase', { seasonSlug, userEmail })
      } catch (error) {
        logger.warn('Erreur lors de la sauvegarde Firebase', error)
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la mémorisation de la saison', error)
  }
}

/**
 * Récupère la dernière saison visitée par l'utilisateur
 * @returns {Promise<string|null>} Le slug de la dernière saison visitée ou null
 */
export async function getLastVisitedSeason() {
  try {
    const user = auth.currentUser
    const userEmail = user?.email

    // Essayer Firebase en premier (plus fiable pour les utilisateurs connectés)
    if (userEmail) {
      try {
        const userPrefsRef = doc(db, 'userPreferences', userEmail)
        const userPrefsSnap = await getDoc(userPrefsRef)
        if (userPrefsSnap.exists()) {
          const prefs = userPrefsSnap.data()
          if (prefs.lastVisitedSeason) {
            logger.debug('Préférence de saison récupérée depuis Firebase', { seasonSlug: prefs.lastVisitedSeason })
            return prefs.lastVisitedSeason
          }
        }
      } catch (error) {
        logger.warn('Erreur lors de la récupération Firebase', error)
      }
    }

    // Fallback: localStorage
    try {
      const lastSeason = localStorage.getItem(LAST_SEASON_KEY)
      if (lastSeason) {
        logger.debug('Préférence de saison récupérée depuis localStorage', { seasonSlug: lastSeason })
        return lastSeason
      }
    } catch (error) {
      logger.warn('Erreur lors de la lecture localStorage', error)
    }

    return null
  } catch (error) {
    logger.error('Erreur lors de la récupération de la dernière saison', error)
    return null
  }
}

/**
 * Nettoie les préférences de saison (quand une saison n'existe plus)
 * @param {string} userEmail - L'email de l'utilisateur
 */
export async function clearLastSeasonPreference(userEmail = null) {
  try {
    const email = userEmail || auth.currentUser?.email

    // Nettoyer localStorage
    try {
      localStorage.removeItem(LAST_SEASON_KEY)
      localStorage.removeItem(LAST_SEASON_TIMESTAMP_KEY)
    } catch (error) {
      logger.warn('Erreur lors du nettoyage localStorage', error)
    }

    // Nettoyer Firebase si utilisateur connecté
    if (email) {
      try {
        const userPrefsRef = doc(db, 'userPreferences', email)
        await setDoc(userPrefsRef, { 
          lastVisitedSeason: null,
          lastVisitedSeasonTimestamp: null 
        }, { merge: true })
        logger.debug('Préférence de saison nettoyée dans Firebase', { userEmail: email })
      } catch (error) {
        logger.warn('Erreur lors du nettoyage Firebase', error)
      }
    }
  } catch (error) {
    logger.error('Erreur lors du nettoyage des préférences', error)
  }
}

/**
 * Vérifie si une saison existe dans la liste des saisons
 * @param {string} seasonSlug - Le slug de la saison à vérifier
 * @param {Array} seasons - La liste des saisons
 * @returns {boolean} True si la saison existe
 */
export function isSeasonValid(seasonSlug, seasons) {
  if (!seasonSlug || !seasons || !Array.isArray(seasons)) return false
  return seasons.some(season => season.slug === seasonSlug)
}
