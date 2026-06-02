import { describe, expect, it } from 'vitest'

import { agendaParticipationStatusFromFocus } from './agenda-participation-status.utils'

describe('agendaParticipationStatusFromFocus', () => {
  it('maps in-team confirmed selection to selected cell', () => {
    const view = agendaParticipationStatusFromFocus({
      availabilityStatus: 'available',
      compositionRoleKey: 'player',
      inTeam: true,
      slotParticipationStatus: 'confirmed',
    })
    expect(view.cell.status).toBe('selected')
    expect(view.cell.label).toBe('Comédien·ne')
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
})
