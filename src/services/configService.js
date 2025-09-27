/**
 * Service de configuration unifié pour HatCast
 * Gère la détection d'environnement et la configuration des ressources Firebase
 * avec logique de priorité intelligente et traçabilité complète
 */

import logger from './logger.js'

class ConfigService {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = null;
    this.configSources = {}; // Traçabilité de la source de chaque valeur
    this.isInitialized = false;
  }

  /**
   * Détecte l'environnement actuel basé sur l'URL
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('staging') || hostname.includes('hatcast-staging')) {
      return 'staging';
    } else if (hostname.includes('localhost') || hostname.includes('192.168.1.134') || hostname.includes('127.0.0.1')) {
      return 'development';
    } else {
      return 'production';
    }
  }

  /**
   * Initialise la configuration avec logique de priorité intelligente
   */
  async initializeConfig() {
    if (this.isInitialized) {
      return this.config;
    }

    logger.debug('🔧 Initialisation de la configuration avec logique de priorité intelligente...');
    
    // 1. Configuration de base par environnement
    const baseConfig = this.getBaseConfig();
    
    // 2. Configuration Firebase avec priorité intelligente
    const firebaseConfig = await this.loadFirebaseConfig();
    
    // 3. Configuration des sessions avec priorité intelligente
    const sessionConfig = await this.loadSessionConfig();
    
    // 4. Configuration des logs avec priorité intelligente
    const logsConfig = await this.loadLogsConfig();
    
    // 5. Fusion des configurations (sans les secrets pour l'instant)
    this.config = {
      ...baseConfig,
      firebase: firebaseConfig,
      sessions: sessionConfig,
      logs: logsConfig,
      secrets: {} // Initialement vide, sera chargé plus tard
    };
    
    this.isInitialized = true;
    
    // 6. Log de la traçabilité
    this.logConfigSources();
    
    return this.config;
  }

  /**
   * Charge les secrets Firebase de manière différée (après initialisation Firebase)
   * CHARGE LAZY : ne charge les secrets que quand ils sont explicitement demandés
   */
  async loadSecretsDelayed() {
    // Si les secrets sont déjà chargés, les retourner
    if (this.configSources.secrets && Object.keys(this.config.secrets?.secrets || {}).length > 0) {
      return this.config.secrets;
    }

    // Ne pas charger automatiquement, attendre une demande explicite
    logger.info('⏳ Chargement lazy des secrets Firebase - en attente d\'une demande explicite');
    return {};
  }

  /**
   * Charge les secrets Firebase à la demande (pour l'envoi d'emails)
   * Cette méthode est appelée explicitement quand on a besoin des secrets
   */
  async loadSecretsOnDemand() {
    // Si les secrets sont déjà chargés, les retourner
    if (this.configSources.secrets && Object.keys(this.config.secrets?.secrets || {}).length > 0) {
      return this.config.secrets;
    }

    logger.info('🔐 Chargement à la demande des secrets Firebase...');

    try {
      // Vérifier si Firebase est initialisé
      if (!window.firebaseInitialized) {
        logger.warn('⚠️ Firebase pas encore initialisé, impossible de charger les secrets');
        return {};
      }

      // Charger les secrets
      const secrets = await this.loadSecretsConfig();
      
      // Mettre à jour la configuration
      if (this.config) {
        this.config.secrets = secrets;
      }
      
      return secrets;
    } catch (error) {
      logger.warn('⚠️ Erreur lors du chargement à la demande des secrets:', error);
      return {};
    }
  }

  /**
   * Retourne la configuration pour l'environnement actuel
   */
  async getConfig() {
    if (!this.isInitialized) {
      await this.initializeConfig();
    }
    return this.config;
  }

  /**
   * Retourne la configuration de manière synchrone (pour compatibilité)
   * ATTENTION: Peut retourner null si pas encore initialisée
   */
  getConfigSync() {
    return this.config;
  }

  /**
   * Configuration de base par environnement (sans valeurs sensibles)
   */
  getBaseConfig() {
    const env = this.environment;
    
    const baseConfigs = {
      development: {
        firestore: {
          database: 'development',
          region: 'europe-west3'
        },
        storage: {
          prefix: 'development/'
        },
        email: {
          service: 'ethereal',
          capture: false,
          from: {
            name: 'HatCast Dev',
            email: 'dev@ethereal.email',
            displayName: 'HatCast Dev <dev@ethereal.email>'
          },
          replyTo: 'dev@ethereal.email'
        },
        magicLinks: {
          expirationDays: 7
        },
        notifications: {
          vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
        },
        hosting: {
          url: 'https://192.168.1.134:5173'
        },
        pwa: {
          serviceWorkerEnabled: true,
          installPromptEnabled: true
        },
        push: {
          enabled: true,
          vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
        }
      },
      staging: {
        firestore: {
          database: 'staging',
          region: 'us-central1'
        },
        storage: {
          prefix: 'staging/'
        },
        email: {
          service: 'ethereal',
          capture: true,
          from: {
            name: 'HatCast Dev',
            email: 'dev@ethereal.email',
            displayName: 'HatCast Dev <dev@ethereal.email>'
          },
          replyTo: 'dev@ethereal.email'
        },
        magicLinks: {
          expirationDays: 7
        },
        notifications: {
          vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
        },
        hosting: {
          url: 'https://hatcast-staging.web.app'
        },
        pwa: {
          serviceWorkerEnabled: true,
          installPromptEnabled: true
        },
        push: {
          enabled: true,
          vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
        }
      },
      production: {
        firestore: {
          database: 'default',
          region: 'us-central1'
        },
        storage: {
          prefix: 'production/'
        },
        email: {
          service: 'gmail',
          capture: false,
          from: {
            name: 'HatCast',
            email: 'impropick@gmail.com',
            displayName: 'HatCast <impropick@gmail.com>'
          },
          replyTo: 'impropick@gmail.com'
        },
        magicLinks: {
          expirationDays: 7
        },
        notifications: {
          vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
        },
        hosting: {
          url: 'https://impro-selector.web.app'
        },
        pwa: {
          serviceWorkerEnabled: true,
          installPromptEnabled: true
        },
        push: {
          enabled: true,
          vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
        }
      }
    };

    return baseConfigs[env] || baseConfigs.production;
  }

  /**
   * Charge la configuration Firebase avec logique de priorité intelligente
   */
  async loadFirebaseConfig() {
    const env = this.environment;
    logger.debug(`🔍 Chargement de la configuration Firebase pour l'environnement: ${env}`);

    // Valeurs par défaut (fallback)
    const defaultConfig = {
      apiKey: 'AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0',
      authDomain: 'impro-selector.firebaseapp.com',
      projectId: 'impro-selector',
      storageBucket: 'impro-selector.firebasestorage.app',
      messagingSenderId: '730278491306',
      appId: '1:730278491306:web:c966af1179221e91118cd3',
      measurementId: 'G-3NB062D088'
    };

    const finalConfig = {};
    const sources = {};

    // Priorité 1: Variables d'environnement VITE (pour le dev local)
    if (env === 'development') {
      logger.info('🔍 Priorité 1: Recherche dans les variables VITE...');
      
      const viteConfig = this.loadFromViteEnv();
      Object.keys(defaultConfig).forEach(key => {
        if (viteConfig[key]) {
          finalConfig[key] = viteConfig[key];
          sources[key] = 'VITE_ENV';
        } else {
          finalConfig[key] = defaultConfig[key];
          sources[key] = 'DEFAULT_FALLBACK';
        }
      });
    } else {
      // Priorité 2: Tentative de récupération depuis Firebase Functions
      logger.info('🔍 Priorité 2: Tentative de récupération depuis Firebase Functions...');
      
      try {
        const firebaseConfig = await this.loadFromFirebaseFunctions();
        if (firebaseConfig) {
          logger.info('✅ Configuration récupérée depuis Firebase Functions');
          Object.keys(defaultConfig).forEach(key => {
            if (firebaseConfig[key]) {
              finalConfig[key] = firebaseConfig[key];
              sources[key] = 'FIREBASE_FUNCTIONS';
            } else {
              finalConfig[key] = defaultConfig[key];
              sources[key] = 'DEFAULT_FALLBACK';
            }
          });
        } else {
          // Fallback vers les valeurs par défaut
          logger.debug('⚠️ Impossible de récupérer la config depuis Firebase, utilisation des valeurs par défaut');
          Object.keys(defaultConfig).forEach(key => {
            finalConfig[key] = defaultConfig[key];
            sources[key] = 'DEFAULT_FALLBACK';
          });
        }
      } catch (error) {
        logger.warn('⚠️ Erreur lors de la récupération depuis Firebase, utilisation des valeurs par défaut:', error);
        Object.keys(defaultConfig).forEach(key => {
          finalConfig[key] = defaultConfig[key];
          sources[key] = 'DEFAULT_FALLBACK';
        });
      }
    }

    // Stocker les sources pour la traçabilité
    this.configSources.firebase = sources;
    
    return finalConfig;
  }

    /**
   * Charge la configuration des logs avec logique de priorité intelligente
   */
  async loadLogsConfig() {
    const env = this.environment;
    logger.debug(`🔍 Chargement de la configuration des logs pour l'environnement: ${env}`);

    // Valeurs par défaut (fallback)
    const defaultLogsConfig = {
      level: env === 'development' ? 'debug' : 'info'
    };

    const finalConfig = {};
    const sources = {};

    // Priorité 1: Variables d'environnement VITE (pour le dev local)
    if (env === 'development') {
      logger.info('🔍 Priorité 1: Recherche des configurations de logs dans les variables VITE...');
      
      const viteConfig = this.loadLogsConfigFromViteEnv();
      Object.keys(defaultLogsConfig).forEach(key => {
        if (viteConfig[key] !== undefined) {
          finalConfig[key] = viteConfig[key];
          sources[key] = 'VITE_ENV';
        } else {
          finalConfig[key] = defaultLogsConfig[key];
          sources[key] = 'DEFAULT_FALLBACK';
        }
      });
    } else {
      // Priorité 2: Tentative de récupération depuis Firebase Functions
      logger.info('🔍 Priorité 2: Tentative de récupération des configurations de logs depuis Firebase Functions...');
      
      try {
        const firebaseConfig = await this.loadFromFirebaseFunctions();
        if (firebaseConfig && firebaseConfig.logs) {
          logger.info('✅ Configuration des logs récupérée depuis Firebase Functions');
          Object.keys(defaultLogsConfig).forEach(key => {
            if (firebaseConfig.logs[key] !== undefined) {
              finalConfig[key] = firebaseConfig.logs[key];
              sources[key] = 'FIREBASE_FUNCTIONS';
            } else {
              finalConfig[key] = defaultLogsConfig[key];
              sources[key] = 'DEFAULT_FALLBACK';
            }
          });
        } else {
          // Fallback vers les valeurs par défaut
          logger.debug('⚠️ Impossible de récupérer la config des logs depuis Firebase, utilisation des valeurs par défaut');
          Object.keys(defaultLogsConfig).forEach(key => {
            finalConfig[key] = defaultLogsConfig[key];
            sources[key] = 'DEFAULT_FALLBACK';
          });
        }
      } catch (error) {
        logger.warn('⚠️ Erreur lors de la récupération des logs depuis Firebase, utilisation des valeurs par défaut:', error);
        Object.keys(defaultLogsConfig).forEach(key => {
          finalConfig[key] = defaultLogsConfig[key];
          sources[key] = 'DEFAULT_FALLBACK';
        });
      }
    }

    // Stocker les sources pour la traçabilité
    this.configSources.logs = sources;

    return finalConfig;
  }

  /**
   * Charge la configuration des sessions avec logique de priorité intelligente
   */
  async loadSessionConfig() {
    const env = this.environment;
    logger.debug(`🔍 Chargement de la configuration des sessions pour l'environnement: ${env}`);

    // Valeurs par défaut (fallback)
    const defaultSessionConfig = {
      userSessionDurationMonths: 6,
      pinSessionDurationConnectedDays: 7,
      pinSessionDurationAnonymousMinutes: 10
    };

    const finalConfig = {};
    const sources = {};

    // Priorité 1: Variables d'environnement VITE (pour le dev local)
    if (env === 'development') {
      logger.info('🔍 Priorité 1: Recherche des configurations de session dans les variables VITE...');
      
      const viteConfig = this.loadSessionConfigFromViteEnv();
      Object.keys(defaultSessionConfig).forEach(key => {
        if (viteConfig[key] !== undefined) {
          finalConfig[key] = viteConfig[key];
          sources[key] = 'VITE_ENV';
        } else {
          finalConfig[key] = defaultSessionConfig[key];
          sources[key] = 'DEFAULT_FALLBACK';
        }
      });
    } else {
      // Priorité 2: Tentative de récupération depuis Firebase Functions
      logger.info('🔍 Priorité 2: Tentative de récupération des configurations de session depuis Firebase Functions...');
      
      try {
        const firebaseConfig = await this.loadFromFirebaseFunctions();
        if (firebaseConfig && firebaseConfig.sessions) {
          logger.info('✅ Configuration des sessions récupérée depuis Firebase Functions');
          Object.keys(defaultSessionConfig).forEach(key => {
            if (firebaseConfig.sessions[key] !== undefined) {
              finalConfig[key] = firebaseConfig.sessions[key];
              sources[key] = 'FIREBASE_FUNCTIONS';
            } else {
              finalConfig[key] = defaultSessionConfig[key];
              sources[key] = 'DEFAULT_FALLBACK';
            }
          });
        } else {
          // Fallback vers les valeurs par défaut
          logger.debug('⚠️ Impossible de récupérer la config des sessions depuis Firebase, utilisation des valeurs par défaut');
          Object.keys(defaultSessionConfig).forEach(key => {
            finalConfig[key] = defaultSessionConfig[key];
            sources[key] = 'DEFAULT_FALLBACK';
          });
        }
      } catch (error) {
        logger.warn('⚠️ Erreur lors de la récupération des sessions depuis Firebase, utilisation des valeurs par défaut:', error);
        Object.keys(defaultSessionConfig).forEach(key => {
          finalConfig[key] = defaultSessionConfig[key];
          sources[key] = 'DEFAULT_FALLBACK';
        });
      }
    }

    // Stocker les sources pour la traçabilité
    this.configSources.sessions = sources;

    return finalConfig;
  }

  /**
   * Charge les secrets Firebase avec logique de priorité intelligente
   */
  async loadSecretsConfig() {
    logger.info('🔐 Chargement des secrets Firebase...');

    try {
      // Vérifier si Firebase est initialisé
      if (!window.firebaseInitialized) {
        logger.info('⏳ Firebase pas encore initialisé, chargement des secrets différé');
        return {};
      }

      // Tentative de récupération depuis adminService
      const adminService = await import('./adminService.js');
      
      // Vérifier si la méthode getSecrets existe
      if (!adminService.default.getSecrets) {
        logger.info('ℹ️ Méthode getSecrets non disponible dans adminService, chargement différé');
        return {};
      }

      const secrets = await adminService.default.getSecrets();
      
      if (secrets && Object.keys(secrets).length > 0) {
        logger.info('✅ Secrets Firebase récupérés avec succès');
        
        // Créer les sources pour la traçabilité
        const sources = {};
        Object.keys(secrets).forEach(key => {
          sources[key] = 'FIREBASE_SECRETS';
        });
        
        // Stocker les sources pour la traçabilité
        this.configSources.secrets = sources;
        
        return secrets;
      } else {
        logger.info('ℹ️ Aucun secret Firebase trouvé');
        this.configSources.secrets = {};
        return {};
      }
    } catch (error) {
      logger.info('ℹ️ Chargement des secrets Firebase différé:', error.message);
      this.configSources.secrets = {};
      return {};
    }
  }

  /**
   * Charge la configuration des logs depuis les variables d'environnement VITE
   */
  loadLogsConfigFromViteEnv() {
    const config = {};
    
    // Mapping des variables VITE vers les clés de logs
    const viteMapping = {
      'VITE_LOG_LEVEL': 'level'
    };

    Object.entries(viteMapping).forEach(([viteKey, configKey]) => {
      const value = import.meta.env[viteKey];
      if (value !== undefined) {
        config[configKey] = value;
        logger.debug(`✅ ${configKey} chargé depuis ${viteKey}: ${value}`);
      }
    });

    return config;
  }

  /**
   * Charge la configuration des sessions depuis les variables d'environnement VITE
   */
  loadSessionConfigFromViteEnv() {
    const config = {};
    
    // Mapping des variables VITE vers les clés de session
    const viteMapping = {
      'VITE_USER_SESSION_DURATION_MONTHS': 'userSessionDurationMonths',
      'VITE_PIN_SESSION_DURATION_CONNECTED_DAYS': 'pinSessionDurationConnectedDays',
      'VITE_PIN_SESSION_DURATION_ANONYMOUS_MINUTES': 'pinSessionDurationAnonymousMinutes'
    };

    Object.entries(viteMapping).forEach(([viteKey, configKey]) => {
      const value = import.meta.env[viteKey];
      if (value !== undefined) {
        const parsedValue = parseInt(value);
        if (!isNaN(parsedValue)) {
          config[configKey] = parsedValue;
          logger.debug(`✅ ${configKey} chargé depuis ${viteKey}: ${parsedValue}`);
        } else {
          logger.warn(`⚠️ Valeur invalide pour ${viteKey}: ${value}`);
        }
      }
    });

    return config;
  }

  /**
   * Charge la configuration depuis les variables d'environnement VITE
   */
  loadFromViteEnv() {
    const config = {};
    
    // Mapping des variables VITE vers les clés Firebase
    const viteMapping = {
      'VITE_FIREBASE_API_KEY': 'apiKey',
      'VITE_FIREBASE_AUTH_DOMAIN': 'authDomain',
      'VITE_FIREBASE_PROJECT_ID': 'projectId',
      'VITE_FIREBASE_STORAGE_BUCKET': 'storageBucket',
      'VITE_FIREBASE_MESSAGING_SENDER_ID': 'messagingSenderId',
      'VITE_FIREBASE_APP_ID': 'appId',
      'VITE_FIREBASE_MEASUREMENT_ID': 'measurementId'
    };

    Object.entries(viteMapping).forEach(([viteKey, configKey]) => {
      if (import.meta.env[viteKey]) {
        config[configKey] = import.meta.env[viteKey];
        logger.debug(`✅ ${configKey} chargé depuis ${viteKey}`);
      }
    });

    return config;
  }

  /**
   * Tente de récupérer la configuration depuis Firebase Functions
   */
  async loadFromFirebaseFunctions() {
    try {
      // Vérifier si on peut s'authentifier
      const authToken = await this.getAuthToken();
      if (!authToken) {
        logger.debug('⚠️ Pas de token d\'authentification, impossible de récupérer la config Firebase');
        return null;
      }

      logger.info('🔐 Tentative de récupération de la configuration depuis Firebase Functions...');
      
      const response = await fetch('https://us-central1-impro-selector.cloudfunctions.net/dumpEnvironment', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        logger.info('✅ Configuration récupérée depuis Firebase Functions');
        return result.data || result;
      } else {
        logger.warn(`⚠️ Erreur HTTP ${response.status} lors de la récupération de la config Firebase`);
        return null;
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération depuis Firebase Functions:', error);
      return null;
    }
  }

  /**
   * Log de la traçabilité des sources de configuration
   */
  logConfigSources() {
    logger.info('🔍 Traçabilité des sources de configuration:');
    
    if (this.configSources.firebase) {
      logger.info('  🔥 Configuration Firebase:');
      Object.entries(this.configSources.firebase).forEach(([key, source]) => {
        logger.info(`    - ${key}: ${source}`);
      });
    }
    
    if (this.configSources.sessions) {
      logger.info('  ⏰ Configuration des sessions:');
      Object.entries(this.configSources.sessions).forEach(([key, source]) => {
        logger.info(`    - ${key}: ${source}`);
      });
    }
    
    if (this.configSources.logs) {
      logger.info('  📝 Configuration des logs:');
      Object.entries(this.configSources.logs).forEach(([key, source]) => {
        logger.info(`    - ${key}: ${source}`);
      });
    }
    
    if (this.configSources.secrets) {
      logger.info('  🔐 Secrets Firebase:');
      Object.entries(this.configSources.secrets).forEach(([key, source]) => {
        logger.info(`    - ${key}: ${source}`);
      });
    }
  }

  /**
   * Retourne la source d'une valeur de configuration
   */
  getConfigSource(key, category = 'firebase') {
    return this.configSources[category]?.[key] || 'UNKNOWN';
  }

  /**
   * Retourne la base de données Firestore à utiliser
   */
  getFirestoreDatabase() {
    return this.config.firestore.database;
  }

  /**
   * Retourne la région Firestore
   */
  getFirestoreRegion() {
    return this.config.firestore.region;
  }

  /**
   * Retourne la VAPID key pour les notifications push
   */
  getVapidKey() {
    return this.config.notifications.vapidKey;
  }

  /**
   * Retourne le bucket Storage à utiliser
   */
  getStorageBucket() {
    return this.config.storage.bucket;
  }

  /**
   * Retourne le préfixe Storage pour l'environnement
   */
  getStoragePrefix() {
    return this.config.storage.prefix;
  }

  /**
   * Retourne la configuration Firebase complète
   */
  getFirebaseConfig() {
    return this.config.firebase;
  }

  /**
   * Retourne une clé Firebase spécifique
   */
  getFirebaseKey(key) {
    return this.config.firebase[key];
  }

  /**
   * Retourne la clé API Firebase
   */
  getFirebaseApiKey() {
    return this.config.firebase.apiKey;
  }

  /**
   * Retourne le domaine d'authentification Firebase
   */
  getFirebaseAuthDomain() {
    return this.config.firebase.authDomain;
  }

  /**
   * Retourne l'ID du projet Firebase
   */
  getFirebaseProjectId() {
    return this.config.firebase.projectId;
  }

  /**
   * Retourne le bucket Storage Firebase
   */
  getFirebaseStorageBucket() {
    return this.config.firebase.storageBucket;
  }

  /**
   * Retourne l'ID de l'expéditeur Firebase
   */
  getFirebaseMessagingSenderId() {
    return this.config.firebase.messagingSenderId;
  }

  /**
   * Retourne l'ID de l'application Firebase
   */
  getFirebaseAppId() {
    return this.config.firebase.appId;
  }

  /**
   * Retourne l'ID de mesure Firebase
   */
  getFirebaseMeasurementId() {
    return this.config.firebase.measurementId;
  }

  /**
   * Retourne la durée de session utilisateur en mois
   */
  getUserSessionDurationMonths() {
    return this.config.sessions?.userSessionDurationMonths || 6;
  }

  /**
   * Retourne la durée de session PIN pour utilisateurs connectés en jours
   */
  getPinSessionDurationConnectedDays() {
    return this.config.sessions?.pinSessionDurationConnectedDays || 7;
  }

  /**
   * Retourne la durée de session PIN pour utilisateurs anonymes en minutes
   */
  getPinSessionDurationAnonymousMinutes() {
    return this.config.sessions?.pinSessionDurationAnonymousMinutes || 10;
  }

  /**
   * Retourne les credentials Ethereal depuis les variables d'environnement
   * Priorité: .env.local > Firebase Secrets > null (pas de warning en staging/prod)
   */
  getEtherealCredentials() {
    const environment = this.getEnvironment();
    
    // Priorité 1: Variables d'environnement locales (.env.local)
    const localUser = import.meta.env.VITE_ETHEREAL_SMTP_USER;
    const localPass = import.meta.env.VITE_ETHEREAL_SMTP_PASS;
    
    if (localUser && localPass) {
      logger.info('🔐 Credentials Ethereal récupérés depuis .env.local');
      return {
        user: localUser,
        pass: localPass,
        source: 'local_env'
      };
    }
    
    // Priorité 2: Secrets Firebase (si disponibles)
    if (this.config?.secrets?.ethereal) {
      logger.info('🔐 Credentials Ethereal récupérés depuis Firebase Secrets');
      return {
        user: this.config.secrets.ethereal.smtp_user,
        pass: this.config.secrets.ethereal.smtp_pass,
        source: 'firebase_secrets'
      };
    }
    
    // En développement, utiliser des valeurs par défaut avec warning
    if (environment === 'development') {
      logger.warn('⚠️ Aucun credential Ethereal configuré, utilisation des valeurs par défaut');
      return {
        user: 'dev@ethereal.email',
        pass: 'dev_password',
        source: 'default'
      };
    }
    
    // En staging/prod, retourner null sans warning (pas besoin d'Ethereal)
    return null;
  }

  /**
   * Vérifie si les credentials Ethereal sont configurés
   */
  isEtherealConfigured() {
    const credentials = this.getEtherealCredentials();
    return credentials && credentials.source !== 'default' && credentials.user && credentials.pass;
  }

  /**
   * Retourne la source des credentials Ethereal
   */
  getEtherealCredentialsSource() {
    const credentials = this.getEtherealCredentials();
    return credentials ? credentials.source : 'none';
  }

  /**
   * Retourne la configuration email
   */
  getEmailConfig() {
    return this.config.email;
  }

  /**
   * Retourne la configuration d'expéditeur d'email
   */
  getEmailFromConfig() {
    const emailConfig = this.config.email;
    if (emailConfig?.from && emailConfig?.replyTo) {
      return {
        from: emailConfig.from.displayName,
        replyTo: emailConfig.replyTo
      };
    }
    return null;
  }

  /**
   * Retourne la durée d'expiration des magic links en jours
   */
  getMagicLinkExpirationDays() {
    return this.config.magicLinks?.expirationDays || 7;
  }

  /**
   * Retourne les valeurs de fallback pour l'email
   */
  getEmailFallbackConfig() {
    return {
      from: 'HatCast <noreply@hatcast.com>',
      replyTo: 'noreply@hatcast.com'
    };
  }

  /**
   * Retourne l'URL de l'environnement
   */
  getHostingUrl() {
    return this.config.hosting.url;
  }

  /**
   * Vérifie si on est en mode développement
   */
  isDevelopment() {
    return this.environment === 'development';
  }

  /**
   * Vérifie si on est en mode staging
   */
  isStaging() {
    return this.environment === 'staging';
  }

  /**
   * Vérifie si on est en mode production
   */
  isProduction() {
    return this.environment === 'production';
  }

  /**
   * Retourne l'environnement actuel
   */
  getEnvironment() {
    if (!this.environment) {
      // Fallback si l'environnement n'est pas encore détecté
      this.environment = this.detectEnvironment();
    }
    return this.environment;
  }

  /**
   * Retourne le niveau de log avec logique de priorité intelligente et cache
   * Priorité: localStorage > VITE_LOG_LEVEL (.env.local) > Firebase Config > Valeurs par défaut par environnement
   */
  getLogLevel() {
    const env = this.environment;
    
    // Priorité 1: localStorage (pour mémoriser le choix de l'utilisateur)
    const savedLevel = localStorage.getItem('hatcast_log_level');
    if (savedLevel) {
      return savedLevel;
    }
    
    // Priorité 2: Variable d'environnement VITE_LOG_LEVEL (pour le dev local)
    const viteLogLevel = import.meta.env.VITE_LOG_LEVEL;
    if (viteLogLevel) {
      return viteLogLevel;
    }
    
    // Priorité 3: Configuration Firebase (pour staging/production) avec cache
    if (this.config?.logs?.level) {
      // En mode développement, ne pas rafraîchir depuis Firebase
      if (this.environment !== 'development') {
        // Vérifier si on doit rafraîchir le cache (toutes les 30 secondes)
        const now = Date.now();
        if (!this.config.logs.lastFirebaseCheck || (now - this.config.logs.lastFirebaseCheck > 30000)) {
          // Rafraîchir le cache en arrière-plan (non bloquant)
          this.refreshLogLevelFromFirebase();
        }
      }
      return this.config.logs.level;
    }
    
    // Priorité 4: Valeurs par défaut selon l'environnement
    const defaultLogLevels = {
      development: 'debug',
      staging: 'info',
      production: 'info'
    };
    
    const defaultLevel = defaultLogLevels[env] || 'info';
    return defaultLevel;
  }

  /**
   * Rafraîchit le niveau de log depuis Firebase (non bloquant)
   */
  async refreshLogLevelFromFirebase() {
    // En mode développement, ne pas essayer de rafraîchir depuis Firebase
    if (this.environment === 'development') {
      return;
    }
    
    // Ne pas bloquer l'exécution, faire le rafraîchissement en arrière-plan
    setTimeout(async () => {
      try {
        const firebaseLevel = await this.loadLogLevelFromFirebaseInternal();
        if (firebaseLevel) {
          // Mettre à jour la configuration locale
          if (!this.config.logs) {
            this.config.logs = {};
          }
          this.config.logs.level = firebaseLevel;
          this.config.logs.lastFirebaseCheck = Date.now();
        }
      } catch (error) {
        // En cas d'erreur, ne pas mettre à jour le cache
      }
    }, 0);
  }

  /**
   * Charge le niveau de log depuis Firebase (pour staging/production)
   * Cette méthode est appelée après l'initialisation Firebase
   */
  async loadLogLevelFromFirebaseInternal() {
    try {
      logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Début, environnement: ${this.environment}`);
      // Vérifier si Firebase est initialisé
      if (!window.firebaseInitialized) {
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Firebase pas initialisé`);
        return null;
      }

      // Vérifier si on peut s'authentifier
      const authToken = await this.getAuthToken();
      logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Token récupéré: ${authToken ? 'OUI' : 'NON'}`);
      if (!authToken) {
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Pas de token, retour null`);
        return null;
      }

      // Utiliser le SDK Firebase Functions au lieu d'une URL codée en dur
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const getLogLevel = httpsCallable(functions, 'getLogLevel');
        const result = await getLogLevel();
        
        if (result.data?.success && result.data?.level) {
          // Mettre à jour la configuration locale
          if (!this.config.logs) {
            this.config.logs = {};
          }
          this.config.logs.level = result.data.level;
          return result.data.level;
        }
      } catch (firebaseError) {
        // Fallback vers l'URL directe si le SDK échoue
        logger.warn('⚠️ SDK Firebase Functions échoué, tentative avec URL directe...');
        
        // Construire l'URL dynamiquement à partir de la configuration Firebase
        const projectId = this.config.firebase?.projectId || 'impro-selector';
        const region = 'us-central1'; // Région par défaut des Cloud Functions
        const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/getLogLevel`;
        
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Tentative avec URL: ${functionUrl}`);
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Token d'auth: ${authToken ? authToken.substring(0, 20) + '...' : 'AUCUN'}`);
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Environnement détecté: ${this.environment}`);
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Configuration Firebase:`, this.config.firebase);
        
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Début du fetch...`);
        const response = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        logger.debug(`🔧 loadLogLevelFromFirebaseInternal: Fetch terminé, status: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.level) {
            // Mettre à jour la configuration locale
            if (!this.config.logs) {
              this.config.logs = {};
            }
            this.config.logs.level = result.level;
            return result.level;
          }
        } else {
          logger.error(`❌ Erreur HTTP ${response.status} lors de la récupération du niveau de log`);
          logger.error(`🔍 Détails de la réponse:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
          });
        }
      }
    } catch (error) {
      logger.error(`❌ Erreur lors de la récupération du niveau de log:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      // En cas d'erreur, retourner null pour utiliser les valeurs par défaut
    }
    
    return null;
  }

  /**
   * Rafraîchit le niveau de log depuis Firebase (méthode publique)
   */
  async refreshLogLevel() {
    await this.refreshLogLevelFromFirebase();
  }

  /**
   * Met à jour le niveau de log dans la configuration Firebase
   */
  async setLogLevel(level) {
    try {
      // En développement local, on ne peut pas modifier le niveau de log via Firebase
      // car les Cloud Functions ne sont pas accessibles depuis localhost
      if (this.environment === 'development') {
        logger.info(`🔧 Mode développement: niveau de log mis à jour localement vers: ${level}`);
        // Mettre à jour la configuration locale seulement
        if (!this.config.logs) { this.config.logs = {}; }
        this.config.logs.level = level;
        
        // En développement, sauvegarder le choix dans localStorage
        localStorage.setItem('hatcast_log_level', level);
        return true;
      }

      // Vérifier si on peut s'authentifier
      logger.debug(`🔧 setLogLevel: Début de la fonction, environnement: ${this.environment}`);
      const authToken = await this.getAuthToken();
      logger.debug(`🔧 setLogLevel: Token récupéré: ${authToken ? 'OUI' : 'NON'}`);
      if (!authToken) {
        const errorMsg = 'Pas de token d\'authentification, impossible de mettre à jour le niveau de log';
        logger.warn(`⚠️ ${errorMsg}`);
        throw new Error(errorMsg);
      }

      logger.info(`🔧 Mise à jour du niveau de log vers: ${level}`);
      
      // Utiliser le SDK Firebase Functions au lieu d'une URL codée en dur
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const setLogLevel = httpsCallable(functions, 'setLogLevel');
        const result = await setLogLevel({ level });
        
        if (result.data?.success) {
          // Mettre à jour la configuration locale
          if (!this.config.logs) {
            this.config.logs = {};
          }
          this.config.logs.level = level;
          
          logger.info(`✅ Niveau de log mis à jour avec succès vers: ${level}`);
          return true;
        } else {
          const errorMsg = result.data?.message || 'Erreur inconnue lors de la mise à jour du niveau de log';
          logger.error(`❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
      } catch (firebaseError) {
        // Fallback vers l'URL directe si le SDK échoue
        logger.warn('⚠️ SDK Firebase Functions échoué, tentative avec URL directe...');
        
        // Construire l'URL dynamiquement à partir de la configuration Firebase
        const projectId = this.config.firebase?.projectId || 'impro-selector';
        const region = 'us-central1'; // Région par défaut des Cloud Functions
        const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/setLogLevel`;
        
        logger.debug(`🔧 setLogLevel: Tentative avec URL: ${functionUrl}`);
        logger.debug(`🔧 setLogLevel: Token d'auth: ${authToken ? authToken.substring(0, 20) + '...' : 'AUCUN'}`);
        logger.debug(`🔧 setLogLevel: Environnement détecté: ${this.environment}`);
        logger.debug(`🔧 setLogLevel: Configuration Firebase:`, this.config.firebase);
        
        logger.debug(`🔧 setLogLevel: Début du fetch...`);
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ level })
        });
        logger.debug(`🔧 setLogLevel: Fetch terminé, status: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Mettre à jour la configuration locale
            if (!this.config.logs) {
              this.config.logs = {};
            }
            this.config.logs.level = level;
            
            logger.info(`✅ Niveau de log mis à jour avec succès vers: ${level}`);
            return true;
          } else {
            const errorMsg = result.message || 'Erreur inconnue lors de la mise à jour du niveau de log';
            logger.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
          }
        } else {
          const errorMsg = `Erreur HTTP ${response.status} lors de la mise à jour du niveau de log`;
          logger.error(`❌ ${errorMsg}`);
          logger.error(`🔍 Détails de la réponse:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
          });          throw new Error(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = error.message || 'Erreur inconnue lors de la mise à jour du niveau de log';
      logger.error(`❌ ${errorMsg}`);
      logger.error(`🔍 Détails de l'erreur:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      throw new Error(errorMsg);
    }
  }

  /**
   * Retourne la configuration complète
   */
  getFullConfig() {
    return this.config;
  }

  /**
   * Récupère le token d'authentification Firebase
   */
  async getAuthToken() {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
              logger.warn('⚠️ Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Retourne un résumé formaté pour l'affichage
   */
  async getEnvironmentSummary() {
    return {
      environment: this.environment,
      url: window.location.href,
      hostname: window.location.hostname,
      // Configuration Firestore (déterminée côté client)
      firestore: {
        database: this.config.firestore.database,
        region: this.config.firestore.region
      },
      // Configuration Storage (déterminée côté client)
      storage: {
        bucket: this.config.storage.bucket,
        prefix: this.config.storage.prefix
      },
      // Configuration Email (déterminée côté client)
      email: {
        service: this.config.email.service,
        capture: this.config.email.capture
      },
      // Configuration Notifications (déterminée côté client)
      notifications: {
        vapidKey: this.config.notifications.vapidKey
      },
      // Configuration Firebase (variables d'environnement)
      firebase: {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Non défini',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Non défini',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Non défini'
      },
      // Variables d'environnement disponibles
      envVars: {
        NODE_ENV: import.meta.env.NODE_ENV || 'Non défini',
        VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Non défini',
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || 'Non défini',
        VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Non défini',
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Non défini',
        VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Non défini',
        VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'Non défini',
        VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || 'Non défini',
        VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'Non défini',
        // Variables Vite natives
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        BASE_URL: import.meta.env.BASE_URL || 'Non défini',
        VITE_VERSION: import.meta.env.VITE_VERSION || 'Non défini',
        // Variables système du navigateur
        'navigator.userAgent': navigator.userAgent,
        'navigator.platform': navigator.platform,
        'navigator.language': navigator.language,
        'window.location.href': window.location.href,
        'window.location.hostname': window.location.hostname,
        'window.location.port': window.location.port || 'Non défini',
        'window.location.protocol': window.location.protocol
      },
      // Informations de build
      build: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
  }
}

// Instance singleton
const configService = new ConfigService();

export default configService;
