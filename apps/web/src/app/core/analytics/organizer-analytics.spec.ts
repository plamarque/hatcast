import { describe, expect, it } from 'vitest'

import { recipientCountBucket, resolveActorScope } from './organizer-analytics'

describe('organizer analytics boundaries', () => {
  const permissions = {
    isTroupeAdmin: false,
    isSeasonOrganizer: false,
    eventOrganizerFor: ['event-1'],
  }

  it('uses the documented event-local precedence', () => {
    expect(resolveActorScope(permissions as never, 'event-1')).toBe('event_organizer')
    expect(resolveActorScope(permissions as never, 'event-2')).toBe('member')
    expect(resolveActorScope({ ...permissions, isSeasonOrganizer: true } as never, 'event-1')).toBe('season_organizer')
    expect(resolveActorScope({ ...permissions, isTroupeAdmin: true } as never, 'event-1')).toBe('troupe_admin')
    expect(resolveActorScope(permissions as never, 'event-1', { platformAdmin: true })).toBe('platform_admin')
  })

  it('reduces reminder volume to non-identifying buckets', () => {
    expect([0, 1, 2, 5, 6, 20, 21].map(recipientCountBucket)).toEqual([
      '0', '1', '2_5', '2_5', '6_20', '6_20', '21_plus',
    ])
  })
})
