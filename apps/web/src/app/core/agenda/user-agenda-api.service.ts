import { Injectable } from '@angular/core'

import type { AvailabilityStatus } from '../availability/availability-status'

export interface UserAgendaItem {
  eventId: string
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
}

export interface UserAgendaResponse {
  content: UserAgendaItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  filterBarVisible: boolean
  noParticipation: boolean
}

export interface UserAgendaListParams {
  page?: number
  size?: number
  scope?: 'upcoming'
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
