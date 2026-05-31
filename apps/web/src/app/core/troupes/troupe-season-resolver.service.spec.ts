import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../auth/auth-api.service'
import type { SeasonResponse } from '../seasons/season-api.service'
import { SeasonApiService } from '../seasons/season-api.service'
import type { TroupeListItem } from './troupe-api.service'
import { TroupeApiService } from './troupe-api.service'
import { TroupeContextService } from './troupe-context.service'
import { TroupeSeasonResolverService } from './troupe-season-resolver.service'

describe('TroupeSeasonResolverService', () => {
  let troupeApi: { listMyTroupes: ReturnType<typeof vi.fn> }
  let seasonsApi: {
    getSeasonBySlug: ReturnType<typeof vi.fn>
    resolveAdminSeasonBySlug: ReturnType<typeof vi.fn>
  }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    localStorage.clear()
    troupeApi = { listMyTroupes: vi.fn() }
    seasonsApi = {
      getSeasonBySlug: vi.fn(),
      resolveAdminSeasonBySlug: vi.fn(),
    }
    auth = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        data: { platformAdmin: false },
      }),
    }
    TestBed.configureTestingModule({
      providers: [
        TroupeContextService,
        TroupeSeasonResolverService,
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: SeasonApiService, useValue: seasonsApi },
        { provide: AuthApiService, useValue: auth },
      ],
    })
  })

  afterEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
  })

  it('résout la troupe sélectionnée avant les autres', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-2')
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1'), troupe('troupe-2')],
    })
    seasonsApi.getSeasonBySlug.mockResolvedValueOnce({ ok: true, status: 200, data: season('s2', 'troupe-2') })

    const result = await resolver().resolveSeasonSlug('saison-a')

    expect(result.kind).toBe('resolved')
    expect(result.kind === 'resolved' ? result.troupe.id : null).toBe('troupe-2')
    expect(seasonsApi.getSeasonBySlug).toHaveBeenCalledTimes(1)
    expect(seasonsApi.getSeasonBySlug).toHaveBeenCalledWith('troupe-2', 'saison-a')
  })

  it('bascule vers l’unique autre troupe propriétaire du slug', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-1')
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1'), troupe('troupe-2')],
    })
    seasonsApi.getSeasonBySlug
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, status: 200, data: season('s2', 'troupe-2') })

    const result = await resolver().resolveSeasonSlug('saison-a')

    expect(result.kind).toBe('resolved')
    expect(result.kind === 'resolved' ? result.troupe.id : null).toBe('troupe-2')
    expect(context().selectedTroupe()?.id).toBe('troupe-2')
    expect(localStorage.getItem('hatcast.selectedTroupeId')).toBe('troupe-2')
  })

  it('bloque une résolution ambiguë sans changer la préférence', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-1')
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1'), troupe('troupe-2'), troupe('troupe-3')],
    })
    seasonsApi.getSeasonBySlug
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, status: 200, data: season('s2', 'troupe-2') })
      .mockResolvedValueOnce({ ok: true, status: 200, data: season('s3', 'troupe-3') })

    const result = await resolver().resolveSeasonSlug('saison-a')

    expect(result.kind).toBe('ambiguous')
    expect(context().selectedTroupe()?.id).toBe('troupe-1')
    expect(localStorage.getItem('hatcast.selectedTroupeId')).toBe('troupe-1')
  })

  it('renvoie not-found quand aucune troupe active ne possède le slug', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1'), troupe('troupe-2')],
    })
    seasonsApi.getSeasonBySlug
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 })

    const result = await resolver().resolveSeasonSlug('inconnue')

    expect(result.kind).toBe('not-found')
    expect(context().selectedTroupe()?.id).toBe('troupe-1')
  })

  it('renvoie error quand l’API renvoie une erreur serveur ou réseau', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [troupe('troupe-1'), troupe('troupe-2')],
    })
    seasonsApi.getSeasonBySlug.mockResolvedValueOnce({ ok: false, status: 500 })

    const result = await resolver().resolveSeasonSlug('saison-a')

    expect(result.kind).toBe('error')
    expect(seasonsApi.getSeasonBySlug).toHaveBeenCalledTimes(1)
  })

  it('résout une saison via admin plateforme sans adhésion troupe', async () => {
    auth.ensureHatcastSession.mockResolvedValue({
      ok: true,
      data: { platformAdmin: true },
    })
    troupeApi.listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [],
    })
    seasonsApi.resolveAdminSeasonBySlug.mockResolvedValue({
      ok: true,
      status: 200,
      data: [
        {
          troupe: {
            id: 'troupe-improbots',
            name: 'Les Improbots',
            slug: 'les-improbots',
            isDemo: false,
            joinPolicy: 'OPEN',
          },
          season: season('s-improbots', 'troupe-improbots'),
        },
      ],
    })

    const result = await resolver().resolveSeasonSlug('les-improbots-2026-2027')

    expect(result.kind).toBe('resolved')
    expect(result.kind === 'resolved' ? result.troupe.slug : null).toBe('les-improbots')
    expect(seasonsApi.resolveAdminSeasonBySlug).toHaveBeenCalledWith('les-improbots-2026-2027')
  })

  function resolver(): TroupeSeasonResolverService {
    return TestBed.inject(TroupeSeasonResolverService)
  }

  function context(): TroupeContextService {
    return TestBed.inject(TroupeContextService)
  }
})

function troupe(id: string): TroupeListItem {
  return {
    id,
    name: `Troupe ${id}`,
    slug: id,
    isDemo: false,
    joinPolicy: 'OPEN',
    activeMemberCount: 1,
    upcomingEventCount: 0,
    membership: {
      id: `membership-${id}`,
      displayName: id,
      status: 'ACTIVE',
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
  }
}

function season(id: string, troupeId: string): SeasonResponse {
  return {
    id,
    troupeId,
    slug: 'saison-a',
    title: `Saison ${id}`,
    description: null,
    startDate: null,
    endDate: null,
    archived: false,
    active: true,
    eventCount: 0,
    participantCount: 0,
    createdAt: '',
    updatedAt: '',
  }
}
