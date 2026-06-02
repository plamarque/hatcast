package com.hatcast.api.notification

import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler

@Configuration
@EnableScheduling
class NotificationSchedulingConfiguration {
    @org.springframework.context.annotation.Bean
    fun notificationTaskScheduler(): ThreadPoolTaskScheduler {
        val scheduler = ThreadPoolTaskScheduler()
        scheduler.poolSize = 1
        scheduler.setThreadNamePrefix("notification-scheduler-")
        scheduler.initialize()
        return scheduler
    }
}
