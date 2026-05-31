import { Injectable } from '@angular/core'

import type { AvailabilityStatus } from '../availability/availability-status'
import type { TeamStatusBadge } from '../composition/composition-lifecycle'
import { csrfHeaders } from '../http/hatcast-csrf'

export interface EventResponse {
  id: string
  seasonId: string
  slug: string
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
  participantFocus?: {
    availabilityStatus: AvailabilityStatus
    compositionRoleKey?: string | null
    inTeam: boolean
    slotParticipationStatus?: 'pending' | 'confirmed' | 'declined' | null
  }
  compositionLifecycle?: string
  teamStatusBadge?: TeamStatusBadge
  compositionPublishedAt?: string | null
    /** Null = principal category (ADR-0013). */
  category?: string | null
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
  slug?: string
  category?: string | null
}

export interface UpdateEventBody {
  title?: string | null
  startsAt?: string | null
  description?: string | null
  location?: string | null
  templateType?: string
  roleSlots?: Record<string, number>
  slug?: string
  /** Send JSON `null` to clear; omit field to leave unchanged. */
  category?: string | null
}

export type EventListScope = 'all' | 'upcoming' | 'past'

export type EventMutationResult = {
  ok: boolean
  status: number
  data?: EventResponse
  errorMessage?: string
}

async function readApiErrorMessage(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { message?: string }
    const message = body.message?.trim()
    return message || undefined
  } catch {
    return undefined
  }
}

@Injectable({ providedIn: 'root' })
export class EventApiService {
  async getEventBySlug(
    seasonId: string,
    eventSlug: string,
  ): Promise<{ ok: boolean; status: number; data?: EventResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/by-slug/${encodeURIComponent(eventSlug)}`,
        { credentials: 'include' },
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

  async getEvent(
    seasonId: string,
    eventId: string,
  ): Promise<{ ok: boolean; status: number; data?: EventResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}`,
        { credentials: 'include' },
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

  async listEvents(
    seasonId: string,
    page: number,
    size: number,
    scope: EventListScope,
    options: { participantId?: string | null } = {},
  ): Promise<{ ok: boolean; status: number; data?: PagedEventsResponse }> {
    const q = new URLSearchParams({
      page: String(page),
      size: String(size),
      scope,
    })
    if (options.participantId) {
      q.set('participantId', options.participantId)
    }
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

  async createEvent(seasonId: string, body: CreateEventBody): Promise<EventMutationResult> {
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
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
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
  ): Promise<EventMutationResult> {
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
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
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
