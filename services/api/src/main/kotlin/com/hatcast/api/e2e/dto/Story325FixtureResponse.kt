package com.hatcast.api.e2e.dto

import java.util.UUID

/** Stable handles for Playwright recette 3.25 (guest scoped access). */
data class Story325FixtureResponse(
    val troupeSlug: String,
    val memberSeasonSlug: String,
    val laetitiaSeasonSlug: String,
    val laetitiaSeasonId: UUID,
    val laetitiaPublishedEventTitles: List<String>,
    val laetitiaDraftEventTitle: String,
    val rubenSeasonSlug: String,
    val rubenSeasonId: UUID,
    val rubenInvitedFutureSlug: String,
    val rubenInvitedFutureTitle: String,
    val rubenSiblingFutureTitle: String,
    val rubenInvitedPastTitle: String,
    val rubenSiblingPastTitle: String,
    val rubenUnpublishedInvitedTitle: String,
    val piotrixSeasonASlug: String,
    val piotrixSeasonBSlug: String,
    val piotrixInvitedEventSlug: String,
    val piotrixInvitedEventTitle: String,
    val multiAgendaEventTitles: List<String>,
)
