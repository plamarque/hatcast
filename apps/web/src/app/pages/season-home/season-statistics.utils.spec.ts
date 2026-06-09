import {
  effectiveDispos,
  formatStatExportValue,
  genderStatisticsEventCell,
  statPercent,
  statTooltip,
} from './season-statistics.utils'

describe('season-statistics.utils', () => {
  it('computes effective dispos after declines', () => {
    expect(effectiveDispos(7, 2)).toBe(5)
  })

  it('caps stat percent at 100', () => {
    expect(statPercent(3, 2, 0)).toBe(100)
    expect(statPercent(2, 7, 0)).toBe(29)
  })

  it('formats export value like V1', () => {
    expect(formatStatExportValue(2, 7, 0)).toBe('2/7 (29%)')
    expect(formatStatExportValue(0, 0, 0)).toBe('')
  })

  it('builds tooltip with declines', () => {
    expect(statTooltip(1, 4, 2)).toContain('retrait')
  })

  it('genres stats event cell tooltip for female player', () => {
    const cell = genderStatisticsEventCell(
      {
        status: 'selected',
        label: 'Comédien·ne',
        roleKey: 'player',
        tooltip: 'Comédien·ne',
      },
      'female',
    )
    expect(cell.label).toBe('Comédienne')
    expect(cell.tooltip).toBe('Comédienne')
  })
})
