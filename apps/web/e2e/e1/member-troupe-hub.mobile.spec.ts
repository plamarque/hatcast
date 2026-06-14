import { expect, test } from '@playwright/test'

import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import {
  anyMemberProfileUrlPattern,
  saisonEventPath,
  seasonWorkspaceUrlPattern,
} from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'
import {
  clickTroupeHubSeasonChartBlock,
  countPastStatisticsEvents,
  expectTroupeHubDashboardSections,
  expectTroupeHubLegacyChromeAbsent,
  expectTroupeHubMetricTiles,
  expectTroupeHubPersonnesStrip,
  expectTroupeHubSeasonChartStatusBlocks,
  expectTroupeHubSeasonChartVisible,
  fetchSeasonStatisticsEvents,
  gotoTroupeHub,
  newestPastStatisticsEvent,
  openTroupeHubSeasonStatsFromChart,
  openTroupeHubTeaserWorkspace,
} from '../helpers/troupe-hub.ui'

/** Story 17.42 — hub dashboard collectif (complète E1-MEM-040 nav shell). */
test.describe('E1 — membre hub Ma troupe dashboard (mobile)', () => {
  test.beforeEach(async ({ page, request }) => {
    await prepareE1Run(page, request)
  })

  test('E1-MEM-043 — dashboard saison : tuiles Spectacles · Compos · Personnes', async ({
    page,
    request,
  }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)

    await gotoTroupeHub(page, fx.troupeSlug)
    await expectTroupeHubDashboardSections(page)
    await expectTroupeHubMetricTiles(page)
    await expectTroupeHubLegacyChromeAbsent(page)
    await assertNoHorizontalOverflow(page)
  })

  test('E1-MEM-044 — section Personnes : avatars ou overflow +N', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)

    await gotoTroupeHub(page, fx.troupeSlug)
    await expectTroupeHubDashboardSections(page)
    await expectTroupeHubPersonnesStrip(page)

    const personnesSection = page.locator('.troupe-hub__section').filter({
      has: page.getByRole('heading', { name: 'Personnes', exact: true }),
    })
    const enabledAvatar = personnesSection.locator('.troupe-hub__avatar-btn:not([disabled])').first()
    const overflow = personnesSection.locator('.troupe-hub__avatar-overflow').first()
    if ((await enabledAvatar.count()) > 0) {
      await enabledAvatar.click()
      await expect(page).toHaveURL(anyMemberProfileUrlPattern(), { timeout: 30_000 })
      return
    }
    if ((await overflow.count()) > 0) {
      await overflow.click()
      await expect(page).toHaveURL(seasonWorkspaceUrlPattern(fx.troupeSlug, fx.seasonSlug), {
        timeout: 30_000,
      })
    }
  })

  test('E1-MEM-045 — teaser Prochains spectacles → Voir tous les spectacles', async ({
    page,
    request,
  }) => {
    const fx = await resolveE1Context(request)
    await assertMobileViewport(page)

    await gotoTroupeHub(page, fx.troupeSlug)
    await expectTroupeHubDashboardSections(page)

    const teaserSection = page.locator('.troupe-hub__section').filter({
      has: page.getByRole('heading', { name: 'Prochains spectacles', exact: true }),
    })
    const emptyTeaser = teaserSection.getByText('Aucun spectacle à venir cette saison.')
    if ((await emptyTeaser.count()) > 0) {
      await expect(
        teaserSection.getByRole('link', { name: 'Voir tous les spectacles', exact: true }),
      ).toHaveCount(0)
      return
    }

    const agendaCards = teaserSection.locator('.agenda-card')
    const cardCount = await agendaCards.count()
    expect(cardCount).toBeGreaterThan(0)
    expect(cardCount).toBeLessThanOrEqual(3)

    await openTroupeHubTeaserWorkspace(page, fx.troupeSlug, fx.seasonSlug)
    await assertNoHorizontalOverflow(page)
  })

  test('E1-MEM-046 — mini-chart saison sous les tuiles métriques', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    const statsEvents = await fetchSeasonStatisticsEvents(request, fx.seasonId)
    test.skip(
      countPastStatisticsEvents(statsEvents) < 3,
      'Season has fewer than 3 past events — mini-chart hidden (MT15 threshold)',
    )

    await assertMobileViewport(page)
    await gotoTroupeHub(page, fx.troupeSlug)
    await expectTroupeHubDashboardSections(page)
    await expectTroupeHubMetricTiles(page)
    await expectTroupeHubSeasonChartVisible(page)
    await expectTroupeHubSeasonChartStatusBlocks(page)
    await assertNoHorizontalOverflow(page)
  })

  test('E1-MEM-047 — CTA Voir toutes les stats → grille stats saison', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    const statsEvents = await fetchSeasonStatisticsEvents(request, fx.seasonId)
    test.skip(
      countPastStatisticsEvents(statsEvents) < 3,
      'Season has fewer than 3 past events — stats CTA not shown',
    )

    await assertMobileViewport(page)
    await gotoTroupeHub(page, fx.troupeSlug)
    await expectTroupeHubDashboardSections(page)
    await expectTroupeHubSeasonChartVisible(page)
    await openTroupeHubSeasonStatsFromChart(page, fx.troupeSlug, fx.seasonSlug)
  })

  test('E1-MEM-048 — bloc mini-chart → détail spectacle', async ({ page, request }) => {
    const fx = await resolveE1Context(request)
    const statsEvents = await fetchSeasonStatisticsEvents(request, fx.seasonId)
    test.skip(
      countPastStatisticsEvents(statsEvents) < 3,
      'Season has fewer than 3 past events — mini-chart hidden',
    )
    const pastEvent = newestPastStatisticsEvent(statsEvents)
    test.skip(!pastEvent?.slug, 'No past event slug available for navigation')

    await assertMobileViewport(page)
    await gotoTroupeHub(page, fx.troupeSlug)
    await expectTroupeHubDashboardSections(page)
    await expectTroupeHubSeasonChartVisible(page)
    await clickTroupeHubSeasonChartBlock(page, pastEvent!.title)
    await expect(page).toHaveURL(
      saisonEventPath(fx.troupeSlug, fx.seasonSlug, pastEvent!.slug),
      { timeout: 30_000 },
    )
    await expect(page.locator('app-event-detail')).toBeVisible({ timeout: 30_000 })
  })
})
