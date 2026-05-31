import { buildStatisticsCsv } from './season-statistics-export'
import type { SeasonStatisticsResponse } from '../../core/seasons/season-statistics-api.service'

describe('season-statistics-export', () => {
  it('includes per-event availability cells like V1 exportToExcel', () => {
    const data: SeasonStatisticsResponse = {
      participants: [{ id: 'p1', displayName: 'Alice' }],
      monthKeys: ['2026-03'],
      events: [
        {
          id: 'e1',
          title: 'Match mars',
          startsAt: '2026-03-10T19:00:00Z',
          templateType: 'match',
          category: null,
          monthKey: '2026-03',
        },
      ],
      rows: [
        {
          participantId: 'p1',
          displayName: 'Alice',
          annual: { totalJeu: { selections: 1, dispos: 2, declines: 0 } },
          monthSummary: { '2026-03': { selections: 1, dispos: 1, declines: 0 } },
          byMonth: {},
          eventCells: { e1: 'Dispo (J, MC)' },
        },
      ],
    }

    const csv = buildStatisticsCsv(
      data,
      {
        showJeuDetails: false,
        showDecorumDetails: false,
        showBenevoleDetails: false,
        expandedMonths: new Set(),
      },
      { groupsLabel: 'Tous les spectacles' },
    )

    expect(csv).toContain('Catégories: Tous les spectacles')
    expect(csv).toContain('Match mars')
    expect(csv).toContain('Dispo (J, MC)')
    expect(csv).toContain('1/2 (50%)')
  })
})
