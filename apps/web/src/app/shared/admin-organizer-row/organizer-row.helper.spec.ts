import { describe, expect, it } from 'vitest'

import type { OrganizerResponse } from '../../core/permissions/organizer-api.service'
import {
  canAssignOrganizerRole,
  findRowOrganizer,
  isRowOrganizer,
  organizerRoleLabel,
  organizerRoleMenuLabel,
  participantRoleLabel,
  participationRoleChipLabel,
} from './organizer-row.helper'

const organizers: OrganizerResponse[] = [
  {
    userId: 'u-org',
    email: 'org@example.com',
    displayName: 'Org One',
    grantedAt: '',
  },
  {
    userId: 'u-other',
    email: 'other@example.com',
    displayName: null,
    grantedAt: '',
  },
]

describe('organizer-row.helper', () => {
  it('matches organizer by userId', () => {
    expect(isRowOrganizer('u-org', null, organizers)).toBe(true)
    expect(findRowOrganizer('u-org', null, organizers)?.email).toBe('org@example.com')
  })

  it('matches organizer by email when userId is missing', () => {
    expect(isRowOrganizer(null, 'other@example.com', organizers)).toBe(true)
  })

  it('requires email to assign organizer role', () => {
    expect(canAssignOrganizerRole('a@example.com')).toBe(true)
    expect(canAssignOrganizerRole(null)).toBe(false)
    expect(canAssignOrganizerRole('   ')).toBe(false)
  })

  it('formats participation role chip label', () => {
    expect(participationRoleChipLabel(false, true)).toBe('Participant·e ▾')
    expect(participationRoleChipLabel(true, false)).toBe('Organisateur·ice')
    expect(participationRoleChipLabel(false, false, 'male')).toBe('Participant')
    expect(participationRoleChipLabel(true, false, 'female')).toBe('Organisatrice')
  })

  it('formats gendered participation role labels', () => {
    expect(participantRoleLabel('female')).toBe('Participante')
    expect(organizerRoleLabel('male')).toBe('Organisateur')
  })

  it('formats organizer menu label by scope', () => {
    expect(organizerRoleMenuLabel('spectacle')).toContain('spectacle')
    expect(organizerRoleMenuLabel('saison')).toContain('saison')
    expect(organizerRoleMenuLabel('spectacle', 'female')).toBe('Organisatrice du spectacle')
  })
})
