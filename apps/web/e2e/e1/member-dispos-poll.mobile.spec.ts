import { expect, test } from '@playwright/test'

import {
  expandPollRowPoolWithChances,
  expectDisposPollReady,
  isCompositionEntityRequest,
  pollCheckbox,
  pollRowCounter,
  pollRowPoolSegments,
  seedMemberDisposRoles,
  tapFirstPoolSegmentAndOpenBreakdown,
} from '../helpers/dispos-poll.ui'
import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import { openEventTab } from '../helpers/e1.ui'
import { isStagingE2e, prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

test.describe('E1 — membre dispos poll (mobile, story 5.8)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-030 — unified poll loads on Dispos tab', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await openEventTab(page, fx, fx.eventDrawSlug, 'dispos')
    await expectDisposPollReady(page)
    await expect(pollCheckbox(page, 'Pas disponible')).toBeVisible()
    await expect(pollCheckbox(page, /^Comédien/)).toBeVisible()
    await expect(pollCheckbox(page, /^MC$/)).toBeVisible()
    await expect(pollCheckbox(page, /^DJ$/)).toBeVisible()
    await assertNoHorizontalOverflow(page)
  })

  test('E1-MEM-031 — poll counters reflect availability changes', async ({ page, request }) => {
    test.skip(isStagingE2e(), 'Requires deterministic E1 fixture reset (local e2e profile)')
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await openEventTab(page, fx, fx.eventDrawSlug, 'dispos')
    await expectDisposPollReady(page)

    await seedMemberDisposRoles(page, fx, fx.eventDrawSlug, ['player', 'mc'])
    await page.reload()
    await expectDisposPollReady(page)
    await expect(pollRowCounter(page, /^DJ$/)).toHaveText('5/1')

    await seedMemberDisposRoles(page, fx, fx.eventDrawSlug, ['player', 'mc', 'dj'])
    await page.reload()
    await expectDisposPollReady(page)
    await expect(pollRowCounter(page, /^DJ$/)).toHaveText('6/1')
    await expect(pollCheckbox(page, /^DJ$/)).toBeChecked()
  })

  test('E1-MEM-032 — role vote persists after reload', async ({ page, request }) => {
    test.skip(isStagingE2e(), 'Requires deterministic E1 fixture reset (local e2e profile)')
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await seedMemberDisposRoles(page, fx, fx.eventDrawSlug, ['player', 'mc', 'dj'])
    await openEventTab(page, fx, fx.eventDrawSlug, 'dispos')
    await expectDisposPollReady(page)
    await expect(pollCheckbox(page, /^DJ$/)).toBeChecked()

    await page.reload()
    await expectDisposPollReady(page)
    await expect(pollCheckbox(page, /^DJ$/)).toBeChecked()
  })
})

test.describe('E1 — membre dispos pool explainability (mobile, story 5.9)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-033 — DJ pool chances and breakdown without visiting Équipe', async ({
    page,
    request,
  }) => {
    const fx = await resolveE1Context(request)
    const compositionEntityGets: string[] = []
    page.on('request', (req) => {
      if (isCompositionEntityRequest(req.url(), req.method())) {
        compositionEntityGets.push(req.url())
      }
    })

    await assertMobileViewport(page)
    await openEventTab(page, fx, fx.eventDrawSlug, 'dispos')
    await expectDisposPollReady(page)

    await expandPollRowPoolWithChances(page, /^DJ$/)
    await expect(pollRowPoolSegments(page, /^DJ$/)).not.toHaveCount(0)
    await tapFirstPoolSegmentAndOpenBreakdown(page, /^DJ$/)

    expect(compositionEntityGets).toEqual([])
  })
})
