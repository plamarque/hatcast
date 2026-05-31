package com.hatcast.api.troupe

import com.hatcast.api.user.UserEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

class MemberDisplayNameResolverTest {
    @Test
    fun `prefers member display name when set`() {
        val user =
            UserEntity(
                id = UUID.randomUUID(),
                memberDisplayName = "  Léa  ",
                displayName = "Patrice",
                email = "pat@example.com",
            )
        assertEquals("Léa", MemberDisplayNameResolver.resolve(user))
    }

    @Test
    fun `prefers display name when set`() {
        val user =
            UserEntity(
                id = UUID.randomUUID(),
                displayName = "  Patrice  ",
                email = "pat@example.com",
            )
        assertEquals("Patrice", MemberDisplayNameResolver.resolve(user))
    }

    @Test
    fun `falls back to email local part`() {
        val user =
            UserEntity(
                id = UUID.randomUUID(),
                displayName = null,
                email = "lea.dupont@example.com",
            )
        assertEquals("lea.dupont", MemberDisplayNameResolver.resolve(user))
    }

    @Test
    fun `uses deterministic fallback when no name or email`() {
        val id = UUID.fromString("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
        val user = UserEntity(id = id, displayName = null, email = null)
        assertEquals("Membre aaaaaaaa", MemberDisplayNameResolver.resolve(user))
    }
}
