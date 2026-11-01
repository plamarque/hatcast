package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.web.server.ResponseStatusException

class AdventPortraitObjectTest {
    @Test fun `simple references resolve under private portrait prefix`() {
        assertEquals("portraits/example_1.png", adventPortraitObject("example_1.png"))
    }

    @Test fun `paths and malformed references are rejected`() {
        for (ref in listOf("../catalogue/avent-2026.json", "portraits/example.png", "", "a".repeat(252) + ".png")) {
            assertThrows(ResponseStatusException::class.java) { adventPortraitObject(ref) }
        }
    }
}
