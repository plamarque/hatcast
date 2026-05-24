import type { CompositionResponse } from './composition-api.service'

export function compositionHasVisibleSlots(composition: CompositionResponse | null | undefined): boolean {
  return (composition?.slots.length ?? 0) > 0
}

export function showPublishButton(
  composition: CompositionResponse | null | undefined,
  canManageComposition: boolean,
): boolean {
  if (!canManageComposition || !composition) return false
  return composition.visibility === 'organizerDraft' && composition.slots.length > 0
}
