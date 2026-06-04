package com.hatcast.api.share.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class ShareRecipientChannelStatusDto(
    val eligible: Boolean,
    val notified: Boolean,
    val lastNotifiedAt: Instant? = null,
)

data class ShareRecipientChannelsDto(
    val email: ShareRecipientChannelStatusDto,
    val push: ShareRecipientChannelStatusDto,
)

data class ShareRecipientDto(
    val participantId: UUID,
    val displayName: String,
    /** Kept for backward compatibility; not used by the V2 share dialog (D10). */
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
