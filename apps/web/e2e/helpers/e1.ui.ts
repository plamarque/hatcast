import { expect, type Page } from '@playwright/test'

import type { E1CutoverFixture } from './e2e-api'
import { seedMemberDisposRoles } from './dispos-poll.ui'
import { saisonEventPath, saisonWorkspacePath } from './e1-routes'

/** Dismiss PWA install banner so it does not block clicks (local E2E). */
export async function prepareE2ePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now()))
    localStorage.setItem('hatcast-pwa-installed', '1')
  })
}

export async function openEventTab(
  page: Page,
  fx: E1CutoverFixture,
  eventSlug: string,
  tab: 'dispos' | 'equipe' | 'infos' | 'activite',
) {
  await page.goto(
    saisonEventPath(fx.troupeSlug, fx.seasonSlug, eventSlug, { tab }),
  )
  await expect(page.locator('app-event-detail')).toBeVisible({ timeout: 45_000 })
  if (tab === 'dispos') {
    await expect(page.locator('app-event-dispos-tab')).toBeVisible({
      timeout: 30_000,
    })
  } else if (tab === 'equipe') {
    await expect(page.locator('app-event-equipe-tab')).toBeVisible({ timeout: 30_000 })
  } else if (tab === 'activite') {
    await expect(page.locator('app-event-activite-tab')).toBeVisible({ timeout: 30_000 })
  }
}

export async function openSeasonStats(page: Page, fx: E1CutoverFixture) {
  await page.goto(`${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=stats`)
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(
    page.locator('.season-statistics__table, .season-statistics__empty, .season-statistics__status'),
  ).toBeVisible({ timeout: 45_000 })
}

export async function expectAuditJournalReady(page: Page) {
  await expect(page.locator('.admin-audit')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText("Tu n'as pas accès à cette page.")).toHaveCount(0)
  const error = page.locator('.audit-journal-list__message--error')
  await expect(error).toHaveCount(0)
}

export async function expectActiviteJournalReady(page: Page) {
  const error = page.locator('.audit-journal-list__message--error')
  await expect(error).toHaveCount(0)
  const spinner = page.locator('.audit-journal-list__spinner')
  await expect(spinner).toHaveCount(0)
}

export async function runWeightedDraw(page: Page) {
  const draw = page.getByRole('button', { name: 'Tirer au sort' })
  await expect(draw).toBeVisible({ timeout: 30_000 })
  await draw.click()
  await expect(draw).toBeEnabled({ timeout: 60_000 })
}

/** Seed a member availability vote for Activité audit journal (E1-MEM-022). */
export async function seedMemberDisposForActivite(
  page: Page,
  fx: E1CutoverFixture,
  eventSlug: string,
): Promise<void> {
  await seedMemberDisposRoles(page, fx, eventSlug, ['mc'])
}

export async function validateComposition(page: Page) {
  const validate = page.getByRole('button', { name: 'Valider' }).first()
  await expect(validate).toBeVisible({ timeout: 30_000 })
  await validate.click()
}

export async function openEventAdminMenu(page: Page) {
  const dismiss = page.getByTestId('pwa-install-banner-dismiss')
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click()
  }
  const trigger = page.locator('.scope-admin-menu__trigger').first()
  await expect(trigger).toBeVisible({ timeout: 15_000 })
  await trigger.click({ force: true })
}
