import { describe, expect, it } from 'vitest'

import {
  applyAvailabilityUpdateToAgendaEvent,
  applyParticipationUpdateToAgendaEvent,
  formatParticipantFocusLabel,
} from './season-participant-focus'

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

  it('formats declined role after slot freed', () => {
    const label = formatParticipantFocusLabel({
      availabilityStatus: 'available',
      compositionRoleKey: 'player',
      inTeam: false,
      slotParticipationStatus: 'declined',
    })
    expect(label).toBe('Comédien·ne · décliné')
  })
})

describe('applyAvailabilityUpdateToAgendaEvent', () => {
  it('updates participantFocus.availabilityStatus when focus is present', () => {
    const updated = applyAvailabilityUpdateToAgendaEvent(
      {
        myAvailabilityStatus: 'unknown',
        participantFocus: {
          availabilityStatus: 'unknown',
          inTeam: false,
        },
      },
      'available',
    )
    expect(updated.myAvailabilityStatus).toBe('available')
    expect(updated.participantFocus?.availabilityStatus).toBe('available')
  })

  it('updates only myAvailabilityStatus when participantFocus is absent', () => {
    const updated = applyAvailabilityUpdateToAgendaEvent(
      { myAvailabilityStatus: 'unknown', participantFocus: null },
      'unavailable',
    )
    expect(updated.myAvailabilityStatus).toBe('unavailable')
    expect(updated.participantFocus).toBeNull()
  })
})

describe('applyParticipationUpdateToAgendaEvent', () => {
  it('keeps declined role visible after freeing the slot', () => {
    const updated = applyParticipationUpdateToAgendaEvent(
      {
        participantFocus: {
          availabilityStatus: 'available',
          compositionRoleKey: 'player',
          inTeam: true,
          slotParticipationStatus: 'pending',
        },
      },
      'declined',
    )
    expect(updated.participantFocus).toEqual({
      availabilityStatus: 'available',
      compositionRoleKey: 'player',
      inTeam: false,
      slotParticipationStatus: 'declined',
    })
  })
})
