package com.hatcast.api.notification

import org.springframework.stereotype.Component
import java.util.UUID

interface PushNotificationEligibilityPort {
    fun hasActiveSubscription(userId: UUID): Boolean

    fun isPushEnabled(userId: UUID): Boolean
}

@Component
class PushNotificationEligibilityAdapter(
    private val userRepository: com.hatcast.api.user.UserRepository,
    private val subscriptionRepository: UserPushSubscriptionRepository,
) : PushNotificationEligibilityPort {
    override fun hasActiveSubscription(userId: UUID): Boolean =
        subscriptionRepository.existsByUserId(userId)

    override fun isPushEnabled(userId: UUID): Boolean {
        val user = userRepository.findById(userId).orElse(null) ?: return false
        return user.pushNotificationsEnabled && hasActiveSubscription(userId)
    }
}
