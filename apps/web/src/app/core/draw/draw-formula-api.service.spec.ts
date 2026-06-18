import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DrawFormulaApiService, parseErrorResponse } from './draw-formula-api.service'

describe('DrawFormulaApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.cookie = ''
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DrawFormulaApiService],
    })
  })

  function service(): DrawFormulaApiService {
    return TestBed.inject(DrawFormulaApiService)
  }

  it('list calls GET draw-formulas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().list('t1')
    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith('/v1/troupes/t1/draw-formulas', {
      credentials: 'include',
    })
  })

  it('maps 400 response body message for UI', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          message: 'past_participation.params.strength doit être entre 0.0 et 2.0',
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().create('t1', { name: 'Test' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('strength doit être entre 0.0 et 2.0')
    }
  })

  it('uses load-specific network error message for list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const result = await service().list('t1')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe('Impossible de charger les formules de tirage.')
    }
  })
})

describe('parseErrorResponse', () => {
  it('prefers message then detail', async () => {
    const res = {
      status: 400,
      json: () => Promise.resolve({ detail: 'detail fallback' }),
    } as Response
    await expect(parseErrorResponse(res)).resolves.toEqual({
      status: 400,
      message: 'detail fallback',
    })
  })
})
