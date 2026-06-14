package com.hatcast.api.availability

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import kotlin.math.abs
import kotlin.math.round

class DrawCompartmentGoldenTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun compartmentGoldenFixture(fixture: DrawGoldenFixture) {
        when (fixture.function) {
            "weightForParticipant" -> assertWeightForParticipant(fixture)
            "scoreCandidates" -> assertScoreCandidates(fixture)
            else -> throw AssertionError("[${fixture.id}] Unknown function: ${fixture.function}")
        }
    }

    private fun assertWeightForParticipant(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val actual =
            AvailabilityChanceCalculator.weightForParticipant(
                input.get("pastSelectionCount").asInt(),
                input.get("requiredCount").asInt(),
                categorySlug = input.path("categorySlug").asText("principal"),
            )
        val expected = fixture.expected.get("weight").asDouble()
        assertDoubleExact(fixture.id, expected, actual, "weightForParticipant")
    }

    private fun assertScoreCandidates(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val requiredCount = input.get("requiredCount").asInt()
        val categorySlug = input.path("categorySlug").asText("principal")
        val candidates = DrawGoldenFixtureLoader.parseCandidates(input)
        val past = DrawGoldenFixtureLoader.parsePastMap(input)
        val unscopedPast = DrawGoldenFixtureLoader.parseUnscopedPastMap(input)
        val scored =
            AvailabilityChanceCalculator.scoreCandidates(
                candidates,
                requiredCount,
                past,
                categorySlug = categorySlug,
                pastSelectionCountUnscopedByParticipant = unscopedPast,
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
                    DrawCompartmentGoldenTest::class.java.classLoader.getResourceAsStream(
                        "draw/golden/compartment/principal-deplacements-aperock.json",
                    ),
                ) { "Missing compartment golden fixtures" }
            return mapper.readValue(stream)
        }
    }
}
