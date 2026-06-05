package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
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
class ConsecutiveShowWarningIntegrationTest {
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

    @Autowired
    private lateinit var eventRepository: EventRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Consecutive Warning Test",
            )
        if (admin) {
            val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
            val membership =
                membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                    ?: error("Missing membership")
            membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
            membershipRepository.save(membership)
        }
        return cookie
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Consecutive warning season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        title: String = "Spectacle",
        startsAt: Instant = Instant.parse("2031-06-01T19:00:00Z"),
        roleSlotsJson: String = """{ "player": 1 }""",
        category: String? = null,
    ): UUID {
        val categoryJson = category?.let { """, "category": "$it"""" } ?: ""
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "$title",
                              "startsAt": "$startsAt",
                              "roleSlots": $roleSlotsJson$categoryJson
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun assignSlot(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
    ): JsonNode {
        val res =
            mockMvc
                .perform(
                    put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"participantId":"$participantId"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return mapper.readTree(res.response.contentAsString)
    }

    private fun validateComposition(eventId: UUID) {
        val now = Instant.now()
        val composition = compositionRepository.findById(eventId).orElseThrow()
        composition.validatedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)
    }

    private fun participantIdForUser(
        seasonId: UUID,
        googleSub: String,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        return seasonParticipantRepository
            .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
            ?.id
            ?: error("Missing season participant")
    }

    @Test
    @Tag("FR21")
    fun `warning present when same role on immediate predecessor in same compartment`() {
        val adminCookie = memberCookie("sub-csw-admin-1", admin = true)
        val member = memberCookie("sub-csw-member-1")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-1")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Cabaret du 12",
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Match Malice",
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)

        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventBId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.previousEventId").value(eventAId.toString()))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.previousEventTitle").value("Cabaret du 12"))
    }

    @Test
    @Tag("FR21")
    fun `no warning when predecessor is in different compartment`() {
        val adminCookie = memberCookie("sub-csw-admin-2", admin = true)
        val member = memberCookie("sub-csw-member-2")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-2")

        val aperockEventId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Aperock show",
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
                category = "aperock",
            )
        val principalEventId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Principal show",
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, aperockEventId)
        setAvailability(member, seasonId, principalEventId)

        assignSlot(adminCookie, seasonId, aperockEventId, participantId)
        validateComposition(aperockEventId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$principalEventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `no warning when no validated predecessor in compartment`() {
        val adminCookie = memberCookie("sub-csw-admin-3", admin = true)
        val member = memberCookie("sub-csw-member-3")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-3")
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member, seasonId, eventId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `warning disappears after slot clear`() {
        val adminCookie = memberCookie("sub-csw-admin-4", admin = true)
        val member = memberCookie("sub-csw-member-4")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-4")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)
        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)
        assignSlot(adminCookie, seasonId, eventBId, participantId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventBId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `member GET composition omits consecutive show warning`() {
        val adminCookie = memberCookie("sub-csw-admin-5", admin = true)
        val member = memberCookie("sub-csw-member-5")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-5")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)
        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)
        assignSlot(adminCookie, seasonId, eventBId, participantId)
        validateComposition(eventBId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventBId/composition")
                    .cookie(member),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(participantId.toString()))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `no warning when predecessor slot was declined`() {
        val adminCookie = memberCookie("sub-csw-admin-6", admin = true)
        val member = memberCookie("sub-csw-member-6")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-6")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)
        assignSlot(adminCookie, seasonId, eventAId, participantId)
        val slotA = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventAId, "player", 0)!!
        slotA.participationStatus = SlotParticipationStatus.DECLINED
        slotRepository.save(slotA)
        validateComposition(eventAId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventBId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `POST draw returns warning when same role on same-day predecessor`() {
        val adminCookie = memberCookie("sub-csw-draw-admin", admin = true)
        val member = memberCookie("sub-csw-draw-member")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-draw-member")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Premier spectacle",
                startsAt = Instant.parse("2026-06-05T16:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Deuxième spectacle",
                startsAt = Instant.parse("2026-06-05T20:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)

        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventBId/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath("$.composition.slots[0].consecutiveShowWarning.previousEventId")
                    .value(eventAId.toString()),
            )
            .andExpect(
                jsonPath("$.composition.slots[0].consecutiveShowWarning.previousEventTitle")
                    .value("Premier spectacle"),
            )
    }

    @Test
    @Tag("FR21")
    fun `no warning when validated predecessor is chronologically after current event`() {
        val adminCookie = memberCookie("sub-csw-midnight-admin", admin = true)
        val member = memberCookie("sub-csw-midnight-member")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-midnight-member")

        val laterValidatedId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Spectacle plus tard",
                startsAt = Instant.parse("2026-06-05T22:00:00Z"),
            )
        val earlierCurrentId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Spectacle 22h",
                startsAt = Instant.parse("2026-06-05T20:00:00Z"),
            )
        setAvailability(member, seasonId, laterValidatedId)
        setAvailability(member, seasonId, earlierCurrentId)
        assignSlot(adminCookie, seasonId, laterValidatedId, participantId)
        validateComposition(laterValidatedId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$earlierCurrentId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `same Paris calendar day midnight then 22h warns on evening show`() {
        val adminCookie = memberCookie("sub-csw-paris-day-admin", admin = true)
        val member = memberCookie("sub-csw-paris-day-member")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-paris-day-member")

        val midnightParisJune5 =
            createEvent(
                adminCookie,
                seasonId,
                title = "Matin 5 juin",
                startsAt = Instant.parse("2026-06-04T22:00:00Z"),
            )
        val tenPmParisJune5 =
            createEvent(
                adminCookie,
                seasonId,
                title = "Soir 22h",
                startsAt = Instant.parse("2026-06-05T20:00:00Z"),
            )
        setAvailability(member, seasonId, midnightParisJune5)
        setAvailability(member, seasonId, tenPmParisJune5)
        assignSlot(adminCookie, seasonId, midnightParisJune5, participantId)
        validateComposition(midnightParisJune5)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$tenPmParisJune5/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath("$.composition.slots[0].consecutiveShowWarning.previousEventId")
                    .value(midnightParisJune5.toString()),
            )
    }
}
