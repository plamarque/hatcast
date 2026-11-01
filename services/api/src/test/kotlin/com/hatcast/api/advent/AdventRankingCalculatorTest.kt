package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class AdventRankingCalculatorTest {
    private val one = UUID.randomUUID()
    private val two = UUID.randomUUID()
    private val three = UUID.randomUUID()
    private val four = UUID.randomUUID()
    private val excluded = UUID.randomUUID()
    private val members = listOf(
        RankingMember(one, "Alex"), RankingMember(two, "Camille"),
        RankingMember(three, "Lou"), RankingMember(four, "Sam"),
        RankingMember(excluded, "Compte exclu"),
    )
    private fun answer(user: UUID, day: Int, correct: Boolean) =
        RankingAnswer(user, day, correct, Instant.parse("2026-12-%02dT23:00:00Z".format(day)))

    @Test fun `ties get the last position and zero members remain visible`() {
        val rows = listOf(answer(one, 1, true), answer(two, 1, false), answer(three, 1, false))
        val result = AdventRankingCalculator.calculate(two, members, rows, null, setOf(excluded))
        assertEquals(listOf(1, 3, 3, 4), result.entries.map { it.rank })
        assertEquals(listOf(11, 1, 1, 0), result.entries.map { it.score })
        assertEquals(3, result.rank)
        assertEquals(4, AdventRankingCalculator.calculate(four, members, emptyList(), null, setOf(excluded)).rank)
    }

    @Test fun `excluded member keeps score but has no rank`() {
        val result = AdventRankingCalculator.calculate(excluded, members, listOf(answer(excluded, 1, true)), null, setOf(excluded))
        assertEquals(11, result.score)
        assertNull(result.rank)
        assertEquals(4, result.entries.size)
        assertFalse(result.entries.any { it.mine })
    }

    @Test fun `cutoff prevents pending scores and midnight reveals day 24`() {
        val rows = listOf(answer(one, 24, true))
        val boundary = Instant.parse("2026-12-24T23:00:00Z")
        assertEquals(0, AdventRankingCalculator.calculate(one, members, rows, boundary.minusNanos(1), setOf(excluded)).score)
        assertEquals(11, AdventRankingCalculator.calculate(one, members, rows, boundary, setOf(excluded)).score)
        assertEquals(11, AdventRankingCalculator.calculate(one, members, rows, null, setOf(excluded)).score)
    }

    @Test fun `missed days do not reset streak, wrong answer does, groups do not overlap`() {
        val rows = listOf(answer(one, 1, true), answer(one, 3, true), answer(one, 4, true),
            answer(one, 5, true), answer(one, 6, true), answer(one, 7, true), answer(one, 8, false),
            answer(one, 9, true), answer(one, 10, true), answer(one, 11, true))
        assertEquals(106, AdventRankingCalculator.calculate(one, members, rows, null, setOf(excluded)).score)
    }
    @Test fun `actual member access opens and closes at Paris midnight`() {
        assertFalse(AdventParisTime.memberAccessOpen(Instant.parse("2026-11-30T22:59:59Z")))
        assertTrue(AdventParisTime.memberAccessOpen(Instant.parse("2026-11-30T23:00:00Z")))
        assertTrue(AdventParisTime.memberAccessOpen(Instant.parse("2027-01-15T22:59:59Z")))
        assertFalse(AdventParisTime.memberAccessOpen(Instant.parse("2027-01-15T23:00:00Z")))
    }
}
