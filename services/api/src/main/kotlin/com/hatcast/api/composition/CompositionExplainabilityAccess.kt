package com.hatcast.api.composition

/**
 * Explainability gate for the Équipe / composition surface (stories 6.3 / 6.4 / 19.7).
 *
 * Dispos uses [com.hatcast.api.availability.DisposExplainabilityAccess] instead (story 5.9).
 */
object CompositionExplainabilityAccess {
    fun canShowExplainability(
        composition: EventCompositionEntity?,
        slots: List<EventCompositionSlotEntity>,
        canManageComposition: Boolean,
    ): Boolean {
        val hasAssignedSlots = slots.any { it.hasAssignee() }
        val compositionValidated = composition?.validatedAt != null
        val visibilityContent = hasAssignedSlots || compositionValidated
        val canViewSlots =
            CompositionVisibilityRules.canViewSlotAssignments(composition, canManageComposition) &&
                visibilityContent
        return canViewSlots && (compositionValidated || canManageComposition)
    }
}
