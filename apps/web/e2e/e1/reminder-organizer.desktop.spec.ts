import { expect, test } from '@playwright/test'

import { openEventAdminMenu, openEventTab } from '../helpers/e1.ui'
import { prepareE1Run, resolveReminderE1Context } from '../helpers/e1-staging'

type Permissions = { isTroupeAdmin: boolean; isSeasonOrganizer: boolean }
type Session = { platformAdmin: boolean; user: { id: string } }
type AvailabilitySummary = { participants: Array<{ userId?: string | null }> }

test.describe('E1 — availability reminder as a non-admin organizer (desktop)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-ORG-032 — previews reminder recipients without administrator privileges', async ({ page, request }) => {
    const fx = await resolveReminderE1Context(request)
    const permissionsResponse = await page.request.get(`/v1/seasons/${fx.seasonId}/permissions/me`)
    await expect(permissionsResponse).toBeOK()
    const permissions = (await permissionsResponse.json()) as Permissions
    expect(permissions.isSeasonOrganizer).toBe(true)
    expect(permissions.isTroupeAdmin).toBe(false)
    const sessionResponse = await page.request.get('/v1/auth/me')
    await expect(sessionResponse).toBeOK()
    const session = (await sessionResponse.json()) as Session
    expect(session.platformAdmin).toBe(false)

    const eventResponse = await page.request.get(
      `/v1/seasons/${fx.seasonId}/events/by-slug/${encodeURIComponent(fx.eventReminderSlug)}`,
    )
    await expect(eventResponse).toBeOK()
    const event = (await eventResponse.json()) as { id: string }
    const availabilityResponse = await page.request.get(
      `/v1/seasons/${fx.seasonId}/events/${event.id}/availability/summary`,
    )
    await expect(availabilityResponse).toBeOK()
    expect(((await availabilityResponse.json()) as AvailabilitySummary).participants.map((p) => p.userId)).not.toContain(session.user.id)

    await openEventTab(page, fx, fx.eventReminderSlug, 'infos')
    await openEventAdminMenu(page)
    await page.getByRole('menuitem', { name: 'Relance dispos' }).click()

    const reminder = page.getByRole('dialog', { name: 'Rappel disponibilité' })
    await expect(reminder).toBeVisible()
    await reminder.getByRole('button', { name: 'Notifier' }).click()

    const confirmation = page.getByRole('dialog', { name: 'Confirmer le rappel' })
    await expect(confirmation).toBeVisible()
    await expect(confirmation.getByRole('checkbox', { name: 'Tout sélectionner' })).toBeChecked()
    await expect(confirmation.getByRole('button', { name: /Envoyer à [1-9]/ })).toBeEnabled()
    await confirmation.getByRole('checkbox', { name: 'Tout sélectionner' }).click()
    await expect(confirmation.getByRole('button', { name: /Envoyer à 0 personne/ })).toBeDisabled()
  })
})
