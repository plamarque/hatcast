import { describe, expect, it } from 'vitest'

import type {
  ParticipantStatisticsRow,
  StatisticsEvent,
} from '../../core/seasons/season-statistics-api.service'
import type { TeamStatusBadgeKey } from '../../core/composition/composition-lifecycle'
import {
  buildSeasonHubMonthlyChart,
  countEventParticipations,
  isPastStatisticsEvent,
  seasonHubChartBlockModifierClass,
  seasonHubChartBlockTooltip,
  seasonHubChartBlockTone,
  seasonHubChartMonthLabel,
} from './season-hub-mini-chart.utils'

const NOW = new Date('2026-06-14T12:00:00+02:00')

function event(
  id: string,
  overrides: Partial<StatisticsEvent> = {},
): StatisticsEvent {
  return {
    id,
    slug: `slug-${id}`,
    title: `Spectacle ${id}`,
    startsAt: '2026-01-15T20:00:00+01:00',
    templateType: 'match',
    category: null,
    monthKey: '2026-01',
    ...overrides,
  }
}

function row(
  participantId: string,
  eventCellDetails: ParticipantStatisticsRow['eventCellDetails'],
): ParticipantStatisticsRow {
  return {
    participantId,
    displayName: participantId,
    annual: {},
    monthSummary: {},
    byMonth: {},
    eventCells: {},
    eventCellDetails,
  }
}

describe('isPastStatisticsEvent', () => {
  it('returns true when startsAt is before now', () => {
    expect(isPastStatisticsEvent('2026-01-01T20:00:00+01:00', NOW)).toBe(true)
  })

  it('returns false when startsAt is in the future', () => {
    expect(isPastStatisticsEvent('2026-12-01T20:00:00+01:00', NOW)).toBe(false)
  })
})

describe('countEventParticipations', () => {
  it('counts selected and pending only', () => {
    const rows = [
      row('p1', { e1: { status: 'selected', label: 'J' } }),
      row('p2', { e1: { status: 'pending', label: '?' } }),
      row('p3', { e1: { status: 'available', label: 'D' } }),
      row('p4', { e1: { status: 'declined', label: 'X' } }),
    ]
    expect(countEventParticipations('e1', rows)).toBe(2)
  })
})

describe('seasonHubChartBlockTooltip', () => {
  it('uses singular participation label for count 1', () => {
    expect(seasonHubChartBlockTooltip('Gala', 1)).toBe('Gala\n1 participation')
  })

  it('uses plural participations label for count > 1', () => {
    expect(seasonHubChartBlockTooltip('Gala', 3)).toBe('Gala\n3 participations')
  })

  it('includes team status label when provided', () => {
    expect(seasonHubChartBlockTooltip('Gala', 2, 'Confirmé')).toBe(
      'Gala\nConfirmé\n2 participations',
    )
  })
})

describe('seasonHubChartBlockTone', () => {
  it('defaults to collecting when badge is missing', () => {
    expect(seasonHubChartBlockTone(event('e1'))).toBe('collecting')
  })

  it('defaults to collecting when badge tone is unknown', () => {
    expect(
      seasonHubChartBlockTone(
        event('e1', {
          teamStatusBadge: {
            key: 'confirmed',
            label: 'Équipe confirmée',
            tone: 'confirmed' as 'confirmed',
            shortLabel: 'Confirmé',
          },
        }),
      ),
    ).toBe('confirmed')
    expect(
      seasonHubChartBlockTone(
        event('e1', {
          teamStatusBadge: {
            key: 'confirmed',
            label: 'Unknown',
            tone: 'unknown' as TeamStatusBadgeKey,
            shortLabel: '?',
          },
        }),
      ),
    ).toBe('collecting')
  })

  it('uses badge tone when present', () => {
    expect(
      seasonHubChartBlockTone(
        event('e1', {
          teamStatusBadge: {
            key: 'confirmed',
            label: 'Équipe confirmée',
            tone: 'confirmed',
            shortLabel: 'Confirmé',
          },
        }),
      ),
    ).toBe('confirmed')
  })
})

describe('seasonHubChartBlockModifierClass', () => {
  it('maps tone to agenda badge modifier class', () => {
    expect(seasonHubChartBlockModifierClass('preparing')).toContain('--preparing')
  })
})

describe('buildSeasonHubMonthlyChart', () => {
  it('returns null when fewer than 3 past events', () => {
    const events = [
      event('e1', { startsAt: '2026-01-10T20:00:00+01:00', monthKey: '2026-01' }),
      event('e2', { startsAt: '2026-02-10T20:00:00+01:00', monthKey: '2026-02' }),
      event('e3', { startsAt: '2026-12-10T20:00:00+01:00', monthKey: '2026-12' }),
    ]
    expect(buildSeasonHubMonthlyChart(events, [], ['2026-01', '2026-02', '2026-12'], NOW)).toBeNull()
  })

  it('builds month columns for 3+ past events ordered by monthKeys', () => {
    const events = [
      event('e1', {
        title: 'Alpha',
        startsAt: '2026-03-10T20:00:00+01:00',
        monthKey: '2026-03',
      }),
      event('e2', {
        title: 'Bravo',
        startsAt: '2026-01-20T20:00:00+01:00',
        monthKey: '2026-01',
      }),
      event('e3', {
        title: 'Charlie',
        startsAt: '2026-01-05T20:00:00+01:00',
        monthKey: '2026-01',
      }),
    ]
    const rows = [
      row('p1', {
        e1: { status: 'selected', label: 'J' },
        e2: { status: 'pending', label: '?' },
        e3: { status: 'selected', label: 'J' },
      }),
      row('p2', {
        e1: { status: 'selected', label: 'J' },
        e3: { status: 'selected', label: 'J' },
      }),
    ]

    const chart = buildSeasonHubMonthlyChart(
      events,
      rows,
      ['2026-01', '2026-03'],
      NOW,
    )

    expect(chart).not.toBeNull()
    expect(chart!.map((month) => month.monthKey)).toEqual(['2026-01', '2026-03'])
    expect(chart![0].blocks.map((block) => block.eventId)).toEqual(['e3', 'e2'])
    expect(chart![0].blocks[0].participationCount).toBe(2)
    expect(chart![1].blocks[0].participationCount).toBe(2)
  })

  it('returns null when monthKeys omit all past-event months', () => {
    const events = [
      event('e1', { startsAt: '2026-01-10T20:00:00+01:00', monthKey: '2026-01' }),
      event('e2', { startsAt: '2026-02-10T20:00:00+01:00', monthKey: '2026-02' }),
      event('e3', { startsAt: '2026-03-10T20:00:00+01:00', monthKey: '2026-03' }),
    ]
    expect(buildSeasonHubMonthlyChart(events, [], ['2026-99'], NOW)).toBeNull()
  })

  it('ignores future events in chart blocks', () => {
    const events = [
      event('e1', { startsAt: '2026-01-10T20:00:00+01:00', monthKey: '2026-01' }),
      event('e2', { startsAt: '2026-02-10T20:00:00+01:00', monthKey: '2026-02' }),
      event('e3', { startsAt: '2026-03-10T20:00:00+01:00', monthKey: '2026-03' }),
      event('e4', { startsAt: '2026-12-10T20:00:00+01:00', monthKey: '2026-12' }),
    ]
    const chart = buildSeasonHubMonthlyChart(events, [], ['2026-01', '2026-02', '2026-03'], NOW)
    expect(chart!.flatMap((month) => month.blocks).map((block) => block.eventId)).toEqual([
      'e1',
      'e2',
      'e3',
    ])
  })
})

describe('seasonHubChartMonthLabel', () => {
  it('returns short French month label', () => {
    expect(seasonHubChartMonthLabel('2026-03')).toBe('MAR')
  })
})
