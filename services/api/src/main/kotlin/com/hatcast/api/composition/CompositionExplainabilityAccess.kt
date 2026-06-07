package com.hatcast.api.composition

/**
 * Shared explainability gate (stories 6.3 / 6.4 / 19.7) for composition and availability surfaces.
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
