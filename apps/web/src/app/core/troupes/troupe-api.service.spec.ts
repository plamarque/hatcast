import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from './troupe-api.service'

describe('TroupeApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.cookie = ''
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TroupeApiService],
    })
  })

  function service(): TroupeApiService {
    return TestBed.inject(TroupeApiService)
  }

  it('joinTroupe envoie POST avec credentials et CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'm-1',
          displayName: 'Patrice',
          status: 'ACTIVE',
          createdAt: '',
          updatedAt: '',
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().joinTroupe('t-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/memberships/me',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'X-XSRF-TOKEN': 'abc=',
        }),
      }),
    )
  })

  it('listMyTroupes utilise credentials include', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().listMyTroupes()

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes',
      expect.objectContaining({ credentials: 'include' }),
    )
  })
})
