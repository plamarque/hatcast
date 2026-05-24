package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.hamcrest.Matchers
import org.junit.jupiter.api.Assertions.assertTrue
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
class CompositionSlotAssignmentIntegrationTest {
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

    @Autowired
    private lateinit var eventParticipantRepository: EventParticipantRepository

    @Autowired
    private lateinit var availabilityRepository: EventAvailabilityRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Assign Test",
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
                        .content("""{"title":"Assign season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        roleSlotsJson: String = """{ "player": 2 }""",
    ): UUID {
        val future = Instant.parse("2031-05-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Assign event",
                              "startsAt": "$future",
                              "roleSlots": $roleSlotsJson
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        status: String,
        roleKeys: List<String> = listOf("player"),
    ) {
        val roleKeysJson =
            if (roleKeys.isEmpty()) {
                "[]"
            } else {
                roleKeys.joinToString(prefix = "[", postfix = "]") { "\"$it\"" }
            }
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"$status","roleKeys":$roleKeysJson}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun assignSlot(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        participantId: UUID?,
    ): JsonNode {
        val body =
            if (participantId == null) {
                """{"participantId":null}"""
            } else {
                """{"participantId":"$participantId"}"""
            }
        val res =
            mockMvc
                .perform(
                    put("/v1/seasons/$seasonId/events/$eventId/composition/slots/$roleKey/$slotIndex")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(csrf()),
                ).andReturn()
        return mapper.readTree(res.response.contentAsString)
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
    fun `PUT assign creates composition row and slot`() {
        val adminCookie = memberCookie("sub-assign-admin-1", admin = true)
        val member = memberCookie("sub-assign-member-1")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member, seasonId, eventId, "available")
        val participantId = participantIdForUser(seasonId, "sub-assign-member-1")

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("organizerDraft"))
            .andExpect(jsonPath("$.slots[0].participantId").value(participantId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))

        assertTrue(compositionRepository.findById(eventId).isPresent)
    }

    @Test
    @Tag("FR21")
    fun `reassign resets participation to pending`() {
        val adminCookie = memberCookie("sub-assign-admin-2", admin = true)
        val member1 = memberCookie("sub-assign-member-2a")
        val member2 = memberCookie("sub-assign-member-2b")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")
        val firstId = participantIdForUser(seasonId, "sub-assign-member-2a")
        val secondId = participantIdForUser(seasonId, "sub-assign-member-2b")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, firstId)
        val slot =
            slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!
        slot.participationStatus = SlotParticipationStatus.CONFIRMED
        slotRepository.save(slot)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$secondId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(secondId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))
    }

    @Test
    @Tag("FR21")
    fun `GET candidates returns ordered list with chance percent`() {
        val adminCookie = memberCookie("sub-assign-admin-3", admin = true)
        val member1 = memberCookie("sub-assign-member-3a")
        val member2 = memberCookie("sub-assign-member-3b")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())

        val res =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                        .param("roleKey", "player")
                        .param("slotIndex", "0")
                        .cookie(adminCookie),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.candidates.length()").value(Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.candidates[0].chancePercent").exists())
                .andReturn()
        val candidates = mapper.readTree(res.response.contentAsString).get("candidates")
        if (candidates.size() >= 2) {
            val first = candidates.get(0).get("chancePercent").asInt()
            val second = candidates.get(1).get("chancePercent").asInt()
            assertTrue(first >= second)
        }
    }

    @Test
    @Tag("FR21")
    fun `multi role manual assign is allowed`() {
        val adminCookie = memberCookie("sub-assign-admin-multi", admin = true)
        val solo = memberCookie("sub-assign-member-multi")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1, "mc": 1 }""")
        setAvailability(solo, seasonId, eventId, "available", roleKeys = listOf("player", "mc"))
        val participantId = participantIdForUser(seasonId, "sub-assign-member-multi")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, participantId)
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/mc/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots.length()").value(2))
    }

    @Test
    @Tag("FR21")
    fun `same role second slot returns 409`() {
        val adminCookie = memberCookie("sub-assign-admin-conflict", admin = true)
        val member = memberCookie("sub-assign-member-conflict")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member, seasonId, eventId, "available")
        val participantId = participantIdForUser(seasonId, "sub-assign-member-conflict")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, participantId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/1")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR21")
    fun `clear slot sets participant null`() {
        val adminCookie = memberCookie("sub-assign-admin-clear", admin = true)
        val member = memberCookie("sub-assign-member-clear")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member, seasonId, eventId, "available")
        val participantId = participantIdForUser(seasonId, "sub-assign-member-clear")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, participantId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots").isEmpty)

        val cleared =
            slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)
        assertTrue(cleared?.assignedParticipantId() == null)
    }

    @Test
    fun `PUT clear on never-assigned slot does not create composition row`() {
        val adminCookie = memberCookie("sub-assign-admin-clear-empty", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        assertTrue(compositionRepository.findById(eventId).isEmpty)
    }

    @Test
    @Tag("NFR-S2")
    fun `member without manage permission gets 403`() {
        val adminCookie = memberCookie("sub-assign-admin-403", admin = true)
        val memberCookie = memberCookie("sub-assign-member-403")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                    .param("roleKey", "player")
                    .cookie(memberCookie),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `validated composition returns 409 for assign and candidates`() {
        val adminCookie = memberCookie("sub-assign-admin-409", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                    .param("roleKey", "player")
                    .cookie(adminCookie),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `publish is idempotent after all slots cleared`() {
        val adminCookie = memberCookie("sub-assign-admin-d2", admin = true)
        val member = memberCookie("sub-assign-member-d2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member, seasonId, eventId, "available")
        val participantId = participantIdForUser(seasonId, "sub-assign-member-d2")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, participantId)
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        assignSlot(adminCookie, seasonId, eventId, "player", 0, null)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.publishedAt").isNotEmpty)
    }

    @Test
    fun `assign resolves season participant display name`() {
        val adminCookie = memberCookie("sub-assign-admin-name", admin = true)
        val member = memberCookie("sub-assign-member-name")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member, seasonId, eventId, "available")
        val participantId = participantIdForUser(seasonId, "sub-assign-member-name")
        val user = userRepository.findByGoogleSub("sub-assign-member-name")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)!!
        membership.displayName = "Season Display Name"
        membershipRepository.save(membership)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantDisplayName").value("Season Display Name"))
    }

    @Test
    @Tag("FR21")
    fun `assign event-only participant persists event participant FK`() {
        val adminCookie = memberCookie("sub-assign-admin-eventonly", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        val event = eventRepository.findById(eventId).orElseThrow()
        val now = Instant.now()
        val guestUser =
            userRepository.save(
                UserEntity(
                    email = "event-only-guest@example.com",
                    displayName = "Event Guest",
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        val eventParticipant =
            eventParticipantRepository.save(
                EventParticipantEntity(
                    event = event,
                    displayName = "Event Guest",
                    user = guestUser,
                    status = ParticipantStatus.ACTIVE,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        availabilityRepository.save(
            EventAvailabilityEntity(
                event = event,
                user = guestUser,
                status = StoredAvailabilityStatus.AVAILABLE,
                roleKeys = listOf("player"),
                now = now,
            ),
        )

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"${eventParticipant.id}"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(eventParticipant.id.toString()))
            .andExpect(jsonPath("$.slots[0].participantDisplayName").value("Event Guest"))

        val slot = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!
        assertTrue(slot.eventParticipantId == eventParticipant.id)
        assertTrue(slot.seasonParticipantId == null)
    }

    @Test
    fun `ineligible participant assign returns 409`() {
        val adminCookie = memberCookie("sub-assign-admin-ineligible", admin = true)
        val member = memberCookie("sub-assign-member-ineligible")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(member, seasonId, eventId, "unavailable", roleKeys = emptyList())
        val participantId = participantIdForUser(seasonId, "sub-assign-member-ineligible")

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }
}
