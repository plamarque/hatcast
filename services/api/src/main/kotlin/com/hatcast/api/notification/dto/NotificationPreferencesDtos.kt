package com.hatcast.api.notification.dto

data class NotificationPreferenceCategoryDto(
    val key: String,
    val label: String,
    val group: String,
    val pushEnabled: Boolean,
    val emailEnabled: Boolean,
)

data class NotificationPreferencesResponseDto(
    val categories: List<NotificationPreferenceCategoryDto>,
)

data class PatchNotificationPreferenceDto(
    val push: Boolean? = null,
    val email: Boolean? = null,
)

data class PatchNotificationPreferencesRequest(
    val preferences: Map<String, PatchNotificationPreferenceDto> = emptyMap(),
)
