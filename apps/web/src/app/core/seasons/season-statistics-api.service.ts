import { Injectable } from '@angular/core'

export interface StatCounts {
  selections: number
  dispos: number
  declines: number
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
  annual: Record<string, StatCounts>
  /** V1 month rollup — participations / dispos / declines per validated event. */
  monthSummary: Record<string, StatCounts>
  byMonth: Record<string, Record<string, StatCounts>>
  eventCells: Record<string, string>
}

export interface SeasonStatisticsResponse {
  participants: { id: string; displayName: string }[]
  monthKeys: string[]
  events: StatisticsEvent[]
  rows: ParticipantStatisticsRow[]
}

@Injectable({ providedIn: 'root' })
export class SeasonStatisticsApiService {
  async loadStatistics(
    seasonId: string,
    options: { eventId?: string | null; participantId?: string | null } = {},
  ): Promise<{ ok: boolean; status: number; data?: SeasonStatisticsResponse }> {
    const params = new URLSearchParams()
    if (options.eventId) {
      params.set('eventId', options.eventId)
    }
    if (options.participantId) {
      params.set('participantId', options.participantId)
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
