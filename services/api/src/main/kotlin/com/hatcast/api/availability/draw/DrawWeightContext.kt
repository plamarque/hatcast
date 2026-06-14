package com.hatcast.api.availability.draw

import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.user.MemberGender
import java.time.Instant
import java.util.UUID

/**
 * Inputs shared by all [DrawWeightFactor] implementations for one candidate in one role draw.
 * Extended in Wave B/C stories (19.6+) with event-scoped fields as factors need them.
 */
data class DrawWeightContext(
    val participantId: UUID,
    val roleKey: String,
    val pastSelectionCount: Int,
    val requiredCount: Int,
    val participantGender: MemberGender = MemberGender.NON_SPECIFIED,
    val categorySlug: String = SpectacleCategory.PRINCIPAL,
    /** All-category history count for breakdown when compartment isolates selections (19.8). */
    val pastSelectionCountUnscoped: Int? = null,
    /** True when participant held the same role on the immediate validated predecessor (19.9). */
    val playedSameRoleOnImmediatePredecessor: Boolean = false,
    /** Predecessor spectacle title for immediate-replay breakdown copy (19.9). */
    val immediatePredecessorTitle: String? = null,
    /** Predecessor spectacle date for immediate-replay breakdown copy (19.9). */
    val immediatePredecessorStartsAt: Instant? = null,
)
