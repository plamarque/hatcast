package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityChanceCalculator
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
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.ParticipantAvatarResolver
import com.hatcast.api.user.ParticipantGenderResolver
import org.springframework.beans.factory.ObjectProvider
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

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
    private val selectionHistory: CompositionSelectionHistoryService,
    private val organizerAccess: OrganizerAccessRules,
    private val guestInvitationAccess: GuestInvitationAccessService,
    private val drawChanceSnapshots: CompositionDrawChanceSnapshotService,
    private val participantAvatarResolver: ParticipantAvatarResolver,
    private val participantGenderResolver: ParticipantGenderResolver,
    private val immediatePredecessorRoleReplayService: ImmediatePredecessorRoleReplayService,
    private val drawWeightPipelineProvider: ObjectProvider<DrawWeightPipeline>,
) {
    private val drawWeightPipeline: DrawWeightPipeline
        get() = drawWeightPipelineProvider.getIfAvailable() ?: DrawWeightPipelines.DEFAULT
    @Transactional(readOnly = true)
    fun getChanceBreakdown(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        participantId: UUID,
        principal: SessionUserPrincipal,
    ): ChanceBreakdownDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireExplainabilityAccess(event, seasonId, eventId, principal)

        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val requiredCount =
            normalizedSlots[roleKey]
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        if (requiredCount <= 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        }

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val poolContext = buildRolePoolContext(event, seasonId, eventId, roleKey)
        val targetRow =
            poolContext.pool.find { it.participantId == participantId }
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant non éligible pour ce rôle")

        val historyMode = SelectionHistoryModeResolver.forEvent(event)
        val snapshot =
            if (historyMode == SelectionHistoryMode.RETROSPECTIVE) {
                drawChanceSnapshots
                    .findByEventId(eventId)
                    .firstOrNull { it.id.roleKey == roleKey && it.id.participantId == participantId }
            } else {
                null
            }
        val overrideChancePercent = snapshot?.chancePercent

        val candidates =
            poolContext.pool.map {
                AvailabilityChanceCalculator.Candidate(it.participantId, it.displayName, null)
            }
        val targetGender =
            MemberGender.fromWireOrNull(
                participantGenderResolver
                    .resolveByParticipantIds(eventId, setOf(participantId))[participantId],
            ) ?: MemberGender.NON_SPECIFIED
        val breakdown =
            ChanceBreakdownCalculator.calculate(
                candidates = candidates,
                requiredCount = requiredCount,
                pastSelectionCountByParticipant = poolContext.pastByParticipant,
                targetParticipantId = participantId,
                roleKey = roleKey,
                pipeline = drawWeightPipeline,
                overrideChancePercent = overrideChancePercent,
                targetParticipantGender = targetGender,
                categorySlug = poolContext.categorySlug,
                pastSelectionCountUnscopedByParticipant = poolContext.pastUnscopedByParticipant,
                playedSameRoleOnImmediatePredecessorByParticipant = poolContext.replayByParticipant,
                immediatePredecessorTitle = poolContext.replayPredecessorTitle,
                immediatePredecessorStartsAt = poolContext.replayPredecessorStartsAt,
            )
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Breakdown indisponible")

        val avatarUrls =
            participantAvatarResolver.resolveByParticipantIds(
                eventId,
                poolContext.pool.map { it.participantId }.toSet(),
            )

        return ChanceBreakdownDto(
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

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val poolContext = buildRolePoolContext(event, seasonId, eventId, roleKey)
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
                pipeline = drawWeightPipeline,
                categorySlug = poolContext.categorySlug,
                playedSameRoleOnImmediatePredecessorByParticipant = poolContext.replayByParticipant,
                immediatePredecessorTitle = poolContext.replayPredecessorTitle,
                immediatePredecessorStartsAt = poolContext.replayPredecessorStartsAt,
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
    )

    private fun buildRolePoolContext(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
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
        val historyMode = SelectionHistoryModeResolver.forEvent(event)
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
        val replayInputs =
            DrawImmediateReplaySupport.replayInputsForRolePool(
                pipeline = drawWeightPipeline,
                event = event,
                roleKey = roleKey,
                pool = pool,
                replayService = immediatePredecessorRoleReplayService,
            )
        return RolePoolContext(
            pool = pool,
            pastByParticipant = pastByParticipant,
            pastUnscopedByParticipant = pastUnscopedByParticipant,
            categorySlug = SpectacleCategory.slug(event),
            replayByParticipant = replayInputs.byParticipant,
            replayPredecessorTitle = replayInputs.predecessorTitle,
            replayPredecessorStartsAt = replayInputs.predecessorStartsAt,
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
