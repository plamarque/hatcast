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

      // Envoyer l'email
      const result = await emailService.sendEmail({
        to,
        subject,
        html,
        text,
        from: user.email
      }, environment);

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

      // Envoyer la notification
      const result = await emailService.sendSelectionNotification(
        playerData, 
        eventData, 
        environment
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

      // Envoyer la notification
      const result = await emailService.sendAvailabilityNotification(
        playerData, 
        eventData, 
        environment
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

      // Envoyer l'email de réinitialisation
      const result = await emailService.sendPasswordResetEmail(
        playerData, 
        resetLink, 
        environment
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

      // Authentifier la requête
      const user = await authenticateRequest(req);
      
      // Récupérer l'environnement depuis les query params
      const environment = req.query.environment || 'production';
      
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
