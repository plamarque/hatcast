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
type AuthMe = { user: { id: string } }
type SummaryParticipant = { participantId: string; userId?: string | null }
type AvailabilitySummary = { participants: SummaryParticipant[] }
type UserAgendaItem = { eventSlug: string; title: string; seasonSlug: string }
type UserAgendaResponse = { content: UserAgendaItem[] }

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

async function fetchCurrentUserId(request: APIRequestContext): Promise<string> {
  const me = await apiGet<AuthMe>(request, '/v1/auth/me')
  return me.user.id
}

async function memberParticipantOnEvent(
  request: APIRequestContext,
  seasonId: string,
  eventId: string,
  userId: string,
): Promise<SummaryParticipant | undefined> {
  const summary = await apiGet<AvailabilitySummary>(
    request,
    `/v1/seasons/${seasonId}/events/${eventId}/availability/summary`,
  )
  return summary.participants.find((p) => p.userId === userId)
}

async function filterMemberEligibleDisposOpen(
  request: APIRequestContext,
  seasonId: string,
  events: SeasonEvent[],
  userId: string,
): Promise<SeasonEvent[]> {
  const eligible: SeasonEvent[] = []
  for (const event of disposOpen(events)) {
    const participant = await memberParticipantOnEvent(request, seasonId, event.id, userId)
    if (participant) {
      eligible.push(event)
    }
  }
  return eligible
}

async function listUpcomingAgenda(request: APIRequestContext): Promise<UserAgendaItem[]> {
  const agenda = await apiGet<UserAgendaResponse>(request, '/v1/me/agenda?scope=upcoming&size=50')
  return agenda.content
}

async function resolveAgendaTitle(
  request: APIRequestContext,
  seasonSlug: string,
  eventSlug: string,
): Promise<string | undefined> {
  return listUpcomingAgenda(request).then((items) =>
    items.find((item) => item.seasonSlug === seasonSlug && item.eventSlug === eventSlug)?.title,
  )
}

async function pickDrawEvent(
  request: APIRequestContext,
  seasonId: string,
  events: SeasonEvent[],
): Promise<SeasonEvent> {
  const open = disposOpen(events)
  const pinned = pickBySlug(open, env('HATCAST_E2E_EVENT_DRAW_SLUG'))
  if (pinned) {
    return pinned
  }
  for (const event of sortForGate(open)) {
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
      'No season event with open availability (availabilityOpenedAt) — pin HATCAST_E2E_EVENT_DISPOS_SLUG or publish dispos on staging',
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

  const troupes = await apiGet<TroupeListItem[]>(request, '/v1/troupes')
  const troupe = troupes.find((t) => t.slug === troupeSlug)
  if (!troupe) {
    throw new Error(`Troupe "${troupeSlug}" not visible for current session`)
  }

  const season = await apiGet<SeasonRef>(
    request,
    `/v1/troupes/${troupe.id}/seasons/by-slug/${encodeURIComponent(seasonSlug)}`,
  )
  const memberUserId = await fetchCurrentUserId(request)
  const events = await listSeasonEvents(request, season.id)
  const memberEligible = await filterMemberEligibleDisposOpen(request, season.id, events, memberUserId)
  if (memberEligible.length === 0) {
    throw new Error(
      'No season event with open dispos where the E2E member is linked — check roster/event exclusions or pin HATCAST_E2E_EVENT_DISPOS_SLUG',
    )
  }

  const dispos = pickDisposEvent(memberEligible)
  const draw = await pickDrawEvent(request, season.id, memberEligible)
  const drawParticipant = await memberParticipantOnEvent(request, season.id, draw.id, memberUserId)
  if (!drawParticipant) {
    throw new Error(
      `Draw event "${draw.slug}" has no season participant linked to the E2E member account`,
    )
  }

  const activitePinned = env('HATCAST_E2E_EVENT_ACTIVITE_SLUG')
  const activiteSlug =
    activitePinned && memberEligible.some((event) => event.slug === activitePinned)
      ? activitePinned
      : dispos.slug
  const pendingPinned = env('HATCAST_E2E_EVENT_PENDING_SLUG')
  const pendingSlug =
    pendingPinned && memberEligible.some((event) => event.slug === pendingPinned)
      ? pendingPinned
      : dispos.slug
  const upcomingAgenda = await listUpcomingAgenda(request)
  const eventDrawTitle = (await resolveAgendaTitle(request, seasonSlug, draw.slug)) ?? draw.title
  const agendaUpcomingEventTitle = upcomingAgenda[0]?.title

  return {
    troupeSlug,
    seasonSlug,
    seasonId: season.id,
    memberDisplayName: env('HATCAST_E2E_MEMBER_DISPLAY_NAME') ?? 'E2E member',
    memberEmail: env('HATCAST_E2E_MEMBER_EMAIL') ?? '',
    memberUserSlug,
    memberUserId,
    memberSeasonParticipantId: drawParticipant.participantId,
    eventDrawSlug: draw.slug,
    eventDrawTitle,
    agendaUpcomingEventTitle,
    eventActiviteSlug: activiteSlug,
    eventActiviteTitle: pickBySlug(events, activiteSlug)?.title ?? dispos.title,
    eventPendingSlug: pendingSlug,
    eventPendingTitle: pickBySlug(events, pendingSlug)?.title ?? dispos.title,
  }
}
