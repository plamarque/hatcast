package com.hatcast.api.notification

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "hatcast.notification.email.cloudflare")
data class CloudflareEmailSendingProperties(
    val accountId: String = "",
    val apiToken: String = "",
) {
    fun isConfigured(): Boolean = accountId.isNotBlank() && apiToken.isNotBlank()
}
