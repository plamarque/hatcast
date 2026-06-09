import { TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../auth/auth-api.service'
import { TroupeContextService } from '../troupes/troupe-context.service'
import { MemberShellBootstrapService } from './member-shell-bootstrap.service'

describe('MemberShellBootstrapService', () => {
  let service: MemberShellBootstrapService
  let ensureHatcastSession: ReturnType<typeof vi.fn>
  let troupeLoad: ReturnType<typeof vi.fn>
  let sessionUser: ReturnType<typeof signal<{ id: string } | null>>

  beforeEach(() => {
    sessionUser = signal<{ id: string } | null>(null)
    ensureHatcastSession = vi.fn().mockImplementation(async () => {
      sessionUser.set({ id: 'user-1' })
      return {
        ok: true,
        status: 200,
        data: { user: { id: 'user-1', slug: 'alice', email: null, displayName: 'Alice' } },
      }
    })
    troupeLoad = vi.fn().mockResolvedValue(true)

    TestBed.configureTestingModule({
      providers: [
        MemberShellBootstrapService,
        {
          provide: AuthApiService,
          useValue: {
            sessionUser,
            ensureHatcastSession,
          },
        },
        {
          provide: TroupeContextService,
          useValue: { load: troupeLoad },
        },
      ],
    })

    service = TestBed.inject(MemberShellBootstrapService)
  })

  it('bootstrap session and troupes in parallel once', async () => {
    const first = await service.ensureReady()
    const second = await service.ensureReady()

    expect(first).toEqual({ ok: true })
    expect(second).toEqual({ ok: true })
    expect(ensureHatcastSession).toHaveBeenCalledTimes(1)
    expect(troupeLoad).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent ensureReady calls', async () => {
    const pending = Promise.all([service.ensureReady(), service.ensureReady(), service.ensureReady()])
    await pending

    expect(ensureHatcastSession).toHaveBeenCalledTimes(1)
    expect(troupeLoad).toHaveBeenCalledTimes(1)
  })

  it('returns failure when session is unauthorized', async () => {
    ensureHatcastSession.mockResolvedValue({ ok: false, status: 401 })

    const result = await service.ensureReady()

    expect(result).toEqual({ ok: false, status: 401 })
    expect(troupeLoad).toHaveBeenCalledTimes(1)
  })

  it('allows shell entry when troupe load fails but session is valid', async () => {
    troupeLoad.mockResolvedValue(false)

    const result = await service.ensureReady()

    expect(result).toEqual({ ok: true })
    expect(ensureHatcastSession).toHaveBeenCalledTimes(1)
    expect(troupeLoad).toHaveBeenCalledTimes(1)
  })

  it('returns failure when ensure fails even if sessionUser signal is stale', async () => {
    ensureHatcastSession.mockResolvedValue({ ok: false, status: 401 })
    sessionUser.set({ id: 'user-1' })

    const result = await service.ensureReady()

    expect(result).toEqual({ ok: false, status: 401 })
  })

  it('does not memoize when invalidated during in-flight bootstrap', async () => {
    let releaseSession!: () => void
    const sessionGate = new Promise<void>((resolve) => {
      releaseSession = resolve
    })
    ensureHatcastSession.mockImplementation(async () => {
      await sessionGate
      sessionUser.set({ id: 'user-1' })
      return { ok: true, status: 200 }
    })

    const pending = service.ensureReady()
    await vi.waitFor(() => expect(ensureHatcastSession).toHaveBeenCalled())
    service.invalidate()
    releaseSession()

    await expect(pending).resolves.toEqual({ ok: false, status: 401 })

    ensureHatcastSession.mockClear()
    troupeLoad.mockClear()

    await service.ensureReady()

    expect(ensureHatcastSession).toHaveBeenCalledTimes(1)
  })

  it('invalidates memo so the next ensureReady refetches', async () => {
    await service.ensureReady()
    service.invalidate()

    ensureHatcastSession.mockClear()
    troupeLoad.mockClear()

    await service.ensureReady()

    expect(ensureHatcastSession).toHaveBeenCalledTimes(1)
    expect(troupeLoad).toHaveBeenCalledTimes(1)
  })

  it('refetches when session user id changes', async () => {
    await service.ensureReady()

    sessionUser.set({ id: 'user-2' })
    ensureHatcastSession.mockClear()
    troupeLoad.mockClear()

    await service.ensureReady()

    expect(ensureHatcastSession).toHaveBeenCalledTimes(1)
    expect(troupeLoad).toHaveBeenCalledTimes(1)
  })
})
