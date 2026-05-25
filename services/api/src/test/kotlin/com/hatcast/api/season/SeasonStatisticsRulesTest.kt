package com.hatcast.api.season

import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.RoleTemplates
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.UUID

class SeasonStatisticsRulesTest {
    private fun event(
        templateType: String,
        equityTag: String? = null,
        roleSlots: Map<String, Int> = mapOf("player" to 6),
    ): EventEntity {
        val entity = mock<EventEntity>()
        whenever(entity.templateType).thenReturn(templateType)
        whenever(entity.equityTag).thenReturn(equityTag)
        whenever(entity.roleSlots).thenReturn(roleSlots)
        return entity
    }

    @Test
    fun `stat percent uses max effective dispos and selections`() {
        assertEquals(29, SeasonStatisticsRules.statPercent(2, 7, 0))
        assertEquals(100, SeasonStatisticsRules.statPercent(3, 2, 0))
        assertNull(SeasonStatisticsRules.statPercent(0, 0, 0))
    }

    @Test
    fun `effective dispos subtracts declines`() {
        assertEquals(5, SeasonStatisticsRules.effectiveDispos(7, 2))
        assertEquals(0, SeasonStatisticsRules.effectiveDispos(1, 3))
    }

    @Test
    fun `format stat export value matches V1 pattern`() {
        assertEquals("2/7 (29%)", SeasonStatisticsRules.formatStatExportValue(2, 7, 0))
        assertEquals("", SeasonStatisticsRules.formatStatExportValue(0, 0, 0))
        assertEquals("3", SeasonStatisticsRules.formatStatExportValue(3, 0, 0))
    }

    @Test
    fun `is deplacement event uses equity tag or template type`() {
        assertTrue(SeasonStatisticsRules.isDeplacementEvent(event("deplacement")))
        assertTrue(SeasonStatisticsRules.isDeplacementEvent(event("match", equityTag = "deplacements")))
        assertFalse(SeasonStatisticsRules.isDeplacementEvent(event("match")))
    }

    @Test
    fun `event matches column for jeu and deplacement`() {
        val localMatch = event("match")
        val depl = event("deplacement")
        assertTrue(SeasonStatisticsRules.eventMatchesColumn(localMatch, "jeuMatch"))
        assertFalse(SeasonStatisticsRules.eventMatchesColumn(depl, "jeuMatch"))
        assertTrue(SeasonStatisticsRules.eventMatchesColumn(depl, "deplacementJeu"))
        assertFalse(SeasonStatisticsRules.eventMatchesColumn(localMatch, "deplacementJeu"))
    }

    @Test
    fun `stat tooltip mentions declines when present`() {
        assertEquals("Aucune dispo dans cette catégorie", SeasonStatisticsRules.statTooltip(0, 0, 0))
        assertTrue(SeasonStatisticsRules.statTooltip(1, 4, 2).contains("désistement"))
    }

    @Test
    fun `month summary counts participations dispos and declines per validated event`() {
        val participantId = UUID.randomUUID()
        val bucket = StatCountBucket()
        val ev =
            event(
                "match",
                roleSlots = RoleTemplates.normalize(mapOf("player" to 6, "mc" to 1)),
            )
        val slot =
            mock<EventCompositionSlotEntity>().also {
                whenever(it.assignedParticipantId()).thenReturn(participantId)
                whenever(it.roleKey).thenReturn("player")
                whenever(it.participationStatus).thenReturn(SlotParticipationStatus.CONFIRMED)
            }
        val decline = mock<EventCompositionDeclineEntity>().also {
            whenever(it.seasonParticipantId).thenReturn(participantId)
            whenever(it.eventParticipantId).thenReturn(null)
            whenever(it.roleKey).thenReturn("mc")
        }

        SeasonStatisticsRules.accumulateMonthEventSummary(
            bucket = bucket,
            validated = true,
            participantId = participantId,
            slots = listOf(slot),
            declines = listOf(decline),
            event = ev,
            availableRoleKeys = listOf("player", "mc"),
        )

        assertEquals(1, bucket.selections)
        assertEquals(1, bucket.dispos)
        assertEquals(1, bucket.declines)
    }

    @Test
    fun `month summary skips non validated events`() {
        val bucket = StatCountBucket()
        SeasonStatisticsRules.accumulateMonthEventSummary(
            bucket = bucket,
            validated = false,
            participantId = UUID.randomUUID(),
            slots = emptyList(),
            declines = emptyList(),
            event = event("match"),
            availableRoleKeys = listOf("player"),
        )
        assertEquals(0, bucket.selections)
        assertEquals(0, bucket.dispos)
        assertEquals(0, bucket.declines)
    }
}
