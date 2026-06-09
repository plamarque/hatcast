import { signal, type Signal } from '@angular/core'
import { vi } from 'vitest'

import type { UserSummary } from '../core/auth/auth-api.service'
import { MemberShellBootstrapService } from '../core/member-shell/member-shell-bootstrap.service'

export type MockAuthWithSessionUser = {
  sessionUser: Signal<UserSummary | null>
  ensureHatcastSession: ReturnType<typeof vi.fn>
  logout?: ReturnType<typeof vi.fn>
}

export function mockAuthSessionUser(user: UserSummary | null = null): MockAuthWithSessionUser {
  const sessionUser = signal<UserSummary | null>(user)
  return {
    sessionUser,
    ensureHatcastSession: vi.fn().mockImplementation(async () => {
      const current = sessionUser()
      if (!current) {
        return { ok: false, status: 401 }
      }
      return {
        ok: true,
        status: 200,
        data: { user: current, platformAdmin: false },
      }
    }),
    logout: vi.fn().mockResolvedValue(true),
  }
}

export function provideMockMemberShellBootstrap(
  bootstrap: Pick<MemberShellBootstrapService, 'ensureReady' | 'invalidate'> = {
    ensureReady: vi.fn().mockResolvedValue({ ok: true }),
    invalidate: vi.fn(),
  },
) {
  return { provide: MemberShellBootstrapService, useValue: bootstrap }
}
