package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.isAvailabilityOpen
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CompositionLifecycleEnrichmentService(
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val lifecycleService: CompositionLifecycleService,
    private val organizerAccess: OrganizerAccessRules,
    private val eventOrganizerRepository: EventOrganizerRepository,
    private val troupeAccess: TroupeAccessService,
    private val eventRepository: EventRepository,
) {
    @Transactional(readOnly = true)
    fun loadViewsByEventIdsAcrossSeasons(
        eventIds: Collection<UUID>,
        principal: SessionUserPrincipal,
    ): Map<UUID, CompositionLifecycleView> {
        if (eventIds.isEmpty()) {
            return emptyMap()
        }
        val events = eventRepository.findAllById(eventIds.toSet())
        return events
            .groupBy { it.season.id }
            .flatMap { (_, seasonEvents) ->
                val season = seasonEvents.first().season
                loadViewsByEventIds(seasonEvents, season, principal).entries
            }.associate { it.key to it.value }
    }

    @Transactional(readOnly = true)
    fun loadViewsByEventIds(
        events: List<EventEntity>,
        season: SeasonEntity,
        principal: SessionUserPrincipal,
    ): Map<UUID, CompositionLifecycleView> {
        if (events.isEmpty()) {
            return emptyMap()
        }
        val eventIds = events.map { it.id }
        val compositions = compositionRepository.findByEventIdIn(eventIds).associateBy { it.eventId }
        val slotsByEvent =
            slotRepository
                .findByEventIdIn(eventIds)
                .groupBy { it.eventId }
        val canManageByEvent = resolveCanManageComposition(eventIds, season, principal)
        val draftVisibleForEvent =
            resolveDraftVisibility(eventIds, canManageByEvent, compositions)
        return events.associate { event ->
            val slots = slotsByEvent[event.id].orEmpty().map { it.toSnapshot() }
            val composition =
                compositions[event.id]?.let {
                    CompositionSnapshot(
                        validatedAt = it.validatedAt,
                        publishedAt = it.publishedAt,
                    )
                }
            val base =
                lifecycleService
                    .computeLifecycle(
                        composition = composition,
                        slots = slots,
                        roleSlots = event.roleSlots,
                        viewerCanSeeDraft = draftVisibleForEvent[event.id] == true,
                    ).copy(publishedAt = compositions[event.id]?.publishedAt)
            event.id to
                if (!event.isAvailabilityOpen()) {
                    base.copy(teamStatusBadge = TeamStatusBadgeMapper.draftEventBadge())
                } else {
                    base
                }
        }
    }

    private fun resolveDraftVisibility(
        eventIds: Collection<UUID>,
        canManageByEvent: Map<UUID, Boolean>,
        compositions: Map<UUID, EventCompositionEntity>,
    ): Map<UUID, Boolean> =
        eventIds.associateWith { eventId ->
            val composition = compositions[eventId]
            val canManage = canManageByEvent[eventId] == true
            CompositionVisibilityRules.canViewSlotAssignments(composition, canManage)
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

private fun EventCompositionSlotEntity.toSnapshot(): CompositionSlotSnapshot =
    CompositionSlotSnapshot(
        roleKey = roleKey,
        slotIndex = slotIndex,
        participantId = assignedParticipantId(),
        participationStatus = participationStatus,
        waived = waived,
    )
