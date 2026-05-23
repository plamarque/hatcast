import { Injectable } from '@angular/core'

import type { AvailabilityStatus } from '../availability/availability-status'
import { csrfHeaders } from '../http/hatcast-csrf'

export interface EventResponse {
  id: string
  seasonId: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  archived: boolean
  templateType: string
  roleSlots: Record<string, number>
  createdAt: string
  updatedAt: string
  myAvailabilityStatus?: AvailabilityStatus
}

export interface PagedEventsResponse {
  content: EventResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateEventBody {
  title: string
  startsAt: string
  description?: string | null
  location?: string | null
  templateType?: string
  roleSlots?: Record<string, number>
}

export interface UpdateEventBody {
  title?: string | null
  startsAt?: string | null
  description?: string | null
  location?: string | null
  templateType?: string
  roleSlots?: Record<string, number>
}

export type EventListScope = 'all' | 'upcoming'

@Injectable({ providedIn: 'root' })
export class EventApiService {
  async listEvents(
    seasonId: string,
    page: number,
    size: number,
    scope: EventListScope,
  ): Promise<{ ok: boolean; status: number; data?: PagedEventsResponse }> {
    const q = new URLSearchParams({
      page: String(page),
      size: String(size),
      scope,
    })
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events?${q}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as PagedEventsResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async createEvent(
    seasonId: string,
    body: CreateEventBody,
  ): Promise<{ ok: boolean; status: number; data?: EventResponse }> {
    try {
      const res = await fetch(`/v1/seasons/${encodeURIComponent(seasonId)}/events`, {
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
      const data = (await res.json()) as EventResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async updateEvent(
    seasonId: string,
    eventId: string,
    body: UpdateEventBody,
  ): Promise<{ ok: boolean; status: number; data?: EventResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...csrfHeaders(),
          },
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as EventResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async archiveEvent(
    seasonId: string,
    eventId: string,
  ): Promise<{ ok: boolean; status: number; data?: EventResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/actions/archive`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...csrfHeaders() },
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as EventResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
