/**
 * E2E: Multi-select in PlayerSelectorModal and EventSelectorModal.
 *
 * Tests:
 * - Player selector: checkboxes visible, "Tous" row click closes and shows all,
 *   checkbox multi-select filters on close.
 * - Event selector: same behavior.
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

test.describe('Selector multi-select (participants and events)', () => {
  /** @type {string | null} */
  let seasonSlug = null;
  /** @type {string[]} */
  let playerIds = [];
  /** @type {string[]} */
  let eventIds = [];

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
    if (!seasonSlug) return;

    // Ensure we're on a view that shows the selectors (Participants or Spectacles)
    const participantsBtn = page.getByRole('button', { name: 'Participants' });
    const eventsBtn = page.getByRole('button', { name: 'Spectacles' });
    if ((await participantsBtn.count()) > 0) {
      await participantsBtn.click();
      await page.waitForTimeout(1000);
    }

    // Wait for player selector to be visible (indicates grid/header loaded)
    const playerTrigger = page.getByTestId('player-selector-trigger');
    try {
      await playerTrigger.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      return;
    }

    // Collect player and event IDs for multi-select (from DOM when modal is open)
    await playerTrigger.click();
    await page.waitForTimeout(500);
    const playerModal = page.getByTestId('player-selector-modal');
    if (await playerModal.isVisible()) {
      const rows = page.locator('[data-testid^="player-selector-row-"]');
      const count = await rows.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const testid = await rows.nth(i).getAttribute('data-testid');
        if (testid) {
          const id = testid.replace('player-selector-row-', '');
          if (id) playerIds.push(id);
        }
      }
    }
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Open event selector to collect event IDs
    const eventTrigger = page.getByTestId('event-selector-trigger');
    if ((await eventTrigger.count()) > 0) {
      await eventTrigger.click();
      await page.waitForTimeout(500);
      const eventRows = page.locator('[data-testid^="event-selector-row-"]');
      const count = await eventRows.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const testid = await eventRows.nth(i).getAttribute('data-testid');
        if (testid) {
          const id = testid.replace('event-selector-row-', '');
          if (id) eventIds.push(id);
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  test('Player selector: modal opens with checkboxes', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    await page.getByTestId('player-selector-trigger').click();
    await page.waitForTimeout(300);

    const modal = page.getByTestId('player-selector-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filtrer les participants' })).toBeVisible();

    await expect(page.getByTestId('player-selector-option-all')).toBeVisible();
    await expect(page.getByTestId('player-selector-checkbox-all')).toBeVisible();

    if (playerIds.length >= 1) {
      await expect(page.getByTestId(`player-selector-checkbox-${playerIds[0]}`)).toBeVisible();
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  });

  test('Player selector: clicking "Tous" row closes modal and keeps "Tous"', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    await page.getByTestId('player-selector-trigger').click();
    await page.waitForTimeout(300);

    const optionAll = page.getByTestId('player-selector-option-all');
    await expect(optionAll).toBeVisible();
    await optionAll.click();

    await page.waitForTimeout(500);
    await expect(page.getByTestId('player-selector-modal')).not.toBeVisible();
    await expect(page.getByTestId('player-selector-trigger')).toContainText('Tous');
  });

  test('Player selector: checkbox multi-select filters on close', async ({ page }) => {
    test.skip(!seasonSlug || playerIds.length < 2, 'Need at least 2 players');

    await page.getByTestId('player-selector-trigger').click();
    await page.waitForTimeout(300);

    const [id1, id2] = playerIds;
    const checkboxAll = page.getByTestId('player-selector-checkbox-all');
    if (await checkboxAll.isChecked()) {
      await checkboxAll.click();
      await page.waitForTimeout(100);
    }
    await page.getByTestId(`player-selector-checkbox-${id1}`).click();
    await page.getByTestId(`player-selector-checkbox-${id2}`).click();
    await page.waitForTimeout(200);

    const closeBtn = page.getByTestId('player-selector-modal').locator('button').first();
    await closeBtn.click();
    await page.waitForTimeout(500);

    await expect(page.getByTestId('player-selector-modal')).not.toBeVisible();
    const triggerText = await page.getByTestId('player-selector-trigger').textContent();
    expect(triggerText).toMatch(/2 participants|participants/);
  });

  test('Event selector: modal opens with checkboxes', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    await page.getByTestId('event-selector-trigger').click();
    await page.waitForTimeout(300);

    const modal = page.getByTestId('event-selector-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filtrer les événements' })).toBeVisible();

    await expect(page.getByTestId('event-selector-option-all')).toBeVisible();
    await expect(page.getByTestId('event-selector-checkbox-all')).toBeVisible();

    if (eventIds.length >= 1) {
      await expect(page.getByTestId(`event-selector-checkbox-${eventIds[0]}`)).toBeVisible();
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  });

  test('Event selector: clicking "Tous les événements" row closes modal', async ({ page }) => {
    test.skip(!seasonSlug, 'No season in this environment');

    await page.getByTestId('event-selector-trigger').click();
    await page.waitForTimeout(300);

    const optionAll = page.getByTestId('event-selector-option-all');
    await expect(optionAll).toBeVisible();
    await optionAll.click();

    await page.waitForTimeout(500);
    await expect(page.getByTestId('event-selector-modal')).not.toBeVisible();
  });
});
