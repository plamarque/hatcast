package com.hatcast.api.composition

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class CompositionVisibilityRulesTest {
  private val eventId = UUID.randomUUID()

  private fun composition(
    publishedAt: Instant? = null,
    validatedAt: Instant? = null,
  ): EventCompositionEntity =
    EventCompositionEntity(
      eventId = eventId,
      publishedAt = publishedAt,
      validatedAt = validatedAt,
    )

  @Test
  fun `member cannot view unpublished draft slots`() {
    assertFalse(CompositionVisibilityRules.canViewSlotAssignments(composition(), canManageComposition = false))
    assertEquals(
      CompositionVisibility.NONE,
      CompositionVisibilityRules.resolveVisibility(composition(), canManageComposition = false, hasAssignedSlots = true),
    )
  }

  @Test
  fun `organizer can view unpublished draft slots`() {
    assertTrue(CompositionVisibilityRules.canViewSlotAssignments(composition(), canManageComposition = true))
    assertEquals(
      CompositionVisibility.ORGANIZER_DRAFT,
      CompositionVisibilityRules.resolveVisibility(composition(), canManageComposition = true, hasAssignedSlots = true),
    )
  }

  @Test
  fun `member can view published draft slots`() {
    val published = composition(publishedAt = Instant.parse("2026-01-01T00:00:00Z"))
    assertTrue(CompositionVisibilityRules.canViewSlotAssignments(published, canManageComposition = false))
    assertEquals(
      CompositionVisibility.PUBLISHED_DRAFT,
      CompositionVisibilityRules.resolveVisibility(published, canManageComposition = false, hasAssignedSlots = true),
    )
  }

  @Test
  fun `any member can view validated composition slots`() {
    val validated = composition(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
    assertTrue(CompositionVisibilityRules.canViewSlotAssignments(validated, canManageComposition = false))
    assertEquals(
      CompositionVisibility.VALIDATED,
      CompositionVisibilityRules.resolveVisibility(validated, canManageComposition = false, hasAssignedSlots = true),
    )
  }

  @Test
  fun `validated takes priority over published draft visibility`() {
    val both =
      composition(
        publishedAt = Instant.parse("2026-01-01T00:00:00Z"),
        validatedAt = Instant.parse("2026-01-02T00:00:00Z"),
      )
    assertEquals(
      CompositionVisibility.VALIDATED,
      CompositionVisibilityRules.resolveVisibility(both, canManageComposition = false, hasAssignedSlots = true),
    )
  }

  @Test
  fun `no assigned slots yields none visibility`() {
    assertEquals(
      CompositionVisibility.NONE,
      CompositionVisibilityRules.resolveVisibility(composition(), canManageComposition = true, hasAssignedSlots = false),
    )
  }
}
