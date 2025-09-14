/**
 * Service de gestion des rôles par saison HatCast
 * Gère les rôles Admin et User au niveau des saisons
 */

import firestoreService from './firestoreService.js';
import logger from './logger.js';

class SeasonRoleService {
  constructor() {
    this.rolesCache = new Map(); // seasonId -> { admins: [], users: [], timestamp }
    this.cacheValidity = 2 * 60 * 1000; // 2 minutes
  }

  /**
   * Récupère les rôles d'une saison depuis Firestore
   */
  async getSeasonRoles(seasonId, force = false) {
    try {
      const now = Date.now();
      
      // Vérifier le cache
      if (!force && this.rolesCache.has(seasonId)) {
        const cached = this.rolesCache.get(seasonId);
        if (cached.timestamp && (now - cached.timestamp) < this.cacheValidity) {
          logger.debug(`🔐 Rôles de saison ${seasonId} récupérés du cache`);
          return cached;
        }
      }

      logger.info(`🔐 Récupération des rôles pour la saison ${seasonId}`);
      
      // Récupérer depuis Firestore
      const seasonDoc = await firestoreService.getDocument('seasons', seasonId);
      
      if (!seasonDoc) {
        logger.warn(`⚠️ Saison ${seasonId} non trouvée`);
        return { admins: [], users: [], timestamp: now };
      }

      const roles = seasonDoc.roles || { admins: [], users: [] };
      
      // Mettre en cache
      const cachedData = {
        admins: roles.admins || [],
        users: roles.users || [],
        timestamp: now
      };
      
      this.rolesCache.set(seasonId, cachedData);
      
      logger.info(`🔐 Rôles récupérés pour ${seasonId}:`, {
        admins: cachedData.admins.length,
        users: cachedData.users.length
      });
      
      return cachedData;
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des rôles pour ${seasonId}:`, error);
      return { admins: [], users: [], timestamp: Date.now() };
    }
  }

  /**
   * Vérifie si un utilisateur est admin d'une saison
   */
  async isUserSeasonAdmin(seasonId, userEmail) {
    try {
      const roles = await this.getSeasonRoles(seasonId);
      return roles.admins.includes(userEmail);
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification du rôle admin pour ${userEmail} dans ${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si un utilisateur est user d'une saison
   */
  async isUserSeasonUser(seasonId, userEmail) {
    try {
      const roles = await this.getSeasonRoles(seasonId);
      return roles.users.includes(userEmail);
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification du rôle user pour ${userEmail} dans ${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Ajoute un admin à une saison
   */
  async addSeasonAdmin(seasonId, userEmail, grantedBy) {
    try {
      logger.info(`🔐 Ajout de l'admin ${userEmail} à la saison ${seasonId} par ${grantedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      if (!roles.admins.includes(userEmail)) {
        roles.admins.push(userEmail);
        
        // Vérifier si le document existe, sinon le créer
        const seasonDoc = await firestoreService.getDocument('seasons', seasonId);
        if (!seasonDoc) {
          logger.info(`🔐 Création du document seasons/${seasonId}`);
          await firestoreService.setDocument('seasons', seasonId, {
            roles: {
              admins: roles.admins,
              users: roles.users
            },
            createdAt: new Date().toISOString(),
            createdBy: grantedBy
          });
        } else {
          // Mettre à jour le document existant
          await firestoreService.updateDocument('seasons', seasonId, {
            roles: {
              admins: roles.admins,
              users: roles.users
            }
          });
        }
        
        // Invalider le cache
        this.rolesCache.delete(seasonId);
        
        // Log d'audit
        await this.logRoleChange(seasonId, userEmail, 'admin', 'granted', grantedBy);
        
        logger.info(`✅ Admin ${userEmail} ajouté à la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} est déjà admin de la saison ${seasonId}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'ajout de l'admin ${userEmail} à ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Retire un admin d'une saison
   */
  async removeSeasonAdmin(seasonId, userEmail, revokedBy) {
    try {
      logger.info(`🔐 Retrait de l'admin ${userEmail} de la saison ${seasonId} par ${revokedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      const adminIndex = roles.admins.indexOf(userEmail);
      if (adminIndex > -1) {
        roles.admins.splice(adminIndex, 1);
        
        // Mettre à jour Firestore
        await firestoreService.updateDocument('seasons', seasonId, {
          roles: {
            admins: roles.admins,
            users: roles.users
          }
        });
        
        // Invalider le cache
        this.rolesCache.delete(seasonId);
        
        // Log d'audit
        await this.logRoleChange(seasonId, userEmail, 'admin', 'revoked', revokedBy);
        
        logger.info(`✅ Admin ${userEmail} retiré de la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} n'était pas admin de la saison ${seasonId}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`❌ Erreur lors du retrait de l'admin ${userEmail} de ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Ajoute un user à une saison
   */
  async addSeasonUser(seasonId, userEmail, grantedBy) {
    try {
      logger.info(`🔐 Ajout de l'utilisateur ${userEmail} à la saison ${seasonId} par ${grantedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      if (!roles.users.includes(userEmail)) {
        roles.users.push(userEmail);
        
        // Mettre à jour Firestore
        await firestoreService.updateDocument('seasons', seasonId, {
          roles: {
            admins: roles.admins,
            users: roles.users
          }
        });
        
        // Invalider le cache
        this.rolesCache.delete(seasonId);
        
        // Log d'audit
        await this.logRoleChange(seasonId, userEmail, 'user', 'granted', grantedBy);
        
        logger.info(`✅ Utilisateur ${userEmail} ajouté à la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} est déjà utilisateur de la saison ${seasonId}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'ajout de l'utilisateur ${userEmail} à ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Retire un user d'une saison
   */
  async removeSeasonUser(seasonId, userEmail, revokedBy) {
    try {
      logger.info(`🔐 Retrait de l'utilisateur ${userEmail} de la saison ${seasonId} par ${revokedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      const userIndex = roles.users.indexOf(userEmail);
      if (userIndex > -1) {
        roles.users.splice(userIndex, 1);
        
        // Mettre à jour Firestore
        await firestoreService.updateDocument('seasons', seasonId, {
          roles: {
            admins: roles.admins,
            users: roles.users
          }
        });
        
        // Invalider le cache
        this.rolesCache.delete(seasonId);
        
        // Log d'audit
        await this.logRoleChange(seasonId, userEmail, 'user', 'revoked', revokedBy);
        
        logger.info(`✅ Utilisateur ${userEmail} retiré de la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} n'était pas utilisateur de la saison ${seasonId}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`❌ Erreur lors du retrait de l'utilisateur ${userEmail} de ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Liste tous les rôles d'une saison
   */
  async listSeasonRoles(seasonId) {
    try {
      const roles = await this.getSeasonRoles(seasonId);
      
      return {
        admins: roles.admins,
        users: roles.users,
        totalAdmins: roles.admins.length,
        totalUsers: roles.users.length
      };
    } catch (error) {
      logger.error(`❌ Erreur lors du listage des rôles pour ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Vide le cache des rôles
   */
  clearCache(seasonId = null) {
    if (seasonId) {
      this.rolesCache.delete(seasonId);
      logger.debug(`🔐 Cache des rôles vidé pour ${seasonId}`);
    } else {
      this.rolesCache.clear();
      logger.debug('🔐 Cache de tous les rôles vidé');
    }
  }

  /**
   * Log les changements de rôles pour audit
   */
  async logRoleChange(seasonId, userEmail, role, action, performedBy) {
    try {
      const auditLog = {
        seasonId,
        userEmail,
        role,
        action, // 'granted' ou 'revoked'
        performedBy,
        timestamp: new Date().toISOString(),
        type: 'role_change'
      };
      
      // Sauvegarder dans Firestore
      await firestoreService.addDocument('audit_logs', auditLog);
      
      logger.info(`📝 Audit log créé pour changement de rôle:`, auditLog);
    } catch (error) {
      logger.error('❌ Erreur lors de la création du log d\'audit:', error);
      // Ne pas faire échouer l'opération principale pour un problème de log
    }
  }

  /**
   * Initialise les rôles pour une nouvelle saison
   */
  async initializeSeasonRoles(seasonId, creatorEmail) {
    try {
      logger.info(`🔐 Initialisation des rôles pour la nouvelle saison ${seasonId}`);
      
      const initialRoles = {
        roles: {
          admins: [creatorEmail], // Le créateur devient admin par défaut
          users: []
        }
      };
      
      await firestoreService.updateDocument('seasons', seasonId, initialRoles);
      
      // Invalider le cache
      this.rolesCache.delete(seasonId);
      
      // Log d'audit
      await this.logRoleChange(seasonId, creatorEmail, 'admin', 'granted', 'system');
      
      logger.info(`✅ Rôles initialisés pour ${seasonId} avec ${creatorEmail} comme admin`);
      
      return true;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'initialisation des rôles pour ${seasonId}:`, error);
      throw error;
    }
  }
}

// Instance singleton
const seasonRoleService = new SeasonRoleService();

export default seasonRoleService;
