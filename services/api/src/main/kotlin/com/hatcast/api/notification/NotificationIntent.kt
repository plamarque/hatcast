package com.hatcast.api.notification

enum class NotificationIntent {
    AVAILABILITY_OPENED,
    MANUAL_AVAILABILITY_ANNOUNCE,
    MANUAL_AVAILABILITY_NUDGE,
    /** Draft composition shared with roster — dispatch wired in story 8.4. */
    COMPOSITION_SHARED,
    CONFIRMATION_REQUEST,
    TEAM_VALIDATED_FYI,
    ASSIGNEE_PRESENCE_REMINDER,
    REMOVED_FROM_COMPOSITION,
    RECONFIRMATION_REQUEST,
    PROXY_AVAILABILITY_RECORDED,
    PROXY_CONFIRMATION_RECORDED,
}

enum class NotificationReminderWindow {
    DAYS_7,
    DAYS_1,
    /** One-shot dedupe mark (e.g. REMOVED_FROM_COMPOSITION) — not a scheduled reminder window. */
    ONCE,
}

enum class NotificationCategory(
    val label: String,
    val group: NotificationCategoryGroup,
) {
    AVAILABILITY_REQUEST(
        "M'envoyer une notification lorsqu'un spectacle a besoin de personnes",
        NotificationCategoryGroup.NOTIFICATIONS,
    ),
    COMPOSITION_SHARED(
        "M'envoyer une notification lorsque je suis concerné par une composition (brouillon partagé)",
        NotificationCategoryGroup.NOTIFICATIONS,
    ),
    CONFIRMATION_REQUEST(
        "M'envoyer une notification pour confirmer ma participation",
        NotificationCategoryGroup.NOTIFICATIONS,
    ),
    TEAM_CONFIRMED(
        "M'envoyer une notification lorsque l'équipe est confirmée",
        NotificationCategoryGroup.NOTIFICATIONS,
    ),
    REMINDER_7_DAYS(
        "Rappel automatique 7 jours avant un spectacle",
        NotificationCategoryGroup.AUTOMATIC_REMINDERS,
    ),
    REMINDER_1_DAY(
        "Rappel automatique 1 jour avant un spectacle",
        NotificationCategoryGroup.AUTOMATIC_REMINDERS,
    ),
    AVAILABILITY_WEEKLY_REMINDER(
        "Rappels hebdomadaires si je n'ai pas indiqué mes disponibilités",
        NotificationCategoryGroup.AUTOMATIC_REMINDERS,
    ),
}

enum class NotificationCategoryGroup {
    NOTIFICATIONS,
    AUTOMATIC_REMINDERS,
}

data class NotificationPreference(
    val push: Boolean = true,
    val email: Boolean = true,
)

fun NotificationIntent.toCategory(reminderWindow: NotificationReminderWindow? = null): NotificationCategory =
    when (this) {
        NotificationIntent.AVAILABILITY_OPENED -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.MANUAL_AVAILABILITY_NUDGE -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.COMPOSITION_SHARED -> NotificationCategory.COMPOSITION_SHARED
        NotificationIntent.CONFIRMATION_REQUEST -> NotificationCategory.CONFIRMATION_REQUEST
        NotificationIntent.TEAM_VALIDATED_FYI -> NotificationCategory.TEAM_CONFIRMED
        NotificationIntent.ASSIGNEE_PRESENCE_REMINDER ->
            when (reminderWindow) {
                NotificationReminderWindow.DAYS_7 -> NotificationCategory.REMINDER_7_DAYS
                NotificationReminderWindow.DAYS_1 -> NotificationCategory.REMINDER_1_DAY
                NotificationReminderWindow.ONCE, null -> NotificationCategory.REMINDER_7_DAYS
            }
        NotificationIntent.REMOVED_FROM_COMPOSITION -> NotificationCategory.CONFIRMATION_REQUEST
        NotificationIntent.RECONFIRMATION_REQUEST -> NotificationCategory.CONFIRMATION_REQUEST
        NotificationIntent.PROXY_AVAILABILITY_RECORDED -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.PROXY_CONFIRMATION_RECORDED -> NotificationCategory.CONFIRMATION_REQUEST
    }
