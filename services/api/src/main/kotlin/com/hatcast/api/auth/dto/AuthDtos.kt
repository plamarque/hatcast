package com.hatcast.api.auth.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class GoogleSignInRequest(
    @field:NotBlank @field:JsonProperty("idToken") val idToken: String,
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
