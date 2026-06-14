package com.hatcast.api.availability

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.availability.draw.ImmediateReplayMode
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.time.Instant
import kotlin.math.abs

@Tag("19.9")
class DrawImmediateReplayGoldenTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun immediateReplayGoldenFixture(fixture: DrawGoldenFixture) {
        when (fixture.function) {
            "weightForParticipant" -> assertWeightForParticipant(fixture)
            "scoreCandidates" -> assertScoreCandidates(fixture)
            else -> throw AssertionError("[${fixture.id}] Unknown function: ${fixture.function}")
        }
    }

    private fun pipelineFor(fixture: DrawGoldenFixture) =
        DrawWeightPipelines.withImmediateReplay(
            parseMode(fixture.input.path("immediateReplayMode").asText("EXCLUDE")),
        )

    private fun parseMode(raw: String): ImmediateReplayMode =
        when (raw.uppercase()) {
            "MALUS" -> ImmediateReplayMode.MALUS
            "OFF" -> ImmediateReplayMode.OFF
            else -> ImmediateReplayMode.EXCLUDE
        }

    private fun parseReplayMap(input: com.fasterxml.jackson.databind.JsonNode): Map<java.util.UUID, Boolean> {
        val node = input.get("playedSameRoleOnImmediatePredecessorByParticipant") ?: return emptyMap()
        return node.fields().asSequence().associate { (key, value) ->
            DrawGoldenFixtureLoader.participantId(key) to value.asBoolean()
        }
    }

    private fun assertWeightForParticipant(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val actual =
            AvailabilityChanceCalculator.weightForParticipant(
                input.get("pastSelectionCount").asInt(),
                input.get("requiredCount").asInt(),
                roleKey = input.path("roleKey").asText("player"),
                pipeline = pipelineFor(fixture),
                playedSameRoleOnImmediatePredecessor = input.path("playedSameRoleOnImmediatePredecessor").asBoolean(false),
            )
        val expected = fixture.expected.get("weight").asDouble()
        assertDoubleExact(fixture.id, expected, actual, "weightForParticipant")
    }

    private fun assertScoreCandidates(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val requiredCount = input.get("requiredCount").asInt()
        val roleKey = input.path("roleKey").asText("player")
        val candidates = DrawGoldenFixtureLoader.parseCandidates(input)
        val past = DrawGoldenFixtureLoader.parsePastMap(input)
        val replayMap = parseReplayMap(input)
        val predecessorTitle = input.path("immediatePredecessorTitle").asText(null)
        val predecessorStartsAt =
            input.path("immediatePredecessorStartsAt").asText(null)?.let(Instant::parse)
        val scored =
            AvailabilityChanceCalculator.scoreCandidates(
                candidates,
                requiredCount,
                past,
                roleKey = roleKey,
                pipeline = pipelineFor(fixture),
                playedSameRoleOnImmediatePredecessorByParticipant = replayMap,
                immediatePredecessorTitle = predecessorTitle,
                immediatePredecessorStartsAt = predecessorStartsAt,
            )
        val expected = fixture.expected
        val tolerance = fixture.tolerancePercent

        expected.get("chancePercentsByKey")?.let { node ->
            node.fields().forEach { (key, value) ->
                val participantId = DrawGoldenFixtureLoader.participantId(key)
                val actualPercent =
                    scored.firstOrNull { it.participantId == participantId }?.chancePercent
                        ?: throw AssertionError("[$fixture.id] Missing scored candidate for key $key")
                assertPercent(fixture.id, value.asInt(), actualPercent, tolerance)
            }
        } ?: throw AssertionError("[${fixture.id}] expected block missing chancePercentsByKey")
    }

    private fun assertPercent(
        id: String,
        expected: Int,
        actual: Int,
        tolerance: Int,
    ) {
        if (tolerance == 0) {
            assertEquals(expected, actual, "[$id] chancePercent")
        } else {
            assertTrue(
                abs(expected - actual) <= tolerance,
                "[$id] chancePercent expected $expected ±$tolerance but was $actual",
            )
        }
    }

    private fun assertDoubleExact(
        id: String,
        expected: Double,
        actual: Double,
        field: String,
    ) {
        assertTrue(
            abs(expected - actual) <= DOUBLE_EPSILON,
            "[$id] $field expected $expected but was $actual (epsilon $DOUBLE_EPSILON)",
        )
    }

    companion object {
        private const val DOUBLE_EPSILON = 1e-12
        private val mapper = ObjectMapper().registerModule(kotlinModule())

        @JvmStatic
        fun fixtures(): List<DrawGoldenFixture> {
            val stream =
                requireNotNull(
                    DrawImmediateReplayGoldenTest::class.java.classLoader.getResourceAsStream(
                        "draw/golden/immediate-replay/exclude-malus.json",
                    ),
                ) { "Missing immediate-replay golden fixtures" }
            return mapper.readValue(stream)
        }
    }
}
