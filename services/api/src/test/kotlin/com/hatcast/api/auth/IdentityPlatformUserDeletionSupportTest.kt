package com.hatcast.api.auth

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

class IdentityPlatformUserDeletionSupportTest {
    private val support = IdentityPlatformUserDeletionSupport()

    @Test
    fun `deleteUserIfAvailable returns false for blank idpUid`() {
        assertFalse(support.deleteUserIfAvailable(""))
        assertFalse(support.deleteUserIfAvailable("   "))
    }

    @Test
    fun `deleteUserIfAvailable returns false when Firebase Admin is not initialized`() {
        assertFalse(support.deleteUserIfAvailable("firebase-uid-no-admin"))
    }
}
