import { expect, test } from '@playwright/test'

import { expectAuditJournalReady, openSeasonStats } from '../helpers/e1.ui'
import { saisonAdminAuditPath, troupeAdminAuditPath, troupeHubPath } from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe('E1 — orga stats saison & audit (desktop)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-ORG-010 — vue Statistiques saison', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await openSeasonStats(page, fx)
    await expect(page.locator('.season-statistics__table tbody tr').first()).toBeVisible({
      timeout: 30_000,
    })
  })

  test('E1-ORG-011 — journal audit saison', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await page.goto(saisonAdminAuditPath(fx.troupeSlug, fx.seasonSlug))
    await expectAuditJournalReady(page)
    await expect(page.locator('.admin-audit__filters')).toBeVisible()
  })

  test('E1-ORG-012 — journal audit troupe', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await page.goto(troupeHubPath(fx.troupeSlug))
    await page.locator('.scope-admin-menu__trigger').first().click()
    await page.getByRole('menuitem', { name: "Journal d'audit" }).click()
    await expect(page).toHaveURL(new RegExp(troupeAdminAuditPath(fx.troupeSlug).replace(/\//g, '\\/')), {
      timeout: 30_000,
    })
    await expectAuditJournalReady(page)
  })
})
