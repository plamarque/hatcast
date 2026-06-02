package com.hatcast.api.audit

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

class AuditEmailObfuscatorTest {
    @Test
    fun `obfuscates email local and domain parts`() {
        assertEquals("pa***e@g***.com", AuditEmailObfuscator.obfuscate("patrice@gmail.com"))
    }

    @Test
    fun `returns null for blank email`() {
        assertEquals(null, AuditEmailObfuscator.obfuscate(null))
        assertEquals(null, AuditEmailObfuscator.obfuscate(""))
    }
}
