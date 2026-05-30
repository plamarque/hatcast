package com.hatcast.api.event

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class RoleSlotsJsonConverterTest {
    private val converter = RoleSlotsJsonConverter()

    @Test
    fun `invalid JSON falls back to empty slots`() {
        val slots = converter.convertToEntityAttribute("{not-json")
        assertEquals(0, slots["player"])
        assertEquals(0, slots["mc"])
    }

    @Test
    fun `migrated Tous a l Aperock role_slots load without fallback`() {
        val json =
            """{"player":32,"mc":3,"dj":3,"volunteer":0,"referee":0,"assistant_referee":0,"lighting":0,"coach":0,"stage_manager":0}"""
        val slots = converter.convertToEntityAttribute(json)
        assertEquals(32, slots["player"])
        assertEquals(3, slots["mc"])
        assertEquals(3, slots["dj"])
    }
}
