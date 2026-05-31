import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SeasonResponse } from '../seasons/season-api.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { rememberLastVisitedSeasonSlug } from './last-visited-season-storage'
import { LastVisitedSeasonShortcutService } from './last-visited-season-shortcut.service'

describe('LastVisitedSeasonShortcutService', () => {
  let resolver: { resolveSeasonSlug: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    localStorage.clear()
    resolver = { resolveSeasonSlug: vi.fn() }
    TestBed.configureTestingModule({
      providers: [
        LastVisitedSeasonShortcutService,
        { provide: TroupeSeasonResolverService, useValue: resolver },
      ],
    })
  })

  afterEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
  })

  function service(): LastVisitedSeasonShortcutService {
    return TestBed.inject(LastVisitedSeasonShortcutService)
  }

  it('links to troupes with fallback label when no slug is stored', async () => {
    await service().refresh()
    expect(service().link()).toEqual(['/', 'troupes'])
    expect(service().label()).toBe('Choisir une saison')
    expect(service().linkTarget()).toBe('troupes')
    expect(resolver.resolveSeasonSlug).not.toHaveBeenCalled()
  })

  it('links to saison workspace when slug resolves', async () => {
    rememberLastVisitedSeasonSlug('festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask', title: 'Ligue 2026' } as SeasonResponse,
    })

    await service().refresh()

    expect(service().link()).toEqual(['/saison', 'festibask'])
    expect(service().label()).toBe('Ligue 2026')
    expect(service().ariaLabel()).toBe('Ma saison : Ligue 2026')
    expect(service().linkTarget()).toBe('season')
    expect(localStorage.getItem('lastVisitedSeason')).toBe('festibask')
  })

  it('falls back to troupes without clearing slug when resolver returns not-found', async () => {
    rememberLastVisitedSeasonSlug('stale')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'not-found' })

    await service().refresh()

    expect(service().link()).toEqual(['/', 'troupes'])
    expect(service().label()).toBe('Choisir une saison')
    expect(localStorage.getItem('lastVisitedSeason')).toBe('stale')
  })

  it('falls back to troupes on ambiguous resolution', async () => {
    rememberLastVisitedSeasonSlug('dup')
    resolver.resolveSeasonSlug.mockResolvedValue({ kind: 'ambiguous', matches: [] })

    await service().refresh()

    expect(service().linkTarget()).toBe('troupes')
    expect(localStorage.getItem('lastVisitedSeason')).toBe('dup')
  })

  it('applies only the latest refresh when calls overlap', async () => {
    rememberLastVisitedSeasonSlug('festibask')
    let resolveFirst: (value: unknown) => void
    const first = new Promise((resolve) => {
      resolveFirst = resolve
    })
    resolver.resolveSeasonSlug
      .mockReturnValueOnce(first)
      .mockResolvedValue({
        kind: 'resolved',
        troupe: { id: 't1', name: 'Troupe' },
        season: { id: 's2', slug: 'ligue-b', title: 'Ligue B' } as SeasonResponse,
      })

    rememberLastVisitedSeasonSlug('ligue-b')
    const svc = service()
    const older = svc.refresh()
    const newer = svc.refresh()
    resolveFirst!({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask', title: 'Ligue 2026' } as SeasonResponse,
    })

    await Promise.all([older, newer])

    expect(svc.label()).toBe('Ligue B')
    expect(svc.ariaLabel()).toBe('Ma saison : Ligue B')
    expect(svc.link()).toEqual(['/saison', 'ligue-b'])
  })

  it('does not set loading again after the first refresh completed', async () => {
    rememberLastVisitedSeasonSlug('festibask')
    resolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask', title: 'Ligue 2026' } as SeasonResponse,
    })

    const svc = service()
    await svc.refresh()
    expect(svc.loading()).toBe(false)

    let resolveSecond: (value: unknown) => void
    const second = new Promise((resolve) => {
      resolveSecond = resolve
    })
    resolver.resolveSeasonSlug.mockReturnValue(second)

    const inFlight = svc.refresh()
    expect(svc.loading()).toBe(false)

    resolveSecond!({
      kind: 'resolved',
      troupe: { id: 't1', name: 'Troupe' },
      season: { id: 's1', slug: 'festibask', title: 'Ligue 2026' } as SeasonResponse,
    })
    await inFlight
    expect(svc.loading()).toBe(false)
  })
})
