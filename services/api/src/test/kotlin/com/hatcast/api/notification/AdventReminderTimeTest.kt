package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.time.Instant

class AdventReminderTimeTest {
    @Test
    fun `only the actual 2026 Advent day at or after 10 Paris is eligible`() {
        assertNull(adventReminderDay(Instant.parse("2026-12-01T08:59:59Z")))
        assertEquals(1, adventReminderDay(Instant.parse("2026-12-01T09:00:00Z")))
        assertEquals(24, adventReminderDay(Instant.parse("2026-12-24T22:59:59Z")))
        assertNull(adventReminderDay(Instant.parse("2026-12-24T23:00:00Z")))
        assertNull(adventReminderDay(Instant.parse("2027-12-01T09:00:00Z")))
    }
}
