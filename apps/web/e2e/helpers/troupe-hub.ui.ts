import { expect, type APIRequestContext, type Page } from '@playwright/test'

import { saisonWorkspacePath, seasonWorkspaceUrlPattern, troupeHubPath } from './e1-routes'

export type SeasonStatsEvent = {
  slug: string
  title: string
  startsAt: string
}

/** Loads season statistics events (member session cookies on `request`). */
export async function fetchSeasonStatisticsEvents(
  request: APIRequestContext,
  seasonId: string,
): Promise<SeasonStatsEvent[]> {
  const response = await request.get(`/v1/seasons/${seasonId}/statistics`)
  if (!response.ok()) {
    throw new Error(`Season statistics failed (${response.status()}): ${await response.text()}`)
  }
  const body = (await response.json()) as { events?: SeasonStatsEvent[] }
  return body.events ?? []
}

export function countPastStatisticsEvents(events: SeasonStatsEvent[], now = Date.now()): number {
  return events.filter((event) => {
    const startMs = Date.parse(event.startsAt)
    return !Number.isNaN(startMs) && startMs < now
  }).length
}

export function newestPastStatisticsEvent(
  events: SeasonStatsEvent[],
  now = Date.now(),
): SeasonStatsEvent | undefined {
  const past = events.filter((event) => {
    const startMs = Date.parse(event.startsAt)
    return !Number.isNaN(startMs) && startMs < now
  })
  past.sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
  return past[0]
}

/** Story 17.42 — hub dashboard collectif (Ma troupe). */
export async function gotoTroupeHub(page: Page, troupeSlug: string): Promise<void> {
  await page.goto(troupeHubPath(troupeSlug))
  await expect(page.locator('app-troupe-hub')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('.troupe-hub__dashboard')).toBeVisible({ timeout: 45_000 })
}

/** MT-AC12 / CAP-3 — hero admin trigger « Gérer la troupe » (orga). */
export async function expectTroupeHubLabeledAdminTrigger(
  page: Page,
  options?: { visibleLabel?: boolean },
): Promise<void> {
  const trigger = page.locator('.troupe-hub__hero-admin .scope-admin-menu__trigger--stroked')
  await expect(trigger).toBeVisible({ timeout: 15_000 })
  await expect(trigger).toHaveAttribute('aria-label', 'Gérer la troupe')

  const label = trigger.locator('.scope-admin-menu__trigger-label')
  if (options?.visibleLabel === false) {
    await expect(label).toHaveCount(1)
    await expect(label).toBeHidden()
  } else {
    await expect(label).toBeVisible()
    await expect(label).toHaveText('Gérer la troupe')
  }
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

/** Story 17.44 — compact month chart under metric tiles (when ≥3 past events). */
export async function expectTroupeHubSeasonChartVisible(page: Page): Promise<void> {
  const chart = page.locator('.troupe-hub__season-chart')
  await expect(chart).toBeVisible({ timeout: 45_000 })
  await expect(chart.locator('.troupe-hub__season-chart-block').first()).toBeVisible()
}

export async function expectTroupeHubSeasonChartStatusBlocks(page: Page): Promise<void> {
  const chart = page.locator('.troupe-hub__season-chart')
  const toned = chart.locator(
    '.troupe-hub__season-chart-block--draft, .troupe-hub__season-chart-block--collecting, .troupe-hub__season-chart-block--preparing, .troupe-hub__season-chart-block--confirmed',
  )
  await expect(toned.first()).toBeVisible()
}

export async function openTroupeHubSeasonStatsFromChart(
  page: Page,
  troupeSlug: string,
  seasonSlug: string,
): Promise<void> {
  const cta = page.getByRole('link', { name: 'Voir toutes les stats', exact: true })
  await expect(cta).toBeVisible({ timeout: 30_000 })
  await cta.click()
  const path = saisonWorkspacePath(troupeSlug, seasonSlug).replace(/\//g, '\\/')
  await expect(page).toHaveURL(new RegExp(`${path}\\?[^#]*view=stats`), { timeout: 30_000 })
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 30_000 })
  await expect(
    page.locator('.season-statistics__table, .season-statistics__empty, .season-statistics__status'),
  ).toBeVisible({ timeout: 45_000 })
}

export async function clickTroupeHubSeasonChartBlock(page: Page, eventTitle: string): Promise<void> {
  const escaped = eventTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = page
    .locator('.troupe-hub__season-chart')
    .getByRole('button', { name: new RegExp(escaped) })
  await expect(block.first()).toBeVisible({ timeout: 15_000 })
  await block.first().click()
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
