import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'
import type { AvailabilityStatus } from './availability-status'

export interface MyAvailabilityResponse {
  status: AvailabilityStatus
  updatedAt?: string | null
  roleKeys: string[]
}

export interface SetMyAvailabilityBody {
  status: AvailabilityStatus
  roleKeys?: string[]
  applyVolunteerRule?: boolean
}

@Injectable({ providedIn: 'root' })
export class AvailabilityApiService {
  async getMyAvailability(
    seasonId: string,
    eventId: string,
  ): Promise<{ ok: boolean; status: number; data?: MyAvailabilityResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/availability/me`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MyAvailabilityResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async setMyAvailability(
    seasonId: string,
    eventId: string,
    body: SetMyAvailabilityBody,
  ): Promise<{ ok: boolean; status: number; data?: MyAvailabilityResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/availability/me`,
        {
          method: 'PUT',
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
      const data = (await res.json()) as MyAvailabilityResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
