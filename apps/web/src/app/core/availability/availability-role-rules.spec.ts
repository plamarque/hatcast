import { describe, expect, it } from 'vitest'

import { ROLE_TEMPLATES } from '../events/event-types'
import {
  candidateRolesForEvent,
  normalizeCandidateRoleKeys,
  preferredRoleIntersection,
} from './availability-role-rules'

describe('availability-role-rules', () => {
  it('keeps only roles required by the event', () => {
    expect([...candidateRolesForEvent(ROLE_TEMPLATES.cabaret)].sort()).toEqual(
      ['player', 'dj', 'mc'].sort(),
    )
  })

  it('normalizes selected role keys and ignores invalid roles', () => {
    expect(normalizeCandidateRoleKeys(ROLE_TEMPLATES.cabaret, ['player', 'referee', 'player'])).toEqual([
      'player',
    ])
  })

  it('auto-adds volunteer for match player when rule applies', () => {
    expect(normalizeCandidateRoleKeys(ROLE_TEMPLATES.match, ['player'])).toEqual(['player', 'volunteer'])
  })

  it('honors explicit volunteer omit', () => {
    expect(normalizeCandidateRoleKeys(ROLE_TEMPLATES.match, ['player'], false)).toEqual(['player'])
  })

  it('pre-checks preferred roles by intersection with event roles', () => {
    expect(preferredRoleIntersection(ROLE_TEMPLATES.match, ['coach', 'player', 'mc'])).toEqual([
      'coach',
      'player',
      'mc',
      'volunteer',
    ])
  })
})
