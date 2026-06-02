import type { UserAgendaItem } from '../agenda/user-agenda-api.service'
import type { InboxShortcuts } from '../inbox/me-inbox-api.service'
import { getLastVisitedSeasonSlug } from '../navigation/last-visited-season-storage'
import type { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { AGENDA_TIME_ZONE, formatEventDateParts } from '../../pages/season-home/season-events.utils'

export type SeasonGlanceIds = {
  troupeId?: string
  seasonId?: string
}

export const ACTION_HORIZON_DAYS = 30
export const SOON_DAYS = 7
export const MAX_VISIBLE_ACTIONS = 5

export type AgendaCardEnrichedItem = UserAgendaItem & {
  dayNumber: number
  dayName: string
}

/** Calendar date `YYYY-MM-DD` in the given IANA time zone (wall clock). */
export function calendarDateKeyInTimeZone(
  date: Date,
  timeZone = AGENDA_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(date)
}

/** Civil calendar addition on `YYYY-MM-DD` keys (independent of DST). */
export function addCalendarDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d + days)
  const dt = new Date(t)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function calendarDaysFromNow(
  startsAt: string,
  now: Date,
  timeZone = AGENDA_TIME_ZONE,
): number {
  const eventKey = calendarDateKeyInTimeZone(new Date(startsAt), timeZone)
  const nowKey = calendarDateKeyInTimeZone(now, timeZone)
  const [ey, em, ed] = eventKey.split('-').map(Number)
  const [ny, nm, nd] = nowKey.split('-').map(Number)
  const eventUtc = Date.UTC(ey, em - 1, ed)
  const nowUtc = Date.UTC(ny, nm - 1, nd)
  return Math.round((eventUtc - nowUtc) / 86_400_000)
}

export function isWithinCalendarDaysFromNow(
  startsAt: string,
  now: Date,
  maxDays: number,
  timeZone = AGENDA_TIME_ZONE,
): boolean {
  const offset = calendarDaysFromNow(startsAt, now, timeZone)
  return offset >= 0 && offset <= maxDays
}

export function deriveAvailabilityActions(
  items: UserAgendaItem[],
  now: Date,
  timeZone = AGENDA_TIME_ZONE,
): UserAgendaItem[] {
  return items
    .filter(
      (item) =>
        item.myAvailabilityStatus === 'unknown' &&
        isWithinCalendarDaysFromNow(item.startsAt, now, ACTION_HORIZON_DAYS, timeZone),
    )
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}

export function isSoonAction(
  startsAt: string,
  now: Date,
  days = SOON_DAYS,
  timeZone = AGENDA_TIME_ZONE,
): boolean {
  const offset = calendarDaysFromNow(startsAt, now, timeZone)
  return offset >= 0 && offset <= days
}

/** Number of days below which an action chip is shown in the urgent (error) tone. */
export const URGENT_DAYS = 2

/**
 * Concrete, scannable relative-day label for an upcoming action
 * (« Aujourd'hui », « Demain », « Dans N j »). Returns `null` beyond
 * `SOON_DAYS` (no chip) or for past dates.
 */
export function relativeDayLabel(
  startsAt: string,
  now: Date,
  timeZone = AGENDA_TIME_ZONE,
): string | null {
  const offset = calendarDaysFromNow(startsAt, now, timeZone)
  if (offset < 0 || offset > SOON_DAYS) {
    return null
  }
  if (offset === 0) {
    return "Aujourd'hui"
  }
  if (offset === 1) {
    return 'Demain'
  }
  return `Dans ${offset} j`
}

export function pickNextEvent(items: UserAgendaItem[]): UserAgendaItem | null {
  if (items.length === 0) {
    return null
  }
  return [...items].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )[0]
}

export function enrichAgendaCardFields(item: UserAgendaItem): AgendaCardEnrichedItem {
  const { dayNumber, dayName } = formatEventDateParts(item.startsAt)
  return { ...item, dayNumber, dayName }
}

export function seasonGlanceQueryParamsFromIds(
  ids: SeasonGlanceIds | null | undefined,
): Record<string, string> {
  const queryParams: Record<string, string> = {}
  const troupeId = ids?.troupeId?.trim()
  const seasonId = ids?.seasonId?.trim()
  if (troupeId) {
    queryParams['troupeId'] = troupeId
  }
  if (seasonId) {
    queryParams['seasonId'] = seasonId
  }
  return queryParams
}

/** Story 17.19 AC5: `lastVisitedSeason` ids first, else first agenda participation row (API order). */
export function deriveSeasonGlanceQueryParams(
  items: UserAgendaItem[],
  lastVisited: SeasonGlanceIds | null | undefined = null,
): Record<string, string> {
  const fromLastVisited = seasonGlanceQueryParamsFromIds(lastVisited)
  if (fromLastVisited['troupeId'] || fromLastVisited['seasonId']) {
    return fromLastVisited
  }
  return seasonGlanceQueryParamsFromIds(
    items[0]
      ? { troupeId: items[0].troupeId, seasonId: items[0].seasonId }
      : null,
  )
}

/** Story 17.21: `lastVisitedSeason` first, else inbox shortcut hints from `GET /me/inbox`. */
export function deriveSeasonGlanceQueryParamsFromInbox(
  shortcuts: InboxShortcuts | null | undefined,
  lastVisited: SeasonGlanceIds | null | undefined = null,
): Record<string, string> {
  const fromLastVisited = seasonGlanceQueryParamsFromIds(lastVisited)
  if (fromLastVisited['troupeId'] || fromLastVisited['seasonId']) {
    return fromLastVisited
  }
  return seasonGlanceQueryParamsFromIds(shortcuts?.seasonGlanceQuery ?? null)
}

export async function resolveLastVisitedSeasonGlanceIds(
  resolver: TroupeSeasonResolverService,
): Promise<SeasonGlanceIds | null> {
  const slug = getLastVisitedSeasonSlug()
  if (!slug) {
    return null
  }

  const resolved = await resolver.resolveSeasonSlug(slug)
  if (resolved.kind !== 'resolved') {
    return null
  }

  return {
    troupeId: resolved.troupe.id,
    seasonId: resolved.season.id,
  }
}
