import { Injectable } from '@angular/core'

import { csrfHeaders } from '../http/hatcast-csrf'

export type CompositionVisibility =
  | 'none'
  | 'organizerDraft'
  | 'publishedDraft'
  | 'validated'

export interface CompositionSlot {
  roleKey: string
  slotIndex: number
  participantId?: string | null
  participantDisplayName?: string | null
  participationStatus: 'pending' | 'confirmed' | 'declined'
}

export interface CompositionResponse {
  publishedAt?: string | null
  validatedAt?: string | null
  visibility: CompositionVisibility
  slots: CompositionSlot[]
}

@Injectable({ providedIn: 'root' })
export class CompositionApiService {
  async getComposition(
    seasonId: string,
    eventId: string,
  ): Promise<{ ok: boolean; status: number; data?: CompositionResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as CompositionResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async publishComposition(
    seasonId: string,
    eventId: string,
  ): Promise<{ ok: boolean; status: number; data?: CompositionResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition/publish`,
        {
          method: 'POST',
          credentials: 'include',
          headers: csrfHeaders(),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as CompositionResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
