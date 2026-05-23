package com.hatcast.api.auth

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class PlatformAdminServiceTest {
    private fun service(emails: String) = PlatformAdminService(emails)

    @Test
    fun `matches configured email case-insensitively with trim`() {
        val svc = service(" Admin@Example.com , other@test.com ")
        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub",
                idpUid = null,
                email = "admin@example.com",
            )
        assertTrue(svc.isPlatformAdmin(principal))
    }

    @Test
    fun `returns false when email missing or not in list`() {
        val svc = service("admin@example.com")
        val noEmail =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub",
                idpUid = null,
                email = null,
            )
        assertFalse(svc.isPlatformAdmin(noEmail))
        assertFalse(
            svc.isPlatformAdmin(
                SessionUserPrincipal(
                    userId = UUID.randomUUID(),
                    googleSub = "sub2",
                    idpUid = null,
                    email = "member@example.com",
                ),
            ),
        )
    }

    @Test
    fun `empty config means no platform admin`() {
        val svc = service("")
        assertFalse(
            svc.isPlatformAdmin(
                SessionUserPrincipal(
                    userId = UUID.randomUUID(),
                    googleSub = "sub",
                    idpUid = null,
                    email = "admin@example.com",
                ),
            ),
        )
    }
}
