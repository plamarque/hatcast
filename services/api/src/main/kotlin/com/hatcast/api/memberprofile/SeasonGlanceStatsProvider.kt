package com.hatcast.api.memberprofile

import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.memberprofile.dto.FavoriteRoleCountDto
import com.hatcast.api.memberprofile.dto.MemberProfileChartBlockDto
import com.hatcast.api.memberprofile.dto.MemberProfileMonthDto
import com.hatcast.api.memberprofile.dto.MemberProfileStatDto
import com.hatcast.api.memberprofile.dto.MemberProfileStatsDto
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Component
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * V1 `getPlayerStats` parity for member profile / season glance (Story 16.1).
 */
@Primary
@Component
class SeasonGlanceStatsProvider(
    private val eventRepository: EventRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val availabilityRepository: EventAvailabilityRepository,
) : MemberProfileStatsProvider {
    override fun loadStats(
        seasonId: UUID,
        userId: UUID,
    ): MemberProfileStatsDto? {
        val participants = participantsForUser(seasonId, userId)
        if (participants.isEmpty()) {
            return null
        }
        val participantIds = participants.map { it.id }.toSet()
        val events = eventRepository.findNonArchivedBySeasonId(seasonId)
        if (events.isEmpty()) {
            return null
        }
        val eventIds = events.map { it.id }
        val compositions = compositionRepository.findByEventIdIn(eventIds).associateBy { it.eventId }
        val slotsByEvent = slotRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val declinesByEvent = declineRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val availabilityIndex =
            GlanceAvailabilityIndex.from(availabilityRepository.findByEvent_IdIn(eventIds))

        val totalNonArchived = events.size
        var timesAvailable = 0
        var totalInitialSelections = 0
        var participations = 0

        for (event in events) {
            val composition = compositions[event.id]
            val validated = composition?.validatedAt != null
            val slots = slotsByEvent[event.id].orEmpty()
            val declines = declinesByEvent[event.id].orEmpty()

            if (
                participantIds.any { pid ->
                    effectiveAvailability(
                        event = event,
                        participantId = pid,
                        participants = participants,
                        validated = validated,
                        slots = slots,
                        availabilityIndex = availabilityIndex,
                    )
                }
            ) {
                timesAvailable++
            }

            if (validated) {
                if (
                    participantIds.any { pid ->
                        hasInitialSelection(slots, declines, pid)
                    }
                ) {
                    totalInitialSelections++
                }
                if (
                    participantIds.any { pid ->
                        hasFinalParticipation(slots, declines, pid)
                    }
                ) {
                    participations++
                }
            }
        }

        if (timesAvailable == 0 && totalInitialSelections == 0 && participations == 0) {
            return null
        }

        val declines = (totalInitialSelections - participations).coerceAtLeast(0)
        val availabilityPercent =
            if (totalNonArchived == 0) {
                0
            } else {
                Math.round(timesAvailable * 100.0 / totalNonArchived).toInt()
            }
        val selectionPercent =
            if (timesAvailable == 0) {
                0
            } else {
                Math.round(totalInitialSelections * 100.0 / timesAvailable).toInt()
            }
        val declinePercent =
            if (totalInitialSelections == 0) {
                0
            } else {
                Math.round(declines * 100.0 / totalInitialSelections).toInt()
            }

        return MemberProfileStatsDto(
            availabilities =
                MemberProfileStatDto(
                    count = timesAvailable,
                    percent = availabilityPercent,
                    tooltip =
                        "Taux = ($timesAvailable ÷ $totalNonArchived) × 100",
                ),
            selections =
                MemberProfileStatDto(
                    count = totalInitialSelections,
                    percent = selectionPercent,
                    tooltip =
                        "Taux = ($totalInitialSelections ÷ $timesAvailable) × 100",
                ),
            declines =
                MemberProfileStatDto(
                    count = declines,
                    percent = declinePercent,
                    tooltip =
                        "Taux = ($declines ÷ $totalInitialSelections) × 100",
                ),
        )
    }

    override fun loadMonthlyChart(
        seasonId: UUID,
        userId: UUID,
    ): List<MemberProfileMonthDto> {
        val participants = participantsForUser(seasonId, userId)
        if (participants.isEmpty()) {
            return emptyList()
        }
        val participantIds = participants.map { it.id }.toSet()
        val events = eventRepository.findNonArchivedBySeasonId(seasonId)
        if (events.isEmpty()) {
            return emptyList()
        }
        val eventIds = events.map { it.id }
        val compositions = compositionRepository.findByEventIdIn(eventIds).associateBy { it.eventId }
        val slotsByEvent = slotRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val declinesByEvent = declineRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val availabilityIndex =
            GlanceAvailabilityIndex.from(availabilityRepository.findByEvent_IdIn(eventIds))

        val blocksByMonth = mutableMapOf<String, MutableList<MemberProfileChartBlockDto>>()
        for (event in events.sortedBy { it.startsAt }) {
            val composition = compositions[event.id]
            val validated = composition?.validatedAt != null
            val slots = slotsByEvent[event.id].orEmpty()
            val declines = declinesByEvent[event.id].orEmpty()
            val monthKey = event.startsAt.atZone(ZONE).format(MONTH_FORMAT)

            val block =
                participantIds.firstNotNullOfOrNull { pid ->
                    chartBlockForEvent(
                        event = event,
                        participantId = pid,
                        participants = participants,
                        validated = validated,
                        slots = slots,
                        declines = declines,
                        availabilityIndex = availabilityIndex,
                    )
                } ?: neutralChartBlock(event)

            blocksByMonth.getOrPut(monthKey) { mutableListOf() }.add(block)
        }

        return blocksByMonth.entries.sortedBy { it.key }.map { (monthKey, blocks) ->
            MemberProfileMonthDto(monthKey = monthKey, blocks = blocks)
        }
    }

    override fun loadFavoriteRoleCounts(
        seasonId: UUID,
        userId: UUID,
    ): List<FavoriteRoleCountDto> {
        val participants = participantsForUser(seasonId, userId)
        if (participants.isEmpty()) {
            return emptyList()
        }
        val participantIds = participants.map { it.id }.toSet()
        val events = eventRepository.findNonArchivedBySeasonId(seasonId)
        val eventIds = events.map { it.id }
        val compositions = compositionRepository.findByEventIdIn(eventIds).associateBy { it.eventId }
        val slotsByEvent = slotRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val declinesByEvent = declineRepository.findByEventIdIn(eventIds).groupBy { it.eventId }

        val counts = mutableMapOf<String, Int>()
        for (event in events) {
            val composition = compositions[event.id] ?: continue
            if (composition.validatedAt == null) {
                continue
            }
            val slots = slotsByEvent[event.id].orEmpty()
            val declines = declinesByEvent[event.id].orEmpty()
            for (slot in slots) {
                val pid = slot.assignedParticipantId() ?: continue
                if (pid !in participantIds) {
                    continue
                }
                if (slot.participationStatus == SlotParticipationStatus.DECLINED) {
                    continue
                }
                if (isDeclined(declines, pid, slot.roleKey)) {
                    continue
                }
                counts[slot.roleKey] = (counts[slot.roleKey] ?: 0) + 1
            }
        }
        return counts.entries.sortedByDescending { it.value }.map { (roleKey, count) ->
            FavoriteRoleCountDto(roleKey = roleKey, count = count)
        }
    }

    private fun participantsForUser(
        seasonId: UUID,
        userId: UUID,
    ): List<SeasonParticipantEntity> =
        seasonParticipantRepository.findActiveForSeasonLinkedToUser(
            seasonId = seasonId,
            status = ParticipantStatus.ACTIVE,
            userId = userId,
        )

    private fun effectiveAvailability(
        event: EventEntity,
        participantId: UUID,
        participants: List<SeasonParticipantEntity>,
        validated: Boolean,
        slots: List<EventCompositionSlotEntity>,
        availabilityIndex: GlanceAvailabilityIndex,
    ): Boolean {
        val participant = participants.firstOrNull { it.id == participantId } ?: return false
        val availability = availabilityIndex.forParticipant(event.id, participant)
        if (availability?.status == StoredAvailabilityStatus.AVAILABLE) {
            return true
        }
        if (validated && hasInitialSelection(slots, emptyList(), participantId)) {
            return true
        }
        return false
    }

    private fun hasInitialSelection(
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean =
        slots.any { slot ->
            slot.assignedParticipantId() == participantId &&
                slot.participationStatus != SlotParticipationStatus.DECLINED &&
                !isDeclined(declines, participantId, slot.roleKey)
        }

    private fun hasFinalParticipation(
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean =
        slots.any { slot ->
            slot.assignedParticipantId() == participantId &&
                slot.participationStatus == SlotParticipationStatus.CONFIRMED &&
                !isDeclined(declines, participantId, slot.roleKey)
        }

    private fun isDeclined(
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
        roleKey: String,
    ): Boolean =
        declines.any { row ->
            (row.seasonParticipantId == participantId || row.eventParticipantId == participantId) &&
                row.roleKey == roleKey
        }

    private fun chartBlockForEvent(
        event: EventEntity,
        participantId: UUID,
        participants: List<SeasonParticipantEntity>,
        validated: Boolean,
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        availabilityIndex: GlanceAvailabilityIndex,
    ): MemberProfileChartBlockDto? {
        val meta = chartBlockEventMeta(event)
        if (validated) {
            val declinedSlot =
                slots.firstOrNull { slot ->
                    slot.assignedParticipantId() == participantId &&
                        (
                            slot.participationStatus == SlotParticipationStatus.DECLINED ||
                                isDeclined(declines, participantId, slot.roleKey)
                        )
                }
            if (declinedSlot != null) {
                return MemberProfileChartBlockDto(
                    eventId = event.id,
                    status = "declined",
                    eventTitle = meta.title,
                    eventDate = meta.date,
                    roleKey = declinedSlot.roleKey,
                )
            }
            val selectedSlot =
                slots.firstOrNull { slot ->
                    slot.assignedParticipantId() == participantId &&
                        slot.participationStatus != SlotParticipationStatus.DECLINED
                }
            if (selectedSlot != null) {
                return MemberProfileChartBlockDto(
                    eventId = event.id,
                    status = "available",
                    eventTitle = meta.title,
                    eventDate = meta.date,
                    roleKey = selectedSlot.roleKey,
                )
            }
        }
        val participant = participants.firstOrNull { it.id == participantId } ?: return null
        return when (availabilityIndex.forParticipant(event.id, participant)?.status) {
            StoredAvailabilityStatus.AVAILABLE ->
                MemberProfileChartBlockDto(
                    eventId = event.id,
                    status = "available",
                    eventTitle = meta.title,
                    eventDate = meta.date,
                )
            StoredAvailabilityStatus.UNAVAILABLE ->
                MemberProfileChartBlockDto(
                    eventId = event.id,
                    status = "unavailable",
                    eventTitle = meta.title,
                    eventDate = meta.date,
                )
            null -> null
        }
    }

    private fun neutralChartBlock(event: EventEntity): MemberProfileChartBlockDto {
        val meta = chartBlockEventMeta(event)
        return MemberProfileChartBlockDto(
            eventId = event.id,
            status = "neutral",
            eventTitle = meta.title,
            eventDate = meta.date,
        )
    }

    private fun chartBlockEventMeta(event: EventEntity): ChartBlockEventMeta =
        ChartBlockEventMeta(
            title = event.title,
            date = event.startsAt.atZone(ZONE).format(EVENT_DATE_FORMAT),
        )

    private data class ChartBlockEventMeta(
        val title: String,
        val date: String,
    )

    private class GlanceAvailabilityIndex(
        private val byEventAndUserId: Map<Pair<UUID, UUID>, EventAvailabilityEntity>,
        private val byEventAndSeasonParticipantId: Map<Pair<UUID, UUID>, EventAvailabilityEntity>,
    ) {
        fun forParticipant(
            eventId: UUID,
            participant: SeasonParticipantEntity,
        ): EventAvailabilityEntity? {
            val linkedUserId = participant.user?.id ?: participant.troupeMembership?.user?.id
            if (linkedUserId != null) {
                byEventAndUserId[eventId to linkedUserId]?.let { return it }
            }
            return byEventAndSeasonParticipantId[eventId to participant.id]
        }

        companion object {
            fun from(rows: List<EventAvailabilityEntity>): GlanceAvailabilityIndex {
                val byUser = mutableMapOf<Pair<UUID, UUID>, EventAvailabilityEntity>()
                val bySeason = mutableMapOf<Pair<UUID, UUID>, EventAvailabilityEntity>()
                for (row in rows) {
                    val eventId = row.event.id
                    row.user?.id?.let { byUser[eventId to it] = row }
                    row.seasonParticipant?.id?.let { bySeason[eventId to it] = row }
                }
                return GlanceAvailabilityIndex(byUser, bySeason)
            }
        }
    }

    companion object {
        private val ZONE: ZoneId = ZoneId.of("Europe/Paris")
        private val MONTH_FORMAT: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM")
        private val EVENT_DATE_FORMAT: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    }
}
