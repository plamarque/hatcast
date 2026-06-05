import { Injectable } from '@angular/core'

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
  async getPreferences(): Promise<ApiResult<UserMemberPreferences>> {
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
