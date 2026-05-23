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
    /** Photo Google disponible pour proposition d’import (première connexion, pas d’avatar). */
    val googlePictureUrl: String? = null,
    /** True si l’email de session figure dans `hatcast.auth.super-admin-emails`. */
    val platformAdmin: Boolean = false,
)

data class UserSummaryDto(
    val id: UUID,
    val email: String?,
    val displayName: String?,
    val avatarUrl: String? = null,
    val hasGoogleAccount: Boolean = false,
)

data class ErrorResponseBody(
    val code: String,
    val message: String,
)
