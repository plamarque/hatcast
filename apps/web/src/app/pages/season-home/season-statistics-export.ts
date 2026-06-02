import type {
  ParticipantStatisticsRow,
  SeasonStatisticsResponse,
  StatisticsEvent,
} from '../../core/seasons/season-statistics-api.service'
import type { StatisticsColumnVisibility } from './season-statistics'
import { formatStatExportValue } from './season-statistics.utils'

type ColumnDef = { key: string; label: string }

const JEU_DETAIL_COLUMNS: ColumnDef[] = [
  { key: 'jeuMatch', label: 'MATCH' },
  { key: 'jeuCab', label: 'CAB' },
  { key: 'jeuLong', label: 'LONG' },
  { key: 'jeuAutre', label: 'AUTRE' },
  { key: 'totalJeu', label: 'TOTAL JEU' },
]

const DECORUM_DETAIL_COLUMNS: ColumnDef[] = [
  { key: 'mc', label: 'MC' },
  { key: 'dj', label: 'DJ' },
  { key: 'referee', label: 'ARB' },
  { key: 'assistantReferee', label: 'AA' },
  { key: 'coach', label: 'COACH' },
  { key: 'totalDecorum', label: 'TOTAL DECORUM' },
]

const BENEVOLE_DETAIL_COLUMNS: ColumnDef[] = [
  { key: 'stageManager', label: 'RÉGISSEUR' },
  { key: 'lighting', label: 'LUMIÈRE' },
  { key: 'volunteer', label: 'BÉNÉVOLE' },
  { key: 'totalBenevole', label: 'TOTAL BÉNÉVOLE' },
]

const JEU_SUMMARY: ColumnDef = { key: 'totalJeu', label: 'JEU' }
const DECORUM_SUMMARY: ColumnDef = { key: 'totalDecorum', label: 'DECORUM' }
const BENEVOLE_SUMMARY: ColumnDef = { key: 'totalBenevole', label: 'BÉNÉVOLE' }

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function statCell(row: ParticipantStatisticsRow, columnKey: string): string {
  const counts = row.annual[columnKey]
  if (!counts) {
    return ''
  }
  return formatStatExportValue(counts.selections, counts.dispos, counts.declines)
}

function monthSummaryCell(row: ParticipantStatisticsRow, monthKey: string): string {
  const counts = row.monthSummary[monthKey]
  if (!counts) {
    return ''
  }
  return formatStatExportValue(counts.selections, counts.dispos, counts.declines)
}

function annualColumnsForVisibility(visibility: StatisticsColumnVisibility): ColumnDef[] {
  const cols: ColumnDef[] = []
  if (visibility.showJeuDetails) {
    cols.push(...JEU_DETAIL_COLUMNS)
  } else {
    cols.push(JEU_SUMMARY)
  }
  if (visibility.showDecorumDetails) {
    cols.push(...DECORUM_DETAIL_COLUMNS)
  } else {
    cols.push(DECORUM_SUMMARY)
  }
  if (visibility.showBenevoleDetails) {
    cols.push(...BENEVOLE_DETAIL_COLUMNS)
  } else {
    cols.push(BENEVOLE_SUMMARY)
  }
  return cols
}

/** V1 `exportToExcel` — résumés par mois puis toutes les colonnes spectacle (dispo / sélection / décliné). */
function eventsForExport(data: SeasonStatisticsResponse): StatisticsEvent[] {
  return [...data.events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export function buildStatisticsCsv(
  data: SeasonStatisticsResponse,
  visibility: StatisticsColumnVisibility,
  options: { groupsLabel?: string } = {},
): string {
  const annualCols = annualColumnsForVisibility(visibility)
  const exportEvents = eventsForExport(data)
  const lines: string[] = []
  if (options.groupsLabel) {
    lines.push(csvEscape(`Catégories: ${options.groupsLabel}`))
  }
  const headers = ['Participant', ...annualCols.map((c) => c.label)]

  for (const monthKey of data.monthKeys) {
    headers.push(monthLabelForExport(monthKey))
  }
  for (const ev of exportEvents) {
    headers.push(`${ev.title} (${ev.startsAt.slice(0, 10)})`)
  }

  lines.push(headers.map(csvEscape).join(','))
  for (const row of data.rows) {
    const cells = [csvEscape(row.displayName)]
    for (const col of annualCols) {
      cells.push(csvEscape(statCell(row, col.key)))
    }
    for (const monthKey of data.monthKeys) {
      cells.push(csvEscape(monthSummaryCell(row, monthKey)))
    }
    for (const ev of exportEvents) {
      cells.push(csvEscape(row.eventCells[ev.id] ?? ''))
    }
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}

function monthLabelForExport(monthKey: string): string {
  const [y, m] = monthKey.split('-')
  return `${m}/${y}`
}

export function downloadStatisticsCsv(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function statisticsEventsForFilter(
  events: StatisticsEvent[],
  eventId: string | null,
): StatisticsEvent[] {
  if (!eventId) {
    return events
  }
  return events.filter((e) => e.id === eventId)
}
