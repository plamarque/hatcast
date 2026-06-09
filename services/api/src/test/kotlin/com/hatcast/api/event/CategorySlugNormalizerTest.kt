package com.hatcast.api.event

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

class CategorySlugNormalizerTest {
    @Test
    fun `normalizeSlug accents and spaces`() {
        assertEquals("deplacements", CategorySlugNormalizer.normalizeSlug("Déplacements"))
        assertEquals("aperock", CategorySlugNormalizer.normalizeSlug("  Apérock  "))
    }

    @Test
    fun `normalizeSlug rejects reserved principal and main slugs`() {
        for (raw in listOf("principal", "Principal", "main", "MAIN")) {
            assertThrows(ResponseStatusException::class.java) {
                CategorySlugNormalizer.normalizeSlug(raw)
            }.also { assertEquals(HttpStatus.BAD_REQUEST, it.statusCode) }
        }
    }

    @Test
    fun `normalizeSlug rejects empty and multi-value`() {
        assertThrows(ResponseStatusException::class.java) {
            CategorySlugNormalizer.normalizeSlug("   ")
        }.also { assertEquals(HttpStatus.BAD_REQUEST, it.statusCode) }

        val multi =
            assertThrows(ResponseStatusException::class.java) {
                CategorySlugNormalizer.normalizeSlug("deplacements,aperock")
            }
        assertEquals(HttpStatus.BAD_REQUEST, multi.statusCode)
        assertEquals("Une seule catégorie est autorisée par spectacle.", multi.reason)
    }

    @Test
    fun `labelForAutoCreate keeps display input when distinct from slug`() {
        assertEquals("Déplacements", CategorySlugNormalizer.labelForAutoCreate("Déplacements"))
    }

    @Test
    fun `labelForAutoCreate title-cases slug-like input`() {
        assertEquals("Deplacements", CategorySlugNormalizer.labelForAutoCreate("deplacements"))
    }
}
