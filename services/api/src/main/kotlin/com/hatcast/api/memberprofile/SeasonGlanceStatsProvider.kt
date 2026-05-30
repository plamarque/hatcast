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
import java.text.Collator
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
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
            val slots = slotsByEvent[event.id].orEmpty()
            val declines = declinesByEvent[event.id].orEmpty()
            val locked = isCompositionLockedForStats(composition, slots)

            if (
                participantIds.any { pid ->
                    effectiveAvailability(
                        event = event,
                        participantId = pid,
                        participants = participants,
                        locked = locked,
                        slots = slots,
                        declines = declines,
                        availabilityIndex = availabilityIndex,
                    )
                }
            ) {
                timesAvailable++
            }

            if (locked) {
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
                    count = participations,
                    percent = selectionPercent,
                    tooltip =
                        "Sélections non déclinées\n" +
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

        val startsAtByEventId = events.associate { it.id to it.startsAt }
        val blocksByMonth = mutableMapOf<String, MutableList<MemberProfileChartBlockDto>>()
        for (event in eventsInChartOrder(events)) {
            val composition = compositions[event.id]
            val slots = slotsByEvent[event.id].orEmpty()
            val declines = declinesByEvent[event.id].orEmpty()
            val locked = isCompositionLockedForStats(composition, slots)
            val monthKey = event.startsAt.atZone(ZONE).format(MONTH_FORMAT)

            val block =
                participantIds.firstNotNullOfOrNull { pid ->
                    chartBlockForEvent(
                        event = event,
                        participantId = pid,
                        participants = participants,
                        locked = locked,
                        slots = slots,
                        declines = declines,
                        availabilityIndex = availabilityIndex,
                    )
                } ?: neutralChartBlock(event)

            blocksByMonth.getOrPut(monthKey) { mutableListOf() }.add(block)
        }

        return blocksByMonth.entries
            .sortedWith(
                compareBy<Map.Entry<String, MutableList<MemberProfileChartBlockDto>>> { (monthKey, _) ->
                    schoolYearMonthDisplayIndex(monthKey)
                }.thenBy { it.key },
            ).map { (monthKey, blocks) ->
                MemberProfileMonthDto(
                    monthKey = monthKey,
                    blocks = chartBlocksInDisplayOrder(blocks, startsAtByEventId),
                )
            }
    }

    /** V1 `GridBoard.vue` `allEvents` — timestamp ascending, then French title (`sensitivity: base`). */
    private fun eventsInChartOrder(events: List<EventEntity>): List<EventEntity> =
        events.sortedWith(
            compareBy<EventEntity> { it.startsAt }
                .thenComparator { a, b -> FRENCH_COLLATOR.compare(a.title, b.title) },
        )

    /** V1 `getMonthlyActivityWithDetails` — full datetime ascending within each month column. */
    private fun chartBlocksInDisplayOrder(
        blocks: List<MemberProfileChartBlockDto>,
        startsAtByEventId: Map<UUID, Instant>,
    ): List<MemberProfileChartBlockDto> =
        blocks.sortedWith(
            compareBy<MemberProfileChartBlockDto> { startsAtByEventId[it.eventId] ?: Instant.MAX }
                .thenComparator { a, b -> FRENCH_COLLATOR.compare(a.eventTitle, b.eventTitle) },
        )

    /**
     * V1 `PlayerModal.vue` `reorderedMonthlyData` — column order Sept→Aug (calendar month only).
     * `monthKey` is `yyyy-MM` in Europe/Paris; year breaks ties when the same month appears twice.
     */
    private fun schoolYearMonthDisplayIndex(monthKey: String): Int {
        val parts = monthKey.split("-")
        if (parts.size != 2) {
            return Int.MAX_VALUE
        }
        val year = parts[0].toIntOrNull() ?: return Int.MAX_VALUE
        val month = parts[1].toIntOrNull() ?: return Int.MAX_VALUE
        val displayIndex = if (month >= 9) month - 9 else month + 3
        return displayIndex * 10_000 + year
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
            val composition = compositions[event.id]
            val slots = slotsByEvent[event.id].orEmpty()
            if (!isCompositionLockedForStats(composition, slots)) {
                continue
            }
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

    /**
     * V1 `cast.confirmed` parity for stats (`GridBoard.vue` uses confirmed, not status).
     * Fallback on assigned slots covers legacy loads before MIG-3 sets `validated_at` on
     * incomplete-but-confirmed casts (e.g. understaffed Match Cambo).
     */
    private fun isCompositionLockedForStats(
        composition: EventCompositionEntity?,
        slots: List<EventCompositionSlotEntity>,
    ): Boolean =
        composition?.validatedAt != null ||
            slots.any { it.assignedParticipantId() != null }

    private fun effectiveAvailability(
        event: EventEntity,
        participantId: UUID,
        participants: List<SeasonParticipantEntity>,
        locked: Boolean,
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        availabilityIndex: GlanceAvailabilityIndex,
    ): Boolean {
        val participant = participants.firstOrNull { it.id == participantId } ?: return false
        val availability = availabilityIndex.forParticipant(event.id, participant)
        if (availability?.status == StoredAvailabilityStatus.AVAILABLE) {
            return true
        }
        if (locked && hasSlottedInitialSelection(slots, declines, participantId)) {
            return true
        }
        return false
    }

    /** V1 `countAllInitialSelections` — slot assignment or decline-only (migrated `cast.declined` without `cast.roles`). */
    private fun hasInitialSelection(
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean =
        hasSlottedInitialSelection(slots, declines, participantId) ||
            hasDeclineOnlyInitialSelection(declines, participantId)

    /** Active slot assignment; used for effective availability (V1 `countEffectiveAvailability`). */
    private fun hasSlottedInitialSelection(
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean =
        slots.any { slot ->
            slot.assignedParticipantId() == participantId &&
                slot.participationStatus != SlotParticipationStatus.DECLINED &&
                !isDeclined(declines, participantId, slot.roleKey)
        }

    private fun hasDeclineOnlyInitialSelection(
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean =
        declines.any { row ->
            row.seasonParticipantId == participantId || row.eventParticipantId == participantId
        }

    /** V1 `countFinalParticipations` — active slot unless the player appears in any decline at the event. */
    private fun hasFinalParticipation(
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean {
        if (hasParticipantDeclineAtEvent(declines, participantId)) {
            return false
        }
        return hasSlottedInitialSelection(slots, declines, participantId)
    }

    private fun hasParticipantDeclineAtEvent(
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
    ): Boolean = hasDeclineOnlyInitialSelection(declines, participantId)

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
        locked: Boolean,
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
        availabilityIndex: GlanceAvailabilityIndex,
    ): MemberProfileChartBlockDto? {
        val meta = chartBlockEventMeta(event)
        if (locked) {
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
            val declineOnly =
                declines.firstOrNull { row ->
                    row.seasonParticipantId == participantId || row.eventParticipantId == participantId
                }
            if (declineOnly != null) {
                return MemberProfileChartBlockDto(
                    eventId = event.id,
                    status = "declined",
                    eventTitle = meta.title,
                    eventDate = meta.date,
                    roleKey = declineOnly.roleKey,
                )
            }
            val selectedSlot =
                slots.firstOrNull { slot ->
                    slot.assignedParticipantId() == participantId &&
                        slot.participationStatus != SlotParticipationStatus.DECLINED &&
                        !isDeclined(declines, participantId, slot.roleKey)
                }
            if (selectedSlot != null) {
                return MemberProfileChartBlockDto(
                    eventId = event.id,
                    status = chartStatusForSlottedRole(selectedSlot),
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

    private fun chartStatusForSlottedRole(slot: EventCompositionSlotEntity): String =
        when (slot.participationStatus) {
            SlotParticipationStatus.PENDING -> "pending"
            SlotParticipationStatus.DECLINED -> "declined"
            SlotParticipationStatus.CONFIRMED -> "selected"
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
        private val FRENCH_COLLATOR: Collator =
            Collator.getInstance(Locale.FRENCH).apply {
                strength = Collator.PRIMARY
            }
    }
}
