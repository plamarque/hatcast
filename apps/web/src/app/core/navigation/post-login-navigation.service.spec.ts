import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../auth/auth-api.service'
import type { SeasonResponse } from '../seasons/season-api.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { rememberLastMemberEntryPath } from './last-member-entry-path-storage'
import { rememberLastVisitedSeasonSlug } from './last-visited-league-storage'
import { PostLoginNavigationService } from './post-login-navigation.service'
import { rememberPendingPostLoginRedirect } from './post-login-redirect-storage'

describe('PostLoginNavigationService', () => {
  let resolver: { resolveSeasonSlug: ReturnType<typeof vi.fn> }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    localStorage.clear()
    resolver = { resolveSeasonSlug: vi.fn() }
    auth = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { user: { slug: 'alice' } },
      }),
    }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        PostLoginNavigationService,
        { provide: TroupeSeasonResolverService, useValue: resolver },
        { provide: AuthApiService, useValue: auth },
      ],
    })
  })

  afterEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
  })

  it('routes to /agenda when no stored slug or redirect', async () => {
    const url = await service().resolveAuthenticatedEntryUrl()
    expect(url).toEqual(['/agenda'])
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('routes to pending deep link without clearing before navigation', async () => {
    rememberPendingPostLoginRedirect('/saison/festibask/event/abc?showConfirm=true')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toBe('/saison/festibask/event/abc?showConfirm=true')
    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBe(
      '/saison/festibask/event/abc?showConfirm=true',
    )
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

  it('prefers pending redirect over last visited slug', async () => {
    rememberPendingPostLoginRedirect('/agenda')
    rememberLastVisitedSeasonSlug('festibask')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toBe('/agenda')
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('prefers pending redirect over last member entry path', async () => {
    rememberPendingPostLoginRedirect('/agenda')
    rememberLastMemberEntryPath('/accueil')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toBe('/agenda')
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('routes to /accueil when last member entry path is /accueil', async () => {
    rememberLastMemberEntryPath('/accueil')
    rememberLastVisitedSeasonSlug('festibask')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/accueil'])
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('routes to /agenda when last member entry path is /agenda', async () => {
    rememberLastMemberEntryPath('/agenda')
    rememberLastVisitedSeasonSlug('festibask')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('routes to /saison/:slug from last member entry path when resolver resolves', async () => {
    rememberLastMemberEntryPath('/saison/festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask' } as SeasonResponse,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(resolver.resolveSeasonSlug).toHaveBeenCalledWith('festibask')
    expect(url).toEqual(['/saison', 'festibask'])
  })

  it('clears stale last member entry path when season slug does not resolve', async () => {
    rememberLastMemberEntryPath('/saison/stale')
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(localStorage.getItem('lastMemberEntryPath')).toBeNull()
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
  })

  it('routes to own /membre/:slug when session slug matches', async () => {
    rememberLastMemberEntryPath('/membre/alice')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(auth.ensureHatcastSession).toHaveBeenCalled()
    expect(url).toEqual(['/membre', 'alice'])
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('falls through when /membre slug does not match session user', async () => {
    rememberLastMemberEntryPath('/membre/bob')
    rememberLastVisitedSeasonSlug('festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask' } as SeasonResponse,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/saison', 'festibask'])
    expect(localStorage.getItem('lastMemberEntryPath')).toBeNull()
  })

  it('routes to /agenda and clears storage when slug does not resolve', async () => {
    rememberLastVisitedSeasonSlug('stale')
    rememberLastMemberEntryPath('/saison/stale')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
    expect(localStorage.getItem('lastMemberEntryPath')).toBeNull()
  })

  it('routes to /agenda and clears storage when slug is ambiguous', async () => {
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'ambiguous', matches: [] })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
  })

  it('routes to /agenda and clears storage when slug has no membership', async () => {
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'no-membership' })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
  })

  it('routes to /agenda and clears storage when resolver throws', async () => {
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockRejectedValue(new Error('Network error'))

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
  })

  it('ignores invalid pending redirect and falls through to /agenda', async () => {
    localStorage.setItem('hatcast.postLoginRedirect', 'https://evil.example/phish')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBeNull()
  })

  it('navigateAfterSignIn uses navigateByUrl for deep links with query params', async () => {
    rememberPendingPostLoginRedirect('/saison/festibask/event/abc?showConfirm=true')
    const router = TestBed.inject(Router)
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    await service().navigateAfterSignIn(router)

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/saison/festibask/event/abc?showConfirm=true', {
      replaceUrl: true,
    })
    expect(navigateSpy).not.toHaveBeenCalled()
    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBeNull()
  })

  it('keeps pending deep link when navigateByUrl fails', async () => {
    rememberPendingPostLoginRedirect('/saison/festibask/event/abc?showConfirm=true')
    const router = TestBed.inject(Router)
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(false)

    await service().navigateAfterSignIn(router)

    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBe(
      '/saison/festibask/event/abc?showConfirm=true',
    )
  })

  it('navigateAfterSignIn uses replaceUrl for /agenda fallback', async () => {
    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    await service().navigateAfterSignIn(router)

    expect(navigateSpy).toHaveBeenCalledWith(['/agenda'], { replaceUrl: true })
  })
})

function service(): PostLoginNavigationService {
  return TestBed.inject(PostLoginNavigationService)
}
