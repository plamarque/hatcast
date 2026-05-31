import { describe, expect, it } from 'vitest'

import { formatSeasonPeriod } from './format-season-period'

describe('formatSeasonPeriod', () => {
  it('returns null when both dates are missing', () => {
    expect(formatSeasonPeriod(null, null)).toBeNull()
  })

  it('formats a start/end range in French short months', () => {
    const label = formatSeasonPeriod('2025-09-01', '2026-06-30')
    expect(label).toMatch(/2025/)
    expect(label).toMatch(/2026/)
    expect(label).toContain('–')
  })

  it('formats start-only period', () => {
    const label = formatSeasonPeriod('2025-09-01', null)
    expect(label).toMatch(/^À partir de /)
    expect(label).toMatch(/2025/)
  })

  it('formats end-only period with Jusqu’en', () => {
    const label = formatSeasonPeriod(null, '2026-06-30')
    expect(label).toMatch(/^Jusqu’en /)
    expect(label).toMatch(/2026/)
  })

  it('returns null for invalid ISO dates', () => {
    expect(formatSeasonPeriod('not-a-date', '2026-06-30')).toBeNull()
    expect(formatSeasonPeriod('2025-09-01', 'bad')).toBeNull()
    expect(formatSeasonPeriod(null, 'invalid')).toBeNull()
  })
})
