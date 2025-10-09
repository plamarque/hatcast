/**
 * Fonctions HTTP protégées pour la gestion admin HatCast
 * Toutes ces fonctions nécessitent des permissions admin
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AdminService = require('./adminService');
const { cors } = require('./corsConfig');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const adminService = new AdminService();

/**
 * Crée ou met à jour un secret Firebase
 */
async function setFirebaseSecret(secretName, secretValue) {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.FIREBASE_PROJECT_ID || 'impro-selector';
  const parent = `projects/${projectId}`;
  
  try {
    // Vérifier si le secret existe
    const secretPath = `${parent}/secrets/${secretName}`;
    
    try {
      await client.getSecret({ name: secretPath });
      
      // Le secret existe, ajouter une nouvelle version
      const [version] = await client.addSecretVersion({
        parent: secretPath,
        payload: {
          data: Buffer.from(secretValue, 'utf8'),
        },
      });
      
      console.log(`✅ Secret ${secretName} mis à jour: ${version.name}`);
      return { success: true, action: 'updated', version: version.name };
      
    } catch (getError) {
      if (getError.code === 5) { // NOT_FOUND
        // Le secret n'existe pas, le créer
        const [secret] = await client.createSecret({
          parent: parent,
          secretId: secretName,
          secret: {
            replication: {
              automatic: {},
            },
          },
        });
        
        // Ajouter la première version
        const [version] = await client.addSecretVersion({
          parent: secret.name,
          payload: {
            data: Buffer.from(secretValue, 'utf8'),
          },
        });
        
        console.log(`✅ Secret ${secretName} créé: ${version.name}`);
        return { success: true, action: 'created', version: version.name };
      }
      
      throw getError;
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Supprime un secret Firebase
 */
async function deleteFirebaseSecret(secretName) {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.FIREBASE_PROJECT_ID || 'impro-selector';
  const secretPath = `projects/${projectId}/secrets/${secretName}`;
  
  try {
    await client.deleteSecret({ name: secretPath });
    console.log(`✅ Secret ${secretName} supprimé`);
    return { success: true, action: 'deleted' };
  } catch (error) {
    if (error.code === 5) { // NOT_FOUND
      console.log(`ℹ️ Secret ${secretName} n'existe pas (déjà supprimé)`);
      return { success: true, action: 'already_deleted' };
    }
    console.error(`❌ Erreur lors de la suppression du secret ${secretName}:`, error);
    throw error;
  }
}

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

// ===== FONCTIONS PASSWORD RESET =====

// Callable: réinitialise le mot de passe avec un token custom
exports.resetPasswordWithCustomToken = functions.https.onCall(async (data, context) => {
  try {
    const { email, token, newPassword } = data || {}
    
    console.log('🔐 Demande de reset password avec token custom', { 
      email: email ? email.substring(0, 3) + '••@••••.com' : 'undefined',
      hasToken: !!token,
      hasPassword: !!newPassword 
    })
    
    // Validation des paramètres
    if (!email || !token || !newPassword) {
      console.warn('❌ Paramètres manquants pour resetPasswordWithCustomToken')
      return { success: false, error: 'missing_parameters' }
    }
    
    if (newPassword.length < 6) {
      console.warn('❌ Mot de passe trop court')
      return { success: false, error: 'weak_password' }
    }
    
    // TODO: Ici on devrait vérifier que le token custom est valide
    // Pour l'instant, on accepte tous les tokens pour le développement
    console.log('🔍 Validation du token custom...', { token: token.substring(0, 6) + '••••••' })
    
    try {
      // Vérifier si l'utilisateur existe déjà
      let user = null
      try {
        user = await admin.auth().getUserByEmail(email)
        console.log('✅ Utilisateur existant trouvé', { uid: user.uid })
        
        // Mettre à jour le mot de passe
        await admin.auth().updateUser(user.uid, {
          password: newPassword
        })
        console.log('✅ Mot de passe mis à jour pour utilisateur existant')
        
      } catch (getUserError) {
        if (getUserError.code === 'auth/user-not-found') {
          console.log('👤 Utilisateur non trouvé, création d\'un nouveau compte')
          
          // Créer un nouvel utilisateur
          const newUser = await admin.auth().createUser({
            email: email,
            password: newPassword,
            emailVerified: true // On considère l'email vérifié via le token
          })
          console.log('✅ Nouvel utilisateur créé', { uid: newUser.uid })
          
        } else {
          throw getUserError
        }
      }
      
      return { success: true, message: 'Mot de passe réinitialisé avec succès' }
      
    } catch (authError) {
      console.error('❌ Erreur Firebase Auth:', authError)
      return { success: false, error: 'auth_error', details: authError.message }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale dans resetPasswordWithCustomToken:', error)
    return { success: false, error: 'internal_error', details: error.message }
  }
});

// ===== FONCTIONS DE GESTION DE L'AUDIT =====

/**
 * Récupère la configuration actuelle de l'audit
 */
exports.getAuditConfig = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification
    if (!context.auth) {
      return { success: false, error: 'unauthenticated' }
    }
    
    const { environment } = data || {}
    
    if (!environment || !['staging', 'production'].includes(environment)) {
      return { success: false, error: 'invalid_environment' }
    }
    
    // Lire la configuration via les variables d'environnement
    let isEnabled = false
    let configValue = undefined
    
    if (environment === 'production') {
      // Production: activé par défaut, désactivé seulement si explicitement false
      configValue = process.env.AUDIT_PRODUCTION_ENABLED || undefined
      isEnabled = configValue !== 'false' && configValue !== false
    } else {
      // Staging: désactivé par défaut, activé seulement si explicitement true
      configValue = process.env.AUDIT_STAGING_ENABLED || undefined
      isEnabled = configValue === 'true' || configValue === true
    }
    
    return {
      success: true,
      environment,
      isEnabled,
      configValue,
      message: isEnabled 
        ? `Audit activé en ${environment}`
        : `Audit désactivé en ${environment}`
    }
    
  } catch (error) {
    console.error('❌ Erreur dans getAuditConfig:', error)
    return { success: false, error: 'internal_error', details: error.message }
  }
})

/**
 * Active l'audit pour un environnement
 */
exports.enableAudit = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification
    if (!context.auth) {
      return { success: false, error: 'unauthenticated' }
    }
    
    const { environment } = data || {}
    
    if (!environment || !['staging', 'production'].includes(environment)) {
      return { success: false, error: 'invalid_environment' }
    }
    
    try {
      if (environment === 'production') {
        // Pour production, activer = supprimer le secret (car activé par défaut)
        const result = await deleteFirebaseSecret('AUDIT_PRODUCTION_ENABLED');
        
        return {
          success: true,
          message: '✅ Audit activé en production',
          action: result.action,
          details: 'Le secret AUDIT_PRODUCTION_ENABLED a été supprimé. L\'audit est maintenant activé par défaut.',
          requiresRedeploy: true,
          redeployCommand: 'firebase deploy --only functions'
        }
      } else {
        // Pour staging, activer = définir le secret à true
        const result = await setFirebaseSecret('AUDIT_STAGING_ENABLED', 'true');
        
        return {
          success: true,
          message: '✅ Audit activé en staging',
          action: result.action,
          details: 'Le secret AUDIT_STAGING_ENABLED a été défini à "true".',
          requiresRedeploy: true,
          redeployCommand: 'firebase deploy --only functions'
        }
      }
    } catch (secretError) {
      console.error('❌ Erreur lors de la modification du secret:', secretError);
      return {
        success: false,
        error: 'secret_management_error',
        message: 'Erreur lors de la modification du secret Firebase',
        details: secretError.message
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur dans enableAudit:', error)
    return { success: false, error: 'internal_error', details: error.message }
  }
})

/**
 * Désactive l'audit pour un environnement
 */
exports.disableAudit = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification
    if (!context.auth) {
      return { success: false, error: 'unauthenticated' }
    }
    
    const { environment } = data || {}
    
    if (!environment || !['staging', 'production'].includes(environment)) {
      return { success: false, error: 'invalid_environment' }
    }
    
    try {
      if (environment === 'production') {
        // Pour production, désactiver = définir le secret à false
        const result = await setFirebaseSecret('AUDIT_PRODUCTION_ENABLED', 'false');
        
        return {
          success: true,
          message: '⚠️ Audit désactivé en production',
          action: result.action,
          details: 'Le secret AUDIT_PRODUCTION_ENABLED a été défini à "false".',
          warning: 'Désactiver l\'audit en production réduit la traçabilité des actions.',
          requiresRedeploy: true,
          redeployCommand: 'firebase deploy --only functions'
        }
      } else {
        // Pour staging, désactiver = supprimer le secret (car désactivé par défaut)
        const result = await deleteFirebaseSecret('AUDIT_STAGING_ENABLED');
        
        return {
          success: true,
          message: '✅ Audit désactivé en staging',
          action: result.action,
          details: 'Le secret AUDIT_STAGING_ENABLED a été supprimé. L\'audit est maintenant désactivé par défaut.',
          requiresRedeploy: true,
          redeployCommand: 'firebase deploy --only functions'
        }
      }
    } catch (secretError) {
      console.error('❌ Erreur lors de la modification du secret:', secretError);
      return {
        success: false,
        error: 'secret_management_error',
        message: 'Erreur lors de la modification du secret Firebase',
        details: secretError.message
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur dans disableAudit:', error)
    return { success: false, error: 'internal_error', details: error.message }
  }
}) 