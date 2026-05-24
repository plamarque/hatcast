import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SeasonResponse } from '../seasons/season-api.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { rememberLastVisitedSeasonSlug } from './last-visited-league-storage'
import { PostLoginNavigationService } from './post-login-navigation.service'

describe('PostLoginNavigationService', () => {
  let resolver: { resolveSeasonSlug: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    localStorage.clear()
    resolver = { resolveSeasonSlug: vi.fn() }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        PostLoginNavigationService,
        { provide: TroupeSeasonResolverService, useValue: resolver },
      ],
    })
  })

  afterEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
  })

  it('routes to /seasons when no stored slug', async () => {
    const url = await service().resolveAuthenticatedEntryUrl()
    expect(url).toEqual(['/seasons'])
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('routes to /saison/:slug when resolver resolves', async () => {
    rememberLastVisitedSeasonSlug('festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask' } as SeasonResponse,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(resolver.resolveSeasonSlug).toHaveBeenCalledWith('festibask')
    expect(url).toEqual(['/saison', 'festibask'])
  })

  it('routes to /seasons and clears storage when slug does not resolve', async () => {
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/seasons'])
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
  })

  it('routes to /seasons and clears storage when resolver throws', async () => {
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockRejectedValue(new Error('Network error'))

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/seasons'])
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
  })

  it('navigateAfterSignIn uses replaceUrl', async () => {
    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    await service().navigateAfterSignIn(router)

    expect(navigateSpy).toHaveBeenCalledWith(['/seasons'], { replaceUrl: true })
  })
})

function service(): PostLoginNavigationService {
  return TestBed.inject(PostLoginNavigationService)
}
