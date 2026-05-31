import type { EventResponse } from '../../core/events/event-api.service'

/** Max upcoming events loaded for Agenda month grouping (story 3.3 — option C). */
export const AGENDA_UPCOMING_CAP = 200
/** Initial past events cap for Historique (story 3.6b). */
export const HISTORY_PAST_CAP = 50
export const AGENDA_TIME_ZONE = 'Europe/Paris'

/** Long French date/time for event detail mobile chrome (story 17.1). */
export function formatEventStartLong(
  iso: string,
  locale = 'fr-FR',
  timeZone = AGENDA_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

export interface EventDateSource {
  startsAt: string
}

export type EventWithDateParts<T extends EventDateSource = EventResponse> = T & {
  dayNumber: number
  dayName: string
}

export interface MonthEventGroup<T extends EventDateSource = EventResponse> {
  monthKey: string
  monthLabel: string
  events: EventWithDateParts<T>[]
}

export function formatEventDateParts(
  iso: string,
  locale = 'fr-FR',
  timeZone = AGENDA_TIME_ZONE,
): { dayNumber: number; dayName: string } {
  const d = new Date(iso)
  const day = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    timeZone,
  }).format(d)
  return {
    dayNumber: Number(day),
    dayName: new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }).format(d),
  }
}

export function groupEventsByMonth<T extends EventDateSource>(
  events: T[],
  locale = 'fr-FR',
  timeZone = AGENDA_TIME_ZONE,
): MonthEventGroup<T>[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
  const groups = new Map<string, MonthEventGroup<T>>()

  for (const ev of sorted) {
    const d = new Date(ev.startsAt)
    const monthParts = new Intl.DateTimeFormat(locale, {
      month: 'numeric',
      year: 'numeric',
      timeZone,
    }).formatToParts(d)
    const year = monthParts.find((p) => p.type === 'year')?.value ?? ''
    const month = monthParts.find((p) => p.type === 'month')?.value ?? ''
    const monthKey = `${year}-${month.padStart(2, '0')}`
    let group = groups.get(monthKey)
    if (!group) {
      const monthLabel = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone,
      }).format(d)
      group = { monthKey, monthLabel, events: [] }
      groups.set(monthKey, group)
    }
    const { dayNumber, dayName } = formatEventDateParts(ev.startsAt, locale, timeZone)
    group.events.push({ ...ev, dayNumber, dayName })
  }

  return Array.from(groups.values())
}

/** Past events: newest first (months and events within month). */
export function groupPastEventsByMonth<T extends EventDateSource>(
  events: T[],
  locale = 'fr-FR',
  timeZone = AGENDA_TIME_ZONE,
): MonthEventGroup<T>[] {
  const sorted = [...events].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  )
  const groups = new Map<string, MonthEventGroup<T>>()

  for (const ev of sorted) {
    const d = new Date(ev.startsAt)
    const monthParts = new Intl.DateTimeFormat(locale, {
      month: 'numeric',
      year: 'numeric',
      timeZone,
    }).formatToParts(d)
    const year = monthParts.find((p) => p.type === 'year')?.value ?? ''
    const month = monthParts.find((p) => p.type === 'month')?.value ?? ''
    const monthKey = `${year}-${month.padStart(2, '0')}`
    let group = groups.get(monthKey)
    if (!group) {
      const monthLabel = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone,
      }).format(d)
      group = { monthKey, monthLabel, events: [] }
      groups.set(monthKey, group)
    }
    const { dayNumber, dayName } = formatEventDateParts(ev.startsAt, locale, timeZone)
    group.events.push({ ...ev, dayNumber, dayName })
  }

  return Array.from(groups.values())
}

export function filterEventsByIds<T extends { id: string }>(
  events: T[],
  selectedEventIds: string[] | null | undefined,
): T[] {
  if (!selectedEventIds?.length) {
    return events
  }
  const allowed = new Set(selectedEventIds)
  return events.filter((e) => allowed.has(e.id))
}
