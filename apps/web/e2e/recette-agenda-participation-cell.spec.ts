import { expect, test } from '@playwright/test'

import {
  clickAgendaCardBody,
  clickParticipationCell,
  confirmParticipationInDialog,
  declineParticipationInDialog,
  expectAvailabilityDialog,
  expectNoParticipationTrigger,
  expectParticipationCellClass,
  expectStaticParticipationCell,
  fetchMeAgendaItem,
  gotoMemberAgenda,
  gotoSeasonAgenda,
  gotoSeasonHistory,
  prepareAgendaParticipationPage,
  waitForAgendaReload,
} from './helpers/agenda-participation-cell.ui'
import { saisonEventPath } from './helpers/e1-routes'
import {
  resetAgendaParticipationCellFixture,
  type AgendaParticipationCellFixture,
} from './helpers/e2e-api'

/**
 * Agenda participation status cell — APC-E2E-01…06
 * Design: _bmad-output/test-artifacts/test-design-agenda-participation-cell.md
 */

test.describe.configure({ mode: 'serial' })

test.describe('Recette — agenda participation status cell (APC-E2E)', () => {
  let fx: AgendaParticipationCellFixture

  test.beforeAll(async ({ request }) => {
    fx = await resetAgendaParticipationCellFixture(request)
  })

  test.beforeEach(async ({ page }) => {
    await prepareAgendaParticipationPage(page)
  })

  test('APC-E2E-01 — unknown dispo opens availability dialog without navigation', async ({
    page,
  }) => {
    await gotoMemberAgenda(page)
    await clickParticipationCell(page, fx.eventUnknownDispoTitle)
    await expectAvailabilityDialog(page)
    await expect(page).toHaveURL(/\/agenda$/)
  })

  test('APC-E2E-06 — historique shows static participation cell (no trigger)', async ({
    page,
  }) => {
    await gotoSeasonHistory(page, fx)
    await expectNoParticipationTrigger(page, fx.eventHistoryTitle)
    await expectStaticParticipationCell(page, fx.eventHistoryTitle)
  })

  test('APC-E2E-05 — card body navigates to event detail', async ({ page, request }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoMemberAgenda(page)
    await expectParticipationCellClass(page, fx.eventPendingTitle, 'participation-event-cell--pending')
    await clickAgendaCardBody(page, fx.eventPendingTitle)
    await expect(page).toHaveURL(
      saisonEventPath(fx.troupeSlug, fx.seasonSlug, fx.eventPendingSlug),
      { timeout: 30_000 },
    )
  })

  test('APC-E2E-02 — pending cell opens confirm dialog and updates to selected', async ({
    page,
    request,
  }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoMemberAgenda(page)
    await clickParticipationCell(page, fx.eventPendingTitle)
    await confirmParticipationInDialog(page)
    await waitForAgendaReload(page)
    await expectParticipationCellClass(page, fx.eventPendingTitle, 'participation-event-cell--selected')
  })

  test('APC-E2E-04 — season workspace agenda mirrors confirm flow', async ({ page, request }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoSeasonAgenda(page, fx)
    await clickParticipationCell(page, fx.eventPendingTitle)
    await confirmParticipationInDialog(page)
    await waitForAgendaReload(page)
    await expectParticipationCellClass(page, fx.eventPendingTitle, 'participation-event-cell--selected')
  })

  test('APC-E2E-03 — decline keeps declined cell and API focus', async ({ page, request }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoMemberAgenda(page)
    await clickParticipationCell(page, fx.eventPendingTitle)
    await declineParticipationInDialog(page)
    await waitForAgendaReload(page)
    const card = page.locator('.agenda-card').filter({
      has: page.locator('.agenda-card__title', { hasText: fx.eventPendingTitle }),
    })
    await expect(card.locator('.participation-event-cell--declined')).toBeVisible({ timeout: 30_000 })
    await expect(card.locator('.participation-event-cell--available')).toHaveCount(0)

    const item = await fetchMeAgendaItem(page, fx.eventPendingSlug)
    expect(item?.participantFocus?.slotParticipationStatus).toBe('declined')
  })
})
