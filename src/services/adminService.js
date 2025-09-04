/**
 * Service de gestion admin côté frontend HatCast
 * Gère la vérification des permissions admin et l'authentification
 */

import { getAuth } from 'firebase/auth';
import logger from './logger.js';

class AdminService {
  constructor() {
    this.auth = null;
    this.baseUrl = this.getBaseUrl();
    this.adminStatus = null;
    this.lastCheck = null;
    this.checkValidity = 5 * 60 * 1000; // 5 minutes
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
      logger.info('✅ AdminService initialisé avec succès');
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation d\'AdminService:', error);
      throw error;
    }
  }

  /**
   * Détermine l'URL de base des fonctions Firebase
   */
  getBaseUrl() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('staging') || hostname.includes('hatcast-staging')) {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else if (hostname.includes('localhost') || hostname.includes('192.168.1.134')) {
      // En développement local, utiliser les vraies functions de production (comme avant)
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    }
  }

  /**
   * Récupère le token d'authentification Firebase
   */
  async getAuthToken() {
    try {
      if (!this.isInitialized || !this.auth) {
        await this.initialize();
      }
      
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération du token:', error);
      throw new Error('Impossible de récupérer le token d\'authentification');
    }
  }

  /**
   * Appelle une fonction Firebase avec authentification
   */
  async callFunction(functionName, options = {}) {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}/${functionName}`;
      
            logger.debug(`🔐 callFunction - Appel à ${functionName}`);
      logger.debug(`🔐 - URL: ${url}`);
      logger.debug(`🔐 - Token présent: ${!!token}`);
      logger.debug(`🔐 - Origin: ${window.location.origin}`);
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        ...options
      });

      logger.debug(`🔐 - Status de la réponse: ${response.status}`);
      logger.debug(`🔐 - Headers de la réponse:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`❌ Erreur HTTP ${response.status}:`, errorData);
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      logger.debug(`🔐 - Réponse reçue:`, result);
      return result;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'appel à ${functionName}:`, error);
      logger.error(`❌ DEBUG - Type d'erreur:`, error.name);
      logger.error(`❌ DEBUG - Message d'erreur:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère les secrets Firebase (admin uniquement)
   */
  async getSecrets() {
    try {
      logger.info('🔐 Demande de récupération des secrets Firebase...');
      
      const result = await this.callFunction('getAllFirebaseSecrets');
      
      if (result.success) {
        logger.info('✅ Secrets Firebase récupérés avec succès');
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des secrets');
      }
    } catch (error) {
      logger.warn('⚠️ Erreur lors de la récupération des secrets Firebase:', error);
      return {};
    }
  }

  /**
   * Vérifie le statut admin de l'utilisateur actuel
   */
  async checkAdminStatus(force = false) {
    try {
      const now = Date.now();
      
      // Vérifier si on a un statut valide en cache
      if (!force && this.adminStatus && this.lastCheck && (now - this.lastCheck) < this.checkValidity) {
        logger.info('🔐 Statut admin récupéré du cache');
        return this.adminStatus;
      }

      logger.info('🔐 Vérification du statut admin...');
      logger.debug('🔐 checkAdminStatus - Début de la vérification');
      logger.debug('🔐 - Utilisateur actuel:', this.auth?.currentUser?.email || 'Non connecté');
      logger.debug('🔐 - URL de base:', this.baseUrl);
      
      const result = await this.callFunction('checkAdminStatus');
      
      logger.debug('🔐 - Réponse de la Cloud Function:', result);
      
      this.adminStatus = result.isAdmin;
      this.lastCheck = now;
      
      logger.info(`🔐 Statut admin: ${this.adminStatus ? '✅ OUI' : '❌ NON'}`);
      logger.debug('🔐 - Statut admin final:', this.adminStatus);
      
      return this.adminStatus;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification admin:', error);
      logger.error('❌ DEBUG - Détails de l\'erreur:', {
        message: error.message,
        stack: error.stack,
        user: this.auth?.currentUser?.email || 'Non connecté',
        baseUrl: this.baseUrl
      });
      this.adminStatus = false;
      this.lastCheck = now;
      return false;
    }
  }

  /**
   * Vérifie si l'utilisateur actuel est admin
   */
  async isAdmin() {
    return await this.checkAdminStatus();
  }

  /**
   * Force la vérification du statut admin
   */
  async refreshAdminStatus() {
    return await this.checkAdminStatus(true);
  }

  /**
   * Dump les informations d'environnement (admin uniquement)
   */
  async dumpEnvironment() {
    try {
      logger.info('🔍 Demande de dump environnement...');
      
      const result = await this.callFunction('dumpEnvironment');
      
      if (result.success) {
        logger.info('✅ Dump environnement réussi:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors du dump');
      }
    } catch (error) {
      logger.error('❌ Erreur lors du dump environnement:', error);
      throw error;
    }
  }

  /**
   * Vérifie la configuration admin (admin uniquement)
   */
  async checkAdminConfig() {
    try {
      logger.info('🔧 Vérification de la configuration admin...');
      
      const result = await this.callFunction('checkAdminConfig');
      
      if (result.success) {
        logger.info('✅ Configuration admin récupérée:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la vérification');
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification config admin:', error);
      throw error;
    }
  }

  /**
   * Test d'accès admin (admin uniquement)
   */
  async testAdminAccess() {
    try {
      logger.info('🧪 Test d\'accès admin...');
      
      const result = await this.callFunction('testAdminAccess');
      
      if (result.success) {
        logger.info('✅ Test d\'accès admin réussi:', result.message);
        return result;
      } else {
        throw new Error(result.message || 'Erreur lors du test');
      }
    } catch (error) {
      logger.error('❌ Erreur lors du test admin:', error);
      throw error;
    }
  }

  /**
   * Nettoie le cache du statut admin
   */
  clearCache() {
    this.adminStatus = null;
    this.lastCheck = null;
    logger.info('🧹 Cache admin nettoyé');
  }

  /**
   * Retourne les informations de debug
   */
  getDebugInfo() {
    return {
      adminStatus: this.adminStatus,
      lastCheck: this.lastCheck,
      checkValidity: this.checkValidity,
      baseUrl: this.baseUrl,
      user: this.auth?.currentUser?.email || 'Non connecté',
      isInitialized: this.isInitialized
    };
  }
}

// Instance singleton
const adminService = new AdminService();

// Initialiser le service de manière asynchrone
adminService.initialize().catch(error => {
  logger.error('❌ Erreur lors de l\'initialisation d\'AdminService:', error);
});

export default adminService;
