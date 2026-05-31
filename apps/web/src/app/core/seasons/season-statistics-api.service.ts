import { Injectable } from '@angular/core'

import type { ParticipationChartStatus } from '../participation/participation-status'

export interface StatCounts {
  selections: number
  dispos: number
  declines: number
}

export interface StatisticsEventCell {
  status: ParticipationChartStatus
  label: string
  roleKey?: string | null
  tooltip?: string | null
}

export interface StatisticsEvent {
  id: string
  title: string
  startsAt: string
  templateType: string
  equityTag: string | null
  monthKey: string
}

export interface ParticipantStatisticsRow {
  participantId: string
  displayName: string
  userSlug?: string | null
  avatarUrl?: string | null
  annual: Record<string, StatCounts>
  /** V1 month rollup — participations / dispos / declines per validated event. */
  monthSummary: Record<string, StatCounts>
  byMonth: Record<string, Record<string, StatCounts>>
  eventCells: Record<string, string>
  eventCellDetails?: Record<string, StatisticsEventCell>
}

export interface SeasonStatisticsResponse {
  participants: { id: string; displayName: string }[]
  monthKeys: string[]
  events: StatisticsEvent[]
  rows: ParticipantStatisticsRow[]
}

export type EquityCompartmentsQuery = 'all' | string[]

@Injectable({ providedIn: 'root' })
export class SeasonStatisticsApiService {
  async loadStatistics(
    seasonId: string,
    options: {
      eventId?: string | null
      participantId?: string | null
      equityCompartments?: EquityCompartmentsQuery
    } = {},
  ): Promise<{ ok: boolean; status: number; data?: SeasonStatisticsResponse }> {
    const params = new URLSearchParams()
    if (options.eventId) {
      params.set('eventId', options.eventId)
    }
    if (options.participantId) {
      params.set('participantId', options.participantId)
    }
    if (options.equityCompartments !== undefined) {
      if (options.equityCompartments === 'all') {
        params.append('equityCompartments', 'all')
      } else if (options.equityCompartments.length === 0) {
        params.append('equityCompartments', '')
      } else {
        for (const slug of options.equityCompartments) {
          params.append('equityCompartments', slug)
        }
      }
    }
    const qs = params.toString()
    const url = `/v1/seasons/${encodeURIComponent(seasonId)}/statistics${qs ? `?${qs}` : ''}`
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as SeasonStatisticsResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
