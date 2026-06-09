import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MePreferencesApiService } from './me-preferences-api.service'

const samplePrefs = {
  memberDisplayName: 'Léa',
  preferredRoleKeys: ['player'],
  gender: 'non_specified' as const,
}

function mockFetchSequence(...responses: Array<{ ok: boolean; status: number; body?: unknown }>) {
  const fetchMock = vi.fn()
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce({
      ok: response.ok,
      status: response.status,
      json: async () => response.body,
    })
  }
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('MePreferencesApiService', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MePreferencesApiService],
    }).compileComponents()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    TestBed.resetTestingModule()
  })

  function service(): MePreferencesApiService {
    return TestBed.inject(MePreferencesApiService)
  }

  it('getPreferences caches successful responses for the session', async () => {
    const fetchMock = mockFetchSequence({ ok: true, status: 200, body: samplePrefs })
    const api = service()

    const first = await api.getPreferences()
    const second = await api.getPreferences()

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/v1/me/preferences', { credentials: 'include' })
  })

  it('getPreferences coalesces concurrent callers into one network request', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    const first = api.getPreferences()
    const second = api.getPreferences()

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => samplePrefs,
    })

    expect(await first).toMatchObject({ ok: true, data: samplePrefs })
    expect(await second).toMatchObject({ ok: true, data: samplePrefs })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('patchPreferences invalidates cache so the next getPreferences refetches', async () => {
    const fetchMock = mockFetchSequence(
      { ok: true, status: 200, body: samplePrefs },
      { ok: true, status: 200, body: { ...samplePrefs, gender: 'female' } },
      { ok: true, status: 200, body: { ...samplePrefs, gender: 'female' } },
    )
    const api = service()

    await api.getPreferences()
    const patched = await api.patchPreferences({ gender: 'female' })
    const refetched = await api.getPreferences()

    expect(patched.ok).toBe(true)
    expect(refetched.data?.gender).toBe('female')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not cache when invalidateCache runs before in-flight GET settles', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    const pending = api.getPreferences()
    api.invalidateCache()
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => samplePrefs,
    })
    await pending

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ...samplePrefs, gender: 'male' }),
    })
    const refetched = await api.getPreferences()

    expect(refetched.data?.gender).toBe('male')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('invalidateCache forces the next getPreferences to refetch', async () => {
    const fetchMock = mockFetchSequence(
      { ok: true, status: 200, body: samplePrefs },
      { ok: true, status: 200, body: samplePrefs },
    )
    const api = service()

    await api.getPreferences()
    api.invalidateCache()
    await api.getPreferences()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
