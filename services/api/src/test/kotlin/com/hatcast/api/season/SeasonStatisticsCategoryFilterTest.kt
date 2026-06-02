package com.hatcast.api.season

import com.hatcast.api.event.EventEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class SeasonStatisticsCategoryFilterTest {
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
    fun `parse missing or all returns All filter`() {
        assertEquals(SeasonStatisticsCategoryFilter.Filter.All, SeasonStatisticsCategoryFilter.parse(null))
        assertEquals(SeasonStatisticsCategoryFilter.Filter.All, SeasonStatisticsCategoryFilter.parse(emptyList()))
        assertEquals(SeasonStatisticsCategoryFilter.Filter.All, SeasonStatisticsCategoryFilter.parse(listOf("all")))
    }

    @Test
    fun `parse empty explicit list returns None`() {
        assertEquals(SeasonStatisticsCategoryFilter.Filter.None, SeasonStatisticsCategoryFilter.parse(listOf("")))
        assertEquals(SeasonStatisticsCategoryFilter.Filter.None, SeasonStatisticsCategoryFilter.parse(listOf("  ,  ")))
    }

    @Test
    fun `parse slugs returns Selected`() {
        val filter = SeasonStatisticsCategoryFilter.parse(listOf("principal", "deplacements"))
        assertTrue(filter is SeasonStatisticsCategoryFilter.Filter.Selected)
        assertEquals(setOf("principal", "deplacements"), (filter as SeasonStatisticsCategoryFilter.Filter.Selected).slugs)
    }

    @Test
    fun `compartment slug maps legacy deplacement template`() {
        assertEquals("principal", SeasonStatisticsCategoryFilter.categorySlug(event("match")))
        assertEquals("deplacements", SeasonStatisticsCategoryFilter.categorySlug(event("deplacement")))
        assertEquals("deplacements", SeasonStatisticsCategoryFilter.categorySlug(event("match", category = "deplacements")))
        assertEquals("aperock", SeasonStatisticsCategoryFilter.categorySlug(event("match", category = "aperock")))
    }

    @Test
    fun `matches principal excludes legacy deplacement without tag`() {
        val filter = SeasonStatisticsCategoryFilter.Filter.Selected(setOf("principal"))
        assertTrue(SeasonStatisticsCategoryFilter.matches(event("match"), filter))
        assertFalse(SeasonStatisticsCategoryFilter.matches(event("deplacement"), filter))
    }

    @Test
    fun `matches deplacements includes tagged and legacy template`() {
        val filter = SeasonStatisticsCategoryFilter.Filter.Selected(setOf("deplacements"))
        assertTrue(SeasonStatisticsCategoryFilter.matches(event("deplacement"), filter))
        assertTrue(SeasonStatisticsCategoryFilter.matches(event("match", category = "deplacements"), filter))
        assertFalse(SeasonStatisticsCategoryFilter.matches(event("match"), filter))
    }
}
