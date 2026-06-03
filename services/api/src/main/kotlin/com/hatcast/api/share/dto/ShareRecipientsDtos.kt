package com.hatcast.api.share.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class ShareRecipientChannelsDto(
    val email: Boolean,
    val push: Boolean,
)

data class ShareRecipientDto(
    val participantId: UUID,
    val displayName: String,
    val emailObfuscated: String?,
    val channels: ShareRecipientChannelsDto,
)

data class ShareRecipientsResponseDto(
    val total: Int,
    val notifiableCount: Int,
    val manualCount: Int,
    val recipients: List<ShareRecipientDto>,
    val lastManualNotifyAt: Instant? = null,
    val guardDays: Int? = null,
)

data class ShareNotifyRequestDto(
    val intent: String,
    @field:NotBlank
    @field:Size(max = 500)
    val messageText: String,
)

data class ShareNotifyResponseDto(
    val accepted: Boolean = true,
    val notifiedCount: Int = 0,
    val manualCount: Int = 0,
    val intent: String = "",
)
