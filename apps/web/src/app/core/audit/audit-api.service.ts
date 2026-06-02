import { Injectable } from '@angular/core'

export type AuditActionType =
  | 'AVAILABILITY_CREATED'
  | 'AVAILABILITY_UPDATED'
  | 'AVAILABILITY_DELETED'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_ARCHIVED'
  | 'EVENT_UNARCHIVED'
  | 'EVENT_AVAILABILITY_OPENED'
  | 'EVENT_AVAILABILITY_CLOSED'
  | 'SEASON_PARTICIPANT_ADDED'
  | 'SEASON_PARTICIPANT_REACTIVATED'
  | 'SEASON_PARTICIPANT_UPDATED'
  | 'SEASON_PARTICIPANT_REMOVED'
  | 'EVENT_PARTICIPANT_ADDED'
  | 'EVENT_PARTICIPANT_UPDATED'
  | 'EVENT_PARTICIPANT_REMOVED'
  | 'EVENT_ROSTER_EXCLUDED'
  | 'EVENT_ROSTER_INCLUDED'
  | 'TROUPE_MEMBER_ADDED'
  | 'TROUPE_MEMBER_UPDATED'
  | 'TROUPE_MEMBER_DEACTIVATED'
  | 'SEASON_ORGANIZER_GRANTED'
  | 'SEASON_ORGANIZER_REVOKED'
  | 'EVENT_ORGANIZER_GRANTED'
  | 'EVENT_ORGANIZER_REVOKED'
  | 'COMPOSITION_PUBLISHED'
  | 'COMPOSITION_VALIDATED'
  | 'COMPOSITION_UNLOCKED'
  | 'COMPOSITION_DRAW_COMPLETED'
  | 'COMPOSITION_LIFECYCLE_CHANGED'
  | 'SLOT_ASSIGNED'
  | 'SLOT_CLEARED'
  | 'PARTICIPATION_CONFIRMED'
  | 'PARTICIPATION_DECLINED'
  | 'PARTICIPATION_RESET'
  | 'DECLINE_RESTORED'

export interface AuditIdentity {
  userId?: string | null
  seasonParticipantId?: string | null
  eventParticipantId?: string | null
  displayName: string
  email?: string | null
  avatarUrl?: string | null
}

export interface AuditScope {
  troupeId?: string | null
  seasonId?: string | null
  eventId?: string | null
  seasonTitle?: string | null
  eventTitle?: string | null
}

export interface AuditEventRow {
  id: string
  occurredAt: string
  actionType: AuditActionType
  actionLabel: string
  actor: AuditIdentity | null
  subject: AuditIdentity | null
  scope: AuditScope
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  relatedParticipantLabels?: Record<string, string> | null
}

export interface PagedAuditEventsResponse {
  content: AuditEventRow[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AuditEventsQuery {
  troupeId?: string
  seasonId?: string
  eventId?: string
  actionType?: AuditActionType
  from?: string
  to?: string
  participantSeasonParticipantId?: string
  participantEventParticipantId?: string
  page?: number
  size?: number
}

type ApiResult<T> = Promise<{ ok: boolean; status: number; data?: T }>

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  async listEvents(query: AuditEventsQuery): ApiResult<PagedAuditEventsResponse> {
    const params = new URLSearchParams()
    if (query.troupeId) params.set('troupeId', query.troupeId)
    if (query.seasonId) params.set('seasonId', query.seasonId)
    if (query.eventId) params.set('eventId', query.eventId)
    if (query.actionType) params.set('actionType', query.actionType)
    if (query.from) params.set('from', query.from)
    if (query.to) params.set('to', query.to)
    if (query.participantSeasonParticipantId) {
      params.set('participantSeasonParticipantId', query.participantSeasonParticipantId)
    }
    if (query.participantEventParticipantId) {
      params.set('participantEventParticipantId', query.participantEventParticipantId)
    }
    params.set('page', String(query.page ?? 0))
    params.set('size', String(query.size ?? 25))
    try {
      const res = await fetch(`/v1/audit/events?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) return { ok: false, status: res.status }
      return { ok: true, status: res.status, data: (await res.json()) as PagedAuditEventsResponse }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}

/** Builds query string for unit tests. */
export function buildAuditEventsQueryString(query: AuditEventsQuery): string {
  const params = new URLSearchParams()
  if (query.troupeId) params.set('troupeId', query.troupeId)
  if (query.seasonId) params.set('seasonId', query.seasonId)
  if (query.eventId) params.set('eventId', query.eventId)
  if (query.actionType) params.set('actionType', query.actionType)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  if (query.participantSeasonParticipantId) {
    params.set('participantSeasonParticipantId', query.participantSeasonParticipantId)
  }
  if (query.participantEventParticipantId) {
    params.set('participantEventParticipantId', query.participantEventParticipantId)
  }
  params.set('page', String(query.page ?? 0))
  params.set('size', String(query.size ?? 25))
  return params.toString()
}
