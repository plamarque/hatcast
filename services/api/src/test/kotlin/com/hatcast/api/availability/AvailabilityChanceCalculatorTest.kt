package com.hatcast.api.availability

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

class AvailabilityChanceCalculatorTest {
    private val alice = AvailabilityChanceCalculator.Candidate(UUID.randomUUID(), "Alice", null)
    private val bob = AvailabilityChanceCalculator.Candidate(UUID.randomUUID(), "Bob", null)
    private val carol = AvailabilityChanceCalculator.Candidate(UUID.randomUUID(), "Carol", null)

    @Test
    fun `empty candidates returns empty list`() {
        assertEquals(emptyList<AvailabilityChanceCalculator.ScoredCandidate>(), AvailabilityChanceCalculator.scoreCandidates(emptyList(), 1))
    }

    @Test
    fun `single candidate gets one hundred percent`() {
        val scored = AvailabilityChanceCalculator.scoreCandidates(listOf(alice), 2)
        assertEquals(1, scored.size)
        assertEquals(100, scored[0].chancePercent)
    }

    @Test
    fun `equal weights split percent when no history`() {
        val scored = AvailabilityChanceCalculator.scoreCandidates(listOf(alice, bob, carol), 1)
        assertEquals(listOf(33, 33, 33), scored.map { it.chancePercent }.sorted())
    }

    @Test
    fun `candidates are sorted by chance descending`() {
        val past = mapOf(alice.participantId to 2, bob.participantId to 0)
        val scored = AvailabilityChanceCalculator.scoreCandidates(listOf(alice, bob), 1, past)
        assertEquals(bob.participantId, scored[0].participantId)
        assert(scored[0].chancePercent > scored[1].chancePercent)
    }
}
