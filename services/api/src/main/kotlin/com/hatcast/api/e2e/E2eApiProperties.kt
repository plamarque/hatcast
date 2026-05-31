package com.hatcast.api.e2e

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "hatcast.e2e")
data class E2eApiProperties(
    val apiEnabled: Boolean = false,
    val apiKey: String = "",
)
