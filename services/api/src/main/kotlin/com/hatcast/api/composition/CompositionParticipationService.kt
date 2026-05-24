package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.UpdateSlotParticipationRequestDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.organizer.OrganizerAccessRules
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
        if (composition.validatedAt == null) {
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

        val viewerIds =
            CompositionLinkedParticipantResolver.resolveViewerParticipantIds(
                season = event.season,
                eventId = eventId,
                userId = principal.userId,
                seasonParticipantRepository = seasonParticipantRepository,
                eventParticipantRepository = eventParticipantRepository,
                seasonParticipantService = seasonParticipantService,
            )
        if (assigneeId !in viewerIds &&
            !organizerAccess.canManageComposition(eventId, seasonId, principal)
        ) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val now = Instant.now()
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

        return compositionService.getComposition(seasonId, eventId, principal)
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
