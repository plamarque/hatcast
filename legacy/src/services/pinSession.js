// Service de gestion de la session PIN
// Durées adaptatives selon l'état de connexion
// Configurables via configService avec fallbacks par défaut
// 
// Voir PIN_SESSION_CONFIG.md pour plus de détails sur la configuration
import configService from './configService.js'
import logger from './logger.js'

const PIN_SESSION_KEY = 'hatcast_pin_session'

class PinSessionManager {
  constructor() {
    this.sessionData = this.loadSession()
    this.connectedDuration = null
    this.anonymousDuration = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return this;
    
    try {
      // Attendre que configService soit initialisé
      await configService.initializeConfig();
      
      // Récupérer les durées depuis configService
      this.connectedDuration = configService.getPinSessionDurationConnectedDays() * 24 * 60 * 60 * 1000;
      this.anonymousDuration = configService.getPinSessionDurationAnonymousMinutes() * 60 * 1000;
      
      logger.info('🔐 Configuration des sessions PIN:', {
        connected: `${this.connectedDuration / (24 * 60 * 60 * 1000)} jours`,
        anonymous: `${this.anonymousDuration / (60 * 1000)} minutes`,
        source: {
          connected: configService.getConfigSource('pinSessionDurationConnectedDays', 'sessions'),
          anonymous: configService.getConfigSource('pinSessionDurationAnonymousMinutes', 'sessions')
        }
      });
      
      this.isInitialized = true;
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation de PinSessionManager:', error);
      // Fallback vers les valeurs par défaut
      this.connectedDuration = 7 * 24 * 60 * 60 * 1000; // 7 jours par défaut
      this.anonymousDuration = 10 * 60 * 1000; // 10 minutes par défaut
      this.isInitialized = true;
      return this;
    }
  }

  // Charger la session depuis le localStorage avec gestion des anciennes sessions
  loadSession() {
    try {
      const sessionStr = localStorage.getItem(PIN_SESSION_KEY)
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        
        // Migration: si ancienne session sans isConnected, considérer comme anonyme
        if (session.isConnected === undefined) {
          session.isConnected = false
        }
        
        // Déterminer la durée selon l'état de connexion
        const duration = session.isConnected ? 
          this.connectedDuration || (7 * 24 * 60 * 60 * 1000) : 
          this.anonymousDuration || (10 * 60 * 1000)
        
        // Vérifier si la session n'est pas expirée
        if (session.timestamp && (Date.now() - session.timestamp) < duration) {
          // Sliding expiration: toucher le timestamp à la lecture
          try {
            session.timestamp = Date.now()
            localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session))
          } catch (_) {}
          return session
        } else {
          // Session expirée, la supprimer
          this.clearSession()
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors du chargement de la session PIN')
    }
    return null
  }

  // Sauvegarder la session dans le localStorage avec durée adaptative
  saveSession(seasonId, pinCode, isConnected = false) {
    try {
      const session = {
        seasonId,
        pinCode,
        timestamp: Date.now(),
        isConnected: isConnected // Mémoriser si l'utilisateur était connecté
      }
      localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session))
      this.sessionData = session
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la sauvegarde de la session PIN')
    }
  }

  // Vérifier si le PIN est en cache pour une saison avec durée adaptative
  async isPinCached(seasonId) {
    if (!this.sessionData) return false
    
    // S'assurer que le service est initialisé
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Déterminer la durée selon l'état de connexion mémorisé
    const duration = this.sessionData.isConnected ? 
      this.connectedDuration : 
      this.anonymousDuration
    
    // Vérifier si c'est la même saison et si la session n'est pas expirée
    const valid = this.sessionData.seasonId === seasonId && 
           this.sessionData.timestamp && 
           (Date.now() - this.sessionData.timestamp) < duration
    
    // Sliding expiration: rafraîchir si valide
    if (valid) {
      try {
        this.sessionData.timestamp = Date.now()
        localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(this.sessionData))
      } catch (_) {}
    }
    return valid
  }

  // Récupérer le PIN en cache
  async getCachedPin(seasonId) {
    // Vérifier d'abord si le PIN est en cache
    const isCached = await this.isPinCached(seasonId)
    if (isCached && this.sessionData && this.sessionData.pinCode) {
      return this.sessionData.pinCode
    }
    return null
  }

  // Effacer la session
  clearSession() {
    try {
      localStorage.removeItem(PIN_SESSION_KEY)
      this.sessionData = null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la suppression de la session PIN')
    }
  }

  // Obtenir le temps restant avant expiration (en minutes) avec durée adaptative
  async getTimeRemaining() {
    if (!this.sessionData || !this.sessionData.timestamp) return 0
    
    // S'assurer que le service est initialisé
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Déterminer la durée selon l'état de connexion mémorisé
    const duration = this.sessionData.isConnected ? 
      this.connectedDuration : 
      this.anonymousDuration
    
    const elapsed = Date.now() - this.sessionData.timestamp
    const remaining = duration - elapsed
    
    return Math.max(0, Math.ceil(remaining / (60 * 1000)))
  }

  // Vérifier si la session va expirer bientôt (moins de 2 minutes)
  async isExpiringSoon() {
    const timeRemaining = await this.getTimeRemaining();
    return timeRemaining <= 2;
  }
}

// Instance singleton
const pinSessionManager = new PinSessionManager()

// Initialiser le service de manière asynchrone
pinSessionManager.initialize().catch(error => {
  logger.error('❌ Erreur lors de l\'initialisation de PinSessionManager:', error);
});

export default pinSessionManager
