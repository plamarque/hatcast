/** @typedef {`${number}-${number}-${number}`} IsoDate */

export const PARIS = 'Europe/Paris'

/**
 * @param {Date | string | number} value
 * @returns {Date}
 */
export function toDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${value}`)
  }
  return d
}

/**
 * @param {Date} date
 * @param {number} days
 */
export function addDays(date, days) {
  const out = new Date(date)
  out.setUTCDate(out.getUTCDate() + days)
  return out
}

/**
 * Calendar days between two instants in a timezone (mirrors AgendaTimeBoundary intent).
 * @param {Date} from
 * @param {Date} to
 * @param {string} [timeZone]
 */
export function calendarDaysBetween(from, to, timeZone = PARIS) {
  const fromKey = localDateKey(from, timeZone)
  const toKey = localDateKey(to, timeZone)
  const fromMs = Date.parse(`${fromKey}T00:00:00Z`)
  const toMs = Date.parse(`${toKey}T00:00:00Z`)
  return Math.round((toMs - fromMs) / 86_400_000)
}

/**
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {IsoDate}
 */
export function localDateKey(date, timeZone = PARIS) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * ISO week key (year-Www) in Paris civil calendar.
 * @param {Date} date
 * @param {string} [timeZone]
 */
export function isoWeekKey(date, timeZone = PARIS) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const y = Number(parts.find((p) => p.type === 'year')?.value)
  const m = Number(parts.find((p) => p.type === 'month')?.value)
  const d = Number(parts.find((p) => p.type === 'day')?.value)
  const utc = new Date(Date.UTC(y, m - 1, d))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc - yearStart) / 86_400_000 + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/**
 * Parse V1 event date (YYYY-MM-DD) with default local show time.
 * @param {string | null | undefined} dateStr
 * @param {string} [defaultTime='19:00']
 */
export function parseV1EventStartsAt(dateStr, defaultTime = '19:00') {
  const raw = String(dateStr || '').trim()
  if (!raw) return null
  const [hh, mm] = defaultTime.split(':').map(Number)
  const d = new Date(`${raw}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Morning dispatch anchor (08:00 Europe/Paris expressed as UTC-ish Date for grouping).
 * @param {IsoDate} dateKey
 */
export function parisMorningUtc(dateKey) {
  return new Date(`${dateKey}T07:00:00.000Z`)
}
