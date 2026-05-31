package com.hatcast.api.e2e.dto

import java.util.UUID

data class Story319FixtureResponse(
    val troupeSlug: String,
    val seasonASlug: String,
    val seasonBSlug: String,
    val seasonAId: UUID,
    val targetMemberDisplayName: String,
    val targetMemberEmail: String,
    val targetMemberUserId: UUID,
    val targetSeasonParticipantId: UUID,
    val externalParticipantName: String,
    /** Événement utilisé pour S1 (exclusion locale). */
    val eventSlugForExclusion: String,
    /** Événement avec slot de composition sur le membre cible (S9). */
    val historyEventSlug: String,
)
