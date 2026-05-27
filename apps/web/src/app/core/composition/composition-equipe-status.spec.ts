import { describe, expect, it } from 'vitest'

import { emptyRoleSlots } from '../events/event-types'
import type { CompositionResponse } from './composition-api.service'
import { resolveCompositionEquipeStatus } from './composition-equipe-status'

function comp(overrides: Partial<CompositionResponse> = {}): CompositionResponse {
  return {
    publishedAt: null,
    validatedAt: null,
    visibility: 'organizerDraft',
    slots: [],
    ...overrides,
  }
}

describe('resolveCompositionEquipeStatus', () => {
  const roleSlots = { ...emptyRoleSlots(), player: 2 }

  it('returns À composer when no assignees', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp(),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.label).toBe('À composer')
    expect(status?.type).toBe('none')
  })

  it('returns En préparation for draft with selection', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'pending',
          },
        ],
      }),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.label).toBe('En préparation')
    expect(status?.type).toBe('draft')
  })

  it('returns À compléter before À vérifier when empty slot exists', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'declined',
          },
        ],
      }),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.label).toBe('À compléter')
    expect(status?.type).toBe('slots_to_complete')
  })

  it('returns À vérifier when validated with declined assignee and no empty slots', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'confirmed',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participationStatus: 'declined',
          },
        ],
      }),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.label).toBe('À vérifier')
    expect(status?.type).toBe('has_declined')
  })

  it('returns Confirmations en cours when validated and not all confirmed', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'confirmed',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participationStatus: 'pending',
          },
        ],
      }),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.label).toBe('Confirmations en cours')
    expect(status?.type).toBe('pending_confirmation')
  })

  it('returns Équipe complète when validated and all confirmed', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'confirmed',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participationStatus: 'confirmed',
          },
        ],
      }),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.label).toBe('Équipe complète')
    expect(status?.type).toBe('complete')
    expect(status?.tone).toBe('success')
  })

  it('returns null managerGuideline for members on draft', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'pending',
          },
        ],
      }),
      canManageComposition: false,
      roleSlots,
    })
    expect(status?.managerGuideline).toBeNull()
    expect(status?.label).toBe('En préparation')
  })

  it('returns managerGuideline for organizers on draft', () => {
    const status = resolveCompositionEquipeStatus({
      composition: comp({
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'pending',
          },
        ],
      }),
      canManageComposition: true,
      roleSlots,
    })
    expect(status?.managerGuideline).toContain('En préparation')
    expect(status?.managerGuideline).toContain('Valider')
  })
})
