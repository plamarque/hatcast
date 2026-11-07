import { expect, test } from '@playwright/test'
import { prepareE1Run, resolveE1Context } from './helpers/e1-staging'
import { openEventTab } from './helpers/e1.ui'
import { assertNoHorizontalOverflow } from './helpers/e1-layout'

test('member can view unanswered participants without a reminder action', async ({ page, request }) => {
  await prepareE1Run(page, request)
  const fx = await resolveE1Context(request)
  await openEventTab(page, fx, fx.eventReminderSlug, 'dispos')
  const panel = page.getByRole('region', { name: 'Personnes sans réponse' })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Relancer' })).toHaveCount(0)
  const toggle = panel.getByRole('button', { name: 'Afficher les personnes sans réponse' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(panel.getByRole('button', { name: 'Masquer les personnes sans réponse' })).toHaveAttribute('aria-expanded', 'true')
  await expect(panel.locator('#unanswered-list li').first()).toBeVisible()
  await assertNoHorizontalOverflow(page)
})
