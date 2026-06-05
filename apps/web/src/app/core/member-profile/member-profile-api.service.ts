import { Injectable } from '@angular/core'

import { effectiveMemberGender, type MemberGender } from '../account/member-gender'
import { csrfHeaders } from '../http/hatcast-csrf'
import type { ParticipationChartStatus } from '../participation/participation-status'

export interface MemberProfileStat {
  count: number
  percent: number
  tooltip?: string | null
}

export interface MemberProfileStats {
  availabilities: MemberProfileStat
  selections: MemberProfileStat
  declines: MemberProfileStat
}

export interface MemberProfileChartBlock {
  eventId: string
  status: ParticipationChartStatus | (string & {})
  eventTitle: string
  eventDate: string
  roleKey?: string | null
}

export interface MemberProfileMonth {
  monthKey: string
  blocks: MemberProfileChartBlock[]
}

export interface FavoriteRoleCount {
  roleKey: string
  count: number
}

export interface MemberProfileSummary {
  userId: string
  membershipId: string
  displayName: string
  avatarUrl: string | null
  isSelf: boolean
  stats?: MemberProfileStats | null
  monthlyChart: MemberProfileMonth[]
  favoriteRoleCounts: FavoriteRoleCount[]
  preferredRoleKeys?: string[] | null
  gender?: MemberGender
}

export interface PreferredRolesResponse {
  preferredRoleKeys: string[]
}

export type ApiResult<T> = { ok: boolean; status: number; data?: T }

@Injectable({ providedIn: 'root' })
export class MemberProfileApiService {
  async getProfileSummary(
    seasonId: string,
    userId: string,
  ): Promise<ApiResult<MemberProfileSummary>> {
    try {
      const res = await fetch(`/v1/seasons/${seasonId}/member-profile/${userId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const raw = (await res.json()) as MemberProfileSummary
      const data: MemberProfileSummary = {
        ...raw,
        gender: effectiveMemberGender(raw.gender),
      }
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async getPreferredRoles(troupeId: string): Promise<ApiResult<PreferredRolesResponse>> {
    try {
      const res = await fetch(`/v1/troupes/${troupeId}/memberships/me/preferred-roles`, {
        credentials: 'include',
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PreferredRolesResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async updatePreferredRoles(
    troupeId: string,
    preferredRoleKeys: string[],
  ): Promise<ApiResult<PreferredRolesResponse>> {
    try {
      const res = await fetch(`/v1/troupes/${troupeId}/memberships/me/preferred-roles`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ preferredRoleKeys }),
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PreferredRolesResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
