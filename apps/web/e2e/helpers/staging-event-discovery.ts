import type { APIRequestContext } from '@playwright/test'

import type { E1CutoverFixture } from './e2e-api'

type TroupeListItem = { id: string; slug: string }
type SeasonRef = { id: string; slug: string; title: string }
type SeasonEvent = {
  id: string
  slug: string
  title: string
  startsAt: string
  archived: boolean
  availabilityOpenedAt: string | null
}
type PagedEvents = {
  content: SeasonEvent[]
  totalPages: number
}
type CompositionSnapshot = {
  validatedAt?: string | null
}

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined
}

function startOfTodayUtc(): number {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

function isUpcoming(startsAt: string): boolean {
  return Date.parse(startsAt) >= startOfTodayUtc()
}

function disposOpen(events: SeasonEvent[]): SeasonEvent[] {
  return events.filter((e) => !e.archived && e.availabilityOpenedAt)
}

function sortForGate(events: SeasonEvent[]): SeasonEvent[] {
  const upcoming = events.filter((e) => isUpcoming(e.startsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const past = events.filter((e) => !isUpcoming(e.startsAt)).sort((a, b) => b.startsAt.localeCompare(a.startsAt))
  return [...upcoming, ...past]
}

function pickBySlug(events: SeasonEvent[], slug: string | undefined): SeasonEvent | undefined {
  if (!slug) return undefined
  return events.find((e) => e.slug === slug)
}

async function apiGet<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(path)
  if (!response.ok()) {
    throw new Error(`GET ${path} → ${response.status()}: ${await response.text()}`)
  }
  return response.json() as Promise<T>
}

async function listSeasonEvents(request: APIRequestContext, seasonId: string): Promise<SeasonEvent[]> {
  const all: SeasonEvent[] = []
  for (let page = 0; page < 20; page++) {
    const paged = await apiGet<PagedEvents>(
      request,
      `/v1/seasons/${seasonId}/events?page=${page}&size=100&scope=all`,
    )
    all.push(...paged.content)
    if (page + 1 >= paged.totalPages) {
      break
    }
  }
  return all
}

async function compositionValidated(
  request: APIRequestContext,
  seasonId: string,
  eventId: string,
): Promise<boolean> {
  const response = await request.get(`/v1/seasons/${seasonId}/events/${eventId}/composition`)
  if (!response.ok()) {
    return true
  }
  const body = (await response.json()) as CompositionSnapshot
  return body.validatedAt != null
}

async function pickDrawEvent(
  request: APIRequestContext,
  seasonId: string,
  events: SeasonEvent[],
): Promise<SeasonEvent> {
  const pinned = pickBySlug(disposOpen(events), env('HATCAST_E2E_EVENT_DRAW_SLUG'))
  if (pinned) {
    return pinned
  }
  for (const event of sortForGate(disposOpen(events))) {
    const validated = await compositionValidated(request, seasonId, event.id)
    if (!validated) {
      return event
    }
  }
  return pickDisposEvent(events)
}

function pickDisposEvent(events: SeasonEvent[]): SeasonEvent {
  const open = disposOpen(events)
  const pinnedSlug = env('HATCAST_E2E_EVENT_DISPOS_SLUG')
  const pinned = pickBySlug(open, pinnedSlug)
  if (pinned) {
    return pinned
  }
  if (pinnedSlug) {
    const raw = pickBySlug(events, pinnedSlug)
    if (!raw) {
      throw new Error(`HATCAST_E2E_EVENT_DISPOS_SLUG="${pinnedSlug}" not found in season`)
    }
    if (raw.archived || !raw.availabilityOpenedAt) {
      throw new Error(
        `HATCAST_E2E_EVENT_DISPOS_SLUG="${pinnedSlug}" has no open availability (archived=${raw.archived})`,
      )
    }
  }
  const ranked = sortForGate(open)
  if (ranked.length === 0) {
    throw new Error(
      'No Malice event with open availability (availabilityOpenedAt) — pin HATCAST_E2E_EVENT_DISPOS_SLUG or publish dispos on staging',
    )
  }
  return ranked[0]!
}

/** Resolve season events for E2E (upcoming preferred, past fallback — direct URLs, not agenda-only). */
export async function discoverStagingE1Context(
  request: APIRequestContext,
  memberUserSlug: string,
): Promise<E1CutoverFixture> {
  const troupeSlug = env('HATCAST_E2E_TROUPE_SLUG') ?? 'la-malice'
  const seasonSlug = env('HATCAST_E2E_SEASON_SLUG')
  if (!seasonSlug) {
    throw new Error('Missing HATCAST_E2E_SEASON_SLUG')
  }

  const troupes = await apiGet<TroupeListItem[]>('/v1/troupes')
  const troupe = troupes.find((t) => t.slug === troupeSlug)
  if (!troupe) {
    throw new Error(`Troupe "${troupeSlug}" not visible for current session`)
  }

  const season = await apiGet<SeasonRef>(
    `/v1/troupes/${troupe.id}/seasons/by-slug/${encodeURIComponent(seasonSlug)}`,
  )
  const events = await listSeasonEvents(request, season.id)
  const dispos = pickDisposEvent(events)
  const draw = await pickDrawEvent(request, season.id, events)
  const activiteSlug = env('HATCAST_E2E_EVENT_ACTIVITE_SLUG') ?? dispos.slug
  const pendingSlug = env('HATCAST_E2E_EVENT_PENDING_SLUG') ?? dispos.slug

  return {
    troupeSlug,
    seasonSlug,
    seasonId: season.id,
    memberDisplayName: env('HATCAST_E2E_MEMBER_DISPLAY_NAME') ?? 'E2E member',
    memberEmail: env('HATCAST_E2E_MEMBER_EMAIL') ?? '',
    memberUserSlug,
    memberUserId: '00000000-0000-4000-8000-000000000001',
    memberSeasonParticipantId: '00000000-0000-4000-8000-000000000001',
    eventDrawSlug: draw.slug,
    eventDrawTitle: draw.title,
    eventActiviteSlug: activiteSlug,
    eventActiviteTitle: pickBySlug(events, activiteSlug)?.title ?? dispos.title,
    eventPendingSlug: pendingSlug,
    eventPendingTitle: pickBySlug(events, pendingSlug)?.title ?? dispos.title,
  }
}
