import { expect, test } from '@playwright/test'
import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import { saisonWorkspacePath, troupeHubPath } from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'
import { memberBottomShellTab, MEMBER_SHELL_TAB } from '../helpers/member-nav.ui'

/** Uses the isolated E1 fixture; menu clicks must navigate without page.goto fallbacks. */
test.describe('E1 — compact troupe navigation (mobile)', () => {
  test.beforeEach(async ({ page, request }) => { await prepareE1Run(page, request) })

  test('E1-MEM-040 — three matching destinations and troupe navigation', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
    await page.goto('/agenda')
    const trigger = memberBottomShellTab(page, MEMBER_SHELL_TAB.troupe)
    await trigger.click()
    const entries = page.getByRole('menu').getByRole('menuitem')
    await expect(entries).toHaveCount(3)
    await expect(entries.nth(0)).toHaveAttribute('href', troupeHubPath(fx.troupeSlug))
    await expect(entries.nth(1)).toHaveAttribute('href', `${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=agenda`)
    await expect(entries.nth(2)).toHaveText('Statistiques')
    await expect(entries.nth(2)).toHaveAttribute('href', `${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=stats`)
    await assertNoHorizontalOverflow(page)
    await entries.nth(0).click()
    await expect(page).toHaveURL(troupeHubPath(fx.troupeSlug))
    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('E1-MEM-041 — missing memory uses a membership and offers three entries', async ({ page, request }) => {
    await resolveE1Context(request)
    await page.goto('/agenda')
    await page.evaluate(() => {
      localStorage.removeItem('lastVisitedTroupeSlug')
      localStorage.removeItem('lastVisitedSeason')
      localStorage.removeItem('lastVisitedSeasonByTroupe')
    })
    await memberBottomShellTab(page, MEMBER_SHELL_TAB.troupe).click()
    const entries = page.getByRole('menu').getByRole('menuitem')
    await expect(entries).toHaveCount(3)
    await expect(entries.nth(0)).toHaveAttribute('href', /^\/troupes\/[^/]+$/)
    expect(await page.evaluate(() => localStorage.getItem('lastVisitedTroupeSlug'))).toBeNull()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(memberBottomShellTab(page, MEMBER_SHELL_TAB.troupe)).toBeFocused()
  })

  test('E1-MEM-042 — agenda and statistics navigate to explicit season views', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
    await memberBottomShellTab(page, MEMBER_SHELL_TAB.troupe).click()
    await page.getByRole('menu').getByRole('menuitem').nth(2).click()
    await expect(page).toHaveURL(`${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=stats`)
    await memberBottomShellTab(page, MEMBER_SHELL_TAB.troupe).click()
    await page.getByRole('menu').getByRole('menuitem').nth(1).click()
    await expect(page).toHaveURL(`${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=agenda`)
  })
})
