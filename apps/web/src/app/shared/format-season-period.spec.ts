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
})
