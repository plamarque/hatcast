package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.CompositionSlotDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
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
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val notificationPort: CompositionNotificationPort,
) {
    @Transactional(readOnly = true)
    fun getComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return buildResponse(event, principal)
    }

    @Transactional
    fun publishComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findById(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à publier")
            }
        if (composition.validatedAt != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Composition déjà validée")
        }

        val slots = slotRepository.findByEventId(eventId)
        val assignedCount = slots.count { it.participantId != null }
        if (assignedCount == 0) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Aucun rôle assigné à publier")
        }

        val alreadyPublished = composition.publishedAt != null
        if (!alreadyPublished) {
            val now = Instant.now()
            composition.publishedAt = now
            composition.updatedAt = now
            compositionRepository.save(composition)
            notificationPort.publishDraftCompositionShared(eventId, seasonId, principal.userId)
        }

        return buildResponse(event, principal)
    }

    private fun buildResponse(
        event: EventEntity,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val seasonId = event.season.id
        val eventId = event.id
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        val composition = compositionRepository.findById(eventId).orElse(null)
        val slots = slotRepository.findByEventId(eventId)
        val hasAssignedSlots = slots.any { it.participantId != null }
        val visibility =
            CompositionVisibilityRules.resolveVisibility(composition, canManage, hasAssignedSlots)
        val canViewSlots =
            CompositionVisibilityRules.canViewSlotAssignments(composition, canManage) &&
                hasAssignedSlots

        val slotDtos =
            if (canViewSlots) {
                val participantIds = slots.mapNotNull { it.participantId }.toSet()
                val displayNames = resolveDisplayNames(participantIds)
                slots.map { slot ->
                    CompositionSlotDto(
                        roleKey = slot.roleKey,
                        slotIndex = slot.slotIndex,
                        participantId = slot.participantId,
                        participantDisplayName =
                            slot.participantId?.let { displayNames[it] },
                        participationStatus = slot.participationStatus.name.lowercase(),
                    )
                }
            } else {
                emptyList()
            }

        return CompositionResponseDto(
            publishedAt = composition?.publishedAt,
            validatedAt = composition?.validatedAt,
            visibility = visibility.toApiValue(),
            slots = slotDtos,
        )
    }

    private fun resolveDisplayNames(participantIds: Set<UUID>): Map<UUID, String> {
        if (participantIds.isEmpty()) {
            return emptyMap()
        }
        return seasonParticipantRepository
            .findAllById(participantIds)
            .associate { it.id to it.displayName }
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
