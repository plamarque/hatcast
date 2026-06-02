import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'
import type { TroupeAdminSummary } from '../troupes/troupe-api.service'

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

export interface PlatformAdminSeasonResolution {
  troupe: TroupeAdminSummary
  season: SeasonResponse
}

@Injectable({ providedIn: 'root' })
export class SeasonApiService {
  async getSeason(seasonId: string): Promise<{ ok: boolean; status: number; data?: SeasonResponse }> {
    try {
      const res = await fetch(`/v1/seasons/${encodeURIComponent(seasonId)}`, {
        credentials: 'include',
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

  async getSeasonBySlug(
    troupeId: string,
    slug: string,
  ): Promise<{ ok: boolean; status: number; data?: SeasonResponse }> {
    try {
      const res = await fetch(
        `/v1/troupes/${encodeURIComponent(troupeId)}/seasons/by-slug/${encodeURIComponent(slug)}`,
        { credentials: 'include' },
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

  /** Admin plateforme : résout une saison par slug dans toutes les troupes. */
  async resolveAdminSeasonBySlug(
    slug: string,
  ): Promise<{ ok: boolean; status: number; data?: PlatformAdminSeasonResolution[] }> {
    try {
      const res = await fetch(
        `/v1/admin/seasons/by-slug/${encodeURIComponent(slug)}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PlatformAdminSeasonResolution[]
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

  async deleteSeason(seasonId: string): Promise<{ ok: boolean; status: number }> {
    try {
      const res = await fetch(`/v1/seasons/${encodeURIComponent(seasonId)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...csrfHeaders() },
      })
      if (res.status !== 204) {
        return { ok: false, status: res.status }
      }
      return { ok: true, status: res.status }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
