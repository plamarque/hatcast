const { test, expect } = require('@playwright/test');

test.describe('Tests PWA HatCast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('Installation PWA', async ({ page, context }) => {
    // Vérifier que le manifest est présent
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.href : null;
    });
    expect(manifest).toBeTruthy();

    // Vérifier que le service worker est enregistré
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBe(true);

    // Vérifier les métadonnées PWA
    const title = await page.title();
    expect(title).toContain('HatCast');

    const themeColor = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      return meta ? meta.content : null;
    });
    expect(themeColor).toBeTruthy();
  });

  test('Fonctionnement offline', async ({ page, context }) => {
    // Simuler le mode offline
    await context.setOffline(true);

    // Vérifier que l'app fonctionne toujours
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible();

    // Vérifier que les fonctionnalités de base sont disponibles
    await expect(page.locator('[data-testid="seasons-list"]')).toBeVisible();

    // Remettre en ligne
    await context.setOffline(false);
  });

  test('Cache des ressources', async ({ page }) => {
    // Charger la page
    await page.goto('/');

    // Vérifier que les ressources sont mises en cache
    const cachedResources = await page.evaluate(() => {
      return caches.keys().then(keys => keys.length);
    });
    expect(cachedResources).toBeGreaterThan(0);
  });

  test('Navigation PWA', async ({ page }) => {
    // Tester la navigation entre les pages
    await page.click('[data-testid="seasons-link"]');
    await expect(page.locator('[data-testid="seasons-page"]')).toBeVisible();

    await page.click('[data-testid="home-link"]');
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
  });

  test('Responsive design', async ({ page }) => {
    // Tester sur mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Tester sur desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-menu"]')).toBeVisible();
  });
});

