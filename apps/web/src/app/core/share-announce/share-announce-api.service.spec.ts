import { describe, expect, it } from 'vitest'

import {
  normalizeShareRecipientChannelStatus,
  normalizeShareRecipientsResponse,
  type ShareRecipient,
} from './share-announce-api.service'

describe('normalizeShareRecipientsResponse', () => {
  it('maps legacy flat channel booleans to nested status objects', () => {
    const normalized = normalizeShareRecipientsResponse({
      total: 2,
      notifiableCount: 99,
      manualCount: 0,
      recipients: [
        {
          participantId: 'p-1',
          displayName: 'Alice',
          emailObfuscated: 'ali••@ex••.com',
          channels: { email: true, push: false } as unknown as ShareRecipient['channels'],
        },
        {
          participantId: 'p-2',
          displayName: 'Bob',
          emailObfuscated: null,
          channels: { email: false, push: false } as unknown as ShareRecipient['channels'],
        },
      ],
    })

    expect(normalized.recipients[0].channels.email).toEqual({
      eligible: true,
      notified: false,
      lastNotifiedAt: null,
    })
    expect(normalized.recipients[0].channels.push).toEqual({
      eligible: false,
      notified: false,
      lastNotifiedAt: null,
    })
    expect(normalized.recipients[1].channels.email.eligible).toBe(false)
    expect(normalized.notifiableCount).toBe(1)
    expect(normalized.manualCount).toBe(1)
  })

  it('preserves nested channel status and recomputes counts', () => {
    const normalized = normalizeShareRecipientsResponse({
      total: 1,
      notifiableCount: 0,
      manualCount: 1,
      recipients: [
        {
          participantId: 'p-1',
          displayName: 'Carol',
          emailObfuscated: null,
          channels: {
            email: { eligible: true, notified: true },
            push: { eligible: false, notified: false },
          },
        },
      ],
    })

    expect(normalized.recipients[0].channels.email.notified).toBe(true)
    expect(normalized.notifiableCount).toBe(1)
    expect(normalized.manualCount).toBe(0)
  })
})

describe('normalizeShareRecipientChannelStatus', () => {
  it('returns false/false for unknown shapes', () => {
    expect(normalizeShareRecipientChannelStatus(null)).toEqual({
      eligible: false,
      notified: false,
      lastNotifiedAt: null,
    })
  })

  it('passes through lastNotifiedAt when provided', () => {
    expect(
      normalizeShareRecipientChannelStatus({
        eligible: true,
        notified: true,
        lastNotifiedAt: '2026-06-02T14:30:00Z',
      }),
    ).toEqual({
      eligible: true,
      notified: true,
      lastNotifiedAt: '2026-06-02T14:30:00Z',
    })
  })
})
