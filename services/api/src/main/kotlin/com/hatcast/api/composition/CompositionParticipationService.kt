package com.hatcast.api.composition

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.UpdateSlotParticipationRequestDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.notification.ProxyParticipationRecordedEvent
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.user.UserEntity
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class CompositionParticipationService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val troupeAccess: TroupeAccessService,
    private val organizerAccess: OrganizerAccessRules,
    private val compositionService: CompositionService,
    private val auditRecorder: AuditEventRecorder,
    private val lifecycleAuditRecorder: CompositionLifecycleAuditRecorder,
    private val eventPublisher: ApplicationEventPublisher,
    private val guestInvitationAccess: GuestInvitationAccessService,
) {
    @Transactional
    fun updateParticipation(
        seasonId: UUID,
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        body: UpdateSlotParticipationRequestDto,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val normalizedStatus = body.status.trim().lowercase()
        val participationStatus =
            when (normalizedStatus) {
                "confirmed" -> SlotParticipationStatus.CONFIRMED
                "pending" -> SlotParticipationStatus.PENDING
                "declined" -> SlotParticipationStatus.DECLINED
                else ->
                    throw ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Statut de participation invalide",
                    )
            }

        val note =
            when (participationStatus) {
                SlotParticipationStatus.DECLINED ->
                    body.note?.trim()?.takeIf { it.isNotEmpty() }
                else -> null
            }
        if (note != null && note.length > 500) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La note ne peut pas dépasser 500 caractères",
            )
        }

        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val requiredCount = normalizedSlots[roleKey]
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu pour cet événement")
        if (slotIndex !in 0 until requiredCount) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Index de slot invalide")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition")
            }
        val canManageComposition = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (composition.validatedAt == null && !canManageComposition) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Les confirmations ne sont pas encore ouvertes",
            )
        }

        val slotEntity =
            slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Slot introuvable")
        val assigneeId =
            slotEntity.assignedParticipantId()
                ?: throw ResponseStatusException(HttpStatus.CONFLICT, "Slot sans assignation")

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val viewerIds =
            CompositionLinkedParticipantResolver.resolveViewerParticipantIds(
                season = event.season,
                eventId = eventId,
                userId = principal.userId,
                seasonParticipantRepository = seasonParticipantRepository,
                eventParticipantRepository = eventParticipantRepository,
            )
        if (assigneeId !in viewerIds && !canManageComposition) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val now = Instant.now()
        val beforeStatus = slotEntity.participationStatus
        val beforeLifecycle = lifecycleAuditRecorder.captureRawLifecycle(eventId, event.roleSlots)
        val subjectSeasonParticipantId = slotEntity.seasonParticipantId
        val subjectEventParticipantId = slotEntity.eventParticipantId
        val assigneeUserId =
            resolveLinkedUserId(
                seasonParticipantId = subjectSeasonParticipantId,
                eventParticipantId = subjectEventParticipantId,
            )
        when (participationStatus) {
            SlotParticipationStatus.CONFIRMED -> {
                slotEntity.participationStatus = SlotParticipationStatus.CONFIRMED
            }
            SlotParticipationStatus.PENDING -> {
                slotEntity.participationStatus = SlotParticipationStatus.PENDING
            }
            SlotParticipationStatus.DECLINED -> {
                declineRepository.save(
                    EventCompositionDeclineEntity(
                        eventId = eventId,
                        roleKey = roleKey,
                        slotIndex = slotIndex,
                        seasonParticipantId = slotEntity.seasonParticipantId,
                        eventParticipantId = slotEntity.eventParticipantId,
                        declinedByUserId = principal.userId,
                        declinedAt = now,
                        note = note,
                        createdAt = now,
                    ),
                )
                slotEntity.clearAssignee()
                slotEntity.participationStatus = SlotParticipationStatus.PENDING
            }
        }
        slotEntity.updatedAt = now
        slotRepository.save(slotEntity)
        composition.updatedAt = now
        compositionRepository.save(composition)

        val actionType =
            when (participationStatus) {
                SlotParticipationStatus.CONFIRMED -> AuditActionType.PARTICIPATION_CONFIRMED
                SlotParticipationStatus.PENDING -> AuditActionType.PARTICIPATION_RESET
                SlotParticipationStatus.DECLINED -> AuditActionType.PARTICIPATION_DECLINED
            }
        auditRecorder.record(
            AuditRecordRequest(
                actionType = actionType,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = subjectSeasonParticipantId,
                subjectEventParticipantId = subjectEventParticipantId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before =
                    AuditSnapshots.participationStatus(beforeStatus) +
                        mapOf("roleKey" to roleKey, "slotIndex" to slotIndex),
                after =
                    AuditSnapshots.participationStatus(participationStatus) +
                        mapOf("roleKey" to roleKey, "slotIndex" to slotIndex),
                metadata = mapOf("assigneeParticipantId" to assigneeId.toString()),
            ),
        )
        val lifecycleTransitionContext =
            when {
                composition.validatedAt != null && participationStatus == SlotParticipationStatus.DECLINED -> {
                    val assigneeDisplayName =
                        resolveAssigneeDisplayName(subjectSeasonParticipantId, subjectEventParticipantId)
                    CompositionLifecycleTransitionContext(
                        reasonSummary = withdrawalReasonSummary(beforeStatus, assigneeDisplayName),
                    )
                }
                composition.validatedAt != null &&
                    participationStatus == SlotParticipationStatus.PENDING &&
                    beforeStatus == SlotParticipationStatus.CONFIRMED ->
                    CompositionLifecycleTransitionContext(reasonSummary = "confirmation à renouveler")
                else -> null
            }
        lifecycleAuditRecorder.recordIfChanged(event, seasonId, beforeLifecycle, lifecycleTransitionContext)

        if (composition.validatedAt != null &&
            assigneeUserId != null &&
            assigneeUserId != principal.userId &&
            beforeStatus != participationStatus
        ) {
            eventPublisher.publishEvent(
                ProxyParticipationRecordedEvent(
                    eventId = eventId,
                    seasonId = seasonId,
                    troupeId = event.season.troupe.id,
                    actorUserId = principal.userId,
                    subjectUserId = assigneeUserId,
                    roleKey = roleKey,
                    participationStatus = participationStatus,
                    beforeParticipationStatus = beforeStatus,
                ),
            )
        }

        return compositionService.getCompositionStateAfterMutation(seasonId, eventId, principal)
    }

    private fun resolveAssigneeDisplayName(
        seasonParticipantId: UUID?,
        eventParticipantId: UUID?,
    ): String {
        seasonParticipantId?.let { id ->
            seasonParticipantRepository.findById(id).orElse(null)?.let { participant ->
                return participant.displayName
            }
        }
        eventParticipantId?.let { id ->
            eventParticipantRepository.findById(id).orElse(null)?.let { participant ->
                return participant.displayName
            }
        }
        return "Un·e participant·e"
    }

    private fun resolveLinkedUserId(
        seasonParticipantId: UUID?,
        eventParticipantId: UUID?,
    ): UUID? {
        seasonParticipantId?.let { id ->
            seasonParticipantRepository.findById(id).orElse(null)?.let { participant ->
                linkedUserId(participant.user, participant.troupeMembership)?.let { return it }
            }
        }
        eventParticipantId?.let { id ->
            eventParticipantRepository.findById(id).orElse(null)?.let { participant ->
                participant.user?.id?.let { return it }
                participant.seasonParticipant?.let { seasonParticipant ->
                    linkedUserId(seasonParticipant.user, seasonParticipant.troupeMembership)?.let { return it }
                }
            }
        }
        return null
    }

    private fun linkedUserId(
        user: UserEntity?,
        membership: TroupeMembershipEntity?,
    ): UUID? = user?.id ?: membership?.user?.id

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

    private fun withdrawalReasonSummary(
        beforeStatus: SlotParticipationStatus,
        displayName: String,
    ): String =
        when (beforeStatus) {
            SlotParticipationStatus.PENDING -> "déclinaison de $displayName"
            SlotParticipationStatus.CONFIRMED -> "désistement de $displayName"
            SlotParticipationStatus.DECLINED -> "retrait de $displayName"
        }
}
