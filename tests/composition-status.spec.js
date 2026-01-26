/**
 * E2E: Composition status messages (Équipe tab).
 * Asserts that the status badge and hint reflect the current composition state,
 * and that transitions (Valider, Déverrouiller, Compléter, remove from slot) update the message correctly.
 *
 * Flow: if TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD set → login as admin, then /seasons → first season → Agenda → first event → tab=compo.
 * Otherwise same navigation without login (more tests may skip).
 * Uses data-testid="composition-status-badge" and data-testid="composition-status-hint".
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { test, expect } = require('@playwright/test');

const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL?.trim();
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD?.trim();
const HAS_ADMIN_FIXTURE = !!(TEST_ADMIN_EMAIL && TEST_ADMIN_PASSWORD);

async function dismissPwaBanners(page) {
  const closeInstallBanner = page.getByRole('button', { name: 'Fermer la barre d\'installation' });
  const closeUpdateBanner = page.getByRole('button', { name: 'Fermer la barre de mise à jour' });
  for (const btn of [closeInstallBanner, closeUpdateBanner]) {
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(300);
    }
  }
}

function stripHtml(html) {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

test.describe('Composition status (Équipe tab)', () => {
  /** @type {string | null} */
  let seasonSlug = null;
  /** @type {string | null} */
  let firstEventId = null;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });
    await dismissPwaBanners(page);

    if (HAS_ADMIN_FIXTURE) {
      const loginBtn = page.locator('[data-testid="login-btn"]');
      if ((await loginBtn.count()) > 0 && (await loginBtn.isVisible())) {
        await loginBtn.click();
        await page.getByTestId('email-input').waitFor({ state: 'visible', timeout: 5000 });
        await page.getByTestId('email-input').fill(TEST_ADMIN_EMAIL);
        await page.getByTestId('password-input').fill(TEST_ADMIN_PASSWORD);
        await page.getByTestId('submit-btn').click();
        await page.waitForTimeout(2000);
        const errorEl = page.getByTestId('error-message');
        const errorVisible = await errorEl.isVisible().catch(() => false);
        if (errorVisible) {
          const errorText = await errorEl.textContent();
          throw new Error(`Login failed (auth): ${errorText || 'see error-message in DOM'}. Check TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in .env.`);
        }
        await expect(page.locator('[data-testid="user-menu"]').first()).toBeVisible({ timeout: 18000 });
        await page.waitForTimeout(1000);
      }
    }

    await page.goto('/seasons');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const heading = page.getByRole('heading', { name: 'Saisons' });
    if ((await heading.count()) === 0) return;

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

    const agendaButton = page.getByRole('button', { name: 'Agenda' });
    if ((await agendaButton.count()) > 0) {
      await agendaButton.click();
      await page.waitForTimeout(1500);
    }

    const eventItems = page.locator('.event-item');
    if ((await eventItems.count()) === 0) return;
    await eventItems.first().click();
    await page.waitForTimeout(1500);

    try {
      await expect(page).toHaveURL(/\/season\/[^/]+\/event\/[^/]+/, { timeout: 5000 });
    } catch {
      return;
    }
    const urlWithEvent = page.url();
    const eventMatch = urlWithEvent.match(/\/event\/([^/?#]+)/);
    firstEventId = eventMatch ? eventMatch[1] : null;
  });

  async function openCompositionTab(page) {
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');
    await page.goto(`/season/${seasonSlug}/event/${firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  }

  async function getStatusBadgeText(page) {
    const badge = page.getByTestId('composition-status-badge');
    await expect(badge).toBeVisible({ timeout: 5000 });
    return (await badge.textContent())?.trim() ?? '';
  }

  async function getStatusHintText(page) {
    const hint = page.getByTestId('composition-status-hint');
    await expect(hint).toBeVisible({ timeout: 5000 });
    const raw = await hint.innerHTML();
    return stripHtml(raw).replace(/\s+/g, ' ').trim();
  }

  // --- State tests: assert badge and hint for each possible status ---

  test('Composition tab shows a valid status badge (one of the six)', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    const validLabels = ['À composer', 'En préparation', 'Confirmations en cours', 'Équipe complète', 'À compléter', 'À vérifier'];
    expect(validLabels).toContain(badge);
  });

  test('When status is À composer, hint contains expected text', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    if (badge !== 'À composer') {
      test.skip(true, 'Current event is not in À composer state');
    }
    const hint = await getStatusHintText(page);
    expect(hint).toMatch(/À composer/);
    expect(hint).toMatch(/emplacements|Tirez au sort/);
  });

  test('When status is En préparation, hint contains expected text', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    if (badge !== 'En préparation') {
      test.skip(true, 'Current event is not in En préparation state');
    }
    const hint = await getStatusHintText(page);
    expect(hint).toMatch(/En préparation|préparation par les sélectionneurs|administrateurs/);
  });

  test('When status is Confirmations en cours, hint contains expected text', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    if (badge !== 'Confirmations en cours') {
      test.skip(true, 'Current event is not in Confirmations en cours state');
    }
    const hint = await getStatusHintText(page);
    expect(hint).toMatch(/Confirmations/);
    expect(hint).toMatch(/Annoncer la compo/);
  });

  test('When status is Équipe complète, hint contains expected text', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    if (badge !== 'Équipe complète') {
      test.skip(true, 'Current event is not in Équipe complète state');
    }
    const hint = await getStatusHintText(page);
    expect(hint).toMatch(/Équipe complète/);
    expect(hint).toMatch(/Annoncer la compo définitive|Déverrouiller/);
  });

  test('When status is À compléter, hint contains expected text', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    if (badge !== 'À compléter') {
      test.skip(true, 'Current event is not in À compléter state');
    }
    const hint = await getStatusHintText(page);
    expect(hint).toMatch(/À compléter|emplacements sont vides/);
    expect(hint).toMatch(/Compléter/);
  });

  test('When status is À vérifier, hint contains expected text', async ({ page }) => {
    await openCompositionTab(page);
    const badge = await getStatusBadgeText(page);
    if (badge !== 'À vérifier') {
      test.skip(true, 'Current event is not in À vérifier state');
    }
    const hint = await getStatusHintText(page);
    expect(hint).toMatch(/À vérifier|personnes désistées/);
  });

  // --- Transition tests ---

  test('Click Valider (when visible) transitions to Confirmations en cours or Équipe complète', async ({ page }) => {
    await openCompositionTab(page);
    const validerBtn = page.getByRole('button', { name: /Valider/ });
    if ((await validerBtn.count()) === 0 || !(await validerBtn.first().isVisible())) {
      test.skip(true, 'Valider button not visible (e.g. not in En préparation or not admin)');
    }
    const badgeBefore = await getStatusBadgeText(page);
    if (badgeBefore !== 'En préparation') {
      test.skip(true, 'Valider only applicable when status is En préparation');
    }
    await validerBtn.first().click();
    await page.waitForTimeout(2000);
    const badgeAfter = await getStatusBadgeText(page);
    expect(['Confirmations en cours', 'Équipe complète']).toContain(badgeAfter);
  });

  test('Click Déverrouiller (when visible) transitions to En préparation', async ({ page }) => {
    await openCompositionTab(page);
    const deverrouillerBtn = page.getByRole('button', { name: /Déverrouiller/ });
    if ((await deverrouillerBtn.count()) === 0 || !(await deverrouillerBtn.first().isVisible())) {
      test.skip(true, 'Déverrouiller button not visible');
    }
    const badgeBefore = await getStatusBadgeText(page);
    if (badgeBefore !== 'Confirmations en cours' && badgeBefore !== 'Équipe complète') {
      test.skip(true, 'Déverrouiller only applicable when validated');
    }
    await deverrouillerBtn.first().click();
    await page.waitForTimeout(2000);
    const badgeAfter = await getStatusBadgeText(page);
    expect(badgeAfter).toBe('En préparation');
  });

  test('Click Compléter (when visible) fills slots and updates status', async ({ page }) => {
    await openCompositionTab(page);
    const completerBtn = page.getByRole('button', { name: /Compléter/ });
    if ((await completerBtn.count()) === 0 || !(await completerBtn.first().isVisible())) {
      test.skip(true, 'Compléter button not visible (e.g. not À compléter or no empty slots)');
    }
    const badgeBefore = await getStatusBadgeText(page);
    if (badgeBefore !== 'À compléter') {
      test.skip(true, 'Compléter only applicable when status is À compléter');
    }
    await completerBtn.first().click();
    await page.waitForTimeout(3000);
    const badgeAfter = await getStatusBadgeText(page);
    expect(['Confirmations en cours', 'Équipe complète', 'À compléter']).toContain(badgeAfter);
  });

  test('Remove player from slot (when validated) transitions to À compléter', async ({ page }) => {
    await openCompositionTab(page);
    const badgeBefore = await getStatusBadgeText(page);
    if (badgeBefore !== 'Confirmations en cours' && badgeBefore !== 'Équipe complète') {
      test.skip(true, 'Remove-from-slot transition test requires validated state');
    }
    const slotClearButtons = page.locator('button[title="Retirer cette personne"]');
    if ((await slotClearButtons.count()) === 0) {
      test.skip(true, 'No clear-slot button visible (e.g. not admin or no filled slots)');
    }
    await slotClearButtons.first().click();
    await page.waitForTimeout(2000);
    const badgeAfter = await getStatusBadgeText(page);
    expect(badgeAfter).toBe('À compléter');
  });
});
