package com.hatcast.api.composition

import com.hatcast.api.composition.dto.ConsecutiveShowWarningDto
import com.hatcast.api.composition.dto.ConsecutiveShowWarningEventDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.SpectacleCategory
import org.springframework.stereotype.Service

@Service
class ConsecutiveShowWarningService(
    private val immediatePredecessorRoleReplayService: ImmediatePredecessorRoleReplayService,
    private val immediatePredecessorEventResolver: ImmediatePredecessorEventResolver,
    private val globalWarningPredecessorResolver: GlobalWarningPredecessorResolver,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: com.hatcast.api.participant.SeasonParticipantRepository,
    private val eventParticipantRepository: com.hatcast.api.participant.EventParticipantRepository,
) {
    fun warningsBySlotKey(
        currentEvent: EventEntity,
        currentSlots: List<EventCompositionSlotEntity>,
    ): Map<Pair<String, Int>, ConsecutiveShowWarningDto> {
        val scopedEvents = listOfNotNull(
            globalWarningPredecessorResolver.resolve(currentEvent)?.let { "global" to it },
            immediatePredecessorEventResolver.resolve(currentEvent)?.let { "category" to it },
        )
        if (scopedEvents.isEmpty()) return emptyMap()
        val events = scopedEvents.map { it.second }.distinctBy { it.id }
        val slotsByEvent = events.associate { event ->
            event.id to slotRepository.findByEventId(event.id)
                .filter { it.hasAssignee() && it.participationStatus != SlotParticipationStatus.DECLINED }
        }
        val predecessorIdentities = CompositionParticipantIdentityResolver.identitiesForSlots(
            slotsByEvent.values.flatten(), seasonParticipantRepository, eventParticipantRepository,
        )
        val currentIdentities = CompositionParticipantIdentityResolver.identitiesForSlots(
            currentSlots.filter { it.hasAssignee() }, seasonParticipantRepository, eventParticipantRepository,
        )
        return currentSlots.mapNotNull { slot ->
            val participantId = slot.assignedParticipantId() ?: return@mapNotNull null
            val identity = currentIdentities[participantId] ?: return@mapNotNull null
            val matches = events.mapNotNull { event ->
                val sameRole = immediatePredecessorRoleReplayService.playedSameRoleOnPredecessor(
                    roleKey = slot.roleKey,
                    candidateIdentity = identity,
                    predecessorSlots = slotsByEvent.getValue(event.id),
                    predecessorIdentities = predecessorIdentities,
                )
                if (!sameRole) null else ConsecutiveShowWarningEventDto(
                    eventId = event.id, title = event.title, startsAt = event.startsAt,
                    category = SpectacleCategory.slug(event),
                    scopes = scopedEvents.filter { it.second.id == event.id }.map { it.first },
                )
            }
            val first = matches.firstOrNull { "category" in it.scopes } ?: matches.firstOrNull() ?: return@mapNotNull null
            (slot.roleKey to slot.slotIndex) to ConsecutiveShowWarningDto(
                previousEventId = first.eventId, previousEventTitle = first.title,
                previousEventStartsAt = first.startsAt, events = matches,
            )
        }.toMap()
    }
}
