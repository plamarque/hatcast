package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompositionExplainabilityIntegrationTest {
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
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Explainability Test",
            )
        if (admin) {
            promoteToAdmin(googleSub)
        }
        return cookie
    }

    private fun promoteToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Explainability season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
    ): UUID {
        val future = Instant.parse("2031-04-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Explainability event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun createSeasonParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(SeasonParticipantEntity(season = season, displayName = label))
            .id
    }

    private fun seedDraftComposition(eventId: UUID, participantId: UUID) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = null,
                publishedAt = null,
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
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    @Test
    fun `member can read chance breakdown on published event without composition`() {
        val adminCookie = memberCookie("sub-exp-no-compo-admin", admin = true)
        val memberCookie = memberCookie("sub-exp-no-compo-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)

        assert(compositionRepository.findById(eventId).isEmpty) {
            "precondition: no event_compositions row"
        }

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        seasonParticipantService.ensureMembershipParticipants(
            seasonRepository.findById(seasonId).orElseThrow(),
        )

        val memberUser = userRepository.findByGoogleSub("sub-exp-no-compo-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)
                ?: error("Missing membership")
        val memberParticipantId =
            seasonParticipantRepository
                .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
                ?.id
                ?: error("Missing season participant")

        mockMvc
            .perform(
                get(
                    "/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown" +
                        "?roleKey=player&participantId=$memberParticipantId",
                ).cookie(memberCookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.participantId").value(memberParticipantId.toString()))
            .andExpect(jsonPath("$.chancePercent").exists())
    }

    @Test
    fun `member can read chance breakdown on published event with draft composition`() {
        val adminCookie = memberCookie("sub-exp-admin-1", admin = true)
        val memberCookie = memberCookie("sub-exp-member-1")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val otherParticipantId = createSeasonParticipant(seasonId, "Alice")
        seedDraftComposition(eventId, otherParticipantId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        seasonParticipantService.ensureMembershipParticipants(
            seasonRepository.findById(seasonId).orElseThrow(),
        )

        val memberUser = userRepository.findByGoogleSub("sub-exp-member-1")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)
                ?: error("Missing membership")
        val memberParticipantId =
            seasonParticipantRepository
                .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
                ?.id
                ?: error("Missing season participant")

        mockMvc
            .perform(
                get(
                    "/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown" +
                        "?roleKey=player&participantId=$memberParticipantId",
                ).cookie(memberCookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.participantId").value(memberParticipantId.toString()))
            .andExpect(jsonPath("$.chancePercent").exists())
    }

    @Test
    fun `member cannot read chance breakdown on draft event`() {
        val adminCookie = memberCookie("sub-exp-draft-admin", admin = true)
        val memberCookie = memberCookie("sub-exp-draft-member")
        val seasonId = createSeason(adminCookie)
        val future = Instant.parse("2031-04-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Draft explainability",
                              "startsAt": "$future",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        val participantId = createSeasonParticipant(seasonId, "DraftAlice")

        mockMvc
            .perform(
                get(
                    "/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown" +
                        "?roleKey=player&participantId=$participantId",
                ).cookie(memberCookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `member cannot read pool preview`() {
        val adminCookie = memberCookie("sub-exp-admin-2", admin = true)
        val memberCookie = memberCookie("sub-exp-member-2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createSeasonParticipant(seasonId, "Bob")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/pool-preview?roleKey=player")
                    .cookie(memberCookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `organizer can read pool preview on draft with assigned slot`() {
        val adminCookie = memberCookie("sub-exp-admin-3", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createSeasonParticipant(seasonId, "Carol")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/pool-preview?roleKey=player")
                    .cookie(adminCookie),
            ).andExpect(status().isOk)
    }

    @Test
    fun `organizer without eligible participant receives not found on chance breakdown`() {
        val adminCookie = memberCookie("sub-exp-admin-4", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createSeasonParticipant(seasonId, "Dave")

        mockMvc
            .perform(
                get(
                    "/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown" +
                        "?roleKey=player&participantId=$participantId",
                ).cookie(adminCookie),
            ).andExpect(status().isNotFound)
    }
}
