// Service de gestion de la session PIN
// Durées adaptatives selon l'état de connexion
// Configurables via variables d'environnement avec fallbacks par défaut
// 
// Variables d'environnement disponibles :
// - VITE_PIN_SESSION_DURATION_CONNECTED_DAYS : durée en jours pour utilisateurs connectés (défaut: 7)
// - VITE_PIN_SESSION_DURATION_ANONYMOUS_MINUTES : durée en minutes pour utilisateurs non connectés (défaut: 10)
// 
// Voir PIN_SESSION_CONFIG.md pour plus de détails sur la configuration
const PIN_SESSION_DURATION_CONNECTED = parseInt(import.meta.env.VITE_PIN_SESSION_DURATION_CONNECTED_DAYS || '7') * 24 * 60 * 60 * 1000  // 7 jours si connecté (configurable)
const PIN_SESSION_DURATION_ANONYMOUS = parseInt(import.meta.env.VITE_PIN_SESSION_DURATION_ANONYMOUS_MINUTES || '10') * 60 * 1000           // 10 minutes si non connecté (configurable)
const PIN_SESSION_KEY = 'hatcast_pin_session'

class PinSessionManager {
  constructor() {
    this.sessionData = this.loadSession()
    
    // Log de la configuration des durées de session
    console.log('🔐 Configuration des sessions PIN:', {
      connected: `${PIN_SESSION_DURATION_CONNECTED / (24 * 60 * 60 * 1000)} jours`,
      anonymous: `${PIN_SESSION_DURATION_ANONYMOUS / (60 * 1000)} minutes`,
      source: 'variables d\'environnement' + (import.meta.env.VITE_PIN_SESSION_DURATION_CONNECTED_DAYS ? ' (personnalisées)' : ' (défaut)')
    })
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
          PIN_SESSION_DURATION_CONNECTED : 
          PIN_SESSION_DURATION_ANONYMOUS
        
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
  isPinCached(seasonId) {
    if (!this.sessionData) return false
    
    // Déterminer la durée selon l'état de connexion mémorisé
    const duration = this.sessionData.isConnected ? 
      PIN_SESSION_DURATION_CONNECTED : 
      PIN_SESSION_DURATION_ANONYMOUS
    
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
  getCachedPin(seasonId) {
    if (this.isPinCached(seasonId)) {
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
  getTimeRemaining() {
    if (!this.sessionData || !this.sessionData.timestamp) return 0
    
    // Déterminer la durée selon l'état de connexion mémorisé
    const duration = this.sessionData.isConnected ? 
      PIN_SESSION_DURATION_CONNECTED : 
      PIN_SESSION_DURATION_ANONYMOUS
    
    const elapsed = Date.now() - this.sessionData.timestamp
    const remaining = duration - elapsed
    
    return Math.max(0, Math.ceil(remaining / (60 * 1000)))
  }

  // Vérifier si la session va expirer bientôt (moins de 2 minutes)
  isExpiringSoon() {
    return this.getTimeRemaining() <= 2
  }
}

// Instance singleton
const pinSessionManager = new PinSessionManager()

export default pinSessionManager
