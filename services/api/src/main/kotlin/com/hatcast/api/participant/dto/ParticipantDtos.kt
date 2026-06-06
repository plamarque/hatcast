package com.hatcast.api.participant.dto

import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.ParticipantKind
import com.hatcast.api.participant.ParticipantRowPresentation
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class ParticipantCreateRequest(
    @field:NotBlank
    val displayName: String,
    val email: String? = null,
    val gender: String? = null,
)

data class ParticipantUpdateRequest(
    @field:NotBlank
    val displayName: String,
    val email: String? = null,
    val gender: String? = null,
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
    /** Effective gender (account precedence, then row). */
    val gender: String = "non_specified",
    /** Stored organizer value; null when unset on row. */
    val participantGender: String? = null,
    val genderManagedOnAccount: Boolean = false,
) {
    companion object {
        fun from(
            entity: SeasonParticipantEntity,
            includeEmail: Boolean,
            avatarUrl: String? = null,
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
                gender = ParticipantRowPresentation.effectiveGenderWire(entity),
                participantGender = ParticipantRowPresentation.storedParticipantGenderWire(entity),
                genderManagedOnAccount = ParticipantRowPresentation.genderManagedOnAccount(entity),
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
    val gender: String = "non_specified",
    val participantGender: String? = null,
    val genderManagedOnAccount: Boolean = false,
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
                gender = ParticipantRowPresentation.effectiveGenderWire(entity),
                participantGender = ParticipantRowPresentation.storedParticipantGenderWire(entity),
                genderManagedOnAccount = ParticipantRowPresentation.genderManagedOnAccount(entity),
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
    val participantGender: String? = null,
    val genderManagedOnAccount: Boolean = false,
) {
    companion object {
        fun fromSeason(
            entity: SeasonParticipantEntity,
            includeEmail: Boolean,
            avatarUrl: String? = null,
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
                gender = ParticipantRowPresentation.effectiveGenderWire(entity),
                participantGender = ParticipantRowPresentation.storedParticipantGenderWire(entity),
                genderManagedOnAccount = ParticipantRowPresentation.genderManagedOnAccount(entity),
            )

        fun fromEvent(
            entity: EventParticipantEntity,
            includeEmail: Boolean,
            avatarUrl: String? = null,
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
                gender = ParticipantRowPresentation.effectiveGenderWire(entity),
                participantGender = ParticipantRowPresentation.storedParticipantGenderWire(entity),
                genderManagedOnAccount = ParticipantRowPresentation.genderManagedOnAccount(entity),
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
        ): ParticipantSelectorDto =
            ParticipantSelectorDto(
                id = entity.id,
                displayName = entity.displayName,
                avatarUrl = avatarUrl,
                kind = entity.kind(),
                userId = entity.user?.id ?: entity.troupeMembership?.user?.id,
                gender = ParticipantRowPresentation.effectiveGenderWire(entity),
            )
    }
}
