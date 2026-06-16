package com.hatcast.api.availability

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.availability.draw.ImmediateReplayMode
import com.hatcast.api.availability.draw.LabeledDrawWeightFactor
import com.hatcast.api.draw.DrawFactorConfig
import com.hatcast.api.draw.DrawFactorConfigEntry
import com.hatcast.api.draw.DrawFormulaPipelineAssembler
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.time.Instant
import kotlin.math.abs
import kotlin.math.round

@Tag("19.17")
@Tag("REF-F")
@SpringBootTest
@ActiveProfiles("test")
class DrawFormulaPipelineGoldenTest {
    @Autowired
    private lateinit var assembler: DrawFormulaPipelineAssembler

    private val goldenFixtures = DrawGoldenFixtureLoader.loadAll()

    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun formulaPipelineGolden(fixture: FormulaPipelineFixture) {
        val factorConfig = parseFactorConfig(fixture.factorConfig)
        val pipeline = assembler.assemble(factorConfig)

        fixture.pipelineRef?.let { ref ->
            assertPipelineRef(fixture.id, ref, pipeline)
        }

        fixture.weightAssertions.forEach { assertion ->
            assertWeightAssertion(fixture.id, assertion, pipeline)
        }

        fixture.probabilityAssertions.forEach { assertion ->
            assertProbabilityAssertion(fixture.id, assertion, pipeline)
        }
    }

    private fun assertPipelineRef(
        fixtureId: String,
        ref: String,
        pipeline: DrawWeightPipeline,
    ) {
        val expected = resolvePipelineRef(ref)
        val expectedIds = expected.factors.map { (it as LabeledDrawWeightFactor).factorId }
        val actualIds = pipeline.factors.map { (it as LabeledDrawWeightFactor).factorId }
        assertEquals(expectedIds, actualIds, "[$fixtureId] pipelineRef $ref factor order")
    }

    private fun resolvePipelineRef(ref: String): DrawWeightPipeline =
        when {
            ref == "DrawWeightPipelines.DEFAULT" -> DrawWeightPipelines.DEFAULT
            ref.startsWith("DrawWeightPipelines.withImmediateReplay(") -> {
                val mode =
                    when {
                        ref.contains("EXCLUDE") -> ImmediateReplayMode.EXCLUDE
                        ref.contains("MALUS") -> ImmediateReplayMode.MALUS
                        else -> ImmediateReplayMode.OFF
                    }
                DrawWeightPipelines.withImmediateReplay(mode)
            }
            ref == "DrawWeightPipelines.withRoleRequest()" -> DrawWeightPipelines.withRoleRequest()
            else -> throw AssertionError("Unknown pipelineRef: $ref")
        }

    private fun assertWeightAssertion(
        fixtureId: String,
        assertion: WeightAssertion,
        pipeline: DrawWeightPipeline,
    ) {
        val weightFixture =
            goldenFixtures.firstOrNull { it.id == assertion.ref }
                ?: throw AssertionError("[$fixtureId] Missing weight fixture ${assertion.ref}")
        val input = weightFixture.input
        val actual =
            AvailabilityChanceCalculator.weightForParticipant(
                pastSelectionCount = input.get("pastSelectionCount").asInt(),
                requiredCount = input.get("requiredCount").asInt(),
                pipeline = pipeline,
            )
        val expected = weightFixture.expected.get("weight").asDouble()
        val decimalPlaces = weightFixture.expected.path("decimalPlaces").asInt(0)
        if (decimalPlaces > 0) {
            val scale = Math.pow(10.0, decimalPlaces.toDouble())
            assertEquals(
                round(expected * scale) / scale,
                round(actual * scale) / scale,
                0.0001,
                "[$fixtureId] weight ${assertion.ref}",
            )
        } else {
            assertEquals(expected, actual, 0.0001, "[$fixtureId] weight ${assertion.ref}")
        }
    }

    private fun assertProbabilityAssertion(
        fixtureId: String,
        assertion: ProbabilityAssertion,
        pipeline: DrawWeightPipeline,
    ) {
        val probFixture =
            goldenFixtures.firstOrNull { it.id == assertion.ref }
                ?: loadFixtureFromPath(assertion.source, assertion.ref)
        val input = probFixture.input
        val requiredCount = input.get("requiredCount").asInt()
        val roleKey = input.path("roleKey").asText("player")
        val candidates = DrawGoldenFixtureLoader.parseCandidates(input)
        val past = DrawGoldenFixtureLoader.parsePastMap(input)
        val replayMap = parseReplayMap(input)
        val predecessorTitle = input.path("immediatePredecessorTitle").asText(null)
        val predecessorStartsAt =
            input.path("immediatePredecessorStartsAt").asText(null)?.let(Instant::parse)
        val unfulfilledRoleRequestCount = parseUnfulfilledRoleRequestMap(input)
        val scored =
            AvailabilityChanceCalculator.scoreCandidates(
                candidates,
                requiredCount,
                past,
                roleKey = roleKey,
                pipeline = pipeline,
                playedSameRoleOnImmediatePredecessorByParticipant = replayMap,
                immediatePredecessorTitle = predecessorTitle,
                immediatePredecessorStartsAt = predecessorStartsAt,
                unfulfilledRoleRequestCountByParticipant = unfulfilledRoleRequestCount,
            )
        val expected = probFixture.expected
        expected.get("chancePercentsByKey")?.fields()?.forEach { (key, value) ->
            val participantId = DrawGoldenFixtureLoader.participantId(key)
            val actualPercent =
                scored.firstOrNull { it.participantId == participantId }?.chancePercent
                    ?: throw AssertionError("[$fixtureId] Missing scored candidate for key $key")
            assertPercent(fixtureId, value.asInt(), actualPercent, probFixture.tolerancePercent)
        }
        assertTrue(true, "[$fixtureId] probability ${assertion.ref} checked")
    }

    private fun loadFixtureFromPath(
        source: String,
        ref: String,
    ): DrawGoldenFixture {
        val mapper = ObjectMapper().registerModule(kotlinModule())
        val stream =
            requireNotNull(javaClass.classLoader.getResourceAsStream(source)) {
                "Missing fixture resource: $source"
            }
        val fixtures: List<DrawGoldenFixture> = mapper.readValue(stream)
        return fixtures.firstOrNull { it.id == ref }
            ?: throw AssertionError("Fixture $ref not found in $source")
    }

    private fun parseReplayMap(input: JsonNode): Map<java.util.UUID, Boolean> {
        val node = input.get("playedSameRoleOnImmediatePredecessorByParticipant") ?: return emptyMap()
        return node.fields().asSequence().associate { (key, value) ->
            DrawGoldenFixtureLoader.participantId(key) to value.asBoolean()
        }
    }

    private fun parseUnfulfilledRoleRequestMap(input: JsonNode): Map<java.util.UUID, Int> {
        val node = input.get("unfulfilledRoleRequestCountByParticipant") ?: return emptyMap()
        return node.fields().asSequence().associate { (key, value) ->
            DrawGoldenFixtureLoader.participantId(key) to value.asInt()
        }
    }

    private fun assertPercent(
        fixtureId: String,
        expected: Int,
        actual: Int,
        tolerancePercent: Int,
    ) {
        assertTrue(
            abs(expected - actual) <= tolerancePercent,
            "[$fixtureId] expected $expected% ±$tolerancePercent but was $actual%",
        )
    }

    private fun parseFactorConfig(node: JsonNode): DrawFactorConfig {
        val mapper = ObjectMapper().registerModule(kotlinModule())
        return mapper.readValue(node.toString())
    }

    data class FormulaPipelineFixture(
        val id: String,
        val factorConfig: JsonNode,
        val pipelineRef: String? = null,
        val weightAssertions: List<WeightAssertion> = emptyList(),
        val probabilityAssertions: List<ProbabilityAssertion> = emptyList(),
    )

    data class WeightAssertion(
        val ref: String,
        val source: String? = null,
    )

    data class ProbabilityAssertion(
        val ref: String,
        val source: String,
    )

    companion object {
        private val mapper = ObjectMapper().registerModule(kotlinModule())

        @JvmStatic
        fun fixtures(): List<FormulaPipelineFixture> {
            val stream =
                requireNotNull(
                    DrawFormulaPipelineGoldenTest::class.java.classLoader.getResourceAsStream(
                        "draw/golden/formulas/pipelines.json",
                    ),
                ) { "Missing pipelines.json" }
            val nodes: List<JsonNode> = mapper.readValue(stream)
            return nodes.map { node ->
                FormulaPipelineFixture(
                    id = node.get("id").asText(),
                    factorConfig = node.get("factorConfig"),
                    pipelineRef = node.path("pipelineRef").asText(null),
                    weightAssertions =
                        node.path("weightAssertions").map { wa ->
                            WeightAssertion(
                                ref = wa.get("ref").asText(),
                                source = wa.path("source").asText(null),
                            )
                        },
                    probabilityAssertions =
                        node.path("probabilityAssertions").map { pa ->
                            ProbabilityAssertion(
                                ref = pa.get("ref").asText(),
                                source = pa.get("source").asText(),
                            )
                        },
                )
            }
        }
    }
}
