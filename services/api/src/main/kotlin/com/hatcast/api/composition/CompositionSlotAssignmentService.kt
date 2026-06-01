package com.hatcast.api.composition

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.associateByLinkedUserId
import com.hatcast.api.composition.dto.AssignSlotRequestDto
import com.hatcast.api.composition.dto.CompositionCandidateDto
import com.hatcast.api.composition.dto.CompositionCandidateListResponseDto
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.text.FrenchCollator
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class CompositionSlotAssignmentService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val selectionHistory: CompositionSelectionHistoryService,
    private val compositionService: CompositionService,
    private val notificationPort: CompositionNotificationPort,
    private val auditRecorder: AuditEventRecorder,
    private val lifecycleAuditRecorder: CompositionLifecycleAuditRecorder,
) {
    @Transactional(readOnly = true)
    fun getCandidates(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int?,
        principal: SessionUserPrincipal,
    ): CompositionCandidateListResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireManageComposition(eventId, seasonId, principal)
        val composition = compositionRepository.findById(eventId).orElse(null)
        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        if (composition?.validatedAt != null) {
            if (slotIndex != null) {
                if (!CompositionGapFillRules.isTargetSlotEmpty(eventId, roleKey, slotIndex, slotRepository)) {
                    throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
                }
            } else {
                val slots = slotRepository.findByEventId(eventId)
                if (!CompositionGapFillRules.hasEmptySlotForRole(roleKey, normalizedSlots, slots)) {
                    throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
                }
            }
        }
        val requiredCount = normalizedSlots[roleKey]
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        if (requiredCount <= 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        }

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val eligible =
            CompositionParticipantPool.loadEligibleParticipants(
                seasonId,
                eventId,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )
        val availabilityByUserId =
            availabilityRepository.findByEvent_Id(eventId).associateByLinkedUserId()
        val historyCounts =
            selectionHistory.pastSelectionCountByParticipantAndRole(
                event,
                SelectionHistoryMode.OPERATIONAL,
            )
        val pastByParticipant =
            selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)

        val sameRoleExcluded = sameRoleAssignedParticipantIds(eventId, roleKey, slotIndex)
        val pool =
            CompositionParticipantPool.buildRolePool(
                eligible = eligible,
                availabilityByUserId = availabilityByUserId,
                roleKey = roleKey,
                excluded = sameRoleExcluded,
            )
        val scored =
            AvailabilityChanceCalculator.scoreCandidates(
                pool.map {
                    AvailabilityChanceCalculator.Candidate(it.participantId, it.displayName, null)
                },
                requiredCount,
                pastByParticipant,
            )
        val assignedRoleKeysByParticipant = assignedRoleKeysByParticipant(eventId)

        val candidates =
            scored
                .sortedWith(
                    compareByDescending<AvailabilityChanceCalculator.ScoredCandidate> { it.chancePercent }
                        .thenComparator { a, b -> FrenchCollator.compare(a.displayName, b.displayName) },
                ).map { row ->
                    CompositionCandidateDto(
                        participantId = row.participantId,
                        displayName = row.displayName,
                        chancePercent = row.chancePercent,
                        pastSelectionCount = row.pastSelectionCount,
                        alreadyAssignedRoleKeys =
                            assignedRoleKeysByParticipant[row.participantId]?.takeIf { it.isNotEmpty() },
                    )
                }

        return CompositionCandidateListResponseDto(
            roleKey = roleKey,
            requiredCount = requiredCount,
            candidates = candidates,
        )
    }

    @Transactional
    fun assignSlot(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        body: AssignSlotRequestDto,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireManageComposition(eventId, seasonId, principal)
        seasonParticipantService.ensureMembershipParticipants(event.season)

        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val requiredCount = normalizedSlots[roleKey]
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        if (slotIndex !in 0 until requiredCount) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Index de slot invalide")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElse(null)
        val beforeLifecycle = lifecycleAuditRecorder.captureRawLifecycle(eventId, event.roleSlots)
        val isLocked = composition?.validatedAt != null
        val now = Instant.now()
        val participantId = body.participantId
        val beforeSlot = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
        val beforeSnapshot = AuditSnapshots.slotAssignment(beforeSlot)

        if (isLocked) {
            if (participantId == null) {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
            }
            if (!CompositionGapFillRules.isTargetSlotEmpty(eventId, roleKey, slotIndex, slotRepository)) {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
            }
            val compositionRow =
                composition
                    ?: throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
            assignParticipant(event, seasonId, eventId, roleKey, slotIndex, participantId, now)
            compositionRow.updatedAt = now
            compositionRepository.save(compositionRow)
            notificationPort.requestConfirmationForAssignees(
                eventId = eventId,
                seasonId = seasonId,
                assigneeParticipantIds = listOf(participantId),
                actorUserId = principal.userId,
            )
            recordSlotAudit(event, seasonId, eventId, principal.userId, roleKey, slotIndex, participantId, beforeSnapshot, AuditActionType.SLOT_ASSIGNED)
        } else if (participantId == null) {
            val cleared = clearSlot(eventId, roleKey, slotIndex, now)
            if (composition != null && cleared) {
                composition.updatedAt = now
                compositionRepository.save(composition)
            }
            if (cleared) {
                recordSlotAudit(event, seasonId, eventId, principal.userId, roleKey, slotIndex, null, beforeSnapshot, AuditActionType.SLOT_CLEARED)
            }
        } else {
            val compositionRow =
                composition
                    ?: compositionRepository.save(
                        EventCompositionEntity(
                            eventId = eventId,
                            validatedAt = null,
                            publishedAt = null,
                            createdAt = now,
                            updatedAt = now,
                        ),
                    )
            assignParticipant(event, seasonId, eventId, roleKey, slotIndex, participantId, now)
            compositionRow.updatedAt = now
            compositionRepository.save(compositionRow)
            recordSlotAudit(event, seasonId, eventId, principal.userId, roleKey, slotIndex, participantId, beforeSnapshot, AuditActionType.SLOT_ASSIGNED)
        }

        lifecycleAuditRecorder.recordIfChanged(event, seasonId, beforeLifecycle)
        return compositionService.getCompositionStateAfterMutation(seasonId, eventId, principal)
    }

    private fun recordSlotAudit(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        actorUserId: UUID,
        roleKey: String,
        slotIndex: Int,
        participantId: UUID?,
        beforeSnapshot: Map<String, Any?>,
        actionType: AuditActionType,
    ) {
        val afterSlot = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
        val afterSnapshot = AuditSnapshots.slotAssignment(afterSlot)
        val (beforeDiff, afterDiff) = AuditSnapshots.mapDiff(beforeSnapshot, afterSnapshot)
        if (beforeDiff == null || afterDiff == null) {
            return
        }
        auditRecorder.record(
            AuditRecordRequest(
                actionType = actionType,
                actorUserId = actorUserId,
                subjectSeasonParticipantId = afterSlot?.seasonParticipantId ?: beforeSlotSeasonParticipantId(beforeSnapshot),
                subjectEventParticipantId = afterSlot?.eventParticipantId ?: beforeSlotEventParticipantId(beforeSnapshot),
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = beforeDiff,
                after = afterDiff,
                metadata =
                    mapOf(
                        "roleKey" to roleKey,
                        "slotIndex" to slotIndex,
                        "participantId" to participantId?.toString(),
                    ),
            ),
        )
    }

    private fun beforeSlotSeasonParticipantId(beforeSnapshot: Map<String, Any?>): UUID? =
        beforeSnapshot["seasonParticipantId"]?.toString()?.let(UUID::fromString)

    private fun beforeSlotEventParticipantId(beforeSnapshot: Map<String, Any?>): UUID? =
        beforeSnapshot["eventParticipantId"]?.toString()?.let(UUID::fromString)

    private fun assignParticipant(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        participantId: UUID,
        now: Instant,
    ) {
        val eligible =
            CompositionParticipantPool.loadEligibleParticipants(
                seasonId,
                eventId,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )
        val eligibleRow = resolveAssignee(seasonId, eventId, participantId, eligible)

        val availabilityByUserId =
            availabilityRepository.findByEvent_Id(eventId).associateByLinkedUserId()
        val pool =
            CompositionParticipantPool.buildRolePool(
                eligible = eligible,
                availabilityByUserId = availabilityByUserId,
                roleKey = roleKey,
                excluded = emptySet(),
            )
        if (pool.none { it.participantId == participantId }) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Participant non éligible pour ce rôle")
        }

        val sameRoleConflict =
            slotRepository
                .findByEventId(eventId)
                .any { slot ->
                    slot.roleKey == roleKey &&
                        slot.slotIndex != slotIndex &&
                        slot.assignedParticipantId() == participantId
                }
        if (sameRoleConflict) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Ce participant occupe déjà un autre slot pour ce rôle",
            )
        }

        val slotEntity =
            slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
                ?: slotRepository.save(
                    EventCompositionSlotEntity(
                        eventId = eventId,
                        roleKey = roleKey,
                        slotIndex = slotIndex,
                    ),
                )
        slotEntity.setAssignee(eligibleRow)
        slotEntity.participationStatus = SlotParticipationStatus.PENDING
        slotEntity.updatedAt = now
        slotRepository.save(slotEntity)
    }

    private fun clearSlot(
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        now: Instant,
    ): Boolean {
        val slotEntity = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
        if (slotEntity != null) {
            if (!slotEntity.hasAssignee()) {
                return false
            }
            slotEntity.clearAssignee()
            slotEntity.participationStatus = SlotParticipationStatus.PENDING
            slotEntity.updatedAt = now
            slotRepository.save(slotEntity)
            return true
        }
        return false
    }

    private fun sameRoleAssignedParticipantIds(
        eventId: UUID,
        roleKey: String,
        editingSlotIndex: Int? = null,
    ): Set<UUID> =
        slotRepository
            .findByEventId(eventId)
            .filter { slot ->
                slot.roleKey == roleKey &&
                    slot.hasAssignee() &&
                    (editingSlotIndex == null || slot.slotIndex != editingSlotIndex)
            }.mapNotNull { it.assignedParticipantId() }
            .toSet()

    private fun assignedRoleKeysByParticipant(eventId: UUID): Map<UUID, List<String>> =
        slotRepository
            .findByEventId(eventId)
            .filter { it.hasAssignee() }
            .groupBy { it.assignedParticipantId()!! }
            .mapValues { (_, slots) -> slots.map { it.roleKey }.distinct().sorted() }

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
