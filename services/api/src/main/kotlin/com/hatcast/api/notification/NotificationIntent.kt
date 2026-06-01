package com.hatcast.api.notification

enum class NotificationIntent {
    AVAILABILITY_OPENED,
    CONFIRMATION_REQUEST,
}

enum class NotificationCategory {
    AVAILABILITY_REQUEST,
    CONFIRMATION_REQUEST,
}

fun NotificationIntent.toCategory(): NotificationCategory =
    when (this) {
        NotificationIntent.AVAILABILITY_OPENED -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.CONFIRMATION_REQUEST -> NotificationCategory.CONFIRMATION_REQUEST
    }
