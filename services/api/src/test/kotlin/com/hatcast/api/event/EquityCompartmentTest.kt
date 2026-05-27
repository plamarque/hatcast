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

class EquityCompartmentTest {
    private fun event(
        templateType: String,
        equityTag: String? = null,
    ): EventEntity {
        val entity = mock<EventEntity>()
        whenever(entity.templateType).thenReturn(templateType)
        whenever(entity.equityTag).thenReturn(equityTag)
        return entity
    }

    @Test
    fun `slug maps principal match and legacy deplacement`() {
        assertEquals(EquityCompartment.PRINCIPAL, EquityCompartment.slug(event("match")))
        assertEquals(EquityCompartment.DEPLACEMENTS, EquityCompartment.slug(event("deplacement")))
        assertEquals(
            EquityCompartment.DEPLACEMENTS,
            EquityCompartment.slug(event("match", equityTag = "deplacements")),
        )
        assertEquals("aperock", EquityCompartment.slug(event("match", equityTag = "aperock")))
    }

    @ParameterizedTest
    @MethodSource("compartmentMatrix")
    fun `eventInCompartment matches slug for same compartment`(
        templateType: String,
        equityTag: String?,
    ) {
        val entity = event(templateType, equityTag)
        val compartment = EquityCompartment.slug(entity)
        assertTrue(
            EquityCompartment.eventInCompartment(entity, compartment),
            "event $templateType tag=$equityTag must belong to slug compartment $compartment",
        )
    }

    @ParameterizedTest
    @MethodSource("compartmentMatrix")
    fun `eventInCompartment rejects principal when slug is not principal`(
        templateType: String,
        equityTag: String?,
    ) {
        val entity = event(templateType, equityTag)
        if (EquityCompartment.slug(entity) == EquityCompartment.PRINCIPAL) {
            return
        }
        assertFalse(
            EquityCompartment.eventInCompartment(entity, EquityCompartment.PRINCIPAL),
            "non-principal event must not count in principal history",
        )
    }

    @Test
    fun `legacy deplacement without tag is in deplacements compartment only`() {
        val legacy = event("deplacement")
        assertTrue(EquityCompartment.eventInCompartment(legacy, EquityCompartment.DEPLACEMENTS))
        assertFalse(EquityCompartment.eventInCompartment(legacy, EquityCompartment.PRINCIPAL))
        assertFalse(EquityCompartment.eventInCompartment(legacy, "aperock"))
    }

    @Test
    fun `aperock tag is isolated from principal and deplacements`() {
        val aperock = event("match", equityTag = "aperock")
        assertTrue(EquityCompartment.eventInCompartment(aperock, "aperock"))
        assertFalse(EquityCompartment.eventInCompartment(aperock, EquityCompartment.PRINCIPAL))
        assertFalse(EquityCompartment.eventInCompartment(aperock, EquityCompartment.DEPLACEMENTS))
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
