import type { CompositionResponse } from './composition-api.service'

export function compositionHasVisibleSlots(composition: CompositionResponse | null | undefined): boolean {
  return (composition?.slots.length ?? 0) > 0
}

/** Organizer-only banner: draft composition not yet validated. */
export function showCompositionDraftBanner(
  composition: CompositionResponse | null | undefined,
  canManageComposition: boolean,
): boolean {
  if (!canManageComposition || !composition) {
    return false
  }
  if (composition.validatedAt != null) {
    return false
  }
  return composition.slots.some((slot) => slot.participantId != null)
}
