package com.hatcast.api.composition

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

/** Atomic structural removal: never combine a client-side clear and PATCH. */
@Service
class CompositionSlotStructureService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val auditRecorder: AuditEventRecorder,
) {
    /**
     * A retained assignment is intentionally outside [EventEntity.roleSlots].
     * It may be cleared by an organizer, but never repurposed as a required slot.
     */
    @Transactional
    fun clearOutOfModelSlot(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        principal: SessionUserPrincipal,
    ) {
        val (event, target) = requireOutOfModelAssignedSlot(seasonId, eventId, roleKey, slotIndex, principal)
        val before = AuditSnapshots.slotAssignment(target)
        val now = Instant.now()
        target.clearAssignee()
        target.participationStatus = SlotParticipationStatus.PENDING
        target.updatedAt = now
        slotRepository.save(target)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SLOT_CLEARED,
                actorUserId = principal.userId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = before,
                after = AuditSnapshots.slotAssignment(target),
                metadata = mapOf("roleKey" to roleKey, "slotIndex" to slotIndex, "outsideModel" to true),
            ),
        )
    }

    /** Removes a retained slot without changing the current role needs. */
    @Transactional
    fun deleteOutOfModelSlot(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        principal: SessionUserPrincipal,
    ) {
        val (event, target) = requireOutOfModelAssignedSlot(seasonId, eventId, roleKey, slotIndex, principal)
        val before = AuditSnapshots.slotAssignment(target)
        slotRepository.delete(target)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SLOT_DELETED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = target.seasonParticipantId,
                subjectEventParticipantId = target.eventParticipantId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = before,
                after = mapOf("deleted" to true, "outsideModel" to true),
                metadata = mapOf("roleKey" to roleKey, "slotIndex" to slotIndex, "outsideModel" to true),
            ),
        )
    }

    @Transactional
    fun deleteSlot(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireManageComposition(eventId, seasonId, principal)
        val composition = compositionRepository.findByEventIdForUpdate(eventId).orElse(null)
        if (composition?.validatedAt != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
        }
        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val count = normalizedSlots[roleKey]
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        if (slotIndex !in 0 until count) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Index de slot invalide")
        }

        val target = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
        val beforeSlot = AuditSnapshots.slotAssignment(target)
        val now = Instant.now()
        if (target != null) {
            slotRepository.delete(target)
        }
        val survivors =
            slotRepository.findByEventId(eventId)
                .filter { it.roleKey == roleKey && it.slotIndex > slotIndex }
                .sortedBy { it.slotIndex }
        survivors.forEach {
            it.slotIndex -= 1
            it.updatedAt = now
        }
        if (survivors.isNotEmpty()) {
            slotRepository.saveAll(survivors)
        }
        val nextSlots = normalizedSlots.toMutableMap()
        nextSlots[roleKey] = count - 1
        event.roleSlots = RoleTemplates.normalize(nextSlots)
        event.updatedAt = now
        val saved = eventRepository.save(event)
        composition?.let {
            it.updatedAt = now
            compositionRepository.save(it)
        }

        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.SLOT_DELETED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = target?.seasonParticipantId,
                subjectEventParticipantId = target?.eventParticipantId,
                troupeId = saved.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = beforeSlot,
                after = mapOf("roleSlots" to saved.roleSlots, "deleted" to true),
                metadata = mapOf("roleKey" to roleKey, "slotIndex" to slotIndex),
            ),
        )
        return EventResponseDto.from(saved)
    }

    private fun requireManageComposition(eventId: UUID, seasonId: UUID, principal: SessionUserPrincipal) {
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
    }

    private fun requireOutOfModelAssignedSlot(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        principal: SessionUserPrincipal,
    ): Pair<EventEntity, EventCompositionSlotEntity> {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireManageComposition(eventId, seasonId, principal)
        val composition = compositionRepository.findByEventIdForUpdate(eventId).orElse(null)
        if (composition?.validatedAt != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
        }
        val target = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
            ?: throw ResponseStatusException(HttpStatus.CONFLICT, "Cette place hors modèle n'existe plus")
        if (target.isRequiredBy(RoleTemplates.normalize(event.roleSlots)) || !target.hasAssignee()) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Cette place n'est plus hors modèle")
        }
        return event to target
    }

    private fun loadAuthorizedEvent(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventEntity {
        val season =
            seasonRepository.findById(seasonId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue")
            }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val event =
            eventRepository.findById(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
            }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return event
    }
}
