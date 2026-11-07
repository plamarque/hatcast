import { expect, test } from '@playwright/test'
import { prepareE1Run, resolveE1Context } from './helpers/e1-staging'
import { openEventTab } from './helpers/e1.ui'
import { assertNoHorizontalOverflow } from './helpers/e1-layout'

test('organizer can review and cancel reminders for unanswered people', async ({ page, request }) => {
  const sends: string[] = []
  page.on('request', (req) => { if (req.method() === 'POST' && req.url().includes('/share-recipients/notify')) sends.push(req.url()) })
  await prepareE1Run(page, request)
  const fx = await resolveE1Context(request)
  await openEventTab(page, fx, fx.eventReminderSlug, 'dispos')
  const panel = page.getByRole('region', { name: 'Personnes sans réponse' })
  await expect(panel).toBeVisible()
  await assertNoHorizontalOverflow(page)
  await panel.getByRole('button', { name: 'Relancer' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Confirmer le rappel' })).toBeVisible()
  await expect(dialog.getByRole('checkbox')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: /^Envoyer à/ })).toBeEnabled()
  await dialog.getByRole('button', { name: 'Annuler' }).click()
  await expect(dialog).toHaveCount(0)
  expect(sends).toEqual([])
})
