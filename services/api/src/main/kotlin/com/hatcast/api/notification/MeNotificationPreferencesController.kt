package com.hatcast.api.notification

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.notification.dto.NotificationPreferencesResponseDto
import com.hatcast.api.notification.dto.PatchNotificationPreferencesRequest
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/me/notification-preferences")
class MeNotificationPreferencesController(
    private val preferencesService: UserNotificationPreferencesService,
) {
    @GetMapping
    fun getMyNotificationPreferences(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): NotificationPreferencesResponseDto = preferencesService.getPreferences(principal.userId)

    @PatchMapping
    fun patchMyNotificationPreferences(
        @Valid @RequestBody body: PatchNotificationPreferencesRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): NotificationPreferencesResponseDto = preferencesService.patchPreferences(principal.userId, body)
}
