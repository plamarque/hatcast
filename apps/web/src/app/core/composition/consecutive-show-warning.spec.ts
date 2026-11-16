import { describe, expect, it } from 'vitest'

import {
  CONSECUTIVE_SHOW_WARNING_SHORT_LABEL,
  formatConsecutiveShowWarningDate,
  formatConsecutiveShowWarningMessage,
  formatConsecutiveShowWarningTooltip,
} from './consecutive-show-warning'

describe('consecutive-show-warning', () => {
  const warning = {
    previousEventId: 'evt-a',
    previousEventTitle: 'Cabaret du 12',
    previousEventStartsAt: '2026-06-05T17:00:00.000Z',
  }

  it('formats date in Europe/Paris without time', () => {
    const formatted = formatConsecutiveShowWarningDate('2026-06-05T17:00:00.000Z')
    expect(formatted).toMatch(/5 juin 2026/)
  })

  it('exposes compact row label', () => {
    expect(CONSECUTIVE_SHOW_WARNING_SHORT_LABEL).toBe('Joue deux fois de suite')
  })

  it('shows the previous event as a short date and title', () => {
    expect(formatConsecutiveShowWarningTooltip(warning, 'Patrice')).toBe('- 05/06 : Cabaret du 12')
  })

  it('lists distinct events once each, without punctuation around titles', () => {
    const first = { eventId: 'a', title: 'Voyage', startsAt: '2026-02-01T19:00:00Z', category: 'deplacements', scopes: ['global'] as ('global' | 'category')[] }
    const second = { eventId: 'b', title: 'Cabaret', startsAt: '2026-01-01T19:00:00Z', category: 'principal', scopes: ['category'] as ('global' | 'category')[] }
    expect(formatConsecutiveShowWarningTooltip({ ...warning, events: [first, second] }, 'Patrice'))
      .toBe('- 01/02 : Voyage\n- 01/01 : Cabaret')
    expect(formatConsecutiveShowWarningTooltip({ ...warning, events: [{ ...first, scopes: ['global', 'category'] }] }, 'Patrice'))
      .toBe('- 01/02 : Voyage')
  })

  it('keeps legacy inline message helper with inclusive default', () => {
    const message = formatConsecutiveShowWarningMessage(warning, 'player')
    expect(message).toContain('Comédien·ne')
    expect(message).toContain('« Cabaret du 12 »')
  })

  it('uses gender-aware role label when assignee gender is known', () => {
    const message = formatConsecutiveShowWarningMessage(warning, 'player', 'female')
    expect(message).toContain('Comédienne')
  })
})
