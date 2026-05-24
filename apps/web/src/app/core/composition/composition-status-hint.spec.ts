import { describe, expect, it } from 'vitest'

import { compositionStatusHint } from './composition-status-hint'

describe('compositionStatusHint', () => {
  it('shows organizer draft hint when unpublished', () => {
    expect(
      compositionStatusHint('draftComposition', { canManageComposition: true }),
    ).toBe('Composition en cours — non visible des autres membres.')
  })

  it('shows published hint for members', () => {
    expect(compositionStatusHint('draftComposition', { canManageComposition: false })).toBe(
      'Proposition d\'équipe publiée.',
    )
  })

  it('shows published hint for organizer after publish', () => {
    expect(
      compositionStatusHint('draftComposition', {
        canManageComposition: true,
        compositionPublishedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe('Proposition d\'équipe publiée.')
  })
})
