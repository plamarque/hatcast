import { describe, expect, it } from 'vitest'

import type { CompositionResponse } from '../../core/composition/composition-api.service'
import { findViewerParticipationSlot } from './agenda-participation-slot'

describe('findViewerParticipationSlot', () => {
  const composition: CompositionResponse = {
    visibility: 'validated',
    slots: [
      {
        roleKey: 'player',
        slotIndex: 0,
        participantId: 'p-me',
        participationStatus: 'pending',
      },
      {
        roleKey: 'player',
        slotIndex: 1,
        participantId: 'p-other',
        participationStatus: 'confirmed',
      },
    ],
    viewerParticipantIds: ['p-me'],
  }

  it('returns the viewer slot for the requested role', () => {
    const slot = findViewerParticipationSlot(composition, 'player')
    expect(slot?.slotIndex).toBe(0)
    expect(slot?.participantId).toBe('p-me')
  })

  it('returns null when the viewer has no matching role', () => {
    expect(findViewerParticipationSlot(composition, 'mc')).toBeNull()
  })
})
