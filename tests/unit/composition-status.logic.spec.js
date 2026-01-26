/**
 * Unit tests for composition status decision logic.
 * Mirrors the evaluation order and conditions from SelectionModal.vue compositionStatus computed.
 * Source of truth: docs/technical/composition-status-messages.md and SelectionModal.vue.
 */
import { describe, it, expect } from 'vitest'

/**
 * Replicates the composition status decision logic (same order and conditions as SelectionModal.vue).
 * @param {Object} params
 * @param {boolean} params.hasSelection
 * @param {boolean} params.hasEmptySlots
 * @param {boolean} params.hasDeclinedPlayersInSlots
 * @param {boolean} params.allFilledSlotsConfirmedLocally
 * @param {boolean} params.isSelectionConfirmedByOrganizer
 * @returns {{ type: string, label: string }}
 */
function getCompositionStatus({ hasSelection, hasEmptySlots, hasDeclinedPlayersInSlots, allFilledSlotsConfirmedLocally, isSelectionConfirmedByOrganizer }) {
  if (!hasSelection) {
    return { type: 'none', label: 'À composer' }
  }
  if (!hasEmptySlots && !hasDeclinedPlayersInSlots && allFilledSlotsConfirmedLocally) {
    return { type: 'complete', label: 'Équipe complète' }
  }
  if (isSelectionConfirmedByOrganizer && hasEmptySlots) {
    return { type: 'slots_to_complete', label: 'À compléter' }
  }
  if (isSelectionConfirmedByOrganizer && hasDeclinedPlayersInSlots) {
    return { type: 'has_declined', label: 'À vérifier' }
  }
  if (isSelectionConfirmedByOrganizer) {
    return { type: 'pending_confirmation', label: 'Confirmations en cours' }
  }
  return { type: 'draft', label: 'En préparation' }
}

describe('getCompositionStatus', () => {
  it('returns À composer when no selection', () => {
    const result = getCompositionStatus({
      hasSelection: false,
      hasEmptySlots: true,
      hasDeclinedPlayersInSlots: false,
      allFilledSlotsConfirmedLocally: false,
      isSelectionConfirmedByOrganizer: false,
    })
    expect(result.type).toBe('none')
    expect(result.label).toBe('À composer')
  })

  it('returns Équipe complète when validated, full, no declined in slots, all confirmed', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: false,
      hasDeclinedPlayersInSlots: false,
      allFilledSlotsConfirmedLocally: true,
      isSelectionConfirmedByOrganizer: true,
    })
    expect(result.type).toBe('complete')
    expect(result.label).toBe('Équipe complète')
  })

  it('returns À compléter when validated and has empty slots', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: true,
      hasDeclinedPlayersInSlots: false,
      allFilledSlotsConfirmedLocally: false,
      isSelectionConfirmedByOrganizer: true,
    })
    expect(result.type).toBe('slots_to_complete')
    expect(result.label).toBe('À compléter')
  })

  it('returns À compléter (not À vérifier) when validated, empty slots, and declined in slots', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: true,
      hasDeclinedPlayersInSlots: true,
      allFilledSlotsConfirmedLocally: false,
      isSelectionConfirmedByOrganizer: true,
    })
    expect(result.type).toBe('slots_to_complete')
    expect(result.label).toBe('À compléter')
  })

  it('returns À vérifier when validated, no empty slots, declined in slots', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: false,
      hasDeclinedPlayersInSlots: true,
      allFilledSlotsConfirmedLocally: false,
      isSelectionConfirmedByOrganizer: true,
    })
    expect(result.type).toBe('has_declined')
    expect(result.label).toBe('À vérifier')
  })

  it('returns Confirmations en cours when validated, full, no declined in slots, not all confirmed', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: false,
      hasDeclinedPlayersInSlots: false,
      allFilledSlotsConfirmedLocally: false,
      isSelectionConfirmedByOrganizer: true,
    })
    expect(result.type).toBe('pending_confirmation')
    expect(result.label).toBe('Confirmations en cours')
  })

  it('returns En préparation when has selection but not validated', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: false,
      hasDeclinedPlayersInSlots: false,
      allFilledSlotsConfirmedLocally: false,
      isSelectionConfirmedByOrganizer: false,
    })
    expect(result.type).toBe('draft')
    expect(result.label).toBe('En préparation')
  })

  it('does not return Équipe complète when all confirmed but declined in slots', () => {
    const result = getCompositionStatus({
      hasSelection: true,
      hasEmptySlots: false,
      hasDeclinedPlayersInSlots: true,
      allFilledSlotsConfirmedLocally: true,
      isSelectionConfirmedByOrganizer: true,
    })
    expect(result.type).toBe('has_declined')
    expect(result.label).toBe('À vérifier')
  })
})
