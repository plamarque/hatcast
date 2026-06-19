package com.hatcast.api.draw

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.PolicyAuthTestSupport
import com.hatcast.api.composition.PolicyGoldenTestSupport
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.18")
@Tag("REF-R")
@Tag("REF-V")
class DrawPolicyDrawHttpIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var policyGoldenTestSupport: PolicyGoldenTestSupport

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var availabilityRepository: EventAvailabilityRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val mapper = ObjectMapper().registerModule(kotlinModule())

    @Test
    fun `REF-R12 draw step percent matches availability summary and chance-breakdown`() {
        val fixture =
            PolicyGoldenTestSupport.loadResolutionFixtures().first { it.path("id").asText() == "REF-R12" }
        val scenario = policyGoldenTestSupport.buildScenario(enrichRefR12Setup(fixture.path("setup")))
        val f2Id = scenario.formulaIds.getValue("f2")
        val adminSub = "sub-ref-r12-admin"
        val adminCookie = adminCookieFor(scenario.troupeId, adminSub)
        val adminUser = userRepository.findByGoogleSub(adminSub)!!
        val veteranId = createParticipant(scenario.seasonId, "veteran")
        val rookieId = createParticipant(scenario.seasonId, "rookie")
        seedPastValidatedSelection(scenario, adminUser.id, veteranId, rookieId)
        val event = eventRepository.findById(scenario.event.id).orElseThrow()
        EventTestSupport.openEventAvailability(mockMvc, adminCookie, scenario.seasonId, event.id)
        setAvailability(event, veteranId, adminUser.id)
        setAvailability(event, rookieId, adminUser.id)

        val drawJson =
            mapper.readTree(
                mockMvc
                    .perform(
                        post("/v1/seasons/${scenario.seasonId}/events/${event.id}/composition/draw")
                            .cookie(adminCookie)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""{"mode":"full","formulaId":"$f2Id"}""")
                            .with(csrf()),
                    ).andExpect(status().isOk)
                    .andReturn()
                    .response
                    .contentAsString,
            )
        val drawStepPercent = drawStepChancePercent(drawJson.path("steps"), veteranId)

        val summaryJson =
            mapper.readTree(
                mockMvc
                    .perform(
                        get(
                            "/v1/seasons/${scenario.seasonId}/events/${event.id}/availability/summary" +
                                "?includeChances=true&formulaId=$f2Id",
                        ).cookie(adminCookie),
                    ).andExpect(status().isOk)
                    .andReturn()
                    .response
                    .contentAsString,
            )
        val summaryPercent = chancePercentFor(summaryJson.path("roles"), veteranId, roleKey = "player")

        val breakdownJson =
            mapper.readTree(
                mockMvc
                    .perform(
                        get(
                            "/v1/seasons/${scenario.seasonId}/events/${event.id}/composition/chance-breakdown" +
                                "?roleKey=player&participantId=$veteranId&formulaId=$f2Id",
                        ).cookie(adminCookie),
                    ).andExpect(status().isOk)
                    .andReturn()
                    .response
                    .contentAsString,
            )
        val breakdownPercent = breakdownJson.path("chancePercent").asInt()

        assertEquals(drawStepPercent, summaryPercent, "Draw step % must match availability summary %")
        assertEquals(drawStepPercent, breakdownPercent, "Draw step % must match chance-breakdown %")
    }

    @Test
    fun `REF-V13 HTTP draw rejects formulaId outside allowed set with 403`() {
        val scenario = policyGoldenTestSupport.buildScenario(choicePolicySetup())
        val notAllowed = createPublishedFormula(scenario.troupeId, "f-not-allowed")
        val adminCookie = adminCookieFor(scenario.troupeId, "sub-ref-v13-http")
        openDrawEvent(adminCookie, scenario, "sub-ref-v13-http")

        mockMvc
            .perform(
                post("/v1/seasons/${scenario.seasonId}/events/${scenario.event.id}/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full","formulaId":"$notAllowed"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `explicit CHOICE policy with two formulas requires formulaId on HTTP draw`() {
        val scenario = policyGoldenTestSupport.buildScenario(choicePolicySetup())
        val adminCookie = adminCookieFor(scenario.troupeId, "sub-ref-r05-http")
        openDrawEvent(adminCookie, scenario, "sub-ref-r05-http")

        mockMvc
            .perform(
                post("/v1/seasons/${scenario.seasonId}/events/${scenario.event.id}/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `MANDATORY policy rejects formulaId outside allowed set on HTTP draw with 403`() {
        val setup =
            mapper.createObjectNode().apply {
                putArray("troupeFormulas").apply {
                    add(mapper.createObjectNode().put("id", "f1").put("status", "PUBLISHED"))
                    add(mapper.createObjectNode().put("id", "f2").put("status", "PUBLISHED"))
                }
                putObject("troupePolicy").apply {
                    put("scope", "TROUPE")
                    putObject("defaultRule").apply {
                        put("mode", "MANDATORY")
                        put("mandatoryFormulaId", "f1")
                    }
                    putArray("categoryRules")
                }
                putObject("event").putNull("category")
            }
        val scenario = policyGoldenTestSupport.buildScenario(setup)
        val otherFormula = scenario.formulaIds.getValue("f2")
        val adminCookie = adminCookieFor(scenario.troupeId, "sub-mandatory-mismatch")
        openDrawEvent(adminCookie, scenario, "sub-mandatory-mismatch")

        mockMvc
            .perform(
                post("/v1/seasons/${scenario.seasonId}/events/${scenario.event.id}/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full","formulaId":"$otherFormula"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    private fun drawStepChancePercent(
        steps: JsonNode,
        participantId: UUID,
    ): Int {
        val step =
            (0 until steps.size())
                .map { steps.get(it) }
                .first { it.path("roleKey").asText() == "player" && it.path("slotIndex").asInt() == 0 }
        return (0 until step.path("candidates").size())
            .map { step.path("candidates").get(it) }
            .first { it.path("participantId").asText() == participantId.toString() }
            .path("chancePercent")
            .asInt()
    }

    private fun choicePolicySetup(): JsonNode =
        mapper.createObjectNode().apply {
            putObject("troupePolicy").apply {
                put("scope", "TROUPE")
                putObject("defaultRule").apply {
                    put("mode", "CHOICE")
                    putArray("allowedFormulaIds").add("f1").add("f2")
                }
                putArray("categoryRules")
            }
            putObject("event").putNull("category")
        }

    private fun enrichRefR12Setup(setup: JsonNode): JsonNode =
        mapper.createObjectNode().apply {
            set<JsonNode>(
                "troupeFormulas",
                if (setup.path("troupeFormulas").isArray && setup.path("troupeFormulas").size() > 0) {
                    setup.path("troupeFormulas")
                } else {
                    mapper.createArrayNode().apply {
                        add(
                            mapper.createObjectNode()
                                .put("id", "f1")
                                .put("status", "PUBLISHED")
                                .put("factorConfigRef", "REF-F02"),
                        )
                        add(
                            mapper.createObjectNode()
                                .put("id", "f2")
                                .put("status", "PUBLISHED")
                                .put("factorConfigRef", "REF-F06"),
                        )
                    }
                },
            )
            put("selectedFormulaId", "f2")
            if (setup.has("factorConfigRef")) {
                put("factorConfigRef", setup.path("factorConfigRef").asText())
            } else {
                put("factorConfigRef", "REF-F06")
            }
            set<JsonNode>("troupePolicy", setup.path("troupePolicy"))
            putNull("seasonPolicy")
            set<JsonNode>("event", setup.path("event"))
        }

    private fun adminCookieFor(
        troupeId: UUID,
        googleSub: String,
    ): Cookie =
        PolicyAuthTestSupport.adminCookie(
            mockMvc,
            googleIdTokenService,
            troupeId,
            troupeRepository,
            membershipRepository,
            userRepository,
            googleSub,
        )

    private fun openDrawEvent(
        adminCookie: Cookie,
        scenario: PolicyGoldenTestSupport.Scenario,
        adminSub: String,
    ) {
        EventTestSupport.openEventAvailability(mockMvc, adminCookie, scenario.seasonId, scenario.event.id)
        val adminUserId = userRepository.findByGoogleSub(adminSub)!!.id
        val veteranId = createParticipant(scenario.seasonId, "draw-veteran-${UUID.randomUUID()}")
        val rookieId = createParticipant(scenario.seasonId, "draw-rookie-${UUID.randomUUID()}")
        setAvailability(scenario.event, veteranId, adminUserId)
        setAvailability(scenario.event, rookieId, adminUserId)
    }

    private fun createParticipant(
        seasonId: UUID,
        label: String,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            ).id
    }

    private fun createPublishedFormula(
        troupeId: UUID,
        name: String,
    ): UUID {
        val now = Instant.now()
        return drawFormulaRepository
            .save(
                DrawFormulaEntity(
                    troupeId = troupeId,
                    name = name,
                    status = DrawFormulaStatus.PUBLISHED,
                    factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                    createdAt = now,
                    updatedAt = now,
                ),
            ).id
    }

    private fun seedPastValidatedSelection(
        scenario: PolicyGoldenTestSupport.Scenario,
        adminUserId: UUID,
        veteranId: UUID,
        rookieId: UUID,
    ) {
        val now = Instant.now()
        val season = seasonRepository.findById(scenario.seasonId).orElseThrow()
        val pastEvent =
            eventRepository.save(
                EventEntity(
                    id = UUID.randomUUID(),
                    season = season,
                    title = "Past validated",
                    slug = "past-validated-${UUID.randomUUID()}",
                    startsAt = now.minusSeconds(86400),
                    roleSlots = mapOf("player" to 1),
                    category = null,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        setAvailability(pastEvent, veteranId, adminUserId)
        setAvailability(pastEvent, rookieId, adminUserId)
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = pastEvent.id,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = veteranId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
        compositionRepository.save(
            EventCompositionEntity(
                eventId = pastEvent.id,
                validatedAt = now.minusSeconds(3600),
                publishedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private fun setAvailability(
        event: EventEntity,
        participantId: UUID,
        recordedByUserId: UUID,
    ) {
        val participant = seasonParticipantRepository.findById(participantId).orElseThrow()
        val row =
            availabilityRepository.findByEvent_IdAndSeasonParticipant_Id(event.id, participantId)
                ?: EventAvailabilityEntity(
                    event = event,
                    seasonParticipant = participant,
                    status = StoredAvailabilityStatus.AVAILABLE,
                    roleKeys = listOf("player"),
                    recordedByUserId = recordedByUserId,
                )
        row.status = StoredAvailabilityStatus.AVAILABLE
        row.roleKeys = listOf("player")
        row.updatedAt = Instant.now()
        availabilityRepository.save(row)
    }

    private fun chancePercentFor(
        nodes: JsonNode,
        participantId: UUID,
        roleKey: String? = null,
    ): Int {
        val container =
            if (roleKey != null) {
                (0 until nodes.size())
                    .map { nodes.get(it) }
                    .first { it.path("roleKey").asText() == roleKey }
                    .path("candidates")
            } else {
                nodes
            }
        return (0 until container.size())
            .map { container.get(it) }
            .first { it.path("participantId").asText() == participantId.toString() }
            .path("chancePercent")
            .asInt()
    }
}
