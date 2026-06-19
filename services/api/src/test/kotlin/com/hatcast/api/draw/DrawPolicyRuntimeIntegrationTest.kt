package com.hatcast.api.draw

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.PolicyGoldenTestSupport
import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.18")
@Tag("REF-V")
class DrawPolicyRuntimeIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var drawPolicyResolutionService: DrawPolicyResolutionService

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @Autowired
    private lateinit var drawFormulaSeedService: DrawFormulaSeedService

    @Autowired
    private lateinit var drawPolicyRepository: DrawPolicyRepository

    @Autowired
    private lateinit var troupeRepository: com.hatcast.api.troupe.TroupeRepository

    @Autowired
    private lateinit var policyGoldenTestSupport: PolicyGoldenTestSupport

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val mapper = ObjectMapper().registerModule(kotlinModule())

    @Test
    @Transactional
    fun `REF-V14 unknown category slug falls back to defaultRule at draw`() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "V14 Troupe",
                    slug = "v14-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        drawFormulaSeedService.ensureSystemFormula(troupe.id)
        val fDefault = createFormula(troupe.id, "f-default")
        val fMatch = createFormula(troupe.id, "f-match")
        drawPolicyRepository.save(
            DrawPolicyEntity(
                troupeId = troupe.id,
                seasonId = null,
                scope = DrawPolicyScope.TROUPE,
                troupeScopeKey = troupe.id,
                seasonScopeKey = null,
                defaultRule =
                    DrawDefaultRule(
                        mode = DrawRuleMode.CHOICE,
                        allowedFormulaIds = listOf(fDefault.toString()),
                    ),
                categoryRules =
                    listOf(
                        DrawCategoryRule(
                            category = "removed-cat",
                            mode = DrawRuleMode.MANDATORY,
                            mandatoryFormulaId = fMatch.toString(),
                        ),
                    ),
                updatedAt = now,
            ),
        )
        val resolved =
            drawPolicyResolutionService.resolveForEvent(
                eventFor(troupe, now, category = "removed-cat"),
                validateForDraw = false,
            )
        assertEquals(fDefault, resolved.effectiveFormulaId)
    }

    @Test
    @Transactional
    fun `REF-V15 archived mandatory formula falls back to system V1`() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "V15 Troupe",
                    slug = "v15-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        drawFormulaSeedService.ensureSystemFormula(troupe.id)
        val fGone =
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    troupeId = troupe.id,
                    name = "f-gone",
                    status = DrawFormulaStatus.ARCHIVED,
                    factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                    createdAt = now,
                    updatedAt = now,
                ),
            ).id
        drawPolicyRepository.save(
            DrawPolicyEntity(
                troupeId = troupe.id,
                seasonId = null,
                scope = DrawPolicyScope.TROUPE,
                troupeScopeKey = troupe.id,
                seasonScopeKey = null,
                defaultRule =
                    DrawDefaultRule(
                        mode = DrawRuleMode.MANDATORY,
                        mandatoryFormulaId = fGone.toString(),
                    ),
                categoryRules = emptyList(),
                updatedAt = now,
            ),
        )
        val resolved =
            drawPolicyResolutionService.resolveForEvent(
                eventFor(troupe, now, category = null),
                validateForDraw = false,
            )
        assertEquals(DrawFormulaIds.systemV1(troupe.id), resolved.effectiveFormulaId)
    }

    @Test
    @Transactional
    fun `REF-V13 rejects formulaId outside allowed set with 403`() {
        val setup =
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
        val scenario = policyGoldenTestSupport.buildScenario(setup)
        val notAllowed = createFormula(scenario.troupeId, "f-not-allowed")
        val ex =
            org.junit.jupiter.api.assertThrows<ResponseStatusException> {
                drawPolicyResolutionService.resolveForEvent(
                    scenario.event,
                    requestedFormulaId = notAllowed,
                    validateForDraw = true,
                )
            }
        assertEquals(403, ex.statusCode.value())
    }

    private fun eventFor(
        troupe: com.hatcast.api.troupe.TroupeEntity,
        now: Instant,
        category: String?,
    ): EventEntity =
        EventEntity(
            id = UUID.randomUUID(),
            season =
                SeasonEntity(
                    id = UUID.randomUUID(),
                    troupe = troupe,
                    title = "S",
                    slug = "s-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            title = "E",
            slug = "e-${UUID.randomUUID()}",
            startsAt = now.plusSeconds(3600),
            roleSlots = mapOf("player" to 1),
            category = category,
            createdAt = now,
            updatedAt = now,
        )

    private fun createFormula(
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
}
