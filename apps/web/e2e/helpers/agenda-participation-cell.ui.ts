import { expect, type Page } from '@playwright/test'

import type { AgendaParticipationCellFixture } from './e2e-api'
import { prepareE2ePage } from './e1.ui'
import { saisonWorkspacePath } from './e1-routes'

export async function gotoMemberAgenda(page: Page): Promise<void> {
  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)
  await expect(page.locator('app-user-agenda, app-agenda').first()).toBeVisible({
    timeout: 30_000,
  })
}

export async function gotoSeasonAgenda(
  page: Page,
  fx: AgendaParticipationCellFixture,
): Promise<void> {
  await page.goto(`${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=agenda`)
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('app-season-agenda')).toBeVisible({ timeout: 30_000 })
}

export async function gotoSeasonHistory(
  page: Page,
  fx: AgendaParticipationCellFixture,
): Promise<void> {
  await page.goto(`${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=history`)
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('app-season-agenda')).toBeVisible({ timeout: 30_000 })
}

export function agendaCardForEvent(page: Page, title: string) {
  return page.locator('.agenda-card').filter({
    has: page.locator('.agenda-card__title', { hasText: title }),
  })
}

export async function clickParticipationCell(page: Page, eventTitle: string): Promise<void> {
  const card = agendaCardForEvent(page, eventTitle)
  await expect(card).toBeVisible({ timeout: 30_000 })
  const trigger = card.locator('.agenda-participation-status__trigger')
  await expect(trigger).toBeVisible({ timeout: 15_000 })
  await trigger.click()
}

export async function expectParticipationCellClass(
  page: Page,
  eventTitle: string,
  className: string,
): Promise<void> {
  const card = agendaCardForEvent(page, eventTitle)
  await expect(card.locator(`.${className}`)).toBeVisible({ timeout: 30_000 })
}

export async function expectNoParticipationTrigger(page: Page, eventTitle: string): Promise<void> {
  const card = agendaCardForEvent(page, eventTitle)
  await expect(card).toBeVisible({ timeout: 30_000 })
  await expect(card.locator('.agenda-participation-status__trigger')).toHaveCount(0)
}

export async function expectStaticParticipationCell(page: Page, eventTitle: string): Promise<void> {
  const card = agendaCardForEvent(page, eventTitle)
  await expect(card.locator('.participation-event-cell')).toBeVisible({ timeout: 15_000 })
}

export async function expectAvailabilityDialog(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: /Disponibilité de/i })).toBeVisible({
    timeout: 15_000,
  })
  await expect(dialog.getByLabel('Choix de disponibilité')).toBeVisible({ timeout: 15_000 })
}

export async function expectParticipationDialog(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /Confirmer ma participation/i })).toBeVisible({
    timeout: 15_000,
  })
}

export async function confirmParticipationInDialog(page: Page): Promise<void> {
  await expectParticipationDialog(page)
  await page.locator('.composition-participation__action--confirm').click()
  await expect(page.getByRole('heading', { name: /Confirmer ma participation/i })).toHaveCount(0, {
    timeout: 30_000,
  })
}

export async function declineParticipationInDialog(page: Page): Promise<void> {
  await expectParticipationDialog(page)
  await page.locator('.composition-participation__action--decline').click()
  await expect(page.getByRole('heading', { name: 'Confirmer la déclinaison' })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Décliner' }).click()
  await expect(page.getByRole('heading', { name: /Confirmer ma participation/i })).toHaveCount(0, {
    timeout: 30_000,
  })
}

export async function clickAgendaCardBody(page: Page, eventTitle: string): Promise<void> {
  const card = agendaCardForEvent(page, eventTitle)
  await expect(card).toBeVisible({ timeout: 30_000 })
  const clickable = card.locator('.agenda-card__clickable')
  if (await clickable.count()) {
    await clickable.click()
  } else {
    await card.locator('.agenda-card__body').click()
  }
}

export async function waitForAgendaReload(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
}

export async function prepareAgendaParticipationPage(page: Page): Promise<void> {
  await prepareE2ePage(page)
}

export type MeAgendaItem = {
  eventSlug: string
  participantFocus?: {
    slotParticipationStatus?: string | null
    inTeam?: boolean
  } | null
}

export async function fetchMeAgendaItem(
  page: Page,
  eventSlug: string,
): Promise<MeAgendaItem | undefined> {
  const response = await page.request.get('/v1/me/agenda')
  if (!response.ok()) {
    throw new Error(`GET /v1/me/agenda → ${response.status()}: ${await response.text()}`)
  }
  const body = (await response.json()) as { content: MeAgendaItem[] }
  return body.content.find((item) => item.eventSlug === eventSlug)
}
