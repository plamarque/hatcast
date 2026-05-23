import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export interface OrganizerResponse {
  userId: string
  email: string
  displayName: string | null
  grantedAt: string
}

export interface MySeasonPermissions {
  canManageSeasonOrganizers: boolean
  canManageEventOrganizers: boolean
  canManageMembers: boolean
  canManageSeasons: boolean
  canManageEvents: boolean
  canManageSeasonParticipants: boolean
  canManageEventParticipants: boolean
  isTroupeAdmin: boolean
  isSeasonOrganizer: boolean
  eventOrganizerFor: string[]
  eventParticipantAdminFor: string[]
}

type ApiResult<T> = Promise<{ ok: boolean; status: number; data?: T }>

@Injectable({ providedIn: 'root' })
export class OrganizerApiService {
  async listSeasonOrganizers(seasonId: string): ApiResult<OrganizerResponse[]> {
    return this.getList(`/v1/seasons/${encodeURIComponent(seasonId)}/organizers`)
  }

  async addSeasonOrganizer(
    seasonId: string,
    email: string,
  ): ApiResult<OrganizerResponse> {
    return this.postOrganizer(
      `/v1/seasons/${encodeURIComponent(seasonId)}/organizers`,
      email,
    )
  }

  async removeSeasonOrganizer(
    seasonId: string,
    userId: string,
  ): ApiResult<void> {
    return this.deleteResource(
      `/v1/seasons/${encodeURIComponent(seasonId)}/organizers/${encodeURIComponent(userId)}`,
    )
  }

  async listEventOrganizers(
    seasonId: string,
    eventId: string,
  ): ApiResult<OrganizerResponse[]> {
    return this.getList(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/organizers`,
    )
  }

  async addEventOrganizer(
    seasonId: string,
    eventId: string,
    email: string,
  ): ApiResult<OrganizerResponse> {
    return this.postOrganizer(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/organizers`,
      email,
    )
  }

  async removeEventOrganizer(
    seasonId: string,
    eventId: string,
    userId: string,
  ): ApiResult<void> {
    return this.deleteResource(
      `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/organizers/${encodeURIComponent(userId)}`,
    )
  }

  async mySeasonPermissions(seasonId: string): ApiResult<MySeasonPermissions> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/permissions/me`,
        { credentials: 'include' },
      )
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as MySeasonPermissions }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  private async getList(url: string): ApiResult<OrganizerResponse[]> {
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as OrganizerResponse[] }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  private async postOrganizer(url: string, email: string): ApiResult<OrganizerResponse> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as OrganizerResponse }
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
