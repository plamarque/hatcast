import { describe, expect, it } from 'vitest'

import {
  computeVoteFromChecks,
  patchSummaryOptimistic,
  roleGaugeFillPercent,
  toggleRoleCheck,
} from './availability-vote.utils'
import { ROLE_TEMPLATES } from '../../core/events/event-types'

describe('availability-vote.utils', () => {
  it('computes gauge fill capped at 100%', () => {
    expect(roleGaugeFillPercent(20, 4)).toBe(100)
    expect(roleGaugeFillPercent(4, 12)).toBe(33)
  })

  it('maps all unchecked to unknown', () => {
    expect(
      computeVoteFromChecks({
        hasRoles: true,
        unavailableChecked: false,
        availableChecked: false,
        checkedRoleKeys: [],
      }),
    ).toEqual({ status: 'unknown', roleKeys: [] })
  })

  it('maps indispo exclusive to unavailable', () => {
    expect(
      computeVoteFromChecks({
        hasRoles: true,
        unavailableChecked: true,
        availableChecked: false,
        checkedRoleKeys: ['player'],
      }),
    ).toEqual({ status: 'unavailable', roleKeys: [] })
  })

  it('auto-adds volunteer when player is checked on match format', () => {
    const next = toggleRoleCheck(ROLE_TEMPLATES.match, [], 'player', true, true)
    expect(next).toContain('player')
    expect(next).toContain('volunteer')
  })

  it('patches summary candidates optimistically', () => {
    const summary = {
      eventId: 'e1',
      roleSlots: ROLE_TEMPLATES.cabaret,
      participants: [
        {
          participantId: 'p1',
          displayName: 'Patrice',
          status: 'unknown' as const,
          roleKeys: [],
        },
      ],
      roles: [{ roleKey: 'player', requiredCount: 5, candidates: [] }],
    }
    const next = patchSummaryOptimistic(summary, 'p1', 'available', ['player'])
    expect(next.participants[0].status).toBe('available')
    expect(next.roles[0].candidates).toHaveLength(1)
    expect(next.roles[0].candidates[0].participantId).toBe('p1')
  })
})
