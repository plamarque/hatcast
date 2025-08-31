/**
 * Service de gestion des administrateurs HatCast
 * Utilise Firebase Secrets pour la configuration des admins
 */

const functions = require('firebase-functions');

class AdminService {
  constructor() {
    this.adminEmails = this.getAdminEmails();
  }

  /**
   * Récupère la liste des admins depuis Firebase Secrets
   */
  getAdminEmails() {
    try {
      const config = functions.config();
      const adminEmails = config.admin?.emails;
      
      if (!adminEmails) {
        console.warn('⚠️ Configuration admin non trouvée, aucun admin autorisé');
        return [];
      }
      
      // Séparer les emails par virgules et nettoyer
      return adminEmails.split(',').map(email => email.trim()).filter(email => email);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des admins:', error);
      return [];
    }
  }

  /**
   * Vérifie si un utilisateur est admin
   */
  isAdmin(userEmail) {
    if (!userEmail) {
      return false;
    }
    
    const isAdmin = this.adminEmails.includes(userEmail);
    console.log(`🔐 Vérification admin pour ${userEmail}: ${isAdmin ? '✅ OUI' : '❌ NON'}`);
    
    return isAdmin;
  }

  /**
   * Middleware pour protéger les fonctions sensibles
   */
  requireAdmin(req, res, next) {
    try {
      const user = req.user;
      
      if (!user || !user.email) {
        console.warn('🚫 Tentative d\'accès sans authentification');
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Vous devez être connecté pour accéder à cette fonction'
        });
      }
      
      if (!this.isAdmin(user.email)) {
        console.warn(`🚫 Tentative d'accès non autorisé: ${user.email}`);
        return res.status(403).json({ 
          error: 'Admin access required',
          message: 'Accès réservé aux administrateurs'
        });
      }
      
      console.log(`✅ Accès admin autorisé pour: ${user.email}`);
      next();
    } catch (error) {
      console.error('❌ Erreur lors de la vérification admin:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  }

  /**
   * Retourne la liste des admins (pour debug, admin uniquement)
   */
  getAdminList() {
    return this.adminEmails;
  }

  /**
   * Vérifie la configuration admin
   */
  checkConfig() {
    const config = {
      adminEmails: this.adminEmails,
      count: this.adminEmails.length,
      configured: this.adminEmails.length > 0
    };
    
    console.log('🔧 Configuration admin:', config);
    return config;
  }
}

module.exports = AdminService;
