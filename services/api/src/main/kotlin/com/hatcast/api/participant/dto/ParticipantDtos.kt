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
) {
    companion object {
        fun from(
            entity: SeasonParticipantEntity,
            includeEmail: Boolean,
        ): SeasonParticipantAdminDto =
            SeasonParticipantAdminDto(
                id = entity.id,
                displayName = entity.displayName,
                email = if (includeEmail) entity.normalizedEmail else null,
                userId = entity.user?.id,
                troupeMembershipId = entity.troupeMembership?.id,
                kind = entity.kind(),
                status = entity.status,
                removable = entity.troupeMembership == null,
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

data class ParticipantSelectorDto(
    val id: UUID,
    val displayName: String,
    val avatarUrl: String?,
    val kind: ParticipantKind,
) {
    companion object {
        fun from(
            entity: SeasonParticipantEntity,
            avatarUrl: String?,
        ): ParticipantSelectorDto =
            ParticipantSelectorDto(
                id = entity.id,
                displayName = entity.displayName,
                avatarUrl = avatarUrl,
                kind = entity.kind(),
            )
    }
}
