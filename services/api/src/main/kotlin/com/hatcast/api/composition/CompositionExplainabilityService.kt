package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.availability.DisposExplainabilityAccess
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.draw.ChanceBreakdownCalculator
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.availability.toAvailabilityIndex
import com.hatcast.api.composition.dto.ChanceBreakdownDto
import com.hatcast.api.composition.dto.ChanceBreakdownPoolDto
import com.hatcast.api.composition.dto.CompositionPoolPreviewResponseDto
import com.hatcast.api.composition.dto.CompositionPoolPreviewSegmentDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.draw.DrawPolicyResolutionService
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeCategoryRepository
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.ParticipantAvatarResolver
import com.hatcast.api.user.ParticipantGenderResolver
import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRepository
import org.springframework.beans.factory.ObjectProvider
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import java.time.Instant

@Service
class CompositionExplainabilityService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val availabilityService: AvailabilityService,
    private val selectionHistory: CompositionSelectionHistoryService,
    private val organizerAccess: OrganizerAccessRules,
    private val guestInvitationAccess: GuestInvitationAccessService,
    private val drawChanceSnapshots: CompositionDrawChanceSnapshotService,
    private val participantAvatarResolver: ParticipantAvatarResolver,
    private val participantGenderResolver: ParticipantGenderResolver,
    private val immediatePredecessorRoleReplayService: ImmediatePredecessorRoleReplayService,
    private val unfulfilledRoleRequestService: UnfulfilledRoleRequestService,
    private val drawWeightPipelineProvider: ObjectProvider<DrawWeightPipeline>,
    private val drawPolicyResolutionService: DrawPolicyResolutionService,
    private val troupeCategoryRepository: TroupeCategoryRepository,
    private val roleChanceReconstructionRepository: RoleChanceReconstructionRepository,
    private val objectMapper: ObjectMapper,
    private val auditEventRepository: AuditEventRepository,
) {
    private fun availabilityForRoleAfterCapture(eventId: UUID, participantId: UUID, userId: UUID?, roleKey: String, capturedAt: Instant?): Boolean {
        if (capturedAt == null) return false
        fun candidate(state: Map<String, Any?>?): Boolean? {
            state ?: return false
            val status = state["status"] as? String ?: return null
            val roles = state["roleKeys"] as? List<*> ?: return null
            return status.equals("available", ignoreCase = true) && (roles.isEmpty() || roleKey in roles)
        }
        val relevant = auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId).filter {
            it.actionType in setOf(AuditActionType.AVAILABILITY_CREATED, AuditActionType.AVAILABILITY_UPDATED, AuditActionType.AVAILABILITY_DELETED) &&
                (it.subjectSeasonParticipantId == participantId || it.subjectEventParticipantId == participantId ||
                    (it.subjectSeasonParticipantId == null && it.subjectEventParticipantId == null && userId != null && it.subjectUserId == userId))
        }
        val transition = relevant.firstOrNull { candidate(it.beforeJson) != candidate(it.afterJson) } ?: return false
        return transition.occurredAt.isAfter(capturedAt) && candidate(transition.beforeJson) == false && candidate(transition.afterJson) == true
    }
    private fun reconstructedChanceDate(eventId: UUID, roleKey: String, participantId: UUID): Instant? {
        val reconstruction = roleChanceReconstructionRepository.findById(RoleChanceBaselineId(eventId, roleKey)).orElse(null)
            ?.takeIf { it.supersededAt == null } ?: return null
        return runCatching {
            val sources = objectMapper.readTree(reconstruction.evidence).path("individualSources")
            val date = sources.firstOrNull { it.path("participantId").asText() == participantId.toString() }
                ?.path("at")?.asText()?.takeIf { it.isNotBlank() }
            date?.let(Instant::parse)
        }.getOrNull()
    }
    private fun resolveDrawPipeline(
        event: EventEntity,
        formulaId: UUID? = null,
    ): DrawWeightPipeline =
        drawWeightPipelineProvider.getIfAvailable()
            ?: drawPolicyResolutionService
                .resolveForEvent(
                    event = event,
                    requestedFormulaId = formulaId,
                    validateForDraw = false,
                ).pipeline
    @Transactional(readOnly = true)
    fun getChanceBreakdown(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        participantId: UUID,
        formulaId: UUID?,
        principal: SessionUserPrincipal,
    ): ChanceBreakdownDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireExplainabilityAccess(event, seasonId, eventId, principal)

        val composition = compositionRepository.findById(eventId).orElse(null)
        val canViewAssignments =
            CompositionVisibilityRules.canViewSlotAssignments(
                composition,
                organizerAccess.canManageComposition(eventId, seasonId, principal),
            )
        val currentAssignment =
            if (canViewAssignments) {
                slotRepository.findByEventId(eventId).firstOrNull {
                    it.roleKey == roleKey && it.assignedParticipantId() == participantId
                }
            } else {
                null
            }
        if (currentAssignment != null && currentAssignment.isRequiredBy(RoleTemplates.normalize(event.roleSlots)) &&
            CompositionVisibilityRules.hasPublishedSelection(composition)
        ) {
            // Legacy selections can use a reconstructed estimate when no individual value exists.
            if (currentAssignment.selectionChancePercent == null) {
                val summary = availabilityService.getSummary(seasonId, eventId, principal, includeChances = true, formulaId = formulaId)
                val role = summary.roles.firstOrNull { it.roleKey == roleKey && it.chanceProvenance == "reconstructed" }
                val candidate = role?.candidates?.firstOrNull { it.participantId == participantId }
                if (candidate?.chancePercent != null) {
                    return ChanceBreakdownDto(
                        participantId = participantId, roleKey = roleKey, displayName = candidate.displayName,
                        chancePercent = null, recordedSnapshot = true, recordedPercent = candidate.chancePercent,
                        recordedAt = reconstructedChanceDate(eventId, roleKey, participantId), recordedSource = "reconstructed", avatarUrl = candidate.avatarUrl, gender = candidate.gender,
                    )
                }
            }
            val displayName =
                seasonParticipantRepository.findById(participantId).orElse(null)
                    ?.takeIf { it.season.id == seasonId }?.displayName
                    ?: eventParticipantRepository.findById(participantId).orElse(null)
                        ?.takeIf { it.event.id == eventId }?.displayName
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant introuvable")
            return ChanceBreakdownDto(
                participantId = participantId,
                roleKey = roleKey,
                displayName = displayName,
                chancePercent = null,
                recordedSelection = true,
                recordedPercent = currentAssignment.selectionChancePercent,
                recordedAt = currentAssignment.selectionChanceAt,
                avatarUrl = participantAvatarResolver.resolveByParticipantIds(eventId, setOf(participantId))[participantId],
                gender = participantGenderResolver.resolveByParticipantIds(eventId, setOf(participantId))[participantId] ?: "non_specified",
            )
        }
        var currentEstimateAfterCapture = false
        var availableForRoleAfterCapture = false
        if (canViewAssignments && CompositionVisibilityRules.hasPublishedSelection(composition)) {
            val summary = availabilityService.getSummary(seasonId, eventId, principal, includeChances = true, formulaId = formulaId)
            if (summary.chanceSource == "baseline") {
                val role = summary.roles.firstOrNull { it.roleKey == roleKey }
                val candidate = role?.candidates?.firstOrNull { it.participantId == participantId }
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant non éligible pour ce rôle")
                if (candidate.chancePercent != null || !candidate.isCandidate) return ChanceBreakdownDto(
                    participantId = participantId, roleKey = roleKey, displayName = candidate.displayName,
                    chancePercent = null, recordedSnapshot = true, recordedPercent = candidate.chancePercent,
                    recordedAt = if (role.chanceProvenance == "reconstructed") reconstructedChanceDate(eventId, roleKey, participantId) else role.chanceSnapshotAt,
                    recordedSource = role.chanceProvenance, avatarUrl = candidate.avatarUrl, gender = candidate.gender,
                )
                currentEstimateAfterCapture = true
                val userId = summary.participants.firstOrNull { it.participantId == participantId }?.userId
                availableForRoleAfterCapture = availabilityForRoleAfterCapture(eventId, participantId, userId, roleKey, role.chanceSnapshotAt)
            }
            // A live calculation is available only for an uncaptured, currently eligible candidate.
            if (!currentEstimateAfterCapture) throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
        val legacySnapshot =
            if (currentAssignment != null && currentAssignment.selectionChanceSource == null) {
                drawChanceSnapshots.findByEventId(eventId)
                    .firstOrNull { it.id.roleKey == roleKey && it.id.participantId == participantId }
            } else {
                null
            }

        fun recordedOnly(): ChanceBreakdownDto? {
            if (currentAssignment == null || (currentAssignment.selectionChancePercent == null && legacySnapshot == null)) {
                return null
            }
            val displayName =
                seasonParticipantRepository.findById(participantId).orElse(null)
                    ?.takeIf { it.season.id == seasonId }?.displayName
                    ?: eventParticipantRepository.findById(participantId).orElse(null)
                        ?.takeIf { it.event.id == eventId }?.displayName
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant introuvable")
            return ChanceBreakdownDto(
                participantId = participantId,
                roleKey = roleKey,
                displayName = displayName,
                chancePercent = null,
                recordedPercent = currentAssignment.selectionChancePercent ?: legacySnapshot?.chancePercent,
                recordedAt = currentAssignment.selectionChanceAt ?: legacySnapshot?.snapshottedAt,
                recordedSource = currentAssignment.selectionChanceSource ?: legacySnapshot?.let { "draw_opening" },
                avatarUrl = participantAvatarResolver.resolveByParticipantIds(eventId, setOf(participantId))[participantId],
            )
        }

        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val requiredCount = normalizedSlots[roleKey]
        if (requiredCount == null || requiredCount <= 0) {
            return recordedOnly()
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        }

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val poolContext = buildRolePoolContext(event, seasonId, eventId, roleKey, formulaId)
        val targetRow = poolContext.pool.find { it.participantId == participantId }
            ?: return recordedOnly()
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant non éligible pour ce rôle")

        val candidates =
            poolContext.pool.map {
                AvailabilityChanceCalculator.Candidate(it.participantId, it.displayName, null)
            }
        val targetGender =
            MemberGender.fromWireOrNull(
                participantGenderResolver
                    .resolveByParticipantIds(eventId, setOf(participantId))[participantId],
            ) ?: MemberGender.NON_SPECIFIED
        val drawPipeline = resolveDrawPipeline(event, formulaId)
        val historyCategoryLabel =
            troupeCategoryRepository.findByTroupe_IdAndSlug(event.season.troupe.id, poolContext.categorySlug)?.label
        val breakdown =
            ChanceBreakdownCalculator.calculate(
                candidates = candidates,
                requiredCount = requiredCount,
                pastSelectionCountByParticipant = poolContext.pastByParticipant,
                targetParticipantId = participantId,
                roleKey = roleKey,
                pipeline = drawPipeline,
                targetParticipantGender = targetGender,
                categorySlug = poolContext.categorySlug,
                pastSelectionCountUnscopedByParticipant = poolContext.pastUnscopedByParticipant,
                playedSameRoleOnImmediatePredecessorByParticipant = poolContext.replayByParticipant,
                immediatePredecessorTitle = poolContext.replayPredecessorTitle,
                immediatePredecessorStartsAt = poolContext.replayPredecessorStartsAt,
                unfulfilledRoleRequestCountByParticipant = poolContext.unfulfilledByParticipant,
                historyCategoryLabel = historyCategoryLabel,
            )
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Breakdown indisponible")

        val avatarUrls =
            participantAvatarResolver.resolveByParticipantIds(
                eventId,
                poolContext.pool.map { it.participantId }.toSet(),
            )

        return ChanceBreakdownDto(
            currentEstimateAfterCapture = currentEstimateAfterCapture,
            availableForRoleAfterCapture = availableForRoleAfterCapture,
            recordedPercent = currentAssignment?.selectionChancePercent ?: legacySnapshot?.chancePercent,
            recordedAt = currentAssignment?.selectionChanceAt ?: legacySnapshot?.snapshottedAt,
            recordedSource = currentAssignment?.selectionChanceSource ?: legacySnapshot?.let { "draw_opening" },
            participantId = participantId,
            roleKey = roleKey,
            displayName = targetRow.displayName,
            chancePercent = breakdown.chancePercent,
            referencePercent = breakdown.referencePercent,
            candidateCount = candidates.size,
            poolRank = breakdown.poolRank,
            aheadCount = breakdown.aheadCount,
            tiedAtChanceCount = breakdown.tiedAtChanceCount,
            adjustments = breakdown.adjustments,
            requiredCount = requiredCount,
            avatarUrl = avatarUrls[participantId],
            gender = targetGender.wireValue,
            pool =
                ChanceBreakdownPoolDto(
                    peers =
                        breakdown.peers.map { peer ->
                            peer.copy(avatarUrl = avatarUrls[peer.participantId])
                        },
                ),
            factorBreakdown = breakdown.factorBreakdown,
        )
    }

    @Transactional(readOnly = true)
    fun getPoolPreview(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        formulaId: UUID?,
        principal: SessionUserPrincipal,
    ): CompositionPoolPreviewResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val requiredCount =
            normalizedSlots[roleKey]
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        if (requiredCount <= 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        }
        val composition = compositionRepository.findById(eventId).orElse(null)
        if (CompositionVisibilityRules.hasPublishedSelection(composition) &&
            !CompositionGapFillRules.hasEmptySlotForRole(roleKey, normalizedSlots, slotRepository.findByEventId(eventId))
        ) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Aucune place vacante pour ce rôle")
        }

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val poolContext = buildRolePoolContext(event, seasonId, eventId, roleKey, formulaId)
        val drawPipeline = resolveDrawPipeline(event, formulaId)
        val candidates =
            poolContext.pool.map {
                AvailabilityChanceCalculator.Candidate(it.participantId, it.displayName, null)
            }
        val scored =
            AvailabilityChanceCalculator.scoreCandidates(
                candidates,
                requiredCount,
                poolContext.pastByParticipant,
                roleKey = roleKey,
                pipeline = drawPipeline,
                categorySlug = poolContext.categorySlug,
                playedSameRoleOnImmediatePredecessorByParticipant = poolContext.replayByParticipant,
                immediatePredecessorTitle = poolContext.replayPredecessorTitle,
                immediatePredecessorStartsAt = poolContext.replayPredecessorStartsAt,
                unfulfilledRoleRequestCountByParticipant = poolContext.unfulfilledByParticipant,
            )
        val participantIds = scored.map { it.participantId }.toSet()
        val avatarUrls = participantAvatarResolver.resolveByParticipantIds(eventId, participantIds)
        val genders = participantGenderResolver.resolveByParticipantIds(eventId, participantIds)

        return CompositionPoolPreviewResponseDto(
            roleKey = roleKey,
            requiredCount = requiredCount,
            segments =
                scored.map { row ->
                    CompositionPoolPreviewSegmentDto(
                        participantId = row.participantId,
                        displayName = row.displayName,
                        chancePercent = row.chancePercent,
                        weight = row.weight,
                        avatarUrl = avatarUrls[row.participantId],
                        gender = genders[row.participantId] ?: MemberGender.NON_SPECIFIED.wireValue,
                    )
                },
        )
    }

    private data class RolePoolContext(
        val pool: List<CompositionEligibleParticipant>,
        val pastByParticipant: Map<UUID, Int>,
        val pastUnscopedByParticipant: Map<UUID, Int>,
        val categorySlug: String,
        val replayByParticipant: Map<UUID, Boolean> = emptyMap(),
        val replayPredecessorTitle: String? = null,
        val replayPredecessorStartsAt: java.time.Instant? = null,
        val unfulfilledByParticipant: Map<UUID, Int> = emptyMap(),
    )

    private fun buildRolePoolContext(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        formulaId: UUID? = null,
    ): RolePoolContext {
        val eligible =
            CompositionParticipantPool.loadEligibleParticipants(
                seasonId,
                eventId,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )
        val availabilityIndex =
            availabilityRepository.findByEvent_Id(eventId).toAvailabilityIndex()
        val historyMode = SelectionHistoryMode.OPERATIONAL
        val historyCounts =
            selectionHistory.pastSelectionCountByParticipantAndRole(event, historyMode)
        val pastByParticipant =
            selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)
        val unscopedCounts =
            selectionHistory.pastSelectionCountUnscopedByParticipantAndRole(event, historyMode)
        val pastUnscopedByParticipant =
            selectionHistory.pastSelectionCountByParticipant(unscopedCounts, roleKey)
        val pool =
            CompositionParticipantPool.buildRolePool(
                eligible = eligible,
                availabilityIndex = availabilityIndex,
                roleKey = roleKey,
                excluded = emptySet(),
            )
        val drawPipeline = resolveDrawPipeline(event, formulaId)
        val replayInputs =
            DrawImmediateReplaySupport.replayInputsForRolePool(
                pipeline = drawPipeline,
                event = event,
                roleKey = roleKey,
                pool = pool,
                replayService = immediatePredecessorRoleReplayService,
            )
        val unfulfilledCounts =
            DrawRoleRequestSupport.unfulfilledCountsForRolePool(
                pipeline = drawPipeline,
                event = event,
                roleKey = roleKey,
                pool = pool,
                roleRequestService = unfulfilledRoleRequestService,
            )
        return RolePoolContext(
            pool = pool,
            pastByParticipant = pastByParticipant,
            pastUnscopedByParticipant = pastUnscopedByParticipant,
            categorySlug = SpectacleCategory.slug(event),
            replayByParticipant = replayInputs.byParticipant,
            replayPredecessorTitle = replayInputs.predecessorTitle,
            replayPredecessorStartsAt = replayInputs.predecessorStartsAt,
            unfulfilledByParticipant = unfulfilledCounts,
        )
    }

    private fun requireExplainabilityAccess(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (!resolveShowExplainability(event, seasonId, eventId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
    }

    private fun resolveShowExplainability(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): Boolean {
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (DisposExplainabilityAccess.canShowExplainability(event, canManage)) {
            return true
        }
        val composition = compositionRepository.findById(eventId).orElse(null)
        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val slots =
            slotRepository.findByEventId(eventId).filter { slot ->
                val count = normalizedSlots[slot.roleKey] ?: 0
                slot.slotIndex in 0 until count
            }
        return CompositionExplainabilityAccess.canShowExplainability(composition, slots, canManage)
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
