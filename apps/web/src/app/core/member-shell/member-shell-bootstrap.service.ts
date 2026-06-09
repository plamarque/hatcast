import { effect, Injectable, inject } from '@angular/core'

import { AuthApiService } from '../auth/auth-api.service'
import { TroupeContextService } from '../troupes/troupe-context.service'

export type MemberShellBootstrapResult = { ok: true } | { ok: false; status: number }

@Injectable({ providedIn: 'root' })
export class MemberShellBootstrapService {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)

  private bootstrappedUserId: string | null = null
  private bootstrapInFlight: Promise<MemberShellBootstrapResult> | null = null
  private bootstrapGeneration = 0

  constructor() {
    effect(() => {
      const userId = this.auth.sessionUser()?.id ?? null
      if (userId == null && this.bootstrappedUserId != null) {
        this.invalidate()
      }
    })
  }

  /** Session + troupes once per shell user; dedup concurrent callers (PERF-09). */
  async ensureReady(): Promise<MemberShellBootstrapResult> {
    const userId = this.auth.sessionUser()?.id ?? null
    if (userId != null && userId === this.bootstrappedUserId) {
      return { ok: true }
    }

    if (this.bootstrapInFlight) {
      return this.bootstrapInFlight
    }

    const generation = this.bootstrapGeneration
    const flight = this.runBootstrap()
    this.bootstrapInFlight = flight
    try {
      const result = await flight
      if (generation !== this.bootstrapGeneration) {
        return { ok: false, status: 401 }
      }
      if (result.ok) {
        this.bootstrappedUserId = this.auth.sessionUser()?.id ?? null
      } else {
        this.bootstrappedUserId = null
      }
      return result
    } finally {
      if (this.bootstrapInFlight === flight) {
        this.bootstrapInFlight = null
      }
    }
  }

  /** Clears memo after logout or failed auth — next ensureReady refetches. */
  invalidate(): void {
    this.bootstrapGeneration++
    this.bootstrappedUserId = null
  }

  private async runBootstrap(): Promise<MemberShellBootstrapResult> {
    const [session] = await Promise.all([
      this.auth.ensureHatcastSession(),
      this.troupeContext.load(),
    ])

    if (!session.ok) {
      return { ok: false, status: session.status }
    }

    // Troupe list failure must not block shell entry — pages handle loadError (PERF-09).
    return { ok: true }
  }
}
