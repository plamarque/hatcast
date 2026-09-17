package com.hatcast.api.share.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class ShareRecipientChannelStatusDto(
    val eligible: Boolean,
    /** Why this channel cannot be used; never contains an address. */
    val unavailableReason: String? = null,
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
    /** Required by availability_nudge POST so a changed audience is never sent silently. */
    val confirmationFingerprint: String? = null,
)

data class ShareNotifyRequestDto(
    val intent: String,
    @field:NotBlank
    @field:Size(max = 500)
    val messageText: String,
    val confirmationFingerprint: String? = null,
    val recipientParticipantIds: List<UUID>? = null,
)

data class ShareNotifyResponseDto(
    val accepted: Boolean = true,
    val notifiedCount: Int = 0,
    val manualCount: Int = 0,
    val intent: String = "",
    val acceptedCount: Int = 0,
)
