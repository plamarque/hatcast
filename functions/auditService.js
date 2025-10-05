const admin = require('firebase-admin')
const db = admin.firestore()

// Import dynamique de la détection d'environnement centralisée
let EnvironmentDetector = null
let FirestoreService = null

class AuditService {
  /**
   * Détermine si on doit logger selon l'environnement
   * @param {string} environment - Environnement détecté
   * @param {Object} eventData - Données de l'événement
   * @returns {boolean} True si on doit logger
   */
  static shouldLog(environment, eventData) {
    // Vérifier si l'audit est explicitement configuré
    const isAuditExplicitlyEnabled = process.env.AUDIT_ENABLED === 'true'
    const isAuditExplicitlyDisabled = process.env.AUDIT_ENABLED === 'false'
    
    // Si explicitement configuré, respecter le flag (override de l'environnement)
    if (isAuditExplicitlyEnabled) {
      return true  // Forcer l'activation dans tous les environnements
    }
    if (isAuditExplicitlyDisabled) {
      return false // Forcer la désactivation dans tous les environnements
    }
    
    // Sinon, utiliser la logique par défaut selon l'environnement
    if (environment === 'test') {
      return false
    }
    
    if (environment === 'development') {
      // Log de debug pour indiquer que l'audit est désactivé par défaut
      if (eventData.severity === 'error' || eventData.severity === 'critical') {
        console.log('🔇 AUDIT DISABLED (dev mode):', eventData.eventType, eventData.data)
      }
      return false // Désactivé par défaut en développement
    }
    
    // Activer l'audit en staging et production par défaut
    return true
  }

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
    // Initialiser EnvironmentDetector si nécessaire
    if (!EnvironmentDetector) {
      try {
        const { EnvironmentDetector: ED } = await import('../src/services/configService.js')
        EnvironmentDetector = ED
      } catch (error) {
        console.warn('⚠️ Impossible d\'importer EnvironmentDetector, utilisation de la logique de fallback')
        // Fallback simple
        EnvironmentDetector = {
          detectEnvironment: () => process.env.NODE_ENV || 'production'
        }
      }
    }
    
    // Initialiser FirestoreService si nécessaire
    if (!FirestoreService) {
      try {
        const { default: FS } = await import('../src/services/firestoreService.js')
        FirestoreService = FS
      } catch (error) {
        console.warn('⚠️ Impossible d\'importer FirestoreService, utilisation de l\'accès direct')
        FirestoreService = null
      }
    }
    
    // Utiliser la détection d'environnement centralisée
    const environment = EnvironmentDetector.detectEnvironment()
    
    // Décider si on logue ou pas selon l'environnement
    if (!this.shouldLog(environment, eventData)) {
      return null
    }
    
    try {
      const auditDoc = {
        ...eventData,
        eventId: this.generateEventId(),
        createdAt: new Date().toISOString() // Utiliser timestamp ISO pour compatibilité
      }
      
      let docId = null
      
      // Utiliser firestoreService si disponible, sinon fallback vers accès direct
      if (FirestoreService) {
        docId = await FirestoreService.addDocument('auditLogs', auditDoc)
      } else {
        // Fallback vers accès direct (pour compatibilité avec Cloud Functions)
        const docRef = await db.collection('auditLogs').add({
          ...auditDoc,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
        docId = docRef.id
      }
      
      // Log critique vers console pour monitoring
      if (eventData.severity === 'error' || eventData.severity === 'critical') {
        console.error('AUDIT ERROR:', auditDoc)
      }
      
      return docId
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

  // Note: isTestEnvironment() supprimée - utilise maintenant EnvironmentDetector.isTestEnvironment()
  
  /**
   * Active manuellement l'audit (force AUDIT_ENABLED=true)
   * Fonctionne différemment selon l'environnement
   * @returns {Promise<Object>} Résultat de l'opération
   */
  static async enableAudit() {
    try {
      // Initialiser EnvironmentDetector si nécessaire
      if (!EnvironmentDetector) {
        try {
          const { EnvironmentDetector: ED } = await import('../src/services/configService.js')
          EnvironmentDetector = ED
        } catch (error) {
          console.warn('⚠️ Impossible d\'importer EnvironmentDetector')
          EnvironmentDetector = {
            detectEnvironment: () => process.env.NODE_ENV || 'production'
          }
        }
      }
      
      const environment = EnvironmentDetector.detectEnvironment()
      
      if (environment === 'development') {
        // En développement, on ne peut pas modifier les variables d'environnement
        // On retourne des instructions pour l'utilisateur
        return {
          success: false,
          environment: environment,
          message: 'En développement, vous devez modifier manuellement le fichier .env.local',
          instructions: [
            '1. Ouvrir le fichier .env.local',
            '2. Ajouter ou modifier: VITE_AUDIT_ENABLED=true',
            '3. Redémarrer le serveur de développement: npm run dev -- --host'
          ],
          command: 'echo "VITE_AUDIT_ENABLED=true" >> .env.local'
        }
      } else {
        // En staging/production, on peut modifier les variables Firebase Functions
        try {
          // Utiliser Firebase Admin pour modifier la configuration
          // Note: Cette approche nécessite des permissions admin
          const { exec } = require('child_process')
          const util = require('util')
          const execAsync = util.promisify(exec)
          
          // Commande Firebase CLI pour définir la variable
          const command = `firebase functions:config:set audit.enabled=true --project ${process.env.GCLOUD_PROJECT || 'impro-selector'}`
          
          return {
            success: true,
            environment: environment,
            message: 'Audit activé avec succès',
            instructions: [
              '1. La variable AUDIT_ENABLED a été définie à true',
              '2. Redéployer les Cloud Functions pour appliquer le changement',
              '3. Commande: firebase deploy --only functions'
            ],
            command: command,
            note: 'Redéploiement des fonctions requis'
          }
        } catch (error) {
          return {
            success: false,
            environment: environment,
            message: 'Erreur lors de l\'activation de l\'audit',
            error: error.message,
            instructions: [
              '1. Vérifier les permissions Firebase',
              '2. Exécuter manuellement: firebase functions:config:set audit.enabled=true',
              '3. Redéployer: firebase deploy --only functions'
            ]
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de l\'activation de l\'audit',
        error: error.message
      }
    }
  }

  /**
   * Désactive manuellement l'audit (force AUDIT_ENABLED=false)
   * Fonctionne différemment selon l'environnement
   * @returns {Promise<Object>} Résultat de l'opération
   */
  static async disableAudit() {
    try {
      // Initialiser EnvironmentDetector si nécessaire
      if (!EnvironmentDetector) {
        try {
          const { EnvironmentDetector: ED } = await import('../src/services/configService.js')
          EnvironmentDetector = ED
        } catch (error) {
          console.warn('⚠️ Impossible d\'importer EnvironmentDetector')
          EnvironmentDetector = {
            detectEnvironment: () => process.env.NODE_ENV || 'production'
          }
        }
      }
      
      const environment = EnvironmentDetector.detectEnvironment()
      
      if (environment === 'development') {
        // En développement, on ne peut pas modifier les variables d'environnement
        return {
          success: false,
          environment: environment,
          message: 'En développement, vous devez modifier manuellement le fichier .env.local',
          instructions: [
            '1. Ouvrir le fichier .env.local',
            '2. Ajouter ou modifier: VITE_AUDIT_ENABLED=false',
            '3. Redémarrer le serveur de développement: npm run dev -- --host'
          ],
          command: 'echo "VITE_AUDIT_ENABLED=false" >> .env.local'
        }
      } else {
        // En staging/production, on peut modifier les variables Firebase Functions
        try {
          const { exec } = require('child_process')
          const util = require('util')
          const execAsync = util.promisify(exec)
          
          const command = `firebase functions:config:set audit.enabled=false --project ${process.env.GCLOUD_PROJECT || 'impro-selector'}`
          
          return {
            success: true,
            environment: environment,
            message: 'Audit désactivé avec succès',
            instructions: [
              '1. La variable AUDIT_ENABLED a été définie à false',
              '2. Redéployer les Cloud Functions pour appliquer le changement',
              '3. Commande: firebase deploy --only functions'
            ],
            command: command,
            note: 'Redéploiement des fonctions requis'
          }
        } catch (error) {
          return {
            success: false,
            environment: environment,
            message: 'Erreur lors de la désactivation de l\'audit',
            error: error.message,
            instructions: [
              '1. Vérifier les permissions Firebase',
              '2. Exécuter manuellement: firebase functions:config:set audit.enabled=false',
              '3. Redéployer: firebase deploy --only functions'
            ]
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la désactivation de l\'audit',
        error: error.message
      }
    }
  }

  /**
   * Obtient le statut actuel de l'audit
   * @returns {Promise<Object>} Statut de l'audit
   */
  static async getAuditStatus() {
    try {
      // Initialiser EnvironmentDetector si nécessaire
      if (!EnvironmentDetector) {
        try {
          const { EnvironmentDetector: ED } = await import('../src/services/configService.js')
          EnvironmentDetector = ED
        } catch (error) {
          console.warn('⚠️ Impossible d\'importer EnvironmentDetector')
          EnvironmentDetector = {
            detectEnvironment: () => process.env.NODE_ENV || 'production'
          }
        }
      }
      
      const environment = EnvironmentDetector.detectEnvironment()
      const auditEnabled = process.env.AUDIT_ENABLED
      const isExplicitlyEnabled = auditEnabled === 'true'
      const isExplicitlyDisabled = auditEnabled === 'false'
      
      // Déterminer le statut réel
      let actualStatus = false
      let statusSource = 'default'
      
      if (isExplicitlyEnabled) {
        actualStatus = true
        statusSource = 'explicit_override'
      } else if (isExplicitlyDisabled) {
        actualStatus = false
        statusSource = 'explicit_override'
      } else {
        // Comportement par défaut
        if (environment === 'test') {
          actualStatus = false
          statusSource = 'default_test'
        } else if (environment === 'development') {
          actualStatus = false
          statusSource = 'default_development'
        } else if (environment === 'staging' || environment === 'production') {
          actualStatus = true
          statusSource = 'default_production'
        }
      }
      
      return {
        success: true,
        environment: environment,
        auditEnabled: auditEnabled,
        actualStatus: actualStatus,
        statusSource: statusSource,
        isExplicitlyEnabled: isExplicitlyEnabled,
        isExplicitlyDisabled: isExplicitlyDisabled,
        message: `Audit ${actualStatus ? 'activé' : 'désactivé'} (${statusSource})`
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la récupération du statut audit',
        error: error.message
      }
    }
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
