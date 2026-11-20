package com.hatcast.api.composition

object CompositionVisibilityRules {
    /** The Équipe “Publier” action validates directly; legacy sharing sets publishedAt. */
    fun hasPublishedSelection(composition: EventCompositionEntity?): Boolean =
        composition?.publishedAt != null || composition?.validatedAt != null

    fun canViewSlotAssignments(
        composition: EventCompositionEntity?,
        canManageComposition: Boolean,
    ): Boolean {
        if (composition == null) {
            return false
        }
        return composition.validatedAt != null || canManageComposition
    }

    fun resolveVisibility(
        composition: EventCompositionEntity?,
        canManageComposition: Boolean,
        hasAssignedSlots: Boolean,
    ): CompositionVisibility {
        if (composition == null || !hasAssignedSlots) {
            return CompositionVisibility.NONE
        }
        if (composition.validatedAt != null) {
            return CompositionVisibility.VALIDATED
        }
        if (canManageComposition) {
            return CompositionVisibility.ORGANIZER_DRAFT
        }
        return CompositionVisibility.NONE
    }
}

enum class CompositionVisibility {
    NONE,
    ORGANIZER_DRAFT,
    PUBLISHED_DRAFT,
    VALIDATED,
    ;

    fun toApiValue(): String =
        when (this) {
            NONE -> "none"
            ORGANIZER_DRAFT -> "organizerDraft"
            PUBLISHED_DRAFT -> "publishedDraft"
            VALIDATED -> "validated"
        }
}
