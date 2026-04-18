/**
 * Test de la configuration d'audit en développement
 * Vérifie que l'audit est désactivé par défaut et peut être activé
 */

import { test, expect } from '@playwright/test';

test.describe('Configuration Audit en Développement', () => {
  test('audit désactivé par défaut en développement', async ({ page }) => {
    // Aller sur la page des saisons (qui génère des logs d\'audit)
    await page.goto('/seasons');
    
    // Attendre que la page soit chargée
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Vérifier qu\'il n\'y a pas de logs d\'audit dans la console
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('AUDIT')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Attendre un peu pour laisser le temps aux logs d\'apparaître
    await page.waitForTimeout(2000);
    
    // Vérifier qu\'il n\'y a pas de logs d\'audit (sauf les logs de debug)
    const auditLogs = consoleLogs.filter(log => 
      !log.includes('🔇 AUDIT DISABLED') && 
      !log.includes('AUDIT DISABLED')
    );
    
    expect(auditLogs.length).toBe(0);
  });

  test('interface de développement affiche le statut audit', async ({ page }) => {
    // Aller sur la page des saisons
    await page.goto('/seasons');
    
    // Ouvrir les outils de développement
    await page.keyboard.press('Control+Shift+D');
    
    // Attendre que la modale s\'ouvre
    await page.waitForSelector('[class*="bg-orange-900"]', { timeout: 5000 });
    
    // Vérifier que la section audit est visible
    const auditSection = page.locator('text=🔇 Audit');
    await expect(auditSection).toBeVisible();
    
    // Vérifier que le statut est affiché
    const auditStatus = page.locator('text=DÉSACTIVÉ');
    await expect(auditStatus).toBeVisible();
    
    // Vérifier que le bouton d\'activation est visible
    const activateButton = page.locator('text=🔊 Activer');
    await expect(activateButton).toBeVisible();
  });

  test('bouton d\'activation affiche les instructions', async ({ page }) => {
    // Aller sur la page des saisons
    await page.goto('/seasons');
    
    // Ouvrir les outils de développement
    await page.keyboard.press('Control+Shift+D');
    
    // Attendre que la modale s\'ouvre
    await page.waitForSelector('[class*="bg-orange-900"]', { timeout: 5000 });
    
    // Cliquer sur le bouton d\'activation
    const activateButton = page.locator('text=🔊 Activer');
    await activateButton.click();
    
    // Vérifier qu\'une alerte avec les instructions apparaît
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Audit activé');
      expect(dialog.message()).toContain('VITE_AUDIT_ENABLED=true');
      expect(dialog.message()).toContain('Redémarrer le serveur');
      dialog.accept();
    });
  });

  test('logs de debug apparaissent quand audit désactivé', async ({ page }) => {
    // Aller sur la page des saisons
    await page.goto('/seasons');
    
    // Attendre que la page soit chargée
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Capturer les logs de console
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('🔇 AUDIT DISABLED')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Attendre un peu pour laisser le temps aux logs d\'apparaître
    await page.waitForTimeout(2000);
    
    // Vérifier qu\'il y a des logs de debug (au moins un)
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    // Vérifier le format des logs de debug
    const debugLog = consoleLogs[0];
    expect(debugLog).toContain('🔇 AUDIT DISABLED');
    expect(debugLog).toContain('dev mode');
  });
});
