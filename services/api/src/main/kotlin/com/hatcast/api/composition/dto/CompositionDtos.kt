package com.hatcast.api.composition.dto

import java.time.Instant
import java.util.UUID

data class CompositionSlotDto(
    val roleKey: String,
    val slotIndex: Int,
    val participantId: UUID?,
    val participantDisplayName: String?,
    val participationStatus: String,
)

data class CompositionResponseDto(
    val publishedAt: Instant?,
    val validatedAt: Instant?,
    val visibility: String,
    val slots: List<CompositionSlotDto>,
)
