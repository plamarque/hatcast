import { describe, expect, it } from 'vitest'

import {
  canValidateComposition,
  EQUIPE_ACTION_LABELS,
  resolveEquipePrimaryAction,
  resolveEquipeToolbarLayout,
  shouldPutShareInOverflow,
  type EquipeActionFlags,
} from './composition-equipe-actions'

function flags(overrides: Partial<EquipeActionFlags> = {}): EquipeActionFlags {
  return {
    canValidate: false,
    canFillGaps: false,
    canAnnounceComposition: false,
    canDraw: false,
    canUnlock: false,
    canShareDraw: false,
    hasAssignedSlot: false,
    ...overrides,
  }
}

describe('resolveEquipePrimaryAction', () => {
  it('returns validate when canValidate', () => {
    expect(resolveEquipePrimaryAction(flags({ canValidate: true, hasAssignedSlot: true }))).toBe(
      'validate',
    )
  })

  it('returns fill before announce when both apply', () => {
    expect(
      resolveEquipePrimaryAction(
        flags({ canFillGaps: true, canAnnounceComposition: true, hasAssignedSlot: true }),
      ),
    ).toBe('fill')
  })

  it('returns draw for empty composition', () => {
    expect(resolveEquipePrimaryAction(flags({ canDraw: true, hasAssignedSlot: false }))).toBe('draw')
  })

  it('returns draw when slots exist but validate is not available', () => {
    expect(
      resolveEquipePrimaryAction(flags({ canDraw: true, hasAssignedSlot: true })),
    ).toBe('draw')
  })
})

describe('shouldPutShareInOverflow', () => {
  it('puts share in overflow during draft with validate', () => {
    expect(
      shouldPutShareInOverflow(
        flags({
          canShareDraw: true,
          canValidate: true,
          canDraw: true,
          hasAssignedSlot: true,
        }),
      ),
    ).toBe(true)
  })

  it('keeps share in grid when only share and draw are visible', () => {
    expect(
      shouldPutShareInOverflow(flags({ canShareDraw: true, canDraw: true, hasAssignedSlot: false })),
    ).toBe(false)
  })

  it('puts share in overflow when validate and draw are visible', () => {
    expect(
      shouldPutShareInOverflow(
        flags({
          canShareDraw: true,
          canValidate: true,
          canDraw: true,
          hasAssignedSlot: true,
        }),
      ),
    ).toBe(true)
  })
})

describe('canValidateComposition', () => {
  it('returns false when composition is locked or interaction blocked', () => {
    const composition = {
      publishedAt: null,
      validatedAt: null,
      visibility: 'organizerDraft' as const,
      slots: [{ roleKey: 'player', slotIndex: 0, participantId: 'p-1', participationStatus: 'pending' as const }],
    }

    expect(
      canValidateComposition({
        canManageComposition: true,
        composition,
      }),
    ).toBe(true)

    expect(
      canValidateComposition({
        canManageComposition: true,
        composition: { ...composition, validatedAt: '2026-01-01T00:00:00.000Z' },
      }),
    ).toBe(false)

    expect(
      canValidateComposition({
        canManageComposition: true,
        composition,
        compositionInteractionBlocked: true,
      }),
    ).toBe(false)
  })
})

describe('EQUIPE_ACTION_LABELS', () => {
  it('matches event-equipe-tab toolbar button copy', () => {
    expect(EQUIPE_ACTION_LABELS.validate).toBe('Valider')
    expect(EQUIPE_ACTION_LABELS.draw).toBe('Tirer au sort')
    expect(EQUIPE_ACTION_LABELS.announce).toBe('Annoncer la compo')
    expect(EQUIPE_ACTION_LABELS.fill).toBe('Compléter')
    expect(EQUIPE_ACTION_LABELS.unlock).toBe('Déverrouiller')
    expect(EQUIPE_ACTION_LABELS.share).toBe('Partager')
  })
})

describe('resolveEquipeToolbarLayout', () => {
  it('places share in overflow for draft validate toolbar', () => {
    const layout = resolveEquipeToolbarLayout(
      flags({
        canValidate: true,
        canDraw: true,
        canShareDraw: true,
        hasAssignedSlot: true,
      }),
    )
    expect(layout.primary).toBe('validate')
    expect(layout.grid).toEqual(['validate', 'draw'])
    expect(layout.overflow).toEqual(['share'])
  })

  it('keeps announce primary with unlock secondary', () => {
    const layout = resolveEquipeToolbarLayout(
      flags({
        canAnnounceComposition: true,
        canUnlock: true,
        hasAssignedSlot: true,
      }),
    )
    expect(layout.primary).toBe('announce')
    expect(layout.grid).toEqual(['announce', 'unlock'])
    expect(layout.overflow).toEqual([])
  })

  it('shows only draw in grid for empty composition', () => {
    const layout = resolveEquipeToolbarLayout(flags({ canDraw: true }))
    expect(layout.primary).toBe('draw')
    expect(layout.grid).toEqual(['draw'])
    expect(layout.overflow).toEqual([])
  })
})
