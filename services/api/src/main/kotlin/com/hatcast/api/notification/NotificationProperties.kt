package com.hatcast.api.notification

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "hatcast.web-push")
data class WebPushProperties(
    val vapidPublicKey: String = "",
    val vapidPrivateKey: String = "",
    val subject: String = "mailto:contact@hatcast.app",
)

@ConfigurationProperties(prefix = "hatcast.notification.email")
data class NotificationEmailProperties(
    val enabled: Boolean = false,
    val from: String = "HatCast <noreply@hatcast.app>",
)

@ConfigurationProperties(prefix = "hatcast.notifications")
data class ManualAvailabilityNudgeProperties(
    val manualAvailabilityNudgeGuardDays: Int = 3,
)
