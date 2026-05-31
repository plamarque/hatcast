import { Injectable } from '@angular/core'

import type { AvailabilityStatus } from '../availability/availability-status'
import type { TeamStatusBadge } from '../composition/composition-lifecycle'

export interface UserAgendaItem {
  eventId: string
  eventSlug: string
  title: string
  startsAt: string
  location: string | null
  troupeId: string
  troupeName: string
  troupeSlug: string
  leagueId: string
  leagueSlug: string
  leagueTitle: string
  myAvailabilityStatus: AvailabilityStatus | null
  teamStatusBadge?: TeamStatusBadge | null
}

export interface UserAgendaTroupeFilter {
  id: string
  name: string
  slug: string
}

export interface UserAgendaLeagueFilter {
  id: string
  title: string
  slug: string
  troupeId: string
}

export interface UserAgendaParticipationFilters {
  troupes: UserAgendaTroupeFilter[]
  leagues: UserAgendaLeagueFilter[]
}

export interface UserAgendaResponse {
  content: UserAgendaItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  filterBarVisible: boolean
  noParticipation: boolean
  participationFilters?: UserAgendaParticipationFilters | null
}

export interface UserAgendaListParams {
  page?: number
  size?: number
  scope?: 'upcoming'
  troupeId?: string
  leagueId?: string
}

@Injectable({ providedIn: 'root' })
export class UserAgendaApiService {
  async listAgenda(
    params: UserAgendaListParams = {},
  ): Promise<{ ok: boolean; status: number; data?: UserAgendaResponse }> {
    const q = new URLSearchParams({
      page: String(params.page ?? 0),
      size: String(params.size ?? 50),
      scope: params.scope ?? 'upcoming',
    })
    if (params.troupeId) {
      q.set('troupeId', params.troupeId)
    }
    if (params.leagueId) {
      q.set('leagueId', params.leagueId)
    }

    try {
      const res = await fetch(`/v1/me/agenda?${q}`, { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as UserAgendaResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
