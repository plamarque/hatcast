import { describe, expect, it } from 'vitest'
import { checkedRoleKeysFromSubject, computeVoteFromChecks, patchSummaryOptimistic, toggleRoleCheck } from './availability-vote.utils'
import type { EventAvailabilitySummary, SummaryParticipant } from '../../core/availability/availability-api.service'

describe('availability vote write and historical read boundaries', () => {
  const historical = { participantId: 'p1', displayName: 'Patrice', status: 'available', roleKeys: [] } as SummaryParticipant
  it('does not normalize historical reads into new volunteer-only writes', () => {
    expect(checkedRoleKeysFromSubject({ player: 1, volunteer: 1 }, historical)).toEqual([])
    expect(toggleRoleCheck({ player: 1, volunteer: 1 }, ['player'], 'player', false, false)).toEqual(['volunteer'])
    expect(computeVoteFromChecks({ hasRoles: true, unavailableChecked: false, availableChecked: false, checkedRoleKeys: [] })).toEqual({ status: 'unknown', roleKeys: [] })
  })
  it('removes historical wildcard candidacy when an explicit response replaces it', () => {
    const summary = { participants: [historical], roles: [
      { roleKey: 'player', requiredCount: 1, candidates: [historical] },
      { roleKey: 'volunteer', requiredCount: 1, candidates: [historical] },
    ] } as unknown as EventAvailabilitySummary
    const patched = patchSummaryOptimistic(summary, 'p1', 'available', ['volunteer'])
    expect(patched.roles[0].candidates).toEqual([])
    expect(patched.roles[1].candidates).toHaveLength(1)
    expect(summary.roles[0].candidates).toHaveLength(1)
  })
})
