// Service d'audit côté client pour HatCast
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, auth } from './firebase.js'
import logger from './logger.js'

/**
 * Service d'audit côté client pour logger les actions utilisateur
 * qui ne passent pas automatiquement par les triggers Firestore
 */
class AuditClient {
  /**
   * Nettoyer les données pour Firestore (remplacer undefined par null)
   */
  static cleanDataForFirestore(obj) {
    if (obj === null || obj === undefined) {
      return null
    }
    
    if (typeof obj !== 'object') {
      return obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanDataForFirestore(item))
    }
    
    const cleaned = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        cleaned[key] = null
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = this.cleanDataForFirestore(value)
      } else {
        cleaned[key] = value
      }
    }
    return cleaned
  }

  /**
   * Wrapper sécurisé pour toutes les actions d'audit
   * Garantit qu'aucune erreur d'audit ne peut faire planter l'application
   */
  static async safeLogUserAction(actionData) {
    try {
      await this.logUserAction(actionData)
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur critique dans audit:', error)
      // JAMAIS faire échouer l'action principale
    }
  }

  /**
   * Logger une action utilisateur
   * @param {Object} actionData - Données de l'action
   * @param {string} actionData.type - Type d'action (login, logout, navigation, etc.)
   * @param {string} actionData.category - Catégorie (auth, navigation, modal, error)
   * @param {string} actionData.severity - Sévérité (info, warning, error, critical)
   * @param {Object} actionData.data - Données spécifiques à l'action
   * @param {boolean} actionData.success - Succès de l'action
   * @param {string} actionData.error - Message d'erreur si applicable
   * @param {Array} actionData.tags - Tags pour la recherche
   */
  static async logUserAction(actionData) {
    // Désactiver l'audit en mode test pour éviter la pollution
    const isTest = this.isTestEnvironment()
    
    // Permettre l'audit en développement local (localhost ou IP locale)
    const isLocalDev = typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '192.168.1.134')
    
    // Passe-droit temporaire pour tester l'audit sur /season/test et malice-2025-2026
    const isTestingSeason = typeof window !== 'undefined' && 
                           (window.location.pathname.includes('/season/test') ||
                            window.location.pathname.includes('/season/malice-2025-2026'))
    
    // Permettre l'audit si on est en dev local OU si c'est une saison de test
    if (isTest && !isLocalDev && !isTestingSeason) {
      return
    }
    
    try {
      const user = auth?.currentUser
      
      const auditData = {
        action: actionData?.type || 'unknown',
        eventType: actionData?.type || 'unknown',
        eventCategory: actionData?.category || 'user_action',
        severity: actionData?.severity || 'info',
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || null,
        userRole: this.getUserRole(user),
        data: this.cleanDataForFirestore(actionData?.data || {}),
        success: actionData?.success !== false,
        error: actionData?.error || null,
        deviceInfo: this.cleanDataForFirestore(this.getDeviceInfo()),
        sessionId: this.getSessionId(),
        timestamp: serverTimestamp(),
        tags: actionData?.tags || [],
        // Contexte de navigation (avec fallbacks sécurisés)
        pageUrl: (typeof window !== 'undefined' && window.location?.href) || 'unknown',
        pagePath: (typeof window !== 'undefined' && window.location?.pathname) || 'unknown',
        userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || 'unknown'
      }
      
      const docRef = await addDoc(collection(db, 'auditLogs'), this.cleanDataForFirestore(auditData))
      
      // Log local pour debug
      if (actionData.severity === 'error' || actionData.severity === 'critical') {
        logger.error('AUDIT ERROR:', auditData)
      } else {
        logger.debug('AUDIT LOG:', auditData)
      }
      
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur lors du logging client:', error)
      logger.error('Erreur lors du logging client:', error)
      // Ne pas faire échouer l'action principale
    }
  }
  
  /**
   * Logger une connexion utilisateur
   */
  static async logLogin(email, method = 'email_password') {
    try {
      await this.logUserAction({
        type: 'user_login',
        category: 'auth',
        severity: 'info',
        data: {
          email: this.obfuscateEmail(email),
          method,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['auth', 'login']
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logLogin:', error)
    }
  }
  
  /**
   * Logger une déconnexion utilisateur
   */
  static async logLogout(email) {
    try {
      await this.logUserAction({
        type: 'user_logout',
        category: 'auth',
        severity: 'info',
        data: {
          email: this.obfuscateEmail(email),
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['auth', 'logout']
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logLogout:', error)
    }
  }
  
  /**
   * Logger l'ouverture d'une modale
   */
  static async logModalOpen(modalType, context = {}) {
    try {
      await this.logUserAction({
        type: 'modal_opened',
        category: 'ui',
        severity: 'info',
        data: {
          modalType,
          context,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['ui', 'modal', modalType]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logModalOpen:', error)
    }
  }
  
  /**
   * Logger une erreur côté client
   */
  static async logError(error, context = {}) {
    try {
      await this.logUserAction({
        type: 'client_error',
        category: 'error',
        severity: 'error',
        data: {
          error: error.message || error,
          errorCode: error.code || 'unknown',
          context,
          stack: error.stack,
          timestamp: new Date().toISOString()
        },
        success: false,
        error: error.message || error,
        tags: ['error', 'client']
      })
    } catch (auditError) {
      console.error('❌ AUDIT ERROR - Erreur dans logError:', auditError)
    }
  }
  
  /**
   * Logger une action de navigation
   */
  static async logNavigation(fromPath, toPath, trigger = 'user') {
    try {
      await this.logUserAction({
        type: 'navigation',
        category: 'navigation',
        severity: 'info',
        data: {
          fromPath,
          toPath,
          trigger,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['navigation']
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logNavigation:', error)
    }
  }
  
  /**
   * Logger une action sur un joueur (hors Firestore)
   */
  static async logPlayerAction(action, playerName, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: `player_${action}`,
      category: 'player',
      severity: 'info',
      data: {
        playerName,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['player', action, seasonSlug]
    })
  }
  
  /**
   * Logger une action sur un événement (hors Firestore)
   */
  static async logEventAction(action, eventTitle, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: `event_${action}`,
      category: 'event',
      severity: 'info',
      data: {
        eventTitle,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['event', action, seasonSlug]
    })
  }
  
  /**
   * Logger une action de notification
   */
  static async logNotificationAction(action, playerName, eventTitle, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: `notification_${action}`,
      category: 'notification',
      severity: 'info',
      data: {
        playerName,
        eventTitle,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['notification', action, seasonSlug]
    })
  }
  
  /**
   * Logger un upload d'image
   */
  static async logImageUpload(fileName, fileSize, success, error = null) {
    await this.safeLogUserAction({
      type: 'image_upload',
      category: 'upload',
      severity: success ? 'info' : 'error',
      data: {
        fileName,
        fileSize,
        timestamp: new Date().toISOString()
      },
      success,
      error,
      tags: ['upload', 'image']
    })
  }
  
  /**
   * Logger l'envoi d'un email
   */
  static async logEmailSent(emailType, recipient, success, error = null) {
    await this.safeLogUserAction({
      type: 'email_sent',
      category: 'email',
      severity: success ? 'info' : 'error',
      data: {
        emailType,
        recipient: this.obfuscateEmail(recipient),
        timestamp: new Date().toISOString()
      },
      success,
      error,
      tags: ['email', emailType]
    })
  }
  
  /**
   * Obtenir le rôle de l'utilisateur
   */
  static getUserRole(user) {
    try {
      if (!user) return 'anonymous'
      if (user.email?.includes('admin')) return 'admin'
      return 'player'
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans getUserRole:', error)
      return 'anonymous'
    }
  }
  
  /**
   * Obtenir les informations du device
   */
  static getDeviceInfo() {
    try {
      return {
        userAgent: navigator?.userAgent || 'unknown',
        platform: navigator?.platform || 'unknown',
        language: navigator?.language || 'unknown',
        screenResolution: `${screen?.width || 0}x${screen?.height || 0}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        cookieEnabled: navigator?.cookieEnabled || false,
        onLine: navigator?.onLine || false
      }
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans getDeviceInfo:', error)
      return {
        userAgent: 'error',
        platform: 'error',
        language: 'error',
        screenResolution: '0x0',
        timezone: 'error',
        cookieEnabled: false,
        onLine: false
      }
    }
  }
  
  /**
   * Obtenir l'ID de session
   */
  static getSessionId() {
    try {
      let sessionId = sessionStorage?.getItem('audit_session_id')
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage?.setItem('audit_session_id', sessionId)
      }
      return sessionId
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans getSessionId:', error)
      // Fallback vers un ID basé sur timestamp seulement
      return `sess_fallback_${Date.now()}`
    }
  }
  
  /**
   * Détecter si on est en environnement de test
   */
  static isTestEnvironment() {
    try {
      // Détecter Playwright
      if (typeof window !== 'undefined' && window.navigator) {
        const userAgent = window.navigator.userAgent
        if (userAgent.includes('HeadlessChrome') || 
            userAgent.includes('Playwright') ||
            userAgent.includes('TestCafe') ||
            userAgent.includes('Puppeteer')) {
          return true
        }
      }
      
      // Détecter les variables d'environnement de test
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.NODE_ENV === 'test' ||
            process.env.PLAYWRIGHT_TEST ||
            process.env.CYPRESS ||
            process.env.JEST_WORKER_ID) {
          return true
        }
      }
      
      // Détecter les URLs de test
      if (typeof window !== 'undefined' && window.location) {
        const url = window.location.href
        if (url.includes('localhost:4173') || // Vite preview
            url.includes('staging')) {
          return true
        }
        // Permettre l'audit en développement local
        if (url.includes('localhost:5173') || url.includes('192.168.1.134:5173')) {
          return false
        }
      }
      
      return false
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans isTestEnvironment:', error)
      // En cas d'erreur, considérer comme environnement de test (mode sécurisé)
      return true
    }
  }
  
  /**
   * Anonymiser partiellement un email
   */
  static obfuscateEmail(email) {
    try {
      if (!email || typeof email !== 'string') return null
      const parts = email.split('@')
      if (parts.length !== 2) return email
      
      const [localPart, domain] = parts
      let obfuscatedLocal = localPart
      if (localPart.length <= 3) {
        obfuscatedLocal = localPart.charAt(0) + '••'
      } else {
        obfuscatedLocal = localPart.substring(0, 3) + '••'
      }
      
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
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans obfuscateEmail:', error)
      return email // Retourner l'email original en cas d'erreur
    }
  }

  // ===== GESTION DES SPECTACLES =====
  
  /**
   * Logger l'ajout d'un spectacle
   */
  static async logEventAdded(eventTitle, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'event_added',
      category: 'event',
      severity: 'info',
      data: {
        eventTitle,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['event', 'add', seasonSlug]
    })
  }

  /**
   * Logger la réinitialisation d'un spectacle
   */
  static async logEventReset(eventTitle, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'event_reset',
      category: 'event',
      severity: 'info',
      data: {
        eventTitle,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['event', 'reset', seasonSlug]
    })
  }

  /**
   * Logger la suppression d'un spectacle
   */
  static async logEventDeleted(eventTitle, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'event_deleted',
      category: 'event',
      severity: 'warning',
      data: {
        eventTitle,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['event', 'delete', seasonSlug]
    })
  }

  /**
   * Logger l'archivage d'un spectacle
   */
  static async logEventArchived(eventTitle, seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'event_archived',
        category: 'event',
        severity: 'info',
        data: {
          eventTitle,
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['event', 'archive', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logEventArchived:', error)
    }
  }

  /**
   * Logger le désarchivage d'un spectacle
   */
  static async logEventUnarchived(eventTitle, seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'event_unarchived',
        category: 'event',
        severity: 'info',
        data: {
          eventTitle,
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['event', 'unarchive', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logEventUnarchived:', error)
    }
  }

  /**
   * Logger la modification d'un spectacle
   */
  static async logEventModified(eventTitle, seasonSlug, changes = {}, data = {}) {
    await this.safeLogUserAction({
      type: 'event_modified',
      category: 'event',
      severity: 'info',
      data: {
        eventTitle,
        seasonSlug,
        changes,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['event', 'modify', seasonSlug]
    })
  }

  /**
   * Logger l'annonce d'un nouveau spectacle
   */
  static async logEventAnnounced(eventTitle, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'event_announced',
      category: 'event',
      severity: 'info',
      data: {
        eventTitle,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['event', 'announce', seasonSlug]
    })
  }

  // ===== SÉLECTION & PARTICIPATION =====

  /**
   * Logger le déclenchement de la sélection automatique
   */
  static async logAutoSelectionTriggered(seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'auto_selection_triggered',
        category: 'selection',
        severity: 'info',
        data: {
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['selection', 'auto', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logAutoSelectionTriggered:', error)
    }
  }

  /**
   * Logger la validation de la sélection de spectacles
   */
  static async logSelectionValidated(seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'selection_validated',
        category: 'selection',
        severity: 'info',
        data: {
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['selection', 'validate', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logSelectionValidated:', error)
    }
  }

  /**
   * Logger la saisie du code PIN
   */
  static async logPinEntered(seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'pin_entered',
        category: 'selection',
        severity: 'info',
        data: {
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['selection', 'pin', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logPinEntered:', error)
    }
  }

  /**
   * Logger le déverrouillage de la sélection
   */
  static async logSelectionUnlocked(seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'selection_unlocked',
      category: 'selection',
      severity: 'info',
      data: {
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'unlock', seasonSlug]
    })
  }

  /**
   * Logger la confirmation de participation du joueur
   */
  static async logPlayerConfirmed(playerName, eventTitle, seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'player_confirmed',
        category: 'participation',
        severity: 'info',
        data: {
          playerName,
          eventTitle,
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['participation', 'confirm', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logPlayerConfirmed:', error)
    }
  }

  /**
   * Logger le désistement du joueur
   */
    static async logPlayerWithdrawn(playerName, eventTitle, seasonSlug, data = {}) {
    try {
      await this.logUserAction({
        type: 'player_withdrawn',
        category: 'participation',
        severity: 'warning',
        data: {
          playerName,
          eventTitle,
          seasonSlug,
          ...data,
          timestamp: new Date().toISOString()
        },
        success: true,
        tags: ['participation', 'withdraw', seasonSlug]
      })
    } catch (error) {
      console.error('❌ AUDIT ERROR - Erreur dans logPlayerWithdrawn:', error)
    }
  }

  /**
   * Logger l'annonce de la sélection
   */
  static async logSelectionAnnounced(seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'selection_announced',
      category: 'selection',
      severity: 'info',
      data: {
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'announce', seasonSlug]
    })
  }

  /**
   * Logger l'annonce de l'équipe
   */
  static async logTeamAnnounced(seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'team_announced',
      category: 'selection',
      severity: 'info',
      data: {
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['selection', 'team', seasonSlug]
    })
  }

  // ===== GESTION DES JOUEURS =====

  /**
   * Logger la protection d'un joueur
   */
  static async logPlayerProtected(playerName, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'player_protected',
      category: 'player',
      severity: 'info',
      data: {
        playerName,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['player', 'protect', seasonSlug]
    })
  }

  /**
   * Logger la déprotection d'un joueur
   */
  static async logPlayerUnprotected(playerName, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'player_unprotected',
      category: 'player',
      severity: 'info',
      data: {
        playerName,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['player', 'unprotect', seasonSlug]
    })
  }

  /**
   * Logger le renommage d'un joueur
   */
  static async logPlayerRenamed(oldName, newName, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'player_renamed',
      category: 'player',
      severity: 'info',
      data: {
        oldName,
        newName,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['player', 'rename', seasonSlug]
    })
  }

  /**
   * Logger la suppression d'un joueur
   */
  static async logPlayerDeleted(playerName, seasonSlug, data = {}) {
    await this.safeLogUserAction({
      type: 'player_deleted',
      category: 'player',
      severity: 'warning',
      data: {
        playerName,
        seasonSlug,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['player', 'delete', seasonSlug]
    })
  }

  // ===== AUTHENTIFICATION & COMPTE =====

  /**
   * Logger le changement de mot de passe
   */
  static async logPasswordChanged(email, data = {}) {
    await this.safeLogUserAction({
      type: 'password_changed',
      category: 'auth',
      severity: 'info',
      data: {
        email: this.obfuscateEmail(email),
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['auth', 'password_change']
    })
  }

  /**
   * Logger la suppression de compte
   */
  static async logAccountDeleted(email, data = {}) {
    await this.safeLogUserAction({
      type: 'account_deleted',
      category: 'auth',
      severity: 'critical',
      data: {
        email: this.obfuscateEmail(email),
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['auth', 'account_delete']
    })
  }

  // ===== APPLICATION & NOTIFICATIONS =====

  /**
   * Logger l'installation de l'application PWA
   */
  static async logPWAInstalled(data = {}) {
    await this.safeLogUserAction({
      type: 'pwa_installed',
      category: 'app',
      severity: 'info',
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['app', 'pwa', 'install']
    })
  }

  /**
   * Logger la mise à jour de l'application PWA
   */
  static async logPWAUpdated(data = {}) {
    await this.safeLogUserAction({
      type: 'pwa_updated',
      category: 'app',
      severity: 'info',
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['app', 'pwa', 'update']
    })
  }

  /**
   * Logger l'activation des notifications
   */
  static async logNotificationsEnabled(data = {}) {
    await this.safeLogUserAction({
      type: 'notifications_enabled',
      category: 'notifications',
      severity: 'info',
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['notifications', 'enable']
    })
  }

  /**
   * Logger les changements des préférences de notification
   */
  static async logNotificationPreferencesChanged(preferences = {}, data = {}) {
    await this.safeLogUserAction({
      type: 'notification_preferences_changed',
      category: 'notifications',
      severity: 'info',
      data: {
        preferences,
        ...data,
        timestamp: new Date().toISOString()
      },
      success: true,
      tags: ['notifications', 'preferences']
    })
  }
}

export default AuditClient
