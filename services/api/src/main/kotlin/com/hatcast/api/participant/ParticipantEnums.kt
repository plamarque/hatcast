package com.hatcast.api.participant

enum class ParticipantStatus {
    ACTIVE,
    REMOVED,
}

enum class ParticipantKind {
    MEMBER,
    EXTERNE,
    LINKED,
    MANAGED,
    NAME_ONLY,
}

enum class SeasonParticipantRemovalSource {
    SEASON_ADMIN,
    MEMBERSHIP_INACTIVE,
}
