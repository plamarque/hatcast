package com.hatcast.api.avatar

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(AvatarProperties::class)
class AvatarConfig(
    private val properties: AvatarProperties,
    private val localAvatarStorage: LocalAvatarStorage,
) {
    @Bean
    fun avatarStorage(): AvatarStorage {
        if (properties.storage.equals("gcs", ignoreCase = true)) {
            throw IllegalStateException(
                "GCS avatar storage is not implemented yet; set HATCAST_AVATAR_STORAGE=local.",
            )
        }
        return localAvatarStorage
    }
}
