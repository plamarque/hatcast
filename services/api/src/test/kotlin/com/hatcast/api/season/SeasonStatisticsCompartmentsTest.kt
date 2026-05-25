package com.hatcast.api.season

import com.hatcast.api.event.EventEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class SeasonStatisticsCompartmentsTest {
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
    fun `parse missing or all returns All filter`() {
        assertEquals(SeasonStatisticsCompartments.Filter.All, SeasonStatisticsCompartments.parse(null))
        assertEquals(SeasonStatisticsCompartments.Filter.All, SeasonStatisticsCompartments.parse(emptyList()))
        assertEquals(SeasonStatisticsCompartments.Filter.All, SeasonStatisticsCompartments.parse(listOf("all")))
    }

    @Test
    fun `parse empty explicit list returns None`() {
        assertEquals(SeasonStatisticsCompartments.Filter.None, SeasonStatisticsCompartments.parse(listOf("")))
        assertEquals(SeasonStatisticsCompartments.Filter.None, SeasonStatisticsCompartments.parse(listOf("  ,  ")))
    }

    @Test
    fun `parse slugs returns Selected`() {
        val filter = SeasonStatisticsCompartments.parse(listOf("principal", "deplacements"))
        assertTrue(filter is SeasonStatisticsCompartments.Filter.Selected)
        assertEquals(setOf("principal", "deplacements"), (filter as SeasonStatisticsCompartments.Filter.Selected).slugs)
    }

    @Test
    fun `compartment slug maps legacy deplacement template`() {
        assertEquals("principal", SeasonStatisticsCompartments.compartmentSlug(event("match")))
        assertEquals("deplacements", SeasonStatisticsCompartments.compartmentSlug(event("deplacement")))
        assertEquals("deplacements", SeasonStatisticsCompartments.compartmentSlug(event("match", equityTag = "deplacements")))
        assertEquals("aperock", SeasonStatisticsCompartments.compartmentSlug(event("match", equityTag = "aperock")))
    }

    @Test
    fun `matches principal excludes legacy deplacement without tag`() {
        val filter = SeasonStatisticsCompartments.Filter.Selected(setOf("principal"))
        assertTrue(SeasonStatisticsCompartments.matches(event("match"), filter))
        assertFalse(SeasonStatisticsCompartments.matches(event("deplacement"), filter))
    }

    @Test
    fun `matches deplacements includes tagged and legacy template`() {
        val filter = SeasonStatisticsCompartments.Filter.Selected(setOf("deplacements"))
        assertTrue(SeasonStatisticsCompartments.matches(event("deplacement"), filter))
        assertTrue(SeasonStatisticsCompartments.matches(event("match", equityTag = "deplacements"), filter))
        assertFalse(SeasonStatisticsCompartments.matches(event("match"), filter))
    }
}
