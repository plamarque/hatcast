// Service de gestion de la session PIN
// 1 semaine en millisecondes
const PIN_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000
const PIN_SESSION_KEY = 'impro_selector_pin_session'

class PinSessionManager {
  constructor() {
    this.sessionData = this.loadSession()
  }

  // Charger la session depuis le localStorage
  loadSession() {
    try {
      const sessionStr = localStorage.getItem(PIN_SESSION_KEY)
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        // Vérifier si la session n'est pas expirée
        if (session.timestamp && (Date.now() - session.timestamp) < PIN_SESSION_DURATION) {
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

  // Sauvegarder la session dans le localStorage
  saveSession(seasonId, pinCode) {
    try {
      const session = {
        seasonId,
        pinCode,
        timestamp: Date.now()
      }
      localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session))
      this.sessionData = session
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la sauvegarde de la session PIN')
    }
  }

  // Vérifier si le PIN est en cache pour une saison
  isPinCached(seasonId) {
    if (!this.sessionData) return false
    
    // Vérifier si c'est la même saison et si la session n'est pas expirée
    const valid = this.sessionData.seasonId === seasonId && 
           this.sessionData.timestamp && 
           (Date.now() - this.sessionData.timestamp) < PIN_SESSION_DURATION
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

  // Obtenir le temps restant avant expiration (en minutes)
  getTimeRemaining() {
    if (!this.sessionData || !this.sessionData.timestamp) return 0
    
    const elapsed = Date.now() - this.sessionData.timestamp
    const remaining = PIN_SESSION_DURATION - elapsed
    
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
