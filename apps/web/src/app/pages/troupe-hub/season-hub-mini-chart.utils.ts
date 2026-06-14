import type { TeamStatusBadgeKey } from '../../core/composition/composition-lifecycle'
import type {
  ParticipantStatisticsRow,
  StatisticsEvent,
} from '../../core/seasons/season-statistics-api.service'

export interface SeasonHubChartBlock {
  eventId: string
  eventSlug: string
  eventTitle: string
  startsAt: string
  participationCount: number
  statusTone: TeamStatusBadgeKey
  statusLabel: string
}

export interface SeasonHubChartMonth {
  monthKey: string
  blocks: SeasonHubChartBlock[]
}

/** Past = startsAt strictly before now (instant comparison on ISO-8601). */
export function isPastStatisticsEvent(startsAt: string, now: Date): boolean {
  const startMs = Date.parse(startsAt)
  if (Number.isNaN(startMs)) {
    return false
  }
  return startMs < now.getTime()
}

export function countEventParticipations(
  eventId: string,
  rows: ParticipantStatisticsRow[],
): number {
  return rows.filter((row) => {
    const status = row.eventCellDetails[eventId]?.status
    return status === 'selected' || status === 'pending'
  }).length
}

export function seasonHubChartBlockTooltip(
  eventTitle: string,
  participationCount: number,
  statusLabel?: string,
): string {
  const title = eventTitle.trim() || 'Spectacle'
  const label = participationCount === 1 ? 'participation' : 'participations'
  const participationLine = `${participationCount} ${label}`
  if (statusLabel?.trim()) {
    return `${title}\n${statusLabel.trim()}\n${participationLine}`
  }
  return `${title}\n${participationLine}`
}

const VALID_CHART_TONES: readonly TeamStatusBadgeKey[] = [
  'draft',
  'collecting',
  'preparing',
  'confirmed',
]

export function seasonHubChartBlockTone(event: StatisticsEvent): TeamStatusBadgeKey {
  const tone = event.teamStatusBadge?.tone
  if (tone && VALID_CHART_TONES.includes(tone)) {
    return tone
  }
  return 'collecting'
}

export function seasonHubChartBlockModifierClass(tone: TeamStatusBadgeKey): string {
  return `member-profile__chart-block troupe-hub__season-chart-block troupe-hub__season-chart-block--${tone}`
}

/** Returns null when fewer than 3 past events (MT15 threshold). */
export function buildSeasonHubMonthlyChart(
  events: StatisticsEvent[],
  rows: ParticipantStatisticsRow[],
  monthKeys: string[],
  now: Date = new Date(),
): SeasonHubChartMonth[] | null {
  const pastEvents = events
    .filter((event) => isPastStatisticsEvent(event.startsAt, now))
    .sort(compareEventsByStartsAtThenTitle)

  if (pastEvents.length < 3) {
    return null
  }

  const blocksByMonth = new Map<string, SeasonHubChartBlock[]>()
  for (const event of pastEvents) {
    const block: SeasonHubChartBlock = {
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      startsAt: event.startsAt,
      participationCount: countEventParticipations(event.id, rows),
      statusTone: seasonHubChartBlockTone(event),
      statusLabel: event.teamStatusBadge?.shortLabel?.trim() || 'Collecte',
    }
    const monthBlocks = blocksByMonth.get(event.monthKey) ?? []
    monthBlocks.push(block)
    blocksByMonth.set(event.monthKey, monthBlocks)
  }

  for (const blocks of blocksByMonth.values()) {
    blocks.sort(compareChartBlocksByStartsAtThenTitle)
  }

  const orderedMonthKeys = monthKeys.filter((monthKey) => blocksByMonth.has(monthKey))
  if (orderedMonthKeys.length === 0) {
    return null
  }
  return orderedMonthKeys.map((monthKey) => ({
    monthKey,
    blocks: blocksByMonth.get(monthKey) ?? [],
  }))
}

function compareEventsByStartsAtThenTitle(a: StatisticsEvent, b: StatisticsEvent): number {
  const timeDiff = Date.parse(a.startsAt) - Date.parse(b.startsAt)
  if (timeDiff !== 0) {
    return timeDiff
  }
  return a.title.localeCompare(b.title, 'fr')
}

function compareChartBlocksByStartsAtThenTitle(
  a: SeasonHubChartBlock,
  b: SeasonHubChartBlock,
): number {
  const timeDiff = Date.parse(a.startsAt) - Date.parse(b.startsAt)
  if (timeDiff !== 0) {
    return timeDiff
  }
  return a.eventTitle.localeCompare(b.eventTitle, 'fr')
}

const SHORT_MONTH_LABELS = [
  'JAN',
  'FEV',
  'MAR',
  'AVR',
  'MAI',
  'JUN',
  'JUL',
  'AOU',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const

export function seasonHubChartMonthLabel(monthKey: string): string {
  const [, monthRaw] = monthKey.split('-')
  const monthIndex = Number.parseInt(monthRaw ?? '', 10) - 1
  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return monthKey
  }
  return SHORT_MONTH_LABELS[monthIndex] ?? monthKey
}
