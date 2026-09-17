import { expect, test } from '@playwright/test'

import { openEventAdminMenu, openEventTab } from '../helpers/e1.ui'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe('E1 — relance de disponibilités (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-ORG-031 — conserve les trois actions sur une ligne', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await openEventTab(page, fx, fx.eventDrawSlug, 'infos')
    await openEventAdminMenu(page)
    await page.getByRole('menuitem', { name: 'Relance dispos' }).click()

    const actions = page.locator('.share-announce-dialog__actions-row')
    await expect(actions).toBeVisible()
    await expect(actions.getByRole('button')).toHaveCount(3)
    const boxes = await actions.getByRole('button').evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top))
    expect(new Set(boxes.map(Math.round)).size).toBe(1)
  })
})
