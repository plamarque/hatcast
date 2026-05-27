import { describe, expect, it } from 'vitest'

import type { CompositionResponse } from './composition-api.service'
import { showCompositionDraftBanner } from './composition-visibility'

function comp(overrides: Partial<CompositionResponse> = {}): CompositionResponse {
  return {
    publishedAt: null,
    validatedAt: null,
    visibility: 'organizerDraft',
    slots: [],
    ...overrides,
  }
}

describe('showCompositionDraftBanner', () => {
  it('shows for organizer with assigned unvalidated composition', () => {
    expect(
      showCompositionDraftBanner(
        comp({
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participationStatus: 'pending',
            },
          ],
        }),
        true,
      ),
    ).toBe(true)
  })

  it('shows even when visibility is publishedDraft (legacy publish)', () => {
    expect(
      showCompositionDraftBanner(
        comp({
          publishedAt: '2026-01-01T00:00:00.000Z',
          visibility: 'publishedDraft',
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participationStatus: 'pending',
            },
          ],
        }),
        true,
      ),
    ).toBe(true)
  })

  it('hides after validation', () => {
    expect(
      showCompositionDraftBanner(
        comp({
          validatedAt: '2026-01-02T00:00:00.000Z',
          visibility: 'validated',
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participationStatus: 'pending',
            },
          ],
        }),
        true,
      ),
    ).toBe(false)
  })

  it('hides for members without manage permission', () => {
    expect(
      showCompositionDraftBanner(
        comp({
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participationStatus: 'pending',
            },
          ],
        }),
        false,
      ),
    ).toBe(false)
  })
})
