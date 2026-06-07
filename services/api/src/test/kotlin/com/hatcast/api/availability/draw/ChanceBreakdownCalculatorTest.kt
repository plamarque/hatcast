package com.hatcast.api.availability.draw

import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.user.MemberGender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class ChanceBreakdownCalculatorTest {
  private val alice = UUID.fromString("00000000-0000-0000-0000-000000000001")
  private val bob = UUID.fromString("00000000-0000-0000-0000-000000000002")
  private val carol = UUID.fromString("00000000-0000-0000-0000-000000000003")

  private fun candidate(id: UUID, name: String) =
      AvailabilityChanceCalculator.Candidate(id, name, null)

  @Test
  fun `reference and chance diverge when veteran has past participation malus`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 3)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = bob,
            roleKey = "player",
        )
    requireNotNull(result)
    assertTrue(result.referencePercent > result.chancePercent)
    assertEquals(1, result.adjustments.size)
    assertEquals(PastParticipationFactor.FACTOR_ID, result.adjustments.first().factorId)
    assertTrue(result.adjustments.first().deltaPoints < 0)
    assertEquals(
        result.chancePercent - result.referencePercent,
        result.adjustments.sumOf { it.deltaPoints },
    )
  }

  @Test
  fun `rookie with no past gets Jamais label when adjustment line is positive`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 3)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = alice,
            roleKey = "mc",
        )
    requireNotNull(result)
    assertTrue(result.referencePercent < result.chancePercent)
    assertEquals(1, result.adjustments.size)
    assertEquals("Jamais MC", result.adjustments.first().label)
    assertTrue(result.adjustments.first().deltaPoints > 0)
  }

  @Test
  fun `veteran label uses gendered role without season wording`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 2)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = bob,
            roleKey = "player",
            targetParticipantGender = MemberGender.MALE,
        )
    requireNotNull(result)
    assertEquals("Déjà Comédien 2 fois", result.adjustments.first().label)
  }

  @Test
  fun `rookie alone in pool has no past participation adjustment line`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 0)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = alice,
            roleKey = "player",
        )
    requireNotNull(result)
    assertEquals(result.referencePercent, result.chancePercent)
    assertTrue(result.adjustments.isEmpty())
  }

  @Test
  fun `pool rank counts full pool not peers list only`() {
    val ids = (1..8).map { UUID.fromString("00000000-0000-0000-0000-${it.toString().padStart(12, '0')}") }
    val candidates = ids.map { id -> candidate(id, "P$id") }
    val target = ids[5]
    val past =
        ids.associateWith { id ->
          when (id) {
            in ids.take(5) -> 0
            else -> 3
          }
        }
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 5,
            pastSelectionCountByParticipant = past,
            targetParticipantId = target,
            roleKey = "player",
        )
    requireNotNull(result)
    assertEquals(8, result.scoredPool.size)
    assertEquals(5, result.aheadCount)
    assertEquals(6, result.poolRank)
    assertEquals(5, result.peers.size)
    assertEquals(3, result.tiedAtChanceCount)
  }

  @Test
  fun `peers lists only candidates with strictly higher chance`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
            candidate(carol, "Carol"),
        )
    val past = mapOf(alice to 0, bob to 0, carol to 5)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = carol,
            roleKey = "player",
        )
    requireNotNull(result)
    assertTrue(result.peers.all { it.chancePercent > result.chancePercent })
    assertTrue(result.peers.none { it.participantId == carol })
  }

  @Test
  fun `requiredCount greater than one includes multi-place scoring`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 2)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 2,
            pastSelectionCountByParticipant = past,
            targetParticipantId = bob,
            roleKey = "player",
        )
    requireNotNull(result)
    assertTrue(result.referencePercent >= 0)
    assertTrue(result.chancePercent >= 0)
  }

  @Test
  fun `golden REF-B1 veteran breakdown reference and past participation delta`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 3)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = bob,
            roleKey = "player",
        )
    requireNotNull(result)
    assertEquals(50, result.referencePercent)
    assertEquals(20, result.chancePercent)
    assertEquals(PastParticipationFactor.FACTOR_ID, result.adjustments.single().factorId)
    assertEquals(-30, result.adjustments.single().deltaPoints)
    assertEquals(
        result.chancePercent - result.referencePercent,
        result.adjustments.sumOf { it.deltaPoints },
    )
  }

  @Test
  fun `override chance percent preserves snapshot value and waterfall sum`() {
    val candidates =
        listOf(
            candidate(alice, "Alice"),
            candidate(bob, "Bob"),
        )
    val past = mapOf(alice to 0, bob to 2)
    val result =
        ChanceBreakdownCalculator.calculate(
            candidates = candidates,
            requiredCount = 1,
            pastSelectionCountByParticipant = past,
            targetParticipantId = bob,
            roleKey = "player",
            overrideChancePercent = 42,
        )
    requireNotNull(result)
    assertEquals(42, result.chancePercent)
    assertEquals(
        result.chancePercent - result.referencePercent,
        result.adjustments.sumOf { it.deltaPoints },
    )
  }
}
