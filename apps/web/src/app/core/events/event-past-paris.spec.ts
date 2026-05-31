import { describe, expect, it } from 'vitest'

import { isEventPastParis } from './event-past-paris'

describe('isEventPastParis', () => {
  it('treats YYYY-MM-DD as Paris civil day end', () => {
    const now = new Date('2024-06-15T12:00:00.000Z')
    expect(isEventPastParis('2024-06-14', now)).toBe(true)
    expect(isEventPastParis('2024-06-15', now)).toBe(false)
    expect(isEventPastParis('2024-06-16', now)).toBe(false)
  })

  it('returns false when date is missing or invalid', () => {
    expect(isEventPastParis(undefined, new Date())).toBe(false)
    expect(isEventPastParis('not-a-date', new Date())).toBe(false)
  })
})
