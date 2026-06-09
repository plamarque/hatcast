package com.hatcast.api.notification

enum class NotificationIntent {
    AVAILABILITY_OPENED,
    MANUAL_AVAILABILITY_ANNOUNCE,
    MANUAL_AVAILABILITY_NUDGE,
    /** Automatic availability pending reminder (5-day cadence) — story 8.7. */
    AVAILABILITY_PENDING_REMINDER,
    /** Draft composition shared with organizer circle — story 8.4. */
    COMPOSITION_SHARED,
    CONFIRMATION_REQUEST,
    TEAM_VALIDATED_FYI,
    ASSIGNEE_PRESENCE_REMINDER,
    REMOVED_FROM_COMPOSITION,
    RECONFIRMATION_REQUEST,
    PROXY_AVAILABILITY_RECORDED,
    PROXY_CONFIRMATION_RECORDED,
    /** Significant event detail change (date, location, format) — story 8.8. */
    EVENT_DETAILS_CHANGED,
    /** Event archived — story 8.8. */
    EVENT_ARCHIVED,
    /** Team lifecycle reached complete — story 8.9 (G-012). */
    TEAM_COMPLETE_MEMBER,
    /** Draft event created — story 8.4 (organizer cascade). */
    EVENT_DRAFT_CREATED,
    /** SLA reminder to open availability (~30d horizon) — story 8.4. */
    SLA_OPEN_AVAILABILITY,
    /** Weekly incomplete composition reminder — story 8.4. */
    COMPOSITION_INCOMPLETE_WEEKLY,
    /** J-7 incomplete composition reminder — story 8.4. */
    COMPOSITION_INCOMPLETE_DAILY_J7,
    /** Team lifecycle reached complete — story 8.4b (event organizers). */
    TEAM_COMPLETE,
    /** Validated team no longer complete — story 8.4b (replaces ASSIGNEE_DECLINED). */
    TEAM_REGRESSED,
    /** Organizer scope newly granted — story 8.4b (transactional email + optional push). */
    ORGANIZER_SCOPE_GRANTED,
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
        "Rappels tous les 5 jours si je n'ai pas indiqué mes disponibilités",
        NotificationCategoryGroup.AUTOMATIC_REMINDERS,
    ),
    EVENT_DETAILS_CHANGED(
        "Me prévenir quand la date, le lieu ou le format change sur un spectacle où j'ai déjà interagi (dispo ou participation)",
        NotificationCategoryGroup.NOTIFICATIONS,
    ),
    EVENT_ARCHIVED(
        "Me prévenir quand un spectacle où j'ai déjà interagi (dispo ou participation) est annulé ou archivé",
        NotificationCategoryGroup.NOTIFICATIONS,
    ),
    ORG_TEAM_REGRESSED(
        "Me prévenir quand une équipe confirmée n'est plus complète",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
    ORG_TEAM_COMPLETE(
        "Me prévenir quand toutes les confirmations sont reçues",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
    ORG_COMPOSITION_INCOMPLETE(
        "Me prévenir si des places manquent (rappels hebdo et à J-7)",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
    ORG_SLA_OPEN_AVAILABILITY(
        "Me prévenir quand un spectacle approche (~1 mois) sans dispos ouvertes",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
    ORG_DRAFT_COMPOSITION(
        "Me prévenir quand une composition est partagée avec le cercle orga",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
    ORG_EVENT_DRAFT_CREATED(
        "Me prévenir quand un spectacle en brouillon est créé (dispos pas encore ouvertes)",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
    ORG_SCOPE_GRANTED(
        "Me prévenir par notification push quand on m'ajoute comme orga de spectacle, orga de saison ou admin de troupe",
        NotificationCategoryGroup.ORGANIZER_ALERTS,
    ),
}

enum class NotificationCategoryGroup {
    NOTIFICATIONS,
    AUTOMATIC_REMINDERS,
    ORGANIZER_ALERTS,
}

data class NotificationPreference(
    val push: Boolean = true,
    val email: Boolean = true,
)

/** JSON storage uses string keys so legacy categories (e.g. ORG_ASSIGNEE_DECLINED) do not break deserialization. */
typealias StoredNotificationPreferences = Map<String, NotificationPreference>

fun storedNotificationPreference(
    preferences: StoredNotificationPreferences,
    category: NotificationCategory,
): NotificationPreference = preferences[category.name] ?: category.defaultPreference()

fun legacyNotificationPreferenceKeys(preferences: StoredNotificationPreferences): List<String> =
    preferences.keys.filter { key ->
        runCatching { NotificationCategory.valueOf(key) }.isFailure
    }

fun StoredNotificationPreferences.withoutLegacyKeys(): StoredNotificationPreferences {
    val legacy = legacyNotificationPreferenceKeys(this).toSet()
    if (legacy.isEmpty()) return this
    return filterKeys { it !in legacy }
}

fun NotificationIntent.toCategory(reminderWindow: NotificationReminderWindow? = null): NotificationCategory =
    when (this) {
        NotificationIntent.AVAILABILITY_OPENED -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.MANUAL_AVAILABILITY_NUDGE -> NotificationCategory.AVAILABILITY_REQUEST
        NotificationIntent.AVAILABILITY_PENDING_REMINDER -> NotificationCategory.AVAILABILITY_WEEKLY_REMINDER
        NotificationIntent.COMPOSITION_SHARED -> NotificationCategory.ORG_DRAFT_COMPOSITION
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
        NotificationIntent.EVENT_DETAILS_CHANGED -> NotificationCategory.EVENT_DETAILS_CHANGED
        NotificationIntent.EVENT_ARCHIVED -> NotificationCategory.EVENT_ARCHIVED
        NotificationIntent.TEAM_COMPLETE_MEMBER -> NotificationCategory.TEAM_CONFIRMED
        NotificationIntent.EVENT_DRAFT_CREATED -> NotificationCategory.ORG_EVENT_DRAFT_CREATED
        NotificationIntent.SLA_OPEN_AVAILABILITY -> NotificationCategory.ORG_SLA_OPEN_AVAILABILITY
        NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY -> NotificationCategory.ORG_COMPOSITION_INCOMPLETE
        NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7 -> NotificationCategory.ORG_COMPOSITION_INCOMPLETE
        NotificationIntent.TEAM_COMPLETE -> NotificationCategory.ORG_TEAM_COMPLETE
        NotificationIntent.TEAM_REGRESSED -> NotificationCategory.ORG_TEAM_REGRESSED
        NotificationIntent.ORGANIZER_SCOPE_GRANTED -> NotificationCategory.ORG_SCOPE_GRANTED
    }

fun NotificationCategory.defaultPreference(): NotificationPreference =
    if (group == NotificationCategoryGroup.ORGANIZER_ALERTS) {
        NotificationPreference(push = false, email = false)
    } else {
        NotificationPreference()
    }

/** Legacy member category — intent maps to [ORG_DRAFT_COMPOSITION]; hidden from prefs API/UI. */
val HIDDEN_NOTIFICATION_PREFERENCE_CATEGORIES: Set<NotificationCategory> =
    setOf(NotificationCategory.COMPOSITION_SHARED)
