// src/services/playerPasswordSession.js
// DEV NOTE: ce service ne stocke plus le mot de passe en clair. Il mémorise
// uniquement qu'un appareil est "de confiance" pour un playerId pendant une
// longue période. Les données sont persistées en localStorage.

import configService from './configService.js'
import logger from './logger.js'

const TRUST_STORAGE_KEY = 'hatcast_trusted_players'

class PlayerPasswordSessionManager {
  constructor() {
    this.trustedMap = this.load()
    this.trustDuration = null
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return this;
    
    try {
      // Attendre que configService soit initialisé
      await configService.initializeConfig();
      
      // Récupérer la durée depuis configService
      this.trustDuration = configService.getUserSessionDurationMonths() * 30 * 24 * 60 * 60 * 1000;
      
      logger.info('🔐 Configuration des sessions utilisateur:', {
        duration: `${this.trustDuration / (30 * 24 * 60 * 60 * 1000)} mois`,
        source: configService.getConfigSource('userSessionDurationMonths', 'sessions')
      });
      
      this.isInitialized = true;
      return this;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation de PlayerPasswordSessionManager:', error);
      // Fallback vers la valeur par défaut
      this.trustDuration = 6 * 30 * 24 * 60 * 60 * 1000; // 6 mois par défaut
      this.isInitialized = true;
      return this;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(TRUST_STORAGE_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null ? parsed : {}
    } catch (_) {
      return {}
    }
  }

  persist() {
    try {
      localStorage.setItem(TRUST_STORAGE_KEY, JSON.stringify(this.trustedMap))
    } catch (_) {}
  }

  // Vérifie si l'appareil est de confiance pour ce joueur (avec expiration glissante)
  async isPasswordCached(playerId) {
    if (!playerId) return false
    
    // S'assurer que le service est initialisé
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const ts = this.trustedMap[playerId]
    if (!ts) return false
    const now = Date.now()
    const valid = now - ts < this.trustDuration
    if (valid) {
      // Sliding expiration
      this.trustedMap[playerId] = now
      this.persist()
    } else {
      delete this.trustedMap[playerId]
      this.persist()
    }
    return valid
  }

  // Compat: ne renvoie plus de mot de passe (jamais stocké). Toujours null.
  getCachedPassword(_playerId) {
    return null
  }

  // Marquer l'appareil comme de confiance pour ce joueur
  saveSession(playerId, _passwordIgnored) {
    if (!playerId) return
    this.trustedMap[playerId] = Date.now()
    this.persist()
  }

  // Oublier cet appareil pour ce joueur
  clearSession(playerId) {
    if (!playerId) return
    delete this.trustedMap[playerId]
    this.persist()
  }

  // Purger les confiances expirées
  async clearExpiredSessions() {
    // S'assurer que le service est initialisé
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const now = Date.now()
    let changed = false
    for (const [pid, ts] of Object.entries(this.trustedMap)) {
      if (now - ts > this.trustDuration) {
        delete this.trustedMap[pid]
        changed = true
      }
    }
    if (changed) this.persist()
  }

  // Tout oublier sur cet appareil
  clearAllSessions() {
    this.trustedMap = {}
    this.persist()
  }
}

// Créer une instance singleton
const playerPasswordSessionManager = new PlayerPasswordSessionManager()

// Initialiser le service de manière asynchrone
playerPasswordSessionManager.initialize().catch(error => {
  logger.error('❌ Erreur lors de l\'initialisation de PlayerPasswordSessionManager:', error);
});

export default playerPasswordSessionManager
