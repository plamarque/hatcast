import { describe, expect, it } from 'vitest'

import { summaryParticipantsToSelectors } from './availability-subject-options'

describe('summaryParticipantsToSelectors', () => {
  it('maps linked and name-only summary participants', () => {
    const result = summaryParticipantsToSelectors([
      {
        participantId: 'sp-1',
        userId: 'user-1',
        displayName: 'Patrice',
        avatarUrl: 'https://example.com/a.png',
        gender: 'male',
        status: 'available',
        roleKeys: ['player'],
        comment: null,
      },
      {
        participantId: 'ep-1',
        userId: null,
        displayName: 'Guest Artist',
        avatarUrl: null,
        status: 'unknown',
        roleKeys: [],
        comment: null,
      },
    ])

    expect(result).toEqual([
      {
        id: 'sp-1',
        displayName: 'Patrice',
        avatarUrl: 'https://example.com/a.png',
        kind: 'LINKED',
        userId: 'user-1',
        gender: 'male',
      },
      {
        id: 'ep-1',
        displayName: 'Guest Artist',
        avatarUrl: null,
        kind: 'NAME_ONLY',
        userId: null,
        gender: undefined,
      },
    ])
  })
})
