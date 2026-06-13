import { expect, test } from '@playwright/test'

import { assertMobileViewport } from '../helpers/e1-layout'
import { clickMemberBottomShellTab, MEMBER_SHELL_TAB, memberBottomShellTab } from '../helpers/member-nav.ui'
import { memberProfileUrlPattern, memberStatsPath } from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe('E1 — membre stats perso (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-020 — Mes Stats page loads KPIs or empty state', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await page.goto('/agenda')
    await page.goto(memberStatsPath(fx.memberUserSlug))
    await expect(page.locator('h1.member-glance-page__title')).toContainText('Mes Stats', {
      timeout: 45_000,
    })
    const stats = page.locator('.member-profile__stats')
    const empty = page.getByText('Statistiques disponibles lorsque les disponibilités seront saisies.')
    await expect(stats.or(empty)).toBeVisible({ timeout: 15_000 })
  })

  test('E1-MEM-021 — bottom nav Stats shortcut', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await page.goto('/agenda')
    const statsUrl = memberProfileUrlPattern(fx.memberUserSlug)
    // MemberStatsShortcutService.refresh() is async; link defaults to /accueil until slug loads.
    await clickMemberBottomShellTab(page, MEMBER_SHELL_TAB.stats, statsUrl)
    await expect(page.locator('h1.member-glance-page__title')).toContainText('Mes Stats')
    await expect(memberBottomShellTab(page, MEMBER_SHELL_TAB.stats)).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
