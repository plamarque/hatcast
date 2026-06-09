import { Injectable, signal } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

import { effectiveMemberGender, type MemberGender } from './member-gender'

export interface UserMemberPreferences {
  memberDisplayName: string
  preferredRoleKeys: string[]
  gender: MemberGender
}

export type ApiResult<T> = { ok: boolean; status: number; data?: T }

@Injectable({ providedIn: 'root' })
export class MePreferencesApiService {
  private cached: ApiResult<UserMemberPreferences> | null = null
  private inFlight: Promise<ApiResult<UserMemberPreferences>> | null = null
  private cacheGeneration = 0
  private readonly cacheRevisionSignal = signal(0)

  /** Bumps when preferences cache is cleared — parents can reload viewer gender. */
  readonly cacheRevision = this.cacheRevisionSignal.asReadonly()

  /** Clears session memo — call after PATCH preferences or logout. */
  invalidateCache(): void {
    this.cacheGeneration++
    this.cached = null
    this.inFlight = null
    this.cacheRevisionSignal.update((revision) => revision + 1)
  }

  async getPreferences(): Promise<ApiResult<UserMemberPreferences>> {
    if (this.cached) {
      return this.cached
    }
    if (this.inFlight) {
      return this.inFlight
    }
    const generation = this.cacheGeneration
    this.inFlight = this.fetchPreferences().finally(() => {
      this.inFlight = null
    })
    const result = await this.inFlight
    if (result.ok && generation === this.cacheGeneration) {
      this.cached = result
    }
    return result
  }

  async patchPreferences(body: {
    memberDisplayName?: string
    preferredRoleKeys?: string[]
    gender?: MemberGender
  }): Promise<ApiResult<UserMemberPreferences>> {
    try {
      const res = await fetch('/v1/me/preferences', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as UserMemberPreferences
      const result: ApiResult<UserMemberPreferences> = {
        ok: true,
        status: res.status,
        data: { ...data, gender: effectiveMemberGender(data.gender) },
      }
      this.invalidateCache()
      return result
    } catch {
      return { ok: false, status: 0 }
    }
  }

  private async fetchPreferences(): Promise<ApiResult<UserMemberPreferences>> {
    try {
      const res = await fetch('/v1/me/preferences', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as UserMemberPreferences
      return {
        ok: true,
        status: res.status,
        data: { ...data, gender: effectiveMemberGender(data.gender) },
      }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
