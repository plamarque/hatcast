import type { CompositionResponse } from './composition-api.service'

/** Mirrors backend [CompositionExplainabilityAccess.canShowExplainability]. */
export function canShowCompositionExplainability(
  canManageComposition: boolean,
  composition: CompositionResponse | null | undefined,
): boolean {
  const slots = composition?.slots ?? []
  const hasAssignedSlots = slots.some((slot) => slot.participantId != null)
  const compositionValidated = composition?.validatedAt != null
  const visibilityContent = hasAssignedSlots || compositionValidated
  const canViewSlots =
    (compositionValidated || canManageComposition) && visibilityContent
  return canViewSlots && (compositionValidated || canManageComposition)
}
