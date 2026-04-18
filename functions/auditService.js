// Import conditionnel de Firebase Admin
let admin = null
let db = null

try {
  admin = require('firebase-admin')
  db = admin.firestore()
} catch (error) {
  console.warn('⚠️ Firebase Admin non disponible, utilisation du mode mock')
}

// Variables de classe pour l'initialisation
let EnvironmentDetector = null
let FirestoreService = null
let _environment = null

class AuditService {
  /**
   * Initialise le service d'audit
   * @returns {Promise<void>}
   */
  static async initialize() {
    if (EnvironmentDetector && FirestoreService && _environment) {
      return // Déjà initialisé
    }

    try {
      // Importer EnvironmentDetector
      const { EnvironmentDetector: ED } = await import('../legacy/src/services/configService.js')
      EnvironmentDetector = ED
      _environment = ED.detectEnvironment()
      
      // Importer FirestoreService
      const { default: FS } = await import('../legacy/src/services/firestoreService.js')
      FirestoreService = FS
      
      console.log(`🔧 AuditService initialisé - Environnement: ${_environment}`)
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation d\'AuditService:', error)
      throw new Error(`Impossible d'initialiser AuditService: ${error.message}`)
    }
  }

  /**
   * Détermine si on doit logger selon l'environnement
   * @param {Object} eventData - Données de l'événement
   * @returns {boolean} True si on doit logger
   */
  static shouldLog(eventData) {
    // Vérifier si l'audit est explicitement configuré via process.env (override total)
    const isAuditExplicitlyEnabled = process.env.AUDIT_ENABLED === 'true'
    const isAuditExplicitlyDisabled = process.env.AUDIT_ENABLED === 'false'
    
    // Si explicitement configuré via process.env, respecter le flag (override de tout)
    if (isAuditExplicitlyEnabled) {
      return true  // Forcer l'activation dans tous les environnements
    }
    if (isAuditExplicitlyDisabled) {
      return false // Forcer la désactivation dans tous les environnements
    }
    
    // Environnement de test: toujours désactivé
    if (_environment === 'test') {
      return false
    }
    
    // Environnement de développement local: désactivé par défaut
    if (_environment === 'development') {
      if (eventData.severity === 'error' || eventData.severity === 'critical') {
        console.log('🔇 AUDIT DISABLED (dev mode):', eventData.eventType, eventData.data)
      }
      return false
    }
    
    // Pour staging et production, lire les variables d'environnement
    if (_environment === 'production') {
      // Production: activé par défaut, désactivé seulement si explicitement false
      const configValue = process.env.AUDIT_PRODUCTION_ENABLED
      return configValue !== 'false' && configValue !== false
    } else if (_environment === 'staging') {
      // Staging: désactivé par défaut, activé seulement si explicitement true
      const configValue = process.env.AUDIT_STAGING_ENABLED
      return configValue === 'true' || configValue === true
    }
    
    // Fallback: activer par défaut
    return true
  }

  /**
   * Log un événement d'audit
   * @param {Object} eventData - Données de l'événement
   * @returns {string} ID de l'événement généré
   */
  static async logEvent(eventData) {
    console.log('🔍 logEvent() appelé avec:', {
      eventType: eventData.eventType,
      severity: eventData.severity,
      environment: _environment,
      auditEnabled: process.env.AUDIT_ENABLED
    })
    
    // Décider si on logue ou pas
    const shouldLogResult = this.shouldLog(eventData)
    console.log('🔍 shouldLog() retourne:', shouldLogResult)
    
    if (!shouldLogResult) {
      console.log('🔇 Audit désactivé, pas de logging')
      return null
    }
    
    try {
      const auditDoc = {
        ...eventData,
        eventId: this.generateEventId(),
        createdAt: new Date().toISOString()
      }
      
      // Stockage du document d'audit via firestoreService
      let docId = null
      if (FirestoreService) {
        console.log('📝 Utilisation de FirestoreService pour stocker l\'audit')
        docId = await FirestoreService.addDocument('auditLogs', auditDoc)
      } else if (db) {
        console.log('📝 Utilisation de l\'accès direct Firestore pour stocker l\'audit')
        // Fallback vers accès direct (pour compatibilité avec Cloud Functions)
        const docRef = await db.collection('auditLogs').add({
          ...auditDoc,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        })
        docId = docRef.id
      } else {
        // Mode mock pour les tests
        console.log('📝 Mock: Document d\'audit créé:', auditDoc)
        docId = `mock_doc_${Date.now()}`
      }
      
      console.log('✅ Document d\'audit créé avec ID:', docId)
      
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
   * Obfusque partiellement une adresse email
   * @param {string} email - L'adresse email à obfusquer
   * @returns {string} L'email obfusqué
   */
  static obfuscateEmail(email) {
    if (!email || typeof email !== 'string') {
      return 'invalid-email'
    }
    
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) {
      return 'invalid-email'
    }
    
    // Obfusquer la partie locale (garder les 2 premiers caractères)
    const obfuscatedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
      : localPart
    
    // Obfusquer le domaine (garder l'extension)
    const domainParts = domain.split('.')
    const obfuscatedDomain = domainParts.length > 1
      ? '*'.repeat(domainParts[0].length) + '.' + domainParts.slice(1).join('.')
      : domain
    
    return `${obfuscatedLocal}@${obfuscatedDomain}`
  }

  /**
   * Génère un ID unique pour un événement d'audit
   * @returns {string} ID unique
   */
  static generateEventId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `audit_${timestamp}_${random}`
  }

  /**
   * Log un changement de disponibilité
   * @param {Object} params - Paramètres du changement
   */
  static async logAvailabilityChange(params) {
    const { userId, seasonId, availability, previousAvailability, timestamp } = params
    
    return await this.logEvent({
      eventType: 'availability_change',
      userId: this.obfuscateEmail(userId),
      seasonId,
      data: {
        availability,
        previousAvailability,
        timestamp: timestamp || new Date().toISOString()
      },
      severity: 'info',
      tags: ['availability', 'schedule']
    })
  }

  /**
   * Log une connexion utilisateur
   * @param {Object} params - Paramètres de connexion
   */
  static async logUserLogin(params) {
    const { userId, userAgent, ipAddress, timestamp } = params
    
    return await this.logEvent({
      eventType: 'user_login',
      userId: this.obfuscateEmail(userId),
      data: {
        userAgent: userAgent ? userAgent.substring(0, 200) : null, // Limiter la taille
        ipAddress: ipAddress ? this.obfuscateIP(ipAddress) : null,
        timestamp: timestamp || new Date().toISOString()
      },
      severity: 'info',
      tags: ['authentication', 'security']
    })
  }

  /**
   * Log une déconnexion utilisateur
   * @param {Object} params - Paramètres de déconnexion
   */
  static async logUserLogout(params) {
    const { userId, timestamp } = params
    
    return await this.logEvent({
      eventType: 'user_logout',
      userId: this.obfuscateEmail(userId),
      data: {
        timestamp: timestamp || new Date().toISOString()
      },
      severity: 'info',
      tags: ['authentication', 'security']
    })
  }

  /**
   * Log une erreur système
   * @param {Object} params - Paramètres de l'erreur
   */
  static async logSystemError(params) {
    const { error, context, userId, timestamp } = params
    
    return await this.logEvent({
      eventType: 'system_error',
      userId: userId ? this.obfuscateEmail(userId) : null,
      data: {
        error: error.message || error,
        stack: error.stack ? error.stack.substring(0, 1000) : null, // Limiter la taille
        context,
        timestamp: timestamp || new Date().toISOString()
      },
      severity: 'error',
      tags: ['system', 'error']
    })
  }

  /**
   * Log une action administrative
   * @param {Object} params - Paramètres de l'action
   */
  static async logAdminAction(params) {
    const { adminUserId, action, targetUserId, details, timestamp } = params
    
    return await this.logEvent({
      eventType: 'admin_action',
      userId: this.obfuscateEmail(adminUserId),
      data: {
        action,
        targetUserId: targetUserId ? this.obfuscateEmail(targetUserId) : null,
        details,
        timestamp: timestamp || new Date().toISOString()
      },
      severity: 'warning',
      tags: ['admin', 'security']
    })
  }

  /**
   * Obfusque une adresse IP (garde seulement les 2 premiers octets)
   * @param {string} ip - Adresse IP à obfusquer
   * @returns {string} IP obfusquée
   */
  static obfuscateIP(ip) {
    if (!ip || typeof ip !== 'string') {
      return 'unknown'
    }
    
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`
    }
    
    return 'unknown'
  }

  /**
   * Obtient le statut actuel de l'audit
   * @returns {Promise<Object>} Statut détaillé de l'audit
   */
  static async getAuditStatus() {
    try {
      const isAuditExplicitlyEnabled = process.env.AUDIT_ENABLED === 'true'
      const isAuditExplicitlyDisabled = process.env.AUDIT_ENABLED === 'false'

      let actualStatus = false
      let statusSource = 'unknown'
      let message = ''

      if (isAuditExplicitlyEnabled) {
        actualStatus = true
        statusSource = 'explicit_override'
        message = 'Audit activé (explicit_override)'
      } else if (isAuditExplicitlyDisabled) {
        actualStatus = false
        statusSource = 'explicit_override'
        message = 'Audit désactivé (explicit_override)'
      } else {
        // Comportement par défaut selon l'environnement
        if (_environment === 'test') {
          actualStatus = false
          statusSource = 'default_test'
          message = 'Audit désactivé (default_test)'
        } else if (_environment === 'development') {
          actualStatus = false
          statusSource = 'default_development'
          message = 'Audit désactivé (default_development)'
        } else {
          actualStatus = true
          statusSource = 'default_production'
          message = 'Audit activé (default_production)'
        }
      }

      return {
        success: true,
        environment: _environment,
        auditEnabled: process.env.AUDIT_ENABLED,
        actualStatus,
        statusSource,
        message
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut audit:', error)
      return {
        success: false,
        environment: 'unknown',
        auditEnabled: null,
        actualStatus: false,
        statusSource: 'error',
        message: 'Erreur lors de la vérification'
      }
    }
  }

  /**
   * Active manuellement l'audit
   * @returns {Promise<Object>} Résultat de l'activation
   */
  static async enableAudit() {
    try {
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      if (_environment === 'development') {
        return {
          success: false,
          message: 'En développement, vous devez modifier manuellement le fichier .env.local',
          command: 'echo "VITE_AUDIT_ENABLED=true" >> .env.local',
          instructions: [
            '1. Ouvrir le fichier .env.local',
            '2. Ajouter ou modifier: VITE_AUDIT_ENABLED=true',
            '3. Redémarrer le serveur de développement: npm run dev -- --host'
          ]
        }
      } else {
        // En staging/production, utiliser Firebase CLI
        try {
          await execAsync('firebase functions:config:set audit.enabled=true')
          return {
            success: true,
            message: 'Audit activé avec succès',
            command: 'firebase functions:config:set audit.enabled=true',
            instructions: [
              '1. La variable AUDIT_ENABLED a été définie à true',
              '2. Redéployer les Cloud Functions pour appliquer le changement',
              '3. Commande: firebase deploy --only functions'
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: 'Erreur lors de l\'activation via Firebase CLI',
            command: 'firebase functions:config:set audit.enabled=true',
            instructions: [
              '1. Vérifier que Firebase CLI est installé et configuré',
              '2. Vérifier les permissions du projet',
              '3. Exécuter manuellement: firebase functions:config:set audit.enabled=true'
            ],
            error: error.message
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'activation de l\'audit:', error)
      return {
        success: false,
        message: 'Erreur lors de l\'activation de l\'audit',
        error: error.message
      }
    }
  }

  /**
   * Désactive manuellement l'audit
   * @returns {Promise<Object>} Résultat de la désactivation
   */
  static async disableAudit() {
    try {
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      if (_environment === 'development') {
        return {
          success: false,
          message: 'En développement, vous devez modifier manuellement le fichier .env.local',
          command: 'echo "VITE_AUDIT_ENABLED=false" >> .env.local',
          instructions: [
            '1. Ouvrir le fichier .env.local',
            '2. Ajouter ou modifier: VITE_AUDIT_ENABLED=false',
            '3. Redémarrer le serveur de développement: npm run dev -- --host'
          ]
        }
      } else {
        // En staging/production, utiliser Firebase CLI
        try {
          await execAsync('firebase functions:config:set audit.enabled=false')
          return {
            success: true,
            message: 'Audit désactivé avec succès',
            command: 'firebase functions:config:set audit.enabled=false',
            instructions: [
              '1. La variable AUDIT_ENABLED a été définie à false',
              '2. Redéployer les Cloud Functions pour appliquer le changement',
              '3. Commande: firebase deploy --only functions'
            ]
          }
        } catch (error) {
          return {
            success: false,
            message: 'Erreur lors de la désactivation via Firebase CLI',
            command: 'firebase functions:config:set audit.enabled=false',
            instructions: [
              '1. Vérifier que Firebase CLI est installé et configuré',
              '2. Vérifier les permissions du projet',
              '3. Exécuter manuellement: firebase functions:config:set audit.enabled=false'
            ],
            error: error.message
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la désactivation de l\'audit:', error)
      return {
        success: false,
        message: 'Erreur lors de la désactivation de l\'audit',
        error: error.message
      }
    }
  }
}

module.exports = AuditService
