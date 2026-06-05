import { Injectable } from '@angular/core'

import type { MemberGender } from '../account/member-gender'
import { effectiveMemberGender } from '../account/member-gender'
import { csrfHeaders } from '../http/hatcast-csrf'
import type { AvailabilityStatus } from './availability-status'

export interface MyAvailabilityResponse {
  status: AvailabilityStatus
  updatedAt?: string | null
  roleKeys: string[]
  comment?: string | null
}

export interface SetMyAvailabilityBody {
  status: AvailabilityStatus
  roleKeys?: string[]
  applyVolunteerRule?: boolean
  comment?: string | null
}

export interface SummaryParticipant {
  participantId: string
  userId?: string | null
  displayName: string
  avatarUrl?: string | null
  gender?: MemberGender
  status: AvailabilityStatus
  roleKeys: string[]
  comment?: string | null
}

export interface SummaryRoleCandidate {
  participantId: string
  displayName: string
  avatarUrl?: string | null
  chancePercent?: number | null
}

export interface SummaryRole {
  roleKey: string
  requiredCount: number
  candidates: SummaryRoleCandidate[]
  /** Some candidate % use retrospective recalc instead of draw snapshot. */
  hasPartialEstimatedChances?: boolean
}

export type ChanceSource = 'live' | 'snapshot' | 'estimated'

export interface EventAvailabilitySummary {
  eventId: string
  roleSlots: Record<string, number>
  participants: SummaryParticipant[]
  roles: SummaryRole[]
  chanceSource?: ChanceSource | null
}

function normalizeSummary(data: EventAvailabilitySummary): EventAvailabilitySummary {
  return {
    ...data,
    participants: data.participants.map((participant) => ({
      ...participant,
      gender: effectiveMemberGender(participant.gender),
    })),
  }
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

  async setParticipantAvailability(
    seasonId: string,
    eventId: string,
    participantId: string,
    body: SetMyAvailabilityBody,
  ): Promise<{ ok: boolean; status: number; data?: MyAvailabilityResponse }> {
    try {
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/availability/participants/${encodeURIComponent(participantId)}`,
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

  async getEventAvailabilitySummary(
    seasonId: string,
    eventId: string,
    includeChances = false,
  ): Promise<{ ok: boolean; status: number; data?: EventAvailabilitySummary }> {
    try {
      const query = includeChances ? '?includeChances=true' : ''
      const res = await fetch(
        `/v1/seasons/${encodeURIComponent(seasonId)}/events/${encodeURIComponent(eventId)}/availability/summary${query}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = normalizeSummary((await res.json()) as EventAvailabilitySummary)
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
