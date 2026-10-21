import { expect, test, type Page } from '@playwright/test'
import type { MeInboxResponse } from '../src/app/core/inbox/me-inbox-api.service'

// These checks control API replies; service-worker lifecycle has its own smoke coverage.
test.use({ serviceWorkers: 'block' })

const nextEvent = {
  eventId: 'feedback-event',
  eventSlug: 'feedback-event',
  title: 'Spectacle de recette',
  startsAt: '2030-11-01T19:00:00Z',
  location: 'Salle de recette',
  troupeId: 'feedback-troupe',
  troupeName: 'Troupe de recette',
  troupeSlug: 'recette',
  seasonId: 'feedback-season',
  seasonSlug: 'recette-2030',
  seasonTitle: 'Recette 2030',
  myAvailabilityStatus: 'available' as const,
}
const empty: MeInboxResponse = {
  actions: [],
  nextEvent,
  noParticipation: false,
  shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
}
const withTask: MeInboxResponse = {
  ...empty,
  actions: [
    {
      type: 'availability_unknown',
      eventId: nextEvent.eventId,
      eventSlug: nextEvent.eventSlug,
      title: 'Nouvelle tâche de recette',
      startsAt: nextEvent.startsAt,
      location: nextEvent.location,
      troupeId: nextEvent.troupeId,
      troupeName: nextEvent.troupeName,
      troupeSlug: nextEvent.troupeSlug,
      seasonId: nextEvent.seasonId,
      seasonSlug: nextEvent.seasonSlug,
      seasonTitle: nextEvent.seasonTitle,
      deepLink: '/saison/recette/recette-2030/event/feedback-event?tab=dispos',
    },
  ],
}

async function prepare(page: Page) {
  const state = { data: empty, status: 200, requests: 0, release: null as (() => void) | null }
  await page.addInitScript(
    ({ data }) => {
      localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now()))
      sessionStorage.setItem(
        'hatcast.inbox.cache',
        JSON.stringify({ data, fetchedAt: Date.now(), userId: 'feedback-user' }),
      )
    },
    { data: empty },
  )
  await page.route('**/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    let body: unknown = {}
    if (path === '/v1/me/inbox') {
      state.requests++
      await new Promise<void>((resolve) => {
        state.release = resolve
      })
      await route.fulfill({ status: state.status, json: state.data })
      return
    }
    if (path === '/v1/auth/me')
      body = {
        user: {
          id: 'feedback-user',
          slug: 'recette',
          displayName: 'Recette',
          email: 'recette@example.test',
          avatarUrl: null,
        },
        platformAdmin: false,
      }
    else if (path === '/v1/troupes') body = []
    else if (path === '/v1/me/preferences')
      body = { memberDisplayName: 'Recette', preferredRoleKeys: [] }
    else if (path === '/v1/me/agenda')
      body = {
        content: [nextEvent],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
        filterBarVisible: false,
        noParticipation: false,
      }
    await route.fulfill({ json: body })
  })
  return state
}

async function release(state: Awaited<ReturnType<typeof prepare>>) {
  await expect.poll(() => state.release !== null).toBe(true)
  const done = state.release!
  state.release = null
  done()
}

async function navigate(page: Page, target: '/accueil' | '/agenda') {
  const name = target === '/accueil' ? /^Accueil(?:,.*)?$/ : /^Mon agenda$/
  await page
    .getByRole('tab', { name })
    .or(page.getByRole('link', { name }))
    .filter({ visible: true })
    .click()
  await expect(page).toHaveURL(new RegExp(`${target}$`))
}

for (const viewport of [
  { width: 375, height: 766 },
  { width: 1280, height: 900 },
]) {
  test.describe(`Accueil feedback ${viewport.width}px`, () => {
    test.use({ viewport })

    test('reserves skeleton geometry, collapses confirmation, and replays only after tasks', async ({
      page,
    }) => {
      const state = await prepare(page)
      await page.goto('/accueil')
      const pending = page.locator('.member-home-todo__celebration--pending')
      const region = page.getByTestId('todo-caught-up-region')
      const next = page.getByTestId('todo-next-event-card')
      await expect(pending).toBeVisible()
      await expect(region).toHaveAttribute('aria-hidden', 'true')
      await expect.poll(() => next.boundingBox().then((box) => box?.height ?? 0)).toBeGreaterThan(0)
      await page.evaluate(() => document.fonts.ready)
      const before = (await next.boundingBox())!.y
      const skeletonHeight = (await region.boundingBox())!.height
      await release(state)
      await expect(pending).toHaveCount(0)
      await expect(region).toBeVisible()
      expect(Math.abs((await next.boundingBox())!.y - before)).toBeLessThan(1)
      expect(Math.abs((await region.boundingBox())!.height - skeletonHeight)).toBeLessThan(1)
      await expect(region).toHaveClass(/feedback--collapsing/, { timeout: 6000 })
      await expect
        .poll(
          async () => {
            const height = (await region.boundingBox())?.height ?? 0
            return height > 0 && height < skeletonHeight - 1
          },
          { intervals: [20, 20, 20] },
        )
        .toBe(true)
      await expect(region).toHaveCount(0)
      expect(Math.abs((await next.boundingBox())!.y - (before - skeletonHeight))).toBeLessThan(1)

      await navigate(page, '/agenda')
      await navigate(page, '/accueil')
      await expect.poll(() => state.release !== null).toBe(true)
      await expect(region).toHaveCount(0)
      await release(state)
      await expect(region).toHaveCount(0)

      await navigate(page, '/agenda')
      state.data = withTask
      await navigate(page, '/accueil')
      await release(state)
      await expect(page.getByTestId('todo-action-dispo')).toBeVisible()
      await expect(region).toHaveCount(0)

      await navigate(page, '/agenda')
      state.data = empty
      await navigate(page, '/accueil')
      await release(state)
      await expect(page.getByTestId('todo-action-dispo')).toHaveCount(0)
      await expect(region).toBeVisible()
      expect(state.requests).toBe(4)
    })

    test('retains the no-upcoming-event destination during revalidation and failure', async ({
      page,
    }) => {
      const state = await prepare(page)
      state.data = { ...empty, nextEvent: null }
      await page.goto('/accueil')
      await release(state)
      const link = page.getByRole('link', { name: 'Mes troupes', exact: true })
      await expect(link).toBeVisible()
      await link.focus()
      await expect(link).toBeFocused()
      await navigate(page, '/agenda')
      state.status = 500
      await navigate(page, '/accueil')
      await expect.poll(() => state.release !== null).toBe(true)
      await expect(link).toBeVisible()
      await expect(page.getByTestId('todo-caught-up-region')).not.toHaveAttribute('aria-hidden')
      await release(state)
      await expect(link).toBeVisible()
      await link.focus()
      await expect(link).toBeFocused()
    })

    test('does not confirm an empty cache after a failed refresh', async ({ page }) => {
      const state = await prepare(page)
      state.status = 500
      await page.goto('/accueil')
      await expect(page.locator('.member-home-todo__celebration--pending')).toBeVisible()
      await release(state)
      await expect(page.getByTestId('todo-caught-up-region')).toHaveCount(0)
      await expect(page.locator('p[role="status"]')).toHaveText('')
      await expect(page.getByTestId('todo-next-event-card')).toBeVisible()
    })
  })
}
