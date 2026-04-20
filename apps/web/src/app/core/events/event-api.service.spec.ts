import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { EventApiService } from './event-api.service'

describe('EventApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.cookie = ''
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventApiService],
    })
  })

  function service(): EventApiService {
    return TestBed.inject(EventApiService)
  }

  it('listEvents passe scope en query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().listEvents('sid', 0, 20, 'upcoming')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/seasons/sid/events?page=0&size=20&scope=upcoming',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('createEvent envoie POST avec CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=tok%3D'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'e1',
          seasonId: 's1',
          title: 'T',
          description: null,
          location: null,
          startsAt: '2030-01-01T12:00:00Z',
          archived: false,
          createdAt: '',
          updatedAt: '',
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().createEvent('s1', {
      title: 'T',
      startsAt: '2030-01-01T12:00:00.000Z',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/seasons/s1/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-XSRF-TOKEN': 'tok=',
        }),
      }),
    )
  })
})
