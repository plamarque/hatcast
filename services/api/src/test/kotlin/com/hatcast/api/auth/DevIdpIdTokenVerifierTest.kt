package com.hatcast.api.auth

import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class DevIdpIdTokenVerifierTest {
    private val users = mock<UserRepository>()
    private val firebase = mock<FirebaseIdpIdTokenVerifier>()
    private val verifier = DevIdpIdTokenVerifier(users, firebase)

    @Test fun `validated seed identity has verified email and invalid credentials are rejected`() {
        val email = "patrice@seed.improbots.test"
        whenever(users.findFirstByEmailIgnoreCase(email)).thenReturn(UserEntity(email = email, slug = "patrice"))
        assertTrue(verifier.verify("dev-seed-idp|$email|patricep").emailVerified)
        assertThrows(IllegalArgumentException::class.java) { verifier.verify("dev-seed-idp|$email|incorrect") }
        assertThrows(IllegalArgumentException::class.java) { verifier.verify("dev-seed-idp|real@example.com|password") }
    }

    @Test fun `real identity keeps provider verification result`() {
        whenever(firebase.verify("provider-token")).thenReturn(IdpTokenPayload(uid = "real", email = "real@example.com", displayName = null, emailVerified = false))
        assertFalse(verifier.verify("provider-token").emailVerified)
    }
}
