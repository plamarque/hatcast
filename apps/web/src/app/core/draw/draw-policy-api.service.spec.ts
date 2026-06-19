import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DrawPolicyApiService } from './draw-policy-api.service'

describe('DrawPolicyApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DrawPolicyApiService],
    })
  })

  function service(): DrawPolicyApiService {
    return TestBed.inject(DrawPolicyApiService)
  }

  it('getEffectiveDrawPolicy calls GET draw-policy/effective', async () => {
    const payload = {
      policySource: 'TROUPE',
      resolvedRuleSource: 'DEFAULT',
      eventCategory: null,
      resolvedMode: 'CHOICE',
      allowedFormulaIds: ['f1', 'f2'],
      allowedFormulas: [
        { id: 'f1', name: 'Équité saison' },
        { id: 'f2', name: 'Parité match' },
      ],
      effectiveFormulaId: 'f1',
      effectiveFormulaName: 'Équité saison',
      selectorVisible: true,
      requiresFormulaIdOnDraw: true,
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().getEffectiveDrawPolicy('season-1', 'event-1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.selectorVisible).toBe(true)
      expect(result.data.effectiveFormulaId).toBe('f1')
    }
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/seasons/season-1/events/event-1/draw-policy/effective',
      { credentials: 'include' },
    )
  })

  it('returns failure when effective policy GET fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Accès refusé' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().getEffectiveDrawPolicy('season-1', 'event-1')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(403)
      expect(result.errorMessage).toBe('Accès refusé')
    }
  })
})
