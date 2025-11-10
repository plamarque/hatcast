/**
 * Fonctions HTTP pour la gestion des rôles HatCast
 * Gère les rôles Super Admin et Admin de saison
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const RoleService = require('./roleService');
const { superAdminEmailsSecret } = require('./roleService');
const { cors } = require('./corsConfig');

const roleService = new RoleService();

/**
 * Middleware d'authentification
 */
async function authenticateRequest(req, res, callback) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken;
    await callback();
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Token d\'authentification invalide' });
  }
}

/**
 * Vérifier le statut Super Admin d'un utilisateur
 */
exports.checkSuperAdminStatus = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onCall(async (data, context) => {
    try {
      // Vérifier l'authentification
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentification requise');
      }
      
      const user = context.auth;
      const isSuperAdmin = roleService.isSuperAdmin(user.token.email);
      
      return {
        isSuperAdmin,
        email: user.token.email,
        uid: user.uid,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur dans checkSuperAdminStatus:', error);
      throw new functions.https.HttpsError('internal', 'Erreur lors de la vérification du statut Super Admin');
    }
  });

/**
 * Vérifier le statut Admin de saison d'un utilisateur
 */
exports.checkSeasonAdminStatus = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId } = req.body;
        
        if (!seasonId) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId requis'
          });
        }
        
        // Vérifier si Super Admin (accès à tout)
        const isSuperAdmin = roleService.isSuperAdmin(user.email);
        if (isSuperAdmin) {
          return res.json({
            isSeasonAdmin: true,
            isSuperAdmin: true,
            email: user.email,
            uid: user.uid,
            seasonId,
            timestamp: new Date().toISOString()
          });
        }
        
        // Vérifier si Admin de saison
        const isSeasonAdmin = await roleService.isSeasonAdmin(seasonId, user.email);
        
        res.json({
          isSeasonAdmin,
          isSuperAdmin: false,
          email: user.email,
          uid: user.uid,
          seasonId,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans checkSeasonAdminStatus:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification du statut Admin de saison'
      });
    }
  });
});

/**
 * Accorder le rôle Admin de saison à un utilisateur (Super Admin ou Admin de saison)
 */
exports.grantSeasonAdmin = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId, userEmail } = req.body;
        
        if (!seasonId || !userEmail) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId et userEmail requis'
          });
        }
        
        // Vérifier que l'utilisateur est Super Admin ou Admin de saison
        await roleService.requireSeasonAdmin(seasonId, req, res, async () => {
          // Accorder le rôle
          await roleService.grantSeasonAdmin(seasonId, userEmail, user.email);
          
          res.json({
            success: true,
            message: `Rôle Admin accordé à ${userEmail} pour la saison ${seasonId}`,
            grantedBy: user.email,
            timestamp: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans grantSeasonAdmin:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de l\'octroi du rôle Admin de saison'
      });
    }
  });
});

/**
 * Révoquer le rôle Admin de saison d'un utilisateur (Super Admin ou Admin de saison)
 */
exports.revokeSeasonAdmin = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId, userEmail } = req.body;
        
        if (!seasonId || !userEmail) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId et userEmail requis'
          });
        }
        
        // Vérifier que l'utilisateur est Super Admin ou Admin de saison
        await roleService.requireSeasonAdmin(seasonId, req, res, async () => {
          // Révoquer le rôle
          await roleService.revokeSeasonAdmin(seasonId, userEmail, user.email);
          
          res.json({
            success: true,
            message: `Rôle Admin révoqué à ${userEmail} pour la saison ${seasonId}`,
            revokedBy: user.email,
            timestamp: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans revokeSeasonAdmin:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la révocation du rôle Admin de saison'
      });
    }
  });
});

/**
 * Lister les admins d'une saison (Super Admin ou Admin de saison)
 */
exports.listSeasonAdmins = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId } = req.body;
        
        if (!seasonId) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId requis'
          });
        }
        
        // Vérifier que l'utilisateur est Super Admin ou Admin de saison
        await roleService.requireSeasonAdmin(seasonId, req, res, async () => {
          // Lister les admins
          const admins = await roleService.listSeasonAdmins(seasonId);
          
          res.json({
            seasonId,
            admins,
            totalCount: admins.length,
            requestedBy: user.email,
            timestamp: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans listSeasonAdmins:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors du listage des admins de saison'
      });
    }
  });
});

/**
 * Accorder le rôle Caster (sélectionneur) de saison à un utilisateur (Super Admin ou Admin de saison)
 */
exports.grantSeasonCaster = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId, userEmail } = req.body;
        
        if (!seasonId || !userEmail) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId et userEmail requis'
          });
        }
        
        // Vérifier que l'utilisateur est Super Admin ou Admin de saison
        await roleService.requireSeasonAdmin(seasonId, req, res, async () => {
          // Accorder le rôle
          await roleService.grantSeasonCaster(seasonId, userEmail, user.email);
          
          res.json({
            success: true,
            message: `Rôle Caster accordé à ${userEmail} pour la saison ${seasonId}`,
            grantedBy: user.email,
            timestamp: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans grantSeasonCaster:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de l\'octroi du rôle Caster de saison'
      });
    }
  });
});

/**
 * Révoquer le rôle Caster (sélectionneur) de saison d'un utilisateur (Super Admin ou Admin de saison)
 */
exports.revokeSeasonCaster = functions
  .runWith({ secrets: [superAdminEmailsSecret] })
  .https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId, userEmail } = req.body;
        
        if (!seasonId || !userEmail) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId et userEmail requis'
          });
        }
        
        // Vérifier que l'utilisateur est Super Admin ou Admin de saison
        await roleService.requireSeasonAdmin(seasonId, req, res, async () => {
          // Révoquer le rôle
          await roleService.revokeSeasonCaster(seasonId, userEmail, user.email);
          
          res.json({
            success: true,
            message: `Rôle Caster révoqué à ${userEmail} pour la saison ${seasonId}`,
            revokedBy: user.email,
            timestamp: new Date().toISOString()
          });
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans revokeSeasonCaster:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la révocation du rôle Caster de saison'
      });
    }
  });
});
