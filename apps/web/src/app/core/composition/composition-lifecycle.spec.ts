import { describe, expect, it } from 'vitest'

import type { CompositionResponse } from './composition-api.service'
import {
  computeCompositionLifecycleView,
  computeRawCompositionLifecycle,
} from './composition-lifecycle'

function comp(overrides: Partial<CompositionResponse> = {}): CompositionResponse {
  return {
    publishedAt: null,
    validatedAt: null,
    visibility: 'organizerDraft',
    slots: [],
    ...overrides,
  }
}

describe('composition lifecycle (client)', () => {
  const roleSlots = { player: 2 }

  it('returns preparing when no composition rows', () => {
    expect(computeRawCompositionLifecycle(null, roleSlots)).toBe('preparing')
  })

  it('returns draftComposition when assigned but not validated', () => {
    const composition = comp({
      slots: [
        {
          roleKey: 'player',
          slotIndex: 0,
          participantId: 'p-1',
          participantDisplayName: 'A',
          participationStatus: 'pending',
        },
      ],
    })
    expect(computeRawCompositionLifecycle(composition, roleSlots)).toBe('draftComposition')
  })

  it('returns gapsToFill when validated with empty required slot', () => {
    const composition = comp({
      validatedAt: '2026-01-01T00:00:00.000Z',
      visibility: 'validated',
      slots: [
        {
          roleKey: 'player',
          slotIndex: 0,
          participantId: 'p-1',
          participantDisplayName: 'A',
          participationStatus: 'pending',
        },
      ],
    })
    expect(computeRawCompositionLifecycle(composition, roleSlots)).toBe('gapsToFill')
  })

  it('hides draftComposition from members in display view', () => {
    const composition = comp({
      slots: [
        {
          roleKey: 'player',
          slotIndex: 0,
          participantId: 'p-1',
          participantDisplayName: 'A',
          participationStatus: 'pending',
        },
      ],
    })
    const view = computeCompositionLifecycleView(composition, roleSlots, false)
    expect(view.compositionLifecycle).toBe('preparing')
    expect(view.teamStatusBadge.key).toBe('collecting')
  })
})
