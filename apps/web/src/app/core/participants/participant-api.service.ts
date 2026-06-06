import { Injectable } from '@angular/core'

import { effectiveMemberGender, type MemberGender } from '../account/member-gender'
import { csrfHeaders } from '../http/hatcast-csrf'

export type InvitationScope = 'SEASON' | 'EVENT'

export type ParticipantKind = 'MEMBER' | 'EXTERNE' | 'LINKED' | 'MANAGED' | 'NAME_ONLY'

export interface SeasonParticipantAdmin {
  id: string
  displayName: string
  email: string | null
  userId: string | null
  troupeMembershipId: string | null
  invitationScope?: InvitationScope | null
  kind: ParticipantKind
  status: 'ACTIVE' | 'REMOVED'
  removable: boolean
  avatarUrl?: string | null
  gender?: MemberGender
  participantGender?: MemberGender | null
  genderManagedOnAccount?: boolean
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
  avatarUrl?: string | null
  gender?: MemberGender
  participantGender?: MemberGender | null
  genderManagedOnAccount?: boolean
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
  userId?: string | null
  gender?: MemberGender
}

type ApiResponse<T> = { ok: boolean; status: number; data?: T }
type ApiResult<T> = Promise<ApiResponse<T>>

@Injectable({ providedIn: 'root' })
export class ParticipantApiService {
  async listSeasonParticipants(seasonId: string): ApiResult<SeasonParticipantAdmin[]> {
    const result = await this.getList<SeasonParticipantAdmin>(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants`,
    )
    return this.normalizeParticipantRows(result)
  }

  async createSeasonParticipant(
    seasonId: string,
    body: {
      displayName: string
      email?: string
      gender?: MemberGender
      invitationScope?: InvitationScope
      troupeMembershipId?: string
    },
  ): ApiResult<SeasonParticipantAdmin> {
    return this.postJson(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants`,
      body,
    )
  }

  async updateSeasonParticipant(
    seasonId: string,
    participantId: string,
    body: { displayName: string; email?: string; gender?: MemberGender },
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

  async reincludeSeasonParticipant(
    seasonId: string,
    participantId: string,
  ): ApiResult<void> {
    return this.postNoContent(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants/${encodeURIComponent(participantId)}/reinclude`,
    )
  }

  async listSeasonParticipantSelectors(seasonId: string): ApiResult<ParticipantSelector[]> {
    const result = await this.getList<ParticipantSelector>(
      `/v1/seasons/${encodeURIComponent(seasonId)}/participants/selectors`,
    )
    if (!result.ok || !result.data) {
      return result
    }
    return {
      ...result,
      data: result.data.map((row) => ({
        ...row,
        gender: effectiveMemberGender(row.gender),
      })),
    }
  }

  async listEventParticipantRoster(
    seasonId: string,
    eventId: string,
  ): ApiResult<EventRosterParticipant[]> {
    const result = await this.getList<EventRosterParticipant>(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/participants/roster`,
    )
    return this.normalizeParticipantRows(result)
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
    body: {
      displayName: string
      email?: string
      gender?: MemberGender
      addToSeasonRoster?: boolean
      troupeMembershipId?: string
    },
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
    body: { displayName: string; email?: string; gender?: MemberGender },
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

  private normalizeParticipantRows<T extends { gender?: MemberGender; participantGender?: MemberGender | null }>(
    result: ApiResponse<T[]>,
  ): ApiResponse<T[]> {
    if (!result.ok || !result.data) {
      return result
    }
    return {
      ...result,
      data: result.data.map((row) => ({
        ...row,
        gender: effectiveMemberGender(row.gender),
        participantGender:
          row.participantGender == null
            ? null
            : effectiveMemberGender(row.participantGender),
      })),
    }
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

  private async postNoContent(url: string): ApiResult<void> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { ...csrfHeaders() },
      })
      return { ok: res.ok, status: res.status }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
