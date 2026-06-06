import { describe, expect, it } from 'vitest'

import { agendaParticipationStatusFromFocus } from './agenda-participation-status.utils'

describe('agendaParticipationStatusFromFocus', () => {
  it('maps in-team confirmed selection to selected cell with inclusive default', () => {
    const view = agendaParticipationStatusFromFocus({
      availabilityStatus: 'available',
      compositionRoleKey: 'player',
      inTeam: true,
      slotParticipationStatus: 'confirmed',
    })
    expect(view.cell.status).toBe('selected')
    expect(view.cell.label).toBe('Comédien·ne')
  })

  it('uses gender-aware role label when gender is provided', () => {
    const view = agendaParticipationStatusFromFocus(
      {
        availabilityStatus: 'available',
        compositionRoleKey: 'player',
        inTeam: true,
        slotParticipationStatus: 'confirmed',
      },
      false,
      'male',
    )
    expect(view.cell.label).toBe('Comédien')
  })

  it('maps pending selection to pending cell', () => {
    const view = agendaParticipationStatusFromFocus({
      availabilityStatus: 'available',
      compositionRoleKey: 'assistant_referee',
      inTeam: true,
      slotParticipationStatus: 'pending',
    })
    expect(view.cell.status).toBe('pending')
    expect(view.cell.tooltip).toContain('En attente')
    expect(view.participationEditable).toBe(false)
  })

  it('enables participation click when confirmation is allowed', () => {
    const view = agendaParticipationStatusFromFocus(
      {
        availabilityStatus: 'available',
        compositionRoleKey: 'player',
        inTeam: true,
        slotParticipationStatus: 'pending',
      },
      false,
      undefined,
      true,
    )
    expect(view.participationEditable).toBe(true)
    expect(view.availabilityEditable).toBe(false)
  })

  it('maps available not selected with editable dispo', () => {
    const view = agendaParticipationStatusFromFocus(
      { availabilityStatus: 'available', inTeam: false },
      true,
    )
    expect(view.cell.status).toBe('available')
    expect(view.availabilityEditable).toBe(true)
  })

  it('maps unavailable not selected', () => {
    const view = agendaParticipationStatusFromFocus({
      availabilityStatus: 'unavailable',
      inTeam: false,
    })
    expect(view.cell.status).toBe('unavailable')
    expect(view.cell.label).toBe('Pas dispo')
  })

  it('maps declined after slot freed (not in team) to declined cell', () => {
    const view = agendaParticipationStatusFromFocus(
      {
        availabilityStatus: 'available',
        compositionRoleKey: 'player',
        inTeam: false,
        slotParticipationStatus: 'declined',
      },
      true,
    )
    expect(view.cell.status).toBe('declined')
    expect(view.cell.tooltip).toContain('Décliné')
    expect(view.availabilityEditable).toBe(false)
    expect(view.participationEditable).toBe(false)
  })
})
