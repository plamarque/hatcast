const { test, expect } = require('@playwright/test');

test.describe('Résumé des tests HatCast - Vérification complète', () => {
  test('Vérification complète de l\'interface d\'authentification', async ({ page }) => {
    console.log('🧪 Test de vérification complète HatCast');
    console.log('=====================================');
    
    // Aller sur la page d'accueil (utilise la baseURL de Playwright)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // 1. Vérifier que la page se charge
    console.log('1️⃣ Vérification du chargement de la page...');
    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    expect(title).toContain('HatCast');
    console.log('   ✅ Page chargée, titre:', title);
    
    // 2. Vérifier le header
    console.log('2️⃣ Vérification du header...');
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    console.log('   ✅ Header présent');
    
    // 3. Vérifier le bouton de connexion
    console.log('3️⃣ Vérification du bouton de connexion...');
    await expect(page.locator('[data-testid="login-btn"]')).toBeVisible();
    console.log('   ✅ Bouton de connexion visible');
    
    // 4. Ouvrir la modal de connexion
    console.log('4️⃣ Ouverture de la modal de connexion...');
    await page.click('[data-testid="login-btn"]');
    
    // 5. Vérifier tous les éléments de la modal
    console.log('5️⃣ Vérification des éléments de la modal...');
    
    // Champs de saisie
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    console.log('   ✅ Champs email et mot de passe présents');
    
    // Boutons
    await expect(page.locator('[data-testid="submit-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-account-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="forgot-password-btn"]')).toBeVisible();
    console.log('   ✅ Tous les boutons présents');
    
    // 6. Test de saisie
    console.log('6️⃣ Test de saisie dans les champs...');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    console.log('   ✅ Saisie dans les champs réussie');
    
    // 7. Test de l'intercepteur d'emails
    console.log('7️⃣ Test de l\'intercepteur d\'emails...');
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
    console.log('   ✅ Intercepteur d\'emails fonctionne');
    
    // 8. Prendre une screenshot finale
    console.log('8️⃣ Capture d\'écran finale...');
    await page.screenshot({ path: 'test-output/final-verification.png' });
    console.log('   ✅ Screenshot sauvegardée');
    
    console.log('\n🎉 Vérification complète réussie !');
    console.log('=====================================');
    console.log('✅ Page d\'accueil chargée');
    console.log('✅ Header présent');
    console.log('✅ Bouton de connexion fonctionnel');
    console.log('✅ Modal de connexion complète');
    console.log('✅ Tous les champs et boutons présents');
    console.log('✅ Intercepteur d\'emails opérationnel');
    console.log('✅ Tests automatisés prêts !');
  });
});
