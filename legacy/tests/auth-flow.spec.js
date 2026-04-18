const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Configuration des emails de test
const TEST_EMAILS_DIR = path.join(__dirname, '..', 'test-output', 'emails');
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

// Utilitaires pour gérer les emails de test
function getLatestEmail() {
  if (!fs.existsSync(TEST_EMAILS_DIR)) {
    return null;
  }
  
  const files = fs.readdirSync(TEST_EMAILS_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      name: file,
      time: fs.statSync(path.join(TEST_EMAILS_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  if (files.length === 0) return null;
  
  const emailPath = path.join(TEST_EMAILS_DIR, files[0].name);
  return JSON.parse(fs.readFileSync(emailPath, 'utf8'));
}

function extractResetLink(email) {
  // Chercher le lien de reset dans le contenu HTML
  const resetLinkMatch = email.html.match(/href="([^"]*reset[^"]*)"/);
  return resetLinkMatch ? resetLinkMatch[1] : null;
}

test.describe('Scénarios d\'authentification HatCast', () => {
  test.beforeEach(async ({ page }) => {
    // Nettoyer les emails de test
    if (fs.existsSync(TEST_EMAILS_DIR)) {
      fs.rmSync(TEST_EMAILS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_EMAILS_DIR, { recursive: true });
    
    // Aller sur la page d'accueil
    await page.goto('/');
    
    // Attendre que l'app soit chargée
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('Création de compte joueur', async ({ page }) => {
    // Ouvrir la modal de création de compte
    await page.click('[data-testid="create-account-btn"]');
    
    // Remplir le formulaire
    await page.fill('[data-testid="email-input"]', TEST_EMAIL);
    await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
    await page.fill('[data-testid="confirm-password-input"]', TEST_PASSWORD);
    
    // Soumettre le formulaire
    await page.click('[data-testid="submit-btn"]');
    
    // Vérifier que le compte est créé
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Compte créé avec succès');
  });

  test('Connexion utilisateur', async ({ page }) => {
    // Ouvrir la modal de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Remplir le formulaire
    await page.fill('[data-testid="email-input"]', TEST_EMAIL);
    await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
    
    // Se connecter
    await page.click('[data-testid="submit-btn"]');
    
    // Vérifier que l'utilisateur est connecté
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText(TEST_EMAIL);
  });

  test('Demande de réinitialisation de mot de passe', async ({ page }) => {
    // Ouvrir la modal de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Cliquer sur "Mot de passe oublié"
    await page.click('[data-testid="forgot-password-btn"]');
    
    // Remplir l'email
    await page.fill('[data-testid="email-input"]', TEST_EMAIL);
    
    // Demander le reset
    await page.click('[data-testid="submit-btn"]');
    
    // Vérifier le message de confirmation
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Email envoyé');
    
    // Attendre que l'email soit généré
    await page.waitForTimeout(2000);
    
    // Récupérer l'email de test
    const email = getLatestEmail();
    expect(email).not.toBeNull();
    expect(email.to).toBe(TEST_EMAIL);
    expect(email.subject).toContain('Réinitialisation');
    
    // Extraire le lien de reset
    const resetLink = extractResetLink(email);
    expect(resetLink).not.toBeNull();
    
    // Tester le lien de reset
    await page.goto(resetLink);
    
    // Vérifier que la page de reset s'affiche
    await expect(page.locator('[data-testid="reset-password-form"]')).toBeVisible();
    
    // Définir un nouveau mot de passe
    const newPassword = 'NewPassword123!';
    await page.fill('[data-testid="new-password-input"]', newPassword);
    await page.fill('[data-testid="confirm-password-input"]', newPassword);
    
    // Soumettre le nouveau mot de passe
    await page.click('[data-testid="submit-btn"]');
    
    // Vérifier que le mot de passe est changé
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Mot de passe mis à jour');
  });

  test('Connexion anonyme', async ({ page }) => {
    // Vérifier que l'utilisateur est connecté anonymement
    await expect(page.locator('[data-testid="anonymous-user"]')).toBeVisible();
    
    // Vérifier que les fonctionnalités anonymes sont disponibles
    await expect(page.locator('[data-testid="browse-seasons"]')).toBeVisible();
  });

  test('Gestion des erreurs d\'authentification', async ({ page }) => {
    // Ouvrir la modal de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Tester avec des identifiants incorrects
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Se connecter
    await page.click('[data-testid="submit-btn"]');
    
    // Vérifier le message d'erreur
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Identifiants incorrects');
  });

  test('Navigation et état d\'authentification', async ({ page }) => {
    // Vérifier l'état initial (anonyme)
    await expect(page.locator('[data-testid="anonymous-user"]')).toBeVisible();
    
    // Se connecter
    await page.click('[data-testid="login-btn"]');
    await page.fill('[data-testid="email-input"]', TEST_EMAIL);
    await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
    await page.click('[data-testid="submit-btn"]');
    
    // Vérifier que l'état change
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Naviguer vers une autre page
    await page.click('[data-testid="seasons-link"]');
    
    // Vérifier que l'état est conservé
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Se déconnecter
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    
    // Vérifier que l'état revient à anonyme
    await expect(page.locator('[data-testid="anonymous-user"]')).toBeVisible();
  });
});
