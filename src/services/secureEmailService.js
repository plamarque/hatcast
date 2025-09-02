// Service d'envoi d'emails sécurisé via Firebase Functions
// Remplace l'ancien service emailService.js pour la production

import { getAuth } from 'firebase/auth';
import logger from './logger.js';

/**
 * Service d'envoi d'emails sécurisé
 * Utilise Firebase Functions au lieu d'envoyer directement depuis le frontend
 */
class SecureEmailService {
  constructor() {
    this.auth = null;
    this.baseUrl = this.getBaseUrl();
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
      logger.info('🔧 SecureEmailService initialisé avec URL:', this.baseUrl);
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation de SecureEmailService:', error);
      throw error;
    }
  }

  /**
   * Détecte l'URL de base des Firebase Functions
   */
  getBaseUrl() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('staging')) {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else if (hostname.includes('localhost') || hostname.includes('192.168.1.134')) {
      // En développement local, utiliser les emulators ou la production
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    } else {
      return 'https://us-central1-impro-selector.cloudfunctions.net';
    }
  }

  /**
   * Récupère le token d'authentification Firebase
   */
  async getAuthToken() {
    if (!this.isInitialized || !this.auth) {
      await this.initialize();
    }
    
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }
    logger.info('🔑 Token récupéré pour:', user.email);
    return await user.getIdToken();
  }

  /**
   * Appelle une Firebase Function avec authentification
   */
  async callFunction(functionName, data = {}) {
    try {
      logger.info(`📞 Appel de la fonction: ${functionName}`);
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}/${functionName}`;
      
      logger.info(`🌐 URL appelée: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      logger.info(`📡 Réponse reçue: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('❌ Erreur lors de l\'appel de la fonction email:', error);
      throw error;
    }
  }

  /**
   * Envoie un email générique
   */
  async sendEmail(emailData) {
    const environment = this.detectEnvironment();
    
    return await this.callFunction('sendEmail', {
      ...emailData,
      environment
    });
  }

  /**
   * Envoie une notification de sélection
   */
  async sendSelectionNotification(playerData, eventData) {
    const environment = this.detectEnvironment();
    
    return await this.callFunction('sendSelectionNotification', {
      playerData,
      eventData,
      environment
    });
  }

  /**
   * Envoie une notification de disponibilité
   */
  async sendAvailabilityNotification(playerData, eventData) {
    const environment = this.detectEnvironment();
    
    return await this.callFunction('sendAvailabilityNotification', {
      playerData,
      eventData,
      environment
    });
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(playerData, resetLink) {
    const environment = this.detectEnvironment();
    
    return await this.callFunction('sendPasswordResetEmail', {
      playerData,
      resetLink,
      environment
    });
  }

  /**
   * Test de la configuration email
   */
  async testEmail() {
    const environment = this.detectEnvironment();
    
    try {
      logger.info('🧪 Test email - Environnement:', environment);
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}/testEmail?environment=${environment}`;
      
      logger.info('🌐 URL de test:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      logger.info('📡 Réponse de test:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info('✅ Test email réussi:', result);
      return result;
    } catch (error) {
      logger.error('❌ Erreur lors du test email:', error);
      throw error;
    }
  }

  /**
   * Détecte l'environnement actuel
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    const env = hostname.includes('staging') ? 'staging' : 
                (hostname.includes('localhost') || hostname.includes('192.168.1.134')) ? 'development' : 
                'production';
    
    logger.info('🌍 Environnement détecté:', env, 'pour hostname:', hostname);
    return env;
  }

  /**
   * Vérifie si le service est disponible
   */
  async isAvailable() {
    try {
      if (!this.isInitialized || !this.auth) {
        await this.initialize();
      }
      
      logger.info('🔍 Vérification de la disponibilité du service email...');
      logger.info('📍 URL de base:', this.baseUrl);
      logger.info('🌍 Environnement détecté:', this.detectEnvironment());
      
      // Vérifier d'abord si l'utilisateur est connecté
      const user = this.auth.currentUser;
      if (!user) {
        logger.info('❌ Utilisateur non connecté');
        return false;
      }
      logger.info('✅ Utilisateur connecté:', user.email);
      
      // Test simple de la fonction
      await this.testEmail();
      logger.info('✅ Service email disponible');
      return true;
    } catch (error) {
      logger.error('❌ Service email non disponible:', error);
      logger.error('📋 Détails de l\'erreur:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  }
}

// Instance singleton
const secureEmailService = new SecureEmailService();

// Initialiser le service de manière asynchrone
secureEmailService.initialize().catch(error => {
  logger.error('❌ Erreur lors de l\'initialisation de SecureEmailService:', error);
});

export default secureEmailService;
