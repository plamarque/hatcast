package com.hatcast.api.avatar

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "hatcast.avatar")
data class AvatarProperties(
    /** `local` (filesystem) or `gcs` (future). */
    val storage: String = "local",
    val localBasePath: String = "${System.getProperty("java.io.tmpdir")}/hatcast-avatars",
    val maxBytes: Long = 2_097_152L,
)
