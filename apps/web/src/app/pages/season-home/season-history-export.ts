import type { AvailabilityStatus } from '../../core/availability/availability-status'
import { availabilityBadgeLabel } from '../../core/availability/availability-status'
import { teamStatusBadgeShortLabel, type TeamStatusBadge } from '../../core/composition/composition-lifecycle'
import type { EventResponse } from '../../core/events/event-api.service'
import { formatEventStartLong } from './season-events.utils'

export interface HistoryCsvRow {
  date: string
  title: string
  compositionStatus: string
  participantSummary: string
}

export function historyCsvRowFromEvent(
  ev: EventResponse,
  participantLabel: string,
): HistoryCsvRow {
  const status = (ev.myAvailabilityStatus ?? 'unknown') as AvailabilityStatus
  return {
    date: formatEventStartLong(ev.startsAt),
    title: ev.title,
    compositionStatus: teamStatusBadgeShortLabel(ev.teamStatusBadge as TeamStatusBadge | undefined),
    participantSummary: `${participantLabel}: ${availabilityBadgeLabel(status)}`,
  }
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildHistoryCsv(rows: HistoryCsvRow[]): string {
  const header = ['Date', 'Titre', 'Statut composition', 'Participant']
  const lines = [
    header.map(escapeCsvCell).join(','),
    ...rows.map((r) =>
      [r.date, r.title, r.compositionStatus, r.participantSummary]
        .map(escapeCsvCell)
        .join(','),
    ),
  ]
  return lines.join('\n')
}

export function downloadHistoryCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
