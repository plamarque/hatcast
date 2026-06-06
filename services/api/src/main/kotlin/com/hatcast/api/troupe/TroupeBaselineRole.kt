package com.hatcast.api.troupe

enum class TroupeBaselineRole {
    MEMBER,
    TROUPE_ADMIN,
    /** Carnet contact — no member-app access (ADR-0021). */
    EXTERNE,
}
