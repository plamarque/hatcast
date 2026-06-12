import { expect, test } from '@playwright/test'

import { assertMobileViewport, assertNoHorizontalOverflow } from '../helpers/e1-layout'
import { anyMemberProfileUrlPattern, seasonWorkspaceUrlPattern } from '../helpers/e1-routes'
import { prepareE1Run, resolveE1Context } from '../helpers/e1-staging'
import {
  expectTroupeHubDashboardSections,
  expectTroupeHubLegacyChromeAbsent,
  expectTroupeHubMetricTiles,
  expectTroupeHubPersonnesStrip,
  gotoTroupeHub,
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
})
