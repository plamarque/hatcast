// src/services/playerPasswordSession.js
class PlayerPasswordSessionManager {
  constructor() {
    this.sessions = new Map()
    this.sessionDuration = 10 * 60 * 1000 // 10 minutes en millisecondes
  }

  // Vérifier si un mot de passe est en cache pour un joueur
  isPasswordCached(playerId) {
    const session = this.sessions.get(playerId)
    if (!session) return false

    const now = Date.now()
    if (now - session.timestamp > this.sessionDuration) {
      // Session expirée, la supprimer
      this.sessions.delete(playerId)
      return false
    }

    return true
  }

  // Récupérer le mot de passe en cache pour un joueur
  getCachedPassword(playerId) {
    const session = this.sessions.get(playerId)
    if (!session) return null

    const now = Date.now()
    if (now - session.timestamp > this.sessionDuration) {
      // Session expirée, la supprimer
      this.sessions.delete(playerId)
      return null
    }

    return session.password
  }

  // Sauvegarder un mot de passe en cache pour un joueur
  saveSession(playerId, password) {
    this.sessions.set(playerId, {
      password,
      timestamp: Date.now()
    })
  }

  // Supprimer une session pour un joueur
  clearSession(playerId) {
    this.sessions.delete(playerId)
  }

  // Supprimer toutes les sessions expirées
  clearExpiredSessions() {
    const now = Date.now()
    for (const [playerId, session] of this.sessions.entries()) {
      if (now - session.timestamp > this.sessionDuration) {
        this.sessions.delete(playerId)
      }
    }
  }

  // Nettoyer toutes les sessions
  clearAllSessions() {
    this.sessions.clear()
  }
}

// Créer une instance singleton
const playerPasswordSessionManager = new PlayerPasswordSessionManager()

export default playerPasswordSessionManager
