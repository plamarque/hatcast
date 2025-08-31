/**
 * Service de gestion admin côté frontend HatCast
 * Gère la vérification des permissions admin et l'authentification
 */

import { getAuth } from 'firebase/auth';
import logger from './logger.js';

class AdminService {
  constructor() {
    this.auth = getAuth();
    this.baseUrl = this.getBaseUrl();
    this.adminStatus = null;
    this.lastCheck = null;
    this.checkValidity = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Détermine l'URL de base des fonctions Firebase
   */
  getBaseUrl() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('staging') || hostname.includes('hatcast-staging')) {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else if (hostname.includes('localhost') || hostname.includes('192.168.1.134')) {
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
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel à ${functionName}:`, error);
      throw error;
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
        console.log('🔐 Statut admin récupéré du cache');
        return this.adminStatus;
      }

      console.log('🔐 Vérification du statut admin...');
      
      const result = await this.callFunction('checkAdminStatus');
      
      this.adminStatus = result.isAdmin;
      this.lastCheck = now;
      
      console.log(`🔐 Statut admin: ${this.adminStatus ? '✅ OUI' : '❌ NON'}`);
      
      return this.adminStatus;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification admin:', error);
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
      console.log('🔍 Demande de dump environnement...');
      
      const result = await this.callFunction('dumpEnvironment');
      
      if (result.success) {
        console.log('✅ Dump environnement réussi:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors du dump');
      }
    } catch (error) {
      console.error('❌ Erreur lors du dump environnement:', error);
      throw error;
    }
  }

  /**
   * Vérifie la configuration admin (admin uniquement)
   */
  async checkAdminConfig() {
    try {
      console.log('🔧 Vérification de la configuration admin...');
      
      const result = await this.callFunction('checkAdminConfig');
      
      if (result.success) {
        console.log('✅ Configuration admin récupérée:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la vérification');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification config admin:', error);
      throw error;
    }
  }

  /**
   * Test d'accès admin (admin uniquement)
   */
  async testAdminAccess() {
    try {
      console.log('🧪 Test d\'accès admin...');
      
      const result = await this.callFunction('testAdminAccess');
      
      if (result.success) {
        console.log('✅ Test d\'accès admin réussi:', result.message);
        return result;
      } else {
        throw new Error(result.message || 'Erreur lors du test');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test admin:', error);
      throw error;
    }
  }

  /**
   * Nettoie le cache du statut admin
   */
  clearCache() {
    this.adminStatus = null;
    this.lastCheck = null;
    console.log('🧹 Cache admin nettoyé');
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
      user: this.auth.currentUser?.email || 'Non connecté'
    };
  }
}

// Instance singleton
const adminService = new AdminService();

export default adminService;
