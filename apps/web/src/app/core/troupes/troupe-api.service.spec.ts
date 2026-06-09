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

  it('createTroupe envoie POST avec credentials, CSRF et nom trimé', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({
          id: 't-new',
          name: 'Ma Troupe',
          slug: 'ma-troupe',
          membership: {
            id: 'm-1',
            displayName: 'Patrice',
            status: 'ACTIVE',
            baselineRole: 'TROUPE_ADMIN',
            createdAt: '',
            updatedAt: '',
          },
          activeMemberCount: 1,
          upcomingEventCount: 0,
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().createTroupe({ name: '  Ma Troupe  ' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'abc=',
        }),
        body: JSON.stringify({ name: 'Ma Troupe' }),
      }),
    )
  })

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
          baselineRole: 'MEMBER',
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

  it('listPublicTroupes utilise credentials omit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([
          {
            id: 't-public',
            name: 'Publique',
            slug: 'publique',
            logoUrl: '/v1/public/troupes/t-public/logo?v=1',
            description: 'Une troupe publique.',
            activeMemberCount: 2,
            upcomingEventCount: 1,
          },
        ]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().listPublicTroupes()

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/public/troupes',
      expect.objectContaining({ credentials: 'omit' }),
    )
    expect(result.ok).toBe(true)
    expect(result.data?.[0].slug).toBe('publique')
    expect(result.data?.[0].logoUrl).toBe('/v1/public/troupes/t-public/logo?v=1')
    expect(result.data?.[0].description).toBe('Une troupe publique.')
    expect(result.data?.[0]).not.toHaveProperty('membership')
  })

  it('updateTroupe envoie nom et description trimés avec CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 't-1',
          name: 'Nom',
          slug: 'nom',
          description: 'Description',
          logoUrl: null,
          membership: {
            id: 'm-1',
            displayName: 'Patrice',
            status: 'ACTIVE',
            baselineRole: 'TROUPE_ADMIN',
            createdAt: '',
            updatedAt: '',
          },
          activeMemberCount: 1,
          upcomingEventCount: 0,
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().updateTroupe('t-1', { name: ' Nom ', description: ' Description ' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'token',
        }),
        body: JSON.stringify({ name: 'Nom', description: 'Description' }),
      }),
    )
  })

  it('uploadTroupeLogo envoie multipart avec CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 't-1', logoUrl: '/logo.png' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })

    await service().uploadTroupeLogo('t-1', file)

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/logo',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'token' }),
      }),
    )
    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get('file')).toBe(file)
  })

  it('deleteTroupeLogo envoie DELETE avec CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 't-1', logoUrl: null }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().deleteTroupeLogo('t-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/logo',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'token' }),
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

  it('listMyTroupes parse activeMemberCount et upcomingEventCount', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([
          {
            id: 't-1',
            name: 'Les Improbots',
            slug: 'les-improbots',
            activeMemberCount: 4,
            upcomingEventCount: 1,
            membership: {
              id: 'm-1',
              displayName: 'Pat',
              status: 'ACTIVE',
              baselineRole: 'MEMBER',
              createdAt: '',
              updatedAt: '',
            },
          },
        ]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().listMyTroupes()

    expect(result.ok).toBe(true)
    expect(result.data?.[0].activeMemberCount).toBe(4)
    expect(result.data?.[0].upcomingEventCount).toBe(1)
  })

  it('listMyTroupes réutilise le cache session sans second fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    await api.listMyTroupes()
    await api.listMyTroupes()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('listMyTroupes({ force: true }) bypass le cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    await api.listMyTroupes()
    await api.listMyTroupes({ force: true })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('listMyTroupes invalide le cache sur 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      })
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    await api.listMyTroupes()
    await api.listMyTroupes()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('ne met pas en cache si invalidateCache pendant un GET in-flight', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    const pending = api.listMyTroupes()
    api.invalidateCache()
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => [],
    })
    await pending

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 't-2', slug: 'nouvelle', name: 'Nouvelle' }],
    })
    const refetched = await api.listMyTroupes()

    expect(refetched.data?.[0]?.id).toBe('t-2')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('createTroupe invalide le cache liste', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 't-new', slug: 'ma-troupe', name: 'Ma Troupe' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 't-new', slug: 'ma-troupe', name: 'Ma Troupe' }],
      })
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    await api.listMyTroupes()
    await api.createTroupe({ name: 'Ma Troupe' })
    const refreshed = await api.listMyTroupes()

    expect(refreshed.data).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('invalidateCache force le prochain listMyTroupes à refetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', fetchMock)

    const api = service()
    await api.listMyTroupes()
    api.invalidateCache()
    await api.listMyTroupes()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('addMember envoie POST avec credentials, JSON et CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'm-1' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().addMember('troupe 1', {
      email: ' USER@example.com ',
      displayName: ' Patrice ',
      baselineRole: 'TROUPE_ADMIN',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/troupe%201/members',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'token',
        }),
        body: JSON.stringify({
          email: 'USER@example.com',
          displayName: 'Patrice',
          baselineRole: 'TROUPE_ADMIN',
        }),
      }),
    )
  })

  it('updateMyMembership envoie PATCH avec trim, credentials et CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 'm-1',
          displayName: 'Patou',
          status: 'ACTIVE',
          baselineRole: 'MEMBER',
          createdAt: '',
          updatedAt: '',
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().updateMyMembership('t-1', { displayName: '  Patou  ' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/memberships/me',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'token',
        }),
        body: JSON.stringify({ displayName: 'Patou' }),
      }),
    )
    expect(result.ok).toBe(true)
    expect(result.data?.displayName).toBe('Patou')
  })

  it('updateMyMembership remonte le statut HTTP en erreur', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().updateMyMembership('t-1', { displayName: 'Patou' })

    expect(result.ok).toBe(false)
    expect(result.status).toBe(400)
  })

  it('updateMember envoie PATCH avec CSRF', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'm-1' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().updateMember('t-1', 'm-1', { status: 'INACTIVE' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/members/m-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ status: 'INACTIVE' }),
      }),
    )
  })

  it('deactivateMember envoie DELETE avec credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await service().deactivateMember('t-1', 'm-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/members/m-1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }),
    )
  })

  it('exportMembersCsv télécharge le CSV', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob(['email,displayName\n'])),
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await service().exportMembersCsv('t-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/members/export',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(r.ok).toBe(true)
    expect(r.data).toBeInstanceOf(Blob)
  })

  it('importMembersCsv envoie multipart avec CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=token'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          summary: { success: 1, skipped: 0, error: 0 },
          rows: [],
        }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['email\ntest@example.com\n'], 'members.csv', { type: 'text/csv' })

    await service().importMembersCsv('t-1', file)

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/troupes/t-1/members/import',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'token' }),
      }),
    )
    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get('file')).toBeInstanceOf(File)
  })
})
