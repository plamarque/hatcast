import { describe, expect, it } from 'vitest'

import type { SeasonParticipantAdmin } from '../../core/participants/participant-api.service'
import type { TroupeMemberAdmin } from '../../core/troupes/troupe-api.service'
import {
  buildParticipantAddSuggestions,
  filterTroupeMemberSuggestions,
  findParticipantAddSuggestionByKey,
  isGuestScopeSuggestion,
  seasonParticipantIdForEventInclude,
} from './participant-member-suggestions'

const member = (
  id: string,
  displayName: string,
  userId: string | null,
  email: string | null = userId ? `${id}@example.com` : null,
  baselineRole: TroupeMemberAdmin['baselineRole'] = 'MEMBER',
): TroupeMemberAdmin => ({
  id,
  userId,
  userSlug: id,
  email,
  displayName,
  status: 'ACTIVE',
  baselineRole,
  createdAt: '',
  updatedAt: '',
})

const seasonParticipant = (
  id: string,
  displayName: string,
  overrides: Partial<SeasonParticipantAdmin> = {},
): SeasonParticipantAdmin => ({
  id,
  displayName,
  email: null,
  userId: null,
  troupeMembershipId: null,
  kind: 'EXTERNE',
  status: 'ACTIVE',
  removable: true,
  ...overrides,
})

describe('buildParticipantAddSuggestions', () => {
  const members = [
    member('m-1', 'Alice', 'u-1'),
    member('m-2', 'Piotrix Bot', 'u-2', 'piotrix@example.com'),
    member('m-3', 'Ruben DJ', null, 'ruben@cambo.fr', 'EXTERNE'),
    member('m-4', 'Carol', 'u-3', 'INACTIVE' as unknown as string),
  ]
  members[3]!.status = 'INACTIVE'

  it('returns nothing until the user types a query', () => {
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: members,
        seasonParticipants: [],
        query: '',
        excludedUserIds: new Set(),
      }),
    ).toEqual([])
  })

  it('filters carnet by display name or email', () => {
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: members,
        seasonParticipants: [],
        query: 'Pio',
        excludedUserIds: new Set(),
      }).map((s) => s.displayName),
    ).toEqual(['Piotrix Bot'])
  })

  it('includes EXTERNE carnet rows without userId', () => {
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: members,
        seasonParticipants: [],
        query: 'Ruben',
        excludedUserIds: new Set(),
      }).map((s) => s.displayName),
    ).toEqual(['Ruben DJ'])
  })

  it('excludes active roster user ids', () => {
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: members,
        seasonParticipants: [],
        query: 'Pio',
        excludedUserIds: new Set(['u-2']),
      }),
    ).toEqual([])
  })

  it('excludes normalized display names', () => {
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: members,
        seasonParticipants: [],
        query: 'Ali',
        excludedUserIds: new Set(),
        excludedDisplayNames: new Set(['alice']),
      }),
    ).toEqual([])
  })

  it('ignores inactive carnet memberships', () => {
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: [members[3]!],
        seasonParticipants: [],
        query: 'Car',
        excludedUserIds: new Set(),
      }),
    ).toEqual([])
  })

  it('merges season roster rows when enabled and dedupes carnet', () => {
    const seasonRows = [
      seasonParticipant('p-1', 'Laetitia MC', {
        email: 'laetitia@example.com',
        userId: 'u-10',
        troupeMembershipId: 'm-10',
        kind: 'EXTERNE',
      }),
      seasonParticipant('p-2', 'Alice', {
        email: 'alice@example.com',
        userId: 'u-1',
        troupeMembershipId: 'm-1',
        kind: 'MEMBER',
      }),
    ]
    const results = buildParticipantAddSuggestions({
      carnetMembers: members,
      seasonParticipants: seasonRows,
      query: 'Laet',
      excludedUserIds: new Set(),
      includeSeasonRoster: true,
    })
    expect(results).toHaveLength(1)
    expect(results[0]?.source).toBe('season')
    expect(results[0]?.displayName).toBe('Laetitia MC')
  })

  it('skips season roster merge when includeSeasonRoster is false', () => {
    const seasonRows = [
      seasonParticipant('p-1', 'Laetitia MC', { kind: 'EXTERNE' }),
    ]
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: [],
        seasonParticipants: seasonRows,
        query: 'Laet',
        excludedUserIds: new Set(),
        includeSeasonRoster: false,
      }),
    ).toEqual([])
  })

  it('caps suggestions at eight rows', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      member(`m-${i}`, `Member ${i}`, `u-${i}`, `member${i}@example.com`),
    )
    expect(
      buildParticipantAddSuggestions({
        carnetMembers: many,
        seasonParticipants: [],
        query: 'member',
        excludedUserIds: new Set(),
      }),
    ).toHaveLength(8)
  })
})

describe('filterTroupeMemberSuggestions (legacy)', () => {
  it('delegates to carnet-only builder', () => {
    const members = [member('m-1', 'Alice', 'u-1')]
    expect(filterTroupeMemberSuggestions(members, 'Ali', new Set()).map((m) => m.displayName)).toEqual(
      ['Alice'],
    )
  })
})

describe('isGuestScopeSuggestion', () => {
  it('returns false for troupe member/admin', () => {
    expect(isGuestScopeSuggestion({ baselineRole: 'MEMBER' })).toBe(false)
    expect(isGuestScopeSuggestion({ baselineRole: 'TROUPE_ADMIN' })).toBe(false)
    expect(isGuestScopeSuggestion({ kind: 'MEMBER' })).toBe(false)
  })

  it('returns true for externe/guest selections', () => {
    expect(isGuestScopeSuggestion({ baselineRole: 'EXTERNE' })).toBe(true)
    expect(isGuestScopeSuggestion({ kind: 'EXTERNE' })).toBe(true)
  })
})

describe('findParticipantAddSuggestionByKey', () => {
  const members = [member('m-1', 'Alice', 'u-1')]
  const seasonRows = [
    seasonParticipant('p-1', 'Laetitia MC', {
      troupeMembershipId: 'm-10',
      kind: 'EXTERNE',
    }),
  ]

  it('resolves carnet and season keys', () => {
    expect(findParticipantAddSuggestionByKey('m:m-1', members, seasonRows)?.displayName).toBe(
      'Alice',
    )
    expect(findParticipantAddSuggestionByKey('s:p-1', members, seasonRows)?.displayName).toBe(
      'Laetitia MC',
    )
  })
})

describe('seasonParticipantIdForEventInclude', () => {
  const seasonRows = [
    seasonParticipant('p-angie', 'Angie', {
      troupeMembershipId: 'm-angie',
      userId: 'u-angie',
      kind: 'MEMBER',
    }),
    seasonParticipant('p-laet', 'Laetitia MC', {
      troupeMembershipId: 'm-10',
      kind: 'EXTERNE',
    }),
  ]

  it('returns season id for troupe member carnet selection', () => {
    const members = [member('m-angie', 'Angie', 'u-angie')]
    const suggestion = findParticipantAddSuggestionByKey('m:m-angie', members, seasonRows)!
    expect(seasonParticipantIdForEventInclude(suggestion, seasonRows)).toBe('p-angie')
  })

  it('returns null for externe guest selections', () => {
    const suggestion = findParticipantAddSuggestionByKey('s:p-laet', [], seasonRows)!
    expect(seasonParticipantIdForEventInclude(suggestion, seasonRows)).toBeNull()
  })
})
