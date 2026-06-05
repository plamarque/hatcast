package com.hatcast.api.availability.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
data class SetMyAvailabilityRequest(
    @field:NotBlank
    val status: String,
    val roleKeys: List<String>? = null,
    val applyVolunteerRule: Boolean? = null,
    @field:Size(max = 500, message = "Le commentaire ne peut pas dépasser 500 caractères")
    val comment: String? = null,
)

data class MyAvailabilityResponse(
    val status: String,
    val updatedAt: Instant? = null,
    val roleKeys: List<String> = emptyList(),
    val comment: String? = null,
)

data class SummaryParticipantDto(
    val participantId: java.util.UUID,
    val userId: java.util.UUID? = null,
    val displayName: String,
    val avatarUrl: String? = null,
    val gender: String = "non_specified",
    val status: String,
    val roleKeys: List<String> = emptyList(),
    val comment: String? = null,
)

data class SummaryRoleCandidateDto(
    val participantId: java.util.UUID,
    val displayName: String,
    val avatarUrl: String? = null,
    val chancePercent: Int? = null,
)

data class SummaryRoleDto(
    val roleKey: String,
    val requiredCount: Int,
    val candidates: List<SummaryRoleCandidateDto>,
    /** True when at least one candidate % uses retrospective recalc instead of a draw snapshot. */
    val hasPartialEstimatedChances: Boolean = false,
)

data class EventAvailabilitySummaryResponse(
    val eventId: java.util.UUID,
    val roleSlots: Map<String, Int>,
    val participants: List<SummaryParticipantDto>,
    val roles: List<SummaryRoleDto>,
    /** `live` = operational recalc; `snapshot` = draw-time freeze; `estimated` = retrospective without snapshot. */
    val chanceSource: String? = null,
)
