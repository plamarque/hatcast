package com.hatcast.api.participant.dto

import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.ParticipantKind
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class ParticipantCreateRequest(
    @field:NotBlank
    val displayName: String,
    val email: String? = null,
)

data class ParticipantUpdateRequest(
    @field:NotBlank
    val displayName: String,
    val email: String? = null,
)

data class SeasonParticipantAdminDto(
    val id: UUID,
    val displayName: String,
    val email: String?,
    val userId: UUID?,
    val troupeMembershipId: UUID?,
    val kind: ParticipantKind,
    val status: ParticipantStatus,
    val removable: Boolean,
    val avatarUrl: String? = null,
    val gender: String = "non_specified",
) {
    companion object {
        fun from(
            entity: SeasonParticipantEntity,
            includeEmail: Boolean,
            avatarUrl: String? = null,
            gender: String = "non_specified",
        ): SeasonParticipantAdminDto =
            SeasonParticipantAdminDto(
                id = entity.id,
                displayName = entity.displayName,
                email = if (includeEmail) entity.normalizedEmail else null,
                userId = entity.user?.id ?: entity.troupeMembership?.user?.id,
                troupeMembershipId = entity.troupeMembership?.id,
                kind = entity.kind(),
                status = entity.status,
                removable = entity.troupeMembership == null,
                avatarUrl = avatarUrl,
                gender = gender,
            )
    }
}

data class EventParticipantAdminDto(
    val id: UUID,
    val displayName: String,
    val email: String?,
    val userId: UUID?,
    val kind: ParticipantKind,
    val status: ParticipantStatus,
) {
    companion object {
        fun from(
            entity: EventParticipantEntity,
            includeEmail: Boolean,
        ): EventParticipantAdminDto =
            EventParticipantAdminDto(
                id = entity.id,
                displayName = entity.displayName,
                email = if (includeEmail) entity.normalizedEmail else null,
                userId = entity.user?.id,
                kind = entity.kind(),
                status = entity.status,
            )
    }
}

enum class EventRosterSource {
    SEASON,
    EVENT,
}

data class EventRosterParticipantDto(
    val seasonParticipantId: UUID?,
    val eventParticipantId: UUID?,
    val displayName: String,
    val email: String?,
    val userId: UUID?,
    val kind: ParticipantKind,
    val source: EventRosterSource,
    val avatarUrl: String? = null,
    val gender: String = "non_specified",
) {
    companion object {
        fun fromSeason(
            entity: SeasonParticipantEntity,
            includeEmail: Boolean,
            avatarUrl: String? = null,
            gender: String = "non_specified",
        ): EventRosterParticipantDto =
            EventRosterParticipantDto(
                seasonParticipantId = entity.id,
                eventParticipantId = null,
                displayName = entity.displayName,
                email = if (includeEmail) entity.normalizedEmail else null,
                userId = entity.user?.id ?: entity.troupeMembership?.user?.id,
                kind = entity.kind(),
                source = EventRosterSource.SEASON,
                avatarUrl = avatarUrl,
                gender = gender,
            )

        fun fromEvent(
            entity: EventParticipantEntity,
            includeEmail: Boolean,
            avatarUrl: String? = null,
            gender: String = "non_specified",
        ): EventRosterParticipantDto =
            EventRosterParticipantDto(
                seasonParticipantId = entity.seasonParticipant?.id,
                eventParticipantId = entity.id,
                displayName = entity.displayName,
                email = if (includeEmail) entity.normalizedEmail else null,
                userId = entity.user?.id,
                kind = entity.kind(),
                source = EventRosterSource.EVENT,
                avatarUrl = avatarUrl,
                gender = gender,
            )
    }
}

data class ParticipantSelectorDto(
    val id: UUID,
    val displayName: String,
    val avatarUrl: String?,
    val kind: ParticipantKind,
    /** Linked account when roster row is tied to a user (Activité / Dispos « moi »). */
    val userId: UUID? = null,
    val gender: String = "non_specified",
) {
    companion object {
        fun from(
            entity: SeasonParticipantEntity,
            avatarUrl: String?,
            gender: String,
        ): ParticipantSelectorDto =
            ParticipantSelectorDto(
                id = entity.id,
                displayName = entity.displayName,
                avatarUrl = avatarUrl,
                kind = entity.kind(),
                userId = entity.user?.id ?: entity.troupeMembership?.user?.id,
                gender = gender,
            )
    }
}
