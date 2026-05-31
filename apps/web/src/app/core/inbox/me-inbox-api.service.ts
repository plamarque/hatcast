import { Injectable } from '@angular/core'

import type { UserAgendaItem } from '../agenda/user-agenda-api.service'

export type InboxActionType = 'availability_unknown' | 'composition_confirm_pending'

export interface InboxAction {
  type: InboxActionType
  eventId: string
  eventSlug: string
  seasonSlug: string
  title: string
  startsAt: string
  troupeName: string
  troupeSlug: string
  seasonTitle: string
  location: string | null
  troupeId: string
  seasonId: string
  deepLink: string
  roleKey?: string
  roleLabel?: string
}

export interface InboxSeasonGlanceQuery {
  troupeId?: string
  seasonId?: string
}

export interface InboxShortcuts {
  lastSeasonSlug: string | null
  seasonGlanceQuery: InboxSeasonGlanceQuery
}

export interface MeInboxResponse {
  actions: InboxAction[]
  nextEvent: UserAgendaItem | null
  shortcuts: InboxShortcuts
  noParticipation: boolean
}

@Injectable({ providedIn: 'root' })
export class MeInboxApiService {
  async getInbox(): Promise<{ ok: boolean; status: number; data?: MeInboxResponse }> {
    try {
      const res = await fetch('/v1/me/inbox', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MeInboxResponse
      return { ok: true, status: res.status, data }
    } catch {
      return { ok: false, status: 0 }
    }
  }
}

/** Maps inbox availability actions for display helpers shared with agenda cards. */
export function inboxActionAsAgendaItem(action: InboxAction): UserAgendaItem {
  return {
    eventId: action.eventId,
    eventSlug: action.eventSlug,
    title: action.title,
    startsAt: action.startsAt,
    location: action.location,
    troupeId: action.troupeId,
    troupeName: action.troupeName,
    troupeSlug: action.troupeSlug,
    seasonId: action.seasonId,
    seasonSlug: action.seasonSlug,
    seasonTitle: action.seasonTitle,
    myAvailabilityStatus: action.type === 'availability_unknown' ? 'unknown' : null,
  }
}
