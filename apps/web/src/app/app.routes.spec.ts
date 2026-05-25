import { TestBed } from '@angular/core/testing'
import { provideRouter, Router, type Route } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'

import { routes } from './app.routes'
import { AdminMembres } from './pages/admin-membres/admin-membres'
import { AdminParticipants } from './pages/admin-participants/admin-participants'
import { EventDetail } from './pages/event-detail/event-detail'
import { SeasonHome } from './pages/season-home/season-home'
import { TroupesList } from './pages/troupes-list/troupes-list'

function activatedComponent(router: Router): Route['component'] {
  let route = router.routerState.root
  while (route.firstChild) {
    route = route.firstChild
  }
  return route.routeConfig?.component
}

describe('app.routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    })
  })

  it('redirects /seasons to /troupes', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/seasons')

    expect(router.url).toBe('/troupes')
    expect(activatedComponent(router)).toBe(TroupesList)
  })

  it('redirects /seasons preserving query params', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/seasons?foo=bar&foo=baz')

    expect(router.url).toBe('/troupes?foo=bar&foo=baz')
    expect(activatedComponent(router)).toBe(TroupesList)
  })

  it('redirects /ligue event path preserving query params', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/ligue/test-slug/event/event-1?showConfirm=true')

    expect(router.url).toBe('/saison/test-slug/event/event-1?showConfirm=true')
    expect(activatedComponent(router)).toBe(EventDetail)
  })

  it.each([
    { legacy: '/ligue/test-slug', canonical: '/saison/test-slug', component: SeasonHome },
    {
      legacy: '/ligue/test-slug/admin/membres',
      canonical: '/saison/test-slug/admin/membres',
      component: AdminMembres,
    },
    {
      legacy: '/ligue/test-slug/admin/participants',
      canonical: '/saison/test-slug/admin/participants',
      component: AdminParticipants,
    },
    {
      legacy: '/ligue/test-slug/event/event-1',
      canonical: '/saison/test-slug/event/event-1',
      component: EventDetail,
    },
  ])('redirects $legacy to $canonical', async ({ legacy, canonical, component }) => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl(legacy)

    expect(router.url).toBe(canonical)
    expect(activatedComponent(router)).toBe(component)
  })

  it.each([
    { url: '/saison/test-slug', component: SeasonHome },
    { url: '/saison/test-slug/admin/membres', component: AdminMembres },
    { url: '/saison/test-slug/admin/participants', component: AdminParticipants },
    { url: '/saison/test-slug/event/event-1', component: EventDetail },
  ])('keeps canonical /saison route $url', async ({ url, component }) => {
    const router = TestBed.inject(Router)
    await router.navigateByUrl(url)
    expect(router.url).toBe(url)
    expect(activatedComponent(router)).toBe(component)
  })
})
