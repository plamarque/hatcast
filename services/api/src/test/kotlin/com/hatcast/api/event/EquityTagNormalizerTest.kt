package com.hatcast.api.event

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

class EquityTagNormalizerTest {
    @Test
    fun `normalizeSlug accents and spaces`() {
        assertEquals("deplacements", EquityTagNormalizer.normalizeSlug("Déplacements"))
        assertEquals("aperock", EquityTagNormalizer.normalizeSlug("  Apérock  "))
    }

    @Test
    fun `normalizeSlug rejects reserved principal and main slugs`() {
        for (raw in listOf("principal", "Principal", "main", "MAIN")) {
            assertThrows(ResponseStatusException::class.java) {
                EquityTagNormalizer.normalizeSlug(raw)
            }.also { assertEquals(HttpStatus.BAD_REQUEST, it.statusCode) }
        }
    }

    @Test
    fun `normalizeSlug rejects empty and multi-value`() {
        assertThrows(ResponseStatusException::class.java) {
            EquityTagNormalizer.normalizeSlug("   ")
        }.also { assertEquals(HttpStatus.BAD_REQUEST, it.statusCode) }

        val multi =
            assertThrows(ResponseStatusException::class.java) {
                EquityTagNormalizer.normalizeSlug("deplacements,aperock")
            }
        assertEquals(HttpStatus.BAD_REQUEST, multi.statusCode)
        assertEquals("Un seul tag d’équité est autorisé par spectacle.", multi.reason)
    }

    @Test
    fun `labelForAutoCreate keeps display input when distinct from slug`() {
        assertEquals("Déplacements", EquityTagNormalizer.labelForAutoCreate("Déplacements"))
    }

    @Test
    fun `labelForAutoCreate title-cases slug-like input`() {
        assertEquals("Deplacements", EquityTagNormalizer.labelForAutoCreate("deplacements"))
    }
}
