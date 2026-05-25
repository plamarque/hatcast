import { describe, expect, it } from 'vitest'

import { formatParticipantFocusLabel } from './season-participant-focus'

describe('formatParticipantFocusLabel', () => {
  it('formats in-team role summary', () => {
    const label = formatParticipantFocusLabel({
      availabilityStatus: 'available',
      compositionRoleKey: 'player',
      inTeam: true,
    })
    expect(label).toBe("Comédien·ne · dans l'équipe")
  })

  it('formats unavailable when not in team', () => {
    const label = formatParticipantFocusLabel({
      availabilityStatus: 'unavailable',
      inTeam: false,
    })
    expect(label).toBe('Pas dispo')
  })

  it('formats available but not selected', () => {
    const label = formatParticipantFocusLabel({
      availabilityStatus: 'available',
      inTeam: false,
    })
    expect(label).toBe('Dispo · pas sélectionné')
  })
})
