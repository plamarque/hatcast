package com.hatcast.api.notification

import org.springframework.stereotype.Component
import org.springframework.beans.factory.ObjectProvider
import java.util.UUID

interface PushNotificationEligibilityPort {
    fun hasActiveSubscription(userId: UUID): Boolean

    fun isPushEnabled(userId: UUID): Boolean

    fun isPushAllowedForCategory(
        userId: UUID,
        category: NotificationCategory,
    ): Boolean = isPushEnabled(userId)
}

@Component
class PushNotificationEligibilityAdapter(
    private val userRepository: com.hatcast.api.user.UserRepository,
    private val subscriptionRepository: UserPushSubscriptionRepository,
    private val preferenceEligibilityPort: ObjectProvider<NotificationPreferenceEligibilityPort>,
) : PushNotificationEligibilityPort {
    override fun hasActiveSubscription(userId: UUID): Boolean =
        subscriptionRepository.existsByUserId(userId)

    override fun isPushEnabled(userId: UUID): Boolean {
        val user = userRepository.findById(userId).orElse(null) ?: return false
        return user.pushNotificationsEnabled && hasActiveSubscription(userId)
    }

    override fun isPushAllowedForCategory(
        userId: UUID,
        category: NotificationCategory,
    ): Boolean {
        if (!isPushEnabled(userId)) {
            return false
        }
        val port = preferenceEligibilityPort.ifAvailable ?: return true
        return port.isAllowed(userId, category, NotificationChannel.PUSH)
    }
}
