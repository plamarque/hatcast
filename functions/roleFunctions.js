/**
 * Fonctions HTTP pour la gestion des rôles HatCast
 * Gère les rôles Super Admin et Admin de saison
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const RoleService = require('./roleService');
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
exports.checkSuperAdminStatus = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const isSuperAdmin = roleService.isSuperAdmin(user.email);
        
        res.json({
          isSuperAdmin,
          email: user.email,
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('❌ Erreur dans checkSuperAdminStatus:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification du statut Super Admin'
      });
    }
  });
});

/**
 * Vérifier le statut Admin de saison d'un utilisateur
 */
exports.checkSeasonAdminStatus = functions.https.onRequest(async (req, res) => {
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
 * Accorder le rôle Admin de saison à un utilisateur (Super Admin uniquement)
 */
exports.grantSeasonAdmin = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId, userEmail } = req.body;
        
        // Vérifier que l'utilisateur est Super Admin
        const isSuperAdmin = roleService.isSuperAdmin(user.email);
        if (!isSuperAdmin) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'Seuls les Super Admins peuvent accorder des rôles'
          });
        }
        
        if (!seasonId || !userEmail) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId et userEmail requis'
          });
        }
        
        // Accorder le rôle
        await roleService.grantSeasonAdmin(seasonId, userEmail, user.email);
        
        res.json({
          success: true,
          message: `Rôle Admin accordé à ${userEmail} pour la saison ${seasonId}`,
          grantedBy: user.email,
          timestamp: new Date().toISOString()
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
 * Révoquer le rôle Admin de saison d'un utilisateur (Super Admin uniquement)
 */
exports.revokeSeasonAdmin = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId, userEmail } = req.body;
        
        // Vérifier que l'utilisateur est Super Admin
        const isSuperAdmin = roleService.isSuperAdmin(user.email);
        if (!isSuperAdmin) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'Seuls les Super Admins peuvent révoquer des rôles'
          });
        }
        
        if (!seasonId || !userEmail) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId et userEmail requis'
          });
        }
        
        // Révoquer le rôle
        await roleService.revokeSeasonAdmin(seasonId, userEmail, user.email);
        
        res.json({
          success: true,
          message: `Rôle Admin révoqué à ${userEmail} pour la saison ${seasonId}`,
          revokedBy: user.email,
          timestamp: new Date().toISOString()
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
 * Lister les admins d'une saison (Super Admin uniquement)
 */
exports.listSeasonAdmins = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      await authenticateRequest(req, res, async () => {
        const user = req.user;
        const { seasonId } = req.body;
        
        // Vérifier que l'utilisateur est Super Admin
        const isSuperAdmin = roleService.isSuperAdmin(user.email);
        if (!isSuperAdmin) {
          return res.status(403).json({ 
            error: 'Forbidden',
            message: 'Seuls les Super Admins peuvent lister les rôles'
          });
        }
        
        if (!seasonId) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'seasonId requis'
          });
        }
        
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
    } catch (error) {
      console.error('❌ Erreur dans listSeasonAdmins:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors du listage des admins de saison'
      });
    }
  });
});
