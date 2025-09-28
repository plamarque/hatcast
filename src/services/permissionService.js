/**
 * Service de gestion des permissions HatCast
 * Gère les permissions Super Admin (Cloud Functions) et Admin de saison (Firestore)
 */

import { getAuth } from 'firebase/auth';
import logger from './logger.js';
import firestoreService from './firestoreService.js';
import { callCloudFunction } from './firebase.js';

class PermissionService {
  constructor() {
    this.auth = null;
    this.permissionStatus = {
      seasonPermissions: new Map(), // seasonId -> { admins: [], users: [], timestamp }
      checkValidity: 5 * 60 * 1000 // 5 minutes
    };
    
    // Cache pour Super Admin (unifié avec les permissions de saison)
    this.superAdminCache = null;
    this.superAdminCacheTimestamp = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return this;
    
    try {
      // Attendre que Firebase soit initialisé
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        try {
          this.auth = getAuth();
          if (this.auth) {
            break;
          }
        } catch (error) {
          // Firebase pas encore initialisé, attendre
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }
      
      if (!this.auth) {
        throw new Error('Impossible d\'initialiser Firebase Auth après plusieurs tentatives');
      }
      
      this.isInitialized = true;
      logger.info('✅ RoleService initialisé avec succès');
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation de PermissionService:', error);
      throw error;
    }
  }


  /**
   * Vérifie si l'utilisateur actuel est Super Admin
   * Gère directement le cache et la vérification Cloud Function
   */
  async isSuperAdmin(force = false) {
    try {
      const user = this.auth?.currentUser;
      
      if (!user?.email) {
        return false;
      }
      
      const now = Date.now();
      
      // Vérifier le cache si pas de force refresh
      if (!force && this.superAdminCache !== null && this.superAdminCacheTimestamp) {
        if (now - this.superAdminCacheTimestamp < this.permissionStatus.checkValidity) {
          logger.debug('🔐 Statut Super Admin récupéré du cache');
          return this.superAdminCache;
        }
      }
      
      logger.info('🔐 Vérification du statut Super Admin via Cloud Functions...');
      console.log('🔍 permissionService: Appel à callCloudFunction checkSuperAdminStatus');
      
      // Appeler la Cloud Function pour vérifier le statut Super Admin
      const result = await callCloudFunction('checkSuperAdminStatus');
      console.log('🔍 permissionService: Résultat de la Cloud Function:', result);
      const isAdmin = result.isSuperAdmin || false;
      
      // Mettre en cache
      this.superAdminCache = isAdmin;
      this.superAdminCacheTimestamp = now;
      
      logger.info(`🔐 Statut Super Admin: ${isAdmin ? '✅ OUI' : '❌ NON'}`);
      return isAdmin;
      
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification Super Admin:', error);
      
      // Fallback gracieux vers impropick@gmail.com en cas d'erreur
      const user = this.auth?.currentUser;
      const isFallback = user?.email === 'impropick@gmail.com';
      
      if (isFallback) {
        logger.warn('🔐 Utilisation du fallback de développement (impropick@gmail.com)');
        this.superAdminCache = true;
        this.superAdminCacheTimestamp = Date.now();
        return true;
      }
      
      // Pour tous les autres utilisateurs, retourner false en cas d'erreur
      this.superAdminCache = false;
      this.superAdminCacheTimestamp = Date.now();
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur actuel est Admin de saison pour une saison donnée
   */
  async isSeasonAdmin(seasonId, force = false) {
    try {
      // Super Admin a toujours accès à tout
      if (await this.isSuperAdmin(force)) {
        logger.info('🔐 Super Admin détecté - accès accordé à toutes les saisons');
        return true;
      }

      logger.info(`🔐 Vérification du statut Admin de saison ${seasonId} via Firestore...`);
      logger.debug('🔐 isSeasonAdmin - Début de la vérification');
      logger.debug('🔐 - Utilisateur actuel:', this.auth?.currentUser?.email || 'Non connecté');
      logger.debug('🔐 - Saison:', seasonId);
      
      // Utiliser la méthode Firestore directe (qui gère déjà le cache seasonRoles)
      const userEmail = this.auth?.currentUser?.email;
      if (!userEmail) {
        logger.warn('🔐 Pas d\'email utilisateur disponible');
        return false;
      }
      
      const isAdmin = await this.isUserSeasonAdmin(seasonId, userEmail);
      
      logger.info(`🔐 Statut Admin de saison ${seasonId}: ${isAdmin ? '✅ OUI' : '❌ NON'}`);
      logger.debug('🔐 - Statut Admin de saison final:', isAdmin);
      
      return isAdmin;
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification Admin de saison ${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut éditer les événements d'une saison
   * (Super Admin ou Admin de saison)
   */
  async canEditEvents(seasonId, force = false) {
    try {
      // Super Admin peut toujours éditer
      if (await this.isSuperAdmin(force)) {
        return true;
      }
      
      // Vérifier si Admin de saison
      return await this.isSeasonAdmin(seasonId, force);
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification des permissions d'édition pour ${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Force la vérification de toutes les permissions
   */
  async refreshAllPermissions() {
    try {
      // Nettoyer le cache des permissions de saison
      this.invalidateAllCache();
      
      // Forcer la vérification Super Admin
      await this.isSuperAdmin(true);
      
      logger.info('🔐 Cache des permissions complètement vidé et rafraîchi');
    } catch (error) {
      logger.error('❌ Erreur lors du rafraîchissement des permissions:', error);
    }
  }


  // Les méthodes de gestion des rôles de saison sont maintenant dans la section Firestore ci-dessous

  /**
   * Méthodes de compatibilité avec l'ancien adminService
   */
  async checkAdminStatus() {
    // Pour compatibilité avec l'ancien code
    return { isAdmin: await this.isSuperAdmin() };
  }

  async isAdmin() {
    // Pour compatibilité avec l'ancien code
    return await this.isSuperAdmin();
  }

  async refreshAdminStatus() {
    // Pour compatibilité avec l'ancien code
    return await this.refreshAllPermissions();
  }

  async refreshAllRoles() {
    // Pour compatibilité avec l'ancien code
    return await this.refreshAllPermissions();
  }

  // ========================================
  // GESTION DES PERMISSIONS DE SAISON (FIRESTORE)
  // ========================================

  /**
   * Récupère les permissions d'une saison depuis Firestore
   */
  async getSeasonRoles(seasonId, force = false) {
    try {
      const now = Date.now();
      
      // Vérifier le cache
      if (!force && this.permissionStatus.seasonPermissions.has(seasonId)) {
        const cached = this.permissionStatus.seasonPermissions.get(seasonId);
        if (cached.timestamp && (now - cached.timestamp) < this.permissionStatus.checkValidity) {
          logger.debug(`🔐 Permissions de saison ${seasonId} récupérés du cache`);
          return cached;
        }
      }

      logger.info(`🔐 Récupération des permissions de saison ${seasonId} depuis Firestore`);
      
      const seasonDoc = await firestoreService.getDocument('seasons', seasonId);
      console.log('🔍 DEBUG getSeasonRoles: seasonDoc reçu:', seasonDoc);
      console.log('🔍 DEBUG getSeasonRoles: seasonDoc.roles:', seasonDoc?.roles);
      const roles = seasonDoc?.roles || { admins: [], users: [] };
      console.log('🔍 DEBUG getSeasonRoles: roles final:', roles);
      
      // Ajouter timestamp pour le cache
      const rolesWithTimestamp = {
        ...roles,
        timestamp: now
      };
      
      this.permissionStatus.seasonPermissions.set(seasonId, rolesWithTimestamp);
      
      logger.info(`🔐 Permissions de saison ${seasonId} chargés:`, {
        admins: roles.admins?.length || 0,
        users: roles.users?.length || 0
      });
      
      return rolesWithTimestamp;
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des permissions de saison ${seasonId}:`, error);
      return { admins: [], users: [], timestamp: Date.now() };
    }
  }

  /**
   * Vérifie si un utilisateur est admin d'une saison (Firestore direct)
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
   * Ajoute un admin à une saison (Firestore direct)
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
            }
          });
        } else {
          // Mettre à jour le document existant
          await firestoreService.updateDocument('seasons', seasonId, {
            'roles.admins': roles.admins
          });
        }
        
        // Invalider le cache
        this.permissionStatus.seasonPermissions.delete(seasonId);
        
        logger.info(`✅ Admin ${userEmail} ajouté à la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} est déjà admin de la saison ${seasonId}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur lors de l'ajout de l'admin ${userEmail} à la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Retire un admin d'une saison (Firestore direct)
   */
  async removeSeasonAdmin(seasonId, userEmail, revokedBy) {
    try {
      logger.info(`🔐 Retrait de l'admin ${userEmail} de la saison ${seasonId} par ${revokedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      const adminIndex = roles.admins.indexOf(userEmail);
      if (adminIndex !== -1) {
        roles.admins.splice(adminIndex, 1);
        
        // Mettre à jour Firestore
        await firestoreService.updateDocument('seasons', seasonId, {
          'roles.admins': roles.admins
        });
        
        // Invalider le cache
        this.permissionStatus.seasonPermissions.delete(seasonId);
        
        logger.info(`✅ Admin ${userEmail} retiré de la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} n'était pas admin de la saison ${seasonId}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur lors du retrait de l'admin ${userEmail} de la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Ajoute un user à une saison (Firestore direct)
   */
  async addSeasonUser(seasonId, userEmail, grantedBy) {
    try {
      logger.info(`🔐 Ajout de l'utilisateur ${userEmail} à la saison ${seasonId} par ${grantedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      if (!roles.users.includes(userEmail)) {
        roles.users.push(userEmail);
        
        // Vérifier si le document existe, sinon le créer
        const seasonDoc = await firestoreService.getDocument('seasons', seasonId);
        if (!seasonDoc) {
          logger.info(`🔐 Création du document seasons/${seasonId}`);
          await firestoreService.setDocument('seasons', seasonId, {
            roles: {
              admins: roles.admins,
              users: roles.users
            }
          });
        } else {
          // Mettre à jour le document existant
          await firestoreService.updateDocument('seasons', seasonId, {
            'roles.users': roles.users
          });
        }
        
        // Invalider le cache
        this.permissionStatus.seasonPermissions.delete(seasonId);
        
        logger.info(`✅ Utilisateur ${userEmail} ajouté à la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} est déjà utilisateur de la saison ${seasonId}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur lors de l'ajout de l'utilisateur ${userEmail} à la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Retire un user d'une saison (Firestore direct)
   */
  async removeSeasonUser(seasonId, userEmail, revokedBy) {
    try {
      logger.info(`🔐 Retrait de l'utilisateur ${userEmail} de la saison ${seasonId} par ${revokedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      const userIndex = roles.users.indexOf(userEmail);
      if (userIndex !== -1) {
        roles.users.splice(userIndex, 1);
        
        // Mettre à jour Firestore
        await firestoreService.updateDocument('seasons', seasonId, {
          'roles.users': roles.users
        });
        
        // Invalider le cache
        this.permissionStatus.seasonPermissions.delete(seasonId);
        
        logger.info(`✅ Utilisateur ${userEmail} retiré de la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} n'était pas utilisateur de la saison ${seasonId}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur lors du retrait de l'utilisateur ${userEmail} de la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Liste les rôles d'une saison
   */
  async listSeasonRoles(seasonId) {
    try {
      const roles = await this.getSeasonRoles(seasonId);
      return {
        admins: roles.admins || [],
        users: roles.users || []
      };
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des permissions de saison ${seasonId}:`, error);
      return { admins: [], users: [] };
    }
  }

  /**
   * Invalide le cache des rôles de saison pour une saison spécifique
   */
  invalidateSeasonCache(seasonId) {
    this.permissionStatus.seasonPermissions.delete(seasonId);
    logger.debug(`🔐 Cache invalidé pour la saison ${seasonId}`);
  }

  /**
   * DEBUG: Fonction temporaire pour créer le document seasons manquant
   */
  async debugCreateSeasonDocument(seasonId, adminEmail) {
    try {
      console.log(`🔧 DEBUG: Création du document seasons/${seasonId} avec ${adminEmail} comme admin`);
      
      const seasonDoc = {
        roles: {
          admins: [adminEmail],
          users: []
        }
      };
      
      await firestoreService.setDocument('seasons', seasonId, seasonDoc);
      console.log(`✅ DEBUG: Document seasons/${seasonId} créé avec succès`);
      
      // Invalider le cache pour forcer le rechargement
      this.invalidateSeasonCache(seasonId);
      
      return true;
    } catch (error) {
      console.error(`❌ DEBUG: Erreur lors de la création du document seasons/${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Initialise les rôles d'une nouvelle saison avec le créateur comme admin
   */
  async initializeSeasonRoles(seasonId, creatorEmail) {
    try {
      logger.info(`🔐 Initialisation des rôles pour la saison ${seasonId} avec ${creatorEmail} comme admin`);
      
      const initialRoles = {
        admins: [creatorEmail],
        users: []
      };
      
      await firestoreService.setDocument('seasons', seasonId, {
        roles: initialRoles
      });
      
      // Invalider le cache pour cette saison
      this.invalidateSeasonCache(seasonId);
      
      logger.info(`✅ Rôles initialisés pour la saison ${seasonId}`);
    } catch (error) {
      logger.error(`❌ Erreur lors de l'initialisation des rôles pour la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Invalide le cache Super Admin
   */
  invalidateSuperAdminCache() {
    this.superAdminCache = null;
    this.superAdminCacheTimestamp = null;
    logger.debug('🔐 Cache Super Admin invalidé');
  }

  /**
   * Invalide tout le cache des permissions
   */
  invalidateAllCache() {
    this.permissionStatus.seasonPermissions.clear();
    this.invalidateSuperAdminCache();
    logger.debug('🔐 Cache complet invalidé');
  }
}

// Instance singleton
const permissionService = new PermissionService();

// DEBUG: Exposer la fonction de debug globalement
window.debugPermissionService = {
  createSeasonDocument: (seasonId, adminEmail) => permissionService.debugCreateSeasonDocument(seasonId, adminEmail),
  clearCache: () => permissionService.invalidateAllCache(),
  getStatus: () => ({
    isInitialized: permissionService.isInitialized,
    seasonPermissions: Object.fromEntries(permissionService.permissionStatus.seasonPermissions),
    superAdminCache: permissionService.superAdminCache
  })
};

export default permissionService;
