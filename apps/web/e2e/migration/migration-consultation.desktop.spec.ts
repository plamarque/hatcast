import { expect, test } from '@playwright/test'

import { MIGRATION_MALICE_GOLDEN } from '../fixtures/migration-malice.constants'
import { saisonAdminAuditPath } from '../helpers/e1-routes'
import { expectAuditJournalReady, openSeasonStats, prepareE2ePage } from '../helpers/e1.ui'
import { isStagingE2e } from '../helpers/e1-staging'
import {
  discoverMigrationMaliceContext,
  requiredMigrationMemberSlug,
} from '../helpers/migration-malice'

const describeMigration = isStagingE2e() ? test.describe : test.describe.skip

describeMigration('MIG E2E — consultation Malice (desktop orga, staging)', () => {
  test.beforeEach(async ({ page }) => {
    await prepareE2ePage(page)
  })

  test('MIG-E2E-004 — stats saison + audit sans erreur', async ({ page, request }) => {
    const memberSlug = requiredMigrationMemberSlug()
    const fx = await discoverMigrationMaliceContext(request, memberSlug)

    await openSeasonStats(page, fx)
    const rows = page.locator('.season-statistics__table tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 30_000 })
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(MIGRATION_MALICE_GOLDEN.minStatsTableRows)

    await page.goto(saisonAdminAuditPath(fx.troupeSlug, fx.seasonSlug))
    await expectAuditJournalReady(page)
    await expect(page.locator('.admin-audit__filters')).toBeVisible()
    const auditEntries = page.locator('.audit-journal-list__entry')
    const auditEmpty = page.locator('.audit-journal-list__message')
    await expect(auditEntries.first().or(auditEmpty)).toBeVisible({ timeout: 30_000 })
  })
})
