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
    @Test fun `final cascade decides tied scores and preserves current ties`() {
        fun rows(id: UUID, bits: String, time: Instant) = bits.mapIndexed { index, bit ->
            RankingAnswer(id, index + 1, bit == '1', Instant.parse("2027-01-01T00:00:00Z"), time)
        }
        fun compare(a: String, b: String, reason: AdventTieReason, winner: UUID = one, timeA: Instant = Instant.parse("2026-12-01T00:00:00Z"), timeB: Instant = timeA) {
            val group = listOf(RankingMember(one, "Alex"), RankingMember(two, "Camille"))
            val answers = rows(one, a, timeA) + rows(two, b, timeB)
            val current = AdventRankingCalculator.calculate(one, group, answers, null, emptySet())
            assertEquals(listOf(2, 2), current.entries.map { it.rank })
            assertTrue(current.entries.all { it.tieReason == null })
            val final = AdventRankingCalculator.calculate(one, group, answers, null, emptySet(), true)
            assertEquals(listOf(1, 2), final.entries.map { it.rank })
            assertEquals(reason, final.entries.first().tieReason)
            assertEquals(winner == one, final.entries.first().mine)
        }
        compare("001000001000000010110", "100111110", AdventTieReason.CORRECT, winner = two)
        compare("1000011", "11100", AdventTieReason.ANSWERS)
        compare("11010010111111", "11100110110111", AdventTieReason.STREAK)
        compare("11", "11", AdventTieReason.ATTAINMENT, timeB = Instant.parse("2026-12-02T00:00:00Z"))
        compare("11", "11", AdventTieReason.NAME)
        val duplicate = listOf(RankingMember(two, "Alex"), RankingMember(one, "Alex"))
        val final = AdventRankingCalculator.calculate(one, duplicate, rows(one, "1", Instant.EPOCH) + rows(two, "1", Instant.EPOCH), null, emptySet(), true)
        assertEquals(AdventTieReason.ID, final.entries.first().tieReason)
        assertEquals(minOf(one, two) == one, final.entries.first().mine)
    }

    @Test fun `third place reason considers fourth player`() {
        val group = listOf(RankingMember(one, "Alex"), RankingMember(two, "Camille"), RankingMember(three, "Lou"), RankingMember(four, "Sam"))
        val rows = listOf(answer(one, 1, true), answer(two, 1, true), answer(two, 2, true), answer(three, 1, false), answer(four, 1, false))
        val board = AdventRankingCalculator.calculate(one, group, rows, null, emptySet(), true)
        assertEquals(listOf(1, 2, 3, 4), board.entries.map { it.rank })
        assertEquals(AdventTieReason.NAME, board.entries[2].tieReason)
    }
    @Test fun `unrevealed answers cannot influence final ordering or reasons`() {
        val time = Instant.parse("2026-12-24T23:00:00Z")
        val group = listOf(RankingMember(one, "Alex"), RankingMember(two, "Camille"))
        val rows = listOf(RankingAnswer(one, 24, true, time, Instant.EPOCH), RankingAnswer(two, 24, true, time.plusSeconds(1), Instant.EPOCH))
        val board = AdventRankingCalculator.calculate(one, group, rows, time, emptySet(), true)
        assertEquals(listOf(11, 0), board.entries.map { it.score })
        assertTrue(board.entries.all { it.tieReason == null })
    }
    @Test fun `attainment time uses last contributing response even when simulated days arrive out of order`() {
        val reveal = Instant.parse("2027-01-01T00:00:00Z")
        val early = Instant.parse("2026-12-01T00:00:00Z")
        val middle = early.plusSeconds(10)
        val late = early.plusSeconds(20)
        val group = listOf(RankingMember(one, "Alex"), RankingMember(two, "Camille"))
        val rows = listOf(RankingAnswer(one, 1, true, reveal, late), RankingAnswer(one, 2, true, reveal, early), RankingAnswer(two, 1, true, reveal, middle), RankingAnswer(two, 2, true, reveal, middle))
        val board = AdventRankingCalculator.calculate(one, group, rows, null, emptySet(), true)
        assertEquals("Camille", board.entries.first().name)
        assertEquals(AdventTieReason.ATTAINMENT, board.entries.first().tieReason)
    }
    @Test fun `final alphabetical order uses French accents and ignores case before UUID`() {
        val members = listOf(RankingMember(one, "Élodie"), RankingMember(two, "Zoe"), RankingMember(three, "elodie"), RankingMember(four, "ELODIE"))
        val answers = members.map { answer(it.id, 1, true) }
        val entries = AdventRankingCalculator.calculate(one, members, answers, null, emptySet(), true).entries
        assertEquals("Zoe", entries.last().name)
        assertEquals("Élodie", entries[2].name)
        assertEquals(if (three < four) "elodie" else "ELODIE", entries.first().name)
        assertEquals(AdventTieReason.ID, entries.first().tieReason)
    }
}
