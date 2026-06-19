import { expect, test } from '@playwright/test'

import { assertMobileViewport } from '../helpers/e1-layout'
import { memberStatsPath, saisonEventPath, saisonWorkspacePath } from '../helpers/e1-routes'
import type { E1CutoverFixture } from '../helpers/e2e-api'
import { expectActiviteJournalReady, openEventTab, prepareE2ePage } from '../helpers/e1.ui'
import { isStagingE2e } from '../helpers/e1-staging'
import {
  discoverMigrationMaliceContext,
  requiredMigrationMemberSlug,
} from '../helpers/migration-malice'
import {
  expectMemberMigrationStats,
  expectSeasonAgendaLoaded,
  openSeasonHistoryView,
} from '../helpers/migration-malice.ui'

const describeMigration = isStagingE2e() ? test.describe : test.describe.skip

describeMigration('MIG E2E — consultation Malice (mobile, staging)', () => {
  test.beforeEach(async ({ page }) => {
    await prepareE2ePage(page)
  })

  test('MIG-E2E-001 — agenda saison + déplacement consultable', async ({ page, request }) => {
    const memberSlug = requiredMigrationMemberSlug()
    const fx = await discoverMigrationMaliceContext(request, memberSlug)
    await assertMobileViewport(page)

    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await expectSeasonAgendaLoaded(page)

    await page.goto(
      saisonEventPath(fx.troupeSlug, fx.seasonSlug, fx.deplacementEventSlug),
    )
    await expect(page.locator('app-event-detail')).toBeVisible({ timeout: 45_000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(fx.deplacementEventTitle, {
      timeout: 15_000,
    })
  })

  test('MIG-E2E-002 — historique + onglet Activité sans erreur', async ({ page, request }) => {
    const memberSlug = requiredMigrationMemberSlug()
    const fx = await discoverMigrationMaliceContext(request, memberSlug)
    await assertMobileViewport(page)

    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await openSeasonHistoryView(page)
    await expect(page.locator('.agenda-card').first()).toBeVisible({ timeout: 30_000 })

    await openEventTab(
      page,
      { troupeSlug: fx.troupeSlug, seasonSlug: fx.seasonSlug } as E1CutoverFixture,
      fx.archivedEventSlug,
      'activite',
    )
    await expectActiviteJournalReady(page)
    const entries = page.locator('.audit-journal-list__entry')
    const empty = page.locator('.audit-journal-list__message')
    await expect(entries.first().or(empty)).toBeVisible({ timeout: 30_000 })
  })

  test('MIG-E2E-003 — Mes Stats KPIs (golden Patrice)', async ({ page, request }) => {
    const memberSlug = requiredMigrationMemberSlug()
    await discoverMigrationMaliceContext(request, memberSlug)
    await assertMobileViewport(page)

    await page.goto(memberStatsPath(memberSlug))
    await expect(page.locator('h1.member-glance-page__title')).toContainText('Mes Stats', {
      timeout: 45_000,
    })
    await expectMemberMigrationStats(page)
  })
})
