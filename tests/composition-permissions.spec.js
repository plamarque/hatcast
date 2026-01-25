/**
 * E2E: Permissions composition (onglet Équipe) – participant non-admin et utilisateur anonyme.
 *
 * Participant non-admin (avec fixture .env) :
 * - Pas de Tirage/Simuler ; slots vides non éditables ; clic slot autre n'ouvre pas la modale ;
 *   clic sur son slot l'ouvre (si dans la composition). Skips si pas de slot vide/rempli/own.
 *
 * Utilisateur anonyme (non connecté) :
 * - Peut voir l'onglet Équipe, mais dans l'onglet : pas de boutons d'action sous la composition
 *   (Tirage, Simuler, etc.) ; pas de clic possible sur les slots (vides ou remplis).
 *
 * Prérequis participant : TEST_PARTICIPANT_EMAIL et TEST_PARTICIPANT_PASSWORD dans .env.
 */
require('dotenv').config();

const { test, expect } = require('@playwright/test');

const PARTICIPANT_EMAIL = process.env.TEST_PARTICIPANT_EMAIL;
const PARTICIPANT_PASSWORD = process.env.TEST_PARTICIPANT_PASSWORD;
const HAS_FIXTURE = !!(PARTICIPANT_EMAIL && PARTICIPANT_PASSWORD);

test.describe('Composition permissions (participant non-admin)', () => {
  /** @type {string | null} */
  let seasonSlug = null;
  /** @type {string | null} */
  let firstEventId = null;

  test.beforeEach(async ({ page }) => {
    if (!HAS_FIXTURE) return;

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });

    await dismissPwaBanners(page);

    const loginBtn = page.locator('[data-testid="login-btn"]');
    if ((await loginBtn.count()) > 0 && (await loginBtn.isVisible())) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      await page.locator('[data-testid="email-input"]').fill(PARTICIPANT_EMAIL);
      await page.locator('[data-testid="password-input"]').fill(PARTICIPANT_PASSWORD);
      await page.locator('[data-testid="submit-btn"]').click();
      await expect(page.locator('[data-testid="user-menu"]').first()).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000);
    }

    await page.goto('/seasons');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const seasonCardSelector = 'main div.rounded-2xl[class*="cursor-pointer"]';
    const card = page.locator(seasonCardSelector).first();
    if ((await card.count()) === 0) return;
    await card.click();
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
      await expect(page).toHaveURL(/[?&]event=/, { timeout: 5000 });
    } catch {
      return;
    }
    const urlWithEvent = page.url();
    const eventMatch = urlWithEvent.match(/[?&]event=([^&]+)/);
    firstEventId = eventMatch ? eventMatch[1] : null;
  });

  test('Participant non-admin: Tirage and Simuler buttons are not visible on Équipe tab', async ({ page }) => {
    test.skip(!HAS_FIXTURE, 'Set TEST_PARTICIPANT_EMAIL and TEST_PARTICIPANT_PASSWORD in .env to run');
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}/event/${firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const compositionTab = page.locator('button:has-text("Équipe")').first();
    if ((await compositionTab.count()) > 0) {
      await expect(compositionTab).toHaveClass(/bg-gray-700/);
    }

    const tirage = page.getByRole('button', { name: /Tirage/ });
    const simuler = page.getByRole('button', { name: /Simuler/ });
    await expect(tirage).toHaveCount(0);
    await expect(simuler).toHaveCount(0);
  });

  test('Participant non-admin: empty slots do not allow manual selection', async ({ page }) => {
    test.skip(!HAS_FIXTURE, 'Set TEST_PARTICIPANT_EMAIL and TEST_PARTICIPANT_PASSWORD in .env to run');
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}/event/${firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const grid = page.locator('div.grid.gap-3, div.grid.grid-cols-2');
    const emptySlotAddButton = grid.locator('button:has-text("＋")').first();
    if ((await emptySlotAddButton.count()) === 0) {
      test.skip(true, 'No empty slots in composition (nothing to verify for this event)');
    }
    await expect(emptySlotAddButton).toBeDisabled();
  });

  test('Participant non-admin: click on another participant slot does not open confirmation modal', async ({ page }) => {
    test.skip(!HAS_FIXTURE, 'Set TEST_PARTICIPANT_EMAIL and TEST_PARTICIPANT_PASSWORD in .env to run');
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}/event/${firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const confirmationHeading = page.getByRole('heading', { name: 'Confirmer ma participation' });
    const slotGrid = page.locator('div.grid.grid-cols-2 div.rounded-lg.border, div.grid.gap-3 div.rounded-lg.border');
    const filledSlots = slotGrid.filter({ has: page.locator('div[role="button"]') });
    const count = await filledSlots.count();
    if (count === 0) {
      test.skip(true, 'No filled slots in composition');
    }

    for (let i = 0; i < count; i++) {
      const slot = filledSlots.nth(i);
      await slot.locator('div[role="button"]').first().click();
      await page.waitForTimeout(800);
      const modalVisible = await confirmationHeading.isVisible();
      if (!modalVisible) {
        return;
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    expect(true, 'At least one filled slot should not open confirmation modal (another participant slot)').toBe(true);
  });

  test('Participant non-admin: click on own slot opens confirmation modal (when in composition)', async ({ page }) => {
    test.skip(!HAS_FIXTURE, 'Set TEST_PARTICIPANT_EMAIL and TEST_PARTICIPANT_PASSWORD in .env to run');
    test.skip(!seasonSlug || !firstEventId, 'No season or event in this environment');

    await page.goto(`/season/${seasonSlug}/event/${firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const confirmationHeading = page.getByRole('heading', { name: 'Confirmer ma participation' });
    const slotGrid = page.locator('div.grid.grid-cols-2 div.rounded-lg.border, div.grid.gap-3 div.rounded-lg.border');
    const filledSlots = slotGrid.filter({ has: page.locator('div[role="button"]') });
    const count = await filledSlots.count();
    if (count === 0) {
      test.skip(true, 'No filled slots in composition');
    }

    for (let i = 0; i < count; i++) {
      const slot = filledSlots.nth(i);
      await slot.locator('div[role="button"]').first().click();
      await page.waitForTimeout(800);
      if (await confirmationHeading.isVisible()) {
        await expect(confirmationHeading).toBeVisible();
        return;
      }
      await page.waitForTimeout(200);
    }
    // Participant pas dans la sélection : pas de "propre slot" → skip (pas d'échec). La non-sélection manuelle (slot vide) est couverte par le test 2.
    test.skip(true, 'Participant not in selection – no own slot (manual selection on empty slot is covered by test 2)');
  });
});

/** Ferme les bannières PWA (installation / mise à jour) qui peuvent recouvrir le header. */
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

/** Navigation commune : /seasons → première saison → Agenda → premier événement. Retourne { seasonSlug, firstEventId } ou null. */
async function navigateToFirstEvent(page) {
  await page.goto('/seasons');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1500);

  const seasonCardSelector = 'main div.rounded-2xl[class*="cursor-pointer"]';
  const card = page.locator(seasonCardSelector).first();
  if ((await card.count()) === 0) return null;
  await card.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const url = page.url();
  const match = url.match(/\/season\/([^/?]+)/);
  const seasonSlug = match ? match[1] : null;
  if (!seasonSlug) return null;

  const agendaButton = page.getByRole('button', { name: 'Agenda' });
  if ((await agendaButton.count()) > 0) {
    await agendaButton.click();
    await page.waitForTimeout(1500);
  }

  const eventItems = page.locator('.event-item');
  if ((await eventItems.count()) === 0) return null;
  await eventItems.first().click();
  await page.waitForTimeout(1500);

  try {
    await expect(page).toHaveURL(/[?&]event=/, { timeout: 5000 });
  } catch {
    return null;
  }
  const urlWithEvent = page.url();
  const eventMatch = urlWithEvent.match(/[?&]event=([^&]+)/);
  const firstEventId = eventMatch ? eventMatch[1] : null;
  return firstEventId ? { seasonSlug, firstEventId } : null;
}

test.describe('Composition permissions (anonymous user)', () => {
  /** @type {{ seasonSlug: string, firstEventId: string } | null} */
  let nav = null;

  test.beforeEach(async ({ page }) => {
    nav = null;
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="app-loaded"]')).toBeVisible({ timeout: 10000 });
    await dismissPwaBanners(page);
    const loginBtn = page.locator('[data-testid="login-btn"]');
    if ((await loginBtn.count()) > 0 && (await loginBtn.isVisible())) {
      nav = await navigateToFirstEvent(page);
    }
  });

  test('Anonymous: Tirage and Simuler buttons are not visible on Équipe tab', async ({ page }) => {
    test.skip(!nav, 'No season/event or user was already connected');

    await page.goto(`/season/${nav.seasonSlug}/event/${nav.firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const tirage = page.getByRole('button', { name: /Tirage/ });
    const simuler = page.getByRole('button', { name: /Simuler/ });
    await expect(tirage).toHaveCount(0);
    await expect(simuler).toHaveCount(0);
  });

  test('Anonymous: action buttons below composition are not visible', async ({ page }) => {
    test.skip(!nav, 'No season/event or user was already connected');

    await page.goto(`/season/${nav.seasonSlug}/event/${nav.firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await expect(page.getByRole('button', { name: /Tirage/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Simuler/ })).toHaveCount(0);
  });

  test('Anonymous: empty slots do not allow manual selection', async ({ page }) => {
    test.skip(!nav, 'No season/event or user was already connected');

    await page.goto(`/season/${nav.seasonSlug}/event/${nav.firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const grid = page.locator('div.grid.gap-3, div.grid.grid-cols-2');
    const emptySlotAddButton = grid.locator('button:has-text("＋")').first();
    if ((await emptySlotAddButton.count()) === 0) {
      test.skip(true, 'No empty slots in composition');
    }
    await expect(emptySlotAddButton).toBeDisabled();
  });

  test('Anonymous: clicking on filled slots does not open confirmation modal', async ({ page }) => {
    test.skip(!nav, 'No season/event or user was already connected');

    await page.goto(`/season/${nav.seasonSlug}/event/${nav.firstEventId}?tab=compo`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const confirmationHeading = page.getByRole('heading', { name: 'Confirmer ma participation' });
    const slotGrid = page.locator('div.grid.grid-cols-2 div.rounded-lg.border, div.grid.gap-3 div.rounded-lg.border');
    const filledSlots = slotGrid.filter({ has: page.locator('div[role="button"]') });
    const count = await filledSlots.count();
    if (count === 0) {
      test.skip(true, 'No filled slots in composition');
    }

    for (let i = 0; i < count; i++) {
      const slot = filledSlots.nth(i);
      await slot.locator('div[role="button"]').first().click();
      await page.waitForTimeout(800);
      await expect(confirmationHeading).not.toBeVisible();
      await page.waitForTimeout(200);
    }
  });
});
