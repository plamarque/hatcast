import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export type ParticipantKind = 'MEMBER' | 'LINKED' | 'MANAGED' | 'NAME_ONLY'

export interface SeasonParticipantAdmin {
  id: string
  displayName: string
  email: string | null
  userId: string | null
  troupeMembershipId: string | null
  kind: ParticipantKind
  status: 'ACTIVE' | 'REMOVED'
  removable: boolean
}

export type EventRosterSource = 'SEASON' | 'EVENT'

export interface EventRosterParticipant {
  seasonParticipantId: string | null
  eventParticipantId: string | null
  displayName: string
  email: string | null
  userId: string | null
  kind: ParticipantKind
  source: EventRosterSource
}

export interface EventParticipantAdmin {
  id: string
  displayName: string
  email: string | null
  userId: string | null
  kind: ParticipantKind
  status: 'ACTIVE' | 'REMOVED'
}

export interface ParticipantSelector {
  id: string
  displayName: string
  avatarUrl: string | null
  kind: ParticipantKind
}

type ApiResult<T> = Promise<{ ok: boolean; status: number; data?: T }>

@Injectable({ providedIn: 'root' })
export class ParticipantApiService {
  async listSeasonParticipants(seasonId: string): ApiResult<SeasonParticipantAdmin[]> {
    return this.getList(`/v1/seasons/${encodeURIComponent(seasonId)}/participants`)
  }

  async createSeasonParticipant(
    seasonId: string,
    body: { displayName: string; email?: string },
  ): ApiResult<SeasonParticipantAdmin> {
    return this.postJson(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants`,
      body,
    )
  }

  async updateSeasonParticipant(
    seasonId: string,
    participantId: string,
    body: { displayName: string; email?: string },
  ): ApiResult<SeasonParticipantAdmin> {
    return this.patchJson(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants/${encodeURIComponent(participantId)}`,
      body,
    )
  }

  async removeSeasonParticipant(
    seasonId: string,
    participantId: string,
  ): ApiResult<void> {
    return this.deleteResource(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants/${encodeURIComponent(participantId)}`,
    )
  }

  async listSeasonParticipantSelectors(seasonId: string): ApiResult<ParticipantSelector[]> {
    return this.getList(`/v1/seasons/${encodeURIComponent(seasonId)}/participants/selectors`)
  }

  async listEventParticipantRoster(
    seasonId: string,
    eventId: string,
  ): ApiResult<EventRosterParticipant[]> {
    return this.getList(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants/roster`,
    )
  }

  async excludeSeasonParticipantFromEvent(
    seasonId: string,
    eventId: string,
    seasonParticipantId: string,
  ): ApiResult<void> {
    return this.deleteResource(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants/roster/season/${encodeURIComponent(seasonParticipantId)}`,
    )
  }

  async listEventParticipants(
    seasonId: string,
    eventId: string,
  ): ApiResult<EventParticipantAdmin[]> {
    return this.getList(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants`,
    )
  }

  async createEventParticipant(
    seasonId: string,
    eventId: string,
    body: { displayName: string; email?: string },
  ): ApiResult<EventParticipantAdmin> {
    return this.postJson(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants`,
      body,
    )
  }

  async updateEventParticipant(
    seasonId: string,
    eventId: string,
    participantId: string,
    body: { displayName: string; email?: string },
  ): ApiResult<EventParticipantAdmin> {
    return this.patchJson(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants/${encodeURIComponent(participantId)}`,
      body,
    )
  }

  async removeEventParticipant(
    seasonId: string,
    eventId: string,
    participantId: string,
  ): ApiResult<void> {
    return this.deleteResource(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants/${encodeURIComponent(participantId)}`,
    )
  }

  private async getList<T>(url: string): ApiResult<T[]> {
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as T[] }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  private async postJson<T>(url: string, body: unknown): ApiResult<T> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(body),
      })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as T }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  private async patchJson<T>(url: string, body: unknown): ApiResult<T> {
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(body),
      })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as T }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  private async deleteResource(url: string): ApiResult<void> {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...csrfHeaders() },
      })
      return { ok: res.ok, status: res.status }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
