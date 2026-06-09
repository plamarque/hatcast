package com.hatcast.api.organizer

import java.util.UUID

enum class OrganizerScopeKind {
    EVENT,
    SEASON,
    TROUPE_ADMIN,
}

data class OrganizerScopeGrantedEvent(
    val userId: UUID,
    val scopeKind: OrganizerScopeKind,
    val scopeId: UUID,
    val scopeName: String,
)
