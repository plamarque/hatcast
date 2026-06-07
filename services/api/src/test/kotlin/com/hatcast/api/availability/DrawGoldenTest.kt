package com.hatcast.api.availability

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.util.UUID
import kotlin.math.abs
import kotlin.math.round
import kotlin.random.Random

class DrawGoldenTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun goldenFixture(fixture: DrawGoldenFixture) {
        when (fixture.function) {
            "weightForParticipant" -> assertWeightForParticipant(fixture)
            "scoreCandidates" -> assertScoreCandidates(fixture)
            "performWeightedDraw" -> assertPerformWeightedDraw(fixture)
            "performWeightedDrawRepeatable" -> assertPerformWeightedDrawRepeatable(fixture)
            "invariantWeightsMatchScores" -> assertInvariantWeightsMatchScores(fixture)
            "edgeCombined" -> assertEdgeCombined(fixture)
            "edge" -> assertEdge(fixture)
            else -> throw AssertionError("[${fixture.id}] Unknown function: ${fixture.function}")
        }
    }

    private fun assertWeightForParticipant(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val actual =
            AvailabilityChanceCalculator.weightForParticipant(
                input.get("pastSelectionCount").asInt(),
                input.get("requiredCount").asInt(),
            )
        val expected = fixture.expected.get("weight").asDouble()
        val decimalPlaces = fixture.expected.path("decimalPlaces").asInt(0)
        if (decimalPlaces > 0) {
            val scale = Math.pow(10.0, decimalPlaces.toDouble())
            assertEquals(
                round(expected * scale) / scale,
                round(actual * scale) / scale,
                DOUBLE_EPSILON,
                "[${fixture.id}] weightForParticipant mismatch",
            )
        } else {
            assertDoubleExact(fixture.id, expected, actual, "weightForParticipant")
        }
    }

    private fun assertScoreCandidates(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val requiredCount = input.get("requiredCount").asInt()
        val candidates = DrawGoldenFixtureLoader.parseCandidates(input)
        val past = DrawGoldenFixtureLoader.parsePastMap(input)
        val scored = AvailabilityChanceCalculator.scoreCandidates(candidates, requiredCount, past)
        val expected = fixture.expected
        val tolerance = fixture.tolerancePercent
        var asserted = false

        expected.get("chancePercentsSorted")?.let { node ->
            asserted = true
            val expectedSorted = node.map { it.asInt() }.sortedDescending()
            val actualSorted = scored.map { it.chancePercent }.sortedDescending()
            assertPercentList(fixture.id, expectedSorted, actualSorted, tolerance)
        }

        expected.get("chancePercentsByKey")?.let { node ->
            asserted = true
            node.fields().forEach { (key, value) ->
                val participantId = DrawGoldenFixtureLoader.participantId(key)
                val actualPercent =
                    scored.firstOrNull { it.participantId == participantId }?.chancePercent
                        ?: throw AssertionError("[$fixture.id] Missing scored candidate for key $key")
                assertPercent(fixture.id, value.asInt(), actualPercent, tolerance)
            }
        }

        expected.get("allChancePercent")?.let { node ->
            asserted = true
            val expectedPercent = node.asInt()
            val expectedCount = expected.path("candidateCount").asInt(scored.size)
            assertEquals(expectedCount, scored.size, "[${fixture.id}] candidate count")
            scored.forEach { candidate ->
                assertPercent(fixture.id, expectedPercent, candidate.chancePercent, tolerance)
            }
        }

        expected.get("higherChanceKey")?.let { node ->
            asserted = true
            val higherKey = node.asText()
            val higherId = DrawGoldenFixtureLoader.participantId(higherKey)
            val higher = scored.first { it.participantId == higherId }
            val others = scored.filter { it.participantId != higherId }
            assertTrue(
                others.all { higher.chancePercent > it.chancePercent },
                "[${fixture.id}] $higherKey should have highest chance",
            )
        }

        expected.get("chancePercentsOrdered")?.let { node ->
            asserted = true
            val expectedOrdered = node.map { it.asInt() }
            val actualOrdered = scored.map { it.chancePercent }
            assertEquals(expectedOrdered, actualOrdered, "[${fixture.id}] ordered chancePercents")
        }

        if (expected.path("strictlyDescending").asBoolean(false)) {
            asserted = true
            for (index in 0 until scored.size - 1) {
                assertTrue(
                    scored[index].chancePercent > scored[index + 1].chancePercent,
                    "[${fixture.id}] not strictly descending at index $index",
                )
            }
        }

        assertTrue(
            asserted,
            "[${fixture.id}] expected block has no recognized keys for scoreCandidates",
        )
    }

    private fun assertPerformWeightedDraw(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val seed = input.get("seed").asLong()
        val weighted = DrawGoldenFixtureLoader.parseWeightedCandidates(input)
        val result = AvailabilityChanceCalculator.performWeightedDraw(weighted, Random(seed))
        assertNotNull(result, "[${fixture.id}] performWeightedDraw returned null")
        val expected = fixture.expected
        val selectedIndex =
            weighted.indexOfFirst { it.participantId == result!!.selected.participantId }
        assertEquals(
            expected.get("selectedIndex").asInt(),
            selectedIndex,
            "[${fixture.id}] selectedIndex",
        )
        expected.path("totalWeight").takeIf { !it.isMissingNode }?.let { node ->
            assertDoubleExact(fixture.id, node.asDouble(), result!!.totalWeight, "totalWeight")
        }
        expected.path("randomValue").takeIf { !it.isMissingNode }?.let { node ->
            assertDoubleExact(fixture.id, node.asDouble(), result!!.randomValue, "randomValue")
        }
    }

    private fun assertPerformWeightedDrawRepeatable(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val seed = input.get("seed").asLong()
        val repeatCount = input.get("repeatCount").asInt()
        val weighted = DrawGoldenFixtureLoader.parseWeightedCandidates(input)
        val indices =
            (1..repeatCount).map {
                val result =
                    AvailabilityChanceCalculator.performWeightedDraw(weighted, Random(seed))
                assertNotNull(result, "[${fixture.id}] run $it returned null")
                weighted.indexOfFirst { candidate -> candidate.participantId == result!!.selected.participantId }
            }
        assertTrue(indices.all { it == indices.first() }, "[${fixture.id}] runs were not identical")
        assertEquals(
            fixture.expected.get("selectedIndex").asInt(),
            indices.first(),
            "[${fixture.id}] selectedIndex",
        )
    }

    private fun assertInvariantWeightsMatchScores(fixture: DrawGoldenFixture) {
        val input = fixture.input
        val requiredCount = input.get("requiredCount").asInt()
        val candidates = DrawGoldenFixtureLoader.parseCandidates(input)
        val past = DrawGoldenFixtureLoader.parsePastMap(input)
        val weighted = AvailabilityChanceCalculator.toWeightedCandidates(candidates, requiredCount, past)
        val scored = AvailabilityChanceCalculator.scoreCandidates(candidates, requiredCount, past)
        weighted.forEach { weightedCandidate ->
            val scoredCandidate =
                scored.firstOrNull { it.participantId == weightedCandidate.participantId }
                    ?: throw AssertionError("[${fixture.id}] missing scored row for ${weightedCandidate.displayName}")
            assertDoubleExact(
                fixture.id,
                weightedCandidate.weight,
                scoredCandidate.weight,
                "weight for ${weightedCandidate.displayName}",
            )
            val expectedPercent =
                round(
                    AvailabilityChanceCalculator.exactSelectionProbability(
                        requiredCount,
                        weighted,
                        weighted.indexOfFirst { it.participantId == weightedCandidate.participantId },
                    ) * 100.0,
                ).toInt()
            assertEquals(
                expectedPercent,
                scoredCandidate.chancePercent,
                "[${fixture.id}] chancePercent for ${weightedCandidate.displayName}",
            )
        }
    }

    private fun assertEdgeCombined(fixture: DrawGoldenFixture) {
        val expected = fixture.expected
        val emptyScore = AvailabilityChanceCalculator.scoreCandidates(emptyList(), 1)
        assertEquals(expected.get("emptyScoreSize").asInt(), emptyScore.size, "[${fixture.id}] emptyScoreSize")
        assertNull(
            AvailabilityChanceCalculator.performWeightedDraw(emptyList(), Random(1)),
            "[${fixture.id}] emptyDrawNull",
        )
        val zeroId = UUID.randomUUID()
        val zeroScore =
            AvailabilityChanceCalculator.scoreCandidates(
                listOf(AvailabilityChanceCalculator.Candidate(zeroId, "Zero", null)),
                0,
            )
        // Zero weight via requiredCount=0 path
        val zeroWeighted =
            listOf(
                AvailabilityChanceCalculator.WeightedCandidate(zeroId, "Zero", 0.0, 0),
            )
        assertEquals(
            expected.get("zeroWeightPercent").asInt(),
            zeroScore.first().chancePercent,
            "[${fixture.id}] zeroWeightPercent",
        )
        assertNull(
            AvailabilityChanceCalculator.performWeightedDraw(zeroWeighted, Random(1)),
            "[${fixture.id}] zeroWeightDrawNull",
        )
    }

    private fun assertEdge(fixture: DrawGoldenFixture) {
        when (fixture.input.get("case").asText()) {
            "empty" -> {
                assertNull(
                    AvailabilityChanceCalculator.performWeightedDraw(emptyList(), Random(1)),
                    "[${fixture.id}] drawNull",
                )
                assertEquals(
                    fixture.expected.get("scoreSize").asInt(),
                    AvailabilityChanceCalculator.scoreCandidates(emptyList(), 1).size,
                    "[${fixture.id}] scoreSize",
                )
            }
            "zeroWeight" -> {
                val id = UUID.randomUUID()
                val weighted =
                    listOf(
                        AvailabilityChanceCalculator.WeightedCandidate(id, "Zero", 0.0, 0),
                    )
                assertNull(
                    AvailabilityChanceCalculator.performWeightedDraw(weighted, Random(1)),
                    "[${fixture.id}] drawNull",
                )
                val scored =
                    AvailabilityChanceCalculator.scoreCandidates(
                        listOf(AvailabilityChanceCalculator.Candidate(id, "Zero", null)),
                        0,
                    )
                assertEquals(
                    fixture.expected.get("chancePercent").asInt(),
                    scored.first().chancePercent,
                    "[${fixture.id}] chancePercent",
                )
            }
            else -> throw AssertionError("[${fixture.id}] Unknown edge case")
        }
    }

    private fun assertPercentList(
        id: String,
        expected: List<Int>,
        actual: List<Int>,
        tolerance: Int,
    ) {
        assertEquals(expected.size, actual.size, "[$id] list size")
        expected.zip(actual).forEach { (exp, act) -> assertPercent(id, exp, act, tolerance) }
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

        @JvmStatic
        fun fixtures(): List<DrawGoldenFixture> = DrawGoldenFixtureLoader.loadAll()
    }
}
