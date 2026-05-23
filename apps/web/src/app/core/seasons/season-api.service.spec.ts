import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SeasonApiService } from './season-api.service'

describe('SeasonApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.cookie = ''
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeasonApiService],
    })
  })

  function service(): SeasonApiService {
    return TestBed.inject(SeasonApiService)
  }

  it('createSeason envoie POST avec JSON, credentials et CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'id-1',
          troupeId: 't-1',
          slug: 'x',
          title: 'T',
          description: null,
          startDate: null,
          endDate: null,
          archived: false,
          active: false,
          eventCount: 0,
          participantCount: 0,
          createdAt: '',
          updatedAt: '',
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().createSeason('t-1', { title: 'T' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/seasons',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'abc=',
        }),
        body: JSON.stringify({ title: 'T' }),
      }),
    )
  })

  it('listSeasons utilise page et size en query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          content: [],
          page: 1,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().listSeasons('tid', 1, 20)

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/tid/seasons?page=1&size=20',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('deleteSeason envoie DELETE avec credentials et CSRF et attend 204', async () => {
    document.cookie = 'XSRF-TOKEN=del%3D'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await service().deleteSeason('season-99')

    expect(r.ok).toBe(true)
    expect(r.status).toBe(204)
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/seasons/season-99',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        headers: expect.objectContaining({
          'X-XSRF-TOKEN': 'del=',
        }),
      }),
    )
  })

  it('deleteSeason refuse un succès HTTP qui ne respecte pas le 204 attendu', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await service().deleteSeason('season-202')

    expect(r.ok).toBe(false)
    expect(r.status).toBe(202)
  })
})
