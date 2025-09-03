const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

/**
 * Service d'envoi d'emails via SMTP
 * Utilise Firebase Secrets pour les informations sensibles
 */
class EmailService {
  constructor() {
    this.config = functions.config();
  }

  /**
   * Récupère un secret Firebase de manière sécurisée
   */
  async getSecret(secretName) {
    try {
      const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
      const client = new SecretManagerServiceClient();
      
      const name = `projects/${functions.config().env?.firebase_env || 'impro-selector'}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({name});
      
      return version.payload.data.toString();
    } catch (error) {
      console.warn(`⚠️ Impossible de récupérer le secret ${secretName}:`, error.message);
      // Fallback vers l'ancienne méthode
      return null;
    }
  }

  /**
   * Crée un transporteur SMTP selon l'environnement
   */
  async createTransporter(environment = 'production', customCredentials = null) {
    console.log(`🔧 Création du transporteur pour l'environnement: ${environment}`);
    
    if (environment === 'development') {
      // En développement, créer un transporteur factice pour tester la configuration
      console.log('🔧 Mode développement: création d\'un transporteur de test');
      
      // Priorité 1: Credentials personnalisés passés en paramètre
      if (customCredentials && customCredentials.ethereal) {
        console.log('✅ Credentials Ethereal personnalisés fournis');
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: customCredentials.ethereal.user,
            pass: customCredentials.ethereal.pass
          }
        });
      }
      
      // Priorité 2: Secrets Firebase
      const etherealUser = await this.getSecret('ETHEREAL_SMTP_USER');
      const etherealPass = await this.getSecret('ETHEREAL_SMTP_PASS');
      
      if (etherealUser && etherealPass) {
        console.log('✅ Secrets Ethereal configurés, création du transporteur');
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: etherealUser,
            pass: etherealPass
          }
        });
      } else {
        console.log('⚠️ Secrets Ethereal non configurés, transporteur de test créé');
        // Créer un transporteur factice qui ne peut pas envoyer d'emails
        return {
          verify: async () => {
            console.log('🔧 Vérification du transporteur de test');
            return true;
          },
          sendMail: async () => {
            throw new Error('Transporteur de test - emails non envoyés en développement');
          }
        };
      }
    } else if (environment === 'staging') {
      // Staging: utiliser Ethereal Email
      console.log('🔧 Mode staging: utilisation d\'Ethereal Email');
      const etherealUser = await this.getSecret('ETHEREAL_SMTP_USER');
      const etherealPass = await this.getSecret('ETHEREAL_SMTP_PASS');
      
      if (!etherealUser || !etherealPass) {
        throw new Error('Configuration Ethereal Email manquante pour le staging');
      }
      
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: etherealUser,
          pass: etherealPass
        }
      });
    } else {
      // Production: utiliser Gmail
      console.log('🔧 Mode production: utilisation de Gmail');
      const gmailPassword = await this.getSecret('GMAIL_APP_PASSWORD');
      
      if (!gmailPassword) {
        throw new Error('Configuration Gmail manquante pour la production');
      }
      
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.config.gmail?.user || process.env.GMAIL_USER,
          pass: gmailPassword
        }
      });
    }
  }

  /**
   * Envoie un email générique
   */
  async sendEmail(emailData, environment = 'production') {
    try {
      const transporter = await this.createTransporter(environment);
      
      const mailOptions = {
        from: emailData.from || 'noreply@hatcast.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      };

      console.log(`📧 Envoi email ${environment}:`, {
        to: emailData.to,
        subject: emailData.subject,
        environment
      });

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email envoyé:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        environment: environment
      };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw new Error(`Échec envoi email: ${error.message}`);
    }
  }

  /**
   * Envoie une notification de sélection
   */
  async sendSelectionNotification(playerData, eventData, environment = 'production') {
    const subject = `🎭 Tu as été sélectionné(e) pour ${eventData.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🎭 Félicitations !</h2>
        <p>Bonjour ${playerData.name},</p>
        <p>Tu as été sélectionné(e) pour participer au spectacle :</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1F2937;">${eventData.title}</h3>
          <p style="margin: 10px 0; color: #6B7280;">📅 Date: ${eventData.date}</p>
          <p style="margin: 10px 0; color: #6B7280;">📝 Description: ${eventData.description}</p>
        </div>
        <p>Prépare-toi pour une aventure théâtrale incroyable ! 🎪</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Ce message est envoyé automatiquement par HatCast
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: playerData.email,
      subject: subject,
      html: html
    }, environment);
  }

  /**
   * Envoie une notification de disponibilité
   */
  async sendAvailabilityNotification(playerData, eventData, environment = 'production') {
    const subject = `📢 Nouveau spectacle disponible : ${eventData.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">📢 Nouveau Spectacle !</h2>
        <p>Bonjour ${playerData.name},</p>
        <p>Un nouveau spectacle est disponible et pourrait t'intéresser :</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1F2937;">${eventData.title}</h3>
          <p style="margin: 10px 0; color: #6B7280;">📅 Date: ${eventData.date}</p>
          <p style="margin: 10px 0; color: #6B7280;">📝 Description: ${eventData.description}</p>
        </div>
        <p>Connecte-toi à HatCast pour plus de détails ! 🎭</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Ce message est envoyé automatiquement par HatCast
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: playerData.email,
      subject: subject,
      html: html
    }, environment);
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(playerData, resetLink, environment = 'production') {
    const subject = '🔐 Réinitialisation de votre mot de passe HatCast';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🔐 Réinitialisation de mot de passe</h2>
        <p>Bonjour ${playerData.name},</p>
        <p>Tu as demandé la réinitialisation de ton mot de passe HatCast.</p>
        <p>Clique sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            🔐 Réinitialiser le mot de passe
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
          Si tu n'as pas demandé cette réinitialisation, ignore cet email.
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Ce message est envoyé automatiquement par HatCast
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: playerData.email,
      subject: subject,
      html: html
    }, environment);
  }
}

module.exports = EmailService;