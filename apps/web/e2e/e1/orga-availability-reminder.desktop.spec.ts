import { expect, test } from '@playwright/test'

import { openEventAdminMenu, openEventTab } from '../helpers/e1.ui'
import { prepareE1Run, resolveReminderE1Context } from '../helpers/e1-staging'

test.describe('E1 — relance de disponibilités (desktop)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-ORG-030 — prévisualise puis confirme les destinataires sélectionnés', async ({ page, request }) => {
    const fx = await resolveReminderE1Context(request)
    await openEventTab(page, fx, fx.eventReminderSlug, 'infos')
    await openEventAdminMenu(page)
    await page.getByRole('menuitem', { name: 'Relance dispos' }).click()

    const reminder = page.getByRole('dialog', { name: 'Rappel disponibilité' })
    await expect(reminder).toBeVisible()
    await expect(reminder.getByRole('button', { name: 'Copier le message' })).toBeVisible()
    await expect(reminder.getByRole('button', { name: 'Envoyer par WhatsApp' })).toBeVisible()
    await reminder.getByRole('button', { name: 'Notifier' }).click()

    const confirmation = page.getByRole('dialog', { name: 'Confirmer le rappel' })
    await expect(confirmation).toBeVisible()
    await expect(confirmation.getByRole('checkbox', { name: 'Tout sélectionner' })).toBeChecked()
    await expect(confirmation.getByRole('button', { name: /Envoyer à [1-9]/ })).toBeEnabled()
    await confirmation.getByRole('checkbox', { name: 'Tout sélectionner' }).click()
    await expect(confirmation.getByRole('button', { name: /Envoyer à 0 personne/ })).toBeDisabled()
  })
})
