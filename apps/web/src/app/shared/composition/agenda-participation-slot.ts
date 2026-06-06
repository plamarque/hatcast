import type { CompositionResponse, CompositionSlot } from '../../core/composition/composition-api.service'

/** Mirrors server `EventParticipantFocusService.pickPrimarySlot` for a known role. */
export function findViewerParticipationSlot(
  composition: CompositionResponse,
  roleKey: string,
): CompositionSlot | null {
  const viewerIds = new Set(composition.viewerParticipantIds ?? [])
  const matching = composition.slots.filter(
    (slot) =>
      slot.roleKey === roleKey &&
      slot.participantId != null &&
      viewerIds.has(slot.participantId) &&
      slot.participationStatus !== 'declined',
  )
  if (matching.length === 0) {
    return null
  }
  const confirmed = matching.find((slot) => slot.participationStatus === 'confirmed')
  if (confirmed) {
    return confirmed
  }
  return matching.sort((a, b) => a.slotIndex - b.slotIndex)[0] ?? null
}
