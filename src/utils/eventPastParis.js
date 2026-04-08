/**
 * Statut « passé » des événements HatCast : jour civil Europe/Paris jusqu’à 23:59:59.999.
 * Les dates formulaire (YYYY-MM-DD) sont interprétées comme ce jour à Paris, pas comme minuit UTC.
 */
import { DateTime } from 'luxon'

const PARIS = 'Europe/Paris'

/**
 * @param {unknown} raw
 * @returns {Date | null}
 */
export function normalizeEventDate(raw) {
  if (raw == null) return null
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw
  if (typeof raw?.toDate === 'function') {
    const d = raw.toDate()
    return d instanceof Date && !isNaN(d.getTime()) ? d : null
  }
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

/**
 * @param {unknown} raw — date Firestore, Date, ou chaîne YYYY-MM-DD
 * @returns {import('luxon').DateTime | null}
 */
export function endOfEventParisDay(raw) {
  if (raw == null) return null

  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  const datePart = trimmed.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const end = DateTime.fromISO(datePart, { zone: PARIS }).endOf('day')
    return end.isValid ? end : null
  }

  const js = normalizeEventDate(raw)
  if (!js) return null
  const z = DateTime.fromJSDate(js, { zone: 'utc' }).setZone(PARIS)
  if (!z.isValid) return null
  const end = DateTime.fromObject(
    { year: z.year, month: z.month, day: z.day },
    { zone: PARIS }
  ).endOf('day')
  return end.isValid ? end : null
}

/**
 * @param {unknown} raw
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isEventPastParis(raw, now = new Date()) {
  const end = endOfEventParisDay(raw)
  if (!end) return false
  return now.getTime() > end.toMillis()
}
