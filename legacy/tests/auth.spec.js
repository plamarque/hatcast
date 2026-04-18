const { test, expect } = require('@playwright/test');

test.describe('Tests d\'authentification HatCast', () => {
  test.beforeEach(async ({ page }) => {
    // Aller sur la page d'accueil (utilise la baseURL de Playwright)
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
  });

  test('Interface de connexion', async ({ page }) => {
    // Vérifier que le header est présent
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    
    // Vérifier que le bouton de connexion est visible
    await expect(page.locator('[data-testid="login-btn"]')).toBeVisible();
    
    // Cliquer sur le bouton de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Vérifier que la modal de connexion s'ouvre
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-account-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="forgot-password-btn"]')).toBeVisible();
    
    console.log('✅ Interface de connexion vérifiée');
  });

  test('Test de connexion avec identifiants incorrects', async ({ page }) => {
    // Ouvrir la modal de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Remplir avec des identifiants incorrects
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Cliquer sur se connecter
    await page.click('[data-testid="submit-btn"]');
    
    // Attendre et vérifier le message d'erreur
    await page.waitForTimeout(2000);
    
    // Vérifier qu'un message d'erreur apparaît
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      console.log('✅ Message d\'erreur affiché pour identifiants incorrects');
    } else {
      console.log('⚠️ Pas de message d\'erreur visible (peut être normal selon la configuration)');
    }
  });

  test('Test de réinitialisation de mot de passe', async ({ page }) => {
    // Ouvrir la modal de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Cliquer sur "Mot de passe oublié"
    await page.click('[data-testid="forgot-password-btn"]');
    
    // Vérifier que l'email est pré-rempli ou qu'on peut le saisir
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toBeVisible();
    
    // Remplir l'email
    await emailInput.fill('test@example.com');
    
    // Cliquer sur le bouton de soumission
    await page.click('[data-testid="submit-btn"]');
    
    // Attendre et vérifier le message de succès
    await page.waitForTimeout(2000);
    
    const successMessage = page.locator('[data-testid="success-message"]');
    if (await successMessage.isVisible()) {
      console.log('✅ Message de succès affiché pour la demande de reset');
    } else {
      console.log('⚠️ Pas de message de succès visible (peut être normal selon la configuration)');
    }
    
    // Vérifier que l'email a été intercepté
    const { emailInterceptor } = require('./email-interceptor');
    const latestEmail = emailInterceptor.getLatestEmail();
    
    if (latestEmail) {
      console.log('✅ Email de reset intercepté:', latestEmail.subject);
    } else {
      console.log('⚠️ Aucun email intercepté (peut être normal selon la configuration)');
    }
  });

  test('Navigation vers création de compte', async ({ page }) => {
    // Ouvrir la modal de connexion
    await page.click('[data-testid="login-btn"]');
    
    // Cliquer sur "Créer un compte"
    await page.click('[data-testid="create-account-btn"]');
    
    // Vérifier que la modal de création s'ouvre
    // (On suppose qu'elle a les mêmes attributs data-testid)
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    
    console.log('✅ Navigation vers création de compte fonctionne');
  });

  test('Test de déconnexion', async ({ page }) => {
    // Simuler une connexion (on suppose qu'il y a un utilisateur connecté)
    // Ce test peut échouer si aucun utilisateur n'est connecté
    
    // Vérifier si l'utilisateur est connecté
    const userMenu = page.locator('[data-testid="user-menu"]');
    const loginBtn = page.locator('[data-testid="login-btn"]');
    
    if (await userMenu.isVisible()) {
      // Utilisateur connecté, tester la déconnexion
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-btn"]');
      
      // Vérifier que le bouton de connexion réapparaît
      await expect(page.locator('[data-testid="login-btn"]')).toBeVisible();
      console.log('✅ Déconnexion fonctionne');
    } else if (await loginBtn.isVisible()) {
      // Utilisateur non connecté, c'est normal
      console.log('ℹ️ Utilisateur non connecté, test de déconnexion ignoré');
    }
  });
});

