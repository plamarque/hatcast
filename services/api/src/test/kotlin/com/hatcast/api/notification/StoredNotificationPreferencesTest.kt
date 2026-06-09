package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class StoredNotificationPreferencesTest {
    @Test
    fun `legacy keys are detected and stripped`() {
        val raw =
            mapOf(
                NotificationCategory.AVAILABILITY_REQUEST.name to NotificationPreference(),
                "ORG_ASSIGNEE_DECLINED" to NotificationPreference(push = true, email = false),
            )

        assertEquals(listOf("ORG_ASSIGNEE_DECLINED"), legacyNotificationPreferenceKeys(raw))
        assertEquals(1, raw.withoutLegacyKeys().size)
        assertFalse(raw.withoutLegacyKeys().containsKey("ORG_ASSIGNEE_DECLINED"))
    }

    @Test
    fun `stored preference resolves by category name`() {
        val raw = mapOf("REMINDER_1_DAY" to NotificationPreference(push = false, email = true))
        val pref = storedNotificationPreference(raw, NotificationCategory.REMINDER_1_DAY)
        assertFalse(pref.push)
        assertTrue(pref.email)
    }
}
