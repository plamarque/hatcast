package com.hatcast.api.auth.dto

import jakarta.validation.constraints.NotBlank

data class AccountDeletionRequest(
    @field:NotBlank
    val idToken: String,
)
