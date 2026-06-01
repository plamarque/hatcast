package com.hatcast.api.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class PublicConfigResponse(
    val webPushVapidPublicKey: String?,
)

@RestController
@RequestMapping("/v1/config")
class PublicConfigController(
    @Value("\${hatcast.web-push.vapid-public-key:}") private val vapidPublicKey: String,
) {
    @GetMapping("/public")
    fun getPublicConfig(): PublicConfigResponse =
        PublicConfigResponse(
            webPushVapidPublicKey = vapidPublicKey.trim().takeIf { it.isNotEmpty() },
        )
}
