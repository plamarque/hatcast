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

    logger.info('🔧 Initialisation de la configuration avec logique de priorité intelligente...');
    
    // 1. Configuration de base par environnement
    const baseConfig = this.getBaseConfig();
    
    // 2. Configuration Firebase avec priorité intelligente
    const firebaseConfig = await this.loadFirebaseConfig();
    
    // 3. Configuration des sessions avec priorité intelligente
    const sessionConfig = await this.loadSessionConfig();
    
    // 4. Fusion des configurations (sans les secrets pour l'instant)
    this.config = {
      ...baseConfig,
      firebase: firebaseConfig,
      sessions: sessionConfig,
      secrets: {} // Initialement vide, sera chargé plus tard
    };
    
    this.isInitialized = true;
    
    // 5. Log de la traçabilité
    this.logConfigSources();
    
    return this.config;
  }

  /**
   * Charge les secrets Firebase de manière différée (après initialisation Firebase)
   */
  async loadSecretsDelayed() {
    if (this.configSources.secrets) {
      return this.config.secrets; // Déjà chargé
    }

    logger.info('🔐 Chargement différé des secrets Firebase...');
    
    try {
      const secrets = await this.loadSecretsConfig();
      this.config.secrets = secrets;
      return secrets;
    } catch (error) {
      logger.warn('⚠️ Erreur lors du chargement différé des secrets:', error);
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
          url: 'https://selections.la-malice.fr'
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
    logger.info(`🔍 Chargement de la configuration Firebase pour l'environnement: ${env}`);

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
          logger.warn('⚠️ Impossible de récupérer la config depuis Firebase, utilisation des valeurs par défaut');
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
   * Charge la configuration des sessions avec logique de priorité intelligente
   */
  async loadSessionConfig() {
    const env = this.environment;
    logger.info(`🔍 Chargement de la configuration des sessions pour l'environnement: ${env}`);

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
          logger.warn('⚠️ Impossible de récupérer la config des sessions depuis Firebase, utilisation des valeurs par défaut');
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
      // Tentative de récupération depuis adminService
      const adminService = await import('./adminService.js');
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
        logger.warn('⚠️ Aucun secret Firebase trouvé');
        this.configSources.secrets = {};
        return {};
      }
    } catch (error) {
      logger.warn('⚠️ Erreur lors de la récupération des secrets Firebase:', error);
      this.configSources.secrets = {};
      return {};
    }
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
        logger.warn('⚠️ Pas de token d\'authentification, impossible de récupérer la config Firebase');
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
   * Retourne les credentials Ethereal Email depuis les variables d'environnement
   * Priorité: .env.local > Firebase Secrets > Valeurs par défaut
   */
  getEtherealCredentials() {
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
    
    // Priorité 3: Valeurs par défaut (pour le développement)
    logger.warn('⚠️ Aucun credential Ethereal configuré, utilisation des valeurs par défaut');
    return {
      user: 'dev@ethereal.email',
      pass: 'dev_password',
      source: 'default'
    };
  }

  /**
   * Vérifie si les credentials Ethereal sont configurés
   */
  isEtherealConfigured() {
    const credentials = this.getEtherealCredentials();
    return credentials.source !== 'default' && credentials.user && credentials.pass;
  }

  /**
   * Retourne la source des credentials Ethereal
   */
  getEtherealCredentialsSource() {
    const credentials = this.getEtherealCredentials();
    return credentials.source;
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
   * Dump toutes les variables d'environnement et la configuration
   * Utile pour le debug et la vérification des configs
   */
  async dumpEnvironmentInfo() {
    const envInfo = {
      // Informations de base
      currentUrl: window.location.href,
      hostname: window.location.hostname,
      environment: this.environment,
      
      // Configuration détectée
      config: this.config,
      
      // Variables d'environnement disponibles (valeurs réelles pour admins)
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
        'window.location.protocol': window.location.protocol,
        // Variables d'environnement système (si disponibles)
        'process.env.NODE_ENV': typeof process !== 'undefined' ? process.env?.NODE_ENV : 'Non disponible côté client',
        'process.env.PLATFORM': typeof process !== 'undefined' ? process.env?.PLATFORM : 'Non disponible côté client',
        'process.env.ARCH': typeof process !== 'undefined' ? process.env?.ARCH : 'Non disponible côté client',
      },
      
      // Informations Firebase
      firebase: {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Non défini',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Non défini',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Non défini',
      },
      
      // Informations de build
      build: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      }
    };

    // Récupérer les secrets Firebase si l'utilisateur est admin
    try {
      const adminService = await import('./adminService.js');
      const isAdmin = await adminService.default.checkAdminStatus();
      
      if (isAdmin) {
        logger.info('🔐 Utilisateur admin détecté, récupération des secrets Firebase...');
        
        // Récupérer la configuration Firebase Functions
        const response = await fetch('https://us-central1-impro-selector.cloudfunctions.net/dumpEnvironment', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await this.getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const firebaseConfig = await response.json();
          logger.info('🔐 Réponse complète Firebase:', firebaseConfig);
          envInfo.firebaseSecrets = firebaseConfig.data;
          logger.info('🔐 Secrets Firebase récupérés:', firebaseConfig.data);
          logger.info('🔐 firebaseSecrets dans envInfo:', envInfo.firebaseSecrets);
        } else {
                      logger.warn('⚠️ Impossible de récupérer les secrets Firebase:', response.status);
          envInfo.firebaseSecrets = { error: 'Accès refusé ou erreur serveur' };
        }
      } else {
        envInfo.firebaseSecrets = { message: 'Accès réservé aux administrateurs' };
      }
    } catch (error) {
      logger.warn('⚠️ Erreur lors de la récupération des secrets Firebase:', error);
      envInfo.firebaseSecrets = { error: error.message };
    }

    logger.info('🔍 DEBUG - Informations d\'environnement HatCast:', envInfo);
    return envInfo;
  }

  /**
   * Retourne un résumé formaté pour l'affichage
   */
  async getEnvironmentSummary() {
    const info = await this.dumpEnvironmentInfo();
    
    return {
      environment: info.environment,
      url: info.currentUrl,
      // Configuration Firestore (déterminée côté client)
      firestore: {
        database: info.config.firestore.database,
        region: info.config.firestore.region
      },
      // Configuration Storage (déterminée côté client)
      storage: {
        bucket: info.config.storage.bucket,
        prefix: info.config.storage.prefix
      },
      // Configuration Email (déterminée côté client)
      email: {
        service: info.config.email.service,
        capture: info.config.email.capture
      },
      // Configuration Notifications (déterminée côté client)
      notifications: {
        vapidKey: info.config.notifications.vapidKey
      },
      // Configuration Firebase (variables d'environnement)
      firebase: {
        projectId: info.firebase.projectId,
        authDomain: info.firebase.authDomain
      },
      // Secrets Firebase (récupérés côté serveur)
      firebaseSecrets: info.firebaseSecrets
    };
  }
}

// Instance singleton
const configService = new ConfigService();

export default configService;
