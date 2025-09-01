/**
 * Service de configuration unifié pour HatCast
 * Gère la détection d'environnement et la configuration des ressources Firebase
 */

class ConfigService {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getConfig();
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
   * Retourne la configuration pour l'environnement actuel
   */
  getConfig() {
    const env = this.environment;
    
    const configs = {
      development: {
        firestore: {
          database: 'development',
          region: 'europe-west3'
        },
        storage: {
          bucket: 'impro-selector.appspot.com',
          prefix: 'development/'
        },
        email: {
          service: 'ethereal',
          capture: true
        },
        hosting: {
          url: 'https://192.168.1.134:5173'
        }
      },
      staging: {
        firestore: {
          database: 'staging',
          region: 'us-central1'
        },
        storage: {
          bucket: 'impro-selector.appspot.com',
          prefix: 'staging/'
        },
        email: {
          service: 'ethereal',
          capture: true
        },
        hosting: {
          url: 'https://hatcast-staging.web.app'
        }
      },
      production: {
        firestore: {
          database: 'default',
          region: 'us-central1'
        },
        storage: {
          bucket: 'impro-selector.appspot.com',
          prefix: 'production/'
        },
        email: {
          service: 'gmail',
          capture: false
        },
        hosting: {
          url: 'https://selections.la-malice.fr'
        }
      }
    };

    return configs[env] || configs.production;
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
   * Retourne la configuration email
   */
  getEmailConfig() {
    return this.config.email;
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
      console.warn('⚠️ Erreur lors de la récupération du token:', error);
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
        console.log('🔐 Utilisateur admin détecté, récupération des secrets Firebase...');
        
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
          console.log('🔐 Réponse complète Firebase:', firebaseConfig);
          envInfo.firebaseSecrets = firebaseConfig.data;
          console.log('🔐 Secrets Firebase récupérés:', firebaseConfig.data);
          console.log('🔐 firebaseSecrets dans envInfo:', envInfo.firebaseSecrets);
        } else {
          console.warn('⚠️ Impossible de récupérer les secrets Firebase:', response.status);
          envInfo.firebaseSecrets = { error: 'Accès refusé ou erreur serveur' };
        }
      } else {
        envInfo.firebaseSecrets = { message: 'Accès réservé aux administrateurs' };
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération des secrets Firebase:', error);
      envInfo.firebaseSecrets = { error: error.message };
    }

    console.log('🔍 DEBUG - Informations d\'environnement HatCast:', envInfo);
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
