import { expect, type Page } from '@playwright/test'

import { seasonWorkspaceUrlPattern, troupeHubPath } from './e1-routes'

/** Story 17.42 — hub dashboard collectif (Ma troupe). */
export async function gotoTroupeHub(page: Page, troupeSlug: string): Promise<void> {
  await page.goto(troupeHubPath(troupeSlug))
  await expect(page.locator('app-troupe-hub')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('.troupe-hub__dashboard')).toBeVisible({ timeout: 45_000 })
}

/** Waits for season dashboard sections after metrics load. */
export async function expectTroupeHubDashboardSections(page: Page): Promise<void> {
  await expect(page.locator('#troupe-season-dashboard-heading')).toBeVisible({ timeout: 45_000 })
  await expect(page.getByRole('heading', { name: 'Personnes', exact: true })).toBeVisible({
    timeout: 45_000,
  })
  await expect(page.getByRole('heading', { name: 'Prochains spectacles', exact: true })).toBeVisible({
    timeout: 45_000,
  })
  await expect(page.locator('.troupe-hub__dashboard .troupe-hub__inline-spinner')).toHaveCount(0, {
    timeout: 45_000,
  })
}

export async function expectTroupeHubMetricTiles(page: Page): Promise<void> {
  const metrics = page.locator('.troupe-hub__metrics')
  await expect(metrics).toBeVisible({ timeout: 30_000 })
  for (const label of ['Spectacles', 'Compos', 'Personnes'] as const) {
    await expect(metrics.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(metrics.locator('.troupe-hub__metric-value').first()).not.toBeEmpty()
}

export async function expectTroupeHubLegacyChromeAbsent(page: Page): Promise<void> {
  await expect(page.locator('.troupe-hub__breadcrumb')).toHaveCount(0)
  await expect(page.locator('a.troupe-hub__season-cta')).toHaveCount(0)
  await expect(page.getByText('Ouvrir la saison', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Participations', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Participant·es', exact: true })).toHaveCount(0)
  await expect(page.locator('.troupe-hub__sections app-season-card')).toHaveCount(0)
}

export async function expectTroupeHubPersonnesStrip(page: Page): Promise<void> {
  const section = page.locator('.troupe-hub__section').filter({
    has: page.getByRole('heading', { name: 'Personnes', exact: true }),
  })
  await expect(section).toBeVisible()
  const avatars = section.locator('.troupe-hub__avatar-btn')
  const overflow = section.locator('.troupe-hub__avatar-overflow')
  const empty = section.getByText("Aucune personne pour l'instant.")
  const error = section.getByText('Impossible de charger les personnes.')
  const avatarCount = await avatars.count()
  const overflowCount = await overflow.count()
  const hasEmpty = (await empty.count()) > 0
  const hasError = (await error.count()) > 0
  expect(avatarCount > 0 || overflowCount > 0 || hasEmpty || hasError).toBe(true)
}

export async function openTroupeHubTeaserWorkspace(
  page: Page,
  troupeSlug: string,
  seasonSlug: string,
): Promise<void> {
  const cta = page.getByRole('link', { name: 'Voir tous les spectacles', exact: true })
  await expect(cta).toBeVisible({ timeout: 30_000 })
  await cta.click()
  await expect(page).toHaveURL(seasonWorkspaceUrlPattern(troupeSlug, seasonSlug), {
    timeout: 30_000,
  })
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 30_000 })
}
