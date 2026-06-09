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
    /** Absolute web app origin for links in notification emails (no trailing slash). */
    val publicWebOrigin: String = "https://localhost:4200",
)

@ConfigurationProperties(prefix = "hatcast.notifications")
data class ManualAvailabilityNudgeProperties(
    val manualAvailabilityNudgeGuardDays: Int = 3,
)
