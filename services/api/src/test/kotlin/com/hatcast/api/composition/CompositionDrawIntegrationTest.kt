package com.hatcast.api.composition

import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.MemberGender
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
import javax.sql.DataSource
import java.util.concurrent.CompletableFuture
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompositionDrawIntegrationTest {
    @Autowired
    private lateinit var dataSource: DataSource

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
    private lateinit var drawChanceSnapshotRepository: EventDrawChanceSnapshotRepository

    @Autowired
    private lateinit var roleChanceBaselineRepository: RoleChanceBaselineRepository

    @Autowired
    private lateinit var roleChanceBaselineEntryRepository: RoleChanceBaselineEntryRepository

    @Autowired
    private lateinit var reconstructions: RoleChanceReconstructionRepository

    @Autowired
    private lateinit var reconstructionEntries: RoleChanceReconstructionEntryRepository

    @Autowired
    private lateinit var roleChanceBaselines: RoleChanceBaselineCaptureService

    @Autowired
    private lateinit var chanceBaselineEvents: ChanceBaselineEventRepository

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
        templateType: String? = null,
        category: String? = null,
    ): UUID {
        val future = Instant.parse("2031-04-01T19:00:00Z")
        val templateJson = templateType?.let { """, "templateType": "$it"""" } ?: ""
        category?.let { EventTestSupport.ensureGlossaryCategory(mockMvc, cookie, seedTroupeId, it) }
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
                              "title": "Draw event",
                              "startsAt": "$future",
                              "roleSlots": $roleSlotsJson$templateJson$categoryJson
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun validateComposition(eventId: UUID) {
        val now = Instant.now()
        val composition =
            compositionRepository.findById(eventId).orElseThrow()
        composition.validatedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)
    }

    private fun chancePercentForParticipant(
        summaryJson: JsonNode,
        roleKey: String,
        participantId: String,
    ): Int {
        val playerCandidates =
            summaryJson
                .get("roles")
                .first { it.get("roleKey").asText() == roleKey }
                .get("candidates")
        return (0 until playerCandidates.size())
            .map { playerCandidates.get(it) }
            .first { it.get("participantId").asText() == participantId }
            .get("chancePercent")
            .asInt()
    }

    private fun pastSelectionCountFromCandidates(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        participantId: String,
    ): Int {
        val res =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                        .param("roleKey", roleKey)
                        .param("slotIndex", "0")
                        .cookie(adminCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val candidates = mapper.readTree(res.response.contentAsString).get("candidates")
        return (0 until candidates.size())
            .map { candidates.get(it) }
            .first { it.get("participantId").asText() == participantId }
            .get("pastSelectionCount")
            .asInt()
    }

    private fun chancePercentFromDrawStep(
        drawBody: JsonNode,
        roleKey: String,
        participantId: String,
    ): Int {
        val step =
            drawBody
                .get("steps")
                .first { it.get("roleKey").asText() == roleKey && it.get("slotIndex").asInt() == 0 }
        val candidates = step.get("candidates")
        return (0 until candidates.size())
            .map { candidates.get(it) }
            .first { it.get("participantId").asText() == participantId }
            .get("chancePercent")
            .asInt()
    }

    /**
     * Opening draw snapshot (E-04): score full role pool at draw opening — not per-slot steps after
     * intra-role or cross-role exclusions accumulate during the same request.
     */
    private fun expectedOpeningSnapshotPercent(
        requiredCount: Int,
        poolParticipantIds: List<UUID>,
        targetParticipantId: UUID,
        pastByParticipant: Map<UUID, Int> = emptyMap(),
    ): Pair<Int, Int> {
        val candidates =
            poolParticipantIds.map { pid ->
                AvailabilityChanceCalculator.Candidate(pid, "test", null)
            }
        val past =
            poolParticipantIds.associateWith { pastByParticipant[it] ?: 0 }
        val scored =
            AvailabilityChanceCalculator.scoreCandidates(candidates, requiredCount, past)
        val row =
            scored.firstOrNull { it.participantId == targetParticipantId }
                ?: error("No opening score for $targetParticipantId")
        return row.chancePercent to poolParticipantIds.size
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

    private fun assignSlot(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        participantId: UUID,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/$roleKey/$slotIndex")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun assertPrincipalChancesEqualAfterAwayAssignment(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        awayEventId: UUID,
        principalEventId: UUID,
        awayEvent2Id: UUID,
        veteran: jakarta.servlet.http.Cookie,
        rookie: jakarta.servlet.http.Cookie,
        veteranGoogleSub: String,
        rookieGoogleSub: String,
    ) {
        val veteranId = participantIdForUser(seasonId, veteranGoogleSub)
        val rookieId = participantIdForUser(seasonId, rookieGoogleSub)

        setAvailability(veteran, seasonId, awayEventId, "available")
        setAvailability(rookie, seasonId, awayEventId, "available")
        setAvailability(veteran, seasonId, principalEventId, "available")
        setAvailability(rookie, seasonId, principalEventId, "available")
        setAvailability(veteran, seasonId, awayEvent2Id, "available")
        setAvailability(rookie, seasonId, awayEvent2Id, "available")

        assignSlot(adminCookie, seasonId, awayEventId, "player", 0, veteranId)
        validateComposition(awayEventId)

        val principalSummaryRes =
            mockMvc
                .perform(
                    get(
                        "/v1/seasons/$seasonId/events/$principalEventId/availability/summary?includeChances=true",
                    ).cookie(adminCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val principalSummary = mapper.readTree(principalSummaryRes.response.contentAsString)
        assertEquals(
            chancePercentForParticipant(principalSummary, "player", rookieId.toString()),
            chancePercentForParticipant(principalSummary, "player", veteranId.toString()),
            "Away validated assignment must not reduce principal chances",
        )

        val principalDraw = draw(adminCookie, seasonId, principalEventId)
        assertEquals(
            chancePercentFromDrawStep(principalDraw, "player", veteranId.toString()),
            chancePercentFromDrawStep(principalDraw, "player", rookieId.toString()),
            "Principal draw chances must stay equal after away assignment",
        )

        val veteranAwayHistory =
            pastSelectionCountFromCandidates(
                adminCookie,
                seasonId,
                awayEvent2Id,
                "player",
                veteranId.toString(),
            )
        val rookieAwayHistory =
            pastSelectionCountFromCandidates(
                adminCookie,
                seasonId,
                awayEvent2Id,
                "player",
                rookieId.toString(),
            )
        assertTrue(veteranAwayHistory > rookieAwayHistory)
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
    fun `POST draw exposes candidate gender on animation steps`() {
        val adminCookie = memberCookie("sub-draw-admin-gender-step", admin = true)
        val member1 = memberCookie("sub-draw-member-gender-step-a")
        val member2 = memberCookie("sub-draw-member-gender-step-b")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")
        val user = userRepository.findByGoogleSub("sub-draw-member-gender-step-a")!!
        user.gender = MemberGender.FEMALE
        userRepository.save(user)
        val femaleParticipantId = participantIdForUser(seasonId, "sub-draw-member-gender-step-a").toString()

        val body = draw(adminCookie, seasonId, eventId)
        val steps = body.get("steps")
        assertTrue(steps.size() > 0)
        val candidates = steps[0].get("candidates")
        assertTrue(candidates.size() > 0)

        var foundFemale = false
        for (index in 0 until candidates.size()) {
            val candidate = candidates[index]
            if (candidate.get("participantId")?.asText() == femaleParticipantId) {
                assertEquals("female", candidate.get("gender").asText())
                foundFemale = true
            }
        }
        assertTrue(foundFemale, "Female participant should appear in draw candidates with gender=female")
    }

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
    }

    @Test
    @Tag("FR20")
    @Tag("REF-O1")
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
    @Tag("REF-O2")
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
                seasonParticipantId = keeperId,
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
    @Tag("REF-O4")
    fun `cross role draw excludes participant pre assigned on later role in draw order`() {
        val adminCookie = memberCookie("sub-draw-admin-preassign-player", admin = true)
        val solo = memberCookie("sub-draw-member-preassign-player")
        val backup = memberCookie("sub-draw-member-preassign-backup")
        val seasonId = createSeason(adminCookie)
        val eventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1, "dj": 1 }""",
            )
        setAvailability(solo, seasonId, eventId, "available", roleKeys = listOf("player", "dj"))
        setAvailability(backup, seasonId, eventId, "available", roleKeys = listOf("dj"))
        val soloId = participantIdForUser(seasonId, "sub-draw-member-preassign-player")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, soloId)

        val body = draw(adminCookie, seasonId, eventId)
        val slots = body.get("composition").get("slots")
        val assignees =
            (0 until slots.size())
                .map { slots.get(it) }
                .mapNotNull { slot ->
                    slot.get("participantId")?.takeIf { !it.isNull }?.asText()?.let { id ->
                        id to slot.get("roleKey").asText()
                    }
                }
        val soloRoles = assignees.filter { it.first == soloId.toString() }.map { it.second }.toSet()

        assertEquals(setOf("player"), soloRoles)
    }

    @Test
    @Tag("FR20")
    @Tag("REF-O5")
    fun `full draw does not auto assign two roles when manual multi role stack exists`() {
        val adminCookie = memberCookie("sub-draw-admin-manual-multi", admin = true)
        val solo = memberCookie("sub-draw-member-manual-multi")
        val backup = memberCookie("sub-draw-member-manual-multi-backup")
        val seasonId = createSeason(adminCookie)
        val eventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1, "dj": 1 }""",
            )
        setAvailability(solo, seasonId, eventId, "available", roleKeys = listOf("player", "dj"))
        setAvailability(backup, seasonId, eventId, "available", roleKeys = listOf("dj"))
        val soloId = participantIdForUser(seasonId, "sub-draw-member-manual-multi")

        assignSlot(adminCookie, seasonId, eventId, "player", 0, soloId)
        assignSlot(adminCookie, seasonId, eventId, "dj", 0, soloId)

        val body = draw(adminCookie, seasonId, eventId)
        val slots = body.get("composition").get("slots")
        val assignees =
            (0 until slots.size())
                .map { slots.get(it) }
                .mapNotNull { slot ->
                    slot.get("participantId")?.takeIf { !it.isNull }?.asText()?.let { id ->
                        id to slot.get("roleKey").asText()
                    }
                }
        val soloRoles = assignees.filter { it.first == soloId.toString() }.map { it.second }.toSet()

        assertTrue(soloRoles.size <= 1, "Auto-draw must not place the same participant on two roles")
    }

    @Test
    @Tag("FR20")
    @Tag("REF-O3")
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
    @Tag("REF-O7")
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
                    get("/v1/seasons/$seasonId/events/$newEventId/availability/summary?includeChances=true")
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
    @Tag("FR19")
    fun `selection history is scoped to category`() {
        val adminCookie = memberCookie("sub-compartment-admin", admin = true)
        val veteran = memberCookie("sub-compartment-vet")
        val rookie = memberCookie("sub-compartment-rook")
        val seasonId = createSeason(adminCookie)
        val awayEventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "match",
                category = "deplacements",
            )
        val principalEventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        val awayEvent2Id =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "match",
                category = "deplacements",
            )

        assertPrincipalChancesEqualAfterAwayAssignment(
            adminCookie,
            seasonId,
            awayEventId,
            principalEventId,
            awayEvent2Id,
            veteran,
            rookie,
            veteranGoogleSub = "sub-compartment-vet",
            rookieGoogleSub = "sub-compartment-rook",
        )
    }

    @Test
    @Tag("FR19")
    fun `chance breakdown omits equity_tag when away history is isolated from principal`() {
        val adminCookie = memberCookie("sub-bd-compartment-admin", admin = true)
        val veteran = memberCookie("sub-bd-compartment-vet")
        val rookie = memberCookie("sub-bd-compartment-rook")
        val seasonId = createSeason(adminCookie)
        val awayEventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "match",
                category = "deplacements",
            )
        val principalEventId = createEvent(adminCookie, seasonId, """{ "player": 1, "mc": 1 }""")

        setAvailability(veteran, seasonId, awayEventId, "available")
        setAvailability(rookie, seasonId, awayEventId, "available")
        setAvailability(veteran, seasonId, principalEventId, "available")
        setAvailability(rookie, seasonId, principalEventId, "available")

        val veteranId = participantIdForUser(seasonId, "sub-bd-compartment-vet")
        assignSlot(adminCookie, seasonId, awayEventId, "player", 0, veteranId)
        validateComposition(awayEventId)

        mockMvc
            .perform(
                get(
                    "/v1/seasons/$seasonId/events/$principalEventId/composition/chance-breakdown" +
                        "?roleKey=player&participantId=$veteranId",
                ).cookie(veteran),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.adjustments[?(@.factorId == 'equity_tag')]").isEmpty())
            .andExpect(jsonPath("$.adjustments").isEmpty())
            .andReturn()
            .let { breakdownRes ->
                val breakdown = mapper.readTree(breakdownRes.response.contentAsString)
                assertEquals(
                    breakdown.get("referencePercent").asInt(),
                    breakdown.get("chancePercent").asInt(),
                )
            }
    }

    @Test
    @Tag("FR19")
    fun `legacy deplacement template scopes history to deplacements compartment`() {
        val adminCookie = memberCookie("sub-compartment-legacy-admin", admin = true)
        val veteran = memberCookie("sub-compartment-legacy-vet")
        val rookie = memberCookie("sub-compartment-legacy-rook")
        val seasonId = createSeason(adminCookie)
        val awayEventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "deplacement",
            )
        val principalEventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        val awayEvent2Id =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "deplacement",
            )

        assertPrincipalChancesEqualAfterAwayAssignment(
            adminCookie,
            seasonId,
            awayEventId,
            principalEventId,
            awayEvent2Id,
            veteran,
            rookie,
            veteranGoogleSub = "sub-compartment-legacy-vet",
            rookieGoogleSub = "sub-compartment-legacy-rook",
        )
    }

    @Test
    @Tag("FR19")
    fun `aperock compartment isolates history from principal and deplacements`() {
        val adminCookie = memberCookie("sub-compartment-aperock-admin", admin = true)
        val veteran = memberCookie("sub-compartment-aperock-vet")
        val rookie = memberCookie("sub-compartment-aperock-rook")
        val seasonId = createSeason(adminCookie)
        val aperockEventId =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "match",
                category = "aperock",
            )
        val principalEventId = createEvent(adminCookie, seasonId, """{ "player": 1 }""")
        val aperockEvent2Id =
            createEvent(
                adminCookie,
                seasonId,
                """{ "player": 1 }""",
                templateType = "match",
                category = "aperock",
            )

        setAvailability(veteran, seasonId, aperockEventId, "available")
        setAvailability(rookie, seasonId, aperockEventId, "available")
        setAvailability(veteran, seasonId, principalEventId, "available")
        setAvailability(rookie, seasonId, principalEventId, "available")
        setAvailability(veteran, seasonId, aperockEvent2Id, "available")
        setAvailability(rookie, seasonId, aperockEvent2Id, "available")

        val veteranId = participantIdForUser(seasonId, "sub-compartment-aperock-vet")
        val rookieId = participantIdForUser(seasonId, "sub-compartment-aperock-rook")
        assignSlot(adminCookie, seasonId, aperockEventId, "player", 0, veteranId)
        validateComposition(aperockEventId)

        val principalSummaryRes =
            mockMvc
                .perform(
                    get(
                        "/v1/seasons/$seasonId/events/$principalEventId/availability/summary?includeChances=true",
                    ).cookie(adminCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val principalSummary = mapper.readTree(principalSummaryRes.response.contentAsString)
        assertEquals(
            chancePercentForParticipant(principalSummary, "player", rookieId.toString()),
            chancePercentForParticipant(principalSummary, "player", veteranId.toString()),
            "Apérock assignment must not reduce principal chances",
        )

        val veteranAperockHistory =
            pastSelectionCountFromCandidates(
                adminCookie,
                seasonId,
                aperockEvent2Id,
                "player",
                veteranId.toString(),
            )
        val rookieAperockHistory =
            pastSelectionCountFromCandidates(
                adminCookie,
                seasonId,
                aperockEvent2Id,
                "player",
                rookieId.toString(),
            )
        assertTrue(veteranAperockHistory > rookieAperockHistory)
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
    fun `member sees odds only after validate`() {
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
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberView))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantDisplayName").exists())
    }

    @Test
    @Tag("FR20")
    @Tag("REF-O8")
    fun `draw persists chance snapshots for scored candidates`() {
        val adminCookie = memberCookie("sub-draw-snapshot-admin", admin = true)
        val member1 = memberCookie("sub-draw-snapshot-m1")
        val member2 = memberCookie("sub-draw-snapshot-m2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")

        draw(adminCookie, seasonId, eventId)
        val veteranId = participantIdForUser(seasonId, "sub-draw-snapshot-m1")
        val rookieId = participantIdForUser(seasonId, "sub-draw-snapshot-m2")
        val pool = listOf(veteranId, rookieId)
        val expectedVeteran = expectedOpeningSnapshotPercent(requiredCount = 2, poolParticipantIds = pool, targetParticipantId = veteranId)
        val expectedRookie = expectedOpeningSnapshotPercent(requiredCount = 2, poolParticipantIds = pool, targetParticipantId = rookieId)

        val snapshots = drawChanceSnapshotRepository.findByIdEventId(eventId)
        assertEquals(2, snapshots.size)
        val byParticipant = snapshots.associateBy { it.id.participantId }
        assertEquals(expectedVeteran.first, byParticipant[veteranId]?.chancePercent)
        assertEquals(expectedRookie.first, byParticipant[rookieId]?.chancePercent)
        assertEquals(expectedVeteran.second, byParticipant[veteranId]?.candidateCount)
        assertEquals(expectedRookie.second, byParticipant[rookieId]?.candidateCount)
    }

    @Test
    @Tag("FR20")
    fun `opening draw snapshot captures player odds for mc assignee excluded later in draw order`() {
        val adminCookie = memberCookie("sub-opening-snap-admin", admin = true)
        val mcPlayer = memberCookie("sub-opening-snap-mc")
        val playerOnly = memberCookie("sub-opening-snap-p1")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 1, "mc": 1 }""")
        setAvailability(mcPlayer, seasonId, eventId, "available", listOf("player", "mc"))
        setAvailability(playerOnly, seasonId, eventId, "available", listOf("player"))

        draw(adminCookie, seasonId, eventId)

        val mcPlayerId = participantIdForUser(seasonId, "sub-opening-snap-mc")
        val playerSnapshot =
            drawChanceSnapshotRepository
                .findByIdEventId(eventId)
                .firstOrNull { it.id.participantId == mcPlayerId && it.id.roleKey == "player" }
        assertTrue(
            playerSnapshot != null,
            "Multi-role assignee must have opening player snapshot even when picked for mc first",
        )
        val playerOnlyId = participantIdForUser(seasonId, "sub-opening-snap-p1")
        val baselineRows = roleChanceBaselineEntryRepository.findByIdEventId(eventId)
        val playerBaseline = baselineRows.filter { it.id.roleKey == "player" }
        assertEquals(mapOf(playerOnlyId to 100), playerBaseline.associate { it.id.participantId to it.chancePercent })
        assertEquals(mapOf(mcPlayerId to 100), baselineRows.filter { it.id.roleKey == "mc" }.associate { it.id.participantId to it.chancePercent })
        assertEquals(50, playerSnapshot!!.chancePercent)

    }

    @Test
    @Tag("FR19")
    fun `past event shows current estimates and a separate selection record`() {
        val admin = memberCookie("sub-1924-admin", admin = true)
        val first = memberCookie("sub-1924-first")
        val second = memberCookie("sub-1924-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        val laterId = createEvent(admin, seasonId, """{ "player": 1 }""")
        for (cookie in listOf(first, second)) {
            setAvailability(cookie, seasonId, eventId, "available")
            setAvailability(cookie, seasonId, laterId, "available")
        }
        draw(admin, seasonId, eventId)
        val selected = slotRepository.findByEventId(eventId).first { it.roleKey == "player" && it.hasAssignee() }
        val selectedId = selected.assignedParticipantId()!!
        val recorded = selected.selectionChancePercent!!
        moveEventToPast(eventId)

        assignSlot(admin, seasonId, laterId, "player", 0, selectedId)
        validateComposition(laterId)

        mockMvc.perform(
            get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true")
                .cookie(admin),
        ).andExpect(status().isOk).andExpect(jsonPath("$.chanceSource").value("live"))
        mockMvc.perform(
            get("/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown")
                .param("roleKey", "player")
                .param("participantId", selectedId.toString())
                .cookie(admin),
        ).andExpect(status().isOk)
            .andExpect(jsonPath("$.recordedPercent").value(recorded))
            .andExpect(jsonPath("$.recordedAt").exists())
            .andExpect(jsonPath("$.recordedSource").value("draw"))
            .andExpect(jsonPath("$.referencePercent").exists())
            .andExpect(jsonPath("$.pool").exists())
    }

    @Test
    fun `multi-place draw records each actual step probability`() {
        val admin = memberCookie("sub-1924-steps-admin", admin = true)
        val members = listOf("one", "two", "three").map { memberCookie("sub-1924-steps-$it") }
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 2 }""")
        members.forEach { setAvailability(it, seasonId, eventId, "available") }
        draw(admin, seasonId, eventId)
        val slots = slotRepository.findByEventId(eventId).filter { it.roleKey == "player" }.sortedBy { it.slotIndex }
        assertEquals(listOf(33, 50), slots.map { it.selectionChancePercent })
        assertTrue(slots.all { it.selectionChanceSource == "draw" && it.selectionChanceAt != null })
        val baseline = roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow()
        val entries = roleChanceBaselineEntryRepository.findByIdEventId(eventId)
        assertEquals(3, entries.size)
        assertEquals(setOf(67), entries.map { it.chancePercent }.toSet())
        assertTrue(baseline.capturedAt != null)
        validateComposition(eventId)
        val result = mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true").cookie(admin))
            .andExpect(status().isOk).andExpect(jsonPath("$.chanceSource").value("baseline")).andReturn()
        val role = mapper.readTree(result.response.contentAsString)["roles"].first { it["roleKey"].asText() == "player" }
        assertEquals(3, role["candidates"].size())
        assertTrue(role["candidates"].all { it["chancePercent"].asInt() == 67 })
        assertTrue(!role["chanceSnapshotAt"].isNull)
        val winner = slots.first().assignedParticipantId()!!
        mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown")
            .param("roleKey", "player").param("participantId", winner.toString()).cookie(admin))
            .andExpect(status().isOk).andExpect(jsonPath("$.recordedSelection").value(true))
            .andExpect(jsonPath("$.recordedPercent").value(33)).andExpect(jsonPath("$.chancePercent").doesNotExist())
        val nonWinner = entries.first { row -> slots.none { it.assignedParticipantId() == row.id.participantId } }.id.participantId
        mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown")
            .param("roleKey", "player").param("participantId", nonWinner.toString()).cookie(admin))
            .andExpect(status().isOk).andExpect(jsonPath("$.recordedSnapshot").value(true))
            .andExpect(jsonPath("$.recordedPercent").value(67)).andExpect(jsonPath("$.chancePercent").doesNotExist())

    }

    @Test
    fun `reconstruction stays separate and observed draw takes precedence`() {
        val admin = memberCookie("sub-reconstruction-admin", admin = true)
        val first = memberCookie("sub-reconstruction-first")
        val second = memberCookie("sub-reconstruction-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        setAvailability(first, seasonId, eventId, "available")
        setAvailability(second, seasonId, eventId, "available")
        val firstId = participantIdForUser(seasonId, "sub-reconstruction-first")
        val secondId = participantIdForUser(seasonId, "sub-reconstruction-second")
        val id = RoleChanceBaselineId(eventId, "player")
        val path = "/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true"
        val before = mapper.readTree(mockMvc.perform(get(path).cookie(first)).andExpect(status().isOk).andReturn().response.contentAsString)
        assertTrue(before["roles"].first()["chanceProvenance"].isNull)
        assignSlot(admin, seasonId, eventId, "player", 0, firstId)
        reconstructions.saveAndFlush(RoleChanceReconstructionEntity(id, Instant.parse("2026-01-01T12:00:00Z"), "audit", "formula evidence"))
        reconstructionEntries.saveAll(listOf(firstId, secondId).map {
            RoleChanceReconstructionEntryEntity(RoleChanceBaselineEntryId(eventId, "player", it), 42)
        })
        validateComposition(eventId)
        // The manual assignment already created an observed photograph, so it wins.
        var role = mapper.readTree(mockMvc.perform(get(path).cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)["roles"].first()
        assertEquals("observed", role["chanceProvenance"].asText())
        // Simulate a legacy unavailable marker without touching assignments or individual chances.
        roleChanceBaselineEntryRepository.deleteAll(roleChanceBaselineEntryRepository.findByIdEventId(eventId))
        roleChanceBaselineRepository.saveAndFlush(RoleChanceBaselineEntity(id, null))
        role = mapper.readTree(mockMvc.perform(get(path).cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)["roles"].first()
        assertEquals("reconstructed", role["chanceProvenance"].asText())
        assertEquals(setOf(42), role["candidates"].map { it["chancePercent"].asInt() }.toSet())
        mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown")
            .param("roleKey", "player").param("participantId", secondId.toString()).cookie(admin))
            .andExpect(status().isOk).andExpect(jsonPath("$.recordedSource").value("reconstructed"))
            .andExpect(jsonPath("$.recordedPercent").value(42))
        roleChanceBaselines.replaceAfterDraw(eventId, "player", RoleChanceBaselineCaptureService.Prepared(mapOf("player" to listOf(firstId to 50, secondId to 50)), Instant.now()))
        role = mapper.readTree(mockMvc.perform(get(path).cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)["roles"].first()
        assertEquals("observed", role["chanceProvenance"].asText())
        assertEquals(setOf(50), role["candidates"].map { it["chancePercent"].asInt() }.toSet())
        assertTrue(reconstructions.findById(id).orElseThrow().supersededAt != null)
        roleChanceBaselineEntryRepository.deleteAll(roleChanceBaselineEntryRepository.findByIdEventId(eventId))
        roleChanceBaselineRepository.saveAndFlush(RoleChanceBaselineEntity(id, null))
        role = mapper.readTree(mockMvc.perform(get(path).cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)["roles"].first()
        assertTrue(role["chanceProvenance"].isNull)
    }

    @Test
    fun `draw waits for replay and supersedes its committed reconstruction`() {
        val admin = memberCookie("sub-replay-race-admin", admin = true)
        val member = memberCookie("sub-replay-race-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        setAvailability(member, seasonId, eventId, "available")
        draw(admin, seasonId, eventId)
        val id = RoleChanceBaselineId(eventId, "player")
        roleChanceBaselineEntryRepository.deleteAll(roleChanceBaselineEntryRepository.findByIdEventId(eventId))
        roleChanceBaselineRepository.deleteById(id)
        roleChanceBaselineRepository.flush()
        val started = CountDownLatch(1)
        dataSource.connection.use { connection ->
            connection.autoCommit = false
            connection.prepareStatement("SELECT event_id FROM event_compositions WHERE event_id = ? FOR UPDATE").use {
                it.setObject(1, eventId); it.executeQuery().close()
            }
            connection.prepareStatement("INSERT INTO event_role_chance_reconstructions(event_id, role_key, estimated_at, evidence, assumptions) VALUES (?, 'player', CURRENT_TIMESTAMP, 'test', 'test')").use {
                it.setObject(1, eventId); it.executeUpdate()
            }
            val future = CompletableFuture.runAsync { started.countDown(); draw(admin, seasonId, eventId) }
            assertTrue(started.await(5, TimeUnit.SECONDS))
            try {
                future.get(300, TimeUnit.MILLISECONDS)
                throw AssertionError("draw did not wait for the replay composition lock")
            } catch (_: TimeoutException) {
                // The same composition lock serializes the draw with the replay.
            } finally {
                connection.commit()
            }
            future.get(15, TimeUnit.SECONDS)
        }
        assertTrue(roleChanceBaselineRepository.findById(id).orElseThrow().capturedAt != null)
        assertTrue(reconstructions.findById(id).orElseThrow().supersededAt != null)
    }

    @Test
    fun `hidden publication keeps live summary identical until validated photograph is visible`() {
        val admin = memberCookie("sub-baseline-private-admin", admin = true)
        val first = memberCookie("sub-baseline-private-first")
        val second = memberCookie("sub-baseline-private-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        setAvailability(first, seasonId, eventId, "available")
        setAvailability(second, seasonId, eventId, "available")
        val firstId = participantIdForUser(seasonId, "sub-baseline-private-first")
        assignSlot(admin, seasonId, eventId, "player", 0, firstId)
        setAvailability(second, seasonId, eventId, "unavailable", emptyList())
        val path = "/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true"
        val before = mapper.readTree(mockMvc.perform(get(path).cookie(first)).andExpect(status().isOk).andReturn().response.contentAsString)
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/composition/publish").cookie(admin).with(csrf())).andExpect(status().isOk)
        val hidden = mapper.readTree(mockMvc.perform(get(path).cookie(first)).andExpect(status().isOk).andReturn().response.contentAsString)
        assertEquals(before["roles"], hidden["roles"])
        assertEquals("live", hidden["chanceSource"].asText())
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/composition/validate").cookie(admin).with(csrf())).andExpect(status().isOk)
        val visible = mapper.readTree(mockMvc.perform(get(path).cookie(first)).andExpect(status().isOk).andReturn().response.contentAsString)
        assertEquals("baseline", visible["chanceSource"].asText())
        val role = visible["roles"].first { it["roleKey"].asText() == "player" }
        assertEquals(2, role["candidates"].size())
        assertEquals(setOf(50), role["candidates"].map { it["chancePercent"].asInt() }.toSet())
        assertTrue(!role["chanceSnapshotAt"].isNull)
    }

    @Test
    fun `each role keeps its own photograph from before its first manual selection`() {
        val admin = memberCookie("sub-baseline-roles-admin", admin = true)
        val first = memberCookie("sub-baseline-roles-first")
        val second = memberCookie("sub-baseline-roles-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1, "mc": 1 }""")
        setAvailability(first, seasonId, eventId, "available", listOf("player", "mc"))
        setAvailability(second, seasonId, eventId, "available", listOf("player", "mc"))
        val firstId = participantIdForUser(seasonId, "sub-baseline-roles-first")
        val secondId = participantIdForUser(seasonId, "sub-baseline-roles-second")
        assignSlot(admin, seasonId, eventId, "player", 0, firstId)
        val playerBaseline = roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow()
        setAvailability(first, seasonId, eventId, "unavailable", emptyList())
        assignSlot(admin, seasonId, eventId, "mc", 0, secondId)
        val mcBaseline = roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "mc")).orElseThrow()
        val entries = roleChanceBaselineEntryRepository.findByIdEventId(eventId)
        assertEquals(mapOf(firstId to 50, secondId to 50), entries.filter { it.id.roleKey == "player" }.associate { it.id.participantId to it.chancePercent })
        assertEquals(mapOf(secondId to 100), entries.filter { it.id.roleKey == "mc" }.associate { it.id.participantId to it.chancePercent })
        assertTrue(playerBaseline.capturedAt!! <= mcBaseline.capturedAt!!)
        validateComposition(eventId)
        val result = mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true").cookie(admin))
            .andExpect(status().isOk).andReturn()
        val roles = mapper.readTree(result.response.contentAsString)["roles"]
        val player = roles.first { it["roleKey"].asText() == "player" }
        assertEquals(setOf(50), player["candidates"].map { it["chancePercent"].asInt() }.toSet())
        assertEquals(2, player["candidates"].size())
        val mc = roles.first { it["roleKey"].asText() == "mc" }
        assertEquals(100, mc["candidates"].first()["chancePercent"].asInt())
    }

    @Test
    fun `manual role photograph matches the slot picker including other role assignees`() {
        val admin = memberCookie("sub-baseline-manual-pool-admin", admin = true)
        val first = memberCookie("sub-baseline-manual-pool-first")
        val second = memberCookie("sub-baseline-manual-pool-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1, "mc": 1 }""")
        setAvailability(first, seasonId, eventId, "available", listOf("player", "mc"))
        setAvailability(second, seasonId, eventId, "available", listOf("player", "mc"))
        val firstId = participantIdForUser(seasonId, "sub-baseline-manual-pool-first")
        val secondId = participantIdForUser(seasonId, "sub-baseline-manual-pool-second")
        assignSlot(admin, seasonId, eventId, "player", 0, firstId)
        val pickerResponse = mockMvc.perform(
            get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                .param("roleKey", "mc").param("slotIndex", "0").cookie(admin),
        ).andExpect(status().isOk).andReturn()
        val picker = mapper.readTree(pickerResponse.response.contentAsString)["candidates"]
        val displayed = picker.associate { UUID.fromString(it["participantId"].asText()) to it["chancePercent"].asInt() }
        assertEquals(setOf(firstId, secondId), displayed.keys)
        assertTrue(picker.first { it["participantId"].asText() == firstId.toString() }["alreadyAssignedRoleKeys"].any { it.asText() == "player" })
        assignSlot(admin, seasonId, eventId, "mc", 0, secondId)
        val captured = roleChanceBaselineEntryRepository.findByIdEventId(eventId)
            .filter { it.id.roleKey == "mc" }.associate { it.id.participantId to it.chancePercent }
        assertEquals(displayed, captured)
    }

    @Test
    fun `failed first capture remains unavailable after later replacement`() {
        val admin = memberCookie("sub-baseline-missing-admin", admin = true)
        val first = memberCookie("sub-baseline-missing-first")
        val second = memberCookie("sub-baseline-missing-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        setAvailability(first, seasonId, eventId, "available")
        setAvailability(second, seasonId, eventId, "available")
        val firstId = participantIdForUser(seasonId, "sub-baseline-missing-first")
        val secondId = participantIdForUser(seasonId, "sub-baseline-missing-second")
        compositionRepository.save(EventCompositionEntity(eventId = eventId))
        slotRepository.save(EventCompositionSlotEntity(eventId = eventId, roleKey = "player", slotIndex = 0, seasonParticipantId = firstId))
        roleChanceBaselines.persist(eventId, null, setOf("player"), newComposition = true)
        assertEquals(null, roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt)
        assignSlot(admin, seasonId, eventId, "player", 0, secondId)
        assertEquals(null, roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt)
        assertTrue(roleChanceBaselineEntryRepository.findByIdEventId(eventId).isEmpty())
    }

    @Test
    fun `existing composition before baseline support never gains invented first photograph`() {
        val admin = memberCookie("sub-baseline-legacy-admin", admin = true)
        val first = memberCookie("sub-baseline-legacy-first")
        val second = memberCookie("sub-baseline-legacy-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        setAvailability(first, seasonId, eventId, "available")
        setAvailability(second, seasonId, eventId, "available")
        val firstId = participantIdForUser(seasonId, "sub-baseline-legacy-first")
        val secondId = participantIdForUser(seasonId, "sub-baseline-legacy-second")
        compositionRepository.save(EventCompositionEntity(eventId = eventId))
        slotRepository.save(EventCompositionSlotEntity(eventId = eventId, roleKey = "player", slotIndex = 0, seasonParticipantId = firstId))
        assignSlot(admin, seasonId, eventId, "player", 0, secondId)
        assertFalse(chanceBaselineEvents.existsById(eventId))
        assertTrue(roleChanceBaselineRepository.findByIdEventId(eventId).isEmpty())
        assertTrue(roleChanceBaselineEntryRepository.findByIdEventId(eventId).isEmpty())
    }

    @Test
    fun `complete redraw captures all eligible candidates for legacy composition`() {
        val admin = memberCookie("sub-redraw-legacy-admin", admin = true)
        val members = listOf("a", "b", "c").map { memberCookie("sub-redraw-legacy-$it") }
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 2 }""")
        members.forEach { setAvailability(it, seasonId, eventId, "available") }
        val ids = listOf("a", "b", "c").map { participantIdForUser(seasonId, "sub-redraw-legacy-$it") }.toSet()
        compositionRepository.save(EventCompositionEntity(eventId = eventId))
        ids.take(2).forEachIndexed { index, id ->
            slotRepository.save(EventCompositionSlotEntity(eventId = eventId, roleKey = "player", slotIndex = index, seasonParticipantId = id))
        }
        draw(admin, seasonId, eventId)
        val entries = roleChanceBaselineEntryRepository.findByIdEventId(eventId)
        assertEquals(ids, entries.map { it.id.participantId }.toSet())
        assertEquals(setOf(67), entries.map { it.chancePercent }.toSet())
        assertTrue(roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt != null)
        assertFalse(chanceBaselineEvents.existsById(eventId))
        validateComposition(eventId)
        val result = mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true").cookie(admin))
            .andExpect(status().isOk).andExpect(jsonPath("$.chanceSource").value("baseline")).andReturn()
        val role = mapper.readTree(result.response.contentAsString)["roles"].first { it["roleKey"].asText() == "player" }
        assertEquals(ids.map { it.toString() }.toSet(), role["candidates"].map { it["participantId"].asText() }.toSet())
        assertTrue(role["candidates"].all { it["chancePercent"].asInt() == 67 })
    }

    @Test
    fun `partial and full redraw capture their pools but unsuccessful draw keeps reference`() {
        val admin = memberCookie("sub-redraw-reference-admin", admin = true)
        val members = listOf("a", "b", "c").map { memberCookie("sub-redraw-reference-$it") }
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 2 }""")
        members.forEach { setAvailability(it, seasonId, eventId, "available") }
        draw(admin, seasonId, eventId)
        val original = roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent }
        val originalAt = roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt
        assertEquals(3, original.size)
        val assigned = slotRepository.findByEventId(eventId).mapNotNull { it.assignedParticipantId() }.toSet()
        val unassignedIndex = listOf("a", "b", "c").indexOfFirst { participantIdForUser(seasonId, "sub-redraw-reference-$it") !in assigned }
        setAvailability(members[unassignedIndex], seasonId, eventId, "unavailable", roleKeys = emptyList())
        val removed = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 1)!!
        removed.clearAssignee()
        slotRepository.saveAndFlush(removed)
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/composition/draw").cookie(admin)
            .contentType(MediaType.APPLICATION_JSON).content("""{"mode":"fillEmpty"}""").with(csrf()))
            .andExpect(status().isOk)
        val keeper = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!.assignedParticipantId()!!
        val partial = roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent }
        assertEquals(1, partial.size)
        assertFalse(partial.containsKey(keeper))
        val removedAgain = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 1)!!
        removedAgain.clearAssignee()
        slotRepository.saveAndFlush(removedAgain)
        draw(admin, seasonId, eventId)
        assertEquals(partial, roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent })
        assertTrue(roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt!! > originalAt!!)
        draw(admin, seasonId, eventId)
        val replacement = roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent }
        assertEquals(2, replacement.size)
        assertEquals(setOf(100), replacement.values.toSet())
        assertTrue(roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt!! > originalAt!!)
        members.forEach { setAvailability(it, seasonId, eventId, "unavailable", roleKeys = emptyList()) }
        draw(admin, seasonId, eventId)
        assertEquals(replacement, roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent })
    }

    @Test
    fun `legacy partial draft captures only newly drawn pool after selection not publication`() {
        val admin = memberCookie("sub-partial-legacy-admin", admin = true)
        val members = listOf("a", "b", "c").map { memberCookie("sub-partial-legacy-$it") }
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 2 }""")
        members.forEach { setAvailability(it, seasonId, eventId, "available") }
        val ids = listOf("a", "b", "c").map { participantIdForUser(seasonId, "sub-partial-legacy-$it") }
        compositionRepository.save(EventCompositionEntity(eventId = eventId))
        slotRepository.save(EventCompositionSlotEntity(eventId = eventId, roleKey = "player", slotIndex = 0, seasonParticipantId = ids[0]))
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/composition/publish").cookie(admin).with(csrf())).andExpect(status().isOk)
        assertTrue(roleChanceBaselineRepository.findByIdEventId(eventId).isEmpty())
        draw(admin, seasonId, eventId)
        val entries = roleChanceBaselineEntryRepository.findByIdEventId(eventId)
        assertEquals(ids.drop(1).toSet(), entries.map { it.id.participantId }.toSet())
        assertEquals(ids[0], slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!.assignedParticipantId())
        mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true").cookie(members[0]))
            .andExpect(status().isOk).andExpect(jsonPath("$.chanceSource").value("live"))
        validateComposition(eventId)
        val result = mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true").cookie(admin))
            .andExpect(status().isOk).andExpect(jsonPath("$.chanceSource").value("baseline")).andReturn()
        val role = mapper.readTree(result.response.contentAsString)["roles"].first { it["roleKey"].asText() == "player" }
        assertTrue(role["candidates"].first { it["participantId"].asText() == ids[0].toString() }["chancePercent"].isNull)
        assertTrue(role["candidates"].filter { it["participantId"].asText() != ids[0].toString() }.all { !it["chancePercent"].isNull })
    }

    @Test
    fun `manual replacement and removal update selection evidence`() {
        val admin = memberCookie("sub-1924-manual-admin", admin = true)
        val first = memberCookie("sub-1924-manual-first")
        val second = memberCookie("sub-1924-manual-second")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId, """{ "player": 1 }""")
        setAvailability(first, seasonId, eventId, "available")
        setAvailability(second, seasonId, eventId, "available")
        val firstId = participantIdForUser(seasonId, "sub-1924-manual-first")
        val secondId = participantIdForUser(seasonId, "sub-1924-manual-second")
        assignSlot(admin, seasonId, eventId, "player", 0, firstId)
        val baselineBeforeReplacement = roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow()
        val snapshotBeforeReplacement = roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent }
        assertEquals(mapOf(firstId to 50, secondId to 50), snapshotBeforeReplacement)
        val firstSlot = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!
        assertEquals("manual", firstSlot.selectionChanceSource)
        assertEquals(50, firstSlot.selectionChancePercent)
        assertTrue(firstSlot.selectionChanceAt != null)

        assignSlot(admin, seasonId, eventId, "player", 0, secondId)
        val replacement = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!
        assertEquals(secondId, replacement.assignedParticipantId())
        assertEquals("manual", replacement.selectionChanceSource)
        assertEquals(50, replacement.selectionChancePercent)
        assertTrue(replacement.selectionChanceAt != null)
        assertEquals(baselineBeforeReplacement.capturedAt, roleChanceBaselineRepository.findById(RoleChanceBaselineId(eventId, "player")).orElseThrow().capturedAt)
        assertEquals(snapshotBeforeReplacement, roleChanceBaselineEntryRepository.findByIdEventId(eventId).associate { it.id.participantId to it.chancePercent })
        setAvailability(second, seasonId, eventId, "unavailable")
        mockMvc.perform(
            get("/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown")
                .param("roleKey", "player")
                .param("participantId", secondId.toString())
                .cookie(admin),
        ).andExpect(status().isOk)
            .andExpect(jsonPath("$.chancePercent").doesNotExist())
            .andExpect(jsonPath("$.recordedPercent").value(50))
            .andExpect(jsonPath("$.recordedAt").exists())

        val updatedEvent = eventRepository.findById(eventId).orElseThrow()
        updatedEvent.roleSlots = emptyMap()
        eventRepository.saveAndFlush(updatedEvent)
        mockMvc.perform(
            get("/v1/seasons/$seasonId/events/$eventId/composition/chance-breakdown")
                .param("roleKey", "player")
                .param("participantId", secondId.toString())
                .cookie(admin),
        ).andExpect(status().isOk)
            .andExpect(jsonPath("$.chancePercent").doesNotExist())
            .andExpect(jsonPath("$.recordedPercent").value(50))
        updatedEvent.roleSlots = mapOf("player" to 1)
        eventRepository.saveAndFlush(updatedEvent)

        mockMvc.perform(put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
            .cookie(admin).contentType(MediaType.APPLICATION_JSON)
            .content("""{"participantId":null}""").with(csrf())).andExpect(status().isOk)
        val cleared = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, "player", 0)!!
        assertEquals(null, cleared.selectionChancePercent)
        assertEquals(null, cleared.selectionChanceAt)
        assertEquals(null, cleared.selectionChanceSource)
    }

    @Test
    @Tag("FR20")
    @Tag("T-O2")
    fun `full redraw replaces previous snapshots for event`() {
        val adminCookie = memberCookie("sub-draw-snapshot-redraw-admin", admin = true)
        val member1 = memberCookie("sub-draw-snapshot-redraw-m1")
        val member2 = memberCookie("sub-draw-snapshot-redraw-m2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, """{ "player": 2 }""")
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")

        draw(adminCookie, seasonId, eventId)
        assertEquals(2, drawChanceSnapshotRepository.findByIdEventId(eventId).size)

        draw(adminCookie, seasonId, eventId)
        val snapshots = drawChanceSnapshotRepository.findByIdEventId(eventId)
        assertEquals(2, snapshots.size)
        val participantIds = snapshots.map { it.id.participantId }.toSet()
        assertEquals(2, participantIds.size)
    }

    private fun moveEventToPast(eventId: UUID) {
        val event = eventRepository.findById(eventId).orElseThrow()
        event.startsAt = Instant.parse("2020-06-01T19:00:00Z")
        eventRepository.save(event)
    }
}
