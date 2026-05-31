package com.hatcast.api.season

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

/**
 * BUG-004 / story 17-30 — seasons.event_count must match non-archived events after bulk insert reconcile and archive.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeasonEventCountIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var seasonEventCountSync: SeasonEventCountSync

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Event Count Test",
            )
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    @Test
    fun `recountEvents fixes drift after bulk insert without counter update`() {
        val cookie = adminCookie("sub-season-event-count-bulk")
        val troupe =
            seasonRepository.findById(UUID.fromString("b0000001-0000-4000-8000-000000000001"))
                .orElseThrow()
                .troupe
        val season =
            seasonRepository.save(
                SeasonEntity(
                    troupe = troupe,
                    slug = "event-count-bulk-${UUID.randomUUID().toString().take(8)}",
                    title = "Bulk insert drift",
                    eventCount = 0,
                ),
            )
        repeat(3) { i ->
            eventRepository.save(
                EventEntity(
                    season = season,
                    title = "Bulk event $i",
                    slug = "bulk-event-$i-${UUID.randomUUID().toString().take(6)}",
                    startsAt = Instant.parse("2030-0${i + 1}-15T18:00:00Z"),
                    archived = false,
                ),
            )
        }

        assertEquals(0, seasonRepository.findById(season.id).orElseThrow().eventCount)

        seasonEventCountSync.recountEvents(season.id)

        assertEquals(3, seasonRepository.findById(season.id).orElseThrow().eventCount)

        mockMvc
            .perform(get("/v1/seasons/${season.id}").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eventCount").value(3))
    }

    @Test
    fun `archive decrements season eventCount on list and detail`() {
        val cookie = adminCookie("sub-season-event-count-archive")
        val createSeasonRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Archive count season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind
                    .ObjectMapper()
                    .readTree(createSeasonRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        val createEventRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Compteur archivable",
                              "startsAt": "2030-06-15T18:00:00Z"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId =
            UUID.fromString(
                com.fasterxml.jackson.databind
                    .ObjectMapper()
                    .readTree(createEventRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eventCount").value(1))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eventCount").value(0))

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(
                jsonPath("$.content[?(@.id == '$seasonId')].eventCount")
                    .value(org.hamcrest.Matchers.contains(0)),
            )
    }

    @Test
    fun `recount excludes archived events from eventCount`() {
        val troupe =
            seasonRepository.findById(UUID.fromString("b0000001-0000-4000-8000-000000000001"))
                .orElseThrow()
                .troupe
        val season =
            seasonRepository.save(
                SeasonEntity(
                    troupe = troupe,
                    slug = "event-count-archived-${UUID.randomUUID().toString().take(8)}",
                    title = "Archived excluded",
                    eventCount = 99,
                ),
            )
        eventRepository.save(
            EventEntity(
                season = season,
                title = "Active",
                slug = "active-${UUID.randomUUID().toString().take(6)}",
                startsAt = Instant.parse("2030-01-15T18:00:00Z"),
                archived = false,
            ),
        )
        eventRepository.save(
            EventEntity(
                season = season,
                title = "Archived",
                slug = "archived-${UUID.randomUUID().toString().take(6)}",
                startsAt = Instant.parse("2030-02-15T18:00:00Z"),
                archived = true,
            ),
        )

        seasonEventCountSync.recountEvents(season.id)

        assertEquals(1, seasonRepository.findById(season.id).orElseThrow().eventCount)
    }
}
