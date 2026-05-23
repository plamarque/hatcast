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
}
