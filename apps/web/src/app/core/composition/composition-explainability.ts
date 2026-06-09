import type { CompositionResponse } from './composition-api.service'

/** Mirrors backend [DisposExplainabilityAccess.canShowExplainability]. */
export function canShowDisposExplainability(
  event: { availabilityOpenedAt?: string | null; archived: boolean },
  canManageComposition: boolean,
): boolean {
  if (event.archived) {
    return false
  }
  if (event.availabilityOpenedAt != null) {
    return true
  }
  return canManageComposition
}

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
