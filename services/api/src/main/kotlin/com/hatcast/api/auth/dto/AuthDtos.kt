package com.hatcast.api.auth.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class GoogleSignInRequest(
    @field:NotBlank @field:JsonProperty("idToken") val idToken: String,
    /** Défaut `true` : parité V1 (case cochée par défaut) et compatibilité clients sans champ. */
    @field:JsonProperty("rememberMe") val rememberMe: Boolean = true,
)

data class AuthSessionResponse(
    val user: UserSummaryDto,
)

data class UserSummaryDto(
    val id: UUID,
    val email: String?,
    val displayName: String?,
)

data class ErrorResponseBody(
    val code: String,
    val message: String,
)
