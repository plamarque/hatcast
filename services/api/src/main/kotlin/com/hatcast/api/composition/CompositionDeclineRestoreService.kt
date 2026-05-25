package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.associateByLinkedUserId
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class CompositionDeclineRestoreService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val compositionService: CompositionService,
    private val notificationPort: CompositionNotificationPort,
) {
    @Transactional
    fun restoreDecline(
        seasonId: UUID,
        eventId: UUID,
        declineId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireManageComposition(eventId, seasonId, principal)

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElse(null)
                ?: throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
        if (composition.validatedAt == null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
        }

        val decline =
            declineRepository.findById(declineId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Déclin inconnu")
            }
        if (decline.eventId != eventId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Déclin inconnu")
        }

        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val slots = slotRepository.findByEventId(eventId)
        val emptySlotIndex =
            CompositionGapFillRules.firstEmptySlotIndexForRole(decline.roleKey, normalizedSlots, slots)
                ?: throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Aucun créneau vide pour ce rôle",
                )

        val declineParticipantId =
            decline.seasonParticipantId ?: decline.eventParticipantId
                ?: throw ResponseStatusException(HttpStatus.CONFLICT, "Déclin sans participant")

        val now = Instant.now()
        seasonParticipantService.ensureMembershipParticipants(event.season)
        val eligible =
            CompositionParticipantPool.loadEligibleParticipants(
                seasonId,
                eventId,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )
        val eligibleRow = resolveAssignee(seasonId, eventId, declineParticipantId, eligible)
        ensureEligibleForRoleAssign(eventId, decline.roleKey, emptySlotIndex, eligibleRow, eligible)

        val slotEntity =
            slotRepository.findByEventIdAndRoleKeyAndSlotIndex(
                eventId,
                decline.roleKey,
                emptySlotIndex,
            )
                ?: slotRepository.save(
                    EventCompositionSlotEntity(
                        eventId = eventId,
                        roleKey = decline.roleKey,
                        slotIndex = emptySlotIndex,
                    ),
                )
        slotEntity.setAssignee(eligibleRow)
        slotEntity.participationStatus = SlotParticipationStatus.PENDING
        slotEntity.updatedAt = now
        slotRepository.save(slotEntity)

        declineRepository.delete(decline)
        composition.updatedAt = now
        compositionRepository.save(composition)

        notificationPort.requestConfirmationForAssignees(
            eventId = eventId,
            seasonId = seasonId,
            assigneeParticipantIds = listOf(eligibleRow.participantId),
            actorUserId = principal.userId,
        )

        return compositionService.getCompositionStateAfterMutation(seasonId, eventId, principal)
    }

    private fun ensureEligibleForRoleAssign(
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        eligibleRow: CompositionEligibleParticipant,
        eligible: List<CompositionEligibleParticipant>,
    ) {
        val availabilityByUserId =
            availabilityRepository.findByEvent_Id(eventId).associateByLinkedUserId()
        val pool =
            CompositionParticipantPool.buildRolePool(
                eligible = eligible,
                availabilityByUserId = availabilityByUserId,
                roleKey = roleKey,
                excluded = emptySet(),
            )
        if (pool.none { it.participantId == eligibleRow.participantId }) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Participant non éligible pour ce rôle")
        }

        val sameRoleConflict =
            slotRepository
                .findByEventId(eventId)
                .any { slot ->
                    slot.roleKey == roleKey &&
                        slot.slotIndex != slotIndex &&
                        slot.assignedParticipantId() == eligibleRow.participantId
                }
        if (sameRoleConflict) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Ce participant occupe déjà un autre slot pour ce rôle",
            )
        }
    }

    private fun resolveAssignee(
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
        eligible: List<CompositionEligibleParticipant>,
    ): CompositionEligibleParticipant {
        eligible.firstOrNull { it.participantId == participantId }?.let { return it }

        val eventRow =
            eventParticipantRepository.findByIdAndEvent_Id(participantId, eventId)
                ?: throw ResponseStatusException(HttpStatus.CONFLICT, "Participant inconnu pour cet événement")

        eventRow.user?.id?.let { userId ->
            eligible.firstOrNull { it.userId == userId }?.let { return it }
        }

        return CompositionEligibleParticipant(
            eventRow.id,
            eventRow.user?.id,
            eventRow.displayName,
            CompositionParticipantSource.EVENT,
        )
    }

    private fun requireManageComposition(
        eventId: UUID,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
    }

    private fun loadAuthorizedEvent(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventEntity {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return event
    }
}
