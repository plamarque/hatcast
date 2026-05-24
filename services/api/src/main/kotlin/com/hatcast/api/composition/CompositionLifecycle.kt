package com.hatcast.api.composition

enum class CompositionLifecycle {
    PREPARING,
    DRAFT_COMPOSITION,
    AWAITING_CONFIRMATIONS,
    GAPS_TO_FILL,
    COMPLETE,
    ;

    fun toApiValue(): String =
        when (this) {
            PREPARING -> "preparing"
            DRAFT_COMPOSITION -> "draftComposition"
            AWAITING_CONFIRMATIONS -> "awaitingConfirmations"
            GAPS_TO_FILL -> "gapsToFill"
            COMPLETE -> "complete"
        }

    companion object {
        fun fromApiValue(value: String): CompositionLifecycle? =
            entries.firstOrNull { it.toApiValue() == value }
    }
}

enum class TeamStatusBadgeKey {
    COLLECTING,
    PREPARING,
    CONFIRMED,
    ;

    fun toApiKey(): String =
        when (this) {
            COLLECTING -> "collecting"
            PREPARING -> "preparing"
            CONFIRMED -> "confirmed"
        }

    fun toTone(): String = toApiKey()
}

data class TeamStatusBadge(
    val key: TeamStatusBadgeKey,
    val label: String,
    val tone: String,
    val shortLabel: String,
) {
    fun toDto(): TeamStatusBadgeDto =
        TeamStatusBadgeDto(
            key = key.toApiKey(),
            label = label,
            tone = tone,
            shortLabel = shortLabel,
        )
}

data class TeamStatusBadgeDto(
    val key: String,
    val label: String,
    val tone: String,
    val shortLabel: String,
)

data class CompositionLifecycleView(
    val compositionLifecycle: CompositionLifecycle,
    val teamStatusBadge: TeamStatusBadge,
)
