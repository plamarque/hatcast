import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SeasonApiService, type SeasonResponse } from '../seasons/season-api.service'
import { TroupeApiService, type TroupeListItem } from '../troupes/troupe-api.service'
import { ContextSwitcherDataService } from './context-switcher-data.service'

const troupeA: TroupeListItem = {
  id: 't-a',
  name: 'Troupe A',
  slug: 'troupe-a',
  membership: {
    id: 'm-a',
    displayName: 'Alice',
    status: 'ACTIVE',
    baselineRole: 'MEMBER',
    createdAt: '',
    updatedAt: '',
  },
  activeMemberCount: 1,
  upcomingEventCount: 0,
}

const troupeB: TroupeListItem = {
  ...troupeA,
  id: 't-b',
  name: 'Troupe B',
  slug: 'troupe-b',
}

function season(id: string, troupeId: string, slug: string, title: string): SeasonResponse {
  return {
    id,
    troupeId,
    slug,
    title,
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

describe('ContextSwitcherDataService', () => {
  let service: ContextSwitcherDataService
  let listMyTroupes: ReturnType<typeof vi.fn>
  let listSeasons: ReturnType<typeof vi.fn>

  beforeEach(() => {
    listMyTroupes = vi.fn()
    listSeasons = vi.fn()

    TestBed.configureTestingModule({
      providers: [
        ContextSwitcherDataService,
        { provide: TroupeApiService, useValue: { listMyTroupes } },
        { provide: SeasonApiService, useValue: { listSeasons } },
      ],
    })

    service = TestBed.inject(ContextSwitcherDataService)
  })

  afterEach(() => {
    service.resetForTests()
  })

  it('hides switcher for mono-troupe mono-saison', async () => {
    listMyTroupes.mockResolvedValue({ ok: true, data: [troupeA] })
    listSeasons.mockResolvedValue({
      ok: true,
      data: { content: [season('s1', 't-a', 'saison-1', 'Saison 1')], page: 0, size: 50, totalElements: 1, totalPages: 1 },
    })

    await service.ensureReady('t-a')

    expect(service.showSwitcher()).toBe(false)
  })

  it('shows switcher when multiple troupes', async () => {
    listMyTroupes.mockResolvedValue({ ok: true, data: [troupeA, troupeB] })
    listSeasons.mockResolvedValue({
      ok: true,
      data: { content: [season('s1', 't-a', 'saison-1', 'Saison 1')], page: 0, size: 50, totalElements: 1, totalPages: 1 },
    })

    await service.ensureReady('t-a')

    expect(service.showSwitcher()).toBe(true)
  })

  it('shows switcher when multiple seasons on current troupe', async () => {
    listMyTroupes.mockResolvedValue({ ok: true, data: [troupeA] })
    listSeasons.mockResolvedValue({
      ok: true,
      data: {
        content: [
          season('s1', 't-a', 'saison-1', 'Saison 1'),
          season('s2', 't-a', 'saison-2', 'Saison 2'),
        ],
        page: 0,
        size: 50,
        totalElements: 2,
        totalPages: 1,
      },
    })

    await service.ensureReady('t-a')

    expect(service.showSwitcher()).toBe(true)
    expect(service.seasonsForTroupe('t-a').length).toBe(2)
  })

  it('keeps switcher hidden after API error', async () => {
    listMyTroupes.mockResolvedValue({ ok: false, status: 500 })

    await service.ensureReady('t-a')

    expect(service.loadError()).toBe(true)
    expect(service.showSwitcher()).toBe(false)
  })
})
