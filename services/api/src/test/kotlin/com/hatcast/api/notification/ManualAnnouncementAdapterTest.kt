package com.hatcast.api.notification

import com.hatcast.api.composition.NoOpCompositionNotificationAdapter
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ManualAnnouncementAdapterTest {
    @Test
    fun `no-op adapter accepts no recipients`() {
        val id = UUID.randomUUID()
        val accepted = NoOpCompositionNotificationAdapter().requestManualAnnouncement(
            id, id, "availability_nudge", "Rappel", id, mapOf(id to setOf(NotificationChannel.EMAIL)), null,
        )
        assertTrue(accepted.isEmpty())
    }
}
