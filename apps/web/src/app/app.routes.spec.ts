import { TestBed } from '@angular/core/testing'
import { provideRouter, Router, type Route } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'

import { routes } from './app.routes'
import { AdminMembres } from './pages/admin-membres/admin-membres'
import { AdminParticipants } from './pages/admin-participants/admin-participants'
import { EventDetail } from './pages/event-detail/event-detail'
import { SeasonHome } from './pages/season-home/season-home'

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

  it.each([
    { url: '/ligue/test-slug', component: SeasonHome },
    { url: '/ligue/test-slug/admin/membres', component: AdminMembres },
    { url: '/ligue/test-slug/admin/participants', component: AdminParticipants },
    { url: '/ligue/test-slug/event/event-1', component: EventDetail },
  ])('resolves $url to the expected component', async ({ url, component }) => {
    const router = TestBed.inject(Router)
    await router.navigateByUrl(url)
    expect(router.url).toBe(url)
    expect(activatedComponent(router)).toBe(component)
  })

  it.each([
    { url: '/saison/test-slug', component: SeasonHome },
    { url: '/saison/test-slug/admin/membres', component: AdminMembres },
    { url: '/saison/test-slug/admin/participants', component: AdminParticipants },
    { url: '/saison/test-slug/event/event-1', component: EventDetail },
  ])('keeps /saison alias resolving $url to the same component', async ({ url, component }) => {
    const router = TestBed.inject(Router)
    await router.navigateByUrl(url)
    expect(router.url).toBe(url)
    expect(activatedComponent(router)).toBe(component)
  })
})
