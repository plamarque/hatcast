package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.dto.CompositionDrawResponseDto
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import kotlin.random.Random

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DrawOrchestrationGoldenTest {
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
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var availabilityRepository: EventAvailabilityRepository

    @Autowired
    private lateinit var compositionDrawService: CompositionDrawService

    private val mapper = ObjectMapper()

    private val support by lazy {
        DrawTestSupport(
            mockMvc = mockMvc,
            googleIdTokenService = googleIdTokenService,
            membershipRepository = membershipRepository,
            userRepository = userRepository,
            seasonRepository = seasonRepository,
            seasonParticipantRepository = seasonParticipantRepository,
            seasonParticipantService = seasonParticipantService,
            compositionRepository = compositionRepository,
            slotRepository = slotRepository,
            eventRepository = eventRepository,
            availabilityRepository = availabilityRepository,
            compositionDrawService = compositionDrawService,
            drawChanceSnapshotRepository = drawChanceSnapshotRepository,
        )
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun orchestrationGolden(fixture: DrawOrchestrationFixture) {
        val scenario = buildScenario(fixture)
        var lastDraw: CompositionDrawResponseDto? = null

        val steps =
            if (fixture.drawSteps.isNotEmpty()) {
                fixture.drawSteps
            } else {
                listOf(mapper.createObjectNode().put("mode", fixture.setup.path("drawMode").asText("full")))
            }

        for (step in steps) {
            applyBeforeActions(fixture, scenario, step)
            val mode = step.path("mode").asText("full")
            val seed = step.path("randomSeed").takeIf { !it.isMissingNode && !it.isNull }?.asLong()
                ?: fixture.randomSeed
            lastDraw =
                support.drawViaService(
                    seasonId = scenario.seasonId,
                    eventId = scenario.eventId,
                    principal = scenario.adminPrincipal,
                    mode = mode,
                    random = seed?.let { Random(it) } ?: Random.Default,
                )
        }

        assertExpected(fixture, scenario, lastDraw)
    }

    private fun buildScenario(fixture: DrawOrchestrationFixture): DrawTestSupport.DrawScenario {
        val slug = fixture.id.lowercase().replace("-", "")
        val adminSub = "sub-orch-$slug-admin"
        val adminCookie = support.memberCookie(adminSub, admin = true)
        val adminPrincipal = support.adminPrincipal(adminSub)
        val seasonId = support.createSeason(adminCookie)
        val roleSlots = DrawOrchestrationFixtureLoader.parseRoleSlots(fixture.setup)
        val eventId = support.createEvent(adminCookie, seasonId, roleSlots)
        val event = eventRepository.findById(eventId).orElseThrow()

        val participantIds = mutableMapOf<String, java.util.UUID>()
        fixture.setup.path("participants").forEach { node ->
            val key = node.get("key").asText()
            participantIds[key] = support.createSeasonParticipant(seasonId, key)
        }

        fixture.setup.path("validatedPastEvents").forEach { past ->
            val pastRoleSlots =
                DrawOrchestrationFixtureLoader.parseRoleSlots(
                    past,
                )
            support.setupValidatedPastEvent(
                adminCookie = adminCookie,
                adminPrincipal = adminPrincipal,
                seasonId = seasonId,
                roleSlots = pastRoleSlots,
                assigneeKey = past.get("assigneeKey").asText(),
                participantIds = participantIds,
            )
        }

        fixture.setup.path("availabilities").forEach { avail ->
            val key = avail.get("participantKey").asText()
            val roleKeys =
                avail.path("roleKeys").map { it.asText() }
            support.setParticipantAvailability(
                event = event,
                participantId = participantIds.getValue(key),
                status = avail.get("status").asText(),
                roleKeys = roleKeys,
                recordedByUserId = adminPrincipal.userId,
            )
        }

        fixture.setup.path("preAssignedSlots").forEach { slot ->
            support.assignSlot(
                eventId = eventId,
                roleKey = slot.get("roleKey").asText(),
                slotIndex = slot.get("slotIndex").asInt(),
                participantId = participantIds.getValue(slot.get("participantKey").asText()),
            )
        }

        if (fixture.setup.path("lockComposition").asBoolean(false)) {
            support.validateComposition(eventId)
        }

        return DrawTestSupport.DrawScenario(
            seasonId = seasonId,
            eventId = eventId,
            adminPrincipal = adminPrincipal,
            participantIds = participantIds,
        )
    }

    private fun applyBeforeActions(
        fixture: DrawOrchestrationFixture,
        scenario: DrawTestSupport.DrawScenario,
        step: JsonNode,
    ) {
        val event = eventRepository.findById(scenario.eventId).orElseThrow()
        step.path("before").forEach { action ->
            val avail = action.get("setAvailability")
            if (avail != null) {
                val key = avail.get("participantKey").asText()
                val roleKeys = avail.path("roleKeys").map { it.asText() }
                support.setParticipantAvailability(
                    event = event,
                    participantId = scenario.participantIds.getValue(key),
                    status = avail.get("status").asText(),
                    roleKeys = roleKeys,
                    recordedByUserId = scenario.adminPrincipal.userId,
                )
            }
        }
    }

    private fun adminCookieFor(fixture: DrawOrchestrationFixture): jakarta.servlet.http.Cookie {
        val slug = fixture.id.lowercase().replace("-", "")
        return support.memberCookie("sub-orch-$slug-admin", admin = true)
    }

    private fun assertExpected(
        fixture: DrawOrchestrationFixture,
        scenario: DrawTestSupport.DrawScenario,
        lastDraw: CompositionDrawResponseDto?,
    ) {
        val id = fixture.id
        val expected = fixture.expected
        var asserted = false
        val slots = support.slotsForEvent(scenario.eventId).filter { it.hasAssignee() }

        expected.path("finalAssignedCount").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            assertEquals(node.asInt(), slots.size, "[$id] finalAssignedCount")
        }

        expected.path("totalAssignedSlots").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            assertEquals(node.asInt(), slots.size, "[$id] totalAssignedSlots")
        }

        expected.path("assignedParticipantKeys").takeIf { !it.isMissingNode && !it.isNull }?.let { node ->
            asserted = true
            val expectedKeys = node.map { it.asText() }.toSet()
            val actualKeys =
                slots
                    .mapNotNull { slot ->
                        scenario.participantIds.entries.firstOrNull { it.value == slot.assignedParticipantId() }?.key
                    }.toSet()
            assertEquals(expectedKeys, actualKeys, "[$id] assignedParticipantKeys")
        }

        expected.path("distinctAssignees").takeIf { it.asBoolean(false) }?.let {
            asserted = true
            val assigneeIds = slots.mapNotNull { it.assignedParticipantId() }
            assertEquals(assigneeIds.size, assigneeIds.toSet().size, "[$id] distinctAssignees")
        }

        expected.path("maxRolesPerParticipant").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            val byParticipant =
                slots
                    .mapNotNull { slot ->
                        slot.assignedParticipantId()?.let { it to slot.roleKey }
                    }.groupBy({ it.first }, { it.second })
            byParticipant.values.forEach { roles ->
                assertTrue(
                    roles.size <= node.asInt(),
                    "[$id] participant has ${roles.size} roles: $roles",
                )
            }
        }

        expected.path("rolesByParticipant").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            node.fields().forEach { (key, rolesNode) ->
                val participantId = scenario.participantIds.getValue(key)
                val actualRoles =
                    slots
                        .filter { it.assignedParticipantId() == participantId }
                        .map { it.roleKey }
                        .toSet()
                val expectedRoles = rolesNode.map { it.asText() }.toSet()
                assertEquals(expectedRoles, actualRoles, "[$id] roles for $key")
            }
        }

        expected.path("slotAssignments").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            node.forEach { assignment ->
                val roleKey = assignment.get("roleKey").asText()
                val slotIndex = assignment.get("slotIndex").asInt()
                val slot =
                    slots.firstOrNull { it.roleKey == roleKey && it.slotIndex == slotIndex }
                        ?: throw AssertionError("[$id] missing slot $roleKey/$slotIndex")
                assignment.path("participantKey").takeIf { !it.isMissingNode }?.let { keyNode ->
                    val expectedId = scenario.participantIds.getValue(keyNode.asText())
                    assertEquals(expectedId, slot.assignedParticipantId(), "[$id] slot $roleKey/$slotIndex participant")
                }
                assignment.path("participantKeyNot").takeIf { !it.isMissingNode }?.let { keyNode ->
                    val excludedId = scenario.participantIds.getValue(keyNode.asText())
                    assertNotEquals(excludedId, slot.assignedParticipantId(), "[$id] slot $roleKey/$slotIndex must not be ${keyNode.asText()}")
                }
            }
        }

        expected.path("veteranChanceLowerThanRookie").takeIf { it.asBoolean(false) }?.let {
            asserted = true
            assertVeteranRookieChances(fixture, scenario)
        }

        expected.path("drawWeightMatchesSummaryPercent").takeIf { it.asBoolean(false) }?.let {
            asserted = true
            assertDrawWeightMatchesSummary(fixture, scenario, lastDraw)
        }

        expected.path("openingSnapshotMatchesDb").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            assertOpeningSnapshotMatchesDb(fixture, scenario, node)
        }

        expected.path("snapshotCount").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            val snapshots = support.snapshotsForEvent(scenario.eventId)
            assertEquals(node.asInt(), snapshots.size, "[$id] snapshotCount")
        }

        expected.path("distinctSnapshotParticipants").takeIf { !it.isMissingNode }?.let { node ->
            asserted = true
            val snapshots = support.snapshotsForEvent(scenario.eventId)
            assertEquals(node.asInt(), snapshots.map { it.id.participantId }.toSet().size, "[$id] distinctSnapshotParticipants")
        }

        assertTrue(asserted, "[$id] expected block must assert at least one outcome")
    }

    private fun assertVeteranRookieChances(
        fixture: DrawOrchestrationFixture,
        scenario: DrawTestSupport.DrawScenario,
    ) {
        val id = fixture.id
        val veteranId = scenario.participantIds.getValue("veteran")
        val rookieId = scenario.participantIds.getValue("rookie")
        val summaryRes =
            mockMvc
                .perform(
                    get(
                        "/v1/seasons/${scenario.seasonId}/events/${scenario.eventId}/availability/summary?includeChances=true",
                    ).cookie(adminCookieFor(fixture)),
                ).andExpect(status().isOk)
                .andReturn()
        val summary = mapper.readTree(summaryRes.response.contentAsString)
        val playerCandidates =
            summary
                .get("roles")
                .first { it.get("roleKey").asText() == "player" }
                .get("candidates")
        fun chanceFor(participantId: java.util.UUID): Int =
            (0 until playerCandidates.size())
                .map { playerCandidates.get(it) }
                .first { it.get("participantId").asText() == participantId.toString() }
                .get("chancePercent")
                .asInt()
        assertTrue(
            chanceFor(veteranId) < chanceFor(rookieId),
            "[$id] veteran chance ${chanceFor(veteranId)} should be < rookie ${chanceFor(rookieId)}",
        )
    }

    private fun assertDrawWeightMatchesSummary(
        fixture: DrawOrchestrationFixture,
        scenario: DrawTestSupport.DrawScenario,
        lastDraw: CompositionDrawResponseDto?,
    ) {
        val id = fixture.id
        requireNotNull(lastDraw) { "[$id] missing draw response" }
        val veteranId = scenario.participantIds.getValue("veteran")
        val summaryRes =
            mockMvc
                .perform(
                    get(
                        "/v1/seasons/${scenario.seasonId}/events/${scenario.eventId}/availability/summary?includeChances=true",
                    ).cookie(adminCookieFor(fixture)),
                ).andExpect(status().isOk)
                .andReturn()
        val summary = mapper.readTree(summaryRes.response.contentAsString)
        val playerCandidates =
            summary
                .get("roles")
                .first { it.get("roleKey").asText() == "player" }
                .get("candidates")
        val summaryPercent =
            (0 until playerCandidates.size())
                .map { playerCandidates.get(it) }
                .first { it.get("participantId").asText() == veteranId.toString() }
                .get("chancePercent")
                .asInt()
        val step =
            lastDraw.steps.first { it.roleKey == "player" && it.slotIndex == 0 }
        val stepCandidate =
            step.candidates.first { it.participantId == veteranId }
        assertEquals(summaryPercent, stepCandidate.chancePercent, "[$id] draw step % must match summary %")
    }

    private fun assertOpeningSnapshotMatchesDb(
        fixture: DrawOrchestrationFixture,
        scenario: DrawTestSupport.DrawScenario,
        node: JsonNode,
    ) {
        val id = fixture.id
        val roleKey = node.get("roleKey").asText()
        val participantKey = node.get("participantKey").asText()
        val participantId = scenario.participantIds.getValue(participantKey)
        val snapshots = support.snapshotsForEvent(scenario.eventId)
        val dbRow =
            snapshots.firstOrNull { it.id.roleKey == roleKey && it.id.participantId == participantId }
                ?: throw AssertionError("[$id] missing DB snapshot for $participantKey on $roleKey")
        val setup = fixture.setup
        val preAssigned =
            setup.path("preAssignedSlots").map { it.get("participantKey").asText() }.toSet()
        val eligibleKeys =
            setup.path("availabilities")
                .filter { avail ->
                    val roleKeys = avail.path("roleKeys").map { it.asText() }
                    roleKeys.isEmpty() || roleKey in roleKeys
                }.map { it.get("participantKey").asText() }
        val (expectedPercent, expectedPoolSize) =
            DrawOrchestrationFixtureLoader.computeOpeningChancePercent(
                requiredCount = setup.get("roleSlots").get(roleKey).asInt(),
                candidateKeys = eligibleKeys,
                pastByKey = emptyMap(),
                openingExcludedKeys = preAssigned,
                targetKey = participantKey,
            )
        assertEquals(expectedPercent, dbRow.chancePercent, "[$id] opening snapshot chancePercent (E-04)")
        assertEquals(expectedPoolSize, dbRow.candidateCount, "[$id] opening snapshot candidateCount")
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<DrawOrchestrationFixture> = DrawOrchestrationFixtureLoader.loadAll()
    }
}
