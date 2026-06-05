import { buildEventUrls } from '../messaging/event-urls'
import { getEventTypeIcon, getEventTypeLabel } from './event-types'

/** Snackbar duration per UX spec (3500–4000 ms). */
export const CALENDAR_SNACKBAR_DURATION_MS = 3750

export const CALENDAR_SNACKBAR_MESSAGES = {
  icsDownload: 'Fichier .ics téléchargé. Importez-le dans votre agenda.',
  icsIos: 'Agenda iOS ouvert pour confirmation.',
  google: 'Google Calendar ouvert dans un nouvel onglet.',
  outlook: 'Outlook ouvert dans un nouvel onglet.',
  popupBlocked: 'Ouverture bloquée. Autorisez les pop-ups pour ce site, puis réessayez.',
  error: "Erreur lors de l'ajout au calendrier.",
  pastEvent:
    "Cet événement est passé — l'entrée sera ajoutée dans votre historique de calendrier.",
} as const

export interface CalendarExportEvent {
  id: string
  slug: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  templateType: string
}

export interface CalendarExportContext {
  origin: string
  troupeSlug: string
  seasonSlug: string
}

const ICS_PRODID = '-//HatCast//V2//FR'
const EVENT_DURATION_MS = 4 * 60 * 60 * 1000

/** End instant = startsAt + 4 hours (UTC arithmetic, not local wall clock). */
export function computeCalendarEndInstant(startsAt: string): Date {
  const start = new Date(startsAt)
  return new Date(start.getTime() + EVENT_DURATION_MS)
}

export function isCalendarStartsAtValid(startsAt: string): boolean {
  return !Number.isNaN(new Date(startsAt).getTime())
}

export function isEventPastForCalendar(startsAt: string, now: Date = new Date()): boolean {
  if (!isCalendarStartsAtValid(startsAt)) {
    return false
  }
  return new Date(startsAt).getTime() < now.getTime()
}

/** RFC 5545 TEXT escaping (backslash, semicolon, comma, newline). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')
}

/** Fold a single ICS content line to max 75 octets per RFC 5545. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(line)
  if (bytes.length <= 75) {
    return line
  }

  const parts: string[] = []
  let offset = 0
  let isFirst = true

  while (offset < bytes.length) {
    let chunkEnd = Math.min(offset + 75, bytes.length)
    while (
      chunkEnd > offset &&
      (bytes[chunkEnd] & 0xc0) === 0x80
    ) {
      chunkEnd--
    }
    if (chunkEnd === offset) {
      chunkEnd = Math.min(offset + 75, bytes.length)
    }

    const chunk = new TextDecoder().decode(bytes.subarray(offset, chunkEnd))
    parts.push(isFirst ? chunk : ` ${chunk}`)
    isFirst = false
    offset = chunkEnd
  }

  return parts.join('\r\n')
}

export function formatIcsUtcInstant(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function buildCalendarDescription(
  event: CalendarExportEvent,
  context: CalendarExportContext,
): string {
  const { eventUrl } = buildEventUrls(
    context.origin,
    context.troupeSlug,
    context.seasonSlug,
    event.slug,
  )
  const typeIcon = getEventTypeIcon(event.templateType)
  const typeLabel = getEventTypeLabel(event.templateType)
  const parts: string[] = []
  if (event.description?.trim()) {
    parts.push(event.description.trim())
  }
  parts.push(`Type : ${typeIcon} ${typeLabel}`)
  parts.push(`Détails : ${eventUrl}`)
  return parts.join('\n\n')
}

export function buildIcsUid(eventId: string, origin: string): string {
  const hostname = new URL(origin).hostname
  return `${eventId}@${hostname}`
}

export function buildIcsContent(
  event: CalendarExportEvent,
  context: CalendarExportContext,
): string {
  const start = new Date(event.startsAt)
  const end = computeCalendarEndInstant(event.startsAt)
  const description = buildCalendarDescription(event, context)
  const uid = buildIcsUid(event.id, context.origin)
  const dtStamp = formatIcsUtcInstant(new Date())

  const rawLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${ICS_PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${formatIcsUtcInstant(start)}`,
    `DTEND:${formatIcsUtcInstant(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
  ]

  if (event.location?.trim()) {
    rawLines.push(`LOCATION:${escapeIcsText(event.location.trim())}`)
  }

  rawLines.push('END:VEVENT', 'END:VCALENDAR')

  return rawLines.map(foldIcsLine).join('\r\n')
}

export function buildGoogleCalendarUrl(
  event: CalendarExportEvent,
  context: CalendarExportContext,
): string {
  const start = new Date(event.startsAt)
  const end = computeCalendarEndInstant(event.startsAt)
  const description = buildCalendarDescription(event, context)
  const startStr = formatIcsUtcInstant(start)
  const endStr = formatIcsUtcInstant(end)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: description,
  })
  if (event.location?.trim()) {
    params.set('location', event.location.trim())
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildOutlookCalendarUrl(
  event: CalendarExportEvent,
  context: CalendarExportContext,
): string {
  const start = new Date(event.startsAt)
  const end = computeCalendarEndInstant(event.startsAt)
  const description = buildCalendarDescription(event, context)

  const params = new URLSearchParams({
    subject: event.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description,
    allday: 'false',
  })
  if (event.location?.trim()) {
    params.set('location', event.location.trim())
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

export function sanitizeIcsFilename(title: string, startsAt: string): string {
  const datePart = startsAt.slice(0, 10)
  const safeTitle = title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').slice(0, 80)
  return `${safeTitle || 'event'}_${datePart}.ics`
}

export function triggerIcsDownload(
  icsContent: string,
  filename: string,
  doc: Document,
): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = doc.createElement('a')
  link.href = url
  link.download = filename
  doc.body.appendChild(link)
  link.click()
  doc.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function assertHttpsUrl(url: string): void {
  if (!url.startsWith('https://')) {
    throw new Error(`External URL must use HTTPS: ${url}`)
  }
}
