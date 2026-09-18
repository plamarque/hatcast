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
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`BUG-021 — ${colorScheme} mobile explicit save, cancel and reopen from Home and agenda`, async ({ page, request }, testInfo) => {
      await resetAgendaParticipationCellFixture(request)
      await page.emulateMedia({ colorScheme })
      await gotoMemberAgenda(page)
      const item = await fetchMeAgendaItem(page, fx.eventUnknownDispoSlug)
      expect(item).toBeTruthy()
      const writes: string[] = []
      page.on('request', req => { if (req.method() === 'PUT' && req.url().includes('/availability/me')) writes.push(req.postData() ?? '') })
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
      await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click()
      await expect(dialog.getByRole('alert')).toContainText('au moins un rôle')
      expect(writes).toHaveLength(0)
      const choice = dialog.getByRole('checkbox', { name: 'DJ', exact: true })
      await choice.focus()
      await page.keyboard.press('Space')
      await expect(choice).toBeChecked()
      await dialog.getByRole('textbox', { name: 'Commentaire (optionnel)' }).fill('Brouillon annulé')
      await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      expect(writes).toHaveLength(0)
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
      await expect(dialog.getByRole('checkbox', { name: 'DJ', exact: true })).not.toBeChecked()
      await dialog.getByRole('checkbox', { name: 'DJ', exact: true }).check()
      await dialog.getByRole('checkbox', { name: 'MC', exact: true }).check()
      await dialog.getByRole('textbox', { name: 'Commentaire (optionnel)' }).fill('BUG-021 conservé')
      await dialog.locator('mat-dialog-content').evaluate(el => { el.scrollTop = el.scrollHeight })
      const save = dialog.getByRole('button', { name: 'Enregistrer', exact: true })
      await expect(save).toBeInViewport()
      const box = await save.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(48)
      await expect(dialog.locator('mat-checkbox').filter({ hasText: /^DJ$/ }).locator('.mdc-checkbox__checkmark-path')).toHaveCSS('stroke-dashoffset', '0px')
      await page.screenshot({ path: testInfo.outputPath(`availability-${colorScheme}.png`), animations: 'disabled' })
      await save.click()
      await expect(dialog).toHaveCount(0)
      expect(writes).toHaveLength(1)
      expect(JSON.parse(writes[0])).toMatchObject({ status: 'available', roleKeys: ['dj', 'mc'], comment: 'BUG-021 conservé' })
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      await expect(dialog.getByRole('checkbox', { name: 'DJ', exact: true })).toBeChecked()
      await expect(dialog.getByRole('textbox')).toHaveValue('BUG-021 conservé')
      await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()

      // Keep the same real event as the Home card even if unrelated fixture events come first.
      await page.route('**/v1/me/inbox**', async route => {
        const response = await route.fetch()
        const body = await response.json()
        const latest = await page.request.get('/v1/me/agenda?scope=upcoming&size=50')
        const agenda = await latest.json()
        const nextEvent = agenda.content.find((row: any) => row.eventSlug === fx.eventUnknownDispoSlug)
        await route.fulfill({ response, json: { ...body, nextEvent } })
      })
      await page.goto('/accueil')
      const homeCard = page.getByTestId('todo-next-event-card')
      await expect(homeCard).toContainText(fx.eventUnknownDispoTitle)
      await homeCard.locator('.agenda-participation-status__trigger').click()
      await expectAvailabilityDialog(page)
      await expect(page).toHaveURL(/\/accueil$/)
      await expect(dialog.getByRole('checkbox', { name: 'DJ', exact: true })).toBeChecked()
      await dialog.getByRole('radio', { name: 'Pas dispo', exact: true }).click()
      await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await expect(homeCard.locator('.participation-event-cell--unavailable')).toBeVisible()
      await homeCard.locator('.agenda-card__clickable').click()
      await expect(page).toHaveURL(saisonEventPath(fx.troupeSlug, fx.seasonSlug, fx.eventUnknownDispoSlug))
      await page.unrouteAll({ behavior: 'wait' })
    })
  }

  test('BUG-021 — failed save keeps the draft and failed load cannot open an empty editor', async ({ page, request }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoMemberAgenda(page)
    await clickParticipationCell(page, fx.eventUnknownDispoTitle)
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
    await dialog.getByRole('checkbox', { name: 'DJ', exact: true }).check()
    await page.route('**/availability/me', route => route.request().method() === 'PUT' ? route.abort('failed') : route.continue())
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(dialog.getByRole('alert')).toContainText('Enregistrement impossible')
    await expect(dialog.getByRole('checkbox', { name: 'DJ', exact: true })).toBeChecked()
    await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()
    await page.unroute('**/availability/me')
    await page.route('**/availability/me', route => route.abort('failed'))
    await clickParticipationCell(page, fx.eventUnknownDispoTitle)
    await expect(page.getByText('Impossible de charger la disponibilité. Réessaie dans un instant.')).toBeVisible()
    await expect(dialog).toHaveCount(0)
  })

  test('BUG-021 — draft Escape and backdrop discard edits without writes', async ({ page, request }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoMemberAgenda(page)
    const writes: string[] = []
    page.on('request', req => { if (req.method() === 'PUT' && req.url().includes('/availability/me')) writes.push(req.url()) })
    const dialog = page.getByRole('dialog')
    for (const dismissal of ['escape', 'backdrop']) {
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
      await expect(dialog.getByRole('checkbox', { name: 'DJ', exact: true })).not.toBeChecked()
      await dialog.getByRole('checkbox', { name: 'DJ', exact: true }).check()
      await dialog.getByRole('textbox').fill('Draft discarded')
      await expect(dialog.locator('mat-dialog-actions').getByRole('status')).toHaveText('Modifications non enregistrées')
      if (dismissal === 'escape') await page.keyboard.press('Escape')
      else await page.locator('.cdk-overlay-backdrop').click({ position: { x: 2, y: 2 }, force: true })
      await expect(dialog).toHaveCount(0)
      expect(writes).toHaveLength(0)
    }
    await clickParticipationCell(page, fx.eventUnknownDispoTitle)
    await expect(dialog.getByRole('radio', { name: 'Non renseigné', exact: true })).toBeChecked()
    await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()
  })

  test('BUG-021 — held PUT blocks all dismissals and returns the saved state', async ({ page, request }) => {
    await resetAgendaParticipationCellFixture(request)
    await gotoMemberAgenda(page)
    await clickParticipationCell(page, fx.eventUnknownDispoTitle)
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
    await dialog.getByRole('checkbox', { name: 'DJ', exact: true }).check()
    for (const selector of ['.mat-mdc-checkbox-touch-target', '.mdc-label', '.mat-button-toggle-button']) {
      for (const control of await dialog.locator(selector).all()) {
        const box = await control.boundingBox()
        expect(box!.height, selector).toBeGreaterThanOrEqual(48)
        expect(box!.width, selector).toBeGreaterThanOrEqual(48)
      }
    }
    const cancel = dialog.getByRole('button', { name: 'Annuler', exact: true })
    const cancelBox = await cancel.boundingBox()
    expect(cancelBox!.height).toBeGreaterThanOrEqual(48)
    expect(cancelBox!.width).toBeGreaterThanOrEqual(48)
    let release!: () => void
    let intercepted!: () => void
    const hold = new Promise<void>(resolve => { release = resolve })
    const reached = new Promise<void>(resolve => { intercepted = resolve })
    await page.route('**/availability/me', async route => {
      if (route.request().method() === 'PUT') {
        intercepted()
        await hold
      }
      await route.continue()
    })
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await reached
    await expect(cancel).toBeDisabled()
    await page.mouse.click(cancelBox!.x + cancelBox!.width / 2, cancelBox!.y + cancelBox!.height / 2)
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 2, y: 2 }, force: true })
    await expect(dialog).toBeVisible()
    release()
    await expect(dialog).toHaveCount(0)
    await clickParticipationCell(page, fx.eventUnknownDispoTitle)
    await expect(dialog.getByRole('checkbox', { name: 'DJ', exact: true })).toBeChecked()
    await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()
    await page.unrouteAll({ behavior: 'wait' })
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`BUG-024 — mandatory volunteer, optional roles, cancel and accessible help (${colorScheme})`, async ({ page, request }, testInfo) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.emulateMedia({ colorScheme })
      fx = await resetAgendaParticipationCellFixture(request, 'all')
      await gotoMemberAgenda(page)
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
      const volunteer = dialog.getByRole('checkbox', { name: /Bénévole/ })
      await expect(volunteer).toBeChecked()
      await expect(volunteer).toBeDisabled()
      const help = dialog.getByRole('button', { name: 'Pourquoi bénévole est obligatoire' })
      await help.focus()
      await expect(help).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(volunteer).not.toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(help).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(dialog.getByText('Quand tu es disponible, tu es aussi disponible comme bénévole.')).toBeVisible()
      const helpBox = await help.boundingBox()
      expect(helpBox!.width).toBeGreaterThanOrEqual(48)
      expect(helpBox!.height).toBeGreaterThanOrEqual(48)
      for (const role of await dialog.getByRole('checkbox').all()) {
        if (await role.isDisabled()) continue
        await role.check()
        await expect(volunteer).toBeChecked()
        await role.uncheck()
        await expect(volunteer).toBeChecked()
      }
      const box = await volunteer.boundingBox()
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
      await expect(volunteer).not.toBeFocused()
      await help.focus()
      await page.keyboard.press('Space')
      await expect(help).toHaveAttribute('aria-expanded', 'false')
      await page.keyboard.press('Space')
      await expect(help).toHaveAttribute('aria-expanded', 'true')
      await expect(volunteer).toBeChecked()
      expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
      await dialog.getByText('Quand tu es disponible, tu es aussi disponible comme bénévole.').scrollIntoViewIfNeeded()
      await page.screenshot({ path: testInfo.outputPath(`mandatory-volunteer-${colorScheme}.png`) })
      await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      await expect(dialog.getByRole('radio', { name: 'Non renseigné', exact: true })).toBeChecked()
      await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
      const saved = page.waitForResponse(response => response.request().method() === 'PUT' && response.url().includes('/availability/me'))
      await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click()
      expect(await (await saved).json()).toMatchObject({ status: 'available', roleKeys: ['volunteer'] })
      await expect(dialog).toHaveCount(0)
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      await expect(volunteer).toBeChecked()
      await expect(volunteer).toBeDisabled()
      await dialog.getByRole('button', { name: 'Annuler', exact: true }).click()
      fx = await resetAgendaParticipationCellFixture(request, 'volunteer')
      await gotoMemberAgenda(page)
      await clickParticipationCell(page, fx.eventUnknownDispoTitle)
      await dialog.getByRole('radio', { name: 'Dispo', exact: true }).click()
      await expect(dialog.getByRole('checkbox')).toHaveCount(1)
      await expect(volunteer).toBeChecked()
      await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await resetAgendaParticipationCellFixture(request)
    })
  }

})
