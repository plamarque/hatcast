package com.hatcast.api.e2e.dto

import java.util.UUID

/** Story 3.8d — typeahead carnet + event include (Playwright recette). */
data class Story38dFixtureResponse(
    val troupeSlug: String,
    val seasonSlug: String,
    val seasonId: UUID,
    val eventSlug: String,
    val eventId: UUID,
    val angieDisplayName: String,
    val angieSeasonParticipantId: UUID,
    val rubenDisplayName: String,
    val rubenMembershipId: UUID,
    val laetitiaDisplayName: String,
    val laetitiaEmail: String,
    val laetitiaMembershipId: UUID,
)
