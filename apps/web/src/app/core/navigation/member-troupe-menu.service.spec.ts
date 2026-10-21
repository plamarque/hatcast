import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SeasonApiService, type SeasonResponse } from '../seasons/season-api.service'
import { TroupeApiService, type TroupeListItem } from '../troupes/troupe-api.service'
import { rememberLastVisitedTroupeSlug } from './last-visited-troupe-storage'
import { rememberLastVisitedSeasonSlug } from './last-visited-season-storage'
import { MemberTroupeMenuService } from './member-troupe-menu.service'
import { orderedActiveSeasons, orderedMemberTroupes } from './member-troupe-selection'

const troupe = (id = 'a', createdAt = '2026-01-01', name = id): TroupeListItem => ({
  id, name, slug: id, isDemo: false, joinPolicy: 'OPEN', activeMemberCount: 2, upcomingEventCount: 0,
  membership: { id: `m-${id}`, displayName: 'Membre', status: 'ACTIVE', baselineRole: 'MEMBER', createdAt, updatedAt: createdAt },
})
const season = (id = 's', troupeId = 'a', startDate: string | null = '2026-01-01'): SeasonResponse => ({
  id, troupeId, slug: id, title: id, startDate, endDate: null, archived: false, active: true,
  description: null, eventCount: 0, participantCount: 0, createdAt: '', updatedAt: '',
})
const ok = <T>(data: T) => ({ ok: true, status: 200, data })
const page = (content: SeasonResponse[], totalPages = 1) => ok({ content, totalPages, totalElements: content.length, page: 0, size: 50 })

describe('MemberTroupeMenuService', () => {
  let troupes: { listMyTroupes: ReturnType<typeof vi.fn>; resolveTroupeContextBySlug: ReturnType<typeof vi.fn> }
  let seasons: { listSeasons: ReturnType<typeof vi.fn>; getSeasonBySlug: ReturnType<typeof vi.fn> }
  let service: MemberTroupeMenuService
  beforeEach(() => {
    localStorage.clear()
    troupes = { listMyTroupes: vi.fn().mockResolvedValue(ok([troupe()])), resolveTroupeContextBySlug: vi.fn().mockResolvedValue(ok(troupe())) }
    seasons = {
      listSeasons: vi.fn().mockResolvedValue(page([season()])),
      getSeasonBySlug: vi.fn().mockImplementation(async (troupeId, slug) => ok(season(slug, troupeId))),
    }
    TestBed.configureTestingModule({ providers: [
      MemberTroupeMenuService, { provide: TroupeApiService, useValue: troupes }, { provide: SeasonApiService, useValue: seasons },
    ] })
    service = TestBed.inject(MemberTroupeMenuService)
  })
  afterEach(() => { localStorage.clear(); TestBed.resetTestingModule() })

  it('resolves one remembered pair without context or storage mutations', async () => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('a1', 'a')
    const storageSnapshot = () => Array.from({ length: localStorage.length }, (_, index) => {
      const key = localStorage.key(index)!
      return [key, localStorage.getItem(key)]
    }).sort()
    const before = storageSnapshot()
    await service.refresh()
    expect(service.troupeLink()).toEqual(['/troupes', 'a'])
    expect(service.seasonLink()).toEqual(['/saison', 'a', 'a1'])
    expect(service.statisticsReady()).toBe(true)
    expect(troupes.listMyTroupes).not.toHaveBeenCalled()
    expect(storageSnapshot()).toEqual(before)
  })

  it('never combines another troupe global season with the remembered troupe', async () => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('b1', 'b')
    seasons.getSeasonBySlug.mockImplementation(async (_, slug) => slug === 'b1' ? ok(season('b1', 'b')) : ok(season('s', 'a')))
    await service.refresh()
    expect(service.seasonLink()).toEqual(['/saison', 'a', 's'])
    expect(service.season()?.troupeId).toBe('a')
  })

  it('ignores global-only legacy memory even when its slug also exists in this troupe', async () => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('legacy')
    seasons.listSeasons.mockResolvedValue(page([season('legacy'), season('newest', 'a', '2027-01-01')]))
    await service.refresh()
    expect(service.season()?.slug).toBe('newest')
    expect(seasons.getSeasonBySlug).not.toHaveBeenCalledWith('a', 'legacy')
    expect(localStorage.getItem('lastVisitedSeason')).toBe('legacy')
    expect(localStorage.getItem('lastVisitedSeasonByTroupe')).toBeNull()
  })

  it('gives per-troupe memory precedence over the global memory', async () => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('a1', 'a')
    rememberLastVisitedSeasonSlug('b1', 'b')
    await service.refresh()
    expect(service.season()?.slug).toBe('a1')
  })

  it('falls back to newest active membership creation including demo troupes', async () => {
    troupes.listMyTroupes.mockResolvedValue(ok([troupe('a'), { ...troupe('b', '2026-02-01'), isDemo: true }, { ...troupe('c', '2026-03-01'), membership: { ...troupe('c').membership, status: 'INACTIVE' } }]))
    seasons.listSeasons.mockResolvedValue(page([season('b1', 'b')]))
    await service.refresh()
    expect(service.troupe()?.id).toBe('b')
  })

  it.each([403, 404])('falls back after a definitive troupe rejection %s', async (status) => {
    rememberLastVisitedTroupeSlug('removed')
    troupes.resolveTroupeContextBySlug.mockResolvedValue({ ok: false, status })
    await service.refresh()
    expect(service.troupe()?.id).toBe('a')
    expect(localStorage.getItem('lastVisitedTroupeSlug')).toBe('removed')
  })

  it('rejects an inactive remembered troupe', async () => {
    rememberLastVisitedTroupeSlug('inactive')
    troupes.resolveTroupeContextBySlug.mockResolvedValue(ok({ ...troupe('inactive'), membership: { ...troupe().membership, status: 'INACTIVE' } }))
    await service.refresh()
    expect(service.troupe()?.id).toBe('a')
  })

  it.each([0, 401, 500])('retains known names and memory on transient/auth failure %s then retries', async (status) => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('a1', 'a')
    await service.refresh()
    troupes.resolveTroupeContextBySlug.mockResolvedValueOnce({ ok: false, status })
    await service.refresh()
    expect(service.troupeLabel()).toBe('a')
    expect(service.seasonLabel()).toBe('a1')
    expect(service.troupeReady()).toBe(false)
    expect(service.seasonReady()).toBe(false)
    expect(service.error()).toContain('Réessaie')
    expect(troupes.listMyTroupes).not.toHaveBeenCalled()
    expect(localStorage.getItem('lastVisitedSeason')).toBe('a1')
    await service.refresh()
    expect(service.statisticsReady()).toBe(true)
    expect(service.error()).toBeNull()
  })

  it('ignores an archived memory, loads all pages and chooses latest active start date', async () => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('archived', 'a')
    seasons.getSeasonBySlug.mockImplementation(async (_, slug) => ok({ ...season(slug), archived: slug === 'archived' }))
    seasons.listSeasons.mockResolvedValueOnce(page([season('older')], 2)).mockResolvedValueOnce(page([season('newest', 'a', '2027-01-01')], 2))
    await service.refresh()
    expect(seasons.listSeasons).toHaveBeenCalledWith('a', 1, 50)
    expect(service.season()?.slug).toBe('newest')
  })

  it('skips a definitively inaccessible season candidate', async () => {
    seasons.listSeasons.mockResolvedValue(page([season('new', 'a', '2027-01-01'), season('old')]))
    seasons.getSeasonBySlug.mockImplementation(async (_, slug) => slug === 'new' ? { ok: false, status: 403 } : ok(season(slug)))
    await service.refresh()
    expect(service.season()?.slug).toBe('old')
  })

  it('keeps the resolved troupe usable when season resolution fails without fallback', async () => {
    rememberLastVisitedSeasonSlug('a1', 'a')
    seasons.getSeasonBySlug.mockResolvedValue({ ok: false, status: 500 })
    await service.refresh()
    expect(service.troupeReady()).toBe(true)
    expect(service.seasonReady()).toBe(false)
    expect(seasons.listSeasons).not.toHaveBeenCalled()
    expect(localStorage.getItem('lastVisitedSeason')).toBe('a1')
  })

  it('uses three-entry no-troupe fallback', async () => {
    troupes.listMyTroupes.mockResolvedValue(ok([]))
    await service.refresh()
    expect(service.troupeLabel()).toBe('Mes troupes')
    expect(service.troupeLink()).toEqual(['/troupes'])
    expect(service.troupeReady()).toBe(true)
    expect(service.seasonLabel()).toBe('Aucune saison')
    expect(service.statisticsReady()).toBe(false)
  })

  it('keeps troupe reachable with no active season', async () => {
    seasons.listSeasons.mockResolvedValue(page([{ ...season(), archived: true }]))
    await service.refresh()
    expect(service.troupeReady()).toBe(true)
    expect(service.seasonLabel()).toBe('Aucune saison')
    expect(service.seasonReady()).toBe(false)
  })

  it.each(['EVENTS_ONLY', 'AGENDA_ONLY', 'NONE', 'FULL'] as const)('preserves guest workspace rights %s', async (mode) => {
    rememberLastVisitedTroupeSlug('a')
    rememberLastVisitedSeasonSlug('a1', 'a')
    seasons.getSeasonBySlug.mockResolvedValue(ok({ ...season('a1'), guestSeasonWorkspaceMode: mode }))
    seasons.listSeasons.mockResolvedValue(page([{ ...season('a1'), guestSeasonWorkspaceMode: mode }]))
    await service.refresh()
    expect(service.seasonReady()).toBe(mode !== 'NONE')
    expect(service.statisticsReady()).toBe(mode === 'FULL')
  })

  it('retains names but disables unresolved links during refresh', async () => {
    await service.refresh()
    let complete!: (value: ReturnType<typeof ok<TroupeListItem[]>>) => void
    troupes.listMyTroupes.mockReturnValueOnce(new Promise((resolve) => { complete = resolve }))
    const refresh = service.refresh()
    expect(service.loading()).toBe(true)
    expect(service.troupeLabel()).toBe('a')
    expect(service.seasonLabel()).toBe('s')
    expect(service.seasonReady()).toBe(false)
    complete(ok([troupe()]))
    await refresh
    expect(service.seasonReady()).toBe(true)
  })

  it('applies only the latest overlapping resolution', async () => {
    let complete!: (value: ReturnType<typeof ok<TroupeListItem[]>>) => void
    troupes.listMyTroupes.mockReturnValueOnce(new Promise((resolve) => { complete = resolve }))
    const older = service.refresh()
    const newer = service.refresh()
    await newer
    complete(ok([troupe('b')]))
    await older
    expect(service.troupe()?.id).toBe('a')
  })
})

describe('member navigation deterministic selection', () => {
  it('orders memberships by creation, then name, then ID with missing dates oldest', () => {
    expect(orderedMemberTroupes([troupe('z', 'invalid'), troupe('d', '2026-01-01', 'Alpha'), troupe('b', '2026-01-01', 'Alpha'), troupe('c', '2026-01-01', 'Beta')]).map((t) => t.id)).toEqual(['b', 'd', 'c', 'z'])
  })
  it('orders active seasons by date, then title, then ID with missing dates oldest', () => {
    expect(orderedActiveSeasons([{ ...season('d'), title: 'Alpha' }, season('z', 'a', null), { ...season('b'), title: 'Alpha' }, { ...season('c'), archived: true }]).map((s) => s.id)).toEqual(['b', 'd', 'z'])
  })
})
