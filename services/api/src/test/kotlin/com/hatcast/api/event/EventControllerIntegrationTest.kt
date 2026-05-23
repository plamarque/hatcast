package com.hatcast.api.event

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventControllerIntegrationTest {
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

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val seedSeasonSlug = "la-malice-2026-2027"

    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = "$googleSub@example.com",
            name = "Event Test",
        )
        promoteSeedMemberToAdmin(googleSub)
        return cookie
    }

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id) ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun createSeasonForEventsTests(cookie: jakarta.servlet.http.Cookie): UUID {
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Saison events tests"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val id = mapper.readTree(createRes.response.contentAsString).get("id").asText()
        return UUID.fromString(id)
    }

    @Test
    fun `season by slug and events crud list scopes`() {
        val cookie = memberCookie("sub-event-1")

        mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/seasons/by-slug/$seedSeasonSlug").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(seedSeasonId.toString()))
            .andExpect(jsonPath("$.slug").value(seedSeasonSlug))

        val seasonId = createSeasonForEventsTests(cookie)

        val future = Instant.parse("2030-06-15T18:00:00Z")
        val past = Instant.parse("2020-01-10T18:00:00Z")

        val createFuture =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Match futur",
                              "startsAt": "${future}",
                              "description": "Détail",
                              "location": "Salle A"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.title").value("Match futur"))
                .andExpect(jsonPath("$.archived").value(false))
                .andReturn()
        val eventFutureId =
            mapper.readTree(createFuture.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Vieux spectacle",
                          "startsAt": "${past}"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?page=0&size=10&scope=all").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(2))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?page=0&size=10&scope=upcoming").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].title").value("Match futur"))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventFutureId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.archived").value(true))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=upcoming").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(0))
    }

    @Test
    fun `patch clears optional fields with explicit null`() {
        val cookie = memberCookie("sub-event-3")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-06-15T18:00:00Z")

        val createRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Avec détails",
                              "startsAt": "${future}",
                              "description": "Texte",
                              "location": "Salle B"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = mapper.readTree(createRes.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "description": null,
                          "location": null
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.description").doesNotExist())
            .andExpect(jsonPath("$.location").doesNotExist())
    }

    @Test
    fun `create event with cabaret type and role slots`() {
        val cookie = memberCookie("sub-event-4")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-06-15T18:00:00Z")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Soirée cab",
                          "startsAt": "${future}",
                          "templateType": "cabaret",
                          "roleSlots": {
                            "player": 5,
                            "mc": 1,
                            "dj": 1
                          }
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.templateType").value("cabaret"))
            .andExpect(jsonPath("$.roleSlots.player").value(5))
            .andExpect(jsonPath("$.roleSlots.mc").value(1))
            .andExpect(jsonPath("$.roleSlots.dj").value(1))
            .andExpect(jsonPath("$.roleSlots.referee").value(0))
    }

    @Test
    fun `create event rejects invalid template type`() {
        val cookie = memberCookie("sub-event-5")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-06-15T18:00:00Z")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Bad type",
                          "startsAt": "${future}",
                          "templateType": "invalid"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `create event rejects invalid role count`() {
        val cookie = memberCookie("sub-event-6")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-06-15T18:00:00Z")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Bad count",
                          "startsAt": "${future}",
                          "roleSlots": { "player": 99 }
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `seed season events expose templateType after migration`() {
        val cookie = memberCookie("sub-event-7")
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events?page=0&size=1&scope=all").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].templateType").value("custom"))
            .andExpect(jsonPath("$.content[0].roleSlots.player").value(0))
    }

    @Test
    fun `patch updates templateType and roleSlots`() {
        val cookie = memberCookie("sub-event-8")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-06-15T18:00:00Z")

        val createRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Avant patch",
                              "startsAt": "${future}",
                              "templateType": "cabaret",
                              "roleSlots": { "player": 5, "mc": 1, "dj": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = mapper.readTree(createRes.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "templateType": "deplacement",
                          "roleSlots": { "player": 5, "mc": 0, "dj": 0, "volunteer": 0, "referee": 0, "assistant_referee": 0, "lighting": 0, "coach": 0, "stage_manager": 0 }
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.templateType").value("deplacement"))
            .andExpect(jsonPath("$.roleSlots.player").value(5))
            .andExpect(jsonPath("$.roleSlots.mc").value(0))
            .andExpect(jsonPath("$.title").value("Avant patch"))
    }

    @Test
    fun `invalid scope returns 400`() {
        val cookie = memberCookie("sub-event-2")
        val seasonId = createSeasonForEventsTests(cookie)
        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=wrong").cookie(cookie),
            ).andExpect(status().isBadRequest)
    }
}
