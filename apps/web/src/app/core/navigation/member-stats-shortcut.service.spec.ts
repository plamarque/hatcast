import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../auth/auth-api.service'
import { MemberStatsShortcutService } from './member-stats-shortcut.service'

describe('MemberStatsShortcutService', () => {
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    auth = { ensureHatcastSession: vi.fn() }
    TestBed.configureTestingModule({
      providers: [
        MemberStatsShortcutService,
        { provide: AuthApiService, useValue: auth },
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
})
