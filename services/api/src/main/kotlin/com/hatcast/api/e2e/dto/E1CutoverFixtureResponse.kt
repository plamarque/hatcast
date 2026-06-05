package com.hatcast.api.e2e.dto

import java.util.UUID

/** Playwright E1 cutover gate — Les Improbots MVP pilot (profile `e2e` only). */
data class E1CutoverFixtureResponse(
    val troupeSlug: String,
    val seasonSlug: String,
    val seasonId: UUID,
    val memberDisplayName: String,
    val memberEmail: String,
    val memberUserSlug: String,
    val memberUserId: UUID,
    val memberSeasonParticipantId: UUID,
    /** `[MVP] 01 · Tirage pondéré` — composition cleared on reset. */
    val eventDrawSlug: String,
    val eventDrawTitle: String,
    /** `[MVP] 02 · Assignation manuelle` — audit journal target. */
    val eventActiviteSlug: String,
    val eventActiviteTitle: String,
    /** `[MVP] 03 · Validations en attente` — pending confirmations. */
    val eventPendingSlug: String,
    val eventPendingTitle: String,
)
