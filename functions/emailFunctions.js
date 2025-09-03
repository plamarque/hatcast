const functions = require('firebase-functions');
const admin = require('firebase-admin');
const EmailService = require('./emailService');

/**
 * Configuration CORS intelligente basée sur l'environnement
 * Détecte automatiquement l'environnement et configure CORS en conséquence
 */
function getAllowedOrigins() {
  // Détecter l'environnement depuis la configuration Firebase
  const environment = functions.config().env?.firebase_env || process.env.NODE_ENV || 'development';
  
  console.log(`🌍 Configuration CORS pour l'environnement: ${environment}`);
  
  // Charger les URLs depuis la configuration Firebase
  try {
    const config = functions.config();
    
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

/**
 * Fonctions HTTP Firebase pour l'envoi d'emails
 * Toutes les fonctions sont sécurisées et nécessitent une authentification
 */

// Instance du service d'emails
const emailService = new EmailService();

/**
 * Middleware d'authentification Firebase
 */
async function authenticateRequest(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token d\'authentification manquant');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
  } catch (error) {
    throw new Error(`Authentification échouée: ${error.message}`);
  }
}

/**
 * Envoi d'email générique
 * POST /api/sendEmail
 */
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Méthode non autorisée' });
        return;
      }

      // Authentifier la requête
      const user = await authenticateRequest(req);
      
      // Vérifier que l'utilisateur est connecté
      if (!user.uid) {
        res.status(401).json({ error: 'Utilisateur non authentifié' });
        return;
      }

      // Récupérer les données de l'email
      const { to, subject, html, text, environment = 'production' } = req.body;

      // Validation des données
      if (!to || !subject || (!html && !text)) {
        res.status(400).json({ 
          error: 'Données manquantes: to, subject, et html ou text sont requis' 
        });
        return;
      }

      // Détecter automatiquement l'environnement pour les emails
      let emailEnvironment = environment;
      if (environment === 'development' || process.env.NODE_ENV === 'development') {
        emailEnvironment = 'development';
        console.log('🔧 Mode développement détecté, utilisation d\'Ethereal pour l\'email');
      }
      
      // Envoyer l'email
      const result = await emailService.sendEmail({
        to,
        subject,
        html,
        text,
        from: user.email
      }, emailEnvironment);

      res.json({
        success: true,
        messageId: result.messageId,
        environment: result.environment
      });

    } catch (error) {
      console.error('Erreur dans sendEmail:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: error.message 
      });
    }
  });
});

/**
 * Envoi de notification de sélection
 * POST /api/sendSelectionNotification
 */
exports.sendSelectionNotification = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Méthode non autorisée' });
        return;
      }

      // Authentifier la requête
      const user = await authenticateRequest(req);
      
      // Récupérer les données
      const { playerData, eventData, environment = 'production' } = req.body;

      // Validation des données
      if (!playerData || !eventData || !playerData.email || !eventData.title) {
        res.status(400).json({ 
          error: 'Données manquantes: playerData et eventData sont requis' 
        });
        return;
      }

      // Détecter automatiquement l'environnement pour les emails
      let emailEnvironment = environment;
      if (environment === 'development' || process.env.NODE_ENV === 'development') {
        emailEnvironment = 'development';
        console.log('🔧 Mode développement détecté, utilisation d\'Ethereal pour l\'email');
      }
      
      // Envoyer la notification
      const result = await emailService.sendSelectionNotification(
        playerData, 
        eventData, 
        emailEnvironment
      );

      res.json({
        success: true,
        messageId: result.messageId,
        environment: result.environment
      });

    } catch (error) {
      console.error('Erreur dans sendSelectionNotification:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: error.message 
      });
    }
  });
});

/**
 * Envoi de notification de disponibilité
 * POST /api/sendAvailabilityNotification
 */
exports.sendAvailabilityNotification = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Méthode non autorisée' });
        return;
      }

      // Authentifier la requête
      const user = await authenticateRequest(req);
      
      // Récupérer les données
      const { playerData, eventData, environment = 'production' } = req.body;

      // Validation des données
      if (!playerData || !eventData || !playerData.email || !eventData.title) {
        res.status(400).json({ 
          error: 'Données manquantes: playerData et eventData sont requis' 
        });
        return;
      }

      // Détecter automatiquement l'environnement pour les emails
      let emailEnvironment = environment;
      if (environment === 'development' || process.env.NODE_ENV === 'development') {
        emailEnvironment = 'development';
        console.log('🔧 Mode développement détecté, utilisation d\'Ethereal pour l\'email');
      }
      
      // Envoyer la notification
      const result = await emailService.sendAvailabilityNotification(
        playerData, 
        eventData, 
        emailEnvironment
      );

      res.json({
        success: true,
        messageId: result.messageId,
        environment: result.environment
      });

    } catch (error) {
      console.error('Erreur dans sendAvailabilityNotification:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: error.message 
      });
    }
  });
});

/**
 * Envoi d'email de réinitialisation de mot de passe
 * POST /api/sendPasswordResetEmail
 */
exports.sendPasswordResetEmail = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Méthode non autorisée' });
        return;
      }

      // Authentifier la requête
      const user = await authenticateRequest(req);
      
      // Récupérer les données
      const { playerData, resetLink, environment = 'production' } = req.body;

      // Validation des données
      if (!playerData || !resetLink || !playerData.email) {
        res.status(400).json({ 
          error: 'Données manquantes: playerData et resetLink sont requis' 
        });
        return;
      }

      // Détecter automatiquement l'environnement pour les emails
      let emailEnvironment = environment;
      if (environment === 'development' || process.env.NODE_ENV === 'development') {
        emailEnvironment = 'development';
        console.log('🔧 Mode développement détecté, utilisation d\'Ethereal pour l\'email');
      }
      
      // Envoyer l'email de réinitialisation
      const result = await emailService.sendPasswordResetEmail(
        playerData, 
        resetLink, 
        emailEnvironment
      );

      res.json({
        success: true,
        messageId: result.messageId,
        environment: result.environment
      });

    } catch (error) {
      console.error('Erreur dans sendPasswordResetEmail:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: error.message 
      });
    }
  });
});

/**
 * Test de la configuration email
 * GET /api/testEmail
 */
exports.testEmail = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Méthode non autorisée' });
        return;
      }

      // Récupérer l'environnement depuis les query params
      const environment = req.query.environment || 'production';
      
      // En développement, permettre les tests sans authentification
      let user = null;
      if (environment === 'development') {
        console.log('🔧 Mode développement: authentification optionnelle');
        try {
          user = await authenticateRequest(req);
          console.log('✅ Utilisateur authentifié en développement:', user.email);
        } catch (authError) {
          console.log('⚠️ Pas d\'authentification en développement, utilisation d\'un utilisateur de test');
          user = {
            uid: 'dev-test-user',
            email: 'dev@test.local',
            emailVerified: true
          };
        }
      } else {
        // En production/staging, authentification obligatoire
        user = await authenticateRequest(req);
      }
      
      // En développement, faire un test de configuration sans envoyer d'email
      if (environment === 'development') {
        console.log('🔧 Mode développement: test de configuration uniquement');
        
        try {
          // Récupérer les credentials depuis les headers ou query params
          let customCredentials = null;
          const etherealUser = req.headers['ethereal-user'] || req.headers['x-ethereal-user'] || req.query.ethereal_user;
          const etherealPass = req.headers['ethereal-pass'] || req.headers['x-ethereal-pass'] || req.query.ethereal_pass;
          
          if (etherealUser && etherealPass) {
            console.log('✅ Credentials Ethereal reçus depuis le client');
            customCredentials = {
              ethereal: {
                user: etherealUser,
                pass: etherealPass
              }
            };
          }
          
          // Tester la création du transporteur
          const transporter = await emailService.createTransporter(environment, customCredentials);
          console.log('✅ Transporteur créé avec succès');
          
          // Vérifier la configuration
          const config = functions.config();
          const hasEtherealConfig = config.ethereal?.smtp_user || process.env.ETHEREAL_SMTP_USER;
          const hasEtherealSecret = await emailService.getSecret('ETHEREAL_SMTP_USER');
          
          // Tester la vérification du transporteur
          let transporterStatus = '❌ Erreur de création';
          try {
            if (transporter.verify) {
              await transporter.verify();
              transporterStatus = '✅ Créé et vérifié';
            } else {
              transporterStatus = '✅ Créé avec succès';
            }
          } catch (verifyError) {
            console.log('⚠️ Erreur de vérification du transporteur:', verifyError.message);
            transporterStatus = '⚠️ Créé mais non vérifié';
          }
          
          // ENVOYER UN VRAI EMAIL DE TEST EN DÉVELOPPEMENT
          let emailResult = null;
          if (customCredentials && customCredentials.ethereal) {
            console.log('📧 Envoi d\'un email de test réel avec Ethereal...');
            
            const testEmail = {
              from: customCredentials.ethereal.user,
              to: 'test@example.com', // Envoi vers une adresse externe (capturée par Ethereal)
              subject: '🧪 Test Email Service - Hatcast Development',
              text: `Test du service email en développement
              
Timestamp: ${new Date().toISOString()}
Environment: ${environment}
User: ${user.email}
Service: Ethereal Email

Cet email confirme que le service email fonctionne correctement.`,
              html: `
                <h2>🧪 Test Email Service - Hatcast Development</h2>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Environment:</strong> ${environment}</p>
                <p><strong>User:</strong> ${user.email}</p>
                <p><strong>Service:</strong> Ethereal Email</p>
                <hr>
                <p>Cet email confirme que le service email fonctionne correctement.</p>
              `
            };
            
            try {
              emailResult = await transporter.sendMail(testEmail);
              console.log('✅ Email de test envoyé avec succès:', emailResult.messageId);
            } catch (sendError) {
              console.log('⚠️ Erreur lors de l\'envoi de l\'email de test:', sendError.message);
              emailResult = { error: sendError.message };
            }
          }
          
          res.json({
            success: true,
            message: emailResult && !emailResult.error 
              ? 'Email de test envoyé avec succès en développement'
              : 'Configuration email testée en développement',
            environment: environment,
            user: user.email,
            config: {
              transporter: transporterStatus,
              ethereal_secret: hasEtherealSecret ? '✅ Configuré' : '❌ Non configuré',
              ethereal_config: hasEtherealConfig ? '✅ Configuré' : '❌ Non configuré',
              ethereal_client: customCredentials ? '✅ Fourni par le client' : '❌ Non fourni',
              mode: emailResult && !emailResult.error ? 'development_send' : 'development_test',
              messageId: emailResult && !emailResult.error ? emailResult.messageId : null,
              previewUrl: emailResult && !emailResult.error ? `https://ethereal.email/message/${emailResult.messageId}` : null
            },
            note: emailResult && !emailResult.error
              ? 'Email de test envoyé et visible sur Ethereal'
              : customCredentials 
                ? 'En développement avec Ethereal configuré via le client - emails capturés pour test'
                : hasEtherealSecret 
                  ? 'En développement avec Ethereal configuré via Firebase - emails capturés pour test'
                  : 'En développement sans Ethereal - configuration testée uniquement'
          });
          return;
        } catch (configError) {
          console.log('⚠️ Erreur de configuration en développement:', configError.message);
          
          res.json({
            success: false,
            message: 'Configuration email incomplète en développement',
            environment: environment,
            user: user.email,
            error: configError.message,
            config: {
              transporter: '❌ Erreur de création',
              ethereal_secret: '❌ Non configuré',
              ethereal_config: '❌ Non configuré',
              ethereal_client: '❌ Non fourni',
              mode: 'development_test_failed'
            },
            note: 'Configurez ETHEREAL_SMTP_USER et ETHEREAL_SMTP_PASS dans Firebase Secrets ou .env.local pour tester l\'envoi d\'emails',
            suggestion: 'firebase functions:config:set ethereal.smtp_user="votre_email@ethereal.email" ethereal.smtp_pass="votre_mot_de_passe"'
          });
          return;
        }
      }

      // Envoyer un email de test
      const result = await emailService.sendEmail({
        to: user.email,
        subject: '🧪 Test Email HatCast',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🧪 Test Email HatCast</h2>
            <p>Bonjour ${user.email},</p>
            <p>Cet email est un test de la configuration email de HatCast.</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0; color: #1F2937;">Configuration Test</h3>
              <p style="margin: 10px 0; color: #6B7280;">🌍 Environnement: ${environment}</p>
              <p style="margin: 10px 0; color: #6B7280;">⏰ Timestamp: ${new Date().toISOString()}</p>
            </div>
            <p>Si vous recevez cet email, la configuration est correcte ! ✅</p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Ce message est envoyé automatiquement par HatCast
            </p>
          </div>
        `
      }, environment);

      res.json({
        success: true,
        message: 'Email de test envoyé avec succès',
        messageId: result.messageId,
        environment: result.environment,
        user: user.email
      });

    } catch (error) {
      console.error('Erreur dans testEmail:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: error.message 
      });
    }
  });
});
