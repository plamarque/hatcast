import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DrawPolicyApiService } from './draw-policy-api.service'

describe('DrawPolicyApiService', () => {
  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/'
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

  it('getTroupeDrawPolicy treats 404 as empty policy', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Politique de tirage introuvable' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().getTroupeDrawPolicy('troupe-1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.status).toBe(404)
      expect(result.data).toBeNull()
    }
    expect(fetchMock).toHaveBeenCalledWith('/v1/troupes/troupe-1/draw-policy', {
      credentials: 'include',
    })
  })

  it('getTroupeDrawPolicy returns parsed policy on 200', async () => {
    const payload = {
      id: 'pol-1',
      defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1'] },
      categoryRules: [
        { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-1' },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().getTroupeDrawPolicy('troupe-1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.status).toBe(200)
      expect(result.data).toEqual(payload)
    }
  })

  it('getTroupeDrawPolicy returns failure on 500', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Erreur interne' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().getTroupeDrawPolicy('troupe-1')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(500)
      expect(result.errorMessage).toBe('Erreur interne')
    }
  })

  it('putTroupeDrawPolicy sends CSRF header when cookie present', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1'] },
          categoryRules: [],
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().putTroupeDrawPolicy('troupe-1', {
      defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1'] },
      categoryRules: [],
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/troupe-1/draw-policy',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'token',
        }),
      }),
    )
  })

  it('putTroupeDrawPolicy sends PUT with defaultRule unchanged and MANDATORY category rule', async () => {
    const payload = {
      id: 'pol-1',
      defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1'] },
      categoryRules: [
        { category: 'aperock', mode: 'MANDATORY', mandatoryFormulaId: 'custom-1' },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload),
    })
    vi.stubGlobal('fetch', fetchMock)

    const body = {
      defaultRule: { mode: 'CHOICE' as const, allowedFormulaIds: ['sys-1'] },
      categoryRules: [
        { category: 'aperock', mode: 'MANDATORY' as const, mandatoryFormulaId: 'custom-1' },
      ],
    }
    const result = await service().putTroupeDrawPolicy('troupe-1', body)
    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/troupe-1/draw-policy',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(body),
      }),
    )
  })

  it('putTroupeDrawPolicy returns failure with message on 4xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: 'Formule encore référencée' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().putTroupeDrawPolicy('troupe-1', {
      defaultRule: { mode: 'CHOICE', allowedFormulaIds: ['sys-1'] },
      categoryRules: [],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
      expect(result.errorMessage).toBe('Formule encore référencée')
    }
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
