import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../auth/auth-api.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { MemberStatsShortcutService } from './member-stats-shortcut.service'

describe('MemberStatsShortcutService', () => {
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> }
  let resolver: { resolveSeasonSlugReadOnly: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    auth = { ensureHatcastSession: vi.fn() }
    resolver = { resolveSeasonSlugReadOnly: vi.fn() }
    installStorage()
    TestBed.configureTestingModule({
      providers: [
        MemberStatsShortcutService,
        { provide: AuthApiService, useValue: auth },
        { provide: TroupeSeasonResolverService, useValue: resolver },
      ],
    })
  })

  it('resolves link from session user slug', async () => {
    auth.ensureHatcastSession.mockResolvedValue({
      ok: true,
      data: { user: { slug: 'patrice-dupont' } },
    })

    const service = TestBed.inject(MemberStatsShortcutService)
    await service.refresh()

    expect(service.userSlug()).toBe('patrice-dupont')
    expect(service.link()).toBe('/membre/patrice-dupont')
  })

  it('falls back to accueil when session has no slug', async () => {
    auth.ensureHatcastSession.mockResolvedValue({ ok: false })

    const service = TestBed.inject(MemberStatsShortcutService)
    await service.refresh()

    expect(service.userSlug()).toBeNull()
    expect(service.link()).toBe('/accueil')
  })

  it('uses the resolved last-visited scope without selecting a troupe', async () => {
    localStorage.setItem('lastVisitedSeason', 'malice-2025-2026')
    auth.ensureHatcastSession.mockResolvedValue({
      ok: true,
      data: { user: { slug: 'patrice-dupont' } },
    })
    resolver.resolveSeasonSlugReadOnly.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 'malice', slug: 'la-malice' },
      season: { id: 'season-malice' },
    })

    const service = TestBed.inject(MemberStatsShortcutService)
    await service.refresh()

    expect(resolver.resolveSeasonSlugReadOnly).toHaveBeenCalledWith('malice-2025-2026')
    expect(service.queryParams()).toEqual({ troupeId: 'malice', seasonId: 'season-malice' })
    expect(service.ready()).toBe(true)
  })

  it('waits for resolution and then safely falls back to the unscoped link', async () => {
    auth.ensureHatcastSession.mockResolvedValue({
      ok: true,
      data: { user: { slug: 'patrice-dupont' } },
    })
    let complete!: (value: { kind: 'not-found' }) => void
    resolver.resolveSeasonSlugReadOnly.mockReturnValue(new Promise((resolve) => { complete = resolve }))
    localStorage.setItem('lastVisitedSeason', 'missing')

    const service = TestBed.inject(MemberStatsShortcutService)
    const refresh = service.refresh()
    await Promise.resolve()
    expect(service.ready()).toBe(false)

    complete({ kind: 'not-found' })
    await refresh
    expect(service.ready()).toBe(true)
    expect(service.link()).toBe('/membre/patrice-dupont')
    expect(service.queryParams()).toBeNull()
  })
})

function installStorage(): void {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    },
  })
}
