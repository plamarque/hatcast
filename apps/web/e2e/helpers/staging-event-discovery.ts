import type { APIRequestContext } from '@playwright/test'

import type { E1CutoverFixture, E1ReminderFixture } from './e2e-api'

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
type SummaryParticipant = {
  participantId: string
  userId?: string | null
  status?: 'unknown' | 'available' | 'unavailable'
}
type AvailabilitySummary = { participants: SummaryParticipant[] }
type ReminderPreview = { notifiableCount: number }
type UserAgendaItem = { eventSlug: string; title: string; seasonSlug: string }
type UserAgendaResponse = { content: UserAgendaItem[] }
const REMINDER_EVENT_ID = 'c00000e1-0000-4000-8000-000000000001'

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

function isFuture(startsAt: string): boolean {
  return Date.parse(startsAt) > Date.now()
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

async function filterWithUnknownAvailability(
  request: APIRequestContext,
  seasonId: string,
  events: SeasonEvent[],
): Promise<SeasonEvent[]> {
  const eligible: SeasonEvent[] = []
  for (const event of events) {
    const summary = await apiGet<AvailabilitySummary>(
      request,
      `/v1/seasons/${seasonId}/events/${event.id}/availability/summary`,
    )
    if (summary.participants.some((participant) => participant.status === 'unknown')) {
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

function pickLatestHistoryEvent(events: SeasonEvent[]): SeasonEvent {
  const past = events.filter((e) => !e.archived && !isUpcoming(e.startsAt))
  const pinned = pickBySlug(past, env('HATCAST_E2E_EVENT_HISTORY_LATEST_SLUG'))
  if (pinned) {
    return pinned
  }
  const ranked = past.sort((a, b) => b.startsAt.localeCompare(a.startsAt))
  if (ranked.length === 0) {
    throw new Error(
      'No past events in season for history anchor — pin HATCAST_E2E_EVENT_HISTORY_LATEST_SLUG',
    )
  }
  return ranked[0]!
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

  const reminderEligible = await filterWithUnknownAvailability(request, season.id, memberEligible)
  if (reminderEligible.length === 0) {
    throw new Error(
      'No open event with an unanswered eligible participant — publish staging fixture data or pin HATCAST_E2E_EVENT_DRAW_SLUG',
    )
  }

  const dispos = pickDisposEvent(reminderEligible)
  const draw = await pickDrawEvent(request, season.id, reminderEligible)
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
  const historyLatest = pickLatestHistoryEvent(events)
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
    seasonHistoryLatestTitle: historyLatest.title,
    seasonHistoryLatestSlug: historyLatest.slug,
    eventActiviteSlug: activiteSlug,
    eventActiviteTitle: pickBySlug(events, activiteSlug)?.title ?? dispos.title,
    eventPendingSlug: pendingSlug,
    eventPendingTitle: pickBySlug(events, pendingSlug)?.title ?? dispos.title,
  }
}

/**
 * Resolve the staging-only reminder anchor. Unlike member discovery, this never
 * filters through the signed-in actor's season participant row: the dedicated
 * organizer is intentionally not a season participant.
 */
export async function discoverStagingReminderContext(
  request: APIRequestContext,
): Promise<E1ReminderFixture> {
  const troupeSlug = env('HATCAST_E2E_TROUPE_SLUG') ?? 'la-malice'
  const seasonSlug = env('HATCAST_E2E_SEASON_SLUG')
  const reminderSlug = env('HATCAST_E2E_REMINDER_EVENT_SLUG')
  if (!seasonSlug) throw new Error('Missing HATCAST_E2E_SEASON_SLUG')
  if (!reminderSlug) {
    throw new Error(
      'Missing HATCAST_E2E_REMINDER_EVENT_SLUG — run the staging reminder fixture bootstrap before Playwright',
    )
  }

  const troupes = await apiGet<TroupeListItem[]>(request, '/v1/troupes')
  const troupe = troupes.find((candidate) => candidate.slug === troupeSlug)
  if (!troupe) throw new Error(`Troupe "${troupeSlug}" not visible for reminder fixture validation`)
  const season = await apiGet<SeasonRef>(
    request,
    `/v1/troupes/${troupe.id}/seasons/by-slug/${encodeURIComponent(seasonSlug)}`,
  )
  const events = await listSeasonEvents(request, season.id)
  const event = pickBySlug(events, reminderSlug)
  if (!event || event.id !== REMINDER_EVENT_ID) {
    throw new Error(
      `Reminder fixture "${reminderSlug}" not found at its reserved identity in ${troupeSlug}/${seasonSlug}; rerun the staging reminder fixture bootstrap`,
    )
  }
  if (event.archived || !event.availabilityOpenedAt || !isFuture(event.startsAt)) {
    throw new Error(
      `Reminder fixture "${reminderSlug}" violates its contract: archived=${event.archived}, availabilityOpenedAt=${event.availabilityOpenedAt ?? 'null'}, startsAt=${event.startsAt}; it must be open and future`,
    )
  }
  const summary = await apiGet<AvailabilitySummary>(
    request,
    `/v1/seasons/${season.id}/events/${event.id}/availability/summary`,
  )
  if (!summary.participants.some((participant) => participant.status === 'unknown')) {
    throw new Error(
      `Reminder fixture "${reminderSlug}" has no unanswered eligible recipient; rerun the staging reminder fixture bootstrap`,
    )
  }
  const preview = await apiGet<ReminderPreview>(
    request,
    `/v1/seasons/${season.id}/events/${event.id}/share-recipients?intent=availability_nudge`,
  )
  if (preview.notifiableCount < 1) {
    throw new Error(
      `Reminder fixture "${reminderSlug}" has no notifiable unanswered recipient; rerun the staging reminder fixture bootstrap`,
    )
  }
  return {
    troupeSlug,
    seasonSlug,
    seasonId: season.id,
    eventReminderSlug: event.slug,
    eventReminderTitle: event.title,
  }
}
