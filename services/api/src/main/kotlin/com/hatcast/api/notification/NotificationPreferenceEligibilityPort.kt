package com.hatcast.api.notification

import java.util.UUID

/**
 * Optional port for Story 8.2 category preferences. When absent, dispatcher defaults to allow.
 */
interface NotificationPreferenceEligibilityPort {
    fun isAllowed(
        userId: UUID,
        category: NotificationCategory,
        channel: NotificationChannel,
    ): Boolean
}
