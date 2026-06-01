package com.hatcast.api.notification

import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import java.security.Security

@Configuration
@EnableConfigurationProperties(
    WebPushProperties::class,
    NotificationEmailProperties::class,
    ManualAvailabilityNudgeProperties::class,
)
class NotificationConfiguration {
    init {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(BouncyCastleProvider())
        }
    }
}
