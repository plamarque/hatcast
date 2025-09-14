/**
 * Service de gestion des rôles HatCast
 * Gère les rôles Super Admin et Admin de saison
 */

import { getAuth } from 'firebase/auth';
import logger from './logger.js';

class RoleService {
  constructor() {
    this.auth = null;
    this.baseUrl = this.getBaseUrl();
    this.roleStatus = {
      isSuperAdmin: null,
      seasonAdmins: new Map(), // seasonId -> isAdmin
      lastCheck: null,
      checkValidity: 5 * 60 * 1000 // 5 minutes
    };
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
      logger.error('❌ Erreur lors de l\'initialisation de RoleService:', error);
      throw error;
    }
  }

  /**
   * Détermine l'URL de base selon l'environnement
   */
  getBaseUrl() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // En développement local, utiliser les fonctions déployées
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else if (hostname.includes('staging')) {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    }
  }

  /**
   * Vérifie si l'utilisateur actuel est Super Admin
   */
  async isSuperAdmin(force = false) {
    try {
      const now = Date.now();
      
      // Vérifier si on a un statut valide en cache
      if (!force && this.roleStatus.isSuperAdmin !== null && 
          this.roleStatus.lastCheck && (now - this.roleStatus.lastCheck) < this.roleStatus.checkValidity) {
        logger.info('🔐 Statut Super Admin récupéré du cache');
        return this.roleStatus.isSuperAdmin;
      }

      logger.info('🔐 Vérification du statut Super Admin...');
      logger.debug('🔐 isSuperAdmin - Début de la vérification');
      logger.debug('🔐 - Utilisateur actuel:', this.auth?.currentUser?.email || 'Non connecté');
      logger.debug('🔐 - URL de base:', this.baseUrl);
      
      const result = await this.callFunction('checkSuperAdminStatus');
      
      logger.debug('🔐 - Réponse de la Cloud Function:', result);
      
      this.roleStatus.isSuperAdmin = result.isSuperAdmin;
      this.roleStatus.lastCheck = now;
      
      logger.info(`🔐 Statut Super Admin: ${this.roleStatus.isSuperAdmin ? '✅ OUI' : '❌ NON'}`);
      logger.debug('🔐 - Statut Super Admin final:', this.roleStatus.isSuperAdmin);
      
      return this.roleStatus.isSuperAdmin;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification Super Admin:', error);
      this.roleStatus.isSuperAdmin = false;
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

      const now = Date.now();
      
      // Vérifier si on a un statut valide en cache pour cette saison
      if (!force && this.roleStatus.seasonAdmins.has(seasonId)) {
        const cached = this.roleStatus.seasonAdmins.get(seasonId);
        if (cached.timestamp && (now - cached.timestamp) < this.roleStatus.checkValidity) {
          logger.info(`🔐 Statut Admin de saison ${seasonId} récupéré du cache`);
          return cached.isAdmin;
        }
      }

      logger.info(`🔐 Vérification du statut Admin de saison ${seasonId}...`);
      logger.debug('🔐 isSeasonAdmin - Début de la vérification');
      logger.debug('🔐 - Utilisateur actuel:', this.auth?.currentUser?.email || 'Non connecté');
      logger.debug('🔐 - Saison:', seasonId);
      
      const result = await this.callFunction('checkSeasonAdminStatus', { seasonId });
      
      logger.debug('🔐 - Réponse de la Cloud Function:', result);
      
      const isAdmin = result.isSeasonAdmin;
      this.roleStatus.seasonAdmins.set(seasonId, {
        isAdmin,
        timestamp: now
      });
      
      logger.info(`🔐 Statut Admin de saison ${seasonId}: ${isAdmin ? '✅ OUI' : '❌ NON'}`);
      logger.debug('🔐 - Statut Admin de saison final:', isAdmin);
      
      return isAdmin;
    } catch (error) {
      logger.error(`❌ Erreur lors de la vérification Admin de saison ${seasonId}:`, error);
      this.roleStatus.seasonAdmins.set(seasonId, {
        isAdmin: false,
        timestamp: Date.now()
      });
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
   * Force la vérification de tous les statuts
   */
  async refreshAllRoles() {
    try {
      await this.isSuperAdmin(true);
      // Nettoyer le cache des admins de saison pour forcer la vérification
      this.roleStatus.seasonAdmins.clear();
      logger.info('🔐 Cache des rôles vidé - prochaines vérifications seront forcées');
    } catch (error) {
      logger.error('❌ Erreur lors du rafraîchissement des rôles:', error);
    }
  }

  /**
   * Appel générique vers les Cloud Functions
   */
  async callFunction(functionName, data = {}) {
    try {
      if (!this.auth?.currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      const token = await this.auth.currentUser.getIdToken();
      const url = `${this.baseUrl}/${functionName}`;
      
      logger.debug(`🔐 Appel Cloud Function: ${functionName}`, { url, data });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      logger.debug(`🔐 Réponse Cloud Function ${functionName}:`, result);
      
      return result;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'appel à ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Gestion des rôles de saison (pour les Super Admins)
   */
  async grantSeasonAdmin(seasonId, userEmail) {
    if (!await this.isSuperAdmin()) {
      throw new Error('Seuls les Super Admins peuvent accorder des rôles');
    }
    
    return await this.callFunction('grantSeasonAdmin', { seasonId, userEmail });
  }

  async revokeSeasonAdmin(seasonId, userEmail) {
    if (!await this.isSuperAdmin()) {
      throw new Error('Seuls les Super Admins peuvent révoquer des rôles');
    }
    
    return await this.callFunction('revokeSeasonAdmin', { seasonId, userEmail });
  }

  async listSeasonAdmins(seasonId) {
    if (!await this.isSuperAdmin()) {
      throw new Error('Seuls les Super Admins peuvent lister les rôles');
    }
    
    return await this.callFunction('listSeasonAdmins', { seasonId });
  }

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
    return await this.refreshAllRoles();
  }
}

// Instance singleton
const roleService = new RoleService();

export default roleService;
