import { expect, test } from '@playwright/test'

import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import { expectDisposPollReady } from '../helpers/dispos-poll.ui'
import {
  expectSeasonHistoryLatestEvent,
  expectUserAgendaReady,
  openEventTab,
} from '../helpers/e1.ui'
import { saisonWorkspacePath } from '../helpers/e1-routes'
import { isStagingE2e, prepareE1Run, resolveE1Context } from '../helpers/e1-staging'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test.describe('E1 — membre agenda & dispos (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-001 — agenda lists MVP events', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    if (isStagingE2e()) {
      await page.goto('/agenda')
      await expectUserAgendaReady(page)
      const upcomingTitle = fx.agendaUpcomingEventTitle?.trim()
      if (upcomingTitle) {
        await expect(
          page.getByRole('button', {
            name: new RegExp(`^Ouvrir ${escapeRegExp(upcomingTitle)}`, 'i'),
          }),
        ).toBeVisible({ timeout: 30_000 })
      } else {
        await expect(page.getByRole('heading', { name: /Aucun spectacle à venir/i })).toBeVisible({
          timeout: 30_000,
        })
      }

      const historyTitle = fx.seasonHistoryLatestTitle?.trim()
      expect(historyTitle, 'staging discovery must resolve season history anchor').toBeTruthy()
      await page.goto(`${saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug)}?view=history`)
      await expectSeasonHistoryLatestEvent(page, historyTitle!)
    } else {
      await page.goto('/agenda')
      await expect(page.getByText(fx.eventDrawTitle, { exact: false })).toBeVisible({
        timeout: 30_000,
      })
    }
    await assertNoHorizontalOverflow(page)
  })

  test('E1-MEM-004 — season workspace opens', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await page.goto(saisonWorkspacePath(fx.troupeSlug, fx.seasonSlug))
    await expect(page.locator('app-season-header')).toBeVisible({ timeout: 30_000 })
  })

  test('E1-MEM-010–012 — dispos and équipe tabs on event', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await openEventTab(page, fx, fx.eventDrawSlug, 'dispos')
    await expectDisposPollReady(page)

    await openEventTab(page, fx, fx.eventDrawSlug, 'equipe')
    await expect(page.locator('app-event-equipe-tab')).toBeVisible()
    await assertNoHorizontalOverflow(page)
  })

  test('E1-MOB-002 — event tabs including Activité are tappable', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)
    await openEventTab(page, fx, fx.eventActiviteSlug, 'activite')
    await assertNoHorizontalOverflow(page)
  })
})
