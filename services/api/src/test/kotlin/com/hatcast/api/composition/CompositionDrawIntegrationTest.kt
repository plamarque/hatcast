package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
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
class CompositionDrawIntegrationTest {
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
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Draw Test",
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
                        .content("""{"title":"Draw season"}""")
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
                              "title": "Draw event",
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
                    .content(
                        """{"status":"$status","roleKeys":$roleKeysJson}""",
                    ).with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun draw(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
    ): JsonNode {
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"mode":"full"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return mapper.readTree(res.response.contentAsString)
    }

    private fun createSeasonParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            ).id
    }

    private fun participantIdsFromComposition(body: JsonNode): Set<String> =
        participantIdsFromSlots(
            body.get("composition")?.get("slots") ?: body.get("slots"),
        )

    private fun participantIdsFromSlots(slots: JsonNode): Set<String> =
        (0 until slots.size())
            .map { slots.get(it) }
            .mapNotNull { slot ->
                slot.get("participantId")?.takeIf { !it.isNull }?.asText()
            }.toSet()

    @Test
    @Tag("FR20")
    fun `POST draw fills slots and returns animation steps`() {
        val adminCookie = memberCookie("sub-draw-admin-1", admin = true)
        val member1 = memberCookie("sub-draw-member-1a")
        val member2 = memberCookie("sub-draw-member-1b")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")

        draw(adminCookie, seasonId, eventId)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.slots.length()").value(2))
            .andExpect(jsonPath("$.slots[0].participantDisplayName").exists())
            .andExpect(jsonPath("$.slots[0].chancePercent").exists())
    }

    @Test
    @Tag("FR20")
    fun `full redraw clears slots when candidate pool cannot refill`() {
        val adminCookie = memberCookie("sub-draw-admin-redraw", admin = true)
        val member1 = memberCookie("sub-draw-member-redraw-a")
        val member2 = memberCookie("sub-draw-member-redraw-b")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")

        val first = draw(adminCookie, seasonId, eventId)
        val firstIds = participantIdsFromComposition(first)
        require(firstIds.size == 2) { "expected two assignees before redraw" }

        setAvailability(member2, seasonId, eventId, "unavailable", roleKeys = emptyList())

        val second = draw(adminCookie, seasonId, eventId)
        val secondIds = participantIdsFromComposition(second)
        val removedId = firstIds.first { it !in secondIds }
        assertEquals(1, secondIds.size)

        val compRes =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(adminCookie))
                .andExpect(status().isOk)
                .andReturn()
        val assignedIds =
            participantIdsFromSlots(
                mapper.readTree(compRes.response.contentAsString).get("slots"),
            )
        assertEquals(1, assignedIds.size)
        assertFalse(removedId in assignedIds)
    }

    @Test
    @Tag("FR20")
    fun `partial role keeps existing assignee and fills empty slot`() {
        val adminCookie = memberCookie("sub-draw-admin-partial", admin = true)
        val member1 = memberCookie("sub-draw-member-partial-a")
        val member2 = memberCookie("sub-draw-member-partial-b")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val keeperId = createSeasonParticipant(seasonId, "Keeper")
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")

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
                participantId = keeperId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )

        val body = draw(adminCookie, seasonId, eventId)
        val slots = body.get("composition").get("slots")
        val keeperSlot =
            (0 until slots.size())
                .map { slots.get(it) }
                .first { it.get("slotIndex").asInt() == 0 }
        val filledSlot =
            (0 until slots.size())
                .map { slots.get(it) }
                .first { it.get("slotIndex").asInt() == 1 }

        assert(keeperSlot.get("participantId").asText() == keeperId.toString())
        assert(filledSlot.get("participantId").asText() != keeperId.toString())
    }

    @Test
    @Tag("FR20")
    fun `cross role draw excludes participant already assigned in same request`() {
        val adminCookie = memberCookie("sub-draw-admin-cross", admin = true)
        val solo = memberCookie("sub-draw-member-cross")
        val seasonId = createSeason(adminCookie)
        val eventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1, "mc": 1 }""",
            )
        setAvailability(solo, seasonId, eventId, "available", roleKeys = listOf("player", "mc"))

        val body = draw(adminCookie, seasonId, eventId)
        val ids = participantIdsFromComposition(body)

        assert(ids.size == 1)
    }

    @Test
    @Tag("FR19")
    fun `availability summary reflects non zero past selection history`() {
        val adminCookie = memberCookie("sub-draw-admin-history", admin = true)
        val veteran = memberCookie("sub-draw-member-history-vet")
        val rookie = memberCookie("sub-draw-member-history-rook")
        val seasonId = createSeason(adminCookie)
        val pastEventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        val newEventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        setAvailability(veteran, seasonId, pastEventId, "available")
        setAvailability(rookie, seasonId, pastEventId, "available")
        setAvailability(veteran, seasonId, newEventId, "available")
        setAvailability(rookie, seasonId, newEventId, "available")

        val pastDraw = draw(adminCookie, seasonId, pastEventId)
        val veteranId = participantIdsFromComposition(pastDraw).single()
        val now = Instant.now()
        val pastComposition =
            compositionRepository.findById(pastEventId).orElseThrow()
        pastComposition.validatedAt = now
        pastComposition.updatedAt = now
        compositionRepository.save(pastComposition)

        val summaryRes =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/events/$newEventId/availability/summary")
                        .cookie(adminCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val playerCandidates =
            mapper
                .readTree(summaryRes.response.contentAsString)
                .get("roles")
                .first { it.get("roleKey").asText() == "player" }
                .get("candidates")
        val veteranChance =
            (0 until playerCandidates.size())
                .map { playerCandidates.get(it) }
                .first { it.get("participantId").asText() == veteranId }
                .get("chancePercent")
                .asInt()
        val rookieChance =
            (0 until playerCandidates.size())
                .map { playerCandidates.get(it) }
                .first { it.get("participantId").asText() != veteranId }
                .get("chancePercent")
                .asInt()
        assertTrue(veteranChance < rookieChance)
    }

    @Test
    @Tag("FR20")
    fun `draw on validated composition returns 409`() {
        val adminCookie = memberCookie("sub-draw-admin-2", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
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
                post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("NFR-S2")
    fun `member without manage permission cannot draw`() {
        val adminCookie = memberCookie("sub-draw-admin-3", admin = true)
        val memberCookie = memberCookie("sub-draw-member-3")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                    .cookie(memberCookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @Tag("FR24")
    fun `member sees odds only after publish`() {
        val adminCookie = memberCookie("sub-draw-admin-4", admin = true)
        val member1 = memberCookie("sub-draw-member-4a")
        val member2 = memberCookie("sub-draw-member-4b")
        val memberView = memberCookie("sub-draw-member-4c")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")

        draw(adminCookie, seasonId, eventId)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberView))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.slots").isEmpty)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberView))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].chancePercent").exists())
    }
}
