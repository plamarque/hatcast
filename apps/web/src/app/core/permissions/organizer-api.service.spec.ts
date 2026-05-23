import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OrganizerApiService } from './organizer-api.service'

describe('OrganizerApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.cookie = ''
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizerApiService],
    })
  })

  function service(): OrganizerApiService {
    return TestBed.inject(OrganizerApiService)
  }

  it('adds a season organizer with CSRF and trimmed email payload', async () => {
    document.cookie = 'XSRF-TOKEN=tok'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          userId: 'u1',
          email: 'orga@example.com',
          displayName: 'Orga',
          grantedAt: '2026-05-23T12:00:00Z',
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().addSeasonOrganizer('s1', ' orga@example.com ')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/seasons/s1/organizers',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'tok' }),
        body: JSON.stringify({ email: 'orga@example.com' }),
      }),
    )
  })

  it('removes an event organizer with the scoped event route', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await service().removeEventOrganizer('s1', 'e1', 'u1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/seasons/s1/events/e1/organizers/u1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }),
    )
  })
})
