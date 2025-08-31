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
    this.auth = getAuth();
    this.baseUrl = this.getBaseUrl();
    console.log('🔧 SecureEmailService initialisé avec URL:', this.baseUrl);
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
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }
    console.log('🔑 Token récupéré pour:', user.email);
    return await user.getIdToken();
  }

  /**
   * Appelle une Firebase Function avec authentification
   */
  async callFunction(functionName, data = {}) {
    try {
      console.log(`📞 Appel de la fonction: ${functionName}`);
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}/${functionName}`;
      
      console.log(`🌐 URL appelée: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log(`📡 Réponse reçue: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction email:', error);
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
      console.log('🧪 Test email - Environnement:', environment);
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}/testEmail?environment=${environment}`;
      
      console.log('🌐 URL de test:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Réponse de test:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Test email réussi:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du test email:', error);
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
    
    console.log('🌍 Environnement détecté:', env, 'pour hostname:', hostname);
    return env;
  }

  /**
   * Vérifie si le service est disponible
   */
  async isAvailable() {
    try {
      console.log('🔍 Vérification de la disponibilité du service email...');
      console.log('📍 URL de base:', this.baseUrl);
      console.log('🌍 Environnement détecté:', this.detectEnvironment());
      
      // Vérifier d'abord si l'utilisateur est connecté
      const user = this.auth.currentUser;
      if (!user) {
        console.log('❌ Utilisateur non connecté');
        return false;
      }
      console.log('✅ Utilisateur connecté:', user.email);
      
      // Test simple de la fonction
      await this.testEmail();
      console.log('✅ Service email disponible');
      return true;
    } catch (error) {
      console.error('❌ Service email non disponible:', error);
      console.error('📋 Détails de l\'erreur:', {
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

export default secureEmailService;
