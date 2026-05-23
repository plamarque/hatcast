package com.hatcast.api.organizer.dto

import com.hatcast.api.organizer.EventOrganizerEntity
import com.hatcast.api.organizer.SeasonOrganizerEntity
import jakarta.validation.constraints.NotBlank
import java.time.Instant
import java.util.UUID

data class OrganizerAssignmentRequest(
    @field:NotBlank
    val email: String,
)

data class OrganizerResponseDto(
    val userId: UUID,
    val email: String,
    val displayName: String?,
    val grantedAt: Instant,
) {
    companion object {
        fun from(e: SeasonOrganizerEntity): OrganizerResponseDto =
            OrganizerResponseDto(
                userId = e.user.id,
                email = e.user.email.orEmpty(),
                displayName = e.user.displayName,
                grantedAt = e.grantedAt,
            )

        fun from(e: EventOrganizerEntity): OrganizerResponseDto =
            OrganizerResponseDto(
                userId = e.user.id,
                email = e.user.email.orEmpty(),
                displayName = e.user.displayName,
                grantedAt = e.grantedAt,
            )
    }
}

data class MySeasonPermissionsDto(
    val canManageSeasonOrganizers: Boolean,
    val canManageEventOrganizers: Boolean,
    val canManageMembers: Boolean,
    val canManageSeasons: Boolean,
    val canManageEvents: Boolean,
    val canManageSeasonParticipants: Boolean,
    val canManageEventParticipants: Boolean,
    val isTroupeAdmin: Boolean,
    val isSeasonOrganizer: Boolean,
    val eventOrganizerFor: List<UUID>,
    val eventParticipantAdminFor: List<UUID>,
)
