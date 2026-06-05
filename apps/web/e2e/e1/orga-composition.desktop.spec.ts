import { expect, test } from '@playwright/test'

import {
  openEventAdminMenu,
  openEventTab,
  runWeightedDraw,
  validateComposition,
} from '../helpers/e1.ui'
import { isStagingE2e, prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe.configure({ mode: 'serial' })

test.describe('E1 — orga composition (desktop)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-ORG-001–002 — tirage puis valider sur MVP 01', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await openEventTab(page, fx, fx.eventDrawSlug, 'equipe')
    const draw = page.getByRole('button', { name: 'Tirer au sort' })
    const canDraw = await draw.isVisible().catch(() => false)
    if (isStagingE2e() && !canDraw) {
      await expect(page.locator('app-event-equipe-tab')).toBeVisible()
      return
    }
    await runWeightedDraw(page)
    await validateComposition(page)
    await expect(page.locator('[data-testid="composition-actions-toolbar"]')).toBeVisible()
  })

  test('E1-ORG-005 — modale Annoncer depuis menu admin', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await openEventTab(page, fx, fx.eventDrawSlug, 'equipe')
    await openEventAdminMenu(page)
    await page.getByRole('menuitem', { name: 'Annoncer' }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 })
  })

  test('E1-ORG-013 — Activité orga mode Tous', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await openEventTab(page, fx, fx.eventActiviteSlug, 'activite')
    await page.locator('mat-button-toggle', { hasText: 'Tous' }).click()
    await expect(
      page.locator('.audit-journal-list__entry').first().or(page.locator('.audit-journal-list__message')),
    ).toBeVisible({ timeout: 30_000 })
  })
})
