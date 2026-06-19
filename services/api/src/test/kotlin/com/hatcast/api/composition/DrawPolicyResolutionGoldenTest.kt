package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.hatcast.api.draw.DrawPolicyResolutionService
import com.hatcast.api.draw.DrawPolicySource
import com.hatcast.api.draw.DrawRuleMode
import com.hatcast.api.draw.DrawRuleSource
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
@Tag("19.18")
@Tag("REF-R")
class DrawPolicyResolutionGoldenTest {
    @Autowired
    private lateinit var drawPolicyResolutionService: DrawPolicyResolutionService

    @Autowired
    private lateinit var policyGoldenTestSupport: PolicyGoldenTestSupport

    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    @Transactional
    fun policyResolutionGolden(fixtureId: String) {
        val fixture =
            PolicyGoldenTestSupport.loadResolutionFixtures().first { it.path("id").asText() == fixtureId }
        val scenario = policyGoldenTestSupport.buildScenario(fixture.path("setup"))
        val expected = fixture.path("expected")

        if (expected.has("drawWithoutFormulaId")) {
            val drawExpected = expected.path("drawWithoutFormulaId")
            assertTrue(drawExpected.path("rejected").asBoolean())
            val ex =
                org.junit.jupiter.api.assertThrows<ResponseStatusException> {
                    drawPolicyResolutionService.resolveForEvent(
                        scenario.event,
                        requestedFormulaId = null,
                        validateForDraw = true,
                    )
                }
            assertEquals(drawExpected.path("httpStatus").asInt(), ex.statusCode.value())
            return
        }

        val selectedFormulaId =
            fixture.path("setup").path("selectedFormulaId").takeIf { !it.isMissingNode && !it.isNull }?.asText()
        val requestedId =
            selectedFormulaId?.let {
                policyGoldenTestSupport.resolveFormulaRef(it, scenario.formulaIds, scenario.troupeId)
            }

        val resolved =
            drawPolicyResolutionService.resolveForEvent(
                scenario.event,
                requestedFormulaId = requestedId,
                validateForDraw = false,
            )

        if (expected.has("policySource")) {
            assertEquals(
                DrawPolicySource.valueOf(expected.path("policySource").asText()),
                resolved.policySource,
            )
        }
        if (expected.has("resolvedMode")) {
            assertEquals(DrawRuleMode.valueOf(expected.path("resolvedMode").asText()), resolved.resolvedMode)
        }
        if (expected.has("resolvedRuleSource")) {
            assertEquals(
                DrawRuleSource.valueOf(expected.path("resolvedRuleSource").asText().uppercase()),
                resolved.resolvedRuleSource,
            )
        }
        if (expected.has("selectorVisible")) {
            assertEquals(expected.path("selectorVisible").asBoolean(), resolved.selectorVisible)
        }
        if (expected.has("requiresFormulaIdOnDraw")) {
            assertEquals(expected.path("requiresFormulaIdOnDraw").asBoolean(), resolved.requiresFormulaIdOnDraw)
        }
        assertAllowedFormulaIds(expected, scenario, resolved.allowedFormulaIds)
        assertEffectiveFormulaId(expected, scenario, resolved.effectiveFormulaId)

        if (expected.path("disposPercentMatchesDrawWeights").asBoolean(false) ||
            expected.path("explainabilityUsesSamePipeline").asBoolean(false)
        ) {
            // Full HTTP parity (draw vs summary vs chance-breakdown) — DrawPolicyDrawHttpIntegrationTest REF-R12
            assertFalse(resolved.pipeline.factors.isEmpty())
            requestedId?.let {
                assertEquals(it, resolved.effectiveFormulaId, "Selected formula must drive pipeline")
            }
            return
        }

        if (expected.path("drawSucceeds").asBoolean(false)) {
            assertFalse(resolved.pipeline.factors.isEmpty())
        }
        if (expected.path("fallbackApplied").asBoolean(false)) {
            val systemId =
                com.hatcast.api.draw.DrawFormulaIds.systemV1(scenario.troupeId)
            assertEquals(systemId, resolved.effectiveFormulaId)
        }
    }

    private fun assertAllowedFormulaIds(
        expected: JsonNode,
        scenario: PolicyGoldenTestSupport.Scenario,
        actual: List<UUID>,
    ) {
        when {
            expected.has("allowedFormulaIds") ->
                expected.path("allowedFormulaIds").forEach { ref ->
                    val id = policyGoldenTestSupport.resolveFormulaRef(ref.asText(), scenario.formulaIds, scenario.troupeId)
                    assertTrue(actual.contains(id), "Missing allowed formula $ref")
                }
            expected.has("allowedFormulaIdsIncludes") ->
                expected.path("allowedFormulaIdsIncludes").forEach { ref ->
                    val id = policyGoldenTestSupport.resolveFormulaRef(ref.asText(), scenario.formulaIds, scenario.troupeId)
                    assertTrue(actual.contains(id), "Missing included formula $ref")
                }
        }
    }

    private fun assertEffectiveFormulaId(
        expected: JsonNode,
        scenario: PolicyGoldenTestSupport.Scenario,
        actual: UUID,
    ) {
        val refNode = expected.path("effectiveFormulaId")
        if (!refNode.isMissingNode && !refNode.isNull) {
            val expectedId =
                policyGoldenTestSupport.resolveFormulaRef(refNode.asText(), scenario.formulaIds, scenario.troupeId)
            assertEquals(expectedId, actual)
        }
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<String> =
            listOf(
                "REF-R01",
                "REF-R02",
                "REF-R03",
                "REF-R04",
                "REF-R05",
                "REF-R06",
                "REF-R07",
                "REF-R08",
                "REF-R09",
                "REF-R10",
                "REF-R11",
                "REF-R12",
            )
    }
}
