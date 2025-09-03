/**
 * Fonctions HTTP protégées pour la gestion admin HatCast
 * Toutes ces fonctions nécessitent des permissions admin
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AdminService = require('./adminService');
// Fonction pour charger les URLs CORS depuis la configuration Firebase
function getAllowedOrigins() {
  try {
    const config = require('firebase-functions').config();
    
    // URLs de production
    const productionUrls = config.urls?.production?.split(',') || [];
    
    // URLs de staging
    const stagingUrls = config.urls?.staging?.split(',') || [];
    
    // URLs de développement
    const developmentUrls = config.urls?.development?.split(',') || [];
    
    // Combiner toutes les URLs configurées
    const configuredUrls = [...productionUrls, ...stagingUrls, ...developmentUrls];
    
    if (configuredUrls.length > 0) {
      console.log('🌍 URLs CORS chargées depuis la config Firebase:', configuredUrls);
      return configuredUrls;
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors du chargement de la config CORS:', error.message);
  }
  
  // Fallback vers des patterns génériques si pas de config
  console.log('🌍 Utilisation des patterns CORS par défaut');
  return [
    // Firebase Hosting (tous vos sites)
    'https://*.web.app',
    'https://*.firebaseapp.com',
    
    // Développement local
    'https://localhost:*',
    'http://localhost:*',
    
    // Réseau local (toutes les plages)
    'https://192.168.*.*:*',
    'http://192.168.*.*:*',
    'https://10.*.*.*:*',
    'http://10.*.*.*:*',
    'https://172.16.*.*:*',
    'http://172.16.*.*:*'
  ];
}

const cors = require('cors')({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

const adminService = new AdminService();

/**
 * Récupère TOUS les secrets Firebase depuis Google Cloud Secret Manager
 */
async function getAllFirebaseSecrets() {
  try {
    const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();
    
    // Utiliser l'ID du projet Firebase actuel, pas l'environnement de l'app
    const projectId = process.env.FIREBASE_PROJECT_ID || 'impro-selector';
    
    // 1. Lister TOUS les secrets du projet
    const parent = `projects/${projectId}`;
    const [secretsList] = await client.listSecrets({parent});
    
    console.log(`🔍 ${secretsList.length} secrets trouvés dans le projet ${projectId}`);
    
    const allSecrets = {
      total: secretsList.length,
      project: projectId,
      secrets: {},
      categories: {
        email: {},
        api: {},
        firebase: {},
        other: {}
      }
    };
    
    // 2. Récupérer les valeurs de chaque secret
    for (const secret of secretsList) {
      const secretName = secret.name.split('/').pop(); // Extraire juste le nom
      
      try {
        const name = `${secret.name}/versions/latest`;
        const [version] = await client.accessSecretVersion({name});
        const secretValue = version.payload.data.toString();
        
        // Catégoriser le secret
        let category = 'other';
        if (secretName.includes('GMAIL') || secretName.includes('ETHEREAL') || secretName.includes('SMTP')) {
          category = 'email';
        } else if (secretName.includes('API') || secretName.includes('VAPID') || secretName.includes('KEY')) {
          category = 'api';
        } else if (secretName.includes('FIREBASE') || secretName.includes('FIRESTORE')) {
          category = 'firebase';
        }
        
        // Masquer partiellement le secret pour la sécurité
        let displayValue = secretValue;
        if (secretValue.length > 8) {
          displayValue = secretValue.slice(0, 4) + '••••••••' + secretValue.slice(-4);
        } else if (secretValue.length > 0) {
          displayValue = '••••••••';
        }
        
        const secretInfo = {
          name: secretName,
          value: secretValue, // Valeur complète pour usage interne
          displayValue: displayValue, // Valeur masquée pour l'UI
          length: secretValue.length,
          category: category,
          created: secret.createTime,
          updated: secret.updateTime
        };
        
        allSecrets.secrets[secretName] = secretInfo;
        allSecrets.categories[category][secretName] = secretInfo;
        
      } catch (error) {
        console.warn(`⚠️ Impossible de récupérer le secret ${secretName}:`, error.message);
        
        const secretInfo = {
          name: secretName,
          value: null,
          displayValue: '❌ Erreur',
          error: error.message,
          category: 'other'
        };
        
        allSecrets.secrets[secretName] = secretInfo;
        allSecrets.categories.other[secretName] = secretInfo;
      }
    }
    
    return allSecrets;
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des secrets:', error);
    return { 
      error: 'Impossible de récupérer les secrets',
      details: error.message,
      total: 0,
      project: functions.config().env?.firebase_env || 'impro-selector'
    };
  }
}

/**
 * Middleware d'authentification Firebase
 */
async function authenticateRequest(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Token d\'authentification requis'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Token d\'authentification invalide'
    });
  }
}

/**
 * Vérifier le statut admin d'un utilisateur
 */
exports.checkAdminStatus = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const isAdmin = adminService.isAdmin(user.email);
        
        res.json({
          isAdmin,
          email: user.email,
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans checkAdminStatus:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification du statut admin'
      });
    }
  });
});

/**
 * Dumper les informations d'environnement (admin uniquement)
 */
exports.dumpEnvironment = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        // Vérification admin
        adminService.requireAdmin(req, res, async () => {
          try {
            // Récupérer TOUS les vrais secrets Firebase
            const firebaseSecrets = await getAllFirebaseSecrets();
            
            const environmentInfo = {
              timestamp: new Date().toISOString(),
              user: req.user,
              environment: process.env.NODE_ENV || 'production',
              firebase: {
                projectId: process.env.FIREBASE_PROJECT_ID || 'non-défini',
                region: process.env.FIREBASE_REGION || 'non-défini'
              },
              functions: {
                config: functions.config(),
                admin: adminService.checkConfig()
              },
              secrets: firebaseSecrets
            };
            
            console.log('🔍 Dump environnement demandé par admin:', req.user.email);
            
            res.json({
              success: true,
              data: environmentInfo,
              message: 'Informations d\'environnement récupérées avec succès'
            });
          } catch (error) {
            console.error('❌ Erreur lors du dump environnement:', error);
            res.status(500).json({ 
              error: 'Dump failed',
              message: 'Erreur lors de la récupération des informations'
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans dumpEnvironment:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  });
});

/**
 * Vérifier la configuration admin (admin uniquement)
 */
exports.checkAdminConfig = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        // Vérification admin
        adminService.requireAdmin(req, res, async () => {
          try {
            const config = adminService.checkConfig();
            
            console.log('🔧 Configuration admin vérifiée par:', req.user.email);
            
            res.json({
              success: true,
              data: config,
              message: 'Configuration admin récupérée avec succès'
            });
          } catch (error) {
            console.error('❌ Erreur lors de la vérification config admin:', error);
            res.status(500).json({ 
              error: 'Config check failed',
              message: 'Erreur lors de la vérification de la configuration'
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans checkAdminConfig:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  });
});

/**
 * Test de sécurité (admin uniquement)
 */
exports.testAdminAccess = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        // Vérification admin
        adminService.requireAdmin(req, res, async () => {
          try {
            console.log('🧪 Test d\'accès admin réussi pour:', req.user.email);
            
            res.json({
              success: true,
              message: 'Accès admin vérifié avec succès',
              user: {
                email: req.user.email,
                uid: req.user.uid,
                isAdmin: true
              },
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('❌ Erreur lors du test admin:', error);
            res.status(500).json({ 
              error: 'Test failed',
              message: 'Erreur lors du test d\'accès admin'
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans testAdminAccess:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  });
});

/**
 * Récupérer le niveau de log configuré (admin uniquement)
 */
exports.getLogLevel = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        // Vérification admin
        adminService.requireAdmin(req, res, async () => {
          try {
            const config = functions.config();
            const logLevel = config.logs?.level || 'info';
            
            console.log(`🔧 Niveau de log récupéré par ${req.user.email}: ${logLevel}`);
            
            res.json({
              success: true,
              level: logLevel,
              message: 'Niveau de log récupéré avec succès',
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('❌ Erreur lors de la récupération du niveau de log:', error);
            res.status(500).json({ 
              error: 'Log level retrieval failed',
              message: 'Erreur lors de la récupération du niveau de log'
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans getLogLevel:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  });
});

/**
 * Mettre à jour le niveau de log (admin uniquement)
 */
exports.setLogLevel = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        // Vérification admin
        adminService.requireAdmin(req, res, async () => {
          try {
            const { level } = req.body;
            
            if (!level || !['debug', 'info', 'warn', 'error', 'silent'].includes(level)) {
              return res.status(400).json({
                error: 'Invalid log level',
                message: 'Niveau de log invalide. Valeurs acceptées: debug, info, warn, error, silent'
              });
            }
            
            // Mettre à jour la configuration Firebase
            const config = functions.config();
            const currentConfig = config.logs || {};
            currentConfig.level = level;
            
            console.log(`🔧 Niveau de log mis à jour par ${req.user.email}: ${level}`);
            
            res.json({
              success: true,
              level: level,
              message: `Niveau de log mis à jour vers ${level}`,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du niveau de log:', error);
            res.status(500).json({ 
              error: 'Log level update failed',
              message: 'Erreur lors de la mise à jour du niveau de log'
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans setLogLevel:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  });
}); 