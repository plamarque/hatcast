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

export type MeInboxApiResult = { ok: boolean; status: number; data?: MeInboxResponse }

/** Session memo TTL for inbox badge / accueil stale-while-revalidate (PERF-02). */
export const INBOX_CACHE_TTL_MS = 60_000

const INBOX_CACHE_STORAGE_KEY = 'hatcast.inbox.cache'

interface InboxCachePayload {
  data: MeInboxResponse
  fetchedAt: number
  userId: string
}

@Injectable({ providedIn: 'root' })
export class MeInboxApiService {
  private memoryCache: InboxCachePayload | null = null
  private inFlight: Promise<MeInboxApiResult> | null = null
  private boundUserId: string | null = null

  constructor() {
    this.hydrateFromSessionStorage()
  }

  /** Binds cache scope to the authenticated user — call from auth session apply. */
  bindSessionUser(userId: string): void {
    if (this.boundUserId != null && this.boundUserId !== userId) {
      this.invalidateCache()
    } else if (this.memoryCache?.userId != null && this.memoryCache.userId !== userId) {
      this.invalidateCache()
    }
    this.boundUserId = userId
  }

  /** Returns cached inbox when TTL is still valid — synchronous peek for stale-while-revalidate UI. */
  peekFreshCache(): MeInboxResponse | null {
    if (this.isCacheFresh(this.memoryCache) && this.isCacheForBoundUser(this.memoryCache)) {
      return this.memoryCache!.data
    }
    return null
  }

  /** Clears session memo — call after logout or user switch. */
  invalidateCache(): void {
    this.memoryCache = null
    this.inFlight = null
    this.boundUserId = null
    try {
      sessionStorage.removeItem(INBOX_CACHE_STORAGE_KEY)
    } catch {
      // sessionStorage unavailable — degrade silently.
    }
  }

  async getInbox(options?: { force?: boolean }): Promise<MeInboxApiResult> {
    const force = options?.force ?? false

    if (!force && this.isCacheFresh(this.memoryCache) && this.isCacheForBoundUser(this.memoryCache)) {
      return { ok: true, status: 200, data: this.memoryCache!.data }
    }

    if (this.inFlight) {
      if (!force) {
        return this.inFlight
      }
      await this.inFlight
    }

    const fetchPromise = this.fetchInbox()
    this.inFlight = fetchPromise.finally(() => {
      this.inFlight = null
    })
    return this.inFlight
  }

  private isCacheFresh(cache: InboxCachePayload | null): cache is InboxCachePayload {
    if (!cache) {
      return false
    }
    return Date.now() - cache.fetchedAt < INBOX_CACHE_TTL_MS
  }

  private isCacheForBoundUser(cache: InboxCachePayload | null): boolean {
    if (!cache) {
      return false
    }
    if (this.boundUserId == null) {
      return true
    }
    return cache.userId === this.boundUserId
  }

  private writeCache(data: MeInboxResponse): void {
    const userId = this.boundUserId
    if (!userId) {
      return
    }
    const payload: InboxCachePayload = { data, fetchedAt: Date.now(), userId }
    this.memoryCache = payload
    try {
      sessionStorage.setItem(INBOX_CACHE_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // sessionStorage unavailable — memory cache still helps within SPA session.
    }
  }

  private hydrateFromSessionStorage(): void {
    try {
      const raw = sessionStorage.getItem(INBOX_CACHE_STORAGE_KEY)
      if (!raw) {
        return
      }
      const parsed = JSON.parse(raw) as InboxCachePayload
      if (
        parsed?.data &&
        typeof parsed.fetchedAt === 'number' &&
        typeof parsed.userId === 'string' &&
        this.isCacheFresh(parsed)
      ) {
        this.memoryCache = parsed
      }
    } catch {
      // ignore corrupt cache
    }
  }

  private async fetchInbox(): Promise<MeInboxApiResult> {
    try {
      const res = await fetch('/v1/me/inbox', { credentials: 'include' })
      if (!res.ok) {
        return { ok: false, status: res.status }
      }
      const data = (await res.json()) as MeInboxResponse
      const result: MeInboxApiResult = { ok: true, status: res.status, data }
      this.writeCache(data)
      return result
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
    description: null,
    troupeId: action.troupeId,
    troupeName: action.troupeName,
    troupeSlug: action.troupeSlug,
    seasonId: action.seasonId,
    seasonSlug: action.seasonSlug,
    seasonTitle: action.seasonTitle,
    myAvailabilityStatus: action.type === 'availability_unknown' ? 'unknown' : null,
  }
}
