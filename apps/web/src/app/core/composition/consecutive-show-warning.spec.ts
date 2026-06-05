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

  it('builds tooltip with participant name, date and previous show title', () => {
    const message = formatConsecutiveShowWarningTooltip(warning, 'Patrice')
    expect(message).toBe(
      'Patrice est dans la composition du spectacle précédent du 5 juin 2026 : « Cabaret du 12 ».',
    )
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
