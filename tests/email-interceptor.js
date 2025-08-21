const fs = require('fs');
const path = require('path');

// Configuration
const EMAILS_DIR = path.join(__dirname, '..', 'test-output', 'emails');
const TEST_MODE = process.env.NODE_ENV === 'test' || process.env.TEST_EMAILS === 'true';

// Créer le dossier des emails s'il n'existe pas
if (!fs.existsSync(EMAILS_DIR)) {
  fs.mkdirSync(EMAILS_DIR, { recursive: true });
}

/**
 * Intercepte les emails et les écrit en local pour les tests
 */
class EmailInterceptor {
  constructor() {
    this.emails = [];
    this.isEnabled = TEST_MODE;
  }

  /**
   * Intercepte un email et l'écrit en local
   */
  interceptEmail(emailData) {
    if (!this.isEnabled) {
      console.log('📧 Email interceptor désactivé, email non intercepté');
      return emailData;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `email-${timestamp}.json`;
    const filepath = path.join(EMAILS_DIR, filename);

    const interceptedEmail = {
      ...emailData,
      interceptedAt: new Date().toISOString(),
      filename: filename
    };

    // Écrire l'email en local
    fs.writeFileSync(filepath, JSON.stringify(interceptedEmail, null, 2));

    console.log(`📧 Email intercepté et sauvegardé: ${filepath}`);
    console.log(`   To: ${emailData.to}`);
    console.log(`   Subject: ${emailData.subject}`);

    this.emails.push(interceptedEmail);
    return interceptedEmail;
  }

  /**
   * Récupère le dernier email intercepté
   */
  getLatestEmail() {
    if (this.emails.length === 0) {
      return null;
    }
    return this.emails[this.emails.length - 1];
  }

  /**
   * Récupère tous les emails interceptés
   */
  getAllEmails() {
    return this.emails;
  }

  /**
   * Nettoie les emails interceptés
   */
  clearEmails() {
    if (fs.existsSync(EMAILS_DIR)) {
      fs.rmSync(EMAILS_DIR, { recursive: true, force: true });
      fs.mkdirSync(EMAILS_DIR, { recursive: true });
    }
    this.emails = [];
    console.log('🧹 Emails interceptés nettoyés');
  }

  /**
   * Extrait un lien de reset depuis un email
   */
  extractResetLink(email) {
    if (!email || !email.html) {
      return null;
    }

    // Chercher les liens de reset dans le HTML
    const resetLinkMatch = email.html.match(/href="([^"]*reset[^"]*)"/);
    if (resetLinkMatch) {
      return resetLinkMatch[1];
    }

    // Chercher dans le texte si pas de HTML
    const textResetMatch = email.text.match(/(https?:\/\/[^\s]*reset[^\s]*)/);
    if (textResetMatch) {
      return textResetMatch[1];
    }

    return null;
  }

  /**
   * Extrait tous les liens d'un email
   */
  extractAllLinks(email) {
    if (!email || !email.html) {
      return [];
    }

    const linkMatches = email.html.match(/href="([^"]*)"/g);
    if (!linkMatches) {
      return [];
    }

    return linkMatches.map(match => match.replace('href="', '').replace('"', ''));
  }
}

// Instance globale
const emailInterceptor = new EmailInterceptor();

// Fonction pour intercepter les emails Firebase
function interceptFirebaseEmail(emailData) {
  return emailInterceptor.interceptEmail(emailData);
}

// Fonction pour simuler l'envoi d'email Firebase
function simulateFirebaseEmailSend(to, subject, html, text) {
  const emailData = {
    to: to,
    subject: subject,
    html: html,
    text: text,
    from: 'noreply@hatcast.app',
    timestamp: new Date().toISOString()
  };

  return emailInterceptor.interceptEmail(emailData);
}

// Export pour utilisation dans les tests
module.exports = {
  EmailInterceptor,
  emailInterceptor,
  interceptFirebaseEmail,
  simulateFirebaseEmailSend
};

// Si exécuté directement, afficher les emails interceptés
if (require.main === module) {
  console.log('📧 Email Interceptor - Mode test');
  console.log(`📁 Dossier des emails: ${EMAILS_DIR}`);
  console.log(`🔧 Mode intercepteur: ${emailInterceptor.isEnabled ? 'Activé' : 'Désactivé'}`);
  
  if (emailInterceptor.emails.length > 0) {
    console.log('\n📬 Emails interceptés:');
    emailInterceptor.emails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email.subject} -> ${email.to}`);
    });
  } else {
    console.log('\n📭 Aucun email intercepté');
  }
}
