// src/services/playerProtection.js
// DEPRECATED: Ce fichier est maintenu uniquement pour la migration
// Toutes les nouvelles fonctionnalités doivent utiliser players.js

import logger from './logger.js'
import firestoreService from './firestoreService.js'

// Re-export des fonctions depuis players.js pour compatibilité
export {
  addPreferredPlayerLocal,
  removePreferredPlayerLocal,
  isPlayerProtected,
  getPlayerData as getPlayerProtectionData,
  getPlayerEmail,
  listProtectedPlayers,
  listAssociationsForEmail,
  protectPlayer,
  startEmailVerificationForProtection,
  markEmailVerifiedForProtection,
  clearEmailVerificationForProtection,
  unprotectPlayer,
  verifyPlayerPassword,
  sendPasswordResetEmail,
  updatePlayerPasswordInFirebaseAuth,
  isPlayerPasswordCached,
  getCachedPlayerPassword,
  requirePlayerPasswordForAvailability
} from './players.js'

// FONCTION DE MIGRATION: Synchroniser les données de playerProtection vers les documents players
export async function migratePlayerProtectionToPlayers(seasonId) {
  logger.warn('DEPRECATED: migratePlayerProtectionToPlayers reads from playerProtection collection. Use players collection instead.')
  try {
    logger.info('Début migration playerProtection vers players', { seasonId })
    
    // Récupérer toutes les protections de cette saison
    const protections = await firestoreService.getDocuments('seasons', seasonId, 'playerProtection')
    logger.debug(`Migration: ${protections.length} protections trouvées dans ${seasonId}`)
    
    let migrated = 0
    let errors = 0
    
    for (const protection of protections) {
      try {
        const playerId = protection.id
        const email = protection.email
        const isProtected = protection.isProtected
        
        if (email && isProtected) {
          // Mettre à jour le document player avec toutes les données de protection
          await firestoreService.updateDocument('seasons', seasonId, {
            email: email,
            isProtected: isProtected,
            firebaseUid: protection.firebaseUid || null,
            photoURL: protection.photoURL || null,
            emailVerifiedAt: protection.emailVerifiedAt || null,
            createdAt: protection.createdAt || null,
            updatedAt: new Date()
          }, 'players', playerId)
          
          migrated++
          logger.debug(`Migration: ${playerId} migré avec email ${email}`)
        }
      } catch (error) {
        errors++
        logger.warn(`Migration: Erreur pour ${protection.id}:`, error)
      }
    }
    
    logger.info(`Migration terminée: ${migrated} joueurs migrés, ${errors} erreurs`)
    return { migrated, errors, total: protections.length }
  } catch (error) {
    logger.error('Erreur lors de la migration:', error)
    throw error
  }
}
