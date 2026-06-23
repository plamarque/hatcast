import { describe, expect, it } from 'vitest'

import type { MySeasonPermissions } from './organizer-api.service'
import { canManageComposition, canManageEvents } from './organizer-permissions'

const memberPermissions: MySeasonPermissions = {
  canManageSeasonOrganizers: false,
  canManageEventOrganizers: false,
  canManageMembers: false,
  canManageSeasons: false,
  canManageEvents: false,
  canManageSeasonParticipants: false,
  canManageEventParticipants: false,
  isTroupeAdmin: false,
  isSeasonOrganizer: false,
  eventOrganizerFor: [],
  eventParticipantAdminFor: [],
  canViewAuditTroupe: false,
  canViewAuditSeason: false,
  canViewAuditEvent: false,
}

describe('organizer-permissions', () => {
  it('grants manage events to platform admin without season permissions', () => {
    expect(canManageEvents(null, { platformAdmin: true })).toBe(true)
    expect(canManageEvents(memberPermissions, { platformAdmin: true })).toBe(true)
  })

  it('grants manage composition to platform admin without season permissions', () => {
    expect(canManageComposition(null, 'event-1', { platformAdmin: true })).toBe(true)
    expect(canManageComposition(memberPermissions, 'event-1', { platformAdmin: true })).toBe(true)
  })
})
