package com.hatcast.api.notification.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class PushSubscriptionKeysDto(
    @field:NotBlank
    @field:Size(max = 512)
    val p256dh: String,
    @field:NotBlank
    @field:Size(max = 512)
    val auth: String,
)

data class RegisterPushSubscriptionRequest(
    @field:NotBlank
    @field:Size(max = 2048)
    val endpoint: String,
    @field:Valid
    val keys: PushSubscriptionKeysDto,
)

data class PushSubscriptionSummaryDto(
    val id: String,
    val endpointPreview: String,
    val createdAt: String,
)

data class MePushStatusResponseDto(
    val enabled: Boolean,
    val browserPermission: String? = null,
    val subscriptionCount: Int,
    val subscriptions: List<PushSubscriptionSummaryDto>? = null,
)

data class PatchMePushRequest(
    val enabled: Boolean = false,
)
