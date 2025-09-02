const admin = require('firebase-admin')
const db = admin.firestore()

class AuditService {
  /**
   * Obfusque partiellement une adresse email
   * @param {string} email - L'adresse email à obfusquer
   * @returns {string} L'email obfusqué
   */
  static obfuscateEmail(email) {
    if (!email || typeof email !== 'string') return null
    
    const parts = email.split('@')
    if (parts.length !== 2) return email
    
    const [localPart, domain] = parts
    
    // Obfusquer la partie locale (avant @)
    let obfuscatedLocal = localPart
    if (localPart.length <= 3) {
      obfuscatedLocal = localPart.charAt(0) + '••'
    } else {
      obfuscatedLocal = localPart.substring(0, 3) + '••'
    }
    
    // Obfusquer le domaine
    const domainParts = domain.split('.')
    let obfuscatedDomain = domain
    if (domainParts.length >= 2) {
      const mainDomain = domainParts[0]
      const extension = domainParts.slice(1).join('.')
      
      if (mainDomain.length <= 2) {
        obfuscatedDomain = '••' + '.' + extension
      } else {
        obfuscatedDomain = mainDomain.substring(0, 2) + '••' + '.' + extension
      }
    }
    
    return `${obfuscatedLocal}@${obfuscatedDomain}`
  }
  /**
   * Log un événement d'audit
   * @param {Object} eventData - Données de l'événement
   * @returns {string} ID de l'événement généré
   */
  static async logEvent(eventData) {
    // Désactiver l'audit en mode test pour éviter la pollution
    if (this.isTestEnvironment()) {
      return null
    }
    
    // Désactiver l'audit en développement sauf si explicitement activé
    const environment = process.env.NODE_ENV || 'development'
    const isAuditExplicitlyEnabled = process.env.AUDIT_ENABLED === 'true'
    
    if (environment === 'development' && !isAuditExplicitlyEnabled) {
      // Log de debug pour indiquer que l'audit est désactivé
      if (eventData.severity === 'error' || eventData.severity === 'critical') {
        console.log('🔇 AUDIT DISABLED (dev mode):', eventData.eventType, eventData.data)
      }
      return null
    }
    
    try {
      const auditDoc = {
        ...eventData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        eventId: this.generateEventId(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
      
      // Ajouter dans la collection auditLogs
      const docRef = await db.collection('auditLogs').add(auditDoc)
      
      // Log critique vers console pour monitoring
      if (eventData.severity === 'error' || eventData.severity === 'critical') {
        console.error('AUDIT ERROR:', auditDoc)
      }
      
      return docRef.id
    } catch (error) {
      console.error('Erreur lors du logging audit:', error)
      // Ne pas faire échouer l'action principale
      return null
    }
  }

  /**
   * Log un changement de disponibilité
   * @param {Object} params - Paramètres du changement
   */
  static async logAvailabilityChange(params) {
    const {
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      playerName,
      playerEmail,
      oldValue,
      newValue,
      userId,
      userEmail,
      isAnonymous = false
    } = params

    await this.logEvent({
      eventType: 'availability_changed',
      eventCategory: 'user_action',
      severity: 'info',
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      playerName,
      playerEmail: this.obfuscateEmail(playerEmail),
      userId: userId || 'anonymous',
      userEmail: this.obfuscateEmail(userEmail),
      isAnonymous,
      data: {
        oldValue,
        newValue,
        change: `${oldValue} → ${newValue}`
      },
      success: true,
      tags: ['availability', `season_${seasonSlug}`, `event_${eventId}`, `player_${playerName}`]
    })
  }

  /**
   * Log un ajout/suppression d'événement
   * @param {Object} params - Paramètres de l'événement
   */
  static async logEventChange(params) {
    const {
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      action, // 'created', 'updated', 'deleted'
      userId,
      userEmail,
      isAnonymous = false,
      eventData = null
    } = params

    await this.logEvent({
      eventType: `event_${action}`,
      eventCategory: 'user_action',
      severity: 'info',
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      userId: userId || 'anonymous',
      userEmail: this.obfuscateEmail(userEmail),
      isAnonymous,
      data: eventData,
      success: true,
      tags: ['event', action, `season_${seasonSlug}`, `event_${eventId}`]
    })
  }

  /**
   * Log un ajout/suppression de joueur
   * @param {Object} params - Paramètres du joueur
   */
  static async logPlayerChange(params) {
    const {
      seasonId,
      seasonSlug,
      playerName,
      playerEmail,
      action, // 'added', 'removed', 'updated'
      userId,
      userEmail,
      isAnonymous = false,
      playerData = null
    } = params

    await this.logEvent({
      eventType: `player_${action}`,
      eventCategory: 'user_action',
      severity: 'info',
      seasonId,
      seasonSlug,
      playerName,
      playerEmail: this.obfuscateEmail(playerEmail),
      userId: userId || 'anonymous',
      userEmail: this.obfuscateEmail(userEmail),
      isAnonymous,
      data: playerData,
      success: true,
      tags: ['player', action, `season_${seasonSlug}`, `player_${playerName}`]
    })
  }

  /**
   * Log une sélection de joueurs
   * @param {Object} params - Paramètres de la sélection
   */
  static async logSelectionChange(params) {
    const {
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      action, // 'created', 'updated', 'deleted'
      oldPlayers = [],
      newPlayers = [],
      userId,
      userEmail,
      isAnonymous = false
    } = params

    await this.logEvent({
      eventType: `selection_${action}`,
      eventCategory: 'user_action',
      severity: 'info',
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      userId: userId || 'anonymous',
      userEmail: userEmail || null,
      isAnonymous,
      data: {
        oldPlayers,
        newPlayers,
        added: newPlayers.filter(p => !oldPlayers.includes(p)),
        removed: oldPlayers.filter(p => !newPlayers.includes(p))
      },
      success: true,
      tags: ['selection', action, `season_${seasonSlug}`, `event_${eventId}`]
    })
  }

  /**
   * Log une erreur
   * @param {Object} params - Paramètres de l'erreur
   */
  static async logError(params) {
    const {
      error,
      context,
      userId,
      userEmail,
      seasonId,
      seasonSlug,
      eventId,
      eventTitle
    } = params

    await this.logEvent({
      eventType: 'error_occurred',
      eventCategory: 'error',
      severity: 'error',
      seasonId,
      seasonSlug,
      eventId,
      eventTitle,
      userId: userId || 'anonymous',
      userEmail: userEmail || null,
      data: {
        error: error.message,
        code: error.code,
        stack: error.stack,
        context
      },
      success: false,
      tags: ['error', context, seasonSlug ? `season_${seasonSlug}` : null].filter(Boolean)
    })
  }

  /**
   * Détecter si on est en environnement de test
   * @returns {boolean} True si environnement de test
   */
  static isTestEnvironment() {
    // Détecter les variables d'environnement de test
    if (process.env) {
      if (process.env.NODE_ENV === 'test' ||
          process.env.PLAYWRIGHT_TEST ||
          process.env.CYPRESS ||
          process.env.JEST_WORKER_ID ||
          process.env.FIREBASE_EMULATOR_HOST) {
        return true
      }
    }
    
    // Détecter les emails de test
    const testEmails = [
      'test@example.com',
      'playwright@test.com',
      'cypress@test.com',
      'jest@test.com'
    ]
    
    // Vérifier dans les données d'événement si c'est un test
    if (global.currentAuditEventData) {
      const userEmail = global.currentAuditEventData.userEmail
      if (userEmail && testEmails.some(email => userEmail.includes(email))) {
        return true
      }
    }
    
    return false
  }
  
  /**
   * Génère un ID unique pour l'événement
   * @returns {string} ID unique
   */
  static generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Récupère les logs d'audit avec filtres
   * @param {Object} filters - Filtres de recherche
   * @returns {Array} Liste des logs
   */
  static async getAuditLogs(filters = {}) {
    try {
      let query = db.collection('auditLogs')

      // Appliquer les filtres
      if (filters.seasonSlug) {
        query = query.where('seasonSlug', '==', filters.seasonSlug)
      }
      
      if (filters.eventId) {
        query = query.where('eventId', '==', filters.eventId)
      }
      
      if (filters.eventTitle) {
        query = query.where('eventTitle', '==', filters.eventTitle)
      }
      
      if (filters.playerName) {
        query = query.where('playerName', '==', filters.playerName)
      }
      
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId)
      }
      
      if (filters.eventType) {
        query = query.where('eventType', '==', filters.eventType)
      }
      
      if (filters.severity) {
        query = query.where('severity', '==', filters.severity)
      }
      
      if (filters.startDate) {
        query = query.where('timestamp', '>=', filters.startDate)
      }
      
      if (filters.endDate) {
        query = query.where('timestamp', '<=', filters.endDate)
      }

      // Trier par timestamp décroissant
      query = query.orderBy('timestamp', 'desc')
      
      // Limiter le nombre de résultats
      if (filters.limit) {
        query = query.limit(filters.limit)
      } else {
        query = query.limit(100) // Limite par défaut
      }

      const snapshot = await query.get()
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error)
      throw error
    }
  }

  /**
   * Recherche textuelle dans les logs
   * @param {string} searchTerm - Terme de recherche
   * @param {Object} filters - Filtres additionnels
   * @returns {Array} Liste des logs correspondants
   */
  static async searchAuditLogs(searchTerm, filters = {}) {
    try {
      // Récupérer tous les logs avec les filtres de base
      const logs = await this.getAuditLogs({ ...filters, limit: 1000 })
      
      // Filtrer par terme de recherche
      const searchLower = searchTerm.toLowerCase()
      return logs.filter(log => {
        return (
          (log.eventTitle && log.eventTitle.toLowerCase().includes(searchLower)) ||
          (log.playerName && log.playerName.toLowerCase().includes(searchLower)) ||
          (log.userEmail && log.userEmail.toLowerCase().includes(searchLower)) ||
          (log.eventType && log.eventType.toLowerCase().includes(searchLower)) ||
          (log.data && JSON.stringify(log.data).toLowerCase().includes(searchLower))
        )
      })
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      throw error
    }
  }
}

module.exports = AuditService
