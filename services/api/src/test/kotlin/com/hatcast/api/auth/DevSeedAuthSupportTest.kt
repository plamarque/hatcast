package com.hatcast.api.auth

import com.hatcast.api.user.UserEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class DevSeedAuthSupportTest {
    @Test
    fun `expected password uses users slug column from improbots seed`() {
        val user =
            UserEntity(
                slug = "charlene",
                displayName = "Charlène",
                email = "charlene@seed.improbots.test",
            )
        assertEquals("charlene", DevSeedAuthSupport.expectedPassword(user))
        assertTrue(DevSeedAuthSupport.passwordMatches(user, "charlene"))
    }

    @Test
    fun `expected password pads short slug to 8 chars`() {
        val user =
            UserEntity(
                slug = "angie",
                displayName = "Angie",
                email = "angie@seed.improbots.test",
            )
        assertEquals("angieang", DevSeedAuthSupport.expectedPassword(user))
        assertTrue(DevSeedAuthSupport.passwordMatches(user, "angieang"))
        assertFalse(DevSeedAuthSupport.passwordMatches(user, "angie"))
    }

    @Test
    fun `isSeedEmail matches improbots domain only`() {
        assertTrue(DevSeedAuthSupport.isSeedEmail("pierrick@seed.improbots.test"))
        assertFalse(DevSeedAuthSupport.isSeedEmail("patrice.lamarque@gmail.com"))
    }
}
