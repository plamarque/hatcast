package com.hatcast.api.event

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.composition.CompositionVisibilityRules
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.event.dto.ParticipantFocusSummaryDto
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class EventParticipantFocusService(
    private val slotRepository: EventCompositionSlotRepository,
    private val compositionRepository: EventCompositionRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val eventOrganizerRepository: EventOrganizerRepository,
    private val troupeAccess: TroupeAccessService,
) {
    companion object {
        private val ROLE_DISPLAY_ORDER =
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
    fun resolveFocusParticipantId(
        seasonId: UUID,
        requestedParticipantId: UUID?,
        principal: SessionUserPrincipal,
    ): UUID? {
        if (requestedParticipantId != null) {
            return requestedParticipantId
        }
        return seasonParticipantRepository
            .findActiveForSeasonLinkedToUser(seasonId, ParticipantStatus.ACTIVE, principal.userId)
            .firstOrNull()
            ?.id
    }

    @Transactional(readOnly = true)
    fun summariesByEventIds(
        season: SeasonEntity,
        eventIds: Collection<UUID>,
        focusParticipantId: UUID,
        availabilityByEvent: Map<UUID, String>,
        principal: SessionUserPrincipal,
    ): Map<UUID, ParticipantFocusSummaryDto> {
        if (eventIds.isEmpty()) {
            return emptyMap()
        }
        val compositions = compositionRepository.findByEventIdIn(eventIds).associateBy { it.eventId }
        val slotsByEvent = slotRepository.findByEventIdIn(eventIds).groupBy { it.eventId }
        val canManageByEvent = resolveCanManageComposition(eventIds, season, principal)
        return eventIds.associateWith { eventId ->
            val availability =
                availabilityByEvent[eventId] ?: AvailabilityStatusMapper.UNKNOWN
            val composition = compositions[eventId]
            val canViewSlots =
                CompositionVisibilityRules.canViewSlotAssignments(
                    composition,
                    canManageByEvent[eventId] == true,
                )
            val matchingSlot =
                if (canViewSlots) {
                    pickPrimarySlot(
                        slotsByEvent[eventId].orEmpty(),
                        focusParticipantId,
                    )
                } else {
                    null
                }
            val inTeam =
                matchingSlot != null &&
                    matchingSlot.hasAssignee() &&
                    matchingSlot.participationStatus != SlotParticipationStatus.DECLINED
            ParticipantFocusSummaryDto(
                availabilityStatus = availability,
                compositionRoleKey = matchingSlot?.roleKey,
                inTeam = inTeam,
            )
        }
    }

    private fun pickPrimarySlot(
        slots: List<EventCompositionSlotEntity>,
        focusParticipantId: UUID,
    ): EventCompositionSlotEntity? {
        val matching =
            slots.filter { slot ->
                slot.assignedParticipantId() == focusParticipantId &&
                    slot.participationStatus != SlotParticipationStatus.DECLINED &&
                    slot.hasAssignee()
            }
        if (matching.isEmpty()) {
            return null
        }
        for (roleKey in ROLE_DISPLAY_ORDER) {
            val roleSlots = matching.filter { it.roleKey == roleKey }.sortedBy { it.slotIndex }
            val confirmed = roleSlots.firstOrNull { it.participationStatus == SlotParticipationStatus.CONFIRMED }
            if (confirmed != null) {
                return confirmed
            }
            if (roleSlots.isNotEmpty()) {
                return roleSlots.first()
            }
        }
        return matching.minByOrNull { it.slotIndex }
    }

    private fun resolveCanManageComposition(
        eventIds: Collection<UUID>,
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ): Map<UUID, Boolean> {
        val troupeAdmin = troupeAccess.isTroupeAdmin(principal, season.troupe.id)
        val seasonOrganizer = organizerAccess.isSeasonOrganizer(season.id, principal)
        val eventOrganizerIds =
            if (troupeAdmin || seasonOrganizer) {
                eventIds.toSet()
            } else {
                eventOrganizerRepository
                    .findByEvent_IdInAndUser_Id(eventIds, principal.userId)
                    .map { it.event.id }
                    .toSet()
            }
        return eventIds.associateWith { eventId ->
            troupeAdmin || seasonOrganizer || eventId in eventOrganizerIds
        }
    }
}
