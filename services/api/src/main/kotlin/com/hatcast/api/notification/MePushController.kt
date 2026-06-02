package com.hatcast.api.notification

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.notification.dto.MePushStatusResponseDto
import com.hatcast.api.notification.dto.PatchMePushRequest
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/me/push")
class MePushController(
    private val pushSubscriptionService: UserPushSubscriptionService,
) {
    @GetMapping
    fun getMyPushStatus(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
        @RequestParam(required = false) browserPermission: String?,
    ): MePushStatusResponseDto =
        pushSubscriptionService.getStatus(
            principal.userId,
            browserPermission = browserPermission?.trim()?.takeIf { it.isNotEmpty() },
        )

    @PutMapping("/subscription")
    fun registerSubscription(
        @Valid @RequestBody body: RegisterPushSubscriptionRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
        request: HttpServletRequest,
    ): MePushStatusResponseDto =
        pushSubscriptionService.registerSubscription(
            principal.userId,
            body,
            userAgent = request.getHeader("User-Agent"),
        )

    @DeleteMapping("/subscription")
    fun deleteSubscription(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
        @RequestParam(required = false) endpoint: String?,
    ): MePushStatusResponseDto =
        pushSubscriptionService.deleteSubscription(principal.userId, endpoint)

    @PatchMapping
    fun patchPushEnabled(
        @Valid @RequestBody body: PatchMePushRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MePushStatusResponseDto =
        pushSubscriptionService.setGlobalEnabled(principal.userId, body.enabled)
}
