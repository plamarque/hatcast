import { expect, test } from '@playwright/test'
import { E2E_MEMBER_ID_TOKEN } from './fixtures/e1-cutover.constants'
import { resetE1CutoverFixture, signInWithE2eToken } from './helpers/e2e-api'
import { prepareE2ePage } from './helpers/e1.ui'
import { saisonEventPath } from './helpers/e1-routes'
import { clickTroupeHubSeasonChartBlock, fetchSeasonStatisticsEvents, gotoTroupeHub, newestPastStatisticsEvent, selectTroupeHubSeason } from './helpers/troupe-hub.ui'

test('mobile hub switches from another season to the configured fixture and its event', async ({ page, request, baseURL }) => {
  const fx = await resetE1CutoverFixture(request)
  await prepareE2ePage(page)
  await page.goto('/connexion')
  await signInWithE2eToken(page.request, E2E_MEMBER_ID_TOKEN, baseURL!)
  const troupes = await (await page.request.get('/v1/troupes')).json() as Array<{id: string; slug: string}>
  const troupe = troupes.find(item => item.slug === fx.troupeSlug)!
  const seasons = await (await page.request.get(`/v1/troupes/${troupe.id}/seasons?page=0&size=100`)).json() as {content: Array<{id: string; slug: string; title: string; archived: boolean}>}
  const other = seasons.content.find(item => item.id !== fx.seasonId && !item.archived)!
  expect(other, 'a second accessible non-archived season is required').toBeTruthy()
  await page.evaluate(({id, slug}) => localStorage.setItem('lastVisitedSeasonByTroupe', JSON.stringify({[id]: slug})), {id: troupe.id, slug: other.slug})
  await gotoTroupeHub(page, fx.troupeSlug)
  await expect(page.locator('#troupe-season-dashboard-heading')).toHaveText(other.title)
  await selectTroupeHubSeason(page, page.request, fx.seasonId)
  const events = await fetchSeasonStatisticsEvents(page.request, fx.seasonId)
  const event = newestPastStatisticsEvent(events)
  expect(event, 'fixture must have a chart event').toBeTruthy()
  await clickTroupeHubSeasonChartBlock(page, event!.title)
  await expect(page).toHaveURL(saisonEventPath(fx.troupeSlug, fx.seasonSlug, event!.slug))
  await expect(page.locator('app-event-detail')).toBeVisible()
})

test('rejects ambiguous season titles before selecting', async ({ page }) => {
  const response = (body: unknown) => ({ ok: () => true, json: async () => body })
  const request = {
    get: async (url: string) => url.startsWith('/v1/seasons/')
      ? response({ id: 'fixture', title: 'Identical title', troupeId: 'troupe' })
      : response({ content: [{ id: 'fixture', title: 'Identical title' }, { id: 'other', title: 'Identical title' }], totalPages: 1 }),
  } as unknown as import('@playwright/test').APIRequestContext
  await expect(selectTroupeHubSeason(page, request, 'fixture')).rejects.toThrow(/ambiguous/)
})
