package com.hatcast.api.event

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.hamcrest.Matchers.nullValue
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

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

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
                .andExpect(jsonPath("$.slug").value("match-futur"))
                .andExpect(jsonPath("$.archived").value(false))
                .andReturn()
        val eventFutureId =
            mapper.readTree(createFuture.response.contentAsString).get("id").asText()
        val eventFutureSlug =
            mapper.readTree(createFuture.response.contentAsString).get("slug").asText()

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/by-slug/$eventFutureSlug").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(eventFutureId))
            .andExpect(jsonPath("$.slug").value("match-futur"))

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
                get("/v1/seasons/$seasonId/events?page=0&size=10&scope=past").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].title").value("Vieux spectacle"))

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

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=past").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].title").value("Vieux spectacle"))
    }

    @Test
    fun `scope past excludes archived past events`() {
        val cookie = memberCookie("sub-event-past-archived")
        val seasonId = createSeasonForEventsTests(cookie)
        val past = Instant.parse("2020-01-10T18:00:00Z")

        val createPast =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Passé archivable",
                              "startsAt": "${past}"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val pastEventId = mapper.readTree(createPast.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=past").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(1))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$pastEventId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=past").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(0))
    }

    @Test
    fun `scope past with participantId returns focus availability for that participant`() {
        val cookie = memberCookie("sub-event-past-participant")
        val seasonId = createSeasonForEventsTests(cookie)
        val past = Instant.parse("2020-02-15T18:00:00Z")
        val otherParticipantId = createSeasonParticipantForTests(seasonId, "Autre joueur")

        val createPast =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Spectacle passé filtré",
                              "startsAt": "${past}"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val pastEventId = mapper.readTree(createPast.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$pastEventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=past&participantId=$otherParticipantId")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].myAvailabilityStatus").value("unknown"))
            .andExpect(jsonPath("$.content[0].participantFocus.availabilityStatus").value("unknown"))
            .andExpect(jsonPath("$.content[0].participantFocus.inTeam").value(false))
    }

    @Test
    fun `scope past returns participantFocus inTeam when composition is published`() {
        val cookie = memberCookie("sub-event-past-inteam")
        val seasonId = createSeasonForEventsTests(cookie)
        val past = Instant.parse("2019-08-01T18:00:00Z")
        val participantId = createSeasonParticipantForTests(seasonId, "Joueur passé")

        val createPast =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Passé avec équipe",
                              "startsAt": "${past}",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val pastEventId =
            UUID.fromString(mapper.readTree(createPast.response.contentAsString).get("id").asText())
        seedPublishedCompositionForTests(pastEventId, participantId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=past&participantId=$participantId")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].participantFocus.inTeam").value(true))
            .andExpect(jsonPath("$.content[0].participantFocus.compositionRoleKey").value("player"))
    }

    private fun createSeasonParticipantForTests(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            ).id
    }

    private fun seedPublishedCompositionForTests(eventId: UUID, participantId: UUID) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = null,
                publishedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.CONFIRMED,
            ),
        )
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
        val seedMatchEventId = "c0000002-0000-4000-8000-000000000002"
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events?page=0&size=100&scope=all").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == '$seedMatchEventId')].templateType").value("match"))
            .andExpect(jsonPath("$.content[?(@.id == '$seedMatchEventId')].roleSlots.player").value(5))
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
    fun `create event with explicit slug and collision suffix`() {
        val cookie = memberCookie("sub-event-slug-1")
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
                          "title": "Premier cabaret",
                          "startsAt": "${future}"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("premier-cabaret"))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Premier cabaret bis",
                          "startsAt": "${future}"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("premier-cabaret-2"))
    }

    @Test
    fun `patch slug updates url identifier`() {
        val cookie = memberCookie("sub-event-slug-2")
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
                              "title": "Renommable",
                              "startsAt": "${future}"
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
                    .content("""{ "slug": "nouveau-slug" }""".trimIndent())
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("nouveau-slug"))
            .andExpect(jsonPath("$.title").value("Renommable"))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/by-slug/nouveau-slug").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(eventId))
    }

    @Test
    fun `seed season events have unique slugs after migration`() {
        val cookie = memberCookie("sub-event-slug-3")
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events?page=0&size=100&scope=all").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == 'c0000002-0000-4000-8000-000000000002')].slug").value("match-vs-bruxelles"))
    }

    @Test
    fun `by-slug returns 404 for unknown slug`() {
        val cookie = memberCookie("sub-event-slug-4")
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/by-slug/inconnu-xyz").cookie(cookie),
            ).andExpect(status().isNotFound)
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

    @Test
    fun `equity tag create get patch clear and reject multi`() {
        val cookie = memberCookie("sub-event-equity-1")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-07-01T20:00:00Z")

        val createRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Apérock extérieur",
                              "startsAt": "$future",
                              "equityTag": "Apérock"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.equityTag").value("aperock"))
                .andReturn()
        val eventId = mapper.readTree(createRes.response.contentAsString).get("id").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.equityTag").value("aperock"))

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "equityTag": null }""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.equityTag").value(nullValue()))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Multi tag",
                          "startsAt": "$future",
                          "equityTag": ["deplacements"]
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Virgule tag",
                          "startsAt": "${future.plusSeconds(7200)}",
                          "equityTag": "deplacements,aperock"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)
    }
}
