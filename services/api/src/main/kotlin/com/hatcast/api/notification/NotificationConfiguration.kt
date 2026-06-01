package com.hatcast.api.notification

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(WebPushProperties::class, NotificationEmailProperties::class)
class NotificationConfiguration
