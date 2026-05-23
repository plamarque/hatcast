package com.hatcast.api.event

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.web.server.ResponseStatusException

class EventRoleSlotsTest {
    @Test
    fun `slotsFor cabaret matches V1 defaults`() {
        val slots = RoleTemplates.slotsFor("cabaret")
        assertEquals(5, slots["player"])
        assertEquals(1, slots["mc"])
        assertEquals(1, slots["dj"])
        assertEquals(0, slots["referee"])
    }

    @Test
    fun `normalize fills missing keys with zero`() {
        val n = RoleTemplates.normalize(mapOf("player" to 3))
        assertEquals(3, n["player"])
        assertEquals(0, n["mc"])
    }

    @Test
    fun `validate rejects unknown role key`() {
        assertThrows(ResponseStatusException::class.java) {
            RoleTemplates.validate(mapOf("unknown" to 1))
        }
    }

    @Test
    fun `validate rejects count above max`() {
        assertThrows(ResponseStatusException::class.java) {
            RoleTemplates.validate(mapOf("player" to 21))
        }
    }

    @Test
    fun `rolesWithSlots lists only positive counts`() {
        val roles = RoleTemplates.rolesWithSlots(RoleTemplates.slotsFor("deplacement"))
        assertEquals(listOf("player"), roles)
    }
}
