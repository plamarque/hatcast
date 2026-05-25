package com.hatcast.api.event

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

class EventSlugGeneratorTest {
    private val seasonId = UUID.randomUUID()

    @Test
    fun `slugify normalizes accents and punctuation`() {
        assertEquals("cabaret-de-rentree", EventSlugGenerator.slugify("Cabaret de rentrée"))
        assertEquals("match-vs-bruxelles", EventSlugGenerator.slugify("Match vs Bruxelles"))
    }

    @Test
    fun `allocateUniqueSlug returns base when free`() {
        val repo = mock<EventRepository>()
        whenever(repo.existsBySeason_IdAndSlug(seasonId, "match-futur")).thenReturn(false)
        assertEquals(
            "match-futur",
            EventSlugGenerator.allocateUniqueSlug(seasonId, "match-futur", repo),
        )
    }

    @Test
    fun `allocateUniqueSlug appends numeric suffix on collision`() {
        val repo = mock<EventRepository>()
        whenever(repo.existsBySeason_IdAndSlug(seasonId, "cabaret")).thenReturn(true)
        whenever(repo.existsBySeason_IdAndSlug(seasonId, "cabaret-2")).thenReturn(false)
        assertEquals(
            "cabaret-2",
            EventSlugGenerator.allocateUniqueSlug(seasonId, "cabaret", repo),
        )
    }

    @Test
    fun `allocateUniqueSlug rejects empty base`() {
        val repo = mock<EventRepository>()
        assertThrows(ResponseStatusException::class.java) {
            EventSlugGenerator.allocateUniqueSlug(seasonId, "", repo)
        }
    }

    @Test
    fun `requireValidExplicitSlug rejects uuid-shaped slug`() {
        assertThrows(ResponseStatusException::class.java) {
            EventSlugGenerator.requireValidExplicitSlug("c0000002-0000-4000-8000-000000000002")
        }
    }
}
