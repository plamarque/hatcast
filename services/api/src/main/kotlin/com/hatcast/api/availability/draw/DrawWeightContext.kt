package com.hatcast.api.availability.draw

import com.hatcast.api.user.MemberGender
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
)
