// Service d'envoi d'emails sécurisé via Firebase Functions
// Remplace l'ancien service emailService.js pour la production
// FORCE_RELOAD_1756827071997

import { getAuth } from 'firebase/auth';
import logger from './logger.js';
import configService from './configService.js';

/**
 * Service d'envoi d'emails sécurisé
 * Utilise Firebase Functions au lieu d'envoyer directement depuis le frontend
 */
class SecureEmailService {
  constructor() {
    this.auth = null;
    this.baseUrl = this.getBaseUrl();
    this.isInitialized = false;
    this.secretsLoaded = false; // Flag pour tracker si les secrets sont chargés
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
      // En développement local, utiliser les vraies functions de production (comme avant)
      // Les emails Ethereal sont gérés côté production via les credentials passés en paramètres
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
   * Charge les secrets Firebase à la demande (pour l'envoi d'emails)
   * Cette méthode est appelée explicitement quand on a besoin des secrets
   */
  async loadSecretsOnDemand() {
    if (this.secretsLoaded) {
      return; // Déjà chargé
    }

    logger.info('🔐 Chargement à la demande des secrets Firebase pour l\'envoi d\'emails...');

    try {
      // Charger les secrets via configService
      await configService.loadSecretsOnDemand();
      this.secretsLoaded = true;
      logger.info('✅ Secrets Firebase chargés avec succès pour l\'envoi d\'emails');
    } catch (error) {
      logger.warn('⚠️ Erreur lors du chargement des secrets Firebase:', error);
      // Continuer sans les secrets (fallback vers la configuration par défaut)
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
    
    // Charger les secrets à la demande avant l'envoi de l'email
    await this.loadSecretsOnDemand();
    
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
    
    // Charger les secrets à la demande avant l'envoi de l'email
    await this.loadSecretsOnDemand();
    
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
    
    // Charger les secrets à la demande avant l'envoi de l'email
    await this.loadSecretsOnDemand();
    
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
      let url = `${this.baseUrl}/testEmail?environment=${environment}`;
      
      logger.info('🌐 URL de test:', url);
      
      // En développement, pas besoin d'authentification
      let headers = {};
      
      if (environment === 'development') {
        try {
          const etherealCredentials = configService.getEtherealCredentials();
          
          // Vérifier que les credentials sont disponibles
          if (etherealCredentials) {
            logger.info('🔐 Credentials Ethereal récupérés:', {
              user: etherealCredentials.user,
              source: etherealCredentials.source,
              hasUser: !!etherealCredentials.user,
              hasPass: !!etherealCredentials.pass
            });
            
            if (etherealCredentials.source === 'local_env') {
              logger.info('🔐 Credentials Ethereal locaux détectés, ajout aux query params');
              // Utiliser les query parameters au lieu des headers pour éviter les restrictions du navigateur
              url += `&ethereal_user=${encodeURIComponent(etherealCredentials.user)}&ethereal_pass=${encodeURIComponent(etherealCredentials.pass)}`;
              logger.info('🌐 URL finale avec credentials:', url);
            } else {
              logger.info(`🔐 Source des credentials Ethereal: ${etherealCredentials.source}`);
            }
          } else {
            logger.info('ℹ️ Aucun credential Ethereal configuré en développement');
          }
        } catch (configError) {
          logger.warn('⚠️ Impossible de récupérer les credentials Ethereal:', configError);
        }
      } else {
        // En production/staging, authentification obligatoire
        const token = await this.getAuthToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      logger.info('🔍 Headers envoyés:', headers);
      logger.info('🌐 Tentative de fetch vers:', url);
      logger.info('🕐 Timestamp de la requête:', new Date().toISOString());
      logger.info('🌍 Hostname actuel:', window.location.hostname);
      logger.info('🔒 Protocole actuel:', window.location.protocol);
      logger.info('📱 User Agent:', navigator.userAgent);
      
      let response;
      try {
        logger.info('🚀 Début de la requête fetch...');
        logger.info('🔍 Vérification de la connectivité réseau...');
        
        // Test simple de connectivité
        try {
          const testResponse = await fetch('https://httpbin.org/get', { method: 'GET' });
          logger.info('✅ Test de connectivité réussi:', testResponse.status);
        } catch (testError) {
          logger.warn('⚠️ Test de connectivité échoué:', testError.message);
        }
        
        response = await fetch(url, {
          method: 'GET',
          headers: headers
        });
        logger.info('✅ Fetch réussi, status:', response.status);
      } catch (fetchError) {
        logger.error('❌ Erreur fetch détaillée:', {
          message: fetchError.message,
          name: fetchError.name,
          stack: fetchError.stack,
          cause: fetchError.cause
        });
        throw fetchError;
      }

      logger.info('📡 Réponse de test:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur de parsing JSON' }));
        logger.error('❌ Erreur HTTP:', response.status, errorData);
        
        // En développement, traiter différemment les erreurs
        if (environment === 'development') {
          throw new Error(`Test de configuration échoué: ${errorData.message || errorData.error || 'Erreur inconnue'}`);
        } else {
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }
      }

      const result = await response.json();
      logger.info('✅ Test email réussi:', result);
      
      // En développement, afficher des informations de configuration
      if (environment === 'development' && result.config) {
        logger.info('🔧 Configuration email:', result.config);
        if (result.note) {
          logger.info('💡 Note:', result.note);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('❌ Erreur lors du test email:', error);
      
      // En développement, fournir plus de contexte
      if (environment === 'development') {
        error.developmentContext = {
          environment: environment,
          suggestion: 'Vérifiez la configuration Ethereal Email dans .env.local ou Firebase Functions',
          note: 'En développement, seules les erreurs de configuration sont testées'
        };
      }
      
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
