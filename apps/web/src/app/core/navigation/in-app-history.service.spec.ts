import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { NavigationEnd, provideRouter, Router } from '@angular/router'
import { filter, firstValueFrom } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { InAppHistoryService } from './in-app-history.service'

@Component({ template: '' })
class Blank {}

describe('InAppHistoryService', () => {
  let router: Router
  let location: Location
  let service: InAppHistoryService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLocationMocks(),
        provideRouter([
          { path: 'saison/:seasonSlug/event/:eventSlug', component: Blank },
          { path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug', component: Blank },
          { path: 'agenda', component: Blank },
          { path: 'accueil', component: Blank },
        ]),
      ],
    })
    router = TestBed.inject(Router)
    location = TestBed.inject(Location)
    service = TestBed.inject(InAppHistoryService)
    router.setUpLocationChangeListener()
  })

  function nextNavigationEnd(): Promise<unknown> {
    return firstValueFrom(router.events.pipe(filter((event) => event instanceof NavigationEnd)))
  }

  async function popBack(): Promise<void> {
    const done = nextNavigationEnd()
    location.back()
    await done
  }

  it('reports no history on the entry page', async () => {
    await router.navigateByUrl('/agenda')

    expect(service.canGoBack()).toBe(false)
  })

  it('reports no history after a legacy redirect with replaceUrl', async () => {
    await router.navigateByUrl('/saison/ete/event/impro')
    await router.navigate(['/saison', 'troupe', 'ete', 'event', 'impro'], { replaceUrl: true })

    expect(service.canGoBack()).toBe(false)
  })

  it('reports history after a push navigation', async () => {
    await router.navigateByUrl('/agenda')
    await router.navigateByUrl('/saison/troupe/ete/event/impro')

    expect(service.canGoBack()).toBe(true)
  })

  it('keeps history after a redirect that follows a push navigation', async () => {
    await router.navigateByUrl('/agenda')
    await router.navigateByUrl('/saison/ete/event/impro')
    await router.navigate(['/saison', 'troupe', 'ete', 'event', 'impro'], { replaceUrl: true })

    expect(service.canGoBack()).toBe(true)
  })

  it('ignores a navigation to the current URL', async () => {
    await router.navigateByUrl('/agenda')
    await router.navigateByUrl('/agenda', { onSameUrlNavigation: 'reload' })

    expect(service.canGoBack()).toBe(false)
  })

  it('ignores skipLocationChange navigations', async () => {
    await router.navigateByUrl('/agenda')
    await router.navigateByUrl('/accueil', { skipLocationChange: true })

    expect(service.canGoBack()).toBe(false)
  })

  it('restores the depth of the entry reached with the browser back button', async () => {
    await router.navigateByUrl('/agenda')
    await router.navigateByUrl('/accueil')
    await router.navigateByUrl('/saison/troupe/ete/event/impro')

    await popBack()
    expect(router.url).toBe('/accueil')
    expect(service.canGoBack()).toBe(true)

    await popBack()
    expect(router.url).toBe('/agenda')
    expect(service.canGoBack()).toBe(false)
  })

  it('restores the depth stored in the history entry after a reload', async () => {
    location.replaceState('/accueil', '', { navigationId: 3, inAppHistoryDepth: 1 })

    const done = nextNavigationEnd()
    router.initialNavigation()
    await done

    expect(router.url).toBe('/accueil')
    expect(service.canGoBack()).toBe(true)
  })
})
