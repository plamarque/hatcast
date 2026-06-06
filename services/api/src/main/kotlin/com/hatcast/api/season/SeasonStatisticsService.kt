package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
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
import com.hatcast.api.participant.ParticipantRowPresentation
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.role.RoleLabels
import com.hatcast.api.season.dto.ParticipantStatisticsRowDto
import com.hatcast.api.season.dto.SeasonStatisticsResponseDto
import com.hatcast.api.season.dto.StatCountsDto
import com.hatcast.api.season.dto.StatisticsEventCellDto
import com.hatcast.api.season.dto.StatisticsEventDto
import com.hatcast.api.season.dto.StatisticsParticipantDto
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.UUID

@Service
class SeasonStatisticsService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val troupeAccess: TroupeAccessService,
    private val userRepository: UserRepository,
) {
    companion object {
        private val STATS_ZONE: ZoneId = ZoneId.of("Europe/Paris")
        private val MONTH_FORMAT: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM")

        val ROLE_EXPORT_ABBREVIATIONS: Map<String, String> =
            mapOf(
                "player" to "J",
                "mc" to "MC",
                "dj" to "DJ",
                "referee" to "A",
                "assistant_referee" to "AA",
                "coach" to "C",
                "volunteer" to "B",
                "lighting" to "L",
                "stage_manager" to "R",
            )

        val ROLE_DISPLAY_ORDER =
            listOf(
                "player",
                "dj",
                "mc",
                "volunteer",
                "referee",
                "assistant_referee",
                "lighting",
                "coach",
                "stage_manager",
            )
    }

    @Transactional(readOnly = true)
    fun loadStatistics(
        seasonId: UUID,
        principal: SessionUserPrincipal,
        eventId: UUID? = null,
        participantId: UUID? = null,
        categories: List<String>? = null,
    ): SeasonStatisticsResponseDto {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)

        val allParticipants =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
                .sortedByFrenchDisplayName { it.displayName }
        val visibleParticipants =
            if (participantId != null) {
                allParticipants.filter { it.id == participantId }
            } else {
                allParticipants
            }

        var events = eventRepository.findNonArchivedBySeasonId(seasonId)
        val compartmentFilter = SeasonStatisticsCategoryFilter.parse(categories)
        events = events.filter { SeasonStatisticsCategoryFilter.matches(it, compartmentFilter) }
        if (eventId != null) {
            events = events.filter { it.id == eventId }
        }

        val eventIds = events.map { it.id }
        val compositions = compositionRepository.findByEventIdIn(eventIds).associateBy { it.eventId }
        val slotsByEvent = slotRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val declinesByEvent = declineRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val availabilityIndex =
            if (eventIds.isEmpty()) {
                StatisticsAvailabilityIndex.empty()
            } else {
                StatisticsAvailabilityIndex.from(availabilityRepository.findByEvent_IdIn(eventIds))
            }

        val monthKeys =
            events
                .map { monthKey(it) }
                .distinct()
                .sorted()

        val eventDtos =
            events.map { event ->
                StatisticsEventDto(
                    id = event.id,
                    title = event.title,
                    startsAt = event.startsAt.toString(),
                    templateType = event.templateType,
                    category = event.category,
                    monthKey = monthKey(event),
                )
            }

        val rows =
            visibleParticipants.map { participant ->
                buildRow(
                    participant = participant,
                    events = events,
                    compositions = compositions,
                    slotsByEvent = slotsByEvent,
                    declinesByEvent = declinesByEvent,
                    availabilityIndex = availabilityIndex,
                )
            }

        return SeasonStatisticsResponseDto(
            participants =
                allParticipants.map {
                    StatisticsParticipantDto(it.id, it.displayName)
                },
            monthKeys = monthKeys,
            events = eventDtos,
            rows = rows,
        )
    }

    private fun buildRow(
        participant: SeasonParticipantEntity,
        events: List<EventEntity>,
        compositions: Map<UUID, EventCompositionEntity>,
        slotsByEvent: Map<UUID, List<EventCompositionSlotEntity>>,
        declinesByEvent: Map<UUID, List<EventCompositionDeclineEntity>>,
        availabilityIndex: StatisticsAvailabilityIndex,
    ): ParticipantStatisticsRowDto {
        val participantId = participant.id
        val displayName = participant.displayName
        val (userSlug, avatarUrl) = participantProfileIdentity(participant)
        val memberGender = ParticipantRowPresentation.effectiveGender(participant)
        val gender = memberGender.wireValue
        val annual = emptyCountsMap()
        val monthSummary = mutableMapOf<String, StatCountBucket>()
        val byMonth = mutableMapOf<String, MutableMap<String, StatCounts>>()
        val eventCells = mutableMapOf<UUID, String>()
        val eventCellDetails = mutableMapOf<UUID, StatisticsEventCellDto>()

        for (event in events) {
            val mk = monthKey(event)
            val monthBucket = byMonth.getOrPut(mk) { emptyCountsMap() }
            val monthSummaryBucket = monthSummary.getOrPut(mk) { StatCountBucket() }
            val composition = compositions[event.id]
            val validated = composition?.validatedAt != null
            val slots = slotsByEvent[event.id].orEmpty()
            val declines = declinesByEvent[event.id].orEmpty()
            val availability = availabilityIndex.forParticipant(event.id, participant)
            val availableRoleKeys =
                if (availability?.status == StoredAvailabilityStatus.AVAILABLE) {
                    availability.roleKeys
                } else {
                    emptyList()
                }
            val unavailable =
                availability?.status == StoredAvailabilityStatus.UNAVAILABLE

            if (validated) {
                for (columnKey in SeasonStatisticsRules.COLUMN_KEYS) {
                    if (!SeasonStatisticsRules.eventMatchesColumn(event, columnKey)) {
                        continue
                    }
                    if (SeasonStatisticsRules.isAvailableForColumn(availableRoleKeys, event, columnKey)) {
                        annual[columnKey]!!.dispos++
                        monthBucket[columnKey]!!.dispos++
                    }
                    val declineCount = countDeclinesForColumn(declines, participantId, columnKey)
                    if (declineCount > 0) {
                        annual[columnKey]!!.declines += declineCount
                        monthBucket[columnKey]!!.declines += declineCount
                    }
                }
            }

            val selectionSlot = if (validated) findSelectionSlot(slots, participantId, declines) else null
            if (selectionSlot != null) {
                bumpSelections(annual, event, selectionSlot.roleKey)
                bumpSelections(monthBucket, event, selectionSlot.roleKey)
            }

            SeasonStatisticsRules.accumulateMonthEventSummary(
                bucket = monthSummaryBucket,
                validated = validated,
                participantId = participantId,
                slots = slots,
                declines = declines,
                event = event,
                availableRoleKeys = availableRoleKeys,
            )

            val cell =
                buildEventCell(
                    event = event,
                    validated = validated,
                    declines = declines,
                    participantId = participantId,
                    availableRoleKeys = availableRoleKeys,
                    unavailable = unavailable,
                    selectionSlot = selectionSlot,
                    gender = memberGender,
                )
            eventCellDetails[event.id] = cell
            eventCells[event.id] = eventCellExportLabel(cell)
        }

        return ParticipantStatisticsRowDto(
            participantId = participantId,
            displayName = displayName,
            userSlug = userSlug,
            avatarUrl = avatarUrl,
            gender = gender,
            annual = annual.mapValues { (_, c) -> StatCountsDto(c.selections, c.dispos, c.declines) },
            monthSummary = monthSummary.mapValues { (_, c) -> StatCountsDto(c.selections, c.dispos, c.declines) },
            byMonth =
                byMonth.mapValues { (_, cols) ->
                    cols.mapValues { (_, c) -> StatCountsDto(c.selections, c.dispos, c.declines) }
                },
            eventCells = eventCells,
            eventCellDetails = eventCellDetails,
        )
    }

    private fun participantProfileIdentity(participant: SeasonParticipantEntity): Pair<String?, String?> {
        val userId = resolveLinkedUserId(participant) ?: return null to null
        val user = userRepository.findById(userId).orElse(null) ?: return null to null
        if (user.deletedAt != null) {
            return null to null
        }
        val slug = user.slug?.trim()?.takeIf { it.isNotEmpty() } ?: return null to null
        val avatarUrl = AvatarService.publicAvatarUrl(user.id, user.avatarUpdatedAt)
        return slug to avatarUrl
    }

    private fun resolveLinkedUserId(participant: SeasonParticipantEntity): UUID? {
        participant.user?.id?.let { return it }
        return participant.troupeMembership?.user?.id
    }

    private fun linkedUser(participant: SeasonParticipantEntity): UserEntity? {
        val userId = resolveLinkedUserId(participant) ?: return null
        return userRepository.findById(userId).orElse(null)?.takeUnless { it.deletedAt != null }
    }

    private class StatCounts(
        var selections: Int = 0,
        var dispos: Int = 0,
        var declines: Int = 0,
    )

    private fun emptyCountsMap(): MutableMap<String, StatCounts> =
        SeasonStatisticsRules.COLUMN_KEYS.associateWith { StatCounts() }.toMutableMap()

    private fun bumpSelections(
        bucket: MutableMap<String, StatCounts>,
        event: EventEntity,
        roleKey: String,
    ) {
        val col = SeasonStatisticsRules.selectionColumnForRole(event, roleKey) ?: return
        bucket[col]?.selections = (bucket[col]?.selections ?: 0) + 1
        when (col) {
            "jeuMatch", "jeuCab", "jeuLong", "jeuAutre" ->
                bucket["totalJeu"]?.selections = (bucket["totalJeu"]?.selections ?: 0) + 1
            "mc", "dj", "referee", "assistantReferee", "coach" ->
                bucket["totalDecorum"]?.selections = (bucket["totalDecorum"]?.selections ?: 0) + 1
            "stageManager", "lighting", "volunteer" ->
                bucket["totalBenevole"]?.selections = (bucket["totalBenevole"]?.selections ?: 0) + 1
        }
    }

    private fun countDeclinesForColumn(
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
        columnKey: String,
    ): Int {
        val roles = SeasonStatisticsRules.rolesForColumn(columnKey)
        return declines.count { row ->
            (row.seasonParticipantId == participantId || row.eventParticipantId == participantId) &&
                roles.contains(row.roleKey)
        }
    }

    internal data class SelectionSlotInfo(
        val roleKey: String,
        val participationStatus: SlotParticipationStatus,
    )

    private fun findSelectionSlot(
        slots: List<EventCompositionSlotEntity>,
        participantId: UUID,
        declines: List<EventCompositionDeclineEntity>,
    ): SelectionSlotInfo? {
        val declinedRoles =
            declines
                .filter { it.seasonParticipantId == participantId || it.eventParticipantId == participantId }
                .map { it.roleKey }
                .toSet()
        for (slot in slots) {
            if (slot.assignedParticipantId() != participantId) {
                continue
            }
            if (slot.participationStatus == SlotParticipationStatus.DECLINED) {
                continue
            }
            if (declinedRoles.contains(slot.roleKey)) {
                continue
            }
            return SelectionSlotInfo(slot.roleKey, slot.participationStatus)
        }
        return null
    }

    internal fun buildEventCell(
        event: EventEntity,
        validated: Boolean,
        declines: List<EventCompositionDeclineEntity>,
        participantId: UUID,
        availableRoleKeys: List<String>,
        unavailable: Boolean,
        selectionSlot: SelectionSlotInfo?,
        gender: MemberGender = MemberGender.NON_SPECIFIED,
    ): StatisticsEventCellDto {
        val declinedRoles =
            declines
                .filter { it.seasonParticipantId == participantId || it.eventParticipantId == participantId }
                .map { it.roleKey }
        if (declinedRoles.isNotEmpty()) {
            val abbrevs =
                ROLE_DISPLAY_ORDER
                    .filter { declinedRoles.contains(it) }
                    .map { ROLE_EXPORT_ABBREVIATIONS[it] ?: it }
            val primaryRole = ROLE_DISPLAY_ORDER.firstOrNull { declinedRoles.contains(it) }
            val label = "Décliné (${abbrevs.joinToString(", ")})"
            return StatisticsEventCellDto(
                status = "declined",
                label = label,
                roleKey = primaryRole,
                tooltip = primaryRole?.let { "${RoleLabels.label(it, gender)} — Décliné" } ?: label,
            )
        }
        if (selectionSlot != null && validated) {
            val roleLabel = RoleLabels.label(selectionSlot.roleKey, gender)
            return when (selectionSlot.participationStatus) {
                SlotParticipationStatus.PENDING ->
                    StatisticsEventCellDto(
                        status = "pending",
                        label = roleLabel,
                        roleKey = selectionSlot.roleKey,
                        tooltip = "$roleLabel — En attente de confirmation",
                    )
                SlotParticipationStatus.CONFIRMED ->
                    StatisticsEventCellDto(
                        status = "selected",
                        label = roleLabel,
                        roleKey = selectionSlot.roleKey,
                        tooltip = roleLabel,
                    )
                SlotParticipationStatus.DECLINED ->
                    StatisticsEventCellDto(
                        status = "declined",
                        label = roleLabel,
                        roleKey = selectionSlot.roleKey,
                        tooltip = "$roleLabel — Décliné",
                    )
            }
        }
        if (availableRoleKeys.isNotEmpty()) {
            val abbrevs =
                ROLE_DISPLAY_ORDER
                    .filter { availableRoleKeys.contains(it) && SeasonStatisticsRules.eventHasRoleSlot(event, it) }
                    .map { ROLE_EXPORT_ABBREVIATIONS[it] ?: it }
            if (abbrevs.isNotEmpty()) {
                val label = "Dispo (${abbrevs.joinToString(", ")})"
                return StatisticsEventCellDto(
                    status = "available",
                    label = label,
                    tooltip = label,
                )
            }
        }
        if (unavailable) {
            return StatisticsEventCellDto(
                status = "unavailable",
                label = "Non dispo",
                tooltip = "Non dispo",
            )
        }
        return StatisticsEventCellDto(
            status = "neutral",
            label = "—",
        )
    }

    internal fun eventCellExportLabel(cell: StatisticsEventCellDto): String =
        if (cell.status == "neutral") {
            "-"
        } else {
            cell.label
        }

    private fun monthKey(event: EventEntity): String =
        event.startsAt.atZone(STATS_ZONE).format(MONTH_FORMAT)

    /**
     * Aligné sur [com.hatcast.api.availability.AvailabilityService] — les dispos sont souvent
     * enregistrées via `user_id` (membre lié), pas seulement `season_participant_id`.
     */
    private class StatisticsAvailabilityIndex(
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
            fun empty(): StatisticsAvailabilityIndex =
                StatisticsAvailabilityIndex(emptyMap(), emptyMap())

            fun from(rows: List<EventAvailabilityEntity>): StatisticsAvailabilityIndex {
                val byUser = mutableMapOf<Pair<UUID, UUID>, EventAvailabilityEntity>()
                val bySeason = mutableMapOf<Pair<UUID, UUID>, EventAvailabilityEntity>()
                for (row in rows) {
                    val eventId = row.event.id
                    row.user?.id?.let { byUser[eventId to it] = row }
                    row.seasonParticipant?.id?.let { bySeason[eventId to it] = row }
                }
                return StatisticsAvailabilityIndex(byUser, bySeason)
            }
        }
    }
}
