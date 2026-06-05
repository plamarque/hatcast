package com.hatcast.api.composition.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.time.Instant
import java.util.UUID

data class ConsecutiveShowWarningDto(
    val previousEventId: UUID,
    val previousEventTitle: String,
    val previousEventStartsAt: Instant,
)

data class MultiRoleOnEventWarningDto(
    val otherRoleKeys: List<String>,
)

data class CompositionSlotDto(
    val roleKey: String,
    val slotIndex: Int,
    val participantId: UUID?,
    val participantDisplayName: String?,
    val participationStatus: String,
    val chancePercent: Int? = null,
    val pastSelectionCount: Int? = null,
    val consecutiveShowWarning: ConsecutiveShowWarningDto? = null,
    val multiRoleOnEventWarning: MultiRoleOnEventWarningDto? = null,
)

data class CompositionDeclineDto(
    val id: UUID,
    val participantId: UUID,
    val participantDisplayName: String,
    val roleKey: String,
    val slotIndex: Int,
    val declinedAt: Instant,
    val note: String? = null,
)

data class CompositionResponseDto(
    val publishedAt: Instant?,
    val validatedAt: Instant?,
    val visibility: String,
    val slots: List<CompositionSlotDto>,
    val declines: List<CompositionDeclineDto> = emptyList(),
    val viewerParticipantIds: List<UUID> = emptyList(),
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateSlotParticipationRequestDto(
    val status: String,
    val note: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DrawCompositionRequestDto(
    val mode: String? = null,
)

data class CompositionDrawStepCandidateDto(
    val participantId: UUID,
    val displayName: String,
    val chancePercent: Int,
    val weight: Double,
)

data class CompositionDrawStepDto(
    val roleKey: String,
    val slotIndex: Int,
    val candidates: List<CompositionDrawStepCandidateDto>,
    val selectedParticipantId: UUID?,
    val randomValue: Double?,
    val totalWeight: Double,
)

data class CompositionDrawResponseDto(
    val composition: CompositionResponseDto,
    val steps: List<CompositionDrawStepDto>,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AssignSlotRequestDto(
    val participantId: UUID? = null,
)

data class CompositionCandidateDto(
    val participantId: UUID,
    val displayName: String,
    val chancePercent: Int,
    val pastSelectionCount: Int,
    val alreadyAssignedRoleKeys: List<String>? = null,
)

data class CompositionCandidateListResponseDto(
    val roleKey: String,
    val requiredCount: Int,
    val candidates: List<CompositionCandidateDto>,
)
