import { Injectable } from '@angular/core'

import { effectiveMemberGender, type MemberGender } from '../account/member-gender'
import type { UserAgendaParticipationFilters } from '../agenda/user-agenda-api.service'
import type {
  FavoriteRoleCount,
  MemberProfileMonth,
  MemberProfileStats,
} from '../member-profile/member-profile-api.service'

export interface MemberSeasonGlance {
  userId: string
  userSlug: string
  displayName: string
  avatarUrl: string | null
  isSelf: boolean
  resolvedSeasonId: string
  troupeId: string
  preferredRolesTroupeId: string
  filterBarVisible: boolean
  participationFilters: UserAgendaParticipationFilters | null
  stats?: MemberProfileStats | null
  monthlyChart: MemberProfileMonth[]
  favoriteRoleCounts: FavoriteRoleCount[]
  preferredRoleKeys?: string[] | null
  gender?: MemberGender
}

export type ApiResult<T> = { ok: boolean; status: number; data?: T; errorMessage?: string }

@Injectable({ providedIn: 'root' })
export class MemberSeasonGlanceApiService {
  async getSeasonGlance(
    userSlug: string,
    filters?: { troupeId?: string; seasonId?: string },
  ): Promise<ApiResult<MemberSeasonGlance>> {
    const params = new URLSearchParams()
    if (filters?.troupeId) {
      params.set('troupeId', filters.troupeId)
    }
    if (filters?.seasonId) {
      params.set('seasonId', filters.seasonId)
    }
    const qs = params.toString()
    const url = `/v1/members/${encodeURIComponent(userSlug)}/season-glance${qs ? `?${qs}` : ''}`
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        let errorMessage: string | undefined
        try {
          const body = (await res.json()) as { message?: string }
          errorMessage = body.message
        } catch {
          // ignore
        }
        return { ok: false, status: res.status, errorMessage }
      }
      const raw = (await res.json()) as MemberSeasonGlance
      const data: MemberSeasonGlance = {
        ...raw,
        gender: effectiveMemberGender(raw.gender),
      }
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
