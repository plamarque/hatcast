/**
 * E2E: Event-details modal – tabs (Infos, Dispos, Équipe) and URL sync.
 * Slice 6 – Info as first tab, default; tab=info|team|compo in URL.
 *
 * Preconditions: at least one season and one event in the test environment.
 * If none, tests that need them are skipped. Tabs are only visible when the user is connected.
 */
const { test, expect } = require('@playwright/test');

test.describe('Event-details tabs (Infos, Dispos, Équipe)', () => {
  /** @type {string | null} */
  let seasonSlug = null;
  /** @type {string | null} */
  let firstEventId = null;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });

    const seasonSection = page.locator('h2:has-text("Saisons en cours")');
    if ((await seasonSection.count()) === 0) return;

    const seasonCards = page.locator('h2:has-text("Saisons en cours")').locator('xpath=following-sibling::div//div[contains(@class, "cursor-pointer")]');
    if ((await seasonCards.count()) === 0) return;

    await seasonCards.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    const match = url.match(/\/season\/([^/?]+)/);
    if (match) seasonSlug = match[1];

    const eventItems = page.locator('.event-item');
    if ((await eventItems.count()) === 0) return;

    await eventItems.first().click();
    await page.waitForTimeout(1500);

    const urlWithEvent = page.url();
    const eventMatch = urlWithEvent.match(/[?&]event=([^&]+)/);
    if (eventMatch) firstEventId = eventMatch[1];
  });

  test('Open event details without tab → Info tab is default and URL has tab=info', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/modal=event_details/);
    expect(url).toMatch(/event=/);
    expect(url).toMatch(/tab=info/);

    const infoTab = page.locator('button:has-text("Infos")').first();
    if ((await infoTab.count()) > 0) {
      await expect(infoTab).toHaveClass(/bg-gray-700/);
    }
  });

  test('Open with tab=team → Disponibilités tab is active', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details&tab=team`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/tab=team/);

    const teamTab = page.locator('button:has-text("Dispos")').first();
    if ((await teamTab.count()) > 0) {
      await expect(teamTab).toHaveClass(/bg-gray-700/);
    }
  });

  test('Open with tab=compo → Composition active when present, else fallback to Info', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details&tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    const compositionTab = page.locator('button:has-text("Équipe")').first();
    const hasCompositionTab = (await compositionTab.count()) > 0;

    if (hasCompositionTab) {
      const isCompoActive = await compositionTab.evaluate((el) => el.className.includes('bg-gray-700'));
      if (isCompoActive) expect(url).toMatch(/tab=compo/);
    } else {
      expect(url).toMatch(/tab=info/);
    }
  });

  test('Switching tab updates URL (tab=info, tab=team, tab=compo)', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const infoTab = page.locator('button:has-text("Infos")').first();
    const teamTab = page.locator('button:has-text("Dispos")').first();
    if ((await infoTab.count()) === 0 || (await teamTab.count()) === 0) {
      test.skip(true, 'Tabs not visible (e.g. user not connected)');
    }

    await teamTab.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/tab=team/);

    await infoTab.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/tab=info/);

    const compositionTab = page.locator('button:has-text("Équipe")').first();
    if ((await compositionTab.count()) > 0) {
      await compositionTab.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/tab=compo/);
    }
  });
});
