import { describe, expect, it } from 'vitest'

import { canShowCompositionExplainability } from './composition-explainability'
import type { CompositionResponse } from './composition-api.service'

describe('canShowCompositionExplainability', () => {
  it('denies member before validation without assigned slots', () => {
    const composition: CompositionResponse = {
      visibility: 'none',
      slots: [],
    }
    expect(canShowCompositionExplainability(false, composition)).toBe(false)
  })

  it('allows organizer when draft has assigned slots', () => {
    const composition: CompositionResponse = {
      visibility: 'organizerDraft',
      slots: [{ roleKey: 'player', slotIndex: 0, participantId: 'p-1', participationStatus: 'pending' }],
    }
    expect(canShowCompositionExplainability(true, composition)).toBe(true)
  })

  it('allows member after validation even without manage rights', () => {
    const composition: CompositionResponse = {
      visibility: 'validated',
      validatedAt: '2031-01-01T00:00:00Z',
      slots: [{ roleKey: 'player', slotIndex: 0, participantId: 'p-1', participationStatus: 'confirmed' }],
    }
    expect(canShowCompositionExplainability(false, composition)).toBe(true)
  })
})
