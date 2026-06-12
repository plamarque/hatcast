import { expect, test } from '@playwright/test'

import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import { saisonWorkspacePath, troupeHubPath } from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'
import {
  clearLastVisitedTroupeSlug,
  expectMemberShellTabsVisible,
  memberShellTab,
  MEMBER_SHELL_TAB,
  seedLastVisitedTroupeSlug,
} from '../helpers/member-nav.ui'

/** Story 17.41 — E1-MEM-040 is P0 blocking on gate T2 (`e1-mobile-member`). */
test.describe('E1 — membre nav Ma troupe (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-040 — bottom nav Ma troupe opens last visited hub', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)

    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })

    await page.goto('/agenda')
    await expectMemberShellTabsVisible(page)
    await assertNoHorizontalOverflow(page)

    const troupeTab = memberShellTab(page, MEMBER_SHELL_TAB.troupe)
    await expect(troupeTab).toHaveAttribute('href', troupeHubPath(fx.troupeSlug), {
      timeout: 30_000,
    })
    await troupeTab.click()

    await expect(page).toHaveURL(new RegExp(`${troupeHubPath(fx.troupeSlug)}$`), {
      timeout: 30_000,
    })
    await expect(page.locator('app-troupe-hub')).toBeVisible({ timeout: 30_000 })
    await expect(troupeTab).toHaveAttribute('aria-current', 'page')
  })

  test('E1-MEM-041 — Ma troupe falls back to troupes list when no slug stored', async ({
    page,
    request,
  }) => {
    await resolveE1Context(request)
    await assertMobileViewport(page)

    await page.goto('/agenda')
    await clearLastVisitedTroupeSlug(page)
    await page.reload()

    const troupeTab = memberShellTab(page, MEMBER_SHELL_TAB.troupe)
    await expect(troupeTab).toHaveAttribute('href', '/troupes', { timeout: 30_000 })
    await troupeTab.click()

    await expect(page).toHaveURL(/\/troupes$/, { timeout: 30_000 })
    await expect(page.locator('app-troupes-list')).toBeVisible({ timeout: 30_000 })
    await expect(troupeTab).not.toHaveAttribute('aria-current', 'page')
  })

  test('E1-MEM-042 — season visit seeds Ma troupe shortcut from storage', async ({
    page,
    request,
  }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)

    await page.goto('/agenda')
    await clearLastVisitedTroupeSlug(page)
    await seedLastVisitedTroupeSlug(page, fx.troupeSlug)
    await page.reload()

    const troupeTab = memberShellTab(page, MEMBER_SHELL_TAB.troupe)
    await expect(troupeTab).toHaveAttribute('href', troupeHubPath(fx.troupeSlug), {
      timeout: 15_000,
    })
  })
})
