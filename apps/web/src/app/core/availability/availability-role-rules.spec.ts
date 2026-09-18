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

  it('preserves historical roles when reading without write normalization', () => {
    expect(normalizeCandidateRoleKeys(ROLE_TEMPLATES.match, ['player'], false)).toEqual(['player'])
  })

  it.each(['player', 'mc', 'dj', 'referee', 'assistant_referee', 'coach', 'stage_manager', 'lighting'])('adds volunteer for optional role %s', role => {
    expect(normalizeCandidateRoleKeys({ [role]: 1, volunteer: 1 }, [role])).toEqual([role, 'volunteer'])
  })

  it('allows volunteer-only available writes without inventing other roles', () => {
    expect(normalizeCandidateRoleKeys({ volunteer: 1 }, [])).toEqual(['volunteer'])
    expect(normalizeCandidateRoleKeys({}, [])).toEqual([])
    expect(normalizeCandidateRoleKeys({ mc: 1 }, [])).toEqual([])
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
