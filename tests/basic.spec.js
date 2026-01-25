const { test, expect } = require('@playwright/test');

test.describe('Tests basiques HatCast', () => {
  test('Page d\'accueil se charge', async ({ page }) => {
    // Aller sur la page d'accueil (utilise la baseURL de Playwright)
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier que la page se charge
    await expect(page.locator('body')).toBeVisible();
    
    // Vérifier que le titre est présent
    const title = await page.title();
    console.log('📄 Titre de la page:', title);
    expect(title).toBeTruthy();
    
    // Prendre une screenshot
    await page.screenshot({ path: 'test-results/basic-homepage.png' });
    
    console.log('✅ Page d\'accueil chargée avec succès');
  });

  test('Test de l\'intercepteur d\'emails', async ({ page }) => {
    // Simuler un email de test
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
    
    console.log('✅ Intercepteur d\'emails fonctionne');
  });

  test('Navigation de base', async ({ page }) => {
    // Aller sur la page d'accueil (utilise la baseURL de Playwright)
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier que la page contient du contenu
    const bodyText = await page.locator('body').textContent();
    console.log('📄 Contenu de la page (premiers 200 caractères):', bodyText?.substring(0, 200));
    
    // Vérifier qu'il y a du contenu
    expect(bodyText).toBeTruthy();
    expect(bodyText.length).toBeGreaterThan(0);
    
    console.log('✅ Navigation de base fonctionne');
  });

  test('Route critique /seasons se charge', async ({ page }) => {
    const res = await page.goto('/seasons');
    await page.waitForLoadState('domcontentloaded');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });
});

