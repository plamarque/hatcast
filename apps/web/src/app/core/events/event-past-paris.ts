const PARIS = 'Europe/Paris'

/** Civil day YYYY-MM-DD in Europe/Paris for an instant. */
function calendarDayInParis(epochMs: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: PARIS }).format(new Date(epochMs))
}

/** Last millisecond of a calendar day in Europe/Paris (matches V1 / API agenda boundary). */
function endOfParisCalendarDayMs(datePart: string): number {
  let lo = Date.parse(`${datePart}T00:00:00.000Z`) - 48 * 3_600_000
  let hi = Date.parse(`${datePart}T00:00:00.000Z`) + 48 * 3_600_000
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (calendarDayInParis(mid) <= datePart) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  return lo - 1
}

function endOfEventParisDayMs(raw: string | Date | null | undefined): number | null {
  if (raw == null) {
    return null
  }
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) {
      return null
    }
    const datePart = calendarDayInParis(raw.getTime())
    return endOfParisCalendarDayMs(datePart)
  }
  const trimmed = raw.trim()
  const datePart = trimmed.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return endOfParisCalendarDayMs(datePart)
  }
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return endOfParisCalendarDayMs(calendarDayInParis(parsed.getTime()))
}

/** True after end of the event’s civil day in Europe/Paris (not midnight UTC). */
export function isEventPastParis(
  raw: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  const endMs = endOfEventParisDayMs(raw)
  if (endMs == null) {
    return false
  }
  return now.getTime() > endMs
}
