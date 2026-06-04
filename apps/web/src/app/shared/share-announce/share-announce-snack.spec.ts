import { describe, expect, it } from 'vitest'

import { shareAnnounceSnackMessage } from './share-announce-snack'

describe('shareAnnounceSnackMessage', () => {
  it('returns count-aware copy for availability nudge with dispatch', () => {
    expect(
      shareAnnounceSnackMessage({
        intent: 'availability_nudge',
        notifiedCount: 3,
        manualCount: 1,
      }),
    ).toBe('3 notifications envoyées.')
  })

  it('returns enregistrement copy for stub intents after notify', () => {
    expect(
      shareAnnounceSnackMessage({
        intent: 'draw',
        notifiedCount: 0,
        manualCount: 2,
      }),
    ).toBe('Demande enregistrée.')
  })

  it('returns count-aware copy for event intent with dispatch', () => {
    expect(
      shareAnnounceSnackMessage({
        intent: 'event',
        notifiedCount: 2,
        manualCount: 0,
      }),
    ).toBe('2 notifications envoyées.')
  })

  it('returns enregistrement copy for event when notifiedCount is zero', () => {
    expect(
      shareAnnounceSnackMessage({
        intent: 'event',
        notifiedCount: 0,
        manualCount: 0,
      }),
    ).toBe('Demande enregistrée.')
  })

  it('returns neutral copy when nudge has zero notified', () => {
    expect(
      shareAnnounceSnackMessage({
        intent: 'availability_nudge',
        notifiedCount: 0,
        manualCount: 2,
      }),
    ).toBe('Message prêt — partage-le via Copier ou WhatsApp.')
  })
})
