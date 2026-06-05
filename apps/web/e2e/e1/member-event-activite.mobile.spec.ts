import { expect, test } from '@playwright/test'

import { assertMobileViewport } from '../helpers/e1-layout'
import {
  expectActiviteJournalReady,
  openEventTab,
  seedMemberDisposForActivite,
} from '../helpers/e1.ui'
import { isStagingE2e, prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe('E1 — membre activité spectacle (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-022 — Activité tab journal (mode Moi)', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    const eventSlug = fx.eventActiviteSlug
    await assertMobileViewport(page)

    if (isStagingE2e()) {
      await seedMemberDisposForActivite(page, fx, eventSlug)
    }

    await openEventTab(page, fx, eventSlug, 'activite')
    await expectActiviteJournalReady(page)
    const entries = page.locator('.audit-journal-list__entry')
    const empty = page.locator('.audit-journal-list__message')
    await expect(entries.first().or(empty)).toBeVisible({ timeout: 30_000 })
  })
})
