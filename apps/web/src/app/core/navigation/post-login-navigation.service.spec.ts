import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../auth/auth-api.service'
import { MemberShellBootstrapService } from '../member-shell/member-shell-bootstrap.service'
import type { SeasonResponse } from '../seasons/season-api.service'
import { TroupeContextService } from '../troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { rememberLastMemberEntryPath } from './last-member-entry-path-storage'
import { rememberLastVisitedSeasonSlug } from './last-visited-season-storage'
import { PostLoginNavigationService } from './post-login-navigation.service'
import { rememberPendingPostLoginRedirect } from './post-login-redirect-storage'

describe('PostLoginNavigationService', () => {
  let resolver: {
    resolveSeasonSlug: ReturnType<typeof vi.fn>
    resolveSeasonInTroupe: ReturnType<typeof vi.fn>
  }
  let memberBootstrap: { invalidate: ReturnType<typeof vi.fn> }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> }

  const resolvedTroupe = { id: 't1', name: 'Troupe', slug: 'la-malice' }
  const resolvedSeason = { id: 's1', slug: 'festibask' } as SeasonResponse

  beforeEach(() => {
    localStorage.clear()
    resolver = {
      resolveSeasonSlug: vi.fn(),
      resolveSeasonInTroupe: vi.fn().mockResolvedValue({
        kind: 'resolved',
        troupe: resolvedTroupe,
        season: resolvedSeason,
      }),
    }
    memberBootstrap = { invalidate: vi.fn() }
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
        { provide: MemberShellBootstrapService, useValue: memberBootstrap },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            activeTroupes: () => [],
          },
        },
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

  it('routes to pending deep link when season resolves', async () => {
    rememberPendingPostLoginRedirect('/saison/festibask/event/abc?showConfirm=true')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toBe('/saison/festibask/event/abc?showConfirm=true')
    expect(resolver.resolveSeasonSlug).toHaveBeenCalledWith('festibask')
    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBe(
      '/saison/festibask/event/abc?showConfirm=true',
    )
  })

  it('falls through to /agenda when pending season deep link does not resolve', async () => {
    rememberPendingPostLoginRedirect('/saison/stale?view=agenda')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/agenda'])
    expect(resolver.resolveSeasonSlug).toHaveBeenCalledWith('stale')
    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBeNull()
  })

  it('routes to canonical /saison/:troupe/:season when resolver resolves', async () => {
    rememberLastVisitedSeasonSlug('festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(resolver.resolveSeasonSlug).toHaveBeenCalledWith('festibask')
    expect(url).toEqual(['/saison', 'la-malice', 'festibask'])
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

  it('routes to canonical saison from last member entry path when resolver resolves', async () => {
    rememberLastMemberEntryPath('/saison/festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(resolver.resolveSeasonSlug).toHaveBeenCalledWith('festibask')
    expect(url).toEqual(['/saison', 'la-malice', 'festibask'])
  })

  it('routes to canonical saison from stored canonical member entry path without resolver', async () => {
    rememberLastMemberEntryPath('/saison/la-malice/festibask')

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
    expect(url).toEqual(['/saison', 'la-malice', 'festibask'])
  })

  it('accepts canonical pending deep link without resolver', async () => {
    rememberPendingPostLoginRedirect(
      '/saison/la-malice/festibask/event/abc?showConfirm=true',
    )

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
    expect(url).toBe('/saison/la-malice/festibask/event/abc?showConfirm=true')
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
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })

    const url = await service().resolveAuthenticatedEntryUrl()

    expect(url).toEqual(['/saison', 'la-malice', 'festibask'])
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
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })
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
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })
    const router = TestBed.inject(Router)
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(false)

    await service().navigateAfterSignIn(router)

    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBe(
      '/saison/festibask/event/abc?showConfirm=true',
    )
  })

  it('mutex navigateAfterSignIn — une seule navigation pour deux appels concurrents', async () => {
    rememberPendingPostLoginRedirect('/saison/festibask/event/abc?showConfirm=true')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: resolvedTroupe,
      season: resolvedSeason,
    })
    const router = TestBed.inject(Router)
    let resolveNavigate: (value: boolean) => void
    const navigatePromise = new Promise<boolean>((resolve) => {
      resolveNavigate = resolve
    })
    const navigateByUrlSpy = vi
      .spyOn(router, 'navigateByUrl')
      .mockReturnValue(navigatePromise as Promise<boolean>)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)

    const svc = service()
    const first = svc.navigateAfterSignIn(router)
    const second = svc.navigateAfterSignIn(router)

    await vi.waitFor(() => {
      expect(navigateByUrlSpy).toHaveBeenCalledTimes(1)
    })
    expect(navigateSpy).not.toHaveBeenCalled()

    resolveNavigate!(true)
    const [r1, r2] = await Promise.all([first, second])

    expect(r1).toBe(true)
    expect(r2).toBe(true)
    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1)
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
