const { test, expect } = require('@playwright/test');

test.describe('Test simple HatCast', () => {
  test('Page d\'accueil se charge', async ({ page }) => {
    // Aller sur la page d'accueil
    await page.goto('/');
    
    // Vérifier que la page se charge
    await expect(page.locator('body')).toBeVisible();
    
    // Vérifier que l'app est chargée
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible();
    
    console.log('✅ Page d\'accueil chargée avec succès');
  });

  test('Test de l\'intercepteur d\'emails', async ({ page }) => {
    // Simuler un email de test
    const { simulateFirebaseEmailSend } = require('./email-interceptor');
    
    const testEmail = simulateFirebaseEmailSend(
      'test@example.com',
      'Test de réinitialisation',
      '<html><body><a href="https://localhost:5173/reset?token=test123">Réinitialiser</a></body></html>',
      'Cliquez sur ce lien: https://localhost:5173/reset?token=test123'
    );
    
    expect(testEmail.to).toBe('test@example.com');
    expect(testEmail.subject).toBe('Test de réinitialisation');
    
    console.log('✅ Intercepteur d\'emails fonctionne');
  });
});

