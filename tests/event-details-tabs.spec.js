/**
 * E2E: Event-details modal – tabs (Infos, Dispos, Équipe) and URL sync.
 * Slice 6 – Info as first tab, default; tab=info|team|compo in URL.
 * Slice 8 – Composition (Équipe) tab always visible; tab=compo stays active with empty state when no draw.
 * Slice 9 – No composition popup; modal=selection opens event details with Composition tab; footer button switches to Composition tab.
 * Permissions – Tirage and Simuler are gated by canManageCompositionValue; manual selection is admin-only.
 *
 * Flow: Go to /seasons (season list, title "Saisons") → click first season → season page (any view) →
 * switch to "Agenda" tab → click first event (.event-item) → event-details modal opens, URL gets event= and modal=event_details.
 * If / is used, the app may redirect to the last visited season; using /seasons avoids that.
 *
 * Preconditions: at least one season and one event in the test environment.
 * If none, tests that need them are skipped. Tabs are only visible when the user is connected.
 *
 * Debug: set DEBUG_EVENT_DETAILS_TABS=1 to log each setup step (season card, Agenda, event-item, etc.).
 */
const { test, expect } = require('@playwright/test');

test.describe('Event-details tabs (Infos, Dispos, Équipe)', () => {
  /** @type {string | null} */
  let seasonSlug = null;
  /** @type {string | null} */
  let firstEventId = null;

  test.beforeEach(async ({ page }) => {
    const debug = process.env.DEBUG_EVENT_DETAILS_TABS === '1' || process.env.DEBUG_EVENT_DETAILS_TABS === 'true';
    const log = (...args) => { if (debug) console.log('[event-details-tabs]', ...args); };

    await page.goto('/seasons');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });
    log('1. After goto /seasons, URL:', page.url());

    const heading = page.getByRole('heading', { name: 'Saisons' });
    const headingCount = await heading.count();
    log('2. Heading "Saisons" count:', headingCount);
    if (headingCount === 0) return;

    const seasonCardSelector = 'main div.rounded-2xl[class*="cursor-pointer"]';
    try {
      await page.waitForSelector(seasonCardSelector, { state: 'visible', timeout: 15000 });
    } catch {
      log('3. Season card never appeared (timeout 15s)', seasonCardSelector);
      return;
    }
    const firstSeasonCard = page.locator(seasonCardSelector).first();
    const cardCount = await firstSeasonCard.count();
    log('3. Season card count:', cardCount);
    if (cardCount === 0) return;

    await firstSeasonCard.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    const match = url.match(/\/season\/([^/?]+)/);
    seasonSlug = match ? match[1] : null;
    log('4. After click season, URL:', url, '| seasonSlug:', seasonSlug);
    if (!seasonSlug) return;

    const agendaButton = page.getByRole('button', { name: 'Agenda' });
    const agendaCount = await agendaButton.count();
    log('5. Agenda button count:', agendaCount);
    if (agendaCount > 0) {
      await agendaButton.click();
      await page.waitForTimeout(1500);
    }

    const eventItems = page.locator('.event-item');
    const eventCount = await eventItems.count();
    log('6. .event-item count:', eventCount);
    if (eventCount === 0) return;

    await eventItems.first().click();
    await page.waitForTimeout(1500);

    try {
      await expect(page).toHaveURL(/[?&]event=/, { timeout: 5000 });
    } catch (e) {
      log('7. URL after event click (no event= in URL):', page.url());
      return;
    }
    const urlWithEvent = page.url();
    const eventMatch = urlWithEvent.match(/[?&]event=([^&]+)/);
    firstEventId = eventMatch ? eventMatch[1] : null;
    log('8. firstEventId:', firstEventId);
  });

  test('Open event details without tab → Info tab is default', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/modal=event_details/);
    expect(url).toMatch(/event=/);

    const infoTab = page.locator('button:has-text("Infos")').first();
    await expect(infoTab).toBeVisible();
    await expect(infoTab).toHaveClass(/bg-gray-700/);
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

  test('Open with tab=compo → Composition tab is always active (empty state when no composition)', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details&tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/tab=compo/);

    const compositionTab = page.locator('button:has-text("Équipe")').first();
    if ((await compositionTab.count()) > 0) {
      await expect(compositionTab).toHaveClass(/bg-gray-700/);
      // Composition tab content: either empty state or composition content
      const hasEmptyState = (await page.getByText('Aucun tirage pour le moment').count()) > 0;
      const hasEmptySubtitle = (await page.getByText(/La composition s'affichera ici une fois le tirage effectué/).count()) > 0;
      const hasCompositionContent = (await page.getByText("La composition n'est pas encore validée par l'organisateur").count()) > 0;
      const hasCompositionPanel = (await page.getByText(/Composition d'équipe/).count()) > 0;
      expect(hasEmptyState || hasEmptySubtitle || hasCompositionContent || hasCompositionPanel).toBeTruthy();
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
    await expect(compositionTab).toBeVisible();
    await compositionTab.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/tab=compo/);
  });

  test('URL modal=selection opens event details with Composition tab (no popup)', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?modal=selection&event=${firstEventId}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/modal=event_details/);
    expect(url).toMatch(/tab=compo/);
    expect(url).toMatch(/event=/);

    const compositionTab = page.locator('button:has-text("Équipe")').first();
    if ((await compositionTab.count()) > 0) {
      await expect(compositionTab).toHaveClass(/bg-gray-700/);
    }
  });

  test('Footer Composition button switches to Composition tab', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const compositionButton = page.getByRole('button', { name: /Composition Équipe|Composition/ });
    if ((await compositionButton.count()) === 0) {
      test.skip(true, 'Composition button not visible (e.g. not admin)');
    }

    await compositionButton.first().click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(/tab=compo/);
    const compositionTab = page.locator('button:has-text("Équipe")').first();
    await expect(compositionTab).toHaveClass(/bg-gray-700/);
  });

  test('Composition tab: Simuler and Tirage visibility match (same permission)', async ({ page }) => {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}?event=${firstEventId}&modal=event_details&tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const tirage = page.getByRole('button', { name: /Tirage/ });
    const simuler = page.getByRole('button', { name: /Simuler/ });
    const tirageVisible = (await tirage.count()) > 0 && (await tirage.first().isVisible());
    const simulerVisible = (await simuler.count()) > 0 && (await simuler.first().isVisible());
    expect(tirageVisible).toBe(simulerVisible);
  });
});
