/**
 * Service de gestion des permissions HatCast
 * Gère les permissions Super Admin (Cloud Functions) et Admin de saison (Firestore)
 */

import { getAuth } from 'firebase/auth';
import logger from './logger.js';
import firestoreService from './firestoreService.js';
import { callCloudFunction } from './firebase.js';
import configService from './configService.js';

class PermissionService {
  constructor() {
    this.auth = null;
    
    // Désactiver le cache en développement pour faciliter les tests
    // En production/staging, utiliser un cache de 5 minutes pour réduire les coûts
    const environment = configService.getEnvironment();
    const checkValidity = environment === 'development' ? 0 : 5 * 60 * 1000; // 0 en dev, 5 min en prod/staging
    
    this.permissionStatus = {
      seasonPermissions: new Map(), // seasonId -> { admins: [], users: [], timestamp }
      eventPermissions: new Map(), // eventId -> { admins: [], timestamp }
      checkValidity: checkValidity
    };
    
    // Cache pour Super Admin (unifié avec les permissions de saison)
    this.superAdminCache = null;
    this.superAdminCacheTimestamp = null;
    this.isInitialized = false;
    
    if (environment === 'development') {
      logger.info('🔐 Cache des permissions désactivé en développement pour faciliter les tests');
    }
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
   * Vérifie si un utilisateur donné (par email) est Super Admin
   * @param {string} userEmail - Email de l'utilisateur à vérifier
   * @returns {Promise<boolean>} - true si l'utilisateur est Super Admin
   */
  async isUserSuperAdmin(userEmail) {
    try {
      if (!userEmail) {
        return false;
      }

      const normalizedEmail = this.normalizeEmail(userEmail);
      logger.info(`🔐 Vérification du statut Super Admin pour ${normalizedEmail} via Cloud Functions...`);
      
      // Appeler la Cloud Function avec l'email normalisé en paramètre
      const result = await callCloudFunction('checkSuperAdminStatus', { userEmail: normalizedEmail });
      const isAdmin = result.isSuperAdmin || false;
      
      logger.info(`🔐 Statut Super Admin pour ${normalizedEmail}: ${isAdmin ? '✅ OUI' : '❌ NON'}`);
      return isAdmin;
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification Super Admin pour ${userEmail}:`, error);
      return false;
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
      
      // En développement, retry une fois en cas d'erreur
      const environment = configService.getEnvironment();
      const maxRetries = environment === 'development' ? 2 : 1;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
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
          lastError = error;
          logger.warn(`⚠️ Tentative ${attempt}/${maxRetries} échouée pour vérifier Super Admin:`, error);
          if (attempt < maxRetries) {
            // Attendre un peu avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // Si toutes les tentatives ont échoué
      logger.error('❌ Erreur lors de la vérification Super Admin après toutes les tentatives:', lastError);
      
      // Fallback gracieux vers impropick@gmail.com en cas d'erreur
      const currentUser = this.auth?.currentUser;
      const isFallback = currentUser?.email === 'impropick@gmail.com';
      
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
    } catch (error) {
      // Erreur inattendue (ne devrait pas arriver car toutes les erreurs sont gérées dans la boucle)
      logger.error('❌ Erreur inattendue lors de la vérification Super Admin:', error);
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
   * Récupère les admins d'un événement depuis Firestore
   */
  async getEventAdmins(eventId, seasonId, force = false) {
    try {
      const now = Date.now();
      const cacheKey = `${seasonId}/${eventId}`;
      
      // Vérifier le cache
      if (!force && this.permissionStatus.eventPermissions.has(cacheKey)) {
        const cached = this.permissionStatus.eventPermissions.get(cacheKey);
        if (cached.timestamp && (now - cached.timestamp) < this.permissionStatus.checkValidity) {
          logger.debug(`🔐 Admins d'événement ${eventId} récupérés du cache`);
          return cached.admins || [];
        }
      }

      logger.info(`🔐 Récupération des admins d'événement ${eventId} depuis Firestore`);
      
      const eventDoc = await firestoreService.getDocument('seasons', seasonId, 'events', eventId);
      const eventAdmins = eventDoc?.eventAdmins || [];
      
      // Mettre en cache
      this.permissionStatus.eventPermissions.set(cacheKey, {
        admins: eventAdmins,
        timestamp: now
      });
      
      logger.info(`🔐 Admins d'événement ${eventId} chargés: ${eventAdmins.length}`);
      
      return eventAdmins;
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des admins d'événement ${eventId}:`, error);
      return [];
    }
  }

  /**
   * Vérifie si l'utilisateur actuel est Admin d'un événement spécifique
   */
  async isEventAdmin(eventId, seasonId, force = false) {
    try {
      // Super Admin a toujours accès à tout
      if (await this.isSuperAdmin(force)) {
        logger.info('🔐 Super Admin détecté - accès accordé à tous les événements');
        return true;
      }

      logger.info(`🔐 Vérification du statut Admin d'événement ${eventId} via Firestore...`);
      
      const userEmail = this.auth?.currentUser?.email;
      if (!userEmail) {
        logger.warn('🔐 Pas d\'email utilisateur disponible');
        return false;
      }
      
      const normalizedUserEmail = this.normalizeEmail(userEmail);
      const eventAdmins = await this.getEventAdmins(eventId, seasonId, force);
      // Normaliser tous les emails de la liste avant comparaison
      const normalizedEventAdmins = eventAdmins.map(email => this.normalizeEmail(email));
      const isAdmin = normalizedEventAdmins.includes(normalizedUserEmail);
      
      logger.info(`🔐 Statut Admin d'événement ${eventId}: ${isAdmin ? '✅ OUI' : '❌ NON'}`, {
        userEmail: normalizedUserEmail,
        eventAdminsRaw: eventAdmins,
        eventAdminsNormalized: normalizedEventAdmins
      });
      
      return isAdmin;
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification Admin d'événement ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Normalise un email (lowercase + trim)
   * @param {string} email - Email à normaliser
   * @returns {string} - Email normalisé
   */
  normalizeEmail(email) {
    return email?.toLowerCase().trim() || '';
  }

  /**
   * Vérifie si un utilisateur donné est admin (Super Admin OU Admin de saison OU Admin d'événement)
   * @param {string} userEmail - Email de l'utilisateur à vérifier
   * @param {string} seasonId - ID de la saison
   * @param {string} eventId - ID de l'événement
   * @returns {Promise<boolean>} - true si l'utilisateur est admin
   */
  async isUserAdmin(userEmail, seasonId, eventId) {
    try {
      if (!userEmail) {
        return false;
      }

      const normalizedUserEmail = this.normalizeEmail(userEmail);

      // Vérifier si Super Admin
      if (await this.isUserSuperAdmin(normalizedUserEmail)) {
        return true;
      }
      
      // Vérifier si Admin de saison
      if (await this.isUserSeasonAdmin(seasonId, normalizedUserEmail)) {
        return true;
      }
      
      // Vérifier si Admin d'événement
      // Forcer le rechargement pour éviter les problèmes de cache
      const eventAdmins = await this.getEventAdmins(eventId, seasonId, true);
      
      // Normaliser tous les emails de la liste avant comparaison
      const normalizedEventAdmins = eventAdmins.map(email => this.normalizeEmail(email));
      
      if (normalizedEventAdmins.includes(normalizedUserEmail)) {
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification isUserAdmin pour ${userEmail} sur événement ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut éditer un événement spécifique
   * (Super Admin OU Admin de saison OU Admin d'événement)
   */
  async canEditEvent(eventId, seasonId, force = false) {
    try {
      // Super Admin peut toujours éditer
      if (await this.isSuperAdmin(force)) {
        return true;
      }
      
      // Vérifier si Admin de saison
      if (await this.isSeasonAdmin(seasonId, force)) {
        return true;
      }
      
      // Vérifier si Admin d'événement
      return await this.isEventAdmin(eventId, seasonId, force);
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification des permissions d'édition pour l'événement ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut gérer la composition d'un événement
   * (Super Admin OU Admin de saison OU Admin d'événement OU Caster si cast existe)
   */
  async canManageComposition(eventId, seasonId, force = false) {
    try {
      const userEmail = this.auth?.currentUser?.email;
      logger.info(`🔐 [canManageComposition] Début vérification pour événement ${eventId}, saison ${seasonId}, utilisateur: ${userEmail || 'non connecté'}, force: ${force}`);
      
      // Super Admin peut toujours gérer
      const isSuperAdminResult = await this.isSuperAdmin(force);
      logger.info(`🔐 [canManageComposition] isSuperAdmin: ${isSuperAdminResult}`);
      if (isSuperAdminResult) {
        logger.info(`🔐 [canManageComposition] ✅ Super Admin - accès accordé`);
        return true;
      }
      
      // Admin de saison peut toujours gérer
      const isSeasonAdminResult = await this.isSeasonAdmin(seasonId, force);
      logger.info(`🔐 [canManageComposition] isSeasonAdmin: ${isSeasonAdminResult}`);
      if (isSeasonAdminResult) {
        logger.info(`🔐 [canManageComposition] ✅ Admin de saison - accès accordé`);
        return true;
      }
      
      // Admin d'événement peut toujours gérer
      const isEventAdminResult = await this.isEventAdmin(eventId, seasonId, force);
      logger.info(`🔐 [canManageComposition] isEventAdmin: ${isEventAdminResult}`);
      if (isEventAdminResult) {
        logger.info(`🔐 [canManageComposition] ✅ Admin d'événement - accès accordé`);
        return true;
      }
      
      // Caster peut toujours gérer la composition (pour lancer la sélection auto)
      // La restriction sur les sélections manuelles est gérée dans SelectionModal.vue
      const isCaster = await this.isSeasonCaster(seasonId, force);
      logger.info(`🔐 [canManageComposition] isSeasonCaster: ${isCaster}`);
      if (isCaster) {
        logger.info(`🔐 [canManageComposition] ✅ Caster détecté pour la saison ${seasonId} - accès accordé à la gestion de composition`);
        return true;
      }
      
      logger.info(`🔐 [canManageComposition] ❌ Aucune permission trouvée - accès refusé`);
      return false;
    } catch (error) {
      logger.error(`❌ [canManageComposition] Erreur lors de la vérification des permissions de composition pour l'événement ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur peut gérer les admins d'événement
   * (Super Admin OU Admin de saison uniquement, PAS les admins d'événement)
   */
  async canManageEventAdmins(eventId, seasonId, force = false) {
    try {
      // Super Admin peut toujours gérer
      if (await this.isSuperAdmin(force)) {
        return true;
      }
      
      // Vérifier si Admin de saison
      return await this.isSeasonAdmin(seasonId, force);
      // Note: Les admins d'événement ne peuvent PAS gérer d'autres admins d'événement
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification des permissions de gestion des admins d'événement pour ${eventId}:`, error);
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

      logger.info(`🔐 [getSeasonRoles] Récupération des permissions de saison ${seasonId} depuis Firestore, force: ${force}`);
      
      // DEBUG: Vérifier quelle base de données est utilisée
      logger.info('🔐 [getSeasonRoles] Environnement firestoreService:', {
        environment: firestoreService.environment,
        database: firestoreService.database,
        region: firestoreService.region,
        isInitialized: firestoreService.isInitialized
      });
      
      // Le seasonId passé est l'ID réel du document Firestore, pas le slug
      const seasonDoc = await firestoreService.getDocument('seasons', seasonId);
      logger.info(`🔐 [getSeasonRoles] seasonDoc reçu pour ${seasonId}:`, {
        exists: !!seasonDoc,
        hasRoles: !!seasonDoc?.roles,
        roles: seasonDoc?.roles
      });
      const roles = seasonDoc?.roles || { admins: [], users: [], casters: [] };
      logger.info(`🔐 [getSeasonRoles] Roles final pour ${seasonId}:`, {
        admins: roles.admins || [],
        users: roles.users || [],
        casters: roles.casters || [],
        adminsCount: roles.admins?.length || 0,
        usersCount: roles.users?.length || 0,
        castersCount: roles.casters?.length || 0
      });
      
      // S'assurer que casters existe
      if (!roles.casters) {
        roles.casters = [];
      }
      
      // Ajouter timestamp pour le cache
      const rolesWithTimestamp = {
        ...roles,
        timestamp: now
      };
      
      this.permissionStatus.seasonPermissions.set(seasonId, rolesWithTimestamp);
      
      logger.info(`🔐 Permissions de saison ${seasonId} chargés:`, {
        admins: roles.admins?.length || 0,
        users: roles.users?.length || 0,
        casters: roles.casters?.length || 0
      });
      
      return rolesWithTimestamp;
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération des permissions de saison ${seasonId}:`, error);
      return { admins: [], users: [], casters: [], timestamp: Date.now() };
    }
  }

  /**
   * Vérifie si un utilisateur est admin d'une saison (Firestore direct)
   */
  async isUserSeasonAdmin(seasonId, userEmail) {
    try {
      logger.info(`🔐 [isUserSeasonAdmin] Vérification pour ${userEmail} dans saison ${seasonId}`);
      const roles = await this.getSeasonRoles(seasonId);
      logger.info(`🔐 [isUserSeasonAdmin] Rôles récupérés:`, {
        admins: roles.admins || [],
        adminsCount: roles.admins?.length || 0,
        userEmail: userEmail,
        userEmailTrimmed: userEmail?.trim(),
        userEmailLower: userEmail?.toLowerCase()
      });
      const isAdmin = roles.admins?.includes(userEmail) || false;
      logger.info(`🔐 [isUserSeasonAdmin] Comparaison:`, {
        userEmail: userEmail,
        adminsList: roles.admins || [],
        includesResult: roles.admins?.includes(userEmail),
        isAdmin: isAdmin
      });
      logger.info(`🔐 [isUserSeasonAdmin] ${userEmail} est admin: ${isAdmin ? '✅ OUI' : '❌ NON'}`);
      return isAdmin;
    } catch (error) {
      logger.error(`❌ [isUserSeasonAdmin] Erreur lors de la vérification du rôle admin pour ${userEmail} dans ${seasonId}:`, error);
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
   * Vérifie si l'utilisateur actuel est Caster (sélectionneur) de saison pour une saison donnée
   */
  async isSeasonCaster(seasonId, force = false) {
    try {
      const userEmail = this.auth?.currentUser?.email;
      logger.info(`🔐 [isSeasonCaster] Début vérification pour saison ${seasonId}, utilisateur: ${userEmail || 'non connecté'}, force: ${force}`);
      
      // Super Admin a toujours accès à tout
      const isSuperAdminResult = await this.isSuperAdmin(force);
      logger.info(`🔐 [isSeasonCaster] isSuperAdmin: ${isSuperAdminResult}`);
      if (isSuperAdminResult) {
        logger.info('🔐 [isSeasonCaster] ✅ Super Admin détecté - accès accordé à toutes les saisons');
        return true;
      }

      logger.info(`🔐 [isSeasonCaster] Vérification du statut Caster de saison ${seasonId} via Firestore...`);
      
      if (!userEmail) {
        logger.warn('🔐 [isSeasonCaster] ❌ Pas d\'email utilisateur disponible');
        return false;
      }
      
      const isCaster = await this.isUserSeasonCaster(seasonId, userEmail);
      
      logger.info(`🔐 [isSeasonCaster] Statut Caster de saison ${seasonId} pour ${userEmail}: ${isCaster ? '✅ OUI' : '❌ NON'}`);
      
      return isCaster;
    } catch (error) {
      logger.error(`❌ [isSeasonCaster] Erreur lors de la vérification Caster de saison ${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Vérifie si un utilisateur est caster d'une saison (Firestore direct)
   */
  async isUserSeasonCaster(seasonId, userEmail) {
    try {
      logger.info(`🔐 [isUserSeasonCaster] Vérification pour ${userEmail} dans saison ${seasonId}`);
      const roles = await this.getSeasonRoles(seasonId);
      logger.info(`🔐 [isUserSeasonCaster] Rôles récupérés:`, {
        admins: roles.admins || [],
        users: roles.users || [],
        casters: roles.casters || [],
        castersCount: roles.casters?.length || 0
      });
      const isCaster = roles.casters?.includes(userEmail) || false;
      logger.info(`🔐 [isUserSeasonCaster] ${userEmail} est caster: ${isCaster ? '✅ OUI' : '❌ NON'}`);
      return isCaster;
    } catch (error) {
      logger.error(`❌ [isUserSeasonCaster] Erreur lors de la vérification du rôle caster pour ${userEmail} dans ${seasonId}:`, error);
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
   * Ajoute un caster (sélectionneur) à une saison (Firestore direct)
   */
  async addSeasonCaster(seasonId, userEmail, grantedBy) {
    try {
      logger.info(`🔐 Ajout du caster ${userEmail} à la saison ${seasonId} par ${grantedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      // Initialiser casters si absent
      if (!roles.casters) {
        roles.casters = [];
      }
      
      if (!roles.casters.includes(userEmail)) {
        roles.casters.push(userEmail);
        
        // Vérifier si le document existe, sinon le créer
        const seasonDoc = await firestoreService.getDocument('seasons', seasonId);
        if (!seasonDoc) {
          logger.info(`🔐 Création du document seasons/${seasonId}`);
          await firestoreService.setDocument('seasons', seasonId, {
            roles: {
              admins: roles.admins || [],
              users: roles.users || [],
              casters: roles.casters
            }
          });
        } else {
          // Mettre à jour le document existant
          await firestoreService.updateDocument('seasons', seasonId, {
            'roles.casters': roles.casters
          });
        }
        
        // Invalider le cache
        this.permissionStatus.seasonPermissions.delete(seasonId);
        
        logger.info(`✅ Caster ${userEmail} ajouté à la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} est déjà caster de la saison ${seasonId}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur lors de l'ajout du caster ${userEmail} à la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Retire un caster (sélectionneur) d'une saison (Firestore direct)
   */
  async removeSeasonCaster(seasonId, userEmail, revokedBy) {
    try {
      logger.info(`🔐 Retrait du caster ${userEmail} de la saison ${seasonId} par ${revokedBy}`);
      
      const roles = await this.getSeasonRoles(seasonId, true); // Force refresh
      
      // Initialiser casters si absent
      if (!roles.casters) {
        roles.casters = [];
      }
      
      const casterIndex = roles.casters.indexOf(userEmail);
      if (casterIndex !== -1) {
        roles.casters.splice(casterIndex, 1);
        
        // Mettre à jour Firestore
        await firestoreService.updateDocument('seasons', seasonId, {
          'roles.casters': roles.casters
        });
        
        // Invalider le cache
        this.permissionStatus.seasonPermissions.delete(seasonId);
        
        logger.info(`✅ Caster ${userEmail} retiré de la saison ${seasonId}`);
      } else {
        logger.info(`ℹ️ ${userEmail} n'était pas caster de la saison ${seasonId}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur lors du retrait du caster ${userEmail} de la saison ${seasonId}:`, error);
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
   * Invalide le cache des permissions d'événement pour un événement spécifique
   */
  invalidateEventCache(eventId, seasonId) {
    const cacheKey = `${seasonId}/${eventId}`;
    this.permissionStatus.eventPermissions.delete(cacheKey);
    logger.debug(`🔐 Cache invalidé pour l'événement ${eventId}`);
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
    this.permissionStatus.eventPermissions.clear();
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
  }),
  checkDatabase: async () => {
    console.log('🔧 DEBUG: Vérification de la base de données utilisée');
    console.log('🔧 DEBUG: firestoreService:', {
      environment: firestoreService.environment,
      database: firestoreService.database,
      region: firestoreService.region,
      isInitialized: firestoreService.isInitialized
    });
    console.log('🔧 DEBUG: configService:', {
      environment: configService.getEnvironment(),
      database: configService.getFirestoreDatabase(),
      region: configService.getFirestoreRegion()
    });
    console.log('🔧 DEBUG: window.firebaseServices:', {
      db: !!window.firebaseServices?.db,
      databaseId: window.firebaseServices?.db?._databaseId?.database || window.firebaseServices?.db?._delegate?._databaseId?.database
    });
    
    // Tester une requête directe
    try {
      const testDoc = await firestoreService.getDocument('seasons', 'bac-a-sable');
      console.log('🔧 DEBUG: Test requête seasons/bac-a-sable:', testDoc);
    } catch (error) {
      console.error('🔧 DEBUG: Erreur lors du test de requête:', error);
    }
  }
};

export default permissionService;
