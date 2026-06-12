import { expect, test } from '@playwright/test'

import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import { memberShellTab, expectMemberShellTabsVisible, MEMBER_SHELL_TAB } from '../helpers/member-nav.ui'
import { saisonWorkspacePath } from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe('E1 — sanity (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-SAN-001 — agenda loads without error', async ({ page }) => {
    await assertMobileViewport(page)
    await page.goto('/agenda')
    await expect(memberShellTab(page, MEMBER_SHELL_TAB.agenda)).toBeVisible({
      timeout: 30_000,
    })
    await expectMemberShellTabsVisible(page)
    await assertNoHorizontalOverflow(page)
  })

  test('E1-SAN-002 — troupe and season context visible', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  })
})
