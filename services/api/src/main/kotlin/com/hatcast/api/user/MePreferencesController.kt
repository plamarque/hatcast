package com.hatcast.api.user

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.user.dto.PatchUserMemberPreferencesRequest
import com.hatcast.api.user.dto.UserMemberPreferencesResponseDto
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/me/preferences")
class MePreferencesController(
    private val userMemberPreferencesService: UserMemberPreferencesService,
) {
    @GetMapping
    fun getMyPreferences(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): UserMemberPreferencesResponseDto = userMemberPreferencesService.getPreferences(principal.userId)

    @PatchMapping
    fun patchMyPreferences(
        @Valid @RequestBody body: PatchUserMemberPreferencesRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): UserMemberPreferencesResponseDto =
        userMemberPreferencesService.patchPreferences(principal.userId, body)
}
