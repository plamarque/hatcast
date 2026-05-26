package com.hatcast.api.share

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class EmailObfuscationTest {
    @Test
    fun `obfuscateEmail masks local and domain parts`() {
        val masked = EmailObfuscation.obfuscate("alice.secret@example.com")
        assertFalse(masked!!.contains("secret"))
        assertTrue(masked.contains("••"))
    }

    @Test
    fun `obfuscate returns null for invalid email shape`() {
        org.junit.jupiter.api.Assertions.assertNull(EmailObfuscation.obfuscate("not-an-email"))
        org.junit.jupiter.api.Assertions.assertNull(EmailObfuscation.obfuscate("@nodomain.com"))
    }
}
