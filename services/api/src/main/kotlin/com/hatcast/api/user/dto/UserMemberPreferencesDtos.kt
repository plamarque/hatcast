package com.hatcast.api.user.dto

import jakarta.validation.constraints.Size

data class UserMemberPreferencesResponseDto(
    val memberDisplayName: String,
    val preferredRoleKeys: List<String>,
    val gender: String,
)

data class PatchUserMemberPreferencesRequest(
    @field:Size(max = 255)
    val memberDisplayName: String? = null,
    val preferredRoleKeys: List<String>? = null,
    val gender: String? = null,
)
