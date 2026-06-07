package com.hatcast.api.composition

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditEventRepository
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.availability.AvailabilityRoleRules
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.toAvailabilityIndex
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.dto.CompositionDeclineDto
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.CompositionSlotDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.ParticipantAvatarResolver
import com.hatcast.api.user.ParticipantGenderResolver
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class CompositionService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val selectionHistory: CompositionSelectionHistoryService,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val guestInvitationAccess: GuestInvitationAccessService,
    private val declineRepository: EventCompositionDeclineRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val drawChanceSnapshots: CompositionDrawChanceSnapshotService,
    private val auditRecorder: AuditEventRecorder,
    private val auditEventRepository: AuditEventRepository,
    private val lifecycleAuditRecorder: CompositionLifecycleAuditRecorder,
    private val consecutiveShowWarningService: ConsecutiveShowWarningService,
    private val multiRoleOnEventWarningService: MultiRoleOnEventWarningService,
    private val participantGenderResolver: ParticipantGenderResolver,
    private val participantAvatarResolver: ParticipantAvatarResolver,
) {
    @Transactional(readOnly = true)
    fun getComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return buildResponse(event, principal, includeSlotExplainability = false)
    }

    /**
     * Composition state after a mutation (assign, validate, draw, etc.).
     * Same lightweight response as GET (odds shown only in candidates picker, not on the grid).
     */
    fun getCompositionStateAfterMutation(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return buildResponse(event, principal, includeSlotExplainability = false)
    }

    @Transactional
    fun publishComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (!canManage) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à publier")
            }
        if (composition.validatedAt != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Composition déjà validée")
        }

        val alreadyPublished = composition.publishedAt != null
        val beforeRawLifecycle = lifecycleAuditRecorder.captureRawLifecycle(eventId, event.roleSlots)
        if (!alreadyPublished) {
            val beforeLifecycle = AuditSnapshots.compositionLifecycle(composition)
            val slots = slotRepository.findByEventId(eventId)
            val assignedCount = slots.count { it.hasAssignee() }
            if (assignedCount == 0) {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Aucun rôle assigné à publier")
            }
            val now = Instant.now()
            composition.publishedAt = now
            composition.updatedAt = now
            compositionRepository.save(composition)
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.COMPOSITION_PUBLISHED,
                    actorUserId = principal.userId,
                    troupeId = event.season.troupe.id,
                    seasonId = seasonId,
                    eventId = eventId,
                    before = beforeLifecycle,
                    after = AuditSnapshots.compositionLifecycle(composition),
                ),
            )
            eventPublisher.publishEvent(
                DraftCompositionSharedEvent(
                    eventId = eventId,
                    seasonId = seasonId,
                    actorUserId = principal.userId,
                ),
            )
        }

        lifecycleAuditRecorder.recordIfChanged(event, seasonId, beforeRawLifecycle)
        return buildResponse(event, principal, canManage = true, includeSlotExplainability = false)
    }

    @Transactional
    fun validateComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (!canManage) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à valider")
            }
        val slots = slotRepository.findByEventId(eventId)
        val assignedCount = slots.count { it.hasAssignee() }
        if (assignedCount == 0) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Aucun rôle assigné à valider")
        }

        val beforeRawLifecycle = lifecycleAuditRecorder.captureRawLifecycle(eventId, event.roleSlots)
        val alreadyValidated = composition.validatedAt != null
        if (!alreadyValidated) {
            val beforeLifecycle = AuditSnapshots.compositionLifecycle(composition)
            val now = Instant.now()
            composition.validatedAt = now
            composition.updatedAt = now
            compositionRepository.save(composition)
            val isRevalidation =
                auditEventRepository.existsByEventIdAndActionType(eventId, AuditActionType.COMPOSITION_VALIDATED)
            val assigneesNeedingConfirm =
                slots
                    .filter { it.hasAssignee() && it.participationStatus != SlotParticipationStatus.CONFIRMED }
                    .mapNotNull { it.assignedParticipantId() }
                    .distinct()
            val slotsToReset =
                slots
                    .filter { it.hasAssignee() && it.participationStatus != SlotParticipationStatus.CONFIRMED }
                    .onEach {
                        it.participationStatus = SlotParticipationStatus.PENDING
                        it.updatedAt = Instant.now()
                    }
            if (slotsToReset.isNotEmpty()) {
                slotRepository.saveAll(slotsToReset)
            }
            if (assigneesNeedingConfirm.isNotEmpty()) {
                if (isRevalidation) {
                    eventPublisher.publishEvent(
                        CompositionReconfirmationRequestedEvent(
                            eventId = eventId,
                            seasonId = seasonId,
                            actorUserId = principal.userId,
                            assigneeParticipantIds = assigneesNeedingConfirm,
                        ),
                    )
                } else {
                    eventPublisher.publishEvent(
                        CompositionConfirmationRequestedEvent(
                            eventId = eventId,
                            seasonId = seasonId,
                            actorUserId = principal.userId,
                            assigneeParticipantIds = assigneesNeedingConfirm,
                        ),
                    )
                }
            }
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.COMPOSITION_VALIDATED,
                    actorUserId = principal.userId,
                    troupeId = event.season.troupe.id,
                    seasonId = seasonId,
                    eventId = eventId,
                    before = beforeLifecycle,
                    after = AuditSnapshots.compositionLifecycle(composition),
                ),
            )
        }

        lifecycleAuditRecorder.recordIfChanged(event, seasonId, beforeRawLifecycle)
        return buildResponse(event, principal, canManage = true, includeSlotExplainability = false)
    }

    @Transactional
    fun unlockComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (!canManage) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à déverrouiller")
            }
        if (composition.validatedAt == null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "La composition n'est pas validée")
        }

        val beforeRawLifecycle = lifecycleAuditRecorder.captureRawLifecycle(eventId, event.roleSlots)
        val beforeLifecycle = AuditSnapshots.compositionLifecycle(composition)
        val now = Instant.now()
        composition.validatedAt = null
        composition.updatedAt = now
        compositionRepository.save(composition)

        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.COMPOSITION_UNLOCKED,
                actorUserId = principal.userId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = beforeLifecycle,
                after = AuditSnapshots.compositionLifecycle(composition),
            ),
        )

        lifecycleAuditRecorder.recordIfChanged(event, seasonId, beforeRawLifecycle)
        return buildResponse(event, principal, canManage = true, includeSlotExplainability = false)
    }

    private fun buildResponse(
        event: EventEntity,
        principal: SessionUserPrincipal,
        canManage: Boolean? = null,
        includeSlotExplainability: Boolean = true,
    ): CompositionResponseDto {
        if (includeSlotExplainability) {
            seasonParticipantService.ensureMembershipParticipants(event.season)
        }
        val seasonId = event.season.id
        val eventId = event.id
        val resolvedCanManage = canManage ?: organizerAccess.canManageComposition(eventId, seasonId, principal)
        val composition = compositionRepository.findById(eventId).orElse(null)
        val normalizedRoleSlots = RoleTemplates.normalize(event.roleSlots)
        val slots =
            slotRepository.findByEventId(eventId).filter { slot ->
                val count = normalizedRoleSlots[slot.roleKey] ?: 0
                slot.slotIndex in 0 until count
            }
        val hasAssignedSlots = slots.any { it.hasAssignee() }
        val compositionValidated = composition?.validatedAt != null
        val visibilityContent = hasAssignedSlots || compositionValidated
        val visibility =
            CompositionVisibilityRules.resolveVisibility(composition, resolvedCanManage, visibilityContent)
        val canViewSlots =
            CompositionVisibilityRules.canViewSlotAssignments(composition, resolvedCanManage) &&
                visibilityContent

        val showExplainability =
            canViewSlots &&
                (composition?.validatedAt != null || resolvedCanManage)
        val explainabilityByRoleAndParticipant =
            if (showExplainability && includeSlotExplainability) {
                buildExplainabilityLookup(event, seasonId, eventId, slots)
            } else {
                emptyMap()
            }

        val slotDtos =
            if (canViewSlots) {
                val participantIds = slots.mapNotNull { it.assignedParticipantId() }.toSet()
                val displayNames = resolveDisplayNames(eventId, participantIds)
                val gendersByParticipantId =
                    participantGenderResolver.resolveByParticipantIds(eventId, participantIds)
                val avatarUrlsByParticipantId =
                    participantAvatarResolver.resolveByParticipantIds(eventId, participantIds)
                val consecutiveWarningsBySlot =
                    if (resolvedCanManage) {
                        consecutiveShowWarningService.warningsBySlotKey(event, slots)
                    } else {
                        emptyMap()
                    }
                val multiRoleWarningsBySlot =
                    if (resolvedCanManage) {
                        multiRoleOnEventWarningService.warningsBySlotKey(slots)
                    } else {
                        emptyMap()
                    }
                slots.map { slot ->
                    val assignedId = slot.assignedParticipantId()
                    val odds =
                        assignedId?.let { pid ->
                            explainabilityByRoleAndParticipant[pid to slot.roleKey]
                        }
                    CompositionSlotDto(
                        roleKey = slot.roleKey,
                        slotIndex = slot.slotIndex,
                        participantId = assignedId,
                        participantDisplayName =
                            assignedId?.let { displayNames[it] },
                        participantAvatarUrl =
                            assignedId?.let { avatarUrlsByParticipantId[it] },
                        participantGender =
                            assignedId?.let { gendersByParticipantId[it] },
                        participationStatus = slot.participationStatus.name.lowercase(),
                        chancePercent = odds?.first,
                        pastSelectionCount = odds?.second,
                        consecutiveShowWarning =
                            consecutiveWarningsBySlot[slot.roleKey to slot.slotIndex],
                        multiRoleOnEventWarning =
                            multiRoleWarningsBySlot[slot.roleKey to slot.slotIndex],
                    )
                }
            } else {
                emptyList()
            }

        val viewerParticipantIds =
            CompositionLinkedParticipantResolver.resolveViewerParticipantIds(
                season = event.season,
                eventId = eventId,
                userId = principal.userId,
                seasonParticipantRepository = seasonParticipantRepository,
                eventParticipantRepository = eventParticipantRepository,
            )
        val declineDtos =
            if (canViewSlots) {
                mapDeclines(eventId, declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId))
            } else {
                emptyList()
            }

        return CompositionResponseDto(
            publishedAt = composition?.publishedAt,
            validatedAt = composition?.validatedAt,
            visibility = visibility.toApiValue(),
            slots = slotDtos,
            declines = declineDtos,
            viewerParticipantIds = viewerParticipantIds.toList(),
        )
    }

    private fun mapDeclines(
        eventId: UUID,
        rows: List<EventCompositionDeclineEntity>,
    ): List<CompositionDeclineDto> {
        if (rows.isEmpty()) {
            return emptyList()
        }
        val participantIds =
            rows.mapNotNull { row ->
                row.seasonParticipantId ?: row.eventParticipantId
            }.toSet()
        val displayNames = resolveDisplayNames(eventId, participantIds)
        val gendersByParticipantId =
            participantGenderResolver.resolveByParticipantIds(eventId, participantIds)
        val avatarUrlsByParticipantId =
            participantAvatarResolver.resolveByParticipantIds(eventId, participantIds)
        return rows.map { row ->
            val participantId =
                row.seasonParticipantId ?: row.eventParticipantId
                    ?: throw IllegalStateException("Decline row missing participant reference")
            CompositionDeclineDto(
                id = row.id,
                participantId = participantId,
                participantDisplayName = displayNames[participantId] ?: "Participant",
                participantAvatarUrl = avatarUrlsByParticipantId[participantId],
                participantGender = gendersByParticipantId[participantId] ?: "non_specified",
                roleKey = row.roleKey,
                slotIndex = row.slotIndex,
                declinedAt = row.declinedAt,
                note = row.note,
            )
        }
    }

    private fun buildExplainabilityLookup(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        assignedSlots: List<EventCompositionSlotEntity>,
    ): Map<Pair<UUID, String>, Pair<Int, Int>> {
        return buildExplainabilityLookupInner(event, seasonId, eventId, assignedSlots)
    }

    private fun buildExplainabilityLookupInner(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        assignedSlots: List<EventCompositionSlotEntity>,
    ): Map<Pair<UUID, String>, Pair<Int, Int>> {
        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val roleKeysForOdds =
            assignedSlots
                .filter { it.hasAssignee() }
                .map { it.roleKey }
                .toSet()
        if (roleKeysForOdds.isEmpty()) {
            return emptyMap()
        }
        val historyMode = SelectionHistoryModeResolver.forEvent(event)
        val snapshotByRoleAndParticipant =
            if (historyMode == SelectionHistoryMode.RETROSPECTIVE) {
                drawChanceSnapshots
                    .findByEventId(eventId)
                    .associateBy { it.id.roleKey to it.id.participantId }
            } else {
                emptyMap()
            }
        val historyCounts =
            selectionHistory.pastSelectionCountByParticipantAndRole(event, historyMode)
        val eligible = loadEligibleForExplainability(seasonId, eventId)
        val availabilityIndex =
            availabilityRepository.findByEvent_Id(eventId).toAvailabilityIndex()

        val result = mutableMapOf<Pair<UUID, String>, Pair<Int, Int>>()
        for (roleKey in roleKeysForOdds) {
            val requiredCount = normalizedSlots[roleKey] ?: 0
            val assignedInRole =
                assignedSlots.filter { it.roleKey == roleKey && it.hasAssignee() }
            val needsLiveRecalc =
                assignedInRole.any { slot ->
                    val participantId = slot.assignedParticipantId() ?: return@any false
                    snapshotByRoleAndParticipant[roleKey to participantId] == null
                }
            val scoredByParticipant =
                if (needsLiveRecalc) {
                    val pastByParticipant =
                        selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)
                    val pool =
                        eligible.filter { row ->
                            val availability =
                                availabilityIndex.forParticipant(row.participantId, row.userId)
                                    ?: return@filter false
                            if (availability.status != StoredAvailabilityStatus.AVAILABLE) {
                                return@filter false
                            }
                            AvailabilityRoleRules.isCandidateForRole(
                                AvailabilityStatusMapper.toApi(availability.status),
                                availability.roleKeys,
                                roleKey,
                            )
                        }
                    AvailabilityChanceCalculator
                        .scoreCandidates(
                            pool.map {
                                AvailabilityChanceCalculator.Candidate(it.participantId, it.displayName, null)
                            },
                            requiredCount,
                            pastByParticipant,
                            roleKey = roleKey,
                        ).associateBy { it.participantId }
                } else {
                    emptyMap()
                }
            for (slot in assignedInRole) {
                val participantId = slot.assignedParticipantId() ?: continue
                val snapshot = snapshotByRoleAndParticipant[roleKey to participantId]
                if (snapshot != null) {
                    result[participantId to roleKey] =
                        snapshot.chancePercent to snapshot.pastSelectionCount
                } else {
                    scoredByParticipant[participantId]?.let { candidate ->
                        result[participantId to roleKey] =
                            candidate.chancePercent to candidate.pastSelectionCount
                    }
                }
            }
        }
        return result
    }

    private data class ExplainabilityParticipantRow(
        val participantId: UUID,
        val userId: UUID?,
        val displayName: String,
    )

    private fun loadEligibleForExplainability(
        seasonId: UUID,
        eventId: UUID,
    ): List<ExplainabilityParticipantRow> {
        val seasonRows =
            seasonParticipantRepository
                .findActiveForSeasonWithAssociations(seasonId, ParticipantStatus.ACTIVE)
                .filter { row ->
                    row.troupeMembership == null ||
                        row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
                }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val byId = linkedMapOf<UUID, ExplainabilityParticipantRow>()
        val seenUserIds = mutableSetOf<UUID>()
        for (row in seasonRows) {
            byId[row.id] = ExplainabilityParticipantRow(row.id, row.user?.id, row.displayName)
            row.user?.id?.let { seenUserIds.add(it) }
        }
        val eventRows =
            eventParticipantRepository.findActiveForEventWithAssociations(
                eventId,
                ParticipantStatus.ACTIVE,
            )
        for (row in eventRows) {
            val linkedSeasonId = row.seasonParticipant?.id
            if (linkedSeasonId != null && linkedSeasonId in seasonParticipantIds) {
                continue
            }
            val userId = row.user?.id
            if (userId != null && userId in seenUserIds) {
                continue
            }
            byId[row.id] = ExplainabilityParticipantRow(row.id, userId, row.displayName)
            userId?.let { seenUserIds.add(it) }
        }
        return byId.values.toList()
    }

    private fun resolveDisplayNames(
        eventId: UUID,
        participantIds: Set<UUID>,
    ): Map<UUID, String> {
        if (participantIds.isEmpty()) {
            return emptyMap()
        }
        val names =
            seasonParticipantRepository
                .findAllById(participantIds)
                .associate { it.id to it.displayName }
                .toMutableMap()
        val unresolved = participantIds - names.keys
        if (unresolved.isNotEmpty()) {
            eventParticipantRepository
                .findAllById(unresolved)
                .filter { it.event.id == eventId }
                .forEach { row -> names[row.id] = row.displayName }
        }
        return names
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
        guestInvitationAccess.requireMemberOrInvitedGuest(seasonId, eventId, principal)
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
