package com.hatcast.api.event

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.stream.Stream

class SpectacleCategoryTest {
    private fun event(
        templateType: String,
        category: String? = null,
    ): EventEntity {
        val entity = mock<EventEntity>()
        whenever(entity.templateType).thenReturn(templateType)
        whenever(entity.category).thenReturn(category)
        return entity
    }

    @Test
    fun `slug maps principal match and legacy deplacement`() {
        assertEquals(SpectacleCategory.PRINCIPAL, SpectacleCategory.slug(event("match")))
        assertEquals(SpectacleCategory.DEPLACEMENTS, SpectacleCategory.slug(event("deplacement")))
        assertEquals(
            SpectacleCategory.DEPLACEMENTS,
            SpectacleCategory.slug(event("match", category = "deplacements")),
        )
        assertEquals("aperock", SpectacleCategory.slug(event("match", category = "aperock")))
    }

    @ParameterizedTest
    @MethodSource("compartmentMatrix")
    fun `eventInCategory matches slug for same compartment`(
        templateType: String,
        category: String?,
    ) {
        val entity = event(templateType, category)
        val compartment = SpectacleCategory.slug(entity)
        assertTrue(
            SpectacleCategory.eventInCategory(entity, compartment),
            "event $templateType tag=$category must belong to slug compartment $compartment",
        )
    }

    @ParameterizedTest
    @MethodSource("compartmentMatrix")
    fun `eventInCategory rejects principal when slug is not principal`(
        templateType: String,
        category: String?,
    ) {
        val entity = event(templateType, category)
        if (SpectacleCategory.slug(entity) == SpectacleCategory.PRINCIPAL) {
            return
        }
        assertFalse(
            SpectacleCategory.eventInCategory(entity, SpectacleCategory.PRINCIPAL),
            "non-principal event must not count in principal history",
        )
    }

    @Test
    fun `legacy deplacement without tag is in deplacements compartment only`() {
        val legacy = event("deplacement")
        assertTrue(SpectacleCategory.eventInCategory(legacy, SpectacleCategory.DEPLACEMENTS))
        assertFalse(SpectacleCategory.eventInCategory(legacy, SpectacleCategory.PRINCIPAL))
        assertFalse(SpectacleCategory.eventInCategory(legacy, "aperock"))
    }

    @Test
    fun `aperock tag is isolated from principal and deplacements`() {
        val aperock = event("match", category = "aperock")
        assertTrue(SpectacleCategory.eventInCategory(aperock, "aperock"))
        assertFalse(SpectacleCategory.eventInCategory(aperock, SpectacleCategory.PRINCIPAL))
        assertFalse(SpectacleCategory.eventInCategory(aperock, SpectacleCategory.DEPLACEMENTS))
    }

    companion object {
        @JvmStatic
        fun compartmentMatrix(): Stream<Arguments> =
            Stream.of(
                Arguments.of("match", null),
                Arguments.of("deplacement", null),
                Arguments.of("match", "deplacements"),
                Arguments.of("match", "aperock"),
                Arguments.of("cabaret", null),
            )
    }
}
