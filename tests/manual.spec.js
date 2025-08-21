const { test, expect } = require('@playwright/test');

test.describe('Tests manuels HatCast (serveur déjà démarré)', () => {
  test.beforeEach(async ({ page }) => {
    // Aller sur la page d'accueil (utilise la baseURL de Playwright)
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
  });

  test('Page d\'accueil se charge correctement', async ({ page }) => {
    // Vérifier que la page se charge
    await expect(page.locator('body')).toBeVisible();
    
    // Vérifier que l'app est chargée
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible();
    
    // Vérifier que le titre est correct
    const title = await page.title();
    expect(title).toContain('HatCast');
    
    console.log('✅ Page d\'accueil chargée avec succès');
  });

  test('Interface utilisateur de base', async ({ page }) => {
    // Vérifier que les éléments de base sont présents
    await expect(page.locator('body')).toBeVisible();
    
    // Prendre une screenshot pour vérification
    await page.screenshot({ path: 'test-results/homepage.png' });
    
    console.log('✅ Interface utilisateur de base vérifiée');
  });

  test('Test de l\'intercepteur d\'emails intégré', async ({ page }) => {
    // Simuler un email de test via l'intercepteur
    const { simulateFirebaseEmailSend } = require('./email-interceptor');
    
    // Utiliser la baseURL de Playwright pour les liens dans les emails
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    
    const testEmail = simulateFirebaseEmailSend(
      'test@example.com',
      'Test de réinitialisation HatCast',
      `<html><body><a href="${baseUrl}/reset?token=test123">Réinitialiser</a></body></html>`,
      `Cliquez sur ce lien: ${baseUrl}/reset?token=test123`
    );
    
    expect(testEmail.to).toBe('test@example.com');
    expect(testEmail.subject).toBe('Test de réinitialisation HatCast');
    
    console.log('✅ Intercepteur d\'emails fonctionne dans le contexte Playwright');
  });
});
