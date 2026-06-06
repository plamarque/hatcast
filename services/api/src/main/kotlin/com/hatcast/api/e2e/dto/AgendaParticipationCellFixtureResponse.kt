package com.hatcast.api.e2e.dto

import java.util.UUID

/** Playwright agenda participation status cell — Les Improbots / Angie (profile `e2e` only). */
data class AgendaParticipationCellFixtureResponse(
    val troupeSlug: String,
    val seasonSlug: String,
    val seasonId: UUID,
    val memberSeasonParticipantId: UUID,
    /** Open dispos, member has no availability row → unknown cell. */
    val eventUnknownDispoSlug: String,
    val eventUnknownDispoTitle: String,
    /** Validated composition, member assigned PENDING. */
    val eventPendingSlug: String,
    val eventPendingTitle: String,
    /** Past event, member had participation focus → read-only cell in Historique. */
    val eventHistorySlug: String,
    val eventHistoryTitle: String,
)
