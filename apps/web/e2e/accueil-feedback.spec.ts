import { expect, test, type Page } from '@playwright/test'
import type { MeInboxResponse } from '../src/app/core/inbox/me-inbox-api.service'
import type { UserAgendaItem } from '../src/app/core/agenda/user-agenda-api.service'

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
  const state = {
    data: empty, status: 200, requests: 0, release: null as (() => void) | null,
    agenda: [nextEvent] as UserAgendaItem[], agendaStatus: 200,
  }
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
    else if (path === '/v1/me/agenda') {
      if (state.agendaStatus !== 200) {
        await route.fulfill({ status: state.agendaStatus, json: {} })
        return
      }
      body = {
        content: state.agenda,
        page: 0,
        size: 50,
        totalElements: state.agenda.length,
        totalPages: 1,
        filterBarVisible: false,
        noParticipation: false,
      }
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

    test('shows five unchanged cards with natural page scrolling and an agenda link', async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      const state = await prepare(page)
      state.agenda = Array.from({ length: 10 }, (_, index) => ({
        ...nextEvent,
        eventId: `upcoming-${index}`, eventSlug: `upcoming-${index}`,
        title: index === 1 ? 'Un très long titre de spectacle qui occupe plusieurs lignes sur un téléphone' : `Spectacle ${index + 1}`,
        description: index % 2 ? 'Une soirée d’improvisation avec plusieurs équipes réunies pour jouer ensemble.' : null,
        startsAt: `2030-11-${String(index + 1).padStart(2, '0')}T19:00:00Z`,
      }))
      await page.goto('/accueil')
      await release(state)
      await expect(page.getByTestId('todo-caught-up-region')).toHaveCount(0, { timeout: 7000 })
      const cards = page.getByTestId('todo-next-event-card')
      const link = page.getByTestId('todo-upcoming-see-more')
      await expect(cards).toHaveCount(5)
      await expect(cards.nth(1)).toContainText(state.agenda[1].title)
      await expect(page.getByText('Spectacle 6', { exact: true })).toHaveCount(0)
      expect(await cards.evaluateAll(elements => elements.every(element => !element.closest('[inert], [aria-hidden="true"]')))).toBe(true)
      if (viewport.width < 840) {
        await expect(link).not.toBeInViewport()
        expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(viewport.height)
      }
      await page.screenshot({ path: testInfo.outputPath('upcoming-top.png'), animations: 'disabled' })
      await cards.last().locator('.agenda-card__clickable').focus()
      await expect(cards.last().locator('.agenda-card__clickable')).toBeFocused()
      await expect(cards.last()).toBeInViewport()
      await link.scrollIntoViewIfNeeded()
      await expect(link).toBeInViewport()
      if (viewport.width < 840) {
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
        const linkBottom = (await link.boundingBox())!.y + (await link.boundingBox())!.height
        const navTop = (await page.locator('.member-nav__bottom').boundingBox())!.y
        expect(navTop - linkBottom).toBeGreaterThanOrEqual(7)
        expect(navTop - linkBottom).toBeLessThanOrEqual(9)
      }
      const scrolling = await cards.last().evaluate(card => {
        const ancestors: HTMLElement[] = []
        for (let element = card.parentElement; element && element !== document.body; element = element.parentElement) ancestors.push(element)
        return ancestors.map(element => ({
          overflow: getComputedStyle(element).overflowY,
          constrained: element.scrollHeight > element.clientHeight + 1,
          scrollTop: element.scrollTop,
        }))
      })
      expect(scrolling.every(ancestor => ancestor.scrollTop === 0 &&
        !(ancestor.constrained && /auto|scroll/.test(ancestor.overflow)))).toBe(true)
      await page.screenshot({ path: testInfo.outputPath('upcoming-bottom.png'), animations: 'disabled' })
      await page.setViewportSize({ width: viewport.width, height: 350 })
      await expect(cards).toHaveCount(5)
      await page.setViewportSize({ width: viewport.width, height: viewport.height + 500 })
      await expect(cards).toHaveCount(5)
      await link.click()
      await expect(page).toHaveURL(/\/agenda$/)
    })

    test('keeps actions first and scrolls the page to the fifth show on a short viewport', async ({ page }) => {
      const state = await prepare(page)
      state.data = withTask
      state.agenda = Array.from({ length: 8 }, (_, index) => ({ ...nextEvent, eventId: `show-${index}`, eventSlug: `show-${index}` }))
      await page.setViewportSize({ width: viewport.width, height: 350 })
      await page.goto('/accueil')
      await release(state)
      const action = page.getByTestId('todo-action-dispo')
      await expect(action).toBeVisible()
      const cards = page.getByTestId('todo-next-event-card')
      await expect(cards).toHaveCount(5)
      expect((await cards.first().boundingBox())!.y).toBeGreaterThan((await action.boundingBox())!.y)
      await cards.last().scrollIntoViewIfNeeded()
      await expect(cards.last()).toBeInViewport()
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
      const link = page.getByTestId('todo-upcoming-see-more')
      await link.scrollIntoViewIfNeeded()
      await expect(link).toBeInViewport()
      await link.click()
      await expect(page).toHaveURL(/\/agenda$/)
    })

    test('keeps the inbox card and agenda destination if additional shows fail to load', async ({ page }) => {
      const state = await prepare(page)
      state.agendaStatus = 503
      await page.goto('/accueil')
      await release(state)
      await expect(page.getByTestId('todo-next-event-card')).toContainText(nextEvent.title)
      await expect(page.getByTestId('todo-upcoming-see-more')).toHaveAttribute('href', '/agenda')
    })

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
