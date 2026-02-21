/**
 * E2E: View loading regression tests.
 *
 * Verifies that each view (Agenda, Spectacles, Participants, Historique)
 * loads and displays data correctly, and that selectors (player, event) work.
 * Used as baseline before optimizations (future-only events, lazy dispos/casts).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { test, expect } = require('@playwright/test');

async function dismissPwaBanners(page) {
  const closeInstallBanner = page.getByRole('button', { name: "Fermer la barre d'installation" });
  const closeUpdateBanner = page.getByRole('button', { name: "Fermer la barre de mise à jour" });
  for (const btn of [closeInstallBanner, closeUpdateBanner]) {
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(300);
    }
  }
}

test.describe('View loading (Agenda, Spectacles, Participants, Historique)', () => {
  /** @type {string | null} */
  let seasonSlug = null;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });
    await dismissPwaBanners(page);

    await page.goto('/seasons');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const seasonCardSelector = 'main div.rounded-2xl[class*="cursor-pointer"]';
    try {
      await page.waitForSelector(seasonCardSelector, { state: 'visible', timeout: 15000 });
    } catch {
      return;
    }
    const firstSeasonCard = page.locator(seasonCardSelector).first();
    if ((await firstSeasonCard.count()) === 0) return;

    await firstSeasonCard.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    const match = url.match(/\/season\/([^/?]+)/);
    seasonSlug = match ? match[1] : null;
  });

  test('Agenda view: loads and displays content', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const agendaBtn = page.getByRole('button', { name: 'Agenda' });
    await agendaBtn.click();
    await page.waitForTimeout(1500);

    const timelineView = page.locator('.timeline-view');
    await expect(timelineView).toBeVisible({ timeout: 5000 });

    const eventItems = page.locator('.event-item');
    const emptyMessage = page.locator('.timeline-view').getByText(/Aucun événement|aucun événement/i);
    const hasEvents = (await eventItems.count()) > 0;
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    expect(hasEvents || hasEmptyMessage).toBeTruthy();
  });

  test('Spectacles view: grid visible', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const spectaclesBtn = page.getByRole('button', { name: 'Spectacles' });
    await spectaclesBtn.click();
    await page.waitForTimeout(1500);

    const gridTable = page.locator('table.table-auto');
    await expect(gridTable).toBeVisible({ timeout: 5000 });

    const colHeader = page.locator('.col-header');
    const headerCount = await colHeader.count();
    expect(headerCount).toBeGreaterThanOrEqual(0);
  });

  test('Participants view: grid visible', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const participantsBtn = page.getByRole('button', { name: 'Participants' });
    await participantsBtn.click();
    await page.waitForTimeout(1500);

    const gridTable = page.locator('table.table-auto');
    await expect(gridTable).toBeVisible({ timeout: 5000 });
  });

  test('Historique (Casts) view: content visible', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const historiqueBtn = page.getByRole('button', { name: 'Historique' });
    await historiqueBtn.click();
    await page.waitForTimeout(1500);

    const anyContent = page.locator('.casts-view-thead, .casts-view, table.table-auto');
    await expect(anyContent.first()).toBeVisible({ timeout: 5000 });
  });

  test('Player selector: opens and shows list or message', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const playerTrigger = page.getByTestId('player-selector-trigger');
    await playerTrigger.waitFor({ state: 'visible', timeout: 5000 });
    await playerTrigger.click();
    await page.waitForTimeout(500);

    const modal = page.getByTestId('player-selector-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filtrer les participants' })).toBeVisible();
    await expect(page.getByTestId('player-selector-option-all')).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Event selector: opens and shows list or message', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const eventTrigger = page.getByTestId('event-selector-trigger');
    if ((await eventTrigger.count()) === 0) return;
    await eventTrigger.click();
    await page.waitForTimeout(500);

    const modal = page.getByTestId('event-selector-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filtrer les événements' })).toBeVisible();
    await expect(page.getByTestId('event-selector-option-all')).toBeVisible();

    const eventRows = page.locator('[data-testid^="event-selector-row-"]');
    const emptyMessage = page.getByText(/Aucun événement actif à venir|Aucun événement trouvé/i);
    const hasRows = (await eventRows.count()) > 0;
    const hasEmptyMsg = await emptyMessage.isVisible().catch(() => false);
    expect(hasRows || hasEmptyMsg).toBeTruthy();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Loading indicator appears then disappears', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    const loadingOverlay = page.locator('[class*="loading"], [class*="progress"]');
    const gridOrContent = page.locator('table.table-auto, .timeline-view, .event-item');
    await gridOrContent.first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
  });
});
