package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.Instant

class AdventParisTimeTest {
    @Test fun `actual Paris midnight closes exactly at the next civil day`() {
        assertFalse(AdventParisTime.isClosed(1, Instant.parse("2026-12-01T22:59:59.999999999Z")))
        assertTrue(AdventParisTime.isClosed(1, Instant.parse("2026-12-01T23:00:00Z")))
        assertFalse(AdventParisTime.isClosed(24, Instant.parse("2026-12-24T22:59:59.999999999Z")))
        assertTrue(AdventParisTime.isClosed(24, Instant.parse("2026-12-24T23:00:00Z")))
    }
}
