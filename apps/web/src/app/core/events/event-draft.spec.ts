import { describe, expect, it } from 'vitest'

import { isEventDraft } from './event-draft'

describe('isEventDraft', () => {
  it('true when availability not opened', () => {
    expect(isEventDraft({ availabilityOpenedAt: null })).toBe(true)
  })

  it('false when availability is open even if badge key is draft', () => {
    expect(
      isEventDraft({
        availabilityOpenedAt: '2026-01-01T00:00:00Z',
        teamStatusBadge: { key: 'draft' },
      }),
    ).toBe(false)
  })

  it('false when open and badge not draft', () => {
    expect(
      isEventDraft({
        availabilityOpenedAt: '2026-01-01T00:00:00Z',
        teamStatusBadge: { key: 'collecting' },
      }),
    ).toBe(false)
  })

  it('false when availabilityOpenedAt omitted and badge is not draft (Mon agenda)', () => {
    expect(isEventDraft({ teamStatusBadge: { key: 'collecting' } })).toBe(false)
  })

  it('true when availabilityOpenedAt omitted and badge is draft', () => {
    expect(isEventDraft({ teamStatusBadge: { key: 'draft' } })).toBe(true)
  })
})
