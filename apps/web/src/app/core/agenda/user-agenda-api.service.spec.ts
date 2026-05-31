import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserAgendaApiService } from './user-agenda-api.service'

describe('UserAgendaApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserAgendaApiService],
    })
  })

  function service(): UserAgendaApiService {
    return TestBed.inject(UserAgendaApiService)
  }

  it('charge Mon agenda avec pagination bornée, scope upcoming et credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          content: [],
          page: 0,
          size: 50,
          totalElements: 0,
          totalPages: 0,
          filterBarVisible: false,
          noParticipation: true,
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await service().listAgenda()

    expect(r.ok).toBe(true)
    expect(r.data?.noParticipation).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/me/agenda?page=0&size=50&scope=upcoming',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('sérialise troupeId et seasonId dans la query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          content: [],
          page: 0,
          size: 50,
          totalElements: 0,
          totalPages: 0,
          filterBarVisible: true,
          noParticipation: false,
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().listAgenda({
      troupeId: 'a0000001-0000-4000-8000-000000000001',
      seasonId: 'b0000001-0000-4000-8000-000000000001',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/me/agenda?page=0&size=50&scope=upcoming&troupeId=a0000001-0000-4000-8000-000000000001&seasonId=b0000001-0000-4000-8000-000000000001',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('retourne un échec local sur erreur réseau', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    const r = await service().listAgenda()

    expect(r).toEqual({ ok: false, status: 0 })
  })
})
