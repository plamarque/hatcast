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
  const reminder = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Rappel disponibilité' }) })
  await expect(reminder).toBeVisible()
  await expect(reminder.getByRole('button', { name: 'Copier le message' })).toBeVisible()
  await expect(reminder.getByRole('button', { name: 'Envoyer par WhatsApp' })).toBeVisible()
  await reminder.getByRole('button', { name: 'Notifier' }).click()
  const confirm = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Confirmer le rappel' }) })
  await expect(confirm).toBeVisible()
  await expect(confirm.getByRole('checkbox')).toHaveCount(0)
  await expect(confirm.getByRole('button', { name: /^Envoyer à/ })).toBeEnabled()
  await confirm.getByRole('button', { name: 'Annuler' }).click()
  await expect(confirm).toHaveCount(0)
  await expect(reminder).toBeVisible()
  expect(sends).toEqual([])
})
