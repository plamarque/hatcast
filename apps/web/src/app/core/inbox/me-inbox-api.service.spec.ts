import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  INBOX_CACHE_TTL_MS,
  MeInboxApiService,
  type MeInboxResponse,
} from './me-inbox-api.service'

const INBOX_CACHE_STORAGE_KEY = 'hatcast.inbox.cache'

function sampleInbox(actionCount = 2): MeInboxResponse {
  return {
    actions: Array.from({ length: actionCount }, () => ({
      type: 'availability_unknown' as const,
      eventId: 'ev-1',
      eventSlug: 'ev-1',
      seasonSlug: 'saison-1',
      title: 'Spectacle',
      startsAt: '2026-06-10T20:00:00Z',
      troupeName: 'Improbots',
      troupeSlug: 'improbots',
      seasonTitle: 'Apérock',
      location: null,
      troupeId: 't-1',
      seasonId: 's-1',
      deepLink: '/saison/improbots/aprock/ev-1',
    })),
    nextEvent: null,
    shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
    noParticipation: false,
  }
}

describe('MeInboxApiService', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  function readyService(userId = 'user-1'): MeInboxApiService {
    const service = TestBed.inject(MeInboxApiService)
    service.bindSessionUser(userId)
    return service
  }

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    TestBed.configureTestingModule({
      providers: [MeInboxApiService],
    })
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('returns cached inbox within TTL without a second network call', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleInbox(3),
    })

    const service = readyService()
    const first = await service.getInbox()
    const second = await service.getInbox()

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(first.data?.actions.length).toBe(3)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('peekFreshCache returns cached data within TTL without fetch', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleInbox(2),
    })

    const service = readyService()
    await service.getInbox()

    expect(service.peekFreshCache()?.actions.length).toBe(2)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent getInbox calls', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleInbox(1),
    })

    const service = readyService()
    const [a, b] = await Promise.all([service.getInbox(), service.getInbox()])

    expect(a.ok).toBe(true)
    expect(b.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('force refresh bypasses fresh cache', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleInbox(2),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleInbox(5),
      })

    const service = readyService()
    await service.getInbox()
    const forced = await service.getInbox({ force: true })

    expect(forced.data?.actions.length).toBe(5)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('refetches after TTL expires', async () => {
    vi.useFakeTimers()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleInbox(1),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleInbox(4),
      })

    const service = readyService()
    await service.getInbox()
    vi.advanceTimersByTime(INBOX_CACHE_TTL_MS + 1)
    const second = await service.getInbox()

    expect(second.data?.actions.length).toBe(4)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('hydrates fresh cache from sessionStorage on new service instance', async () => {
    const payload = {
      data: sampleInbox(7),
      fetchedAt: Date.now(),
      userId: 'user-1',
    }
    sessionStorage.setItem(INBOX_CACHE_STORAGE_KEY, JSON.stringify(payload))

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({ providers: [MeInboxApiService] })
    const service = TestBed.inject(MeInboxApiService)
    service.bindSessionUser('user-1')
    const result = await service.getInbox()

    expect(result.data?.actions.length).toBe(7)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('invalidateCache clears session memo', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleInbox(2),
    })

    const service = readyService()
    await service.getInbox()
    service.invalidateCache()
    expect(sessionStorage.getItem(INBOX_CACHE_STORAGE_KEY)).toBeNull()
    await service.getInbox()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('simulates three shell mounts with one inbox fetch when cache is warm', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleInbox(2),
    })

    const service = readyService()
    await service.getInbox()
    await service.getInbox()
    await service.getInbox()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clears cache when bindSessionUser switches accounts', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleInbox(2),
    })

    const service = readyService('user-a')
    await service.getInbox()
    service.bindSessionUser('user-b')
    await service.getInbox()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('waits for in-flight fetch before force refresh', async () => {
    let releaseSlow!: () => void
    const slowGate = new Promise<void>((resolve) => {
      releaseSlow = resolve
    })

    fetchMock
      .mockImplementationOnce(async () => {
        await slowGate
        return { ok: true, status: 200, json: async () => sampleInbox(2) }
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleInbox(5),
      })

    const service = readyService()
    const slow = service.getInbox()
    const forced = service.getInbox({ force: true })
    releaseSlow()
    const [, forcedResult] = await Promise.all([slow, forced])

    expect(forcedResult.data?.actions.length).toBe(5)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
