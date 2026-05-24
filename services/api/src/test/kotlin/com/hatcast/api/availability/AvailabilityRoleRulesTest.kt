package com.hatcast.api.availability

import com.hatcast.api.event.RoleTemplates
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.web.server.ResponseStatusException

class AvailabilityRoleRulesTest {
    @Test
    fun `rolesRequiredForEvent keeps only roles with positive slots in display order`() {
        val roles = AvailabilityRoleRules.rolesRequiredForEvent(RoleTemplates.slotsFor("match"))

        assertEquals(listOf("player", "volunteer", "mc", "referee", "assistant_referee"), roles)
    }

    @Test
    fun `normalizeRoleKeys removes duplicates and keeps requested order`() {
        val normalized =
            AvailabilityRoleRules.normalizeRoleKeys(
                RoleTemplates.slotsFor("cabaret"),
                listOf("player", "mc", "player"),
            )

        assertEquals(listOf("player", "mc"), normalized)
    }

    @Test
    fun `normalizeRoleKeys rejects roles not required on the event`() {
        assertThrows(ResponseStatusException::class.java) {
            AvailabilityRoleRules.normalizeRoleKeys(
                RoleTemplates.slotsFor("cabaret"),
                listOf("referee"),
            )
        }
    }

    @Test
    fun `normalizeRoleKeys auto adds volunteer for play role when rule applies`() {
        val normalized =
            AvailabilityRoleRules.normalizeRoleKeys(
                RoleTemplates.slotsFor("match"),
                listOf("player"),
                applyVolunteerRule = true,
            )

        assertEquals(listOf("player", "volunteer"), normalized)
    }

    @Test
    fun `normalizeRoleKeys honors explicit volunteer omit`() {
        val normalized =
            AvailabilityRoleRules.normalizeRoleKeys(
                RoleTemplates.slotsFor("match"),
                listOf("player"),
                applyVolunteerRule = false,
            )

        assertEquals(listOf("player"), normalized)
    }
}
