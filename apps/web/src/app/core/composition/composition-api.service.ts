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
  chancePercent?: number | null
  pastSelectionCount?: number | null
}

export interface CompositionDrawStepCandidate {
  participantId: string
  displayName: string
  chancePercent: number
  weight: number
}

export interface CompositionDrawStep {
  roleKey: string
  slotIndex: number
  candidates: CompositionDrawStepCandidate[]
  selectedParticipantId: string | null
  randomValue: number | null
  totalWeight: number
}

export interface CompositionDrawResponse {
  composition: CompositionResponse
  steps: CompositionDrawStep[]
}

export interface CompositionCandidate {
  participantId: string
  displayName: string
  chancePercent: number
  pastSelectionCount: number
  alreadyAssignedRoleKeys?: string[] | null
}

export interface CompositionCandidateListResponse {
  roleKey: string
  requiredCount: number
  candidates: CompositionCandidate[]
}

export interface CompositionResponse {
  publishedAt?: string | null
  validatedAt?: string | null
  visibility: CompositionVisibility
  slots: CompositionSlot[]
}

export interface CompositionApiError {
  ok: false
  status: number
  errorMessage?: string
}

type CompositionApiResult<T> = ({ ok: true; status: number; data: T } | CompositionApiError) & {
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
  ): Promise<CompositionApiResult<CompositionResponse>> {
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
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as CompositionResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async validateComposition(
    seasonId: string,
    eventId: string,
  ): Promise<CompositionApiResult<CompositionResponse>> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition/validate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: csrfHeaders(),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as CompositionResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async unlockComposition(
    seasonId: string,
    eventId: string,
  ): Promise<CompositionApiResult<CompositionResponse>> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition/unlock`,
        {
          method: 'POST',
          credentials: 'include',
          headers: csrfHeaders(),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as CompositionResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async drawComposition(
    seasonId: string,
    eventId: string,
    mode: 'full' | 'fillEmpty' = 'full',
  ): Promise<{ ok: boolean; status: number; data?: CompositionDrawResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition/draw`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...csrfHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode }),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as CompositionDrawResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async getCompositionCandidates(
    seasonId: string,
    eventId: string,
    roleKey: string,
    slotIndex: number,
  ): Promise<CompositionApiResult<CompositionCandidateListResponse>> {
    try {
      const params = new URLSearchParams({ roleKey, slotIndex: String(slotIndex) })
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition/candidates?${params}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as CompositionCandidateListResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }

  async assignCompositionSlot(
    seasonId: string,
    eventId: string,
    roleKey: string,
    slotIndex: number,
    participantId: string | null,
  ): Promise<CompositionApiResult<CompositionResponse>> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/composition/slots/${encodeURIComponent(roleKey)}/${slotIndex}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            ...csrfHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ participantId }),
        },
      )
      if (!res.ok) {
        return { ok: false, status: res.status, errorMessage: await readApiErrorMessage(res) }
      }
      const data = (await res.json()) as CompositionResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
