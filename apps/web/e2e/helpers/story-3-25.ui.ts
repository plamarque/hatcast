import { expect, type Page } from '@playwright/test'

import type { Story325Fixture } from './e2e-api'
import { signInWithE2eToken } from './e2e-api'
import { expectDisposPollReady } from './dispos-poll.ui'
import { prepareE2ePage } from './e1.ui'
import { saisonEventPath, saisonWorkspacePath, troupeHubPath } from './e1-routes'

export async function expectSeasonWorkspaceAgendaEvents(
  page: Page,
  seasonId: string,
  minCount: number,
): Promise<void> {
  const response = await page.request.get(
    `/v1/seasons/${seasonId}/workspace?view=agenda&eventPage=0&eventSize=50`,
  )
  expect(response.ok(), `workspace GET failed (${response.status()})`).toBeTruthy()
  const payload = (await response.json()) as { upcomingEvents?: { content?: unknown[] } }
  const count = payload.upcomingEvents?.content?.length ?? 0
  expect(count, `workspace agenda returned ${count} events, expected >= ${minCount}`).toBeGreaterThanOrEqual(
    minCount,
  )
}

export async function signInGuest(
  page: Page,
  token: string,
  baseURL: string,
): Promise<void> {
  await prepareE2ePage(page)
  await signInWithE2eToken(page.request, token, baseURL)
}

export async function gotoAgenda(page: Page): Promise<void> {
  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)
  await expect(page.locator('app-user-agenda, app-agenda').first()).toBeVisible({
    timeout: 30_000,
  })
}

async function waitForAgendaLoadingDone(page: Page): Promise<void> {
  const seasonAgenda = page.locator('app-season-agenda')
  if ((await seasonAgenda.count()) > 0) {
    await expect(seasonAgenda.locator('.season-agenda__status')).toHaveCount(0, { timeout: 45_000 })
    return
  }
  await expect(page.getByText('Chargement de l’agenda…')).toHaveCount(0, { timeout: 45_000 })
}

export async function gotoSeasonWorkspace(
  page: Page,
  fx: Story325Fixture,
  seasonSlug: string,
  view?: 'agenda' | 'history' | 'stats',
  options: { reload?: boolean } = {},
): Promise<void> {
  const query = view ? `?view=${view}` : ''
  const path = `${saisonWorkspacePath(fx.troupeSlug, seasonSlug)}${query}`
  const needsAgendaBootstrap = !view || view === 'agenda'

  if (needsAgendaBootstrap && options.reload) {
    await page.goto('/agenda')
    await expect(page).not.toHaveURL(/\/connexion/)
  }

  await page.goto(path)
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(page).not.toHaveURL(/\/agenda$/)

  if (needsAgendaBootstrap) {
    await waitForAgendaLoadingDone(page)
  }
}

function expectSeasonBreadcrumbSeasonLink(page: Page) {
  return page.locator(
    'app-context-breadcrumb a.context-breadcrumb__link[href*="/saison/"], app-context-breadcrumb a.context-breadcrumb__mobile-title.context-breadcrumb__link',
  ).first()
}

async function waitForEventDetailReady(page: Page): Promise<void> {
  await expect(page.locator('app-event-detail')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('.event-detail__spinner')).toHaveCount(0, { timeout: 45_000 })
  await expect(page.locator('.event-detail__event-title')).toBeVisible({ timeout: 45_000 })
}

async function expectGuestEventDetailReady(page: Page): Promise<void> {
  await expect(page).not.toHaveURL(/\/agenda$/)
  await waitForEventDetailReady(page)
}

/** Prime guest season context before deep-linking an event (CI-stable for EXTERNE). */
async function primeGuestSeasonContext(
  page: Page,
  fx: Story325Fixture,
  seasonSlug: string,
): Promise<void> {
  await page.goto(saisonWorkspacePath(fx.troupeSlug, seasonSlug))
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(page).not.toHaveURL(/\/agenda$/)
}

export async function openGuestEventTab(
  page: Page,
  fx: Story325Fixture,
  seasonSlug: string,
  eventSlug: string,
  tab: 'dispos' | 'equipe' | 'infos',
): Promise<void> {
  await primeGuestSeasonContext(page, fx, seasonSlug)
  await page.goto(saisonEventPath(fx.troupeSlug, seasonSlug, eventSlug, { tab }))
  await expect(page.locator('app-event-detail')).toBeVisible({ timeout: 45_000 })
  await expect(page).not.toHaveURL(/\/agenda$/)
  await expect(page.locator('.event-detail__spinner')).toHaveCount(0, { timeout: 45_000 })
  if (tab === 'dispos') {
    await expect(page.locator('app-event-dispos-tab')).toBeVisible({ timeout: 45_000 })
    await expect(page.locator('app-event-dispos-tab .event-dispos__spinner')).toHaveCount(0, {
      timeout: 45_000,
    })
    await expectDisposPollReady(page)
    return
  }
  await expectGuestEventDetailReady(page)
}

export function seasonViewToggle(
  page: Page,
  label: 'Agenda' | 'Historique' | 'Statistiques',
) {
  return page.locator('mat-button-toggle').filter({ hasText: label })
}

export async function expectSeasonViewTabs(
  page: Page,
  expected: { agenda: boolean; history: boolean; stats: boolean },
): Promise<void> {
  await expect(seasonViewToggle(page, 'Agenda')).toHaveCount(expected.agenda ? 1 : 0)
  await expect(seasonViewToggle(page, 'Historique')).toHaveCount(expected.history ? 1 : 0)
  await expect(seasonViewToggle(page, 'Statistiques')).toHaveCount(expected.stats ? 1 : 0)
}

export async function expectAgendaCardVisible(page: Page, title: string): Promise<void> {
  await waitForAgendaLoadingDone(page)
  await expect(page.locator('.agenda-card__title', { hasText: title }).first()).toBeVisible({
    timeout: 30_000,
  })
}

export async function expectAgendaCardAbsent(page: Page, title: string): Promise<void> {
  await expect(page.locator('.agenda-card__title', { hasText: title })).toHaveCount(0)
}

export async function gotoTroupeHub(page: Page, fx: Story325Fixture): Promise<void> {
  await page.goto(troupeHubPath(fx.troupeSlug))
  await expect(page.locator('app-troupe-hub')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.troupe-hub__dashboard')).toBeVisible({ timeout: 30_000 })
}

/** Story 17.42 — active seasons use dashboard heading, not season-card list. */
export async function expectTroupeHubDashboardSeason(
  page: Page,
  seasonTitleFragment: string,
): Promise<void> {
  await expect(page.locator('#troupe-season-dashboard-heading')).toContainText(seasonTitleFragment, {
    timeout: 30_000,
  })
}

export async function clickSeasonCard(
  page: Page,
  seasonTitleFragment: string,
  options?: { troupeSlug?: string; seasonSlug?: string },
): Promise<void> {
  await expectTroupeHubDashboardSeason(page, seasonTitleFragment)
  await expect(page.locator('.troupe-hub__dashboard .troupe-hub__inline-spinner')).toHaveCount(0, {
    timeout: 45_000,
  })
  await expect(page.locator('.troupe-hub__metrics mat-spinner')).toHaveCount(0, { timeout: 45_000 })

  const cta = page.getByRole('link', { name: 'Voir tous les spectacles', exact: true })
  const overflow = page.locator('.troupe-hub__avatar-overflow').first()

  if (await cta.isVisible().catch(() => false)) {
    await cta.click()
    return
  }
  if (await overflow.isVisible().catch(() => false)) {
    await overflow.click()
    return
  }
  // EVENT-scoped guests may see an empty teaser (no CTA) while the season dashboard is selected.
  if (options?.troupeSlug && options?.seasonSlug) {
    await page.goto(saisonWorkspacePath(options.troupeSlug, options.seasonSlug))
    return
  }
  throw new Error(`No season workspace CTA on troupe hub for "${seasonTitleFragment}"`)
}

export async function clickBreadcrumbSeasonLink(
  page: Page,
  fx: Story325Fixture,
  seasonSlug: string,
): Promise<void> {
  await waitForEventDetailReady(page)

  const infosTab = page.locator('.event-detail__tabs').getByRole('tab', { name: /Infos/i })
  if ((await infosTab.count()) > 0) {
    await infosTab.click()
    const seasonChip = page.locator('a.event-infos__scope-chip[href*="/saison/"]').first()
    if ((await seasonChip.count()) > 0) {
      await expect(seasonChip).toBeVisible({ timeout: 15_000 })
      await seasonChip.click()
      await expect(page).toHaveURL(new RegExp(`/saison/${fx.troupeSlug}/${seasonSlug}`))
      return
    }
  }

  const breadcrumbLink = expectSeasonBreadcrumbSeasonLink(page)
  if ((await breadcrumbLink.count()) > 0 && (await breadcrumbLink.isVisible())) {
    await breadcrumbLink.click()
    return
  }

  await page.goto(saisonWorkspacePath(fx.troupeSlug, seasonSlug))
}

export async function switchSeasonView(
  page: Page,
  label: 'Agenda' | 'Historique' | 'Statistiques',
): Promise<void> {
  const toggle = seasonViewToggle(page, label)
  await expect(toggle).toBeVisible({ timeout: 15_000 })
  await toggle.click()
}
