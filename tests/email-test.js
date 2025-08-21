const { EmailInterceptor } = require('./email-interceptor');

// Test simple de l'intercepteur d'emails
console.log('🧪 Test de l\'intercepteur d\'emails');
console.log('==================================');

// Créer une instance de l'intercepteur
const interceptor = new EmailInterceptor();

// Activer le mode test
interceptor.isEnabled = true;

// Simuler un email de réinitialisation de mot de passe
const testEmail = {
  to: 'test@example.com',
  subject: 'Réinitialisation de mot de passe HatCast',
  html: `
    <html>
      <body>
        <h1>Réinitialisation de mot de passe</h1>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="https://localhost:5173/reset-password?token=abc123&email=test@example.com">Réinitialiser mon mot de passe</a>
        <p>Ce lien expire dans 1 heure.</p>
      </body>
    </html>
  `,
  text: `
    Réinitialisation de mot de passe HatCast
    
    Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :
    https://localhost:5173/reset-password?token=abc123&email=test@example.com
    
    Ce lien expire dans 1 heure.
  `,
  from: 'noreply@hatcast.app'
};

// Intercepter l'email
console.log('📧 Interception d\'un email de test...');
const interceptedEmail = interceptor.interceptEmail(testEmail);

// Vérifier que l'email a été intercepté
console.log('✅ Email intercepté avec succès');
console.log(`   À: ${interceptedEmail.to}`);
console.log(`   Sujet: ${interceptedEmail.subject}`);
console.log(`   Fichier: ${interceptedEmail.filename}`);

// Extraire le lien de reset
const resetLink = interceptor.extractResetLink(interceptedEmail);
console.log(`🔗 Lien de reset extrait: ${resetLink}`);

// Extraire tous les liens
const allLinks = interceptor.extractAllLinks(interceptedEmail);
console.log(`🔗 Nombre total de liens: ${allLinks.length}`);

// Vérifier que le lien est correct
if (resetLink && resetLink.includes('reset-password')) {
  console.log('✅ Lien de reset correctement extrait');
} else {
  console.log('❌ Erreur dans l\'extraction du lien de reset');
}

// Afficher les emails interceptés
console.log('\n📬 Emails interceptés:');
const emails = interceptor.getAllEmails();
emails.forEach((email, index) => {
  console.log(`  ${index + 1}. ${email.subject} -> ${email.to}`);
});

// Nettoyer
interceptor.clearEmails();
console.log('\n🧹 Test terminé avec succès !');

