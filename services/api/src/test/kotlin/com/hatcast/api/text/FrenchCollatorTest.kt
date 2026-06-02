package com.hatcast.api.text

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class FrenchCollatorTest {
    @Test
    fun `Véro sorts before Viviane like V1 sensitivity base`() {
        assertTrue(FrenchCollator.compare("Véro", "Viviane") < 0)
    }
}
