// src/services/playerPasswordSession.js
// DEV NOTE: ce service ne stocke plus le mot de passe en clair. Il mémorise
// uniquement qu'un appareil est "de confiance" pour un playerId pendant une
// longue période. Les données sont persistées en localStorage.

const TRUST_STORAGE_KEY = 'hatcast_trusted_players'
// Durée de confiance pour les appareils des utilisateurs
// Configurable via variable d'environnement avec fallback par défaut
const TRUST_DURATION = parseInt(import.meta.env.VITE_USER_SESSION_DURATION_MONTHS || '6') * 30 * 24 * 60 * 60 * 1000 // 6 mois par défaut (configurable)

class PlayerPasswordSessionManager {
  constructor() {
    this.trustedMap = this.load()
    
    // Log de la configuration de la durée de confiance
    console.log('🔐 Configuration des sessions utilisateur:', {
      duration: `${TRUST_DURATION / (30 * 24 * 60 * 60 * 1000)} mois`,
      source: 'variables d\'environnement' + (import.meta.env.VITE_USER_SESSION_DURATION_MONTHS ? ' (personnalisées)' : ' (défaut)')
    })
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
  isPasswordCached(playerId) {
    if (!playerId) return false
    const ts = this.trustedMap[playerId]
    if (!ts) return false
    const now = Date.now()
    const valid = now - ts < TRUST_DURATION
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
  clearExpiredSessions() {
    const now = Date.now()
    let changed = false
    for (const [pid, ts] of Object.entries(this.trustedMap)) {
      if (now - ts > TRUST_DURATION) {
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

export default playerPasswordSessionManager
