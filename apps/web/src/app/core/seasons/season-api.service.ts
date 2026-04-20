import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export interface TroupeListItem {
  id: string
  name: string
  slug: string
}

export interface SeasonResponse {
  id: string
  troupeId: string
  slug: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  archived: boolean
  active: boolean
  eventCount: number
  participantCount: number
  createdAt: string
  updatedAt: string
}

export interface PagedSeasonsResponse {
  content: SeasonResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateSeasonBody {
  title: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface UpdateSeasonBody {
  title?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
}

@Injectable({ providedIn: 'root' })
export class SeasonApiService {
  async listTroupes(): Promise<{ ok: boolean; status: number; data?: TroupeListItem[] }> {
    try {
      const res = await fetch('/v1/troupes', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as TroupeListItem[]
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async listSeasons(
    troupeId: string,
    page: number,
    size: number,
  ): Promise<{ ok: boolean; status: number; data?: PagedSeasonsResponse }> {
    const q = new URLSearchParams({ page: String(page), size: String(size) })
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/seasons?${q}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PagedSeasonsResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async createSeason(
    troupeId: string,
    body: CreateSeasonBody,
  ): Promise<{ ok: boolean; status: number; data?: SeasonResponse }> {
    try {
      const res = await fetch(`/v1/troupes/${encodeURIComponent(troupeId)}/seasons`, {
        method: 'POST',
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
      const data = (await res.json()) as SeasonResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async updateSeason(
    seasonId: string,
    body: UpdateSeasonBody,
  ): Promise<{ ok: boolean; status: number; data?: SeasonResponse }> {
    try {
      const res = await fetch(`/v1/seasons/${encodeURIComponent(seasonId)}`, {
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
      const data = (await res.json()) as SeasonResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async archiveSeason(
    seasonId: string,
  ): Promise<{ ok: boolean; status: number; data?: SeasonResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/actions/archive`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...csrfHeaders() },
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as SeasonResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async activateSeason(
    seasonId: string,
  ): Promise<{ ok: boolean; status: number; data?: SeasonResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/actions/activate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...csrfHeaders() },
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as SeasonResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
