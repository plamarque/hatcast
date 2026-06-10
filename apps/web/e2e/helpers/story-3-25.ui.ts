import { expect, type Page, type Response } from '@playwright/test'

import type { Story325Fixture } from './e2e-api'
import { signInWithE2eToken } from './e2e-api'
import { prepareE2ePage } from './e1.ui'
import { saisonEventPath, saisonWorkspacePath, troupeHubPath } from './e1-routes'

function isSeasonWorkspaceAgendaResponse(response: Response): boolean {
  return (
    response.request().method() === 'GET' &&
    /\/v1\/seasons\/[^/]+\/workspace(\?|$)/.test(response.url()) &&
    response.url().includes('view=agenda')
  )
}

async function waitForSeasonWorkspaceAgendaResponse(page: Page): Promise<Response> {
  return page.waitForResponse(
    (response) => isSeasonWorkspaceAgendaResponse(response) && response.ok(),
    { timeout: 45_000 },
  )
}

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
    await page.goto(path)
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
    await expect(page).not.toHaveURL(/\/agenda$/)
    const reloadWorkspaceResponse = waitForSeasonWorkspaceAgendaResponse(page)
    await page.reload({ waitUntil: 'load' })
    await reloadWorkspaceResponse
    await waitForAgendaLoadingDone(page)
    return
  }

  await page.goto(path)
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(page).not.toHaveURL(/\/agenda$/)

  if (needsAgendaBootstrap) {
    await waitForAgendaLoadingDone(page)
  }
}

export async function openGuestEventTab(
  page: Page,
  fx: Story325Fixture,
  seasonSlug: string,
  eventSlug: string,
  tab: 'dispos' | 'equipe' | 'infos',
): Promise<void> {
  await page.goto(saisonEventPath(fx.troupeSlug, seasonSlug, eventSlug, { tab }))
  await expect(page.locator('app-event-detail')).toBeVisible({ timeout: 45_000 })
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
}

export async function clickSeasonCard(page: Page, seasonTitleFragment: string): Promise<void> {
  const card = page.locator('app-season-card').filter({ hasText: seasonTitleFragment }).first()
  await expect(card).toBeVisible({ timeout: 30_000 })
  await card.locator('a.season-card__surface').click()
}

export async function clickBreadcrumbSeasonLink(page: Page): Promise<void> {
  const link = page.locator('app-context-breadcrumb a.context-breadcrumb__link').first()
  await expect(link).toBeVisible({ timeout: 30_000 })
  await link.click()
}

export async function switchSeasonView(
  page: Page,
  label: 'Agenda' | 'Historique' | 'Statistiques',
): Promise<void> {
  const toggle = seasonViewToggle(page, label)
  await expect(toggle).toBeVisible({ timeout: 15_000 })
  await toggle.click()
}
