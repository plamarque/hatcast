package com.hatcast.api.season

import com.hatcast.api.season.dto.UpdateSeasonRequest
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.openapitools.jackson.nullable.JsonNullable
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

/**
 * Tests ciblés sur [SeasonService.update] (mocks) — complètent les tests d’intégration HTTP.
 */
class SeasonServiceUpdateTest {
    private val seasonRepository = mock<SeasonRepository>()
    private val troupeRepository = mock<TroupeRepository>()
    private val troupeAccess = mock<TroupeAccessService>()
    private val service = SeasonService(seasonRepository, troupeRepository, troupeAccess)

    private val troupeId = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seasonId = UUID.fromString("22222222-2222-2222-2222-222222222222")

    private val troupe =
        TroupeEntity(
            id = troupeId,
            name = "Troupe",
            slug = "troupe-slug",
        )

    private val principal = TestAuthSupport.testPrincipal()

    @BeforeEach
    fun setup() {
        doNothing().whenever(troupeAccess).requireCanManageTroupe(any(), any())
        whenever(seasonRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(seasonRepository.existsByTroupe_IdAndSlugAndIdNot(any(), any(), any())).thenReturn(false)
    }

    private fun baseSeason(): SeasonEntity =
        SeasonEntity(
            id = seasonId,
            troupe = troupe,
            slug = "old-slug",
            title = "Old Title",
            description = "Description initiale",
            startDate = LocalDate.of(2026, 6, 1),
            endDate = LocalDate.of(2027, 5, 31),
        )

    private fun stubFind(season: SeasonEntity) {
        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
    }

    @Test
    fun `update leaves fields when body empty`() {
        val s = baseSeason()
        stubFind(s)
        val out = service.update(seasonId, UpdateSeasonRequest(), principal)
        assertEquals("Old Title", out.title)
        assertEquals("Description initiale", out.description)
        assertEquals(LocalDate.of(2026, 6, 1), out.startDate)
        assertEquals(LocalDate.of(2027, 5, 31), out.endDate)
    }

    @Test
    fun `update clears description with explicit null`() {
        val s = baseSeason()
        stubFind(s)
        val out =
            service.update(
                seasonId,
                UpdateSeasonRequest(description = JsonNullable.of(null)),
                principal,
            )
        assertNull(out.description)
    }

    @Test
    fun `update trims description string`() {
        val s = baseSeason()
        stubFind(s)
        val out =
            service.update(
                seasonId,
                UpdateSeasonRequest(description = JsonNullable.of("  hello  ")),
                principal,
            )
        assertEquals("hello", out.description)
    }

    @Test
    fun `update clears optional dates`() {
        val s = baseSeason()
        stubFind(s)
        val out =
            service.update(
                seasonId,
                UpdateSeasonRequest(
                    startDate = JsonNullable.of(null),
                    endDate = JsonNullable.of(null),
                ),
                principal,
            )
        assertNull(out.startDate)
        assertNull(out.endDate)
    }

    @Test
    fun `update rejects title null`() {
        stubFind(baseSeason())
        val ex =
            assertThrows<ResponseStatusException> {
                service.update(seasonId, UpdateSeasonRequest(title = JsonNullable.of(null)), principal)
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `update rejects blank title`() {
        stubFind(baseSeason())
        val ex =
            assertThrows<ResponseStatusException> {
                service.update(seasonId, UpdateSeasonRequest(title = JsonNullable.of("   ")), principal)
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `update rejects title too long`() {
        stubFind(baseSeason())
        val ex =
            assertThrows<ResponseStatusException> {
                service.update(
                    seasonId,
                    UpdateSeasonRequest(title = JsonNullable.of("x".repeat(256))),
                    principal,
                )
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `update rejects description too long`() {
        stubFind(baseSeason())
        val ex =
            assertThrows<ResponseStatusException> {
                service.update(
                    seasonId,
                    UpdateSeasonRequest(description = JsonNullable.of("x".repeat(4001))),
                    principal,
                )
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `update rejects end before start after merge`() {
        val s = baseSeason()
        stubFind(s)
        val ex =
            assertThrows<ResponseStatusException> {
                service.update(
                    seasonId,
                    UpdateSeasonRequest(endDate = JsonNullable.of(LocalDate.of(2026, 1, 1))),
                    principal,
                )
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `update changes title and slug when title present`() {
        val s = baseSeason()
        stubFind(s)
        val out =
            service.update(
                seasonId,
                UpdateSeasonRequest(title = JsonNullable.of("Nouvelle saison théâtre")),
                principal,
            )
        assertEquals("Nouvelle saison théâtre", out.title)
        assertEquals("nouvelle-saison-theatre", out.slug)
    }
}
