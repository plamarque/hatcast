import { Injectable } from '@angular/core'

import { effectiveMemberGender, type MemberGender } from '../account/member-gender'
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
  category: string | null
  monthKey: string
}

export interface ParticipantStatisticsRow {
  participantId: string
  displayName: string
  userSlug?: string | null
  avatarUrl?: string | null
  gender?: MemberGender
  annual: Record<string, StatCounts>
  /** V1 month rollup — participations / dispos / declines per validated event. */
  monthSummary: Record<string, StatCounts>
  byMonth: Record<string, Record<string, StatCounts>>
  eventCells: Record<string, string>
  eventCellDetails: Record<string, StatisticsEventCell>
}

export interface SeasonStatisticsResponse {
  participants: { id: string; displayName: string }[]
  monthKeys: string[]
  events: StatisticsEvent[]
  rows: ParticipantStatisticsRow[]
}

export type CategoryFilterQuery = 'all' | string[]

@Injectable({ providedIn: 'root' })
export class SeasonStatisticsApiService {
  async loadStatistics(
    seasonId: string,
    options: {
      eventId?: string | null
      participantId?: string | null
      categories?: CategoryFilterQuery
    } = {},
  ): Promise<{ ok: boolean; status: number; data?: SeasonStatisticsResponse }> {
    const params = new URLSearchParams()
    if (options.eventId) {
      params.set('eventId', options.eventId)
    }
    if (options.participantId) {
      params.set('participantId', options.participantId)
    }
    if (options.categories !== undefined) {
      if (options.categories === 'all') {
        params.append('categories', 'all')
      } else if (options.categories.length === 0) {
        params.append('categories', '')
      } else {
        for (const slug of options.categories) {
          params.append('categories', slug)
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
      const raw = (await res.json()) as SeasonStatisticsResponse
      const data: SeasonStatisticsResponse = {
        ...raw,
        rows: raw.rows.map((row) => ({
          ...row,
          gender: effectiveMemberGender(row.gender),
        })),
      }
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}
