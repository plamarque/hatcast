package com.hatcast.api.auth

import java.util.UUID

data class IdentityPlatformUserDeletionRequestedEvent(
    val userId: UUID,
    val idpUid: String,
)
