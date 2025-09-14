/**
 * Service de gestion des rôles côté Cloud Functions HatCast
 * Gère les rôles Super Admin et Admin de saison
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

class RoleService {
  constructor() {
    this.superAdminEmails = this.getSuperAdminEmails();
  }

  /**
   * Récupère la liste des Super Admins depuis Firebase Functions Config
   */
  getSuperAdminEmails() {
    try {
      const config = functions.config();
      const superAdminEmails = config.superadmin?.emails;
      
      if (!superAdminEmails) {
        console.warn('⚠️ Configuration Super Admin non trouvée, aucun Super Admin autorisé');
        return [];
      }
      
      // Séparer les emails par virgules et nettoyer
      return superAdminEmails.split(',').map(email => email.trim()).filter(email => email);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des Super Admins:', error);
      return [];
    }
  }

  /**
   * Vérifie si un utilisateur est Super Admin
   */
  isSuperAdmin(userEmail) {
    if (!userEmail) {
      return false;
    }
    
    const isSuperAdmin = this.superAdminEmails.includes(userEmail);
    console.log(`🔐 Vérification Super Admin pour ${userEmail}: ${isSuperAdmin ? '✅ OUI' : '❌ NON'}`);
    
    return isSuperAdmin;
  }

  /**
   * Vérifie si un utilisateur est Admin d'une saison spécifique
   */
  async isSeasonAdmin(seasonId, userEmail) {
    try {
      if (!seasonId || !userEmail) {
        return false;
      }
      
      console.log(`🔐 Vérification Admin de saison pour ${userEmail} dans ${seasonId}`);
      
      // Récupérer les rôles de la saison
      const seasonDoc = await admin.firestore()
        .collection('seasons')
        .doc(seasonId)
        .get();
      
      if (!seasonDoc.exists) {
        console.log(`⚠️ Saison ${seasonId} non trouvée`);
        return false;
      }
      
      const seasonData = seasonDoc.data();
      const admins = seasonData.roles?.admins || [];
      
      const isAdmin = admins.includes(userEmail);
      console.log(`🔐 ${userEmail} ${isAdmin ? 'EST' : 'N\'EST PAS'} admin de la saison ${seasonId}`);
      
      return isAdmin;
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification Admin de saison pour ${userEmail} dans ${seasonId}:`, error);
      return false;
    }
  }

  /**
   * Accorde le rôle Admin de saison à un utilisateur
   */
  async grantSeasonAdmin(seasonId, userEmail, grantedBy) {
    try {
      console.log(`🔐 Octroi du rôle Admin de saison ${seasonId} à ${userEmail} par ${grantedBy}`);
      
      // Vérifier que la saison existe
      const seasonRef = admin.firestore().collection('seasons').doc(seasonId);
      const seasonDoc = await seasonRef.get();
      
      if (!seasonDoc.exists) {
        throw new Error(`Saison ${seasonId} non trouvée`);
      }
      
      // Récupérer les rôles actuels
      const seasonData = seasonDoc.data();
      const currentRoles = seasonData.roles || { admins: [], users: [] };
      
      // Ajouter l'email s'il n'y est pas déjà
      if (!currentRoles.admins.includes(userEmail)) {
        currentRoles.admins.push(userEmail);
        
        // Mettre à jour Firestore
        await seasonRef.update({
          roles: currentRoles
        });
        
        // Log d'audit
        await this.logRoleChange(seasonId, userEmail, 'admin', 'granted', grantedBy);
        
        console.log(`✅ Rôle Admin accordé à ${userEmail} pour la saison ${seasonId}`);
      } else {
        console.log(`ℹ️ ${userEmail} est déjà admin de la saison ${seasonId}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'octroi du rôle Admin de saison:`, error);
      throw error;
    }
  }

  /**
   * Révoque le rôle Admin de saison d'un utilisateur
   */
  async revokeSeasonAdmin(seasonId, userEmail, revokedBy) {
    try {
      console.log(`🔐 Révocation du rôle Admin de saison ${seasonId} à ${userEmail} par ${revokedBy}`);
      
      // Vérifier que la saison existe
      const seasonRef = admin.firestore().collection('seasons').doc(seasonId);
      const seasonDoc = await seasonRef.get();
      
      if (!seasonDoc.exists) {
        throw new Error(`Saison ${seasonId} non trouvée`);
      }
      
      // Récupérer les rôles actuels
      const seasonData = seasonDoc.data();
      const currentRoles = seasonData.roles || { admins: [], users: [] };
      
      // Retirer l'email s'il y est
      const adminIndex = currentRoles.admins.indexOf(userEmail);
      if (adminIndex > -1) {
        currentRoles.admins.splice(adminIndex, 1);
        
        // Mettre à jour Firestore
        await seasonRef.update({
          roles: currentRoles
        });
        
        // Log d'audit
        await this.logRoleChange(seasonId, userEmail, 'admin', 'revoked', revokedBy);
        
        console.log(`✅ Rôle Admin révoqué à ${userEmail} pour la saison ${seasonId}`);
      } else {
        console.log(`ℹ️ ${userEmail} n'était pas admin de la saison ${seasonId}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la révocation du rôle Admin de saison:`, error);
      throw error;
    }
  }

  /**
   * Liste tous les admins d'une saison
   */
  async listSeasonAdmins(seasonId) {
    try {
      console.log(`🔐 Listage des admins de la saison ${seasonId}`);
      
      const seasonDoc = await admin.firestore()
        .collection('seasons')
        .doc(seasonId)
        .get();
      
      if (!seasonDoc.exists) {
        throw new Error(`Saison ${seasonId} non trouvée`);
      }
      
      const seasonData = seasonDoc.data();
      const admins = seasonData.roles?.admins || [];
      
      console.log(`📋 ${admins.length} admins trouvés pour la saison ${seasonId}:`, admins);
      
      return admins;
    } catch (error) {
      console.error(`❌ Erreur lors du listage des admins de la saison ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Initialise les rôles pour une nouvelle saison
   */
  async initializeSeasonRoles(seasonId, creatorEmail) {
    try {
      console.log(`🔐 Initialisation des rôles pour la nouvelle saison ${seasonId}`);
      
      const seasonRef = admin.firestore().collection('seasons').doc(seasonId);
      
      const initialRoles = {
        roles: {
          admins: [creatorEmail], // Le créateur devient admin par défaut
          users: []
        }
      };
      
      await seasonRef.update(initialRoles);
      
      // Log d'audit
      await this.logRoleChange(seasonId, creatorEmail, 'admin', 'granted', 'system');
      
      console.log(`✅ Rôles initialisés pour ${seasonId} avec ${creatorEmail} comme admin`);
      
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'initialisation des rôles pour ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Log les changements de rôles pour audit
   */
  async logRoleChange(seasonId, userEmail, role, action, performedBy) {
    try {
      const auditLog = {
        seasonId,
        userEmail,
        role,
        action, // 'granted' ou 'revoked'
        performedBy,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        type: 'role_change'
      };
      
      // Sauvegarder dans Firestore
      await admin.firestore().collection('audit_logs').add(auditLog);
      
      console.log(`📝 Audit log créé pour changement de rôle:`, auditLog);
    } catch (error) {
      console.error('❌ Erreur lors de la création du log d\'audit:', error);
      // Ne pas faire échouer l'opération principale pour un problème de log
    }
  }

  /**
   * Middleware pour protéger les fonctions sensibles (Super Admin uniquement)
   */
  async requireSuperAdmin(req, res, callback) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const isSuperAdmin = this.isSuperAdmin(decodedToken.email);
      if (!isSuperAdmin) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Accès réservé aux Super Admins'
        });
      }
      
      req.user = decodedToken;
      await callback();
    } catch (error) {
      console.error('❌ Erreur de vérification Super Admin:', error);
      res.status(401).json({ error: 'Token d\'authentification invalide' });
    }
  }

  /**
   * Middleware pour protéger les fonctions de saison (Super Admin ou Admin de saison)
   */
  async requireSeasonAdmin(seasonId, req, res, callback) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Vérifier Super Admin (accès à tout)
      const isSuperAdmin = this.isSuperAdmin(decodedToken.email);
      if (isSuperAdmin) {
        req.user = decodedToken;
        await callback();
        return;
      }
      
      // Vérifier Admin de saison
      const isSeasonAdmin = await this.isSeasonAdmin(seasonId, decodedToken.email);
      if (!isSeasonAdmin) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Accès réservé aux admins de cette saison'
        });
      }
      
      req.user = decodedToken;
      await callback();
    } catch (error) {
      console.error('❌ Erreur de vérification Admin de saison:', error);
      res.status(401).json({ error: 'Token d\'authentification invalide' });
    }
  }
}

module.exports = RoleService;
